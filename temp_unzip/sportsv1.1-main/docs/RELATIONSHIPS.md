# Official Object Relationships

These are the correct, production-safe definitions for the SportSync platform.

## 1. Player ↔ Team
**Relationship:** A player can belong to multiple teams over time. A team cannot exist without players.
**Why:** Students change teams every year. History must stay.

## 2. Team ↔ Match
**Relationship:** A match always has exactly two teams (MVP rule). A team can play unlimited matches.
**Why:** Keeps scoring logic simple. Multi-team formats come later.

## 3. Player ↔ Match
**Relationship:** A player can exist without any match (new users). A match cannot exist without players.
**Why:** Profiles come before activity. Matches are meaningless without participants.

## 4. Match ↔ Sport
**Relationship:** A match belongs to exactly one sport. Sport defines scoring rules.
**Why:** No mixed rules. Clean scoring engines.

## 5. Player ↔ Institution
**Relationship:** A player may change institution. History never resets.
**Why:** School → college transition. National identity.

## 6. Achievement ↔ Player / Match
**Relationship:** Achievements are always tied to a match. One match can generate many achievements. Achievements never exist alone.
**Why:** Prevents fake records. Builds trust.
