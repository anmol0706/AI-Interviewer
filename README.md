# 🎯 Adaptive AI Interviewer Platform

## Cognitive & Behavioral Analysis for Interview Preparation

A production-ready SaaS platform that uses Google Gemini AI to conduct intelligent interviews with real-time difficulty adjustment, voice analysis, and comprehensive performance analytics.

---

## 🌟 Features

### Interview Modes
- **HR Interviews** - Behavioral and situational questions
- **Technical Interviews** - Coding, algorithms, data structures
- **Behavioral Interviews** - STAR method, leadership scenarios
- **System Design Interviews** - Architecture, scalability, trade-offs

### AI-Powered Analysis
- **Dynamic Difficulty Adjustment** - Questions adapt based on performance
- **Reasoning Depth Evaluation** - Measures logical thinking
- **Answer Correctness Scoring** - Validates technical accuracy
- **Follow-up Question Generation** - Intelligent probing questions

### Voice Analysis (Google Speech-to-Text)
- **Hesitation Detection** - Identifies uncertainty in responses
- **Pause Duration Analysis** - Measures response time patterns
- **Filler Word Detection** - Tracks "um", "uh", "like", etc.
- **Confidence Level Scoring** - Analyzes speech patterns
- **Communication Clarity Score** - Evaluates articulation

### Analytics Dashboard
- **Reasoning Score** - Logical structure evaluation
- **Confidence Score** - Based on voice and response analysis
- **Communication Clarity Score** - Speech pattern analysis
- **Strengths & Weaknesses** - Detailed breakdown
- **AI Improvement Plan** - Personalized recommendations
- **Practice Questions** - Tailored to weak areas

### Interviewer Personalities
- **🔥 Strict Mode** - FAANG-style rigorous questioning
- **😊 Friendly Mode** - Supportive and encouraging
- **🏢 Professional Mode** - Balanced corporate style

---

## 🛠 Tech Stack

### Frontend
- **React.js 18** - Modern React with Hooks
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Fluid animations
- **Socket.io Client** - Real-time communication
- **React Query** - Data fetching & caching

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Socket.io** - WebSocket connections
- **JWT** - Authentication

### AI & Voice
- **Google Gemini 2.0** - Core AI model
- **Google Speech-to-Text** - Voice transcription
- **Custom Prompt Engineering** - Interview logic

### Cloud & DevOps
- **Google Cloud Platform** - Hosting
- **Cloud Run** - Serverless containers
- **Cloud Storage** - Audio file storage
- **Docker** - Containerization

---

## 📁 Project Structure

```
ai-interviewer/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API services
│   │   ├── stores/            # State management
│   │   ├── utils/             # Helper functions
│   │   └── styles/            # Global styles
│   └── public/
│
├── server/                    # Node.js Backend
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   │   ├── ai/            # AI/Gemini services
│   │   │   ├── speech/        # Speech-to-Text services
│   │   │   └── analytics/     # Scoring & analytics
│   │   ├── utils/             # Utilities
│   │   └── websocket/         # Socket.io handlers
│   └── tests/
│
├── docker/                    # Docker configs
├── docs/                      # Documentation
└── scripts/                   # Deployment scripts
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Cloud account
- Google Gemini API key

### Environment Setup

```bash
# Clone repository
git clone <repo-url>
cd ai-interviewer

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start development
npm run dev
```

---

## 📝 License

MIT License - See LICENSE file for details.

---

## 👨‍💻 Author

Built with ❤️ as a startup-grade SaaS platform
