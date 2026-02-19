# 🏆 Competition Technical Guide

This guide describes every major component of the AI Chatbot and provides "Quick Fix" instructions for common competition scenarios.

---

## 🏗️ System Architecture

- **Backend**: FastAPI (Python) - Fast, asynchronous, and easy to extend.
- **Frontend**: React (Vite) - Modern UI with Tailwind CSS for styling.
- **Database**: SQLite (SQLAlchemy ORM) - Zero-setup, single file (`app.db`).
- **Auth**: Microsoft OAuth2 + JWT Tokens.

---

## 📂 Backend: Every File Explained

### 🚀 Core
- **`app/main.py`**: The app's heartbeat. It initializes FastAPI, adds the `/api` prefix to all routes, and enables CORS so the frontend can talk to it.
- **`app/config.py`**: Loads everything from `.env`. If you add a new environment variable, you must add it here as well.
- **`app/database.py`**: Sets up the SQLite connection.
- **`app/models.py`**: The "Shape" of your data.
    - `User`: Email, Name, Microsoft ID.
    - `ChatSession`: Titles and timestamps for conversations.
    - `Message`: The actual chat content, role (user/assistant), and image links.
    - `MemoryStore`: Facts about users for long-term memory.

### 🧠 Services (The "Brains")
- **`app/services/model_router.py`**: **CRITICAL.** This routes messages to AI.
    - `BASE_MODELS`: Hardcoded defaults (GPT-4o, DeepSeek).
    - `get_full_registry()`: Merges default models with custom ones from `.env`.
    - `_get_raw_http_response()`: **CUSTOM API HANDLER.** If a competition API is non-standard, edit the `payload` dict here (around line 160).
- **`app/services/chat_service.py`**: Handles sending a message, saving history, and calling the `model_router`.
- **`app/services/memory_service.py`**: 
    - **Short-term**: Takes the last few messages for context.
    - **Long-term**: Automatically saves facts about the user (e.g., "User is a coder") and injects them into future chats.
- **`app/services/document_service.py`**: Uses `PyPDF2` and `python-docx` to extract text from uploads.

### 🛣️ Routes (Endpoints)
- **`app/routes/auth.py`**: Microsoft login logic.
- **`app/routes/chat.py`**: Handles `/sessions`, `/messages`, and `/upload-document`.
- **`app/routes/memory.py`**: API for managing stored user facts.

---

## 🎨 Frontend: Key Areas

- **`src/api/client.js`**: Central place for all API calls. Uses Axios with a JWT interceptor (it automatically sends the token).
- **`src/pages/Chat.jsx`**: The main interface.
    - **`STARTER_PROMPTS`**: Edit this list to change the "clickable" questions.
    - **`handleSendMessage`**: Logic for combining text + attachments.
- **`src/components/MessageBubble.jsx`**: Uses `react-markdown` and `syntax-highlighter` to make code look beautiful.
- **`src/components/ImageUpload.jsx`**: Handles converting files to Base64.

---

## 🆘 Quick Fix Guide (Competition Scenarios)

### 1. "We have a custom API URL and Key"
1. Open `backend/.env`.
2. Set `COMPETITION_BASE_URL` and `COMPETITION_API_KEY`.
3. Set `COMPETITION_MODEL_IDS="model-name-here"`.
4. Restart backend.

### 2. "The Custom API isn't working with the library"
1. Set `COMPETITION_USE_RAW_HTTP=true` in `.env`.
2. Open `app/services/model_router.py`.
3. Locate `_get_raw_http_response`.
4. Update the `payload` dictionary to match their expected JSON structure.

### 3. "The AI isn't following the rules"
1. Open `backend/.env`.
2. Update the `SYSTEM_PROMPT` to be more strict or specific to the problem.

### 4. "We need to change the logo or colors"
- **Colors**: Edit `frontend/tailwind.config.js` (`accent` and `dark` colors).
- **Logo**: The "Antigravity" text is in `Landing.jsx` and `Sidebar.jsx`.

### 5. "Database is corrupted"
- Simply delete `backend/app.db`. The app will create a clean one automatically on next startup.

---

## 🛠️ Deployment Checklist
- [ ] `.env` is fully filled?
- [ ] `pip install -r requirements.txt` ran?
- [ ] `npm install` ran?
- [ ] Backend running on 8000?
- [ ] Frontend running on 5173? (Use `npm run dev`)
