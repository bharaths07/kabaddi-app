# Core Objects of SportSync

This document outlines the 6 foundational objects that power the application's nation-scale data structure.

## 1. Player
Represents an individual athlete.
- **Role**: Tracks personal statistics, match history, and performance across different sports.
- **Key Relationships**: Belongs to an Institution, member of Teams, linked to a User account.

## 2. Team
Represents a group of players competing together.
- **Role**: The primary unit for match participation in team sports.
- **Key Relationships**: Composed of Players, represents an Institution, participates in Matches.

## 3. Match
Represents a competitive event between two entities (teams or players).
- **Role**: The central event for live scoring, result generation, and history tracking.
- **Key Relationships**: Involves Participants (Teams/Players), governed by a Sport, managed by Officials.

## 4. Sport
Represents the discipline and its configuration.
- **Role**: Defines the rules, scoring structure, and format (team vs. individual) for matches.
- **Key Relationships**: Configures Matches, categorizes Teams and Players.

## 5. Institution
Represents a school, college, academy, or club.
- **Role**: The organizational entity that verifies players and teams.
- **Key Relationships**: Validates Players, owns Teams, organizes Tournaments.

## 6. Achievement
Represents a recognition or award.
- **Role**: Validates success through certificates, medals, or trophies.
- **Key Relationships**: Awarded to Players or Teams, linked to specific Matches or Tournaments.
