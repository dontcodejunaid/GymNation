// One-time migration of BodyFit-era browser storage into the Gymnation namespace.
//
// The rebrand renamed every storage key `bodyfit_*` -> `gymnation_*`. Those keys
// live in each visitor's own browser, so without this pass a returning member
// would silently lose their digital pass, bookings, progress log and referral
// code — the app would simply read the new key, find nothing, and treat them as
// a first-time visitor.
//
// The copy is deliberately non-destructive: legacy keys are left in place, so
// rolling back to an older build does not strand anyone's data either.

const KEY_MAP = {
  bodyfit_bookings: 'gymnation_bookings',
  bodyfit_classes: 'gymnation_classes',
  bodyfit_trainers: 'gymnation_trainers',
  bodyfit_memberships: 'gymnation_memberships',
  bodyfit_member_signups: 'gymnation_member_signups',
  bodyfit_newsletter_subscribers: 'gymnation_newsletter_subscribers',
  bodyfit_member_pass: 'gymnation_member_pass',
  bodyfit_about_data: 'gymnation_about_data',
  bodyfit_user_profiles: 'gymnation_user_profiles',
  bodyfit_progress_logs: 'gymnation_progress_logs',
  bodyfit_referral_code: 'gymnation_referral_code',
  bodyfit_referral_count: 'gymnation_referral_count',
  bodyfit_analytics_v1: 'gymnation_analytics_v1',
  bodyfit_admin_session: 'gymnation_admin_session',
};

const MIGRATION_FLAG = 'gymnation_storage_migrated_v1';

function migrateStore(store) {
  for (const [legacyKey, currentKey] of Object.entries(KEY_MAP)) {
    try {
      const legacyValue = store.getItem(legacyKey);
      // Never clobber data already written under the new key.
      if (legacyValue === null || store.getItem(currentKey) !== null) continue;
      store.setItem(currentKey, legacyValue);
    } catch {
      // A quota or serialisation problem on one key must not abort the rest.
    }
  }
}

export function migrateLegacyStorage() {
  if (typeof window === 'undefined') return;

  try {
    if (window.localStorage.getItem(MIGRATION_FLAG)) return;
  } catch {
    return; // Storage blocked (private mode, cookies off) — nothing to migrate.
  }

  // The admin session may live in either store depending on "Remember me".
  migrateStore(window.localStorage);
  try {
    migrateStore(window.sessionStorage);
  } catch {
    // sessionStorage unavailable; the localStorage pass above still ran.
  }

  try {
    window.localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
  } catch {
    // Flag is an optimisation only — a re-run is harmless and idempotent.
  }
}
