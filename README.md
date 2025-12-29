# Shopper - AI-Powered Local Business Assistant 🛍️🤖

**Shopper** is an AI-powered local business assistant on WhatsApp. It bridges the gap between local shops and modern digital discovery, providing users with a "Super App" like experience for finding nearby businesses and chatting with them to get verified information instantly.

![Status](https://img.shields.io/badge/Status-Pilot%20Ready-blue) ![Stack](https://img.shields.io/badge/Tech-FastAPI%20%7C%20Next.js%20%7C%20Gemini-green) ![Platform](https://img.shields.io/badge/Platform-WhatsApp%20%7C%20Web-25D366)

---

## 🌟 Vision

To provide every extensive local business with an **AI Front Desk** that works 24/7, enabling them to reply to customers instantly while offering users a helpful, intelligent assistant on WhatsApp that understands context and location.

---

## 🚀 Key Features

### 🛒 For Shoppers (AI Assistant)
*   **📍 Hyperlocal Discovery**: 
    *   **Real-time Location**: Find shops nearby using GPS location sharing.
    *   **Smart Ranking**: Results are sorted by Distance, Partner Status (Verified), and Response Speed.
    *   **Hybrid Search**: Seamlessly blends **Partner Shops** (AI-enabled, Instant Chat) and **External Listings** (Info-only, Call to Order).
*   **🧠 Intelligent Interaction**:
    *   **Universal Chat**: A single WhatsApp thread to talk to a Bakery, Clinic, or Salon. The context switches automatically.
    *   **Navigation Commands**: Natural commands like *"Exit"*, *"Menu"*, *"Restart"*, or *"Change Shop"* to control the flow.
    *   **Voice & Multilingual**: 
        *   Send voice notes; the AI transcribes and replies.
        *   Chat in **Hindi, Kannada, Tamil, Telugu, Malayalam**, or other languages. The AI translates to English for processing and replies in your native language.
*   **✅ Trust & Verification**:
    *   **Strict Knowledge Verification**: The AI strictly uses the shop's provided context. If it doesn't know, it says *"I don't know"* instead of hallucinations.

### 🏢 For Business Owners (The Command Center)
*   **🤖 AI Front Desk**:
    *   **RAG Pipeline**: Retrieves answers from past replies, uploaded PDFs, menus, and business details.
    *   **Reliability Controls**: Toggle AI on/off from the dashboard.
    *   **Escalation Protocol**: If the AI is unsure (Low Confidence), it silences itself and alerts the owner for a human reply.
*   **📈 Growth Dashboard**:
    *   **Business Intelligence**: Track "Time Saved", "AI Handled Queries", and "Prevented Escalations".
    *   **Trust Signals**: Earn "Verified" and "Fast Reply" badges based on performance.
*   **🔁 Retention Tools**:
    *   **Daily Reports**: Automated morning summaries sent to the owner's WhatsApp (*"Yesterday: 15 chats, 12 AI-handled"*).
    *   **Web Portal**: A modern, minimalist dashboard to manage profile, view chat history, and handle escalations.

### 🌐 Platform Enhancements
*   **Landing Page**: A high-conversion, minimalist landing page to attract new business owners.
*   **Video Demo**: Integrated product walkthrough showing the WhatsApp-to-Dashboard flow.
*   **Localization**: Landing page fully translated into 7+ Indian languages.

---

## 🛠️ Technology Stack

### Backend (The Brain)
*   **Framework**: `FastAPI` (Python) - High-performance, async-first.
*   **Database**: `PostgreSQL` (Production) / `SQLite` (Dev) - Managed via `SQLAlchemy` ORM.
*   **AI Core**: 
    *   **LLM**: `Google Gemini 1.5 Flash` (Fast inference for chat).
    *   **Embeddings**: `text-embedding-004` (For Vector Search).
    *   **Vector Store**: `FAISS` (Facebook AI Similarity Search) for RAG.
*   **Messaging**: `Twilio API` (WhatsApp Sandbox/Business API).

### Frontend (The Face)
*   **Framework**: `Next.js 14` (App Router).
*   **Styling**: `Tailwind CSS` (Minimalist, Monochrome Theme).
*   **Component Lib**: `Lucide React` (Icons).
*   **Deployment**: Vercel (Frontend), Render (Backend).

### Services & Utilities
*   **PDF Processing**: `PyPDF2` (Extracting text from uploaded docs).
*   **Tasks**: `APScheduler` / Custom Cron scripts for daily notifications.
*   **DevOps**: Docker ready, Procfile for Render.

---

## 📂 Project Structure

```bash
shopper/
├── app/                    # Backend (FastAPI)
│   ├── api/                # API Routes (auth, chat, upload)
│   ├── core/               # Business Logic (router, search, state machine)
│   ├── db/                 # Database Models & Session
│   ├── services/           # External Services (AI, Twilio, PDF)
│   └── main.py             # App Entry Point
├── dashboard/              # Frontend (Next.js)
│   ├── app/                # App Router Pages (landing, dashboard, auth)
│   ├── components/         # Reusable UI Components
│   └── public/             # Static Assets (demo video, images)
├── scripts/                # Utility Scripts
│   ├── seed_db.py          # Database Seeder
│   └── cron_notifications.py # Daily Report Job
├── requirements.txt        # Backend Dependencies
└── Procfile                # Render Deployment Config
```

---

## ⚡ Installation & Setup

### 1. Prerequisites
*   Python 3.10+
*   Node.js 18+
*   PostgreSQL (or use SQLite default)
*   Twilio Account (Sandbox)
*   Google Gemini API Key

### 2. Backend Setup
```bash
# Clone
git clone https://github.com/your-repo/shopper.git
cd shopper

# Environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure .env
cp .env.example .env
# Set GEMINI_API_KEY, TWILIO_CREDENTIALS, DATABASE_URL

# Database
python3 seed_db.py  # Seeds mock data

# Run
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd dashboard
npm install
npm run dev
```

### 4. Deployment (Pilot Phase)
*   **Frontend**: Deployed on **Vercel** (`shopper-demo.vercel.app`).
*   **Backend**: Deployed on **Render** (`shopper-api.onrender.com`).
*   **Docs**: See `deployment_guide.md` for detailed step-by-step instructions.

---

## 📖 Usage Guide

### WhatsApp User Flow
1.  **Start**: Send `"Hi"` or `"Menu"`.
2.  **Search**: Type `"Bakery"` or `"Plumber"`.
3.  **Context**: Share Location to find nearby shops.
4.  **Connect**: Select a shop ID (e.g., `1`) to enter a chat session.
5.  **Interact**: Ask questions, view catalog (simulated), or troubleshoot/escalate.
6.  **Switch**: Type `"Exit"` to return to the main menu.

### Owner Dashboard Flow
1.  **Login**: Access `/login` (Default: `bakery_owner` / `pass123`).
2.  **Monitor**: View live stats on the Dashboard.
3.  **Train**: Upload PDFs in the "Knowledge Base" section.
4.  **Settings**: Update profile, change location, or toggle AI.

---

## 🔮 Roadmap
- [ ] **Payments**: UPI / WhatsApp Pay integration.
- [ ] **Inventory Sync**: Excel/CSV upload to update product availability real-time.
- [ ] **Voice Calls**: AI handling incoming voice calls via Twilio Voice.
- [ ] **Multi-Agent**: Specialized agents for Booking vs Support vs Sales.
