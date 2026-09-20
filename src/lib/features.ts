/**
 * Centralized Public Feature Flags for Dust and Dazzle (Phase 6: Heirloom).
 * 
 * In accordance with Phase 6 rules:
 * - Every public-facing feature sits behind an environment flag.
 * - Defaults to OFF (false) in production.
 * - Enabled via NEXT_PUBLIC_FEATURE_<NAME> === "true".
 * - Author-only admin features (/admin/*) do not require public flags.
 */

export type FeatureFlagName =
  | 'READER_TOOLS'
  | 'SEARCH'
  | 'AUDIO'
  | 'INSTALL'
  | 'READ_COUNTS'
  | 'TIMELINE';

export function isFeatureEnabled(flag: FeatureFlagName): boolean {
  switch (flag) {
    case 'READER_TOOLS':
      return process.env.NEXT_PUBLIC_FEATURE_READER_TOOLS === 'true';
    case 'SEARCH':
      return process.env.NEXT_PUBLIC_FEATURE_SEARCH === 'true';
    case 'AUDIO':
      return process.env.NEXT_PUBLIC_FEATURE_AUDIO === 'true';
    case 'INSTALL':
      return process.env.NEXT_PUBLIC_FEATURE_INSTALL === 'true';
    case 'READ_COUNTS':
      return process.env.NEXT_PUBLIC_FEATURE_READ_COUNTS === 'true';
    case 'TIMELINE':
      return process.env.NEXT_PUBLIC_FEATURE_TIMELINE === 'true';
    default:
      return false;
  }
}
