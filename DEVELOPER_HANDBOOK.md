# 📖 Deep-Dive Developer Handbook

This document provides a line-by-line understanding of the systems you might need to change during the competition.

---

## 🛠️ PART 1: The Backend (FastAPI)

### 1. The Model Router (`backend/app/services/model_router.py`)
This is the most critical file for model integration.

- **How to add a hardcoded model**:
  Add a new entry to the `BASE_MODELS` dictionary:
  ```python
  "my-new-model": {"provider": "openai", "model_id": "gpt-4-custom", "vision": False}
  ```
- **The Raw HTTP Logic (`_get_raw_http_response`)**:
  If the competition gives you a URL like `http://api.comp.com/v1/ask` that doesn't work with the OpenAI library:
  1. Set `COMPETITION_USE_RAW_HTTP=true` in `.env`.
  2. Inside this function, change the `payload`:
     ```python
     payload = {
         "query": messages[-1]["content"], # Change "query" to whatever they require
         "max_resp": 1000
     }
     ```
  3. Change the data extraction (at the end of the function):
     ```python
     if "answer" in data: # If their API returns {"answer": "..."}
         return data["answer"]
     ```

### 2. The Chat Service (`backend/app/services/chat_service.py`)
This handles the logic flow of a conversation.

- **`send_message(...)` function**:
  - It first saves your message to the database.
  - It calls `memory_service.get_context()` to get your past chat history.
  - It calls `model_router.get_ai_response()` to talk to the AI.
  - It saves the AI's response to the database.
  - **Modification**: If you want to change how much history the AI sees, change the `short_term_limit` in the `get_context` call.

### 3. Database Schema (`backend/app/models.py`)
- **Adding a new field**:
  If you need to save extra info (e.g., "User Score"):
  1. Add `score = Column(Integer, default=0)` to the `User` class.
  2. Update `backend/app/schemas.py` to include `score: int` in the `UserResponse`.

---

## 🎨 PART 2: The Frontend (React)

### 1. The Chat UI (`frontend/src/pages/Chat.jsx`)
- **`handleSendMessage`**: This is the "brain" of the UI.
  - It manages the input state.
  - It handles both images (`imageBase64`) and documents (`attachedDoc`).
  - **Trick**: To change the "loading" message, find `setIsTyping(true)` and look at the `ChatWindow` component.

### 2. Styling (`frontend/src/index.css` & `tailwind.config.js`)
- **Main Colors**: Change the `accent` colors in `tailwind.config.js` to change the "Theme" (e.g., from blue to green).
- **Glassmorphism**: Look for classes like `bg-dark-900/80` and `backdrop-blur-sm`. Increase `/80` to make things more solid, or decrease it to make them more transparent.

### 3. Markdown Rendering (`frontend/src/components/MessageBubble.jsx`)
- This file uses `react-markdown`.
- **How it works**: It converts the AI's text into HTML.
- **Code Highlighting**: If a competition requires specifically pretty code, the `Prism` component inside this file handles the language detection and coloring.

---

## 🔑 PART 3: The Authentication Flow
**Path**: `backend/app/services/auth_service.py`

- **Microsoft Login**: 
  - `exchange_code_for_token`: This is where we talk to Microsoft. If you get a "400 Bad Request," check the logs; I added a `print(resp.text)` there so you can see the exact error from Microsoft.
- **JWT**:
  - `create_access_token`: This signs the "Passcards" (tokens). If you want sessions to last longer, change `ACCESS_TOKEN_EXPIRE_MINUTES`.

---

## 🚀 PART 4: Step-by-Step Recipes

### Task: "I want to add a Clear History button"
1. **Backend**: There is already a `delete_session` endpoint in `chat.py`.
2. **Frontend**: Go to `Sidebar.jsx`, add a button next to "New Chat."
3. **Logic**: Call `deleteSession(id)` from `api/client.js`.

### Task: "I want the AI to always act like a Math Teacher"
1. Open `backend/.env`.
2. Change `SYSTEM_PROMPT` to: *"You are an expert Math teacher. Always explain concepts using formulas and never give the answer directly."*
3. Restart backend.

### Task: "I need to support .docx files specifically"
1. The logic is already in `backend/app/services/document_service.py`.
2. If the formatting is weird, adjust the `_extract_from_docx` function to include more whitespace or specific headings.

---

## 💡 Pro-Tips for Tomorrow
1. **Log Everything**: If something breaks, check the terminal where the backend is running. I've added error logs for Auth, Model calls, and Document parsing.
2. **Frontend Console**: Right-click the browser -> Inspect -> Console. This will show you any errors in the React code.
3. **Restarts**: If you change `.env`, you **MUST** restart the backend. If you change CSS or React code, it will auto-refresh.
