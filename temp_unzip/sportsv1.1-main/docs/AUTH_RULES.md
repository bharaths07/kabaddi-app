# Authentication Flow Rules (Step 17)

## 🎯 Goal
Authentication exists to:
- **Identify who is responsible** for actions
- **Protect match integrity**
- **Attach achievements & certificates** to real users

**Authentication is NOT for restricting viewing.**

## 1️⃣ When is Login REQUIRED?
Login is required **only when user wants to act**.

| Action | Login Required? |
|--------|----------------|
| Creating a match | ✅ YES |
| Live scoring a match | ✅ YES |
| Ending a match | ✅ YES |
| Downloading own certificates | ✅ YES |
| Viewing matches | ❌ NO |
| Viewing feed/news | ❌ NO |
| Viewing player profiles | ❌ NO |
| Viewing team pages | ❌ NO |

*This keeps onboarding friction low.*

## 2️⃣ How Login Appears (UX Rule)
**There is no forced login screen.**

**Flow:**
1. User clicks an action (e.g., "Create Match")
2. If not logged in → Show simple message: "Login required to create a match"
3. Show login options
4. **No redirect loops.**

## 3️⃣ Login Method (MVP)
Use **one simple method**:
- Phone number OR
- Google sign-in

**Do NOT add:**
- ❌ Username/password
- ❌ Multiple providers
- ❌ OTP complexity (beyond basic)

**Why:** Fast, Trusted, Low friction.

## 4️⃣ User Identity After Login
System knows:
- User ID
- Name
- Role (Contextual)

**Important**: One user can have **multiple roles** depending on the match. Role is **contextual**, not global.

## 5️⃣ Logout Behavior
- Does not delete data
- Does not affect matches already created
- Only removes ability to act
- **Viewing is still allowed.**

## 6️⃣ Permission Failure Handling
If user opens a protected route without permission:
- Show **friendly message**: "You don’t have permission to do this."
- **Do NOT**:
  - ❌ Redirect silently
  - ❌ Show blank screen

## 🔒 Locked Status
Authentication is now:
- **Minimal**
- **Action-based**
- **User-friendly**
- **MVP-safe**
