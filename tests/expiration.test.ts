import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExpirationDate,
  formatExpirationStatus,
} from '../src/lib/expiration/calc';

test('Expiration Calculation — Presets & Permanent', () => {
  // Permanent should yield null
  const permDate = calculateExpirationDate({ preset: 'permanent' });
  assert.equal(permDate, null);

  // 1 Hour preset
  const oneHourDate = calculateExpirationDate({ preset: '1h' });
  assert.ok(oneHourDate);
  const diffHours = (oneHourDate.getTime() - Date.now()) / (1000 * 60 * 60);
  assert.ok(diffHours >= 0.95 && diffHours <= 1.05);

  // 7 Days preset
  const sevenDaysDate = calculateExpirationDate({ preset: '7d' });
  assert.ok(sevenDaysDate);
  const diffDays = (sevenDaysDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  assert.ok(diffDays >= 6.95 && diffDays <= 7.05);
});

test('Expiration Calculation — Custom Units (Minutes, Hours, Days, Weeks)', () => {
  // Custom 45 minutes
  const customMins = calculateExpirationDate({
    preset: 'custom',
    customValue: 45,
    customUnit: 'minutes',
  });
  assert.ok(customMins);
  const diffMins = (customMins.getTime() - Date.now()) / (1000 * 60);
  assert.ok(diffMins >= 44 && diffMins <= 46);

  // Custom 2 weeks
  const customWeeks = calculateExpirationDate({
    preset: 'custom',
    customValue: 2,
    customUnit: 'weeks',
  });
  assert.ok(customWeeks);
  const diffWeeks = (customWeeks.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7);
  assert.ok(diffWeeks >= 1.95 && diffWeeks <= 2.05);
});

test('Expiration Formatting & Badges', () => {
  // Permanent
  const permStatus = formatExpirationStatus(null);
  assert.equal(permStatus.isPermanent, true);
  assert.equal(permStatus.isExpired, false);
  assert.equal(permStatus.badgeVariant, 'permanent');

  // Expired in past
  const pastIso = new Date(Date.now() - 60000).toISOString();
  const expStatus = formatExpirationStatus(pastIso);
  assert.equal(expStatus.isExpired, true);
  assert.equal(expStatus.badgeVariant, 'expired');

  // Warning (within 60 mins)
  const soonIso = new Date(Date.now() + 30 * 60000).toISOString();
  const soonStatus = formatExpirationStatus(soonIso);
  assert.equal(soonStatus.badgeVariant, 'warning');

  // Active (further in future)
  const futureIso = new Date(Date.now() + 24 * 3600000).toISOString();
  const futureStatus = formatExpirationStatus(futureIso);
  assert.equal(futureStatus.badgeVariant, 'active');
});
