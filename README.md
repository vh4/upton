# UPTON — Minimal, Fast & Ephemeral File Sharing

<div align="center">
  <div style="font-size: 48px; font-weight: 900; line-height: 1;">↑</div>
  <h1>UPTON</h1>
  <p><strong>Upload. Share. Done.</strong></p>
  <p>A production-ready file upload and sharing web application designed for images and videos with customizable automatic expiration and local disk storage.</p>
</div>

---

## ⚡ Features

- **Drag & Drop Multi-File Upload**: Intuitive dropzone with support for multiple files, instantaneous preview, and upload progress.
- **Image & Video Support**:
  - **Images**: PNG, JPG, GIF, WEBP, AVIF, SVG with high-res viewer, zoom, and transparency checkerboard.
  - **Videos**: MP4, WEBM, Quicktime (.mov), MKV with HTML5 player and byte-range streaming for seamless scrubbing.
- **Configurable Expiration System**:
  - Presets: `1 Hour`, `6 Hours`, `12 Hours`, `24 Hours`, `3 Days`, `7 Days`, `30 Days`, `Permanent`.
  - Custom duration: specify any amount in `Minutes`, `Hours`, `Days`, or `Weeks`.
- **Automatic & Manual Cleanup Engine**:
  - Automatically identifies expired files (`expires_at < NOW()`).
  - Purges physical binary from `/file` and deletes/updates database records.
  - Callable via CLI (`npm run cleanup`), REST API (`POST /api/cleanup`), or Cron.
- **Private & Protected Ownership**:
  - Secure random `delete_token` generated per upload.
  - Dedicated management URL `/f/[id]/manage?token=...` allowing uploaders to manually delete files at any time.
- **Local Dashboard & History**:
  - Client-side history in `/dashboard` displaying past uploads from the current browser session.
  - Thumbnail, file size, remaining expiration countdown, download count, and quick actions.
- **Dual-Mode PostgreSQL Database**:
  - Native **PostgreSQL** connection pooling via `pg`.
  - Full **Supabase PostgreSQL** client support via `@supabase/supabase-js`.
- **Responsive Dark & Light Mode**:
  - Tailored dark obsidian/zinc design with system theme auto-detection and persistence.

---

## 🏗️ Architecture

```text
User Browser
    │
    ├── Uploads Multipart/Form-Data (Images / Videos)
    │           │
    │           ▼
    │   Next.js App Router (/api/upload)
    │     ├── 1. Validates MIME type, extension & magic bytes
    │     ├── 2. Calculates expires_at timestamp
    │     ├── 3. Saves binary to /file/YYYY/MM/...
    │     └── 4. Writes metadata to Supabase / PostgreSQL (files table)
    │
    ├── Public File Viewer (/f/[id])
    │     ├── Checks expiration & file availability
    │     ├── Streams binary via byte-range requests (/api/files/[id]/raw)
    │     └── Increments download count upon download (/api/files/[id]/download)
    │
    └── Expiration Cleanup (npm run cleanup or /api/cleanup)
          ├── SELECT * FROM files WHERE expires_at < NOW()
          ├── Unlinks physical files from /file
          └── Deletes database records
```

---

## ⚠️ Important Storage Architecture Notice

Upton stores uploaded binary files in the **local filesystem** inside:

```text
/file/
  2026/
    10/
      1790406699_abc123456789.png
```

### Deployment Considerations:

1. **Local Development, Dedicated Servers & VPS**:
   - Ideal for standard servers (Ubuntu/Debian VPS, Docker with persistent volumes, AWS EC2, DigitalOcean Droplets) where `./file` is a persistent volume.
2. **Serverless Platforms (e.g., Vercel, AWS Lambda)**:
   - Serverless environments use **ephemeral filesystems** (`/tmp`), meaning local files do not persist permanently across function re-invocations.
   - For production serverless deployments requiring long-term persistence, attach a mounted persistent volume or persistent block storage.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 & Glassmorphism design tokens
- **Icons**: Lucide Icons
- **Database**: PostgreSQL / Supabase PostgreSQL
- **Testing**: Node.js Native Test Runner + `tsx`

---

## 📦 Getting Started

### 1. Prerequisites

- Node.js 20+
- PostgreSQL or Supabase project

### 2. Environment Variables

Create `.env.local` based on `.env.example`:

```bash
cp .env.example .env.local
```

Configure:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Direct PostgreSQL Connection URL (e.g. local or Supabase direct connection)
DATABASE_URL=postgresql://mac@localhost:5432/upton_db

# Supabase PostgreSQL Configuration
SUPABASE_URL=https://vqqjsehanioqcmzfxqex.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=

# File Upload Limit in Megabytes
MAX_FILE_SIZE_MB=500

# Local Storage Directory
UPLOAD_DIR=./file

# Scheduled / API Cleanup Secret
CRON_SECRET=upton_cleanup_secret_2026
```

### 3. Initialize Database Schema

```bash
npm run db:setup
```

Or apply `sql/schema.sql` directly in `psql` or Supabase SQL Editor.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing

Run the automated test suite:

```bash
npm test
```

Tests cover:
- Allowed image & video MIME validation
- Magic bytes verification (PNG, JPEG, GIF, WEBP, MP4, WebM)
- Filename sanitization & path traversal rejection
- Expiration calculation & badge formatting
- Local storage save/delete and directory isolation
- End-to-end cleanup engine purging expired files while preserving active files

---

## 🧹 Automated Cleanup

### Manual CLI Run:
```bash
npm run cleanup
```

### Cron Schedule (e.g., crontab every hour):
```bash
0 * * * * curl -X POST -H "Authorization: Bearer upton_cleanup_secret_2026" http://localhost:3000/api/cleanup
```

---

## 🚀 Deployment

### GitHub:
```bash
git remote add origin https://github.com/vh4/upton.git
git push -u origin main
```

### Vercel:
Deploy with Vercel CLI or connect the GitHub repository on Vercel Dashboard.
Ensure environment variables (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `MAX_FILE_SIZE_MB`, `CRON_SECRET`) are configured in Vercel Project Settings.
