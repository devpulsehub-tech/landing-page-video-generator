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

export default function RecorderForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setProgress('Scene 1: Creating intro with logo...');

    try {
      // Auto-add https:// if not present
      let finalUrl = url.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }

      setTimeout(() => setProgress('Scene 2: Recording landing page...'), 3000);
      setTimeout(() => setProgress('Scene 3: Adding CTA outro...'), 8000);
      setTimeout(() => setProgress('Finalizing video...'), 12000);

      const response = await fetch('/api/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl }),
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

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  <p className="text-indigo-700 dark:text-indigo-300">Scene 1: Logo intro (3s) → Scene 2: Landing page (5-6s) → Scene 3: CTA outro (3s)</p>
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
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
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
