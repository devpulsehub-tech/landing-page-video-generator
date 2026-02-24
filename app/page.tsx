import RecorderForm from './components/RecorderForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
              Cinematic Demo Generator
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
            Premium <span className="text-gradient_indigo-purple">Intro Videos</span><br />for Your SaaS
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Transform any URL into a high-end cinematic recording. Professional easing, motion blur, and cinematic transitions — generated in seconds.
          </p>
        </div>

        <RecorderForm />
      </div>
    </div>
  );
}
