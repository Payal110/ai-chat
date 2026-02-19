# Competition-Ready AI Chatbot Template

A full-stack, modular AI chatbot application built with FastAPI and React. Designed for quick adaptation to new competition problem statements.

## 🚀 Key Features

- **Multi-Model Support**: GPT-4o, GPT-mini, and DeepSeek integration.
- **Persistent Memory**: Both short-term (conversation context) and long-term (user fact extraction).
- **Competiton-Ready Logic**: Change branding, model, and system prompts via `.env` or a single config object.
- **Modern UI**: ChatGPT-like interface with markdown, code highlighting, and image upload.
- **Authentication**: Microsoft OAuth2 + local Demo login bypass.

---

## 🛠️ Setup Instructions

### 1. Backend Setup

1.  **Navigate to backend**: `cd backend`
2.  **Create virtual environment**: `python -m venv venv`
3.  **Activate venv**: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4.  **Install dependencies**: `pip install -r requirements.txt`
5.  **Configure Environment**:
    - Copy `.env.example` to `.env`
    - Add your `OPENAI_API_KEY` or `DEEPSEEK_API_KEY`.
    - (Optional) Configure `MICROSOFT_CLIENT_ID` for OAuth.
6.  **Run Server**: `uvicorn app.main:app --reload`

### 2. Frontend Setup

1.  **Navigate to frontend**: `cd frontend`
2.  **Install dependencies**: `npm install`
3.  **Run Development Server**: `npm run dev`
4.  **Access App**: Open [http://localhost:5173](http://localhost:5173)

---

## 🎨 Competition Customization

### Change Branding
Update `LANDING_CONFIG` in `frontend/src/pages/Landing.jsx` to change the app name, logo, and landing page content in seconds.

### Change AI Behavior
Update `SYSTEM_PROMPT` and `DEFAULT_MODEL` in `backend/.env` to change how the AI acts and which model it uses by default.

### Add New Models
Add new model IDs to `AVAILABLE_MODELS` in `backend/app/services/model_router.py`.

---
