# Sahaay — n8n Build Spec
### Replaces the Next.js API routes with n8n workflows behind a thin Vercel frontend

**Architecture change from the earlier plan:** the agent logic (LLM calls, eligibility rules, document checks) now lives in n8n workflows instead of Next.js route handlers. Vercel keeps only the chat UI plus a thin proxy layer — this avoids CORS entirely (browser never calls n8n directly) and keeps your Groq/TTS API keys out of both the browser *and* out of n8n's public webhook URLs.

```
Browser (chat UI)
   │
   ▼
Vercel Route Handlers  ← thin proxies only, no logic
   │  (server-to-server, no CORS issue)
   ▼
n8n Webhooks           ← all the actual agent logic lives here
   │
   ▼
Groq API / TTS provider / Scheme data source
```

---

## PART 1 — Antigravity Prompt: build the thin Vercel frontend

Paste this into Antigravity. It replaces the earlier "full build prompt" — same UI components as before, but every API route is now a one-line proxy.

> Build a Next.js (App Router) chat UI for a voice-first benefits-navigator agent called Sahaay. Components: `ChatWindow`, `VoiceRecorderButton` (MediaRecorder → blob), `LanguageSwitcher` (en/hi/kn), `TrustBadge` (source/confidence/last_verified), `DocumentUploadCard`, `ApplicationReviewCard` (Approve/Edit buttons — no auto-submit).
>
> Create these route handlers, each doing nothing but forwarding the request body to the matching n8n webhook URL (stored in environment variables, never exposed to the browser) and returning the response:
> `app/api/stt/route.ts` → `N8N_STT_URL`
> `app/api/tts/route.ts` → `N8N_TTS_URL`
> `app/api/orchestrate/route.ts` → `N8N_ORCHESTRATE_URL`
> `app/api/documents/route.ts` → `N8N_DOCUMENTS_URL`
> `app/api/application-prepare/route.ts` → `N8N_APPLICATION_PREPARE_URL`
> `app/api/application-confirm/route.ts` → `N8N_APPLICATION_CONFIRM_URL`
> `app/api/tracking/route.ts` → `N8N_TRACKING_URL`
>
> Do not implement any agent logic in Next.js — every route is a pure proxy. Handle multipart/form-data (audio, document uploads) by forwarding as-is.

Environment variables (Vercel, never `NEXT_PUBLIC_`):
```
N8N_STT_URL=
N8N_TTS_URL=
N8N_ORCHESTRATE_URL=
N8N_DOCUMENTS_URL=
N8N_APPLICATION_PREPARE_URL=
N8N_APPLICATION_CONFIRM_URL=
N8N_TRACKING_URL=
```

---

## PART 2 — n8n Workflows (build these manually in the editor, or paste each description into n8n's AI workflow builder if your instance has it)

For every workflow: first node is **Webhook** (POST), last node is **Respond to Webhook**. Store the Groq API key and TTS provider key as n8n **Credentials**, not hardcoded in HTTP Request nodes.

### Workflow: STT
- **Webhook** (`/stt`) receives the audio blob
- **HTTP Request** → Groq's Whisper endpoint, multipart body containing the audio, model `whisper-large-v3-turbo`
- **Respond to Webhook** → `{ transcript, detected_language }`

### Workflow: TTS
- **Webhook** (`/tts`) receives `{ text, language }`
- **HTTP Request** → Sarvam AI / Bhashini endpoint (confirm current auth method — API key header vs. query param — before building)
- **Respond to Webhook** → binary audio (set "Response Format" to binary/file in the Respond node)

### Workflow: Orchestrator
- **Webhook** (`/orchestrate`) receives `{ message, language, conversation_id }`
- **HTTP Request** → Groq chat completions, with a system prompt instructing it to extract `{ state, occupation, income, need }` as JSON from the message
- **Code node** → parse the JSON safely (wrap in try/catch equivalent; on parse failure, fall back to asking a clarifying question instead of crashing the workflow)
- **Execute Workflow** node → calls the **Discovery** workflow, passing the extracted profile
- **Execute Workflow** node → calls the **Eligibility** workflow, passing profile + discovery results
- **Respond to Webhook** → `{ reply, extracted_profile, matches }`

### Workflow: Discovery
- Triggered via **Execute Workflow Trigger** (called from Orchestrator, not a public webhook)
- **Read data** node — Google Sheets or Airtable node reading your scheme table (see Part 3 for schema) — easier for teammates to edit live than a JSON file
- **Filter** node — plain logic, state + category match, **no LLM call here**
- Output candidate schemes with `source_url` and `last_verified` attached

### Workflow: Eligibility
- Triggered via **Execute Workflow Trigger** from Orchestrator
- **IF/Switch** nodes — hard rules first (income threshold, occupation match) with no LLM involved
- For entries with free-text `other_criteria` that can't be checked by a plain condition: **HTTP Request** → Groq, with a prompt requiring the model to name the specific criterion it evaluated and its reasoning — never a bare yes/no
- Output `{ scheme_id, eligible, matched_criteria, failed_criteria, explanation }` per scheme

### Workflow: Documents
- **Webhook** (`/documents`) receives `{ document_type, blob_url, expected_name }` for each uploaded file
- **HTTP Request** → an OCR API (Google Cloud Vision or similar) on the blob
- **Code node** → compare extracted name to `expected_name`, check for an expiry date pattern
- **Respond to Webhook** → `{ document_type, status: present|missing|name_mismatch|expired, note }` — completeness/format only, never an authenticity claim

### Workflow: Application Prepare
- **Webhook** (`/application-prepare`) receives profile + selected scheme + document statuses
- **Set/Code node** → assembles the human-readable application object
- **Respond to Webhook** → the object, for `ApplicationReviewCard` to render — nothing here is final yet

### Workflow: Application Confirm
- **Webhook** (`/application-confirm`) — only ever called *after* the user clicks Approve in the UI
- **Code node** → generates a mock application ID
- Optional: **Google Sheets** node appends a row here as your audit-trail log (source, confidence, decision, timestamp) — this satisfies the Responsible-AI checklist's audit-trail item for free
- **Respond to Webhook** → `{ application_id, status: "submitted" }` (mocked — label this clearly in a Sticky Note inside the workflow so teammates don't mistake it for a real portal integration)

### Workflow: Tracking
- **Webhook** (`/tracking`) receives `{ application_id }`
- **Code node** → returns a hardcoded status sequence (`submitted → under_review → approved`) — add a Sticky Note in the canvas noting this is mocked, not live polling

---

## PART 3 — Scheme data source

Use a Google Sheet (via n8n's Google Sheets node) with one row per scheme, columns matching the earlier JSON schema: `id, name, category, state, max_family_income_inr, occupation, other_criteria, benefits, required_documents, application_method, source_url, last_verified, demo_tier`. A spreadsheet is easier for a non-coding teammate to fill in and verify against official sources than editing raw JSON — directly useful for the scheme-audit task from before.

---

## Build/test order — do this sequence, not frontend-first

1. Build and test the **STT** and **TTS** workflows in isolation first (call their webhooks directly with a test tool like the n8n "Test workflow" button or curl) — this is the part most likely to break, per the earlier concern about audio handling in n8n.
2. Build **Discovery** and **Eligibility** against 2–3 rows of real scheme data before wiring in the LLM extraction step.
3. Build **Orchestrator** last, since it depends on the other two.
4. Only after all webhooks work standalone, build the Vercel proxy routes and wire up the UI.
5. Confirm n8n hosting (Cloud vs. self-hosted) can handle a few rapid back-to-back calls without hitting execution limits — test this before demo day, not during it.

---

## Guardrails carried over from the original plan (unchanged)

- No real government portal scraping or submission — Application Confirm is mocked, say so on stage
- No document authenticity claims — completeness/format only
- No submission without the human-approval UI gate
- Tracking is mocked, not live polling
