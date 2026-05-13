# UniPark Chatbot — Voiceflow Workflow Guide

## Project Overview
UniPark is a campus parking coordination web app for AUST university. The chatbot is built in Voiceflow and embedded on the UniPark website as a floating widget. Its job is to help students with real-time parking questions without leaving the page.

---

## Live Data Source — Supabase

All parking data lives in a Supabase (PostgreSQL) database.

**Base URL:** `https://ufowvqoulyncjlkujcrn.supabase.co/rest/v1`

**Required headers on every API call:**
```
apikey: <get from unipark/assets/js/config.js>
Authorization: Bearer <same value as apikey>
Content-Type: application/json
```

> The anon key is intentionally public — Row Level Security (RLS) in Supabase is the actual security layer. Safe to use in Voiceflow API blocks.

---

## Site Pages Reference

| Page | File | Purpose |
|------|------|---------|
| Landing | `index.html` | Home / entry point |
| Register | `register.html` | Register a car to park |
| Dashboard | `dashboard.html` | View your active parking record |
| Find Blocker | `find-blocker.html` | Find who is blocking you |
| Admin | `admin/login.html` | Admin only — do not surface to students |

---

## Database Structure

### `zones` table
| Column | Type | Notes |
|--------|------|-------|
| id | integer | A=1, B=2, C=3, D=4, E=5, F=6 |
| zone_name | text | "A", "B", "C", "D", "E", "F" |
| total_spots | integer | Always 10 |

### `parked_cars` table
| Column | Type | Notes |
|--------|------|-------|
| id | integer | Auto-increment |
| student_name | text | Full name |
| student_id | text | University student ID |
| phone_number | text | Contact number |
| plate_number | text | Always uppercase |
| zone_id | integer | FK → zones.id |
| spot_number | integer | 1 to 10 |
| arrival_time | timestamptz | Auto-set on insert |
| departure_time | timestamptz | Estimated by student |
| status | text | `"active"` or `"exited"` |

> Only query records where `status=eq.active` for live data.

---

## Chatbot Flows

---

### Flow 1 — Welcome / Main Menu
**Triggers:** chat opened, "hi", "hello", "help", greetings

**Bot message:**
> "Hi! I'm the UniPark Assistant. I can help you with parking at AUST. What would you like to do?"

**Quick reply buttons:**
- Check zone availability
- How do I register my car?
- Check my parking status
- Find who's blocking me
- Something else

---

### Flow 2 — Check Zone Availability
**Triggers:** "availability", "free spots", "where can I park", "which zone", "is there space"

**Step 1 — Bot says:**
> "Let me check the current availability for you..."

**Step 2 — API Call:**
```
GET /parked_cars?select=zone_id&status=eq.active
```
Returns all active records. Count how many records exist per `zone_id`.

**Step 3 — Calculate per zone:**
```
available = 10 - count(records where zone_id = X)
```

**Step 4 — Bot message:**
> "Here's what's available right now:"
> Zone A: X / 10 spots free
> Zone B: X / 10 spots free
> Zone C: X / 10 spots free
> Zone D: X / 10 spots free
> Zone E: X / 10 spots free
> Zone F: X / 10 spots free

**If all zones full:**
> "Unfortunately all zones are currently full. Please check back soon or contact campus security."

**Follow-up button:** [Register my car → register.html]

---

### Flow 3 — How to Register
**Triggers:** "register", "how do I park", "park my car", "new here", "first time"

**Bot message:**
> "To park at AUST, head to the Register page and fill in:"
> - Your full name
> - Your student ID
> - Your phone number
> - Your car plate number
> - The zone and spot number you're parking in
> - Your estimated departure time
>
> "Once registered, you'll get a confirmation with your parking details."

**Button:** [Go to Register Page → register.html]

---

### Flow 4 — Check My Parking Status
**Triggers:** "my parking", "my car", "am I registered", "check my status", "when do I leave", "my spot"

**Step 1 — Bot says:**
> "Sure! What's your car plate number?"

**Step 2 — Capture:** Store input as variable `plate`, convert to UPPERCASE.

**Step 3 — API Call:**
```
GET /parked_cars?select=*,zones(zone_name)&plate_number=eq.{plate}&status=eq.active
```

**If result found:**
> "Found your record! Here are your details:"
> - Name: {student_name}
> - Zone {zone_name}, Spot {spot_number}
> - Arrived: {arrival_time}
> - Estimated departure: {departure_time}

**If not found (empty array):**
> "I couldn't find an active registration for plate **{plate}**. Please double-check the plate number, or register if you haven't yet."
> Buttons: [Register → register.html] [Check Dashboard → dashboard.html]

---

### Flow 5 — Find My Blocker
**Triggers:** "I'm blocked", "can't get out", "who's blocking me", "blocked in", "find blocker"

**Step 1 — Bot says:**
> "I'll help you find who's blocking you. What's your car plate number?"

**Step 2 — Capture:** Store as `my_plate`, convert to UPPERCASE.

**Step 3 — API Call 1 (find my own record):**
```
GET /parked_cars?select=*,zones(zone_name)&plate_number=eq.{my_plate}&status=eq.active
```

**If not found:**
> "No active registration found for **{my_plate}**. You need to be registered to use this feature."
> [Button → register.html]

**If found AND spot_number = 1:**
> "Good news! You're in Spot 1 — the very first spot in Zone {zone_name}. No one can block you. You're free to exit!"

**If found AND spot_number > 1 — API Call 2 (find the car at spot N-1):**
```
GET /parked_cars?select=*&zone_id=eq.{my_zone_id}&spot_number=eq.{my_spot_number - 1}&status=eq.active
```

**If no blocker found:**
> "Your path is clear! No car is parked in front of you at Spot {my_spot_number - 1} in Zone {my_zone_name}. You're free to go."

**If blocker found:**
> "You are blocked by:"
> - Name: **{blocker.student_name}**
> - Plate: **{blocker.plate_number}**
> - Estimated departure: {blocker.departure_time}
> - Phone: {blocker.phone_number}

**Button:** [Call {blocker.phone_number} → tel:{blocker.phone_number}]

---

### Flow 6 — FAQ / General Questions
**Triggers:** unrecognized input, "rules", "help", "question"

**Sub-topics to handle:**
| Question | Answer |
|----------|--------|
| "How many spots per zone?" | "Each zone (A–F) has 10 spots." |
| "How long can I park?" | "You set your own estimated departure time when you register. There's no fixed limit." |
| "I forgot to mark as exited" | "Contact a campus admin — they can update your record from the admin dashboard." |
| "Where is Zone A / B / C?" | "Check with campus security or the parking map posted at the entrance for exact zone locations." |
| "What if my spot is taken?" | "Choose a different spot number when registering. The system checks in real time." |

---

### Flow 7 — Fallback (Catch-All)
**Triggers:** anything the bot doesn't recognize after 2 attempts

**Bot message:**
> "I'm sorry, I didn't understand that. Here's what I can help you with:"
> [Show main menu quick replies again]

---

## Voiceflow Implementation Notes

- **API Blocks:** Use for all Supabase calls. Method = GET. Add the two headers (`apikey`, `Authorization`) as key-value pairs in the Headers section.
- **Set Variable Blocks:** Store `plate`, `zone_id`, `spot_number`, `departure_time`, `student_name`, `phone_number` from API responses.
- **Condition Blocks:** Branch on:
  - Response array length = 0 → not found
  - `spot_number` = 1 → no blocker possible
  - Blocker call response length = 0 → path clear
- **Capture Blocks:** Use to collect plate number input from user. Apply an uppercase transform.
- **Button Blocks:** For page redirects, use the URL as the button action. For phone calls, use `tel:{phone_number}`.
- **Intent Training:** Add at least 5–8 example phrases per flow so Voiceflow's NLU recognizes them reliably.

---

## Embed Integration (once chatbot is published)

Voiceflow will provide a JavaScript snippet like:
```html
<script type="text/javascript">
  (function(d, t) { ... })(document, 'script');
</script>
```
This snippet gets added to all UniPark HTML pages just before the closing `</body>` tag. The chatbot will appear as a floating button in the bottom-right corner of every page.
