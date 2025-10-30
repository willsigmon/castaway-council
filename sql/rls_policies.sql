-- Enable RLS on all tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE confessionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_members ENABLE ROW LEVEL SECURITY;

-- Helper function to get current player_id from auth
CREATE OR REPLACE FUNCTION auth.player_id()
RETURNS uuid AS $$
  SELECT id FROM players WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Messages RLS
-- Tribe: only members can read/write
CREATE POLICY "tribe_messages_select"
  ON messages FOR SELECT
  USING (
    channel_type = 'tribe' AND
    EXISTS (
      SELECT 1 FROM tribe_members tm
      WHERE tm.tribe_id = messages.tribe_id
      AND tm.player_id = auth.player_id()
    )
  );

CREATE POLICY "tribe_messages_insert"
  ON messages FOR INSERT
  WITH CHECK (
    channel_type = 'tribe' AND
    from_player_id = auth.player_id() AND
    EXISTS (
      SELECT 1 FROM tribe_members tm
      WHERE tm.tribe_id = messages.tribe_id
      AND tm.player_id = auth.player_id()
    )
  );

-- DM: only participants can read/write
CREATE POLICY "dm_messages_select"
  ON messages FOR SELECT
  USING (
    channel_type = 'dm' AND
    (from_player_id = auth.player_id() OR to_player_id = auth.player_id())
  );

CREATE POLICY "dm_messages_insert"
  ON messages FOR INSERT
  WITH CHECK (
    channel_type = 'dm' AND
    from_player_id = auth.player_id() AND
    to_player_id IS NOT NULL
  );

-- Public: all season participants can read; authenticated can write
CREATE POLICY "public_messages_select"
  ON messages FOR SELECT
  USING (
    channel_type = 'public' AND
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.season_id = messages.season_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "public_messages_insert"
  ON messages FOR INSERT
  WITH CHECK (
    channel_type = 'public' AND
    from_player_id = auth.player_id()
  );

-- Votes RLS
-- Voter can read own vote before reveal
CREATE POLICY "votes_select_own"
  ON votes FOR SELECT
  USING (
    voter_player_id = auth.player_id() AND
    revealed_at IS NULL
  );

-- After reveal, all season participants can read tallies
CREATE POLICY "votes_select_revealed"
  ON votes FOR SELECT
  USING (
    revealed_at IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.season_id = votes.season_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "votes_insert"
  ON votes FOR INSERT
  WITH CHECK (voter_player_id = auth.player_id());

-- Confessionals RLS
CREATE POLICY "confessionals_select_private"
  ON confessionals FOR SELECT
  USING (
    visibility = 'private' AND
    player_id = auth.player_id()
  );

CREATE POLICY "confessionals_select_postseason"
  ON confessionals FOR SELECT
  USING (
    visibility = 'postseason' AND
    EXISTS (
      SELECT 1 FROM seasons s
      JOIN players p ON p.season_id = s.id
      WHERE p.id = confessionals.player_id
      AND s.status = 'complete'
    )
  );

CREATE POLICY "confessionals_insert"
  ON confessionals FOR INSERT
  WITH CHECK (player_id = auth.player_id());

-- Players: can read own and season peers (not eliminated status before reveal)
CREATE POLICY "players_select_own"
  ON players FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "players_select_season"
  ON players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.season_id = players.season_id
      AND p.user_id = auth.uid()
    )
  );

-- Tribe members: can read if member of tribe or season participant
CREATE POLICY "tribe_members_select"
  ON tribe_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM players p
      JOIN tribes t ON t.season_id = p.season_id
      WHERE t.id = tribe_members.tribe_id
      AND p.user_id = auth.uid()
    )
  );
