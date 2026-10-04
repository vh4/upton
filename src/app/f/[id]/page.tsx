import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFileById, toPublicFile } from '@/lib/db';
import { getPhysicalFileStat } from '@/lib/storage/local';
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
      title: 'File Not Found — Upton',
    };
  }

  return {
    title: `${record.original_name} — Upton`,
    description: `View and download ${record.original_name} on Upton file sharing.`,
    openGraph: {
      title: record.original_name,
      description: `Shared on Upton`,
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
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mb-4 light:bg-zinc-100 light:border-zinc-300">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100 light:text-zinc-900">
          File Not Found
        </h2>
        <p className="text-sm text-zinc-400 light:text-zinc-600 max-w-sm mt-2">
          The file you are looking for does not exist or may have been removed by its uploader.
        </p>
        <Link
          href="/"
          className="mt-6 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-semibold text-xs light:bg-zinc-900 light:text-white flex items-center gap-1.5"
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
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-100 light:text-zinc-900">
          This file is no longer available.
        </h2>
        <p className="text-sm text-zinc-400 light:text-zinc-600 max-w-md mt-2 leading-relaxed">
          It was automatically deleted after its expiration time.
        </p>
        <Link
          href="/"
          className="mt-6 px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-semibold text-xs light:bg-zinc-900 light:text-white flex items-center gap-2 hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Upload Your Own File</span>
        </Link>
      </div>
    );
  }

  // Check storage file
  const stat = await getPhysicalFileStat(record.file_path);
  if (!stat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mb-4 light:bg-zinc-100 light:border-zinc-300">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100 light:text-zinc-900">
          Missing Physical File
        </h2>
        <p className="text-sm text-zinc-400 light:text-zinc-600 max-w-sm mt-2">
          The metadata exists, but the file is no longer on disk. It may have been cleaned up or moved.
        </p>
        <Link
          href="/"
          className="mt-6 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-semibold text-xs light:bg-zinc-900 light:text-white flex items-center gap-1.5"
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
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 light:text-zinc-600 light:hover:text-zinc-900 transition-colors"
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
