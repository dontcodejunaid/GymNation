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

export function saveUserProfile(phone, name, email = '') {
  if (!phone || !name) return;
  const profiles = getUserProfiles();
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (!digits) return;

  profiles[digits] = {
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

export function findUserProfileByPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '').slice(-10);
  const profiles = getUserProfiles();
  return profiles[digits] || null;
}
