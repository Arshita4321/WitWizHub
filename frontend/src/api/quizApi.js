export async function getQuizQuestions(subject, topics, numQuestions, level, token) {
    const res = await fetch('http://localhost:3000/api/quiz/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subject, topics, numQuestions, level })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.details || 'Failed to generate quiz');
    }
    return res.json();
  }
  
  export async function submitQuiz(questions, answers, token) {
    const res = await fetch('http://localhost:3000/api/quiz/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ questions, answers })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.details || 'Failed to submit quiz');
    }
    return res.json();
  }