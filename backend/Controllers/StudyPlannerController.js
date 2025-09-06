const StudyPlan = require('../Models/StudyPlan');
const StudyPlanSubject = require('../Models/StudyPlanSubject');
const Subject = require('../Models/Note');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const winston = require('winston');

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

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/study-planner/google/callback'
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

const googleAuth = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: req.headers.authorization?.split(' ')[1],
  });
  logger.info('Generated OAuth URL:', url);
  res.json({ url });
};

const googleCallback = async (req, res) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    const token = req.query.state;
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('../Models/User');
    await User.updateOne(
      { _id: decoded._id },
      { googleAccessToken: tokens.access_token, googleRefreshToken: tokens.refresh_token }
    );
    logger.info(`Google auth completed for user: ${decoded._id}`);
    logger.info('Stored tokens:', { access_token: tokens.access_token, refresh_token: tokens.refresh_token });
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/study-planner');
  } catch (err) {
    logger.error('Google auth callback error:', err);
    res.status(400).json({ message: 'Google auth error', error: err.message });
  }
};

const createStudyPlan = async (req, res) => {
  try {
    const { fieldOfStudy, subjects } = req.body;
    const userId = req.user?.userId;
    logger.info('Creating study plan for user:', { userId });

    if (!userId) {
      throw new Error('User ID is undefined');
    }

    const processedSubjects = await Promise.all(subjects.map(async subject => {
      const deadline = new Date(subject.deadline);
      const now = new Date();
      const daysAvailable = Math.max(1, Math.floor((deadline - now) / (1000 * 60 * 60 * 24)));
      const topicsCount = subject.topics.length;
      const daysPerTopic = Math.floor(daysAvailable / topicsCount);
      let currentDate = new Date(now);

      const user = await require('../Models/User').findById(req.user._id);
      const topicsWithTimes = await Promise.all(subject.topics.map(async (topic, index) => {
        const startTime = new Date(currentDate);
        const endTime = new Date(currentDate);
        endTime.setDate(endTime.getDate() + daysPerTopic);
        if (index === topicsCount - 1) {
          endTime.setTime(deadline.getTime());
        }
        currentDate = new Date(endTime);
        currentDate.setDate(currentDate.getDate() + 1);
        let googleEventId = null;
        if (user.googleAccessToken) {
          oauth2Client.setCredentials({ access_token: user.googleAccessToken, refresh_token: user.googleRefreshToken });
          const event = await calendar.events.insert({
            calendarId: 'primary',
            resource: {
              summary: `Study: ${subject.name} - ${topic.name}`,
              start: { dateTime: startTime.toISOString() },
              end: { dateTime: endTime.toISOString() },
              reminders: {
                useDefault: false,
                overrides: [{ method: 'popup', minutes: 3 * 24 * 60 }],
              },
            },
          });
          googleEventId = event.data.id;
          logger.info(`Created Google Calendar event: ${googleEventId} for topic: ${topic.name}`);
        }
        return { name: topic.name, startTime, endTime, completed: false, googleEventId };
      }));

      const noteSubject = new Subject({ name: subject.name, userId, notes: [] });
      await noteSubject.save();

      const studySubject = new StudyPlanSubject({
        userId,
        name: subject.name,
        deadline,
        topics: topicsWithTimes,
      });
      return await studySubject.save();
    }));

    const plan = new StudyPlan({
      userId,
      fieldOfStudy,
      subjects: processedSubjects.map(s => s._id),
      progress: 0,
    });
    await plan.save();

    const populatedPlan = await StudyPlan.findById(plan._id).populate('subjects');
    logger.info(`Study plan created: ${plan._id}`);
    res.status(201).json(populatedPlan);
  } catch (err) {
    logger.error('Create study plan error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getStudyPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user.userId }).populate('subjects');
    const updatedPlans = await Promise.all(plans.map(async (plan) => {
      const subjects = await StudyPlanSubject.find({ _id: { $in: plan.subjects } });
      const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
      const completedTopics = subjects.reduce(
        (sum, subject) => sum + subject.topics.filter(topic => topic.completed).length,
        0
      );
      const progress = totalTopics ? (completedTopics / totalTopics) * 100 : 0;
      if (plan.progress !== progress) {
        plan.progress = progress;
        await plan.save();
      }
      return { ...plan._doc, progress };
    }));
    res.status(200).json(updatedPlans);
  } catch (err) {
    logger.error('Get study plans error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.planId, userId: req.user.userId }).populate('subjects');
    if (!plan) return res.status(404).json({ message: 'Plan not found or not authorized' });
    res.status(200).json(plan);
  } catch (err) {
    logger.error('Get study plan error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndUpdate(
      { _id: req.params.planId, userId: req.user.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('subjects');
    if (!plan) return res.status(404).json({ message: 'Plan not found or not authorized' });
    logger.info(`Study plan updated: ${req.params.planId}`);
    res.status(200).json(plan);
  } catch (err) {
    logger.error('Update study plan error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const patchStudyPlan = async (req, res) => {
  try {
    const { subjects, progress } = req.body;
    const plan = await StudyPlan.findOne({ _id: req.params.planId, userId: req.user.userId });
    if (!plan) return res.status(404).json({ message: 'Plan not found or not authorized' });

    let updatedTopicsCount = 0;
    let totalTopicsCount = 0;

    if (subjects) {
      await Promise.all(subjects.map(async (subject) => {
        const studySubject = await StudyPlanSubject.findOne({ _id: subject._id, userId: req.user.userId });
        if (!studySubject) {
          throw new Error(`Subject ${subject._id} not found or not authorized`);
        }
        if (subject.topics) {
          subject.topics.forEach((topic) => {
            const existingTopic = studySubject.topics.id(topic._id);
            if (!existingTopic) {
              throw new Error(`Topic ${topic._id} not found`);
            }
            if (topic.completed !== undefined) {
              existingTopic.completed = topic.completed;
              updatedTopicsCount += topic.completed ? 1 : 0;
            }
          });
          totalTopicsCount += studySubject.topics.length;
          studySubject.updatedAt = new Date();
          await studySubject.save();
        }
      }));
    }

    const updatedSubjects = await StudyPlanSubject.find({ _id: { $in: plan.subjects } });
    const totalTopics = updatedSubjects.reduce((sum, subject) => sum + subject.topics.length, 0);
    const completedTopics = updatedSubjects.reduce(
      (sum, subject) => sum + subject.topics.filter(topic => topic.completed).length,
      0
    );
    const calculatedProgress = totalTopics ? (completedTopics / totalTopics) * 100 : 0;

    if (progress !== undefined && Math.abs(progress - calculatedProgress) > 0.01) {
      throw new Error(`Provided progress (${progress}) does not match calculated progress (${calculatedProgress})`);
    }

    plan.progress = calculatedProgress;
    plan.updatedAt = new Date();

    if (calculatedProgress === 100) {
      const user = await require('../Models/User').findById(req.user._id);
      if (user.googleAccessToken) {
        oauth2Client.setCredentials({ access_token: user.googleAccessToken, refresh_token: user.googleRefreshToken });
        const deletePromises = [];
        for (const subject of updatedSubjects) {
          for (const topic of subject.topics) {
            if (topic.googleEventId) {
              deletePromises.push(
                calendar.events.delete({
                  calendarId: 'primary',
                  eventId: topic.googleEventId,
                }).then(() => {
                  logger.info(`Deleted Google Calendar event: ${topic.googleEventId}`);
                  topic.googleEventId = null;
                }).catch(error => {
                  logger.error(`Failed to delete Google Calendar event: ${topic.googleEventId}`, error);
                })
              );
            }
          }
        }
        await Promise.allSettled(deletePromises);
        await Promise.all(updatedSubjects.map(subject => subject.save()));
      }
    }

    await plan.save();
    const updatedPlan = await StudyPlan.findById(req.params.planId).populate('subjects');
    logger.info(`Study plan patched: ${req.params.planId}, progress: ${plan.progress}`);
    res.status(200).json(updatedPlan);
  } catch (err) {
    logger.error('Patch study plan error:', err);
    res.status(400).json({ message: 'Bad Request', error: err.message });
  }
};

const deleteStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.planId, userId: req.user.userId });
    if (!plan) return res.status(404).json({ message: 'Plan not found or not authorized' });

    const user = await require('../Models/User').findById(req.user._id);
    if (user.googleAccessToken) {
      oauth2Client.setCredentials({ access_token: user.googleAccessToken, refresh_token: user.googleRefreshToken });
      const subjects = await StudyPlanSubject.find({ _id: { $in: plan.subjects } });
      const deletePromises = [];
      for (const subject of subjects) {
        for (const topic of subject.topics) {
          if (topic.googleEventId) {
            deletePromises.push(
              calendar.events.delete({
                calendarId: 'primary',
                eventId: topic.googleEventId,
              }).then(() => {
                logger.info(`Deleted Google Calendar event: ${topic.googleEventId}`);
              }).catch(error => {
                logger.error(`Failed to delete Google Calendar event: ${topic.googleEventId}`, error);
              })
            );
          }
        }
      }
      await Promise.allSettled(deletePromises);
    }

    await StudyPlanSubject.deleteMany({ _id: { $in: plan.subjects } });
    await Subject.deleteMany({ _id: { $in: plan.subjects }, userId: req.user.userId });
    await StudyPlan.deleteOne({ _id: req.params.planId });
    logger.info(`Study plan deleted: ${req.params.planId}`);
    res.status(200).json({ message: 'Study plan deleted successfully' });
  } catch (err) {
    logger.error('Delete study plan error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const addTopic = async (req, res) => {
  try {
    const subject = await StudyPlanSubject.findOne({ _id: req.params.subjectId, userId: req.user.userId });
    if (!subject) return res.status(404).json({ message: 'Subject not found or not authorized' });

    const now = new Date();
    const deadline = new Date(subject.deadline);
    const daysAvailable = Math.max(1, Math.floor((deadline - now) / (1000 * 60 * 60 * 24)));
    const topicsCount = subject.topics.length + 1;
    const daysPerTopic = Math.floor(daysAvailable / topicsCount);

    const newTopic = {
      name: req.body.name,
      completed: false,
      startTime: now,
      endTime: new Date(now.getTime() + daysPerTopic * 24 * 60 * 60 * 1000),
    };

    const user = await require('../Models/User').findById(req.user._id);
    if (user.googleAccessToken) {
      oauth2Client.setCredentials({ access_token: user.googleAccessToken, refresh_token: user.googleRefreshToken });
      const event = await calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary: `Study: ${subject.name} - ${newTopic.name}`,
          start: { dateTime: newTopic.startTime.toISOString() },
          end: { dateTime: newTopic.endTime.toISOString() },
          reminders: {
            useDefault: false,
            overrides: [{ method: 'popup', minutes: 3 * 24 * 60 }],
          },
        },
      });
      newTopic.googleEventId = event.data.id;
      logger.info(`Created Google Calendar event: ${newTopic.googleEventId} for topic: ${newTopic.name}`);
    }

    subject.topics.push(newTopic);
    subject.topics = subject.topics.map((topic, index) => {
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + index * daysPerTopic);
      const endTime = new Date(startTime);
      endTime.setDate(endTime.getDate() + daysPerTopic);
      if (index === subject.topics.length - 1) {
        endTime.setTime(deadline.getTime());
      }
      return { ...topic, startTime, endTime };
    });
    subject.updatedAt = new Date();
    await subject.save();

    const plan = await StudyPlan.findOne({ subjects: req.params.subjectId });
    if (plan) {
      const subjects = await StudyPlanSubject.find({ _id: { $in: plan.subjects } });
      const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
      const completedTopics = subjects.reduce(
        (sum, subject) => sum + subject.topics.filter(topic => topic.completed).length,
        0
      );
      plan.progress = totalTopics ? (completedTopics / totalTopics) * 100 : 0;
      await plan.save();
    }

    logger.info(`Topic added to subject: ${req.params.subjectId}`);
    res.status(201).json(subject);
  } catch (err) {
    logger.error('Add topic error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateTopic = async (req, res) => {
  try {
    const subject = await StudyPlanSubject.findOne({ _id: req.params.subjectId, userId: req.user.userId });
    if (!subject) return res.status(404).json({ message: 'Subject not found or not authorized' });
    const topic = subject.topics.id(req.params.topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    if (req.body.name) topic.name = req.body.name;
    if (req.body.completed !== undefined) {
      topic.completed = req.body.completed;
      if (topic.completed && topic.googleEventId) {
        const user = await require('../Models/User').findById(req.user._id);
        if (user.googleAccessToken) {
          oauth2Client.setCredentials({ access_token: user.googleAccessToken, refresh_token: user.googleRefreshToken });
          try {
            await calendar.events.delete({
              calendarId: 'primary',
              eventId: topic.googleEventId,
            });
            logger.info(`Deleted Google Calendar event: ${topic.googleEventId} for completed topic`);
            topic.googleEventId = null;
          } catch (error) {
            logger.error(`Failed to delete Google Calendar event: ${topic.googleEventId}`, error);
          }
        }
      }
    }
    subject.updatedAt = new Date();
    await subject.save();

    const plan = await StudyPlan.findOne({ subjects: req.params.subjectId });
    if (plan) {
      const subjects = await StudyPlanSubject.find({ _id: { $in: plan.subjects } });
      const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
      const completedTopics = subjects.reduce(
        (sum, subject) => sum + subject.topics.filter(topic => topic.completed).length,
        0
      );
      plan.progress = totalTopics ? (completedTopics / totalTopics) * 100 : 0;
      await plan.save();
    }

    logger.info(`Topic updated: ${req.params.topicId}`);
    res.status(200).json(subject);
  } catch (err) {
    logger.error('Update topic error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const subject = await StudyPlanSubject.findOne({ _id: req.params.subjectId, userId: req.user.userId });
    if (!subject) return res.status(404).json({ message: 'Subject not found or not authorized' });
    const topic = subject.topics.id(req.params.topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    if (topic.googleEventId) {
      const user = await require('../Models/User').findById(req.user._id);
      if (user.googleAccessToken) {
        oauth2Client.setCredentials({ access_token: user.googleAccessToken, refresh_token: user.googleRefreshToken });
        try {
          await calendar.events.delete({
            calendarId: 'primary',
            eventId: topic.googleEventId,
          });
          logger.info(`Deleted Google Calendar event: ${topic.googleEventId}`);
        } catch (error) {
          logger.error(`Failed to delete Google Calendar event: ${topic.googleEventId}`, error);
        }
      }
    }

    // Use $pull to remove the topic from the topics array
    await StudyPlanSubject.updateOne(
      { _id: req.params.subjectId, userId: req.user.userId },
      { $pull: { topics: { _id: req.params.topicId } } }
    );

    // Reload the subject to get the updated document
    const updatedSubject = await StudyPlanSubject.findOne({ _id: req.params.subjectId, userId: req.user.userId });
    if (!updatedSubject) return res.status(404).json({ message: 'Subject not found after update' });

    const now = new Date();
    const deadline = new Date(updatedSubject.deadline);
    const daysAvailable = Math.max(1, Math.floor((deadline - now) / (1000 * 60 * 60 * 24)));
    const daysPerTopic = updatedSubject.topics.length ? Math.floor(daysAvailable / updatedSubject.topics.length) : 1;
    updatedSubject.topics = updatedSubject.topics.map((topic, index) => {
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + index * daysPerTopic);
      const endTime = new Date(startTime);
      endTime.setDate(endTime.getDate() + daysPerTopic);
      if (index === updatedSubject.topics.length - 1) {
        endTime.setTime(deadline.getTime());
      }
      return { ...topic, startTime, endTime };
    });
    updatedSubject.updatedAt = new Date();
    await updatedSubject.save();

    const plan = await StudyPlan.findOne({ subjects: req.params.subjectId });
    if (plan) {
      const subjects = await StudyPlanSubject.find({ _id: { $in: plan.subjects } });
      const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
      const completedTopics = subjects.reduce(
        (sum, subject) => sum + subject.topics.filter(topic => topic.completed).length,
        0
      );
      plan.progress = totalTopics ? (completedTopics / totalTopics) * 100 : 0;
      await plan.save();
    }

    logger.info(`Topic deleted: ${req.params.topicId}`);
    res.status(200).json(updatedSubject);
  } catch (err) {
    logger.error('Delete topic error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteGoogleEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const user = await require('../Models/User').findById(req.user._id);
    if (!user.googleAccessToken) {
      return res.status(400).json({ message: 'No Google access token found' });
    }
    oauth2Client.setCredentials({ access_token: user.googleAccessToken, refresh_token: user.googleRefreshToken });
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
    logger.info(`Deleted Google Calendar event: ${eventId}`);
    res.status(200).json({ message: 'Event deleted' });
  } catch (err) {
    logger.error('Delete Google event error:', err);
    res.status(500).json({ message: 'Failed to delete Google event', error: err.message });
  }
};

// In StudyPlannerController.js

const getUpcomingReminders = async (req, res) => {
  try {
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);

    // Fetch all subjects of the user
    const subjects = await StudyPlanSubject.find({ userId: req.user.userId });

    // Filter topics whose deadlines are within 3 days and not completed
    const upcomingTopics = [];
    subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        if (!topic.completed && topic.endTime && topic.endTime >= now && topic.endTime <= threeDaysLater) {
          upcomingTopics.push({
            subjectName: subject.name,
            topicName: topic.name,
            deadline: topic.endTime,
            googleEventId: topic.googleEventId,
          });
        }
      });
    });

    res.status(200).json({ upcomingTopics });
  } catch (err) {
    console.error('Get upcoming reminders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


module.exports = {
  googleAuth,
  googleCallback,
  createStudyPlan,
  getStudyPlans,
  getStudyPlan,
  updateStudyPlan,
  patchStudyPlan,
  deleteStudyPlan,
  addTopic,
  updateTopic,
  deleteTopic,
  deleteGoogleEvent,
  getUpcomingReminders,
};