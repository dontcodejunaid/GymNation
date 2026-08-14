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
    profileData = { ...userProfileOrPhone, updatedAt: new Date().toISOString() };
    const phoneOrId = profileData.phone || profileData.email || profileData.uid || 'user';
    key = phoneOrId.toString().replace(/\D/g, '').slice(-10) || phoneOrId;
  } else {
    const phone = userProfileOrPhone;
    const name = maybeName;
    const email = maybeEmail;
    key = phone.replace(/\D/g, '').slice(-10);
    profileData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      updatedAt: new Date().toISOString()
    };
  }

  if (!key) return;
  profiles[key] = {
    ...(profiles[key] || {}),
    ...profileData
  };

  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

export function findUserProfile(identifier) {
  if (!identifier) return null;
  const profiles = getUserProfiles();
  
  // Direct key check
  if (profiles[identifier]) return profiles[identifier];

  // Check by last 10 digits of phone
  const cleanPhone = identifier.toString().replace(/\D/g, '').slice(-10);
  if (cleanPhone && profiles[cleanPhone]) return profiles[cleanPhone];

  // Search by email or phone property
  const all = Object.values(profiles);
  const cleanIdLower = identifier.toString().toLowerCase().trim();
  const matched = all.find((p) => 
    (p.email && p.email.toLowerCase().trim() === cleanIdLower) ||
    (p.phone && p.phone.replace(/\D/g, '').slice(-10) === cleanPhone) ||
    p.uid === identifier ||
    p.id === identifier
  );

  return matched || null;
}

export function findUserProfileByPhone(phone) {
  return findUserProfile(phone);
}
