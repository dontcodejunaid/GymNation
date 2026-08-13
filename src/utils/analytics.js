/**
 * Internal Lightweight Analytics & Conversion Tracker
 */

const ANALYTICS_KEY = 'gymnation_analytics_v1';

function getStoredAnalytics() {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse analytics storage:', e);
  }
  return {
    totalVisitors: 1420,
    pageViews: 3840,
    trialBookings: 86,
    membershipPurchases: 47,
    revenueGenerated: 160125,
    mostPopularPlan: 'Standard (Gym + Classes)',
    recentEvents: []
  };
}

function saveAnalytics(data) {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save analytics storage:', e);
  }
}

export function trackEvent(eventType, eventData = {}) {
  const current = getStoredAnalytics();
  const newEvent = {
    type: eventType,
    data: eventData,
    timestamp: new Date().toISOString()
  };

  current.recentEvents = [newEvent, ...(current.recentEvents || [])].slice(0, 50);

  if (eventType === 'PAGE_VIEW') {
    current.pageViews += 1;
  } else if (eventType === 'TRIAL_BOOKED') {
    current.trialBookings += 1;
  } else if (eventType === 'MEMBERSHIP_PURCHASED') {
    current.membershipPurchases += 1;
    if (eventData.amount) {
      current.revenueGenerated += Number(eventData.amount);
    }
  }

  saveAnalytics(current);
}

export function getAnalyticsSummary() {
  const data = getStoredAnalytics();
  const conversionRate = data.totalVisitors > 0 
    ? (((data.trialBookings + data.membershipPurchases) / data.totalVisitors) * 100).toFixed(1)
    : '9.3';

  // Seed sample Booked Trial Members + Live Saved Pass
  const bookedTrialMembers = [
    { name: 'Aarav Sharma', phone: '+91 98765 43210', slot: '7:00 AM (Morning)', trainer: 'Rahul Sharma', status: 'Confirmed', date: 'Today' },
    { name: 'Sourav Sharma', phone: '+91 96209 96689', slot: '6:00 PM (Evening)', trainer: 'Karan Malhotra', status: 'Confirmed', date: 'Today' },
    { name: 'Riya Malhotra', phone: '+91 98123 45678', slot: '8:30 AM (Morning)', trainer: 'Neha Verma', status: 'Confirmed', date: 'Tomorrow' },
    { name: 'Vikram Nair', phone: '+91 98987 65432', slot: '7:30 PM (Evening)', trainer: 'Vikram Singh', status: 'Confirmed', date: 'Tomorrow' },
    { name: 'Sana Qureshi', phone: '+91 97654 32109', slot: '5:00 PM (Evening)', trainer: 'Priya Patel', status: 'Confirmed', date: '5 Aug' }
  ];

  // Seed sample Active Paid Members
  const activePaidMembers = [
    { name: 'Ananya Mehra', phone: '+91 98765 11223', plan: 'Standard (Gym + Classes)', amount: '₹2,500/mo', passId: 'GN-9842XJ', status: 'ACTIVE' },
    { name: 'Vikram Nair', phone: '+91 98987 65432', plan: 'Premium (Gym + PT + Diet)', amount: '₹4,500/mo', passId: 'GN-7731AB', status: 'ACTIVE' },
    { name: 'Sana Qureshi', phone: '+91 97654 32109', plan: 'Standard (Gym + Classes)', amount: '₹2,500/mo', passId: 'GN-5542KL', status: 'ACTIVE' },
    { name: 'Rohan Gupta', phone: '+91 98222 33445', plan: 'Basic (Gym Only)', amount: '₹1,500/mo', passId: 'GN-1129OP', status: 'ACTIVE' }
  ];

  // Include user's live active pass if generated
  try {
    const livePass = localStorage.getItem('gymnation_member_pass');
    if (livePass) {
      const parsed = JSON.parse(livePass);
      if (parsed.customer && parsed.customer.name) {
        activePaidMembers.unshift({
          name: parsed.customer.name,
          phone: parsed.customer.phone || '+91 98765 00000',
          plan: parsed.plan?.name || 'Standard Membership',
          amount: `₹${parsed.pricing?.totalAmount || '2,625'}`,
          passId: parsed.paymentResult?.paymentId ? `GN-${parsed.paymentResult.paymentId.slice(-6).toUpperCase()}` : 'GN-LIVE01',
          status: 'ACTIVE (LIVE)'
        });
      }
    }
  } catch (e) {
    console.error(e);
  }

  return {
    ...data,
    conversionRate,
    bookedTrialMembers,
    activePaidMembers
  };
}
