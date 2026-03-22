'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Metadata {
  title: string;
  description: string;
  ogImage?: string;
  favicon?: string;
  url: string;
}

interface RecordingResult {
  videoUrl: string;
  metadata: Metadata;
}

interface CustomOptions {
  duration: number;
  customTitle: string;
  customDescription: string;
  customLogo: string;
  customCTA: string;
  primaryColor: string;
}

export default function RecorderForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<CustomOptions>({
    duration: 5,
    customTitle: '',
    customDescription: '',
    customLogo: '',
    customCTA: 'Visit Site →',
    primaryColor: '#6366f1',
  });

  const setOption = <K extends keyof CustomOptions>(key: K, value: CustomOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setProgress('Scene 1: Creating intro with logo...');

    try {
      let finalUrl = url.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }

      const scrollMs = Math.round(options.duration * 1000);
      setTimeout(() => setProgress('Scene 2: Recording landing page...'), 3000);
      setTimeout(() => setProgress('Scene 3: Adding CTA outro...'), 3000 + scrollMs);
      setTimeout(() => setProgress('Finalizing video...'), 3000 + scrollMs + 3000);

      const response = await fetch('/api/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl, options }),
      });

      if (!response.ok) {
        throw new Error('Failed to record page');
      }

      const data = await response.json();
      setResult(data);
      setProgress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const colorPresets = [
    '#6366f1', '#a855f7', '#ec4899', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#ffffff',
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Landing Page URL
            </label>
            <Input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com or https://example.com"
              required
              disabled={loading}
              className="text-lg"
            />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Creates a 3-scene video: Logo intro → Landing page → CTA outro
            </p>
          </div>

          {/* Toggle Custom Options */}
          <button
            type="button"
            onClick={() => setShowOptions((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors cursor-pointer"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showOptions ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showOptions ? 'Hide' : 'Show'} Custom Options
          </button>

          {/* Custom Options Panel */}
          {showOptions && (
            <div className="space-y-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">🎨 Customize Your Video</h3>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Page Recording Duration: <span className="font-bold text-indigo-600 dark:text-indigo-400">{options.duration}s</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={20}
                  step={1}
                  value={options.duration}
                  onChange={(e) => setOption('duration', Number(e.target.value))}
                  disabled={loading}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>3s (short)</span>
                  <span>10s (balanced)</span>
                  <span>20s (long)</span>
                </div>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Primary Theme Color
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setOption('primaryColor', color)}
                      title={color}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${options.primaryColor === color
                          ? 'border-slate-900 dark:border-white scale-110 ring-2 ring-offset-2 ring-indigo-500'
                          : 'border-transparent'
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="flex items-center gap-2 ml-1">
                    <input
                      type="color"
                      value={options.primaryColor}
                      onChange={(e) => setOption('primaryColor', e.target.value)}
                      disabled={loading}
                      title="Custom color"
                      className="w-8 h-8 rounded-full cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent"
                    />
                    <span className="text-xs text-slate-500 font-mono">{options.primaryColor}</span>
                  </div>
                </div>
              </div>

              {/* Custom Logo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Custom Logo URL <span className="text-slate-400 font-normal">(optional — overrides site favicon)</span>
                </label>
                <Input
                  type="url"
                  value={options.customLogo}
                  onChange={(e) => setOption('customLogo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  disabled={loading}
                />
              </div>

              {/* Custom Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Custom Title <span className="text-slate-400 font-normal">(optional — overrides scraped title)</span>
                </label>
                <Input
                  type="text"
                  value={options.customTitle}
                  onChange={(e) => setOption('customTitle', e.target.value)}
                  placeholder="e.g. My Awesome Product"
                  disabled={loading}
                />
              </div>

              {/* Custom Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Custom Description <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={options.customDescription}
                  onChange={(e) => setOption('customDescription', e.target.value)}
                  placeholder="e.g. The best tool for your business."
                  disabled={loading}
                  rows={2}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Custom CTA */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Call-to-Action Button Text <span className="text-slate-400 font-normal">(Scene 3)</span>
                </label>
                <Input
                  type="text"
                  value={options.customCTA}
                  onChange={(e) => setOption('customCTA', e.target.value)}
                  placeholder="e.g. Get Started →"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full text-lg font-semibold"
          >
            {loading ? progress || 'Creating Video...' : 'Generate Video'}
          </Button>
        </form>

        {loading && (
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-3">{progress}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">Error</h3>
              <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {result.metadata.favicon && (
                  <img
                    src={result.metadata.favicon.startsWith('http') ? result.metadata.favicon : `${result.metadata.url}${result.metadata.favicon}`}
                    alt="Logo"
                    className="w-10 h-10 rounded-lg"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Video is Ready!</h2>
              </div>
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="bg-slate-950 rounded-xl p-6 mb-6">
              <video
                src={result.videoUrl}
                controls
                autoPlay
                loop
                muted
                className="w-full rounded-lg shadow-2xl"
              />
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-indigo-800 dark:text-indigo-200">
                  <p className="font-semibold mb-1">3-Scene Professional Video</p>
                  <p className="text-indigo-700 dark:text-indigo-300">
                    Scene 1: Logo intro (3s) → Scene 2: Landing page ({options.duration}s) → Scene 3: CTA outro (3s)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Page Title</h3>
                <p className="text-base font-medium text-slate-900 dark:text-white">{result.metadata.title}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">URL</h3>
                <a href={result.metadata.url} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate block">
                  {result.metadata.url}
                </a>
              </div>
            </div>

            {result.metadata.description && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Description</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">{result.metadata.description}</p>
              </div>
            )}

            <div className="flex gap-4">
              <a
                href={result.videoUrl}
                download="landing-video.webm"
                className="flex-1"
              >
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Video
                </Button>
              </a>
              <Button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(result.metadata, null, 2)], { type: 'application/json' });
                  const downloadUrl = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = downloadUrl;
                  a.download = 'metadata.json';
                  a.click();
                }}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Metadata
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
