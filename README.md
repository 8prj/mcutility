# DonutSMP Mod Downloads

A full-stack Minecraft mod download website for a Fabric mod designed for DonutSMP (client-side). The mod allows players to display fake /pay commands and a fake /bal (balance) on DonutSMP.

## Features

- **Public Download Page**: Display mod info, version, and download button
- **Installation Guide**: Step-by-step instructions for installing the mod
- **Comments System**: User reviews with admin moderation
- **Admin Panel**: Secure admin dashboard for managing mod info and comments
- **File Upload**: Admin can upload new .jar mod files
- **Minecraft Theme**: Dark theme with pixel fonts and creeper-green accents

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Styling**: TailwindCSS with custom Minecraft-themed CSS variables
- **Font**: Press Start 2P (Google Fonts)

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Install frontend dependencies (from root directory):
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
VITE_API_URL=http://localhost:3001/api
```

## Admin Access

- **Admin Login**: `/admin`
- **Password**: `090485`
- **Admin Dashboard**: `/admin/dashboard`

## Project Structure

```
Mc-utilitys-main/
├── server/
│   ├── server.js          # Express backend with SQLite
│   ├── uploads/           # Directory for uploaded .jar files
│   ├── package.json        # Backend dependencies
│   └── database.sqlite     # SQLite database (auto-created)
├── src/
│   ├── components/         # React components (Header, Footer)
│   ├── lib/
│   │   └── api.ts          # API client functions
│   ├── pages/              # Page components (HomePage, Admin pages)
│   ├── App.tsx             # Main app with routing
│   └── index.css           # Global styles with CSS variables
├── index.html              # HTML entry point
├── package.json            # Frontend dependencies
└── vite.config.ts         # Vite configuration
```

## API Endpoints

### Public Routes
- `GET /api/mod-info` - Get mod information
- `GET /api/comments` - Get approved comments
- `POST /api/comments` - Submit a new comment (goes to moderation)
- `POST /api/login` - Admin login

### Admin Routes (requires authentication)
- `GET /api/admin/comments` - Get all comments (pending + approved)
- `PUT /api/admin/comments/:id` - Update comment status
- `DELETE /api/admin/comments/:id` - Delete a comment
- `PUT /api/admin/mod-info` - Update mod information
- `POST /api/admin/upload-mod` - Upload a new .jar mod file

## Security Features

- Admin routes protected with token-based authentication
- XSS sanitization for all user-submitted comments
- File upload validation (only .jar files allowed)
- File size limit (10MB max)
- CORS enabled for development

## Building for Production

1. Build the frontend:
```bash
npm run build
```

2. The Express backend will serve the built React app from the `dist` directory

## License

This project is for the DonutSMP community. Not affiliated with Mojang or DonutSMP.
