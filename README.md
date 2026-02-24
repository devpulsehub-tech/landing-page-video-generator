# Landing Page Video Recorder

A professional Next.js application that creates smooth, animated videos of landing pages with logos and CTAs.

## Features

- 🎥 Smooth video recording with professional animations
- 🎨 Shows logo, title, and 2-3 key sections
- 📊 Extracts metadata (title, description, OG tags, favicon)
- 💾 Download video (WebM format) and metadata (JSON)
- 🎬 Auto-play with loop for preview
- 🌙 Dark mode support
- ⚡ Built with Next.js 14, Playwright, and shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Enter URL**: Paste any landing page URL
2. **Generate**: Click "Generate Video" to start recording
3. **Processing**: 
   - Launches headless browser
   - Navigates to the page
   - Records smooth scroll through first 2-3 sections
   - Extracts logo, title, description, and metadata
4. **Results**: 
   - Auto-playing video preview
   - Logo display
   - Metadata cards
   - Download buttons for video and metadata

## Video Features

- **1920x1080 HD resolution**
- **Smooth scrolling** through first 2-3 sections only
- **Professional animations** with proper timing
- **Logo integration** from favicon
- **Auto-loop** for continuous preview

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Browser Automation**: Playwright
- **Language**: TypeScript
- **Components**: Custom UI components with shadcn/ui

## API Routes

### POST /api/record

Records a landing page and returns video + metadata.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "videoUrl": "/recordings/abc123.webm",
  "metadata": {
    "title": "Page Title",
    "description": "Page description",
    "ogImage": "https://example.com/og.jpg",
    "favicon": "/favicon.ico",
    "url": "https://example.com"
  }
}
```

## Project Structure

```
├── app/
│   ├── api/
│   │   └── record/
│   │       └── route.ts          # Recording API with smooth scrolling
│   ├── components/
│   │   └── RecorderForm.tsx      # Main form with logo display
│   ├── page.tsx                  # Home page
│   └── layout.tsx                # Root layout
├── components/
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       └── card.tsx
├── lib/
│   └── utils.ts                  # Utility functions
├── public/
│   └── recordings/               # Recorded videos (gitignored)
└── package.json
```

## Configuration

- **Video Resolution**: 1920x1080 (HD)
- **Scroll Range**: First 2.5 viewport heights
- **Scroll Speed**: 3px per 20ms (smooth)
- **Recording Timeout**: 30 seconds
- **Video Format**: WebM

## Notes

- Videos are saved in `public/recordings/` (not committed to git)
- Favicon is automatically extracted and displayed
- Video auto-plays on mute with loop
- Smooth scrolling animation for professional look

## License

MIT
