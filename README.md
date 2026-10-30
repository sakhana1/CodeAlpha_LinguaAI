# LinguaAI – Language Translation Tool

**CodeAlpha AI Internship Task 1**

A language translation web application with language selection, translation history, vocabulary saving, copy, and speech features.

## Technology
- Frontend: React + Vite
- Backend: Python Flask REST API
- Styling: Responsive custom CSS
- Translation provider: MyMemory Translation API
- Browser features: Speech Synthesis and (where supported) Speech Recognition

## Features
- Select source and target languages
- Auto-detect source language option
- Swap languages
- Translate text through a real external translation service
- Translation history stored in browser local storage
- Copy and listen to translated text
- Save vocabulary items
- Responsive three-column translator workspace

## Run backend
```bash
cd backend
python -m venv venv
# Windows
venv\\Scripts\\activate
# macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

## Run frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL, normally http://localhost:5173.

Translation requires internet access. The backend endpoint is `POST /api/translate`.

## API endpoints
- `GET /api/health`
- `GET /api/faqs`
- `POST /api/translate`
- `POST /api/chat`

The backend contains shared API routes; the frontend in this archive is focused on the named task.

## Submission notes
Before submitting, run both frontend and backend locally, capture screenshots, and add your GitHub repository URL to your internship submission.
