import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, X, Bot, RotateCcw } from 'lucide-react';
import { WhatsAppIcon } from './social-icons';
import { WhatsAppConfig } from '../../utils/whatsapp';
import { getOpenStatus, hoursSummary } from '../../utils/gymHours';
import { getMemberships } from '../../utils/adminStore';

// Rule-based FAQ bot — keyword scoring, no AI service, nothing leaves the page.
//
// To teach it something new, add an entry to FAQS below. `keywords` may be
// single words (matched against whole words, so "try" won't fire on "country")
// or multi-word phrases (matched as a substring, and weighted higher because a
// phrase hit is a much stronger signal than a lone word).
//
// `answer` can be a string, or a function when the reply should reflect live
// data — prices come from the same store the pricing section reads, so the bot
// can never quote a figure the site doesn't show.

// The assistant's name. Change it here and it updates everywhere —
// header, greetings, introductions.
export const BOT_NAME = 'Flex';

const CATEGORIES = {
  PRICING: 'Pricing',
  VISIT: 'Visiting',
  TRAINING: 'Training',
  FACILITIES: 'Facilities',
};

const FAQS = [
  {
    id: 'pricing',
    category: CATEGORIES.PRICING,
    keywords: ['price', 'pricing', 'cost', 'costs', 'fee', 'fees', 'charge', 'charges', 'rate', 'rates', 'plan', 'plans', 'membership', 'how much', 'monthly', 'package'],
    question: 'What are the membership prices?',
    answer: () => {
      const plans = getMemberships();
      if (!plans.length) return 'Drop by for a tour and we will walk you through the current plans.';
      const lines = plans
        .map((plan) => `• ${plan.name} — ${plan.priceMonthly}/mo (${plan.priceYearly}/mo billed yearly)`)
        .join('\n');
      return `Here are our current plans:\n\n${lines}\n\nYearly billing saves about 20%. Your first session is free either way.`;
    },
  },
  {
    id: 'timing',
    category: CATEGORIES.VISIT,
    keywords: ['time', 'timing', 'timings', 'hour', 'hours', 'open', 'opens', 'close', 'closes', 'closed', 'shift', 'shifts', 'schedule', 'what time', 'when open'],
    question: 'What are your timings?',
    answer: () => {
      const status = getOpenStatus();
      const now = status.isOpen
        ? `We're open right now — ${status.detail.toLowerCase()}.`
        : `We're currently closed. ${status.detail}.`;
      return `${now}\n\nWe run two shifts, seven days a week:\n${hoursSummary}`;
    },
  },
  {
    id: 'trial',
    category: CATEGORIES.PRICING,
    keywords: ['trial', 'free', 'demo', 'try', 'sample', 'first session', 'test', 'trial session'],
    question: 'Do you offer a free trial?',
    answer:
      'Yes — your first session is completely free, and it includes a facility tour plus a body composition assessment. Book a "Facility Tour & Consult" slot, or just walk in during either shift.',
  },
  {
    id: 'joining',
    category: CATEGORIES.PRICING,
    keywords: ['join', 'joining', 'sign up', 'signup', 'enroll', 'admission', 'register', 'become member', 'joining fee'],
    question: 'How do I join?',
    answer:
      'Come in during any shift with a photo ID. We\'ll do a quick fitness assessment, help you pick a plan, and you can start training the same day. There is no separate joining or admission fee — you only pay for the plan you choose.',
  },
  {
    id: 'discounts',
    category: CATEGORIES.PRICING,
    keywords: ['discount', 'discounts', 'offer', 'offers', 'student', 'corporate', 'couple', 'referral', 'cheaper', 'deal'],
    question: 'Are there any discounts?',
    answer:
      'A few: 15% off for students with a valid ID, 20% off a second pass on our couple plan, and corporate rates for groups of 3 or more. Yearly billing also saves around 20% over monthly.',
  },
  {
    id: 'payment',
    category: CATEGORIES.PRICING,
    keywords: ['payment', 'pay', 'upi', 'card', 'cash', 'emi', 'installment', 'gpay', 'paytm', 'online payment'],
    question: 'What payment methods do you accept?',
    answer:
      'Cash, UPI (GPay, PhonePe, Paytm), and all major debit and credit cards at the front desk. Quarterly and yearly plans can be split into instalments — ask at reception.',
  },
  {
    id: 'freeze',
    category: CATEGORIES.PRICING,
    // Phrases so "pause my membership" beats the pricing FAQ's 'membership'.
    keywords: [
      'freeze', 'pause', 'hold', 'cancel', 'cancellation', 'refund', 'transfer', 'suspend',
      'pause my membership', 'pause membership', 'freeze membership', 'freeze my membership',
      'cancel my membership', 'cancel membership', 'stop my membership',
    ],
    question: 'Can I pause or cancel my membership?',
    answer:
      'Yes. You can freeze a membership for up to 30 days per year at no cost — just tell us before the break starts. Memberships are transferable to a family member. For refunds, talk to us at the desk and we\'ll sort out something fair.',
  },
  {
    id: 'trainers',
    category: CATEGORIES.TRAINING,
    keywords: ['trainer', 'trainers', 'coach', 'coaches', 'personal training', 'instructor', 'personal trainer', 'pt'],
    question: 'Can I get a personal trainer?',
    answer:
      'We have 8 certified coaches covering strength, yoga, fat loss and functional training. Personal training is included in the Premium plan (8 sessions a month), or you can book a single 1-on-1 trial session to see how you get on with a coach first.',
  },
  {
    id: 'classes',
    category: CATEGORIES.TRAINING,
    keywords: ['class', 'classes', 'yoga', 'zumba', 'crossfit', 'hiit', 'cardio', 'group', 'spin', 'dance', 'group class'],
    question: 'What classes do you run?',
    answer:
      'Yoga, Zumba, CrossFit, HIIT, strength and cardio classes run right through both shifts. Classes are unlimited on the Standard and Premium plans. The Class Schedule section on this page has the full weekly timetable.',
  },
  {
    id: 'diet',
    category: CATEGORIES.TRAINING,
    // 'diet plan' is a phrase so it outranks the pricing FAQ's 'plan' keyword.
    keywords: ['diet', 'nutrition', 'meal', 'food', 'weight loss', 'lose weight', 'gain', 'muscle', 'protein', 'supplement', 'diet plan', 'diet plans', 'nutrition plan'],
    question: 'Do you provide diet plans?',
    answer:
      'Yes. Standard members get a monthly nutrition consult, and Premium members get a fully customised diet plan built around their goal and food preferences. Our coaches plan around regular Indian home food — no crash diets.',
  },
  {
    id: 'beginner',
    category: CATEGORIES.TRAINING,
    keywords: ['beginner', 'beginners', 'new', 'never', 'first time', 'start', 'starting', 'nervous', 'scared', 'guidance'],
    question: 'I have never worked out before — is that okay?',
    answer:
      'Completely okay, and very common. Every new member gets an orientation session where a coach walks you through the equipment and sets a starting routine. You will not be left to figure it out alone.',
  },
  {
    id: 'booking',
    category: CATEGORIES.VISIT,
    keywords: ['book', 'booking', 'appointment', 'slot', 'reserve', 'reservation', 'book session', 'book a slot'],
    question: 'How do I book a session?',
    answer:
      'Use the Book Now button at the top of the page, or the booking form near the bottom. Pick a service, date and time slot — you get an instant booking reference and a WhatsApp confirmation straight away.',
  },
  {
    id: 'location',
    category: CATEGORIES.VISIT,
    keywords: ['where', 'location', 'address', 'reach', 'direction', 'directions', 'located', 'map', 'metro', 'how to reach'],
    question: 'Where are you located?',
    answer:
      '01, Gollahalli Main Rd, Shikaripalya, Electronic City, Bengaluru, Karnataka 560100 — in Electronic City. The address links straight to Google Maps in the footer if you want directions.',
  },
  {
    id: 'parking',
    category: CATEGORIES.VISIT,
    keywords: ['parking', 'park', 'bike', 'car', 'scooter', 'vehicle', 'two wheeler'],
    question: 'Is there parking?',
    answer:
      'Yes — free covered parking for both two and four wheelers, with 24/7 camera surveillance.',
  },
  {
    id: 'first-visit',
    category: CATEGORIES.VISIT,
    keywords: ['bring', 'wear', 'carry', 'need', 'shoes', 'towel', 'what should', 'clothes', 'dress'],
    question: 'What should I bring on my first visit?',
    answer:
      'Clean indoor training shoes, comfortable workout clothes, a water bottle, and a photo ID if you plan to sign up. Towels are provided, and lockers are available on the day — no need to bring your own lock.',
  },
  {
    id: 'peak',
    category: CATEGORIES.VISIT,
    keywords: ['crowd', 'crowded', 'busy', 'peak', 'rush', 'quiet', 'empty', 'best time'],
    question: 'When is the gym least crowded?',
    answer:
      'Mornings between 10 AM and 1 PM, and evenings after 8:30 PM, are the quietest. The busiest stretch is 6 PM to 8 PM on weekdays, so come a little earlier or later if you prefer space on the floor.',
  },
  {
    id: 'women',
    category: CATEGORIES.FACILITIES,
    keywords: ['women', 'ladies', 'female', 'girl', 'safe', 'safety', 'separate', 'women only'],
    question: 'Is it comfortable for women?',
    answer:
      'Yes. We have female coaches on duty in both shifts, separate changing and locker rooms, and staff on the floor throughout. Plenty of our members are women training solo — mornings tend to be especially relaxed.',
  },
  {
    id: 'age',
    category: CATEGORIES.FACILITIES,
    keywords: ['age', 'old', 'young', 'kid', 'kids', 'teen', 'child', 'minimum age', 'senior', 'age limit'],
    question: 'Is there an age limit?',
    answer:
      'Members from 16 upwards can train on the main floor; under 18 needs a parent or guardian to sign the form. We also coach plenty of members over 50 — programmes are adjusted to joints and mobility, not just age.',
  },
  {
    id: 'facilities',
    category: CATEGORIES.FACILITIES,
    keywords: ['facility', 'facilities', 'equipment', 'machine', 'machines', 'sauna', 'steam', 'shower', 'locker', 'amenities', 'what do you have'],
    question: 'What facilities do you have?',
    answer:
      'A cardio deck, a full free-weights and strength floor, a functional turf area, a group class studio, plus steam and sauna recovery rooms, showers and lockers. The Facilities section on this page has photos of each area.',
  },
  {
    id: 'contact',
    category: CATEGORIES.VISIT,
    keywords: ['contact', 'phone', 'call', 'number', 'whatsapp', 'email', 'talk', 'speak', 'reach you'],
    question: 'How do I contact you?',
    answer:
      'Tap the WhatsApp button below to message us directly, or use the call button in the header. Our full contact details and address are in the footer.',
  },
];

const GREETINGS = ['hi', 'hii', 'hiii', 'hello', 'helo', 'hey', 'heya', 'hola', 'namaste', 'yo', 'sup', 'good morning', 'good evening', 'good afternoon'];
const THANKS = ['thanks', 'thank', 'thankyou', 'thx', 'ty', 'great', 'awesome', 'cool', 'nice', 'perfect', 'ok', 'okay', 'got'];
const BYES = ['bye', 'goodbye', 'see you', 'later', 'cya'];
const IDENTITY = ['who are you', 'your name', 'whats your name', 'what is your name', 'are you a bot', 'are you human', 'who is this'];
const HELP = ['help', 'what can you do', 'options', 'menu', 'what can i ask'];

// The three things people ask first — offered as chips after a greeting.
const STARTER_CHIPS = [
  'What are the membership prices?',
  'What are your timings?',
  'Do you offer a free trial?',
];

/** Time-of-day aware hello, so it doesn't say "good morning" at 9pm. */
function timeOfDayGreeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const statusSentence = () => {
  const status = getOpenStatus();
  return status.isOpen
    ? "We're open right now, so you can walk in any time."
    : `We're closed at the moment — ${status.detail.toLowerCase()}.`;
};

// Rotated so a repeat "hi" doesn't return the identical line.
const GREETING_OPENERS = [
  (name) => `${timeOfDayGreeting()}! I'm ${name}, your Gymnation assistant. 💪`,
  (name) => `Hey there! ${name} here from Gymnation. 👋`,
  (name) => `Hi! I'm ${name}, the Gymnation assistant.`,
];

let greetingTurn = 0;

const greetingReply = () => {
  const opener = GREETING_OPENERS[greetingTurn % GREETING_OPENERS.length](BOT_NAME);
  greetingTurn += 1;
  return {
    text: `${opener}\n\n${statusSentence()}\n\nWhat are you looking for today? Pick one below, ask me anything, or tap the WhatsApp button if you'd rather talk to the team directly.`,
    chips: STARTER_CHIPS,
  };
};

const normalise = (text) =>
  text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Filler words that must never earn a match. Without this, "in" prefix-matches
// "installment" and "you" matches "young", so "which country are you in" scores
// against payment, trainers and age.
const STOPWORDS = new Set([
  'what', 'when', 'where', 'which', 'your', 'yours', 'does', 'have', 'here',
  'give', 'want', 'need', 'this', 'that', 'them', 'they', 'from', 'with',
  'about', 'there', 'their', 'much', 'many', 'some', 'also', 'just', 'like',
  'will', 'would', 'could', 'should', 'been', 'being', 'were', 'know', 'tell',
]);

const MIN_STEM_LENGTH = 4;

/** Scores an FAQ against the input. Phrases outweigh single words. */
function scoreFaq(faq, cleaned, words) {
  let score = 0;

  faq.keywords.forEach((keyword) => {
    if (keyword.includes(' ')) {
      // Multi-word phrase: a hit is a strong signal.
      if (cleaned.includes(keyword)) score += 4;
      return;
    }
    // Whole-word match, so "try" doesn't fire on "country".
    if (words.includes(keyword)) {
      score += 2;
      return;
    }
    // Light credit for plurals and simple stems ("class" vs "classes").
    // Both sides must be long enough and not filler, or short words prefix-match
    // unrelated long keywords.
    if (keyword.length > MIN_STEM_LENGTH) {
      const stemHit = words.some(
        (word) =>
          word.length >= MIN_STEM_LENGTH &&
          !STOPWORDS.has(word) &&
          (word.startsWith(keyword) || keyword.startsWith(word))
      );
      if (stemHit) score += 1;
    }
  });

  return score;
}

function resolveAnswer(faq) {
  return typeof faq.answer === 'function' ? faq.answer() : faq.answer;
}

/** @returns {{ text: string, chips?: string[] }} */
function respondTo(input) {
  const cleaned = normalise(input);
  const words = cleaned.split(' ').filter(Boolean);

  if (!cleaned) return { text: `Ask me anything about Gymnation — I'm ${BOT_NAME}.` };

  // Checked before the length guard: these are questions, not filler.
  if (IDENTITY.some((phrase) => cleaned.includes(phrase))) {
    return {
      text: `I'm ${BOT_NAME}, the Gymnation assistant — a simple helper bot, not a real person. I can answer questions about pricing, timings, classes, trainers and facilities. For anything I can't cover, the WhatsApp button below reaches the actual team.`,
      chips: STARTER_CHIPS,
    };
  }

  if (HELP.some((phrase) => cleaned === phrase || cleaned.includes(phrase))) {
    return {
      text: `Happy to help! I know about pricing and plans, timings, free trials, classes, trainers, diet plans, facilities, parking and joining. Pick a category below, or just type your question in your own words.`,
      chips: STARTER_CHIPS,
    };
  }

  // Short social messages only — avoids "ok but how much" being read as thanks.
  if (words.length <= 3) {
    if (words.some((word) => GREETINGS.includes(word)) || GREETINGS.includes(cleaned)) {
      return greetingReply();
    }
    if (words.some((word) => BYES.includes(word))) {
      return {
        text: `See you at the gym! 💪 If anything else comes up, I'm here — or message the team on WhatsApp any time.`,
      };
    }
    if (words.some((word) => THANKS.includes(word))) {
      return {
        text: 'Happy to help! Anything else you want to know?',
        chips: STARTER_CHIPS,
      };
    }
  }

  const ranked = FAQS.map((faq) => ({ faq, score: scoreFaq(faq, cleaned, words) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) {
    return {
      text:
        "Sorry, I don't have an answer for that one yet — I'm still learning. Try one of these, or tap the WhatsApp button below and the team will reply personally.",
      chips: STARTER_CHIPS,
    };
  }

  const best = ranked[0];
  // When the runner-up is nearly as strong, offer it rather than guessing.
  const alternates = ranked
    .slice(1, 3)
    .filter((entry) => entry.score >= best.score - 1)
    .map((entry) => entry.faq.question);

  return { text: resolveAnswer(best.faq), chips: alternates.length ? alternates : undefined };
}

const openingMessage = () => ({
  from: 'bot',
  text: `${timeOfDayGreeting()}! I'm ${BOT_NAME}, your Gymnation assistant. 💪\n\n${statusSentence()}\n\nHow can I help you today?`,
  chips: STARTER_CHIPS,
});

export default function FaqChatbot({ open, onClose }) {
  const [messages, setMessages] = useState(() => [openingMessage()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [category, setCategory] = useState(CATEGORIES.PRICING);
  const scrollRef = useRef(null);
  const timers = useRef([]);

  const status = getOpenStatus();

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${WhatsAppConfig.ActiveNumber}&text=${encodeURIComponent(
    'Hi Gymnation! I have a question.'
  )}`;

  const suggestions = useMemo(
    () => FAQS.filter((faq) => faq.category === category).slice(0, 4),
    [category]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, open]);

  // Don't leave pending replies running after the panel closes.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const ask = (text) => {
    if (!text.trim() || isTyping) return;

    setMessages((prev) => [...prev, { from: 'user', text }]);
    setInput('');
    setIsTyping(true);

    const reply = respondTo(text);
    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'bot', ...reply }]);
      setIsTyping(false);
    }, 450);
    timers.current.push(timer);
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setIsTyping(false);
    setMessages([openingMessage()]);
  };

  if (!open) return null;

  return (
    // Width shrinks to fit narrow phones; height leaves ~10rem for the "Ask us"
    // and WhatsApp buttons stacked below it. svh (not vh) so mobile browser
    // chrome can't push the panel off screen.
    <div className="flex h-[32rem] max-h-[calc(100svh-10rem)] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/60 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 p-1.5 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white">
              {BOT_NAME} <span className="font-medium text-slate-500">· Gymnation</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.isOpen ? 'bg-emerald-400' : 'bg-slate-500'}`}
              />
              <span className="truncate">
                {status.isOpen ? 'Gym is open now' : status.detail}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            aria-label="Start over"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
            onClick={reset}
            title="Start over"
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Close chat"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4" ref={scrollRef}>
        {messages.map((message, index) => (
          <div key={`${message.from}-${index}`}>
            <div className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  message.from === 'user'
                    ? 'rounded-br-sm bg-gradient-to-br from-orange-500 to-amber-500 text-white'
                    : 'rounded-bl-sm border border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                {message.text}
              </div>
            </div>

            {/* Follow-up suggestions attached to a bot reply */}
            {message.chips && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {message.chips.map((chip) => (
                  <button
                    className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-[11px] font-semibold text-orange-300 transition-colors hover:bg-orange-500/20 sm:px-2.5 sm:py-1 sm:text-[10px]"
                    key={chip}
                    onClick={() => ask(chip)}
                    type="button"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-800 bg-slate-900 px-3.5 py-3">
              {[0, 150, 300].map((delay) => (
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-500"
                  key={delay}
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested questions, grouped so the list stays short */}
      <div className="border-t border-slate-800/80 px-3 pt-2.5">
        <div className="flex flex-wrap gap-1">
          {Object.values(CATEGORIES).map((name) => (
            <button
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors sm:px-2 sm:py-0.5 ${
                category === name
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              key={name}
              onClick={() => setCategory(name)}
              type="button"
            >
              {name}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5 pb-1">
          {suggestions.map((faq) => (
            <button
              className="max-w-full truncate rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-[11px] font-semibold text-slate-400 transition-colors hover:border-orange-500/40 hover:text-white sm:px-2.5 sm:py-1 sm:text-[10px]"
              key={faq.id}
              onClick={() => ask(faq.question)}
              type="button"
            >
              {faq.question}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <form
        className="border-t border-slate-800 bg-slate-900/60 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
      >
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 focus-within:border-orange-500/60">
          <label className="sr-only" htmlFor="faq-input">
            Ask a question
          </label>
          <input
            autoComplete="off"
            // 16px on mobile: anything smaller makes iOS Safari zoom the page
            // on focus, which leaves the layout scrolled sideways.
            className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-slate-100 placeholder:text-slate-600 focus:outline-none sm:text-xs"
            id="faq-input"
            onChange={(event) => setInput(event.target.value)}
            placeholder={`Message ${BOT_NAME}…`}
            value={input}
          />
          <button
            aria-label="Send"
            className="shrink-0 rounded-md p-1 text-orange-500 transition-colors hover:text-orange-400 disabled:opacity-40"
            disabled={!input.trim() || isTyping}
            type="submit"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <a
          className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#25D366]/10 py-2 text-[11px] font-bold text-[#25D366] transition-colors hover:bg-[#25D366]/20"
          href={whatsappUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <WhatsAppIcon className="h-3.5 w-3.5" />
          Talk to a human on WhatsApp
        </a>
      </form>
    </div>
  );
}
