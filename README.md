# 📚 **EduMate – Smart Learning Platform**

**Tagline:** *Learn Smarter, Play Together, Achieve Faster*

**EduMate** is a feature-rich educational platform designed to help students plan, track, and enhance their learning with AI-driven tools, quizzes, notes management, multiplayer learning games, and real-time collaboration.

---

## 🌟 **Features**

### **1. Landing Page**
- Overview of platform features and usage guide  
- Vertical navigation bar for easy access  
<img width="3757" height="2198" alt="image" src="https://github.com/user-attachments/assets/fbc499f9-6591-44f5-968a-2f2bfc3ba8ea" />


### **2. User Profile**
- Profile picture and study plan overview  
- **My Study Plans**: Toggle between *Current* and *Completed* plans  
- Button to add a new study plan  

### **3. About & Contact Page**
- Information about the platform  
- Contact form for users to get in touch  
![About Page](./images/about_page.png)

### **4. AI Chatbot**
- Instantly answers normal questions  
- Provides video tutorials for complex queries using **Gemini API**  
![Chatbot](./images/chatbot.png)

### **5. Study Planner**
- Enter field of study, subject, deadline, and topics  
- Visual To-Do style layout for topic tracking  
- Reminders for upcoming deadlines  
![Study Planner](./images/study_planner.png)

### **6. Notes Section**
- Add, edit, and delete notes  
- Organized for quick access  
![Notes Section](./images/notes_section.png)

### **7. Quiz Generator**
- Generate quizzes by subject, topic, number of questions, and difficulty  
- AI-generated quick revision sheets based on incorrect answers  
![Quiz Section](./images/quiz_section.png)

### **8. Multiplayer Game**
- Invite up to 4 friends for study preparation  
- Relay-style quiz game:  
  - +10 points for correct answers  
  - -5 points for wrong answers  
- Real-time updates using **Socket.IO**  
![Game Section](./images/game_section.png)

### **9. Conversation Forum**
- **Questions:** Post and answer questions  
- **Messages:** Chat forum for collaborative discussion  
![Forum Section](./images/forum_section.png)

---

## 🛠️ **Tech Stack**

- **Frontend:** React, EJS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Real-time Communication:** Socket.IO  
- **APIs:** Google Calendar API, Gemini API  
- **Deployment:** (Optional: Heroku/Docker/Vercel)  

---

## 💡 **AI & Smart Features**

- AI Chatbot for instant help and video suggestions  
- Automated quiz correction and revision sheet generation  
- Study planner with intelligent reminders and deadline tracking  

---

## 🚀 **Getting Started**

### **Clone the Repository**
```bash
git clone https://github.com/yourusername/edumate.git
cd edumate
