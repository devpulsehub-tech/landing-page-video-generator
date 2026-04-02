# 🎬 DevPulseHub - Landing Page Video Generator

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Playwright](https://img.shields.io/badge/Browser-Playwright-green)](https://playwright.dev/)
[![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind-38B2AC)](https://tailwindcss.com/)

**DevPulseHub** is a professional Next.js application designed to create cinematic, high-quality promotional videos of any landing page. Simply paste a URL, and DevPulseHub will generate a 3-scene video complete with a custom intro, smooth scrolling of the landing page, and a call-to-action (CTA) outro.

---

## ✨ Key Features

### 🎥 3-Scene Cinematic Experience
Every video is structured into a professional 3-act sequence:
1.  **Scene 1: Premium Intro** (3s) — Features your logo, title, and description with smooth reveal animations and a glowing theme.
2.  **Scene 2: Page Showcase** (Variable 3s–20s) — A cinematic, smooth-scrolling capture of the landing page with lens-clear and vignette effects.
3.  **Scene 3: CTA Outro** (3s) — A final scene with your logo, title, and a prominent call-to-action button to drive conversions.

### 🎨 Deep Customization
*   **Custom Branding**: Manually override the logo, title, and description or let the AI extract them automatically.
*   **Theme Control**: Choose from curated color presets or pick any custom hex color to match your brand's primary theme.
*   **Variable Duration**: Control the scroll duration from 3s for quick previews up to 20s for detailed showcases.
*   **Custom CTAs**: Set your own text for the final call-to-action button (e.g., "Join Now", "Try Free").

### 📊 Intelligent Extraction
*   **Metadata Scraper**: Automatically extracts the page title, description, OG tags, and favicon from the provided URL.
*   **Logo Detection**: Intelligent fallback to the site's favicon if no custom logo is provided.

### 💾 Export Options
*   **HD Video**: Download the resulting 1920x1080 video in WebM format.
*   **Metadata Export**: Download a structured JSON file of the extracted page information.

---

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15 (App Router), React 19
-   **Styling**: Tailwind CSS, shadcn/ui, Lucide React
-   **Browser Automation**: Playwright (Headless Chromium)
-   **Video Production**: Playwright `recordVideo` with dynamic HTML injection

---

## 🚀 Getting Started

### Prerequisites

-   Node.js 18.17+ or latest
-   npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/video-devpulsehub.git
    cd video-devpulsehub
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Install Playwright browsers:**
    ```bash
    npx playwright install chromium
    ```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start generating videos.

---

## 📖 How It Works

1.  **Enter URL**: Paste the URL of the landing page you want to record.
2.  **Customize (Optional)**: Open the "Custom Options" panel to tweak colors, text, logos, and duration.
3.  **Generate**: Click "Generate Video". DevPulseHub will:
    *   Launch a headless browser.
    *   Inject custom styling for the cinematic intro/outro.
    *   Record a smooth-scroll sequence.
4.  **Preview & Download**: Watch the generated video in the player and download the file along with its metadata.

---

## 📂 Project Structure

```text
├── app/
│   ├── api/
│   │   └── record/         # Recording engine using Playwright
│   ├── components/
│   │   └── RecorderForm.ts # Feature-rich UI for customization
│   ├── page.tsx            # Main landing page
│   └── layout.tsx          # Root configuration
├── components/ui/          # UI building blocks (shadcn)
├── lib/                    # Utility functions
├── public/
│   └── recordings/         # Local storage for generated videos (gitignored)
└── LICENSE                 # Open-source MIT License
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features or improvements, feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

Built with ❤️ by [Satish Kolhe](https://github.com/satishkolhe) | [devpulsehub.com](https://devpulsehub.com)
