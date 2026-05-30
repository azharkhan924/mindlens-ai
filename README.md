# MindLens AI — Predictive Mental Wellness Companion

A premium, production-quality mental wellness application that uses AI to **infer emotional state automatically** from journals, conversations, voice patterns, and behavioral signals — instead of asking users to select emotions manually.

## ✨ Features

- **🏠 AI Companion Home** — Live wellness score ring, emotional trends, AI-powered daily insights, personalized recommendations
- **💬 AI Chat** — ChatGPT-style empathetic companion with emotion detection, conversation search, and suggested prompts
- **📝 Journal Intelligence** — Free-writing journal with automatic emotion extraction, stress/energy/confidence meters, theme tags
- **🎤 Voice Analysis** — Record voice with waveform visualization, analyze speaking pace, energy, pauses, and confidence
- **📊 Emotional Timeline** — Beautiful Recharts area charts tracking stress, energy, confidence, and focus over time
- **🔮 Wellness Predictions** — Burnout risk, stress escalation, motivation decline, recovery likelihood with explainable AI
- **📈 Insights Dashboard** — Sleep trends, sentiment frequency, behavioral stress heatmap
- **🆘 Emergency Support** — Crisis resources (988, Crisis Text Line, Trevor Project), emergency contact management
- **⚙️ Settings** — Profile management, theme toggle, privacy controls, data wipe

## 🎨 Design Language

- Apple-level polish with minimalist, calm aesthetic
- Glassmorphism panels with soft gradients
- Dark mode and light mode with smooth transitions
- Inter + Outfit typography from Google Fonts
- Framer Motion micro-animations throughout
- Custom wellness color palette (Calm, Energy, Warmth, Focus)

## 🛠 Tech Stack

**Frontend:** Next.js 16 · TypeScript · Tailwind CSS v4 · Motion (Framer Motion) · Recharts · Lucide Icons · next-themes

**Backend:** Spring Boot 3.2 · Java 17 · JPA/Hibernate · H2 (dev) / PostgreSQL (prod) · JWT Authentication · OpenAI API

## 🚀 Getting Started

```bash
# Frontend
cd frontend
npm install
npm run dev    # Opens on http://localhost:3000

# Backend (requires Java 17+ and Maven)
cd backend
mvn spring-boot:run    # Starts on http://localhost:8081
```

## Deployment Environment

For Vercel, set `API_PROXY_URL` to your Render backend URL, for example:

```bash
API_PROXY_URL=https://your-render-service.onrender.com
```

The frontend calls `/api/*` and Next.js proxies those requests to `API_PROXY_URL`.
You can alternatively set `NEXT_PUBLIC_API_URL` to the backend URL to call it
directly from the browser.

For Render/Spring Boot production, set:

```bash
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:postgresql://<supabase-host>:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=<supabase-user>
SPRING_DATASOURCE_PASSWORD=<supabase-password>
OPENAI_API_KEY=<your-openai-key>
```

## ⚠️ Disclaimer

MindLens AI provides wellness insights, emotional trend tracking, and self-reflection tools. It does **NOT** diagnose clinical mental health disorders or provide medical diagnosis. If you are in crisis, please contact emergency services or call 988.
