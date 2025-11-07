const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const axios = require('axios');
const dotenv = require('dotenv');
const winston = require('winston');
const ChatbotMsg = require('../Models/ChatbotMsg');

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_CHATBOT_API_KEY);
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

const axiosInstance = axios.create({
  timeout: 5000,
  headers: {
    'User-Agent': 'WitWizHub/1.0 (arshi@example.com)',
  },
});

const cache = {
  time: new Map(),
  weather: new Map(),
  location: new Map(),
};
const CACHE_TTL_MS = 5 * 60 * 1000;

const locationMapping = {
  'india': { lat: 28.6139, lon: 77.2090 },
  'delhi': { lat: 28.6139, lon: 77.2090 },
  'hamirpur': { lat: 31.6866, lon: 76.5218 },
  'hamirpur himachal pradesh': { lat: 31.6866, lon: 76.5218 },
  'united states': {
    lat: 40.7128,
    lon: -74.0060,
    clarification: 'The United States has multiple time zones. Showing time for New York (EST). Please specify a city or state for more accuracy.',
  },
  'united kingdom': { lat: 51.5074, lon: -0.1278 },
  'australia': {
    lat: -33.8688,
    lon: 151.2093,
    clarification: 'Australia has multiple time zones. Using Sydney by default. Please specify a city for accuracy.',
  },
  'tokyo': { lat: 35.6895, lon: 139.6917 },
};

const weatherConditions = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

async function getLocationInfo(region) {
  if (!region) return null;

  const normalized = region.toLowerCase().trim();

  const cached = cache.location.get(normalized);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    logger.info('Cache hit for location', { region: normalized });
    return cached.data;
  }

  if (locationMapping[normalized]) {
    const result = { ...locationMapping[normalized], normalizedRegion: normalized, displayName: normalized };
    cache.location.set(normalized, { timestamp: Date.now(), data: result });
    logger.info('Location from mapping', { region: normalized });
    return result;
  }

  try {
    const res = await axiosInstance.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(region)}&format=json&limit=1`
    );
    if (res.data && res.data.length > 0) {
      const place = res.data[0];
      const result = {
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        normalizedRegion: normalized,
        displayName: place.display_name,
      };
      cache.location.set(normalized, { timestamp: Date.now(), data: result });
      logger.info('Location fetched from Nominatim', { region: normalized, displayName: place.display_name });
      return result;
    }
  } catch (error) {
    logger.error('Nominatim geocoding error', { error: error.message, region });
  }

  return null;
}

async function retryAxiosGet(url, retries = 2, delay = 500) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await axiosInstance.get(url);
    } catch (error) {
      if (i === retries) throw error;
      logger.warn('Retrying API request', { url, attempt: i + 1, error: error.message });
      await new Promise((res) => setTimeout(res, delay * 2 ** i));
    }
  }
}

async function getCurrentTime(region) {
  if (!region) {
    return {
      response: 'I need a valid region or country to check the time.',
      clarification: 'Please provide a specific region or country (e.g., Delhi or India).',
    };
  }

  const normalized = region.toLowerCase().trim();

  const cached = cache.time.get(normalized);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    logger.info('Cache hit for time', { region: normalized });
    return cached.data;
  }

  const location = await getLocationInfo(normalized);
  if (!location || !location.lat || !location.lon) {
    logger.error('No coordinates found for region', { region: normalized });
    return {
      response: `Unable to fetch time for ${region}. The location may be invalid.`,
      clarification: 'Please try a different region or city (e.g., Delhi or India).',
    };
  }

  try {
    const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${process.env.TIMEZONEDB_KEY}&format=json&by=position&lat=${location.lat}&lng=${location.lon}`;
    const response = await retryAxiosGet(url);
    const data = response.data;
    if (data.status !== 'OK' || !data.formatted) {
      logger.error('TimezoneDB error', { error: 'Invalid response', region, lat: location.lat, lon: location.lon, response: data });
      return {
        response: `Unable to fetch time for ${region}. The location may be invalid.`,
        clarification: 'Please try a different region or city (e.g., Delhi or India).',
      };
    }

    const regionName = location.displayName || (normalized === 'india' ? 'India' : normalized);
    const result = { response: `The current time in ${regionName} (${data.zoneName}) is ${data.formatted} (${data.abbreviation}).`, clarification: location?.clarification || null };

    cache.time.set(normalized, { timestamp: Date.now(), data: result });
    logger.info('Time fetched successfully', { region, zoneName: data.zoneName, formatted: data.formatted });
    return result;
  } catch (error) {
    logger.error('TimezoneDB error', { error: error.message, status: error.response?.status, region, lat: location.lat, lon: location.lon, response: error.response?.data });
    if (error.response?.status === 401) {
      return { response: 'Invalid TimezoneDB API key. Please contact the administrator.' };
    }
    if (error.response?.status === 429) {
      return { response: 'TimezoneDB API rate limit exceeded. Please try again later.' };
    }
    return {
      response: `Unable to fetch time for ${region}. Please try again.`,
      clarification: 'Please try a different region or check your internet connection.',
    };
  }
}

async function getCurrentWeather(region) {
  if (!region) {
    return {
      response: 'I need a valid region or city to check the weather.',
      clarification: 'Please provide a specific region or city (e.g., Delhi etc.).',
    };
  }

  const normalized = region.toLowerCase().trim();

  const cached = cache.weather.get(normalized);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    logger.info('Cache hit for weather', { region: normalized });
    return cached.data;
  }

  const location = await getLocationInfo(normalized);
  if (!location || !location.lat || !location.lon) {
    return {
      response: 'I could not find the specified city or region. Please try with a different name.',
      clarification: 'Please provide a valid region or city (e.g., Delhi etc.).',
    };
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true`;
    const response = await retryAxiosGet(url);
    const data = response.data.current_weather;

    if (!data) {
      throw new Error('No weather data returned');
    }

    const condition = weatherConditions[data.weathercode] || 'Unknown conditions';
    const regionName = location.displayName || (normalized === 'india' ? 'India' : normalized);

    const result = {
      response: `The current weather in ${regionName} is ${data.temperature}°C, ${condition}, with wind speed ${data.windspeed} km/h.`,
      clarification: null,
    };

    cache.weather.set(normalized, { timestamp: Date.now(), data: result });
    logger.info('Weather fetched successfully', { region, latitude: location.lat, longitude: location.lon });
    return result;
  } catch (error) {
    logger.error('Open-Meteo API error', { error: error.message, region });
    return { response: 'Unable to fetch current weather. Please try again.' };
  }
}

async function searchYouTube(searchTopic) {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: `${searchTopic} tutorial`,
      maxResults: 1,
      type: 'video',
      order: 'relevance',
    });
    const items = response.data.items;
    if (items && items.length > 0) {
      return `https://www.youtube.com/watch?v=${items[0].id.videoId}`;
    }
    return `No video found. Try searching YouTube for "${searchTopic}".`;
  } catch (error) {
    logger.error('YouTube API error', { error: error.message, searchTopic });
    return `No video found. Try searching YouTube for "${searchTopic}".`;
  }
}

async function askGemini(question) {
  const prompt = `
  Given this question: "${question}", respond as follows:
  1. If it's a greeting (e.g., "Hello", "Good morning"), return a friendly greeting.
  2. If it asks for a joke, generate a short, funny joke.
  3. If it requests a song, create a short original song (4-6 lines) based on the topic or mood specified.
  4. If it requests a story, generate a short story (100-150 words) based on the specified theme or type.
  5. If it explicitly asks for a YouTube link or video (e.g., "Give me a YouTube link for X"), set "youtube" to "yes" and provide the search topic.
  6. For time-related questions (e.g., "What time is it in Delhi?" or "What time is it in India?"), set "time" to "yes" and extract the region or country (e.g., "Delhi", "India") from the question. Normalize the region to lowercase (e.g., "india"). If no region is provided (e.g., "What time is it?"), set "clarification" to ask for a location. If the region has multiple time zones (e.g., "United States"), include a clarification message.
  7. For weather-related questions (e.g., "What’s the weather like in Paris?"), set "weather" to "yes" and extract the region. If no region is provided, set "clarification" to ask for a location.
  8. For other questions, determine if it's simple, moderate, or complex:
     - Simple: Answer directly (e.g., basic facts) with context if available. If context is needed, return a clarification question.
     - Moderate/Complex: Provide a short summary (50-100 words) and set "video" to "yes" with a search topic. For math questions, set "video" to "yes" and provide a math-specific search topic (e.g., "math tutorial for [query]").
  Respond in JSON:
  {
    "type": "greeting/joke/song/story/youtube/time/weather/simple/moderate/complex/clarification",
    "response": "...",
    "video": "yes/no",
    "searchTopic": "..." (if video=yes or youtube request),
    "clarification": "..." (if type=clarification or region has multiple time zones),
    "lookupRegion": "..." (for time or weather lookups, normalized to lowercase, e.g., "delhi", "india")
  }
  Ensure "lookupRegion" is always normalized to lowercase (e.g., "india" for "India" or "INDIA").
  `;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Updated model name here
    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(text);
      logger.info('Gemini response', { question, response: parsed });
      return parsed;
    } catch (jsonError) {
      logger.error('JSON parse error in Gemini response', { error: jsonError.message, raw: text });
      return {
        type: 'error',
        response: 'Sorry, I encountered an error parsing the response. Please try again.',
        video: 'no',
        searchTopic: null,
        clarification: null,
        lookupRegion: null,
      };
    }
  } catch (error) {
    logger.error('Gemini API error', { error: error.message, question });
    return {
      type: 'error',
      response: 'Sorry, I encountered an error. Please try again.',
      video: 'no',
      searchTopic: null,
      clarification: null,
      lookupRegion: null,
    };
  }
}

async function generateChatbotResponse(question, userId, chatId, title, saveHistory = true) {
  try {
    // Save user message
    const userMessage = new ChatbotMsg({
      userId,
      chatId,
      title,
      sender: 'user',
      text: question,
      timestamp: new Date(),
    });

    if (saveHistory) {
      await userMessage.save();
      logger.info('User message saved', { userId, chatId, messageId: userMessage._id });
    }

    const geminiResponse = await askGemini(question);
    let response = {
      type: geminiResponse.type,
      response: geminiResponse.response,
    };

    if (geminiResponse.type === 'time') {
      const region = geminiResponse.lookupRegion || null;
      if (!region) {
        response.type = 'clarification';
        response.response = 'I need a region or country to check the time.';
        response.clarification = 'Please provide a specific region or country (e.g., Delhi or India).';
      } else {
        const timeData = await getCurrentTime(region);
        response.type = 'time';
        response.response = timeData.response;
        response.clarification = timeData.clarification;
      }
    } else if (geminiResponse.type === 'weather') {
      const region = geminiResponse.lookupRegion || null;
      if (!region) {
        response.type = 'clarification';
        response.response = 'I need a region or city to check the weather.';
        response.clarification = 'Please provide a specific region or city (e.g., Delhi ).';
      } else {
        const weatherData = await getCurrentWeather(region);
        response.type = 'weather';
        response.response = weatherData.response;
        response.clarification = weatherData.clarification;
      }
    } else if (geminiResponse.type === 'clarification') {
      response.clarification = geminiResponse.clarification;
    }

    if (geminiResponse.video === 'yes' || geminiResponse.type === 'youtube') {
      const searchTopic = geminiResponse.searchTopic || question;
      response.videoLink = await searchYouTube(searchTopic);
    }

    // Save bot response
    const botMessage = new ChatbotMsg({
      userId,
      chatId,
      title,
      sender: 'bot',
      text: response.response,
      videoLink: response.videoLink,
      clarification: response.clarification,
      responseType: response.type,
      timestamp: new Date(),
    });

    if (saveHistory) {
      await botMessage.save();
      logger.info('Bot message saved', { userId, chatId, messageId: botMessage._id });
    }

    return {
      _id: botMessage._id,
      userMessageId: userMessage._id, // Return user message ID
      response: response.response,
      videoLink: response.videoLink,
      clarification: response.clarification,
      type: response.type,
      error: false,
    };
  } catch (error) {
    logger.error('Chatbot response error', { error: error.message, question });
    return {
      _id: null,
      userMessageId: null,
      response: 'Sorry, I encountered an error. Please try again.',
      clarification: 'Please try rephrasing your question or check your internet connection.',
      type: 'error',
      error: true,
    };
  }
}

module.exports = { generateChatbotResponse };