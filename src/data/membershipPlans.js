// Default membership plans.
//
// These seed localStorage['gymnation_memberships'] the first time the site runs.
// After that the admin panel is the source of truth: edits there flow straight
// into the public MembershipPlans section.
//
// Prices are stored per billing cycle rather than pre-formatted, so the
// monthly/yearly toggle and the admin editor can share one shape.

export const DEFAULT_MEMBERSHIP_PLANS = [
  {
    id: 'basic-plan',
    name: 'Basic (Gym Only)',
    tier: 'Basic',
    description: 'Essential gym floor & weights access.',
    badgeText: 'Essential Access',
    badgeColor: '#F59E0B',
    gradient: 'gray',
    discountTag: '🎓 15% Student Discount',
    imageUrl:
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&auto=format&fit=crop&q=80',
    isFeatured: false,
    priceMonthly: '₹1,500',
    priceYearly: '₹1,200',
    yearlyTotal: '₹14,400/yr',
    features: [
      'Gym Floor & Weight Room Access',
      'Cardio & Functional Training Zone',
      'Standard Locker Room Access',
      'General Trainer Orientation',
    ],
  },
  {
    id: 'standard-plan',
    name: 'Standard (Gym + Classes)',
    tier: 'Standard',
    description: 'Gym access plus energetic group classes.',
    badgeText: 'Most Popular ⭐',
    badgeColor: '#FF5733',
    gradient: 'orange',
    discountTag: '👥 Couple Pass: 20% Off 2nd Pass',
    imageUrl:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80',
    isFeatured: true,
    priceMonthly: '₹2,500',
    priceYearly: '₹2,000',
    yearlyTotal: '₹24,000/yr',
    features: [
      'All Basic Plan Amenities Included',
      'Unlimited Group Classes (Yoga, HIIT)',
      'Dedicated Locker Room Access',
      'Monthly Diet & Nutrition Consult',
    ],
  },
  {
    id: 'premium-plan',
    name: 'Premium (Gym + PT + Diet)',
    tier: 'Premium',
    description: '1-on-1 coaching & custom nutrition.',
    badgeText: 'VIP Transformation 🔥',
    badgeColor: '#8B5CF6',
    gradient: 'purple',
    discountTag: '🏢 Corporate Group Rates (3+)',
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=80',
    isFeatured: false,
    priceMonthly: '₹4,500',
    priceYearly: '₹3,600',
    yearlyTotal: '₹43,200/yr',
    features: [
      'Unlimited Gym & Class Access',
      '8 Personal Trainer Sessions / Mo',
      'Custom Diet & Nutrition Plan',
      'Steam Bath & Sauna Privileges',
    ],
  },
];

/** Gradient presets GradientCard defines — keep in sync with its cva variants. */
export const PLAN_GRADIENTS = ['gray', 'orange', 'purple', 'green'];

/**
 * Turns a stored plan into the values the pricing card renders,
 * based on the active billing cycle.
 */
export function resolvePlanPricing(plan, billingCycle) {
  const isYearly = billingCycle === 'yearly';
  return {
    price: isYearly ? plan.priceYearly : plan.priceMonthly,
    period: isYearly && plan.yearlyTotal ? `/mo (${plan.yearlyTotal})` : '/mo',
    billingNote: isYearly ? 'Billed annually' : 'Billed monthly',
  };
}
