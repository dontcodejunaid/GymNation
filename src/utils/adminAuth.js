// Admin gate for the owner panel.
//
// ⚠️ This is a front-end-only gate, not real security. The credentials below
// ship inside the JavaScript bundle, so anyone who opens DevTools can read them
// or flip the session flag by hand. It keeps casual visitors out of the panel;
// it does NOT protect the data. Moving auth to a real backend (or a service
// like Firebase/Supabase Auth) is the fix when this needs to be genuinely
// locked down.

// Each admin can sign in with any of their listed IDs (email or username).
// Remove an entry to revoke that person's access.
const ADMINS = [
  {
    name: 'Zoya',
    ids: ['zoyasayeedaahmed@gmail.com', 'zoyasayeedaahmed05@gmail.com'],
    password: 'ZOYA@123',
  },
  {
    name: 'Junaid',
    ids: ['dontcodejunaid', 'dontcodejunaid@gmail.com'],
    password: 'JUNAID@123',
  },
  {
    name: 'Yaqub',
    ids: ['yaqubahmed8017@gmail.com'],
    password: 'YAQUB@123',
  },
  {
    name: 'Sourav',
    ids: ['souravbrave324@gmail.com'],
    password: 'SOURAV@123',
  },
  {
    name: 'Satyam',
    ids: ['satyam@gmail.com'],
    password: '123456',
  },
];

const SESSION_KEY = 'gymnation_admin_session';

/**
 * @returns {{ ok: boolean, error?: string }}
 */
export function login(identifier, password, remember) {
  const cleanId = (identifier || '').trim().toLowerCase();

  const admin = ADMINS.find((entry) => entry.ids.includes(cleanId));

  // Check the password even when the ID is unknown, so a wrong username and a
  // wrong password fail the same way and neither can be probed separately.
  if (!admin || password !== admin.password) {
    return { ok: false, error: 'Incorrect email or password.' };
  }

  const session = JSON.stringify({
    email: cleanId,
    name: admin.name,
    at: new Date().toISOString(),
  });

  // "Remember me" survives a browser restart; otherwise the session dies with the tab.
  if (remember) {
    localStorage.setItem(SESSION_KEY, session);
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, session);
    localStorage.removeItem(SESSION_KEY);
  }

  return { ok: true };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const isLoggedIn = () => getSession() !== null;

/** Email the last "remember me" login used, to prefill the form. */
export function getRememberedEmail() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw).email : '';
  } catch {
    return '';
  }
}
