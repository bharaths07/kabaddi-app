# Certificate Rules (MVP)

This document defines the rules for certificate generation and management in the MVP phase of SportSync.

## 🎯 Purpose
Certificates provide recognition and proof of participation/performance, increasing the emotional value of the app. They are not legal documents in MVP.

## 1️⃣ Generation Trigger
**Rule:** Certificates are generated **automatically** when the Match state becomes `Completed`.
**Constraint:** Never generated during `Live` or before a result is declared.

## 2️⃣ Recipients & Types
**Rule:** Only two types of certificates are generated:
1.  **Participation Certificate**: For ALL players who participated.
2.  **Performance Certificate**: For top performers (e.g., Player of the Match).
**Constraint:** No bulk certificates.

## 3️⃣ Eligibility Logic
**Rule:** The **System decides automatically** based on match data.
**Why:** Prevents favoritism, avoids disputes, and ensures a faster UX.
**Constraint:** No manual selection by users in MVP.

## 4️⃣ Validity Requirements
A certificate is considered valid in MVP if it displays:
- Player Name
- Match Name
- Sport
- Date
- Organizer / Scorer Name
**Constraint:** No QR codes or digital signatures yet.

## 5️⃣ User Actions
**Allowed:**
- View certificate
- Download PDF
**Not Allowed:**
- Sharing (social media integration)
- Emailing
- Third-party verification
