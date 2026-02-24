import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const recordingsDir = join(process.cwd(), 'public', 'recordings');
    if (!existsSync(recordingsDir)) {
      await mkdir(recordingsDir, { recursive: true });
    }

    // First, get metadata without recording
    const browser = await chromium.launch({ headless: true });
    const tempContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const tempPage = await tempContext.newPage();
    await tempPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const metadata = await tempPage.evaluate(() => {
      const getMetaContent = (name: string) => {
        const element = document.querySelector(`meta[name="${name}"]`) ||
          document.querySelector(`meta[property="${name}"]`);
        return element?.getAttribute('content') || '';
      };

      return {
        title: document.title,
        description: getMetaContent('description') || getMetaContent('og:description') || 'Professional landing page',
        ogImage: getMetaContent('og:image'),
        favicon: document.querySelector('link[rel="icon"]')?.getAttribute('href') ||
          document.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') || '',
        url: window.location.href
      };
    });

    await tempPage.close();
    await tempContext.close();

    // Resolve absolute favicon URL
    let resolvedFaviconUrl = '';
    if (metadata.favicon) {
      try {
        resolvedFaviconUrl = metadata.favicon.startsWith('http')
          ? metadata.favicon
          : new URL(metadata.favicon, metadata.url).href;
      } catch { resolvedFaviconUrl = ''; }
    }

    // Fetch favicon as base64 so setContent scenes work without network (no broken logo)
    let faviconDataUrl = '';
    if (resolvedFaviconUrl) {
      try {
        const { default: https } = await import('https');
        const { default: http } = await import('http');
        const client = resolvedFaviconUrl.startsWith('https') ? https : http;
        faviconDataUrl = await new Promise<string>((resolve) => {
          const req = client.get(resolvedFaviconUrl, { timeout: 3000 }, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => chunks.push(chunk));
            res.on('end', () => {
              const b64 = Buffer.concat(chunks).toString('base64');
              const mime = res.headers['content-type'] || 'image/png';
              resolve(`data:${mime};base64,${b64}`);
            });
          });
          req.on('error', () => resolve(''));
          req.on('timeout', () => { req.destroy(); resolve(''); });
        });
      } catch { faviconDataUrl = ''; }
    }

    // Use data URL if available, else fall back to absolute URL
    const faviconUrl = faviconDataUrl || resolvedFaviconUrl;

    // Now start recording
    const recordContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: recordingsDir,
        size: { width: 1920, height: 1080 }
      }
    });

    const page = await recordContext.newPage();

    const introHTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
    }
    
    .container { 
      text-align: center; 
      max-width: 800px; 
      padding: 0 40px;
      perspective: 1000px;
      position: relative;
      z-index: 1;
    }
    
    /* Animated glow background */
    .glow-container {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: glowPulse 4s ease-in-out infinite;
      z-index: 0;
    }
    
    /* Logo with premium glow */
    .logo {
      width: 140px;
      height: 140px;
      margin: 0 auto 40px;
      background: ${metadata.favicon ? 'transparent' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'};
      border-radius: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 30px 80px rgba(99, 102, 241, 0.35);
      animation: logoFloat 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .logo::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 28px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.5) 0%, rgba(168, 85, 247, 0.3) 100%);
      opacity: 0;
      animation: logoGlow 1.2s ease-out forwards;
    }
    
    .logo img { 
      width: 90px; 
      height: 90px; 
      object-fit: contain;
      position: relative;
      z-index: 1;
    }
    
    /* Text with gradient reveal effect */
    .title {
      font-size: 64px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 20px;
      letter-spacing: -1.5px;
      animation: textReveal 1s ease-out 0.2s both;
      background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .description {
      font-size: 22px;
      color: #cbd5e0;
      font-weight: 400;
      line-height: 1.7;
      animation: textReveal 1s ease-out 0.4s both;
    }
    
    .watermark {
      position: absolute;
      top: 24px;
      right: 28px;
      font-size: 12px;
      color: rgba(255,255,255,0.25);
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      animation: fadeIn 1.2s ease-in 0.5s both;
      z-index: 2;
    }
    
    .fade-out { animation: fadeOut 0.8s ease-out forwards; }
    
    @keyframes glowPulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
      50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
    }
    
    @keyframes logoFloat {
      0% { 
        opacity: 0; 
        transform: scale(0) rotateX(180deg);
      }
      100% { 
        opacity: 1; 
        transform: scale(1) rotateX(0deg);
      }
    }
    
    @keyframes logoGlow {
      0% { 
        opacity: 0;
        transform: scale(0.8);
      }
      50% { 
        opacity: 1;
      }
      100% { 
        opacity: 0.8;
        transform: scale(1.05);
      }
    }
    
    @keyframes textReveal {
      from { 
        opacity: 0; 
        transform: translateY(30px);
        clip-path: inset(0 100% 0 0);
      }
      to { 
        opacity: 1; 
        transform: translateY(0);
        clip-path: inset(0 0 0 0);
      }
    }
    
    @keyframes fadeIn { 
      from { opacity: 0; } 
      to { opacity: 1; } 
    }
    
    @keyframes fadeOut { 
      from { opacity: 1; } 
      to { opacity: 0; } 
    }
  </style>
</head>
<body>
  <div class="glow-container"></div>
  <div class="watermark">DevPulseHub</div>
  <div class="container">
    <div class="logo">
      ${faviconUrl ? `<img src="${faviconUrl}" alt="Logo" />` : ''}
    </div>
    <div class="title">${metadata.title}</div>
    <div class="description">${metadata.description}</div>
  </div>
</body>
</html>`;

    const outroHTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
    }
    
    .container { 
      text-align: center;
      position: relative;
      z-index: 1;
    }
    
    /* Glow effect */
    .glow {
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: glowPulseOut 3s ease-in-out;
      z-index: 0;
    }
    
    .logo {
      width: 120px;
      height: 120px;
      margin: 0 auto 30px;
      background: ${metadata.favicon ? 'transparent' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'};
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 25px 70px rgba(99, 102, 241, 0.3);
      animation: logoScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .logo img { 
      width: 80px; 
      height: 80px; 
      object-fit: contain;
    }
    
    .title {
      font-size: 56px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 30px;
      letter-spacing: -1px;
      animation: titlePop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
      background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* CTA Button with glow */
    .cta-button {
      display: inline-block;
      padding: 18px 60px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
      font-size: 20px;
      font-weight: 600;
      border-radius: 50px;
      box-shadow: 0 15px 50px rgba(99, 102, 241, 0.4);
      animation: buttonPulse 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    
    .cta-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: buttonShine 2s infinite;
    }
    
    .url {
      margin-top: 25px;
      font-size: 16px;
      color: #718096;
      font-weight: 500;
      animation: urlFade 0.8s ease-in 0.5s both;
    }
    
    .watermark {
      position: absolute;
      top: 24px;
      right: 28px;
      font-size: 12px;
      color: rgba(255,255,255,0.25);
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    
    .fade-out { 
      animation: fadeOut 0.8s ease-out forwards;
    }
    
    @keyframes glowPulseOut {
      0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
      50% { opacity: 0.8; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
    }
    
    @keyframes logoScale {
      0% { 
        opacity: 0;
        transform: scale(0) rotateY(180deg);
      }
      100% { 
        opacity: 1;
        transform: scale(1) rotateY(0deg);
      }
    }
    
    @keyframes titlePop {
      0% { 
        opacity: 0;
        transform: scale(0.8) translateY(20px);
      }
      100% { 
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    @keyframes buttonPulse {
      0% { 
        opacity: 0;
        transform: scale(0.9);
      }
      100% { 
        opacity: 1;
        transform: scale(1);
      }
    }
    
    @keyframes buttonShine {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    
    @keyframes urlFade {
      from { 
        opacity: 0; 
        transform: translateY(10px);
      }
      to { 
        opacity: 1; 
        transform: translateY(0);
      }
    }
    
    @keyframes fadeOut { 
      from { opacity: 1; } 
      to { opacity: 0; } 
    }
  </style>
</head>
<body>
  <div class="glow"></div>
  <div class="watermark">DevPulseHub</div>
  <div class="container">
    <div class="logo">
      ${faviconUrl ? `<img src="${faviconUrl}" alt="Logo" />` : ''}
    </div>
    <div class="title">${metadata.title}</div>
    <div class="cta-button">Visit Site →</div>
    <div class="url">${url}</div>
  </div>
</body>
</html>`;

    // ========================================
    // SCENE 1: Premium Intro (3 seconds)
    // ========================================
    await page.setContent(introHTML);
    await page.waitForTimeout(2200);
    await page.evaluate(() => { document.body.classList.add('fade-out'); });
    await page.waitForTimeout(200);

    // ========================================
    // SCENE 2: Cinematic Page Reveal
    // ========================================
    // HARD 5-SECOND SCROLL — wall-clock timer, no steps guessing
    // navigate with 'commit' = returns as soon as HTTP response starts (~100-300ms, not 5-15s)
    page.goto(url, { waitUntil: 'commit', timeout: 10000 }).catch(() => { });

    // Wait up to 2s for page to have a body before scrolling starts
    await Promise.race([
      page.waitForFunction(() => !!document.body, { timeout: 2000 }).catch(() => { }),
      page.waitForTimeout(2000)
    ]);

    // Inject cinematic entry immediately on top of the page
    await page.addStyleTag({
      content: `
        #cinematic-wrapper {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: 99998;
          pointer-events: none;
        }
        #cinematic-vignette {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%);
          animation: vignetteFade 0.9s ease-out forwards;
        }
        #cinematic-lens {
          position: absolute;
          top: -5%; left: -5%; width: 110%; height: 110%;
          backdrop-filter: blur(20px) brightness(0.6);
          -webkit-backdrop-filter: blur(20px) brightness(0.6);
          animation: lensClear 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        #cinematic-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.7);
          animation: overlayOut 0.85s ease-out forwards;
        }
        @keyframes vignetteFade { 0% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes lensClear {
          0%   { backdrop-filter: blur(20px) brightness(0.6); -webkit-backdrop-filter: blur(20px) brightness(0.6); transform: scale(1.05); }
          100% { backdrop-filter: blur(0px) brightness(1);   -webkit-backdrop-filter: blur(0px) brightness(1);   transform: scale(1); }
        }
        @keyframes overlayOut { 0% { opacity: 0.7; } 100% { opacity: 0; } }
        *, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; scroll-behavior: auto !important; }
        #cinematic-wrapper *, #cinematic-wrapper *::before, #cinematic-wrapper *::after {
          animation-duration: unset !important; transition-duration: unset !important;
        }
      `
    }).catch(() => { });

    await page.evaluate(() => {
      const wrapper = document.createElement('div');
      wrapper.id = 'cinematic-wrapper';
      wrapper.innerHTML = `
        <div id="cinematic-vignette"></div>
        <div id="cinematic-lens"></div>
        <div id="cinematic-overlay"></div>
      `;
      document.body?.appendChild(wrapper);
    }).catch(() => { });

    // Scroll for EXACTLY 5 seconds — wall clock guarantees duration
    const scrollDuration = 5000;
    const scrollStart = Date.now();
    while (Date.now() - scrollStart < scrollDuration) {
      const elapsed = Date.now() - scrollStart;
      const t = elapsed / scrollDuration;
      // Sine ramp: slow → fast → slow
      const speedMultiplier = Math.sin(t * Math.PI);
      const delta = Math.max(4, 28 * speedMultiplier);
      await page.mouse.wheel(0, delta).catch(() => { });
      await page.waitForTimeout(30);
    }

    // ========================================
    // SCENE 3: Premium Outro (3 seconds)
    // ========================================
    await page.setContent(outroHTML);
    await page.waitForTimeout(2200);
    await page.evaluate(() => { document.body.classList.add('fade-out'); });
    await page.waitForTimeout(200);

    const video = page.video();
    await page.close();
    await recordContext.close();
    await browser.close();

    if (!video) {
      return NextResponse.json({ error: 'Failed to record video' }, { status: 500 });
    }

    const videoPath = await video.path();
    const videoFileName = videoPath.split('/').pop() || videoPath.split('\\').pop() || 'recording.webm';
    const videoUrl = `/recordings/${videoFileName}`;

    return NextResponse.json({ videoUrl, metadata });

  } catch (error) {
    console.error('Recording error:', error);
    return NextResponse.json({ error: 'Failed to record page' }, { status: 500 });
  }
}