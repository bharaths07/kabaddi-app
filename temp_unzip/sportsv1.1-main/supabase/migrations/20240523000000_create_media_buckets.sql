-- Create storage buckets for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('player-photos', 'player-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('match-highlights', 'match-highlights', true);

-- Allow public access to read files
CREATE POLICY "Public Access Photos" ON storage.objects FOR SELECT USING ( bucket_id = 'player-photos' );
CREATE POLICY "Public Access Highlights" ON storage.objects FOR SELECT USING ( bucket_id = 'match-highlights' );

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated Upload Photos" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'player-photos' AND auth.role() = 'authenticated' );
CREATE POLICY "Authenticated Upload Highlights" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'match-highlights' AND auth.role() = 'authenticated' );

-- Allow owners to delete their own files (assuming owner is path prefix or metadata)
-- For simplicity in this MVP, we allow authenticated delete for now, but in prod refine this
CREATE POLICY "Authenticated Delete Photos" ON storage.objects FOR DELETE USING ( bucket_id = 'player-photos' AND auth.role() = 'authenticated' );
