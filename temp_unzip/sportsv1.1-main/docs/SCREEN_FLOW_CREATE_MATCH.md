# Screen Flow: Create Match (Screen 2)

This document defines the requirements for the Create Match Screen, focusing on speed and simplicity.

## 🎯 Goal
A user should be able to create a match in **under 60 seconds**.
- No thinking.
- No form fatigue.

## Step-by-Step Flow (Single Screen)

### 1️⃣ Choose Sport
- **Options:** Cricket / Football / Kabaddi
- **Default:** Cricket (highlighted)
- **Why First?** Sport defines all subsequent rules.

### 2️⃣ Select Teams
- **Inputs:**
  - Team A (Text input or Select)
  - Team B (Text input or Select)
- **MVP Rule:** Typing a new team name is allowed. No separate team creation flow required.

### 3️⃣ Select Institution (Optional)
- **Inputs:** School / College Name (Search or Type)
- **Logic:** City auto-attached if possible.
- **Importance:** Improves discovery but is **NOT required** for creation.

### 4️⃣ Assign Scorer
- **Default:** You (Match Creator)
- **Option:** Select another user.
- **MVP Rule:** If no other user selected -> Auto-assign self.

### 5️⃣ Create Match Button
- **Label:** "Create Match"
- **Action:**
  1.  Match created in `Draft` state.
  2.  Redirect **immediately** to Live Scoring screen.
- **Constraint:** No confirmation popup.

## 🚫 MUST NOT Have (MVP)
To ensure speed, the following are explicitly excluded:
- ❌ Date/time picker
- ❌ Overs selection
- ❌ Tournament selection
- ❌ Player stats inputs
- ❌ Advanced settings

## Empty State & Error Handling
- **No Teams?** Allow typing new names immediately.
- **No Institution?** Allow skip.
- **No Scorer?** Auto-assign self.
- **Principle:** Never block creation.

## Success Criteria
- A first-time user creates a match without help.
- No explanation text is needed.
