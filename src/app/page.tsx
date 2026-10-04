import { Dropzone } from '@/components/upload/Dropzone';
import { Clock, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/70 border border-zinc-300/80 text-xs font-medium text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 shadow-sm mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>Upload. Share. Done.</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Simple, fast file sharing.
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Upload images and videos. Share them instantly with a unique URL.
          Choose exactly when they disappear.
        </p>
      </div>

      {/* Main Upload Dropzone Card */}
      <section className="w-full max-w-2xl mx-auto mb-16">
        <Dropzone />
      </section>

      {/* Feature Highlights Grid */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 border-t border-zinc-200/80 dark:border-zinc-800/60">
        <div className="p-5 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800/60 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-amber-600 dark:bg-zinc-900 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Auto-Expiration
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Choose from 1 hour to 30 days, or customize exact duration down to the minute. Files are purged automatically.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800/60 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-emerald-600 dark:bg-zinc-900 dark:text-emerald-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Fast Video Streaming
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Native HTML5 byte-range streaming allows seamless video scrubbing and playback without downloading the whole file.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800/60 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 text-indigo-600 dark:bg-zinc-900 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Private &amp; Secure
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Unguessable random paths, strict MIME header validation, and individual delete tokens ensure complete owner control.
          </p>
        </div>
      </div>
    </div>
  );
}
