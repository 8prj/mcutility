import fs from 'fs';
import path from 'path';
import sanitizeHtml from 'sanitize-html';

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

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const comments = readComments().filter(c => c.status === 'approved').sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read comments' });
    }
  } else if (req.method === 'POST') {
    try {
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
      
      res.status(200).json(newComment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit comment' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
