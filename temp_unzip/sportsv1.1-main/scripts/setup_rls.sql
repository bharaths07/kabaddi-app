-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scorers ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view all profiles, but only edit their own
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Teams: Public read, Authenticated create, Creator update
CREATE POLICY "Teams are viewable by everyone" 
ON teams FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create teams" 
ON teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Team admins can update their teams" 
ON teams FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM jsonb_array_elements(members) as member
    WHERE (member->>'playerId')::uuid = auth.uid() 
    AND (member->>'role') IN ('captain', 'vice-captain', 'admin')
  )
);

-- Matches: Public read, Scorer/Creator update
CREATE POLICY "Matches are viewable by everyone" 
ON matches FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create matches" 
ON matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Match creators and scorers can update matches" 
ON matches FOR UPDATE USING (
  auth.uid() = created_by_user_id 
  OR 
  EXISTS (
    SELECT 1 FROM match_scorers 
    WHERE match_id = matches.id 
    AND user_id = auth.uid()
  )
);

-- Tournaments: Public read, Organizer update
CREATE POLICY "Tournaments are viewable by everyone" 
ON tournaments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tournaments" 
ON tournaments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Tournament organizers can update" 
ON tournaments FOR UPDATE USING (auth.uid() = created_by_user_id);

-- Match Scorers: Public read, Creator manage
CREATE POLICY "Scorers list is viewable by everyone" 
ON match_scorers FOR SELECT USING (true);

CREATE POLICY "Match creators can add scorers" 
ON match_scorers FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM matches 
    WHERE id = match_id 
    AND created_by_user_id = auth.uid()
  )
);

CREATE POLICY "Match creators can remove scorers" 
ON match_scorers FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM matches 
    WHERE id = match_id 
    AND created_by_user_id = auth.uid()
  )
);
