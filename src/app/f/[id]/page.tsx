import { Metadata } from 'next';
import { getFileById, toPublicFile } from '@/lib/db';
import { getFileStat } from '@/lib/storage';
import { ImageViewer } from '@/components/file/ImageViewer';
import { VideoPlayer } from '@/components/file/VideoPlayer';
import { FileMetaCard } from '@/components/file/FileMetaCard';
import { Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const record = await getFileById(id);

  if (!record || record.status !== 'active') {
    return {
      title: 'File Not Found — UP-TON',
    };
  }

  return {
    title: `${record.original_name} — UP-TON`,
    description: `View and download ${record.original_name} on UP-TON file sharing.`,
    openGraph: {
      title: record.original_name,
      description: `Shared on UP-TON`,
      images: record.mime_type.startsWith('image/')
        ? [`/api/files/${record.id}/raw`]
        : undefined,
    },
  };
}

export default async function FileViewPage({ params }: PageProps) {
  const { id } = await params;
  const record = await getFileById(id);

  // Check if file exists
  if (!record || record.status !== 'active') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-500 flex items-center justify-center mb-4 dark:bg-zinc-900 dark:border-zinc-800">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          File Not Found
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mt-2">
          The file you are looking for does not exist or may have been removed by its uploader.
        </p>
        <Link
          href="/"
          className="mt-6 px-4 py-2 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-black dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Upload New File</span>
        </Link>
      </div>
    );
  }

  // Check expiration
  const isExpired =
    record.expires_at && new Date(record.expires_at).getTime() < Date.now();

  if (isExpired) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          This file is no longer available.
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mt-2 leading-relaxed">
          It was automatically deleted after its expiration time.
        </p>
        <Link
          href="/"
          className="mt-6 px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-black dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Upload Your Own File</span>
        </Link>
      </div>
    );
  }

  // Check storage file (local disk or Supabase bucket)
  const stat = await getFileStat(record.file_path);
  if (!stat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-500 flex items-center justify-center mb-4 dark:bg-zinc-900 dark:border-zinc-800">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Missing Physical File
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mt-2">
          The metadata exists, but the file is no longer on storage. It may have been cleaned up or moved.
        </p>
        <Link
          href="/"
          className="mt-6 px-4 py-2 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-black dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const publicFile = toPublicFile(record);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 sm:py-12 space-y-6">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Upload</span>
      </Link>

      {/* Main Preview Component */}
      <div className="w-full">
        {publicFile.is_image && (
          <ImageViewer
            src={publicFile.raw_url}
            alt={publicFile.original_name}
          />
        )}
        {publicFile.is_video && (
          <VideoPlayer
            src={publicFile.raw_url}
            mimeType={publicFile.mime_type}
          />
        )}
      </div>

      {/* File Metadata & Actions */}
      <FileMetaCard file={publicFile} />
    </div>
  );
}
