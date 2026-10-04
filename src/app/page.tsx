import { Dropzone } from '@/components/upload/Dropzone';
import { Clock, ShieldCheck, Zap, HardDrive, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 light:bg-zinc-100 light:border-zinc-300 light:text-zinc-700 shadow-sm mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Upload. Share. Done.</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-100 light:text-zinc-900">
          Simple, fast file sharing.
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 light:text-zinc-600 max-w-lg mx-auto leading-relaxed">
          Upload images and videos. Share them instantly with a unique URL.
          Choose exactly when they disappear.
        </p>
      </div>

      {/* Main Upload Dropzone Card */}
      <section className="w-full max-w-2xl mx-auto mb-16">
        <Dropzone />
      </section>

      {/* Feature Highlights Grid */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 border-t border-zinc-800/60 light:border-zinc-200">
        <div className="p-5 rounded-2xl glass-panel border border-zinc-800/60 light:border-zinc-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-amber-400 flex items-center justify-center light:bg-zinc-100">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-200 light:text-zinc-800">
            Auto-Expiration
          </h3>
          <p className="text-xs text-zinc-400 light:text-zinc-600 leading-relaxed">
            Choose from 1 hour to 30 days, or customize exact duration down to the minute. Files are purged automatically.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800/60 light:border-zinc-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-emerald-400 flex items-center justify-center light:bg-zinc-100">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-200 light:text-zinc-800">
            Fast Video Streaming
          </h3>
          <p className="text-xs text-zinc-400 light:text-zinc-600 leading-relaxed">
            Native HTML5 byte-range streaming allows seamless video scrubbing and playback without downloading the whole file.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800/60 light:border-zinc-200 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-indigo-400 flex items-center justify-center light:bg-zinc-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-200 light:text-zinc-800">
            Private &amp; Secure
          </h3>
          <p className="text-xs text-zinc-400 light:text-zinc-600 leading-relaxed">
            Unguessable random paths, strict MIME header validation, and individual delete tokens ensure complete owner control.
          </p>
        </div>
      </div>
    </div>
  );
}
