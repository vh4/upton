export type ExpirationPreset =
  | '1h'
  | '6h'
  | '12h'
  | '24h'
  | '3d'
  | '7d'
  | '30d'
  | 'permanent'
  | 'custom';

export type CustomExpirationUnit = 'minutes' | 'hours' | 'days' | 'weeks';

export interface ExpirationOption {
  preset: ExpirationPreset;
  customValue?: number;
  customUnit?: CustomExpirationUnit;
}

export type FileStatus = 'active' | 'expired' | 'deleted';

export interface FileRecord {
  id: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  file_size: number;
  file_path: string;
  public_url: string;
  created_at: string;
  expires_at: string | null;
  download_count: number;
  delete_token: string;
  status: FileStatus;
  width: number | null;
  height: number | null;
  duration: number | null;
}

export interface PublicFileRecord {
  id: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  public_url: string;
  created_at: string;
  expires_at: string | null;
  download_count: number;
  status: FileStatus;
  width: number | null;
  height: number | null;
  duration: number | null;
  is_image: boolean;
  is_video: boolean;
  raw_url: string;
  download_url: string;
}

export interface UploadedFileResponse {
  file: PublicFileRecord;
  delete_token: string;
  manage_url: string;
}

export interface StoredUploadHistoryItem {
  id: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  public_url: string;
  delete_token: string;
  created_at: string;
  expires_at: string | null;
}
