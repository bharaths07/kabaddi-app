# Manual Smoke Test — MVP Happy Path

## 1. Fresh Install
- Clear localStorage
- Reload app
- Expect: no crashes, empty states visible

## 2. Authentication
- Sign up / log in
- Refresh page
- Expect: user still logged in

## 3. Team Creation
- Create Team A with players
- Create Team B with players
- Expect: teams appear in Teams list

## 4. Match Creation
- Create match between Team A and Team B
- Expect:
  - match appears in Matches list
  - current user is match creator

## 5. Scoring Permissions
- Open match as creator
- Expect: scoring screen accessible
- Open same match as non-creator (if possible)
- Expect: access denied

## 6. Live Scoring
- Start match
- Add a few scoring events
- Expect: feed item created (match started)

## 7. End Match
- End the match
- Expect:
  - match marked completed
  - player stats exist
  - certificates created for real players
  - feed item created (match completed)

## 8. Persistence
- Refresh page
- Expect:
  - match still completed
  - feed still visible
  - certificates still present

## 9. Certificates
- Open My Certificates
- Expect: certificates visible for current user

## 10. Pass / Fail
- If any step fails → DO NOT RELEASE
- If all pass → MVP is shippable
