import vikramImg from '../assets/trainers/vikram.png';
import priyaImg from '../assets/trainers/priya.png';
import rahulImg from '../assets/trainers/rahul.png';
import ananyaImg from '../assets/trainers/ananya.png';
import karanImg from '../assets/trainers/karan.png';
import nehaImg from '../assets/trainers/neha.png';

export const TRAINER_IMAGES = {
  'tr-1': vikramImg,
  'tr-2': priyaImg,
  'tr-3': rahulImg,
  'tr-4': ananyaImg,
  'tr-5': karanImg,
  'tr-6': nehaImg,
  'vikram-sharma': vikramImg,
  'priya-kapoor': priyaImg,
  'rahul-verma': rahulImg,
  'ananya-roy': ananyaImg,
  'karan-mehra': karanImg,
  'neha-singh': nehaImg,
  'vikram': vikramImg,
  'priya': priyaImg,
  'rahul': rahulImg,
  'ananya': ananyaImg,
  'karan': karanImg,
  'neha': nehaImg,
};

export const TRAINER_PHOTO_MAP = TRAINER_IMAGES;

export const INITIAL_TRAINERS = [
  {
    id: 'tr-1',
    name: 'Vikram Sharma',
    role: 'Head Strength Coach & Owner',
    specialties: ['Strength & Conditioning', 'Bodybuilding', 'Powerlifting'],
    experience: '8+ Years',
    rating: 4.9,
    reviewsCount: 142,
    photo: vikramImg,
    bio: 'Former national powerlifter specializing in progressive overload, muscle hypertrophy, and custom athletic prep.',
    certifications: ['ACE Certified Personal Trainer', 'CSCS Strength Coach'],
    available: true,
    shiftHours: 'Morning (6 AM - 12 PM) & Evening (5 PM - 9 PM)',
    availableSlots: ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'],
    instagram: '@vikram_gymnation',
  },
  {
    id: 'tr-2',
    name: 'Priya Kapoor',
    role: 'Senior Yoga & Pilates Instructor',
    specialties: ['Hatha Yoga', 'Vinyasa Flow', 'Core & Mobility'],
    experience: '6+ Years',
    rating: 4.9,
    reviewsCount: 118,
    photo: priyaImg,
    bio: 'Dedicated to body alignment, mindfulness, and functional flexibility to alleviate posture issues and build core strength.',
    certifications: ['RYT 500 Yoga Alliance', 'Mat Pilates Specialist'],
    available: true,
    shiftHours: 'Morning (6 AM - 11 AM) & Evening (5 PM - 9 PM)',
    availableSlots: ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'],
    instagram: '@priya_yoga_fit',
  },
  {
    id: 'tr-3',
    name: 'Rahul Verma',
    role: 'Fat Loss & Functional Fitness Coach',
    specialties: ['Fat Loss', 'HIIT', 'Calisthenics'],
    experience: '5+ Years',
    rating: 4.8,
    reviewsCount: 96,
    photo: rahulImg,
    bio: 'High-energy transformation coach focused on rapid calorie burning, agility, and sustainable lifestyle changes.',
    certifications: ['ISSA Certified Trainer', 'TRX Suspension Master'],
    available: true,
    shiftHours: 'Morning Shift (6 AM - 1 PM)',
    availableSlots: ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'],
    instagram: '@rahul_hiit_fit',
  },
  {
    id: 'tr-4',
    name: 'Ananya Roy',
    role: 'Zumba & Aerobics Lead',
    specialties: ['Zumba', 'Cardio Dance', 'Weight Loss'],
    experience: '4+ Years',
    rating: 4.9,
    reviewsCount: 88,
    photo: ananyaImg,
    bio: 'Licensed Zumba instructor making workouts fun, dynamic, and effective for all fitness levels.',
    certifications: ['ZIN™ Licensed Instructor', 'Group Fitness Cert'],
    available: true,
    shiftHours: 'Morning (6:30 AM - 11 AM) & Evening (5 PM - 8 PM)',
    availableSlots: ['06:00 AM', '07:00 AM', '08:00 AM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'],
    instagram: '@ananya_zumba',
  },
  {
    id: 'tr-5',
    name: 'Karan Mehra',
    role: 'CrossFit & Conditioning Specialist',
    specialties: ['CrossFit', 'Olympic Lifting', 'Stamina'],
    experience: '7+ Years',
    rating: 4.8,
    reviewsCount: 104,
    photo: karanImg,
    bio: 'CrossFit Level-2 coach focusing on explosive power, stamina, mobility, and high-intensity workout routines.',
    certifications: ['CrossFit L2 Trainer', 'USA Weightlifting L1'],
    available: true,
    shiftHours: 'Evening Shift (12 PM - 9 PM)',
    availableSlots: ['12:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'],
    instagram: '@karan_crossfit',
  },
  {
    id: 'tr-6',
    name: 'Neha Singh',
    role: 'Nutritionist & Rehab Specialist',
    specialties: ['Posture Rehab', 'Sports Nutrition', 'Women Fitness'],
    experience: '5+ Years',
    rating: 4.9,
    reviewsCount: 112,
    photo: nehaImg,
    bio: 'Combines corrective exercise therapy with customized macronutrient nutrition plans for recovery and strength.',
    certifications: ['M.Sc. Sports Nutrition', 'NASM Corrective Exercise'],
    available: true,
    shiftHours: 'Morning (7 AM - 1 PM) & Evening (5:30 PM - 9:30 PM)',
    availableSlots: ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'],
    instagram: '@neha_fitnutri',
  },
];

export function getTrainerPhoto(trainerOrName, photoUrl) {
  let name = '';
  let url = photoUrl;

  if (trainerOrName && typeof trainerOrName === 'object') {
    name = trainerOrName.name || trainerOrName.trainer || '';
    url = trainerOrName.photo || trainerOrName.imageUrl || photoUrl;
  } else {
    name = String(trainerOrName || '');
  }

  // Check if url is a valid non-empty custom URL (http, https, data:image, or blob)
  if (
    url &&
    typeof url === 'string' &&
    url.trim() &&
    !url.includes('undefined') &&
    !url.includes('ui-avatars.com') &&
    (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:'))
  ) {
    return url;
  }

  // Direct lookup in local bundled asset map by slug / name / first name
  const map = (typeof TRAINER_IMAGES !== 'undefined' && TRAINER_IMAGES) ? TRAINER_IMAGES : {};

  const nameKey = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  if (nameKey && map[nameKey]) return map[nameKey];

  const firstName = name.toLowerCase().trim().split(' ')[0];
  if (firstName && map[firstName]) return map[firstName];

  try {
    const stored = JSON.parse(localStorage.getItem('gymnation_trainers') || '[]');
    const initialList = Array.isArray(INITIAL_TRAINERS) ? INITIAL_TRAINERS : [];
    const all = [...initialList, ...stored];
    const match = all.find(t => t && t.name && t.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (match && match.photo && typeof match.photo === 'string' && match.photo.trim() && !match.photo.startsWith('/assets/')) return match.photo;
    if (match && match.imageUrl && typeof match.imageUrl === 'string' && match.imageUrl.trim() && !match.imageUrl.startsWith('/assets/')) return match.imageUrl;
  } catch (e) {
    // fallback
  }

  const cleanName = (name || 'Duty Coach').trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=f97316&color=ffffff&bold=true&size=256`;
}

export const CLASS_CATEGORIES = [
  { id: 'All', label: 'All Classes' },
  { id: 'Yoga', label: 'Yoga & Flow', color: 'purple' },
  { id: 'Zumba', label: 'Zumba & Dance', color: 'pink' },
  { id: 'CrossFit', label: 'CrossFit & HIIT', color: 'orange' },
  { id: 'Strength', label: 'Strength & Muscle', color: 'emerald' },
  { id: 'Cardio', label: 'Cardio Blast', color: 'cyan' },
  { id: 'Others', label: 'Others / Special Class', color: 'amber' },
];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const INITIAL_SCHEDULE = [
  {
    id: 'sch-1',
    className: 'Morning Sunrise Yoga',
    category: 'Yoga',
    day: 'Monday',
    time: '06:30 AM - 07:30 AM',
    trainer: 'Priya Kapoor',
    trainerPhoto: priyaImg,
    room: 'Studio A (Mind & Body)',
    capacity: 15,
    booked: 11,
    level: 'All Levels',
    description: 'Start your morning with relaxing breathwork, spinal alignment, and flexibility poses.',
  },
  {
    id: 'sch-2',
    className: 'CrossFit WOD Surge',
    category: 'CrossFit',
    day: 'Monday',
    time: '07:30 AM - 08:30 AM',
    trainer: 'Karan Mehra',
    trainerPhoto: karanImg,
    room: 'CrossFit Arena',
    capacity: 20,
    booked: 16,
    level: 'Intermediate',
    description: 'High-intensity workout of the day incorporating kettlebells, rowers, and barbell complexes.',
  },
  {
    id: 'sch-3',
    className: 'Zumba Party Blast',
    category: 'Zumba',
    day: 'Monday',
    time: '06:00 PM - 07:00 PM',
    trainer: 'Ananya Roy',
    trainerPhoto: ananyaImg,
    room: 'Dance Studio',
    capacity: 25,
    booked: 21,
    level: 'All Levels',
    description: 'Full-body cardio session set to energetic Latin rhythms and popular chartbusters.',
  },
  {
    id: 'sch-4',
    className: 'Heavy Strength & Hypertrophy',
    category: 'Strength',
    day: 'Monday',
    time: '07:00 PM - 08:00 PM',
    trainer: 'Vikram Sharma',
    trainerPhoto: vikramImg,
    room: 'Free Weight Zone',
    capacity: 12,
    booked: 9,
    level: 'Advanced',
    description: 'Focused compound lift instruction covering bench press, deadlifts, and squats with proper form.',
  },
  {
    id: 'sch-5',
    className: 'Fat Burner HIIT Circuit',
    category: 'Cardio',
    day: 'Tuesday',
    time: '07:00 AM - 08:00 AM',
    trainer: 'Rahul Verma',
    trainerPhoto: rahulImg,
    room: 'Cardio Zone',
    capacity: 18,
    booked: 14,
    level: 'All Levels',
    description: 'Fast-paced interval stations designed to maximize calorie burn and metabolic rate.',
  },
  {
    id: 'sch-6',
    className: 'Power Pilates & Core',
    category: 'Yoga',
    day: 'Tuesday',
    time: '06:00 PM - 07:00 PM',
    trainer: 'Priya Kapoor',
    trainerPhoto: priyaImg,
    room: 'Studio A (Mind & Body)',
    capacity: 15,
    booked: 12,
    level: 'All Levels',
    description: 'Target deep core stability, oblique sculpting, and back strength.',
  },
  {
    id: 'sch-7',
    className: 'Zumba Fiesta',
    category: 'Wednesday',
    day: 'Wednesday',
    time: '06:30 AM - 07:30 AM',
    trainer: 'Ananya Roy',
    trainerPhoto: ananyaImg,
    room: 'Dance Studio',
    capacity: 25,
    booked: 19,
    level: 'All Levels',
    description: 'High-energy dance workout to kickstart your midweek morning routine.',
  },
  {
    id: 'sch-8',
    className: 'Olympic Weightlifting Clinic',
    category: 'Strength',
    day: 'Wednesday',
    time: '06:30 PM - 07:30 PM',
    trainer: 'Karan Mehra',
    trainerPhoto: karanImg,
    room: 'CrossFit Arena',
    capacity: 10,
    booked: 8,
    level: 'Intermediate',
    description: 'Technique drills for snatches, clean & jerks, and barbell efficiency.',
  },
  {
    id: 'sch-9',
    className: 'Functional Rehabilitation & Mobility',
    category: 'Yoga',
    day: 'Thursday',
    time: '07:00 AM - 08:00 AM',
    trainer: 'Neha Singh',
    trainerPhoto: nehaImg,
    room: 'Studio A (Mind & Body)',
    capacity: 12,
    booked: 7,
    level: 'All Levels',
    description: 'Joint mobility, foam rolling, posture realignment, and injury prevention.',
  },
  {
    id: 'sch-10',
    className: 'Metabolic Conditioning (MetCon)',
    category: 'Cardio',
    day: 'Thursday',
    time: '06:30 PM - 07:30 PM',
    trainer: 'Rahul Verma',
    trainerPhoto: rahulImg,
    room: 'Cardio Zone',
    capacity: 20,
    booked: 15,
    level: 'Intermediate',
    description: 'Sustained exertion training combining plyometrics, battle ropes, and sled pushes.',
  },
  {
    id: 'sch-11',
    className: 'Vinyasa Flow Yoga',
    category: 'Yoga',
    day: 'Friday',
    time: '06:30 AM - 07:30 AM',
    trainer: 'Priya Kapoor',
    trainerPhoto: priyaImg,
    room: 'Studio A (Mind & Body)',
    capacity: 15,
    booked: 13,
    level: 'All Levels',
    description: 'Continuous fluid movement synchronized with breath for stamina and peace of mind.',
  },
  {
    id: 'sch-12',
    className: 'Weekend Warriors CrossFit',
    category: 'CrossFit',
    day: 'Saturday',
    time: '08:00 AM - 09:30 AM',
    trainer: 'Karan Mehra',
    trainerPhoto: karanImg,
    room: 'CrossFit Arena',
    capacity: 25,
    booked: 22,
    level: 'All Levels',
    description: 'Team workout challenge designed for community fun and heavy endurance.',
  },
  {
    id: 'sch-13',
    className: 'Sunday Special Stretch & Chill',
    category: 'Yoga',
    day: 'Sunday',
    time: '09:00 AM - 10:00 AM',
    trainer: 'Neha Singh',
    trainerPhoto: nehaImg,
    room: 'Studio A (Mind & Body)',
    capacity: 20,
    booked: 10,
    level: 'All Levels',
    description: 'Deep tissue stretching, sound meditation, and active recovery for the week ahead.',
  },
];
