import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sanitizeHtml from 'sanitize-html';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/downloads', express.static(path.join(__dirname, 'uploads')));

// JSON file storage
const DATA_DIR = path.join(__dirname, 'data');
const MOD_INFO_FILE = path.join(DATA_DIR, 'mod-info.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

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

// Initialize comments.json if it doesn't exist
if (!fs.existsSync(COMMENTS_FILE)) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify([], null, 2));
}

// Helper functions for JSON storage
function readModInfo() {
  const data = fs.readFileSync(MOD_INFO_FILE, 'utf8');
  return JSON.parse(data);
}

function writeModInfo(data) {
  data.updated_at = new Date().toISOString();
  fs.writeFileSync(MOD_INFO_FILE, JSON.stringify(data, null, 2));
  return data;
}

function readComments() {
  const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
  return JSON.parse(data);
}

function writeComments(data) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data, null, 2));
  return data;
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'donutsmp-mod-' + uniqueSuffix + '.jar');
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/java-archive' || file.originalname.endsWith('.jar')) {
      cb(null, true);
    } else {
      cb(new Error('Only .jar files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Admin password
const ADMIN_PASSWORD = '090485';
const ADMIN_TOKEN = 'admin-session-token';

// Helper function to verify admin token
function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Public routes

// Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Get mod info
app.get('/api/mod-info', (req, res) => {
  const modInfo = readModInfo();
  res.json(modInfo);
});

// Get approved comments
app.get('/api/comments', (req, res) => {
  const comments = readComments().filter(c => c.status === 'approved').sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
  res.json(comments);
});

// Submit comment
app.post('/api/comments', (req, res) => {
  const { username, comment } = req.body;
  
  if (!username || !comment) {
    return res.status(400).json({ error: 'Username and comment are required' });
  }

  // Sanitize comment to prevent XSS
  const sanitizedUsername = sanitizeHtml(username.trim(), { allowedTags: [], allowedAttributes: {} });
  const sanitizedComment = sanitizeHtml(comment.trim(), { 
    allowedTags: [], 
    allowedAttributes: {} 
  });

  const comments = readComments();
  const newComment = {
    id: Date.now().toString(),
    username: sanitizedUsername,
    comment: sanitizedComment,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  comments.push(newComment);
  writeComments(comments);
  
  res.json(newComment);
});

// Admin routes (protected)

// Get all comments
app.get('/api/admin/comments', verifyAuth, (req, res) => {
  const comments = readComments().sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
  res.json(comments);
});

// Update comment status
app.put('/api/admin/comments/:id', verifyAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const comments = readComments();
  const commentIndex = comments.findIndex(c => c.id === id);
  
  if (commentIndex !== -1) {
    comments[commentIndex].status = status;
    writeComments(comments);
    res.json(comments[commentIndex]);
  } else {
    res.status(404).json({ error: 'Comment not found' });
  }
});

// Delete comment
app.delete('/api/admin/comments/:id', verifyAuth, (req, res) => {
  const { id } = req.params;
  const comments = readComments();
  const filteredComments = comments.filter(c => c.id !== id);
  writeComments(filteredComments);
  res.json({ success: true });
});

// Update mod info
app.put('/api/admin/mod-info', verifyAuth, (req, res) => {
  const { name, description, version, install_instructions } = req.body;
  
  const modInfo = readModInfo();
  modInfo.name = name;
  modInfo.description = description;
  modInfo.version = version;
  modInfo.install_instructions = install_instructions;
  
  const updated = writeModInfo(modInfo);
  res.json(updated);
});

// Upload mod file
app.post('/api/admin/upload-mod', verifyAuth, upload.single('modFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const downloadUrl = `/downloads/${req.file.filename}`;
  
  // Update mod_info with new download URL
  const modInfo = readModInfo();
  modInfo.download_url = downloadUrl;
  writeModInfo(modInfo);
  
  res.json({ downloadUrl, filename: req.file.filename });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
