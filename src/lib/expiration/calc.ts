import { addMinutes, addHours, addDays, addWeeks, isPast, formatDistanceToNowStrict } from 'date-fns';
import { CustomExpirationUnit, ExpirationOption, ExpirationPreset } from '@/types/file';

/**
 * Calculates the expiration Date based on preset or custom options.
 * Returns null for permanent files.
 */
export function calculateExpirationDate(option: ExpirationOption): Date | null {
  const now = new Date();

  switch (option.preset) {
    case '1h':
      return addHours(now, 1);
    case '6h':
      return addHours(now, 6);
    case '12h':
      return addHours(now, 12);
    case '24h':
      return addHours(now, 24);
    case '3d':
      return addDays(now, 3);
    case '7d':
      return addDays(now, 7);
    case '30d':
      return addDays(now, 30);
    case 'permanent':
      return null;
    case 'custom': {
      const val = Math.max(1, option.customValue || 1);
      const unit: CustomExpirationUnit = option.customUnit || 'hours';

      switch (unit) {
        case 'minutes':
          return addMinutes(now, val);
        case 'hours':
          return addHours(now, val);
        case 'days':
          return addDays(now, val);
        case 'weeks':
          return addWeeks(now, val);
        default:
          return addHours(now, 24);
      }
    }
    default:
      return addHours(now, 24);
  }
}

/**
 * Formats the expiration status for human display.
 */
export function formatExpirationStatus(expiresAt: string | null): {
  isExpired: boolean;
  isPermanent: boolean;
  label: string;
  badgeVariant: 'permanent' | 'active' | 'warning' | 'expired';
} {
  if (!expiresAt) {
    return {
      isExpired: false,
      isPermanent: true,
      label: 'Permanent',
      badgeVariant: 'permanent',
    };
  }

  const expireDate = new Date(expiresAt);

  if (isPast(expireDate)) {
    return {
      isExpired: true,
      isPermanent: false,
      label: 'Expired',
      badgeVariant: 'expired',
    };
  }

  const msRemaining = expireDate.getTime() - Date.now();
  const minutesRemaining = msRemaining / (1000 * 60);

  // If under 60 minutes, highlight as warning
  const badgeVariant = minutesRemaining <= 60 ? 'warning' : 'active';
  const relativeDistance = formatDistanceToNowStrict(expireDate, { addSuffix: true });

  return {
    isExpired: false,
    isPermanent: false,
    label: `Expires ${relativeDistance}`,
    badgeVariant,
  };
}
