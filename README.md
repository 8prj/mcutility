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
- **Backend**: Vercel Serverless Functions
- **Storage**: Vercel Blob Storage (for .jar files) + JSON files (for data)
- **Styling**: TailwindCSS with custom Minecraft-themed CSS variables
- **Font**: Press Start 2P (Google Fonts)
- **Deployment**: Vercel

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Setup

1. Install dependencies:
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
VITE_API_URL=/api
```

## Deployment on Vercel

### Prerequisites

1. Push your code to GitHub
2. Create a Vercel account at https://vercel.com
3. Install Vercel CLI: `npm i -g vercel`

### Deployment Steps

1. **Deploy to Vercel:**
```bash
vercel
```

2. **Set up Vercel Blob Storage:**
- Go to your Vercel project dashboard
- Navigate to Storage → Blob
- Create a new Blob store
- Copy the `BLOB_READ_WRITE_TOKEN` from your environment variables

3. **Add environment variables in Vercel:**
- Go to your project settings → Environment Variables
- Add: `BLOB_READ_WRITE_TOKEN` (from step 2)

4. **Redeploy:**
```bash
vercel --prod
```

## Admin Access

- **Admin Login**: `/admin`
- **Password**: `090485`
- **Admin Dashboard**: `/admin/dashboard`

## Project Structure

```
Mc-utilitys-main/
├── api/
│   ├── login.ts            # Admin login endpoint
│   ├── mod-info.ts         # Mod info CRUD
│   ├── comments.ts         # Public comments
│   └── admin/
│       ├── comments.ts     # Admin comment management
│       └── upload-mod.ts   # File upload to Vercel Blob
├── src/
│   ├── components/         # React components (Header, Footer)
│   ├── lib/
│   │   └── api.ts          # API client functions
│   ├── pages/              # Page components (HomePage, Admin pages)
│   ├── App.tsx             # Main app with routing
│   └── index.css           # Global styles with CSS variables
├── data/                   # JSON files for data storage (created at runtime)
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── vercel.json             # Vercel configuration
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
- `PUT /api/admin/comments?id=xxx` - Update comment status
- `DELETE /api/admin/comments?id=xxx` - Delete a comment
- `PUT /api/mod-info` - Update mod information
- `POST /api/admin/upload-mod` - Upload a new .jar mod file

## Security Features

- Admin routes protected with token-based authentication
- XSS sanitization for all user-submitted comments
- File upload validation (only .jar files allowed)
- File size limit (10MB max)
- Vercel Blob Storage for secure file hosting

## License

This project is for the DonutSMP community. Not affiliated with Mojang or DonutSMP.
