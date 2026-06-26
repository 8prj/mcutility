/*
# Seed mod_info with initial data

Inserts a single row into mod_info if the table is empty.
*/

INSERT INTO mod_info (name, description, version, download_url, install_instructions)
SELECT 'DonutSMP Fake Pay Mod',
       'A client-side Fabric mod for DonutSMP that displays fake /pay commands and fake /bal balance. Safe to use on DonutSMP — completely client-side.',
       '1.21.1 Fabric',
       null,
       '1. Press Win + R and type %appdata% then press Enter
2. Open the Roaming folder
3. Navigate to the .minecraft folder
4. Open the mods folder (create it if it does not exist)
5. Place the downloaded .jar mod file inside the mods folder
6. Download and install Fabric Loader from https://fabricmc.net/use/installer/
7. Launch Minecraft using the Fabric profile in the Minecraft Launcher'
WHERE NOT EXISTS (SELECT 1 FROM mod_info);
