# ConnectSpark

**ConnectSpark** is a networking and connection platform designed for events. It helps attendees connect meaningfully by aligning on personality, interests, and career goals, while giving organizers and sponsors measurable ROI.

👉 Live development version: [https://connect-spark.vercel.app/](https://connect-spark.vercel.app/)

---

## 🚀 Features

- **Simple Onboarding**

  - Sign up with LinkedIn or email.
  - Build a personal profile with hobbies, goals, and optional personality details.

- **Event Join Flow**

  - Join events by scanning a QR code or entering a 4-digit code.
  - Answer quick intent questions (“Why did you attend?”, “Who do you want to meet?”).

- **Smart Suggestions**

  - Personalized attendee and sponsor recommendations.
  - Quick connect/reject options.

- **Connection Management**

  - Review suggestions in detail with shared interests and suggested topics.
  - Accept or reject incoming connection requests.

- **Post-Event Recap**

  - Personalized event summary with insights and key connections.
  - Downloadable recap infographic.

- **Admin Tools**

  - Create and manage events.
  - Generate event QR codes.
  - Trigger match recomputation across attendees.

---

## 🛠️ Tools & Tech Used

- **Vite** – Modern frontend build tool
- **TypeScript** – Type-safe development
- **React** – Component-based UI framework
- **shadcn-ui** – Accessible, customizable UI components
- **Tailwind CSS** – Utility-first styling
- **FastAPI** – Backend framework for APIs
- **OpenAI API** – Powering embeddings & AI-assisted features

---

## 📂 Project Structure

```
app/
├─ src/                # React frontend
│  ├─ pages/           # UI pages (Onboarding, Dashboard, Profile, etc.)
│  ├─ components/      # Reusable UI components
│  ├─ lib/             # API clients and utilities
│  └─ integrations/    # Supabase client setup
├─ backend/            # FastAPI backend
│  ├─ main.py          # FastAPI entrypoint
│  ├─ routers/         # API route definitions
│  ├─ services/        # Embedding, matching, QR, recap services
│  └─ tests/           # Backend tests
├─ supabase/           # Supabase migrations & config
└─ package.json        # Frontend dependencies
```

---

## ⚙️ Local Development

### Prerequisites

- Node.js (>=18)
- Python (>=3.10)
- Supabase project with pgvector enabled
- Storage buckets created: `qr_codes`, `recaps`

### Frontend Setup

```bash
cd app
npm install
npm run dev
```

Runs the frontend at [http://localhost:8080](http://localhost:8080).

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Runs the backend at [http://localhost:8000](http://localhost:8000).

### Environment Variables

Create a `.env` file in both `app/` and `backend/` with the following values:

Frontend (`app/.env`):

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

Backend (`backend/.env`):

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

---

## 🧪 Testing

### Frontend

```bash
npm run test
```

### Backend

```bash
pytest
```

---

## 📈 Roadmap

- [x] Core onboarding and event join flow
- [x] Event creation and management (Admin)
- [x] Frontend + Supabase integration
- [x] Backend service with FastAPI
- [ ] AI-powered embeddings and matching logic
- [ ] Recap infographic enhancements

---

## 📄 License

MIT License. See `LICENSE` for details.
