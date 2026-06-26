import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

const DATA_DIR = path.join(process.cwd(), 'data');
const MOD_INFO_FILE = path.join(DATA_DIR, 'mod-info.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize mod-info.json if it doesn't exist
if (!fs.existsSync(MOD_INFO_FILE)) {
  const initialModInfo = {
    id: 1,
    name: 'DonutSMP Fake Pay Mod',
    description: 'A client-side Fabric mod for DonutSMP that displays fake /pay commands and fake /bal balance. Safe to use on DonutSMP — completely client-side.',
    version: '1.21.1 Fabric',
    download_url: null,
    install_instructions: '1. Press Win + R and type %appdata% then press Enter\n2. Open the Roaming folder\n3. Navigate to the .minecraft folder\n4. Open the mods folder (create it if it does not exist)\n5. Place the downloaded .jar mod file inside the mods folder\n6. Download and install Fabric Loader from https://fabricmc.net/use/installer/\n7. Launch Minecraft using the Fabric profile in the Minecraft Launcher',
    updated_at: new Date().toISOString()
  };
  fs.writeFileSync(MOD_INFO_FILE, JSON.stringify(initialModInfo, null, 2));
}

function readModInfo() {
  const data = fs.readFileSync(MOD_INFO_FILE, 'utf8');
  return JSON.parse(data);
}

function writeModInfo(data) {
  data.updated_at = new Date().toISOString();
  fs.writeFileSync(MOD_INFO_FILE, JSON.stringify(data, null, 2));
  return data;
}

const ADMIN_TOKEN = 'admin-session-token';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Verify admin authentication
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    
    const [fields, files] = await form.parse(req);
    const file = files.modFile?.[0];
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file and upload to Vercel Blob
    const fileBuffer = fs.readFileSync(file.filepath);
    
    const blob = await put(`donutsmp-mod-${Date.now()}.jar`, fileBuffer, {
      access: 'public',
      contentType: 'application/java-archive',
    });

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    // Update mod_info with new download URL
    const modInfo = readModInfo();
    modInfo.download_url = blob.url;
    writeModInfo(modInfo);
    
    res.status(200).json({ downloadUrl: blob.url, filename: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}

