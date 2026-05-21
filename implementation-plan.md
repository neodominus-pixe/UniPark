# UniPark — AI Feature Implementation Plan

## Overview
This plan covers all AI and UX enhancements added to UniPark after the core app was built.
Work through phases in order. Phases 3 and 4 depend on Phase 2 being live on Vercel.

**Stack:** HTML · CSS · Vanilla JS · Supabase · Vercel (static + serverless)
**AI Provider:** Anthropic Claude API
**Chatbot:** Voiceflow (built separately, embedded at Phase 5)

---

## Phase 1 — localStorage Autofill
**Goal:** Auto-fill the registration form with the student's previously entered data so they don't retype it every time.
**Files:** `assets/js/register.js`, `register.html`
**Dependencies:** None

### Tasks
- [ ] After a successful registration insert, save the following to `localStorage`:
  - `student_name`
  - `student_id`
  - `phone_number`
  - `plate_number`
- [ ] On `DOMContentLoaded` in `register.js`, read `localStorage` and pre-fill those four fields if data exists
- [ ] Add a small "Clear saved info" link below the form that wipes `localStorage` and clears the fields
- [ ] Test: fill form → submit → revisit page → confirm fields are pre-filled
- [ ] Test: "Clear saved info" → confirm fields reset and data is gone from `localStorage`

---

## Phase 2 — Vercel Serverless Function (Claude API Gateway)
**Goal:** Create a secure backend endpoint that the frontend calls to reach the Claude API. Keeps the Claude API key out of client-side code.
**Files:** `api/claude.js` *(new Vercel serverless function)*
**Dependencies:** Vercel deployment must be live

### Tasks
- [ ] Create `api/` folder in project root
- [ ] Create `api/claude.js` as a Vercel serverless function
- [ ] Function accepts a POST request with a `{ prompt, imageBase64? }` body
- [ ] Function calls Claude API using the API key stored as a Vercel environment variable (`CLAUDE_API_KEY`)
- [ ] Function returns Claude's response as JSON
- [ ] Add `CLAUDE_API_KEY` to Vercel environment variables (Dashboard → Project → Settings → Environment Variables)
- [ ] Deploy to Vercel and confirm the endpoint is reachable
- [ ] Test endpoint with a simple prompt via browser/Postman before wiring up the frontend

---

## Phase 3 — Plate Photo → AI Lookup
**Goal:** Let a user photograph or upload an image of a car plate. Claude reads the plate text, then Supabase is queried for the registered owner.
**Files:** `find-blocker.html`, `assets/js/find-blocker.js`
**Dependencies:** Phase 2 must be complete and live

### Tasks
- [ ] Add a "Scan a Plate" toggle/tab to `find-blocker.html` alongside the existing text input
- [ ] Add a file input (camera on mobile, file picker on desktop) for the plate image
- [ ] On image selection, convert image to Base64
- [ ] Send Base64 image to `api/claude.js` with a prompt asking Claude to extract the plate number text
- [ ] Parse Claude's response to extract the clean plate string (uppercase, no spaces)
- [ ] Auto-fill the plate input field with the extracted plate
- [ ] Run the existing Supabase lookup logic with the extracted plate
- [ ] Handle edge cases:
  - [ ] Image too blurry / plate unreadable → show friendly error
  - [ ] Plate not found in Supabase → show "no active registration" message
- [ ] Test with clear plate image → confirm correct extraction and lookup
- [ ] Test with unclear image → confirm graceful error message

---

## Phase 4 — Occupancy Pattern Analysis (Admin Dashboard)
**Goal:** Add an "AI Insights" section to the admin dashboard that analyzes historical parking data and surfaces patterns in plain English.
**Files:** `admin/dashboard.html`, `assets/js/admin-dashboard.js`
**Dependencies:** Phase 2 must be complete and live

### Tasks
- [ ] Add an "AI Insights" section/card to `admin/dashboard.html`
- [ ] Add a "Generate Insights" button that triggers the analysis
- [ ] On click, query `parked_cars` from Supabase — fetch all records (both `active` and `exited`) with `zone_id`, `arrival_time`, `departure_time`, `status`
- [ ] Format the data into a structured summary (counts per zone, peak hours, average duration)
- [ ] Send the summary to `api/claude.js` and ask Claude to generate human-readable insights
- [ ] Display Claude's response in the Insights card on the admin dashboard
- [ ] Add a loading state while waiting for Claude's response
- [ ] Handle error state if the API call fails
- [ ] Test with real historical data → confirm insights are accurate and readable
- [ ] Test error/loading states

---

## Phase 5 — Voiceflow Chatbot Embed
**Goal:** Embed the Voiceflow-built chatbot widget into all UniPark pages as a floating button.
**Files:** `index.html`, `register.html`, `dashboard.html`, `find-blocker.html`
**Dependencies:** Voiceflow chatbot must be fully built and published (see `chatbot.md`)

### Tasks
- [ ] Receive the Voiceflow embed snippet (JS script tag)
- [ ] Add the snippet to `index.html` before `</body>`
- [ ] Add the snippet to `register.html` before `</body>`
- [ ] Add the snippet to `dashboard.html` before `</body>`
- [ ] Add the snippet to `find-blocker.html` before `</body>`
- [ ] Confirm the widget appears as a floating button on all pages
- [ ] Test chatbot flows end-to-end (availability check, find blocker, register guide)
- [ ] Confirm live Supabase data is returned correctly through Voiceflow API blocks

---

## Reference Files
| File | Purpose |
|------|---------|
| `chatbot.md` | Full Voiceflow workflow guide — conversation flows, API calls, Supabase structure |
| `implementation-plan.md` | This file — phase tracker and task checklist |
| `sql/schema.sql` | Database schema — tables, RLS policies, seed data |
| `assets/js/config.js` | Supabase URL and anon key |

---

## Phase Completion Status
| Phase | Status |
|-------|--------|
| Phase 1 — localStorage Autofill | Complete |
| Phase 2 — Vercel Serverless Function | Complete |
| Phase 3 — Plate Photo AI Lookup | Complete |
| Phase 4 — Admin Occupancy Insights | Complete |
| Phase 5 — Voiceflow Embed | Complete |
