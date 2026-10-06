import { Dropzone } from '@/components/upload/Dropzone';
import {
  Clock,
  ShieldCheck,
  Zap,
  Sparkles,
  UploadCloud,
  Share2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-8 sm:py-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 space-y-2.5 sm:space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/70 border border-zinc-300/80 text-xs font-medium text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 shadow-sm mb-1 sm:mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>Upload. Share. Done. — 100% Free &amp; Private</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
          Fast, Free &amp; Ephemeral{' '}
          <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            File Sharing
          </span>
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed px-2">
          Upload images and videos up to 500MB without registration. Share instantly with a unique link, enjoy buffer-free video streaming, and pick exact auto-expiration timers.
        </p>
      </div>

      {/* Main Upload Dropzone Card */}
      <section className="w-full max-w-2xl mx-auto mb-12 sm:mb-20" aria-label="Upload File Section">
        <Dropzone />
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-5xl mx-auto w-full mb-12 sm:mb-20" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Core Features of UP-TON File Sharing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
          <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-amber-600 dark:bg-zinc-900 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Auto-Expiration Engine
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Choose from 1 hour to 30 days, or customize exact duration down to the minute. Files are permanently purged when time expires.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-emerald-600 dark:bg-zinc-900 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Native Video Streaming
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              HTML5 byte-range streaming allows instant playback and seamless seeking without waiting for full video downloads.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-zinc-200 dark:border-zinc-800/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-indigo-600 dark:bg-zinc-900 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Private &amp; Token-Protected
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Unguessable random IDs, strict MIME sanitization, and private delete tokens provide total control to remove files anytime.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className="max-w-5xl mx-auto w-full mb-12 sm:mb-20 pt-8 sm:pt-12 border-t border-zinc-200/80 dark:border-zinc-800/60"
        aria-labelledby="how-it-works-heading"
      >
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 space-y-2">
          <h2
            id="how-it-works-heading"
            className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100"
          >
            How UP-TON Works in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Effortless file sharing built for speed, privacy, and zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                1
              </div>
              <UploadCloud className="w-5 h-5 text-zinc-400" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Drag &amp; Drop Media
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Select or drop any image (JPEG, PNG, WebP, GIF, SVG, AVIF) or video (MP4, WebM, MOV) up to 500 MB. No login required.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base">
                2
              </div>
              <Clock className="w-5 h-5 text-zinc-400" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Set Auto-Expiration
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Decide when your file self-destructs: 1 hour, 24 hours, 7 days, 30 days, or permanent. Customize down to the minute.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
                3
              </div>
              <Share2 className="w-5 h-5 text-zinc-400" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Share &amp; Stream Instantly
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Get an instant shareable URL with direct streaming playback, plus a private deletion link to delete your file at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Why UP-TON Comparison Section */}
      <section
        className="max-w-5xl mx-auto w-full mb-12 sm:mb-20 p-6 sm:p-10 rounded-3xl glass-panel border border-zinc-200 dark:border-zinc-800/80"
        aria-labelledby="why-upton-heading"
      >
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <h2
            id="why-upton-heading"
            className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100"
          >
            Why Choose UP-TON Over Other File Hosts?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Modern, secure, privacy-focused file sharing built with next-gen cloud technology.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-0.5">
                No Account or Registration
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                Upload immediately without providing emails, phone numbers, or passwords.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-0.5">
                Zero Compression on Video
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                Your video files are stored and streamed in original crystal-clear resolution.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-0.5">
                True Auto-Expiration Engine
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                Files and database records are completely wiped when their timer expires.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-0.5">
                Generous 500 MB Size Limit
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                Higher than typical ephemeral hosts, supporting large MP4 videos and high-res images.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-0.5">
                Owner Delete Token
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                Keep full control. You can delete your file instantly at any moment before expiration.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-0.5">
                High Speed Cloud Infrastructure
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                Ultra-fast downloads powered by Supabase Cloud Storage and low-latency global delivery.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (Matches JSON-LD FAQPage Schema for Rich Snippets) */}
      <section
        className="max-w-4xl mx-auto w-full mb-8 sm:mb-12 pt-8 border-t border-zinc-200/80 dark:border-zinc-800/60"
        aria-labelledby="faq-heading"
      >
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-200/60 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>Got Questions?</span>
          </div>
          <h2
            id="faq-heading"
            className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Everything you need to know about UP-TON file upload, security, and expiration.
          </p>
        </div>

        <div className="space-y-3">
          <details className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 transition-all [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              <span>Is UP-TON completely free to use?</span>
              <span className="text-zinc-400 group-open:rotate-180 transition-transform duration-200 text-sm">
                ▼
              </span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
              Yes! UP-TON is 100% free with no registration, subscriptions, or hidden charges required. You can upload and share media right away.
            </p>
          </details>

          <details className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 transition-all [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              <span>What file formats and upload size limits are supported?</span>
              <span className="text-zinc-400 group-open:rotate-180 transition-transform duration-200 text-sm">
                ▼
              </span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
              UP-TON supports all major image formats (JPEG, PNG, GIF, WebP, SVG, AVIF) and video formats (MP4, WebM, QuickTime MOV) with file sizes up to 500 MB per file.
            </p>
          </details>

          <details className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 transition-all [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              <span>How does the auto-expiration timer work?</span>
              <span className="text-zinc-400 group-open:rotate-180 transition-transform duration-200 text-sm">
                ▼
              </span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
              You can select presets like 1 hour, 24 hours, 7 days, 30 days, or customize down to the exact minute. Expired files and their database records are permanently purged automatically by our cleanup engine.
            </p>
          </details>

          <details className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 transition-all [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              <span>Do I need an account or email to share files?</span>
              <span className="text-zinc-400 group-open:rotate-180 transition-transform duration-200 text-sm">
                ▼
              </span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
              No account, login, or personal information is required. You can upload and get a shareable link instantly. We prioritize maximum privacy and ease of use.
            </p>
          </details>

          <details className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 transition-all [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              <span>Can I delete my file before it reaches expiration?</span>
              <span className="text-zinc-400 group-open:rotate-180 transition-transform duration-200 text-sm">
                ▼
              </span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
              Yes. Every uploaded file generates a unique, private deletion token and management link so you can delete it whenever you choose.
            </p>
          </details>

          <details className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 transition-all [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              <span>Can videos be played and streamed directly in the browser?</span>
              <span className="text-zinc-400 group-open:rotate-180 transition-transform duration-200 text-sm">
                ▼
              </span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
              Yes, UP-TON provides native HTML5 byte-range video streaming, enabling smooth scrubbing and instant playback without waiting for full downloads.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
