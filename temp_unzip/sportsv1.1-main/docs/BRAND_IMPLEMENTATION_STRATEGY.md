# Brand Implementation Strategy: Play Legends

## 1. Brand Identity Overview

**App Name:** Play Legends  
**Tagline:** Your Game Matters  
**Primary Color Palette:**

- **Core:** Slate-900 (Dark/Professional)
- **Accent:** Red-600 to Orange-400 Gradients (Energy/Passion)
- **Success:** Green-600 (Verification/Results)

## 2. Implementation Status

### Completed

- **Global Logo Replacement:** `/logo1.png` is now the standard logo asset.
- **Login Screens:** `DualPanelLoginScreen` and `OtpVerificationScreen` fully branded with "Play Legends" and "Your Game Matters".
- **Page Titles:** `index.html` updated to "Play Legends".
- **Generated Content:**
  - Match Posters now export as `PlayLegends_Poster_...`
  - Certificates allow verification by "Play Legends".
  - Share links refer to "Play Legends".

### Pending / In-Progress

- **Domain Migration:** URL structure still reflects development environment.
- **Email Templates:** Supabase Auth emails need to be updated in the Supabase Dashboard to say "Play Legends".
- **Legal Docs:** Terms of Service and Privacy Policy need to be updated with the new legal entity name if changed.

## 3. UI/UX Consistency Guidelines

- **Typography:** Inter (Sans-serif) for UI, occasional Serif for "Classic" certificates.
- **Iconography:** Lucide-React icons used throughout.
- **Feedback:**
  - Errors: Red-50 background, Red-600 text.
  - Success: Green-50 background, Green-600 text.
- **Layouts:**
  - **Auth:** Split screen (Left: Function, Right: Brand/Emotion).
  - **Dashboard:** Clean, white background, top navigation.

## 4. Rollout Plan

1.  **Phase 1 (Codebase):** Update all hardcoded strings (Completed).
2.  **Phase 2 (Assets):** Ensure `logo1.png` is high-res and optimized (Verified).
3.  **Phase 3 (External):** Update Supabase Email Templates and SMS Templates (Action Required by Admin).
4.  **Phase 4 (Store):** Update App Store / Play Store listings with "Play Legends" assets.

## 5. Technical Debt & Cleanup

- `localStorage` keys currently use `scoreheroes_` prefix. **Decision:** Keep as-is to preserve user preferences during the transition. Migrate in v2.0 if needed.
- Internal variable names (e.g., `scoreEngine`) are generic and safe.
