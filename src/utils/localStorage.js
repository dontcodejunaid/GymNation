// LocalStorage Persistence Layer for Gymnation Bookings

const BOOKINGS_KEY = 'gymnation_bookings';

/**
 * Get all saved bookings from LocalStorage
 * @returns {Array} List of booking objects
 */
export function getBookings() {
  try {
    const data = localStorage.getItem(BOOKINGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading bookings from localStorage:', error);
    return [];
  }
}

/**
 * Save a new booking to LocalStorage
 * @param {Object} newBooking 
 * @returns {Object} Saved booking with reference ID
 */
export function saveBooking(bookingData) {
  const existingBookings = getBookings();

  // Generate unique booking reference ID (e.g. GN-84920)
  const randomId = Math.floor(10000 + Math.random() * 90000);
  const bookingWithId = {
    id: `GN-${randomId}`,
    ...bookingData,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  const updatedList = [bookingWithId, ...existingBookings];
  
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedList));
    if (bookingData?.phone && bookingData?.name) {
      saveUserProfile(bookingData.phone, bookingData.name, bookingData.email || '');
    }

    // Real-time class seat capacity update
    try {
      const rawClasses = localStorage.getItem('gymnation_classes');
      if (rawClasses) {
        const classes = JSON.parse(rawClasses);
        const updatedClasses = classes.map(c => {
          const isMatch = (bookingData.classId && c.id === bookingData.classId) ||
            (bookingData.service && (c.className === bookingData.service || bookingData.service.includes(c.className)));
          if (isMatch) {
            const cap = Number(c.capacity || 20);
            const currentBooked = Number(c.booked || 0);
            return { ...c, booked: Math.min(cap, currentBooked + 1) };
          }
          return c;
        });
        localStorage.setItem('gymnation_classes', JSON.stringify(updatedClasses));
      }
    } catch (err) {
      console.warn('Error updating class seats in saveBooking:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gymnation-schedule-update'));
    }
  } catch (error) {
    console.error('Error saving booking to localStorage:', error);
  }

  return bookingWithId;
}

/**
 * Check if a date, time slot & optional trainer is already booked for double-booking protection
 * @param {string} date 
 * @param {string} time 
 * @param {string} trainer Optional trainer name
 * @returns {boolean} True if slot is booked/conflict detected
 */
export function isSlotTaken(date, time, trainer = null) {
  const bookings = getBookings();
  return bookings.some(b => {
    if (b.status === 'Cancelled') return false;
    const sameSlot = b.date === date && b.time === time;
    if (!sameSlot) return false;

    // If specific trainer specified, check trainer collision
    if (trainer && trainer !== 'No Preference (Assign Any Available)') {
      return b.trainer === trainer || b.trainer === 'No Preference (Assign Any Available)';
    }

    return true;
  });
}

/**
 * Update booking lifecycle status
 * @param {string} id Booking reference ID
 * @param {string} newStatus 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
 * @returns {Array} Updated list of bookings
 */
export function updateBookingStatus(id, newStatus) {
  const bookings = getBookings();
  const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating booking status:', error);
  }
  return updated;
}

const PROFILES_KEY = 'gymnation_user_profiles';

export function getUserProfiles() {
  try {
    const data = localStorage.getItem(PROFILES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    return {};
  }
}

export function saveUserProfile(userProfileOrPhone, maybeName = '', maybeEmail = '') {
  if (!userProfileOrPhone) return;
  const profiles = getUserProfiles();

  let profileData = {};
  let key = '';

  if (typeof userProfileOrPhone === 'object') {
    const cleanPhone = (userProfileOrPhone.phone || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (userProfileOrPhone.email || '').toLowerCase().trim();

    // Check if an existing profile exists under phone, email, or UID to keep unified
    const existing = findUserProfile(cleanEmail) || findUserProfile(cleanPhone) || findUserProfile(userProfileOrPhone.uid) || {};

    profileData = {
      ...existing,
      ...userProfileOrPhone,
      phone: userProfileOrPhone.phone || existing.phone || '',
      email: (userProfileOrPhone.email || existing.email || '').toLowerCase().trim(),
      updatedAt: new Date().toISOString()
    };

    // Primary key prioritizes clean 10-digit phone, then email, then uid
    key = cleanPhone || (cleanEmail ? cleanEmail.replace(/@/g, '-at-').replace(/[^a-z0-9_-]+/g, '-') : '') || profileData.uid || 'user';
  } else {
    const phone = userProfileOrPhone;
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const cleanEmail = (maybeEmail || '').toLowerCase().trim();
    const existing = findUserProfile(cleanEmail) || findUserProfile(cleanPhone) || {};

    key = cleanPhone || (cleanEmail ? cleanEmail.replace(/@/g, '-at-').replace(/[^a-z0-9_-]+/g, '-') : 'user');
    profileData = {
      ...existing,
      name: (maybeName || existing.name || '').trim(),
      phone: phone.trim() || existing.phone || '',
      email: cleanEmail || existing.email || '',
      updatedAt: new Date().toISOString()
    };
  }

  if (!key) return;
  profiles[key] = {
    ...(profiles[key] || {}),
    ...profileData
  };

  // If both email and phone are present, create alias cross-reference keys so future lookups find the exact same record
  const cleanPhone = (profileData.phone || '').replace(/\D/g, '').slice(-10);
  const cleanEmail = (profileData.email || '').toLowerCase().trim();
  if (cleanPhone && cleanPhone.length >= 10) {
    profiles[cleanPhone] = profiles[key];
  }
  if (cleanEmail && cleanEmail.includes('@')) {
    const emailKey = cleanEmail.replace(/@/g, '-at-').replace(/[^a-z0-9_-]+/g, '-');
    profiles[emailKey] = profiles[key];
  }
  if (profileData.uid) {
    profiles[profileData.uid] = profiles[key];
  }

  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

export function findUserProfile(identifier) {
  if (!identifier) return null;
  const profiles = getUserProfiles();
  
  const rawStr = String(identifier).trim();
  const cleanIdLower = rawStr.toLowerCase();
  const cleanPhone = rawStr.replace(/\D/g, '').slice(-10);

  // Direct key check
  if (profiles[identifier]) return profiles[identifier];
  if (cleanPhone && profiles[cleanPhone]) return profiles[cleanPhone];
  if (cleanIdLower.includes('@')) {
    const emailKey = cleanIdLower.replace(/@/g, '-at-').replace(/[^a-z0-9_-]+/g, '-');
    if (profiles[emailKey]) return profiles[emailKey];
  }

  // Search by email, phone property, uid, or id match
  const all = Object.values(profiles);
  const matched = all.find((p) => {
    if (!p) return false;
    const pEmail = (p.email || '').toLowerCase().trim();
    const pPhone = (p.phone || '').replace(/\D/g, '').slice(-10);
    const pUid = p.uid || '';
    const pId = p.id || '';

    return (
      (cleanIdLower.includes('@') && pEmail === cleanIdLower) ||
      (cleanPhone && cleanPhone.length >= 10 && pPhone === cleanPhone) ||
      pUid === rawStr ||
      pId === rawStr
    );
  });

  return matched || null;
}

export function findUserProfileByPhone(phone) {
  return findUserProfile(phone);
}
