# CodeCrafters — Admin & Instructor Studio

Dedicated standalone administrator and educator portal for CodeCrafters LMS.

## Features
- **Dashboard & Analytics**: Revenue metrics, enrollment statistics, dynamic charts.
- **Paid & Free Course Management**: Create, edit, and organize courses.
- **Curriculum Builder**: Section and lecture management with video upload via Bunny.net Stream.
- **Interactive Live Classes**: Schedule and host live classes with YouTube streaming and real-time live chat.
- **Mock Tests & Quizzes**: Complete quiz builder with questions, options, timer, and student performance tracking.
- **Digital Library**: Manage and upload engineering books/PDFs with Cloudinary.

## Development Setup

1. **Install Dependencies**:
```bash
npm install
```

2. **Configure Environment (`.env`)**:
```env
VITE_SERVER_URL="http://localhost:8000"
VITE_WEBSITE_URL="http://localhost:5173"
```

3. **Start Dev Server**:
```bash
npm run dev
```
Runs at `http://localhost:5174` by default.

## Deployment (Vercel / Render / Netlify)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_SERVER_URL`: Production backend API URL (e.g. `https://lms-jcpg.onrender.com`)
  - `VITE_WEBSITE_URL`: Production frontend URL (e.g. `https://codecrafters.vercel.app`)
