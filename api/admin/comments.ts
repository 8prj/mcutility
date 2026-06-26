import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize comments.json if it doesn't exist
if (!fs.existsSync(COMMENTS_FILE)) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify([], null, 2));
}

function readComments() {
  const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
  return JSON.parse(data);
}

function writeComments(data) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data, null, 2));
  return data;
}

const ADMIN_TOKEN = 'admin-session-token';

function verifyAuth(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  // Verify admin authentication
  if (!verifyAuth(req, res)) {
    return;
  }

  if (req.method === 'GET') {
    try {
      const comments = readComments().sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read comments' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { status } = req.body;
      
      const comments = readComments();
      const commentIndex = comments.findIndex(c => c.id === id);
      
      if (commentIndex !== -1) {
        comments[commentIndex].status = status;
        writeComments(comments);
        res.status(200).json(comments[commentIndex]);
      } else {
        res.status(404).json({ error: 'Comment not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update comment' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const comments = readComments();
      const filteredComments = comments.filter(c => c.id !== id);
      writeComments(filteredComments);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
