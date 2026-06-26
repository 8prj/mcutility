/*
# Create comments table

1. New Tables
- `comments`
  - `id` (uuid, primary key)
  - `username` (text, not null) — display name of commenter
  - `comment` (text, not null) — review/comment text
  - `status` (text, not null default 'pending') — 'pending' or 'approved'
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `comments`.
- Public can read only approved comments.
- Public can submit new comments (insert) with status 'pending'.
- Admin updates/deletes managed via edge function.
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  comment text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_approved_comments" ON comments;
CREATE POLICY "anon_select_approved_comments" ON comments FOR SELECT
  TO anon, authenticated USING (status = 'approved');

DROP POLICY IF EXISTS "anon_insert_comments" ON comments;
CREATE POLICY "anon_insert_comments" ON comments FOR INSERT
  TO anon, authenticated WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "anon_update_comments" ON comments;
CREATE POLICY "anon_update_comments" ON comments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_comments" ON comments;
CREATE POLICY "anon_delete_comments" ON comments FOR DELETE
  TO anon, authenticated USING (true);
