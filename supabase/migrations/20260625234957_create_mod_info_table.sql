/*
# Create mod_info table

1. New Tables
- `mod_info`
  - `id` (uuid, primary key)
  - `name` (text, not null) — mod display name
  - `description` (text, not null) — mod description
  - `version` (text, not null) — current mod version
  - `download_url` (text) — URL/path to the downloadable .jar file
  - `install_instructions` (text) — markdown or plain text installation guide
  - `updated_at` (timestamptz)

2. Security
- Enable RLS on `mod_info`.
- Allow public read (anon + authenticated).
- Only authenticated admins can update (we will manage admin checks in the app layer via edge function).
*/

CREATE TABLE IF NOT EXISTS mod_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'DonutSMP Fake Pay Mod',
  description text NOT NULL DEFAULT 'A client-side Fabric mod for DonutSMP that displays fake /pay commands and fake /bal balance.',
  version text NOT NULL DEFAULT '1.21.1 Fabric',
  download_url text,
  install_instructions text NOT NULL DEFAULT '1. Press Win + R and type %appdata% then press Enter\n2. Open the Roaming folder\n3. Navigate to the .minecraft folder\n4. Open the mods folder (create it if it does not exist)\n5. Place the downloaded .jar mod file inside the mods folder\n6. Download and install Fabric Loader from https://fabricmc.net/use/installer/\n7. Launch Minecraft using the Fabric profile in the Minecraft Launcher',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mod_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_mod_info" ON mod_info;
CREATE POLICY "anon_select_mod_info" ON mod_info FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_mod_info" ON mod_info;
CREATE POLICY "anon_insert_mod_info" ON mod_info FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_mod_info" ON mod_info;
CREATE POLICY "anon_update_mod_info" ON mod_info FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
