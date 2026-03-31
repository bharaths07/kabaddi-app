# Development-Only Authentication Bypass

This feature allows developers to temporarily disable the authentication/login system in non-production environments. It automatically authenticates a default developer account, preserves existing auth guards and routes, and adds visible indicators in the UI.

## Enable in Development

- Create a `.env.development.local` file in the project root (ignored by Vite for prod builds).
- Add:
  - `VITE_AUTH_BYPASS=true`

Start the dev server:
```
npm run dev
```

## Behavior

- In non-production modes (`!import.meta.env.PROD`) and when `VITE_AUTH_BYPASS=true`:
  - The app logs a warning: `[Auth] Authentication BYPASS active (non-production mode)`
  - A default developer user is set: `dev@local`
  - A yellow “Auth Bypass” badge appears in the top navbar
  - Route guards and middleware remain intact, as `currentUser` is populated

## Disable

- Remove `VITE_AUTH_BYPASS` or set it to `false`
- Restart the dev server

## Production Safety

- The bypass never activates when `import.meta.env.PROD` is `true`

## Notes

- The bypass only affects session initialization; all auth flows and routes remain unchanged
- Useful for UI development and test environments where sign-in is not required

