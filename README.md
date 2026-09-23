# Sahaay — Benefits Navigator Agent

A voice-first, multilingual AI agent that helps users discover, check eligibility for, and prepare applications for Indian government welfare and education schemes — with a mandatory human-approval gate before any state-changing action.

Built for **Build for Billions — Agentic AI For Billions** by **Team VoidMain()**, Mangalore Institute of Technology and Engineering (MITE).

## Architecture

```
Browser (chat UI)
   │
   ▼
Vercel Route Handlers  ← thin proxies only, no logic
   │
   ▼
n8n Webhooks           ← all agent logic lives here
   │
   ▼
Groq API / Bhashini-Sarvam / Google Sheets / OCR
```

Seven n8n workflows implement the agent pipeline: **Orchestrator** (entry point) calls **Discovery** (scheme matching) and **Eligibility** (rules-first, LLM only for ambiguous free-text criteria) as sub-workflows. **STT**, **TTS**, **Documents**, **Application Prepare/Confirm**, and **Tracking** are called directly by the frontend.

## Project status — what's real vs. mocked

This is a hackathon prototype. In the interest of the same explainability this project is built around, here's what's actually live versus simulated:

| Component | Status |
|---|---|
| Speech-to-text (Groq Whisper) | Real API call |
| Text-to-speech (Sarvam AI) | Real API call |
| Scheme discovery & eligibility logic | Real, rules-first with LLM fallback for ambiguous criteria |
| Document completeness check | Real OCR call; **completeness/format only — never an authenticity claim** |
| Application submission | **Mocked** — generates a fake application ID and logs an audit-trail row; does not submit to any real government portal |
| Application tracking | **Mocked** — returns a hardcoded status timeline, not live polling |

## Repo structure

```
sahaay/
├── README.md
├── .gitignore
├── frontend/            # Next.js app (chat UI + thin API proxy routes)
├── n8n-workflows/        # Exported n8n workflow JSON — import directly into n8n
└── docs/
    ├── implementation-plan.md
    ├── n8n-build-spec.md
    └── proposal.pdf
```

## Tech stack

- **LLM reasoning:** Groq API (Llama 3.3 70B)
- **Speech-to-text:** Groq Whisper (large-v3-turbo)
- **Text-to-speech:** Sarvam AI / Bhashini
- **Orchestration:** n8n (self-hosted)
- **Document OCR:** Google Cloud Vision (completeness checks only)
- **Frontend:** Next.js (App Router), deployed on Vercel
- **Data:** Google Sheets as the scheme knowledge base

## Setup

1. Import all files in `n8n-workflows/` into your n8n instance.
2. Add credentials for Groq, Sarvam AI, and Google Sheets inside n8n (never hardcoded in the workflow files).
3. Point the frontend's environment variables (`N8N_*_URL`) at your n8n webhook URLs.
4. Run the frontend locally with `npm install && npm run dev`, or deploy to Vercel.

## Team

| Name | Contribution |
|---|---|
| Karthik Sudhir Prabhu (Team Leader) | Overall architecture and technical leadership; built and orchestrated the core n8n workflows (Orchestrator, Discovery, Eligibility) |
| Krithi P | Frontend development — chat interface, voice recorder, and application review UI (Next.js) |
| Mahathi V H | Multilingual and voice pipeline — speech-to-text/text-to-speech integration and language switching |
| M Sachin Acharya | Document verification workflow — OCR-based completeness checks and eligibility rules logic |
| Pavan M R | Scheme research and data curation — sourcing and verifying the government scheme entries and their official sources |
| Keerthan | Testing, deployment, and demo preparation — end-to-end workflow testing and Vercel deployment |

*This breakdown is a suggested split based on the project's actual components, not a confirmed record of who did what — adjust it to match how the team actually divided the work.*
