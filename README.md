# Solo Leveling Life System — Phase 0

This is the foundation phase of the gamified personal life-management web app.

## Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Google Cloud Console project (for OAuth)

## Setup Instructions

1. **Install Dependencies**
   From the root folder, run:
   ```bash
   npm run install:all
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env` in the **root** folder.
   - Update `MONGODB_URI` with your connection string.
   - Set up Google OAuth in Google Cloud Console:
     - Create a new project.
     - Enable the Google+ API or simply OAuth consent screen.
     - Create OAuth 2.0 Client IDs for Web application.
     - Add `http://localhost:5173` to Authorized JavaScript origins.
     - Copy the Client ID and Secret to `.env`.
   - Update `JWT_SECRET` with any strong random string.

3. **Run the Application**
   From the root folder, run:
   ```bash
   npm run dev
   ```
   This will start both the Express backend (port 5000) and the Vite React frontend (port 5173) concurrently.

## Phase 0 Features
- Monorepo structure setup.
- Glassmorphism & Neon design system.
- User authentication via Email/Password & Google OAuth.
- Protected frontend routing.
- Dashboard with placeholder stats and UI.
- Profile editing page.

# solo-leveling
