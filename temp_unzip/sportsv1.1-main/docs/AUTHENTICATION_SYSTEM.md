# Authentication System Documentation

## Overview
Play Legends uses a secure, production-ready authentication system built on **Supabase Auth**. It supports:
1.  **Phone Number Authentication (OTP)**: Primary method for users.
2.  **Email/Password Authentication**: Secondary method.
3.  **Guest Access**: Limited read-only access.

---

## 1. Core Requirements Implementation

### 1.1 Secure User Registration
*   **Validation**: Phone numbers are validated using Regex `^[0-9]{10,15}$` on the client side before submission.
*   **Duplicate Prevention**: Supabase Auth automatically handles unique constraints on phone numbers and emails.
*   **Error Handling**: UI displays user-friendly error messages mapped from backend responses (e.g., "Invalid OTP", "Rate limit exceeded").

### 1.2 OTP Authentication
*   **Provider**: Supabase Auth handles the SMS gateway integration (configurable to Twilio, MessageBird, etc.).
*   **Flow**:
    1.  User enters phone number -> `loginWithPhone(phone)`
    2.  Supabase generates 6-digit OTP -> Sends via SMS provider.
    3.  User enters OTP -> `verifyOtp(phone, token)`
    4.  Session created -> JWT token returned.

### 1.3 Login System
*   **Session Management**: Supabase Client SDK manages persistent sessions (local storage) and auto-refreshing of JWTs.
*   **Rate Limiting**: Supabase enforces rate limits on OTP requests (default: 30 per hour).
*   **JWT**: Access tokens are standard JWTs signed by Supabase, containing user role and metadata.

### 1.4 Team Creation
*   **Access Control**: Row Level Security (RLS) policies ensure only authenticated users can create teams.
*   **Policy**: `create policy "Authenticated users can create teams" on public.teams for insert with check (auth.role() = 'authenticated');`

---

## 2. API Specification (Supabase)

### 2.1 Endpoints (Client SDK)

#### `auth.signInWithOtp`
*   **Purpose**: Initiate phone login.
*   **Parameters**: `{ phone: string }`
*   **Response**: `{ error: AuthError | null }`

#### `auth.verifyOtp`
*   **Purpose**: Verify SMS code.
*   **Parameters**: `{ phone: string, token: string, type: 'sms' }`
*   **Response**: `{ data: { session: Session, user: User }, error: null }`

#### `auth.signOut`
*   **Purpose**: Terminate session.
*   **Response**: `{ error: null }`

---

## 3. Security Architecture

### 3.1 HTTPS & Encryption
*   All communication with Supabase APIs is enforced over **HTTPS (TLS 1.2+)**.
*   Data at rest is encrypted by Supabase (PostgreSQL).

### 3.2 Input Sanitization
*   React handles basic XSS protection.
*   Supabase Client sanitizes inputs before sending to the database.
*   RLS policies prevent unauthorized data modification.

### 3.3 Audit Logging
*   Supabase Auth Logs track all sign-in, sign-up, and password recovery events.
*   Custom application logs (e.g., team creation) can be added to a dedicated `audit_logs` table if required.

---

## 4. Deployment & Configuration

### 4.1 Environment Variables
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4.2 SMS Provider Setup (Supabase Dashboard)
1.  Go to **Authentication > Providers > Phone**.
2.  Enable **Phone Provider**.
3.  Select SMS Provider (e.g., Twilio).
4.  Enter **Account SID**, **Auth Token**, and **Message Service SID**.
5.  Save.

### 4.3 Database Policies
Ensure the RLS policies are applied (see `fix_teams_rls_safe.sql`).

---

## 5. Testing

### 5.1 Unit Tests
*   Located in `src/test/auth.test.ts`.
*   Run with `npm test`.

### 5.2 Manual Verification
1.  Go to `/login`.
2.  Enter valid phone number (e.g., `9876543210`).
3.  Receive OTP (or use mock `123456` in dev).
4.  Verify redirect to Dashboard.
