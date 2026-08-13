# 🏋️ Gymnation Fitness Centre Web Application

A modern, high-performance, and feature-rich Web Application designed for **Gymnation Fitness Centre**. Built using **React 19**, **Vite**, **Tailwind CSS v4**, **Framer Motion**, and **GSAP**, this application delivers an ultra-smooth, visually engaging user experience with interactive tools for fitness enthusiasts.

---

## 📸 Screenshots & Showcase

### 💥 Hero Section & Landing Banner
> *Dark-mode dynamic aesthetic with fast call-to-action buttons for trial booking and membership selection.*

![Gymnation Hero Banner](public/hero_section_1785909279707.png)

---

### 📅 Multi-Step Class & Trial Booking System with WhatsApp Integration
> *Seamless 4-step booking workflow (Service -> Time Slot -> Trainer -> Contact Details) with automatic instant calendar export (.ICS) and WhatsApp reservation integration.*

| 📝 Step 4: Details & Summary | 🎉 Pass Active Confirmation |
| :---: | :---: |
| ![Booking Form](public/booking_step4_filled_1785909596308.png) | ![Booking Pass](public/booking_success_1785909618711.png) |

---

### 📊 Health & Fitness Interactive Tools

#### 🧮 Interactive BMI & Calorie Macro Calculator
> *Real-time body mass index calculation, target daily calorie output, and exact macro splits (Protein, Carbs, Fats).*

![BMI Calculator](public/bmi_calculator_1785909307098.png)

#### 📈 Personal Body Measurement & Progress Tracker
> *Log weight, waist, chest, hips, and body fat percentage with local storage persistence and trend tracking.*

![Progress Tracker](public/progress_tracker_saved_1785909478555.png)

---

### 💳 Tiered Membership Plans (Monthly vs Yearly Discount Toggle)
> *Interactive pricing tiers with real-time billing frequency toggle and instant checkout.*

![Membership Tiers](public/membership_yearly_1785909690394.png)

---

### 🤖 AI Assistant & Interactive Support Chatbot
> *Instant answers for gym timings, location, class schedules, and trial pass inquiries.*

![AI Assistant Chatbot](public/assistant_timings_1785909659584.png)

---

### 🏋️‍♂️ State-of-the-Art Facilities & Equipment
> *Interactive showcase of gym equipment, functional training areas, and amenities.*

![Facilities Showcase](public/facilities_1785909324897.png)

---

### 📱 Mobile Responsive View
> *Fully optimized responsive design for seamless navigation across all smartphone and tablet devices.*

| 📱 Mobile Hero Banner | 💳 Mobile Membership Tiers |
| :---: | :---: |
| ![Mobile Hero View](public/mobile_hero_view.png) | ![Mobile Membership View](public/mobile_membership_view.png) |

| 🧮 Mobile BMI Calculator | 📅 Mobile Booking Workflow |
| :---: | :---: |
| ![Mobile BMI View](public/mobile_bmi_view.png) | ![Mobile Booking View](public/mobile_booking_view.png) |

---

## ✨ Key Features

- **⚡ Fast & Modern UI**: Built with React 19 and Vite for instant load times and hot-module replacement (HMR).
- **🎨 Glassmorphism & Sleek Dark Mode**: Micro-animations using Framer Motion and GSAP animations.
- **📅 Interactive Booking Engine**: Reserve free trial passes or personal trainer slots with auto-generated booking IDs.
- **📱 Instant WhatsApp Booking Alert**: Automatically formats and pre-fills WhatsApp messages for direct front-desk confirmation.
- **📆 Calendar Export**: One-click download of `.ics` calendar events and direct Google Calendar integration.
- **🧮 Comprehensive Health Suite**:
  - BMI & Macro Nutrient Calculator
  - Multi-Metric Body Measurement Progress Logger (Persisted via LocalStorage)
- **🤖 Smart Interactive Assistant**: Quick FAQ chatbot helper for common visitor queries.
- **💳 Dynamic Membership Billing**: Toggle between Monthly and discounted Yearly rates.
- **💬 Social Proof & Live Reviews**: Dynamic client feedback feed and trainer highlight profiles.

---

## 🛠️ Tech Stack & Dependencies

- **Frontend Core**: React 19, JavaScript (ESNext)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4, PostCSS, Autoprefixer
- **Animations**: Framer Motion, GSAP
- **Icons**: Lucide React, React Icons
- **Utility Libraries**: `clsx`, `tailwind-merge`, `class-variance-authority`, `@paper-design/shaders`
- **Linting**: Oxlint

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dontcodejunaid/BodyFit.git
   cd BodyFit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase API Keys & Environment Variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your Firebase Web App credentials obtained from the [Firebase Console](https://console.firebase.google.com/):
     ```env
     VITE_FIREBASE_API_KEY=AIzaSy...
     VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your-app-id
     VITE_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
     VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
     VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
     VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your web browser.

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   ```

---

## 📂 Project Structure

```
BodyFit/
├── public/                # Static assets, icons & README screenshots
├── src/
│   ├── assets/            # Media assets & background graphics
│   ├── components/        # React components
│   │   ├── ui/            # Reusable UI primitives & animated text
│   │   ├── About.jsx      # Gym history & overview
│   │   ├── BMICalculator.jsx # Health & macro tool
│   │   ├── BookingForm.jsx  # Multi-step booking modal workflow
│   │   ├── Facilities.jsx # Gym amenities showcase
│   │   ├── Hero.jsx       # Landing page hero banner
│   │   ├── MembershipPlans.jsx # Tiered pricing
│   │   ├── ProgressTracker.jsx # Body measurement logger
│   │   ├── Trainers.jsx   # Certified personal trainers list
│   │   └── ...
│   ├── context/           # React context providers
│   ├── App.jsx            # Main app container
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind CSS configuration & global styles
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔔 Membership Expiry Reminders

Members are nudged **5, 3 and 1 days** before their plan lapses. The logic lives in
`src/utils/membershipExpiry.js`; the **Renewals** tab in the admin portal is the console.

**What sends on its own, and what doesn't:**

| Channel | Behaviour |
| :--- | :--- |
| Email | Sends directly via EmailJS once `VITE_EMAILJS_*` is set. Without it, the message is composed and logged to the console so the flow still demos. |
| WhatsApp | Opens a pre-filled chat to the member. **A person must press Send** — there is no browser API that sends on a user's behalf. |

Reminders are dispatched **from the Renewals tab, not on a timer.** This is a static
site with no backend, so nothing can send while every tab is closed. Open the tab once
a day and clear the queue.

Each milestone is recorded in `localStorage['gymnation_expiry_reminders']`, keyed by
member *and* end date — so renewing a plan starts a fresh cycle automatically, and a
milestone missed while the site was closed still goes out (the most urgent one wins,
so a member first seen at 1 day left gets the 1-day message, not the stale 5-day one).

### Going fully automatic

Move it server-side — the milestone logic and message copy are written to be reused as-is:

1. Deploy a Firebase Cloud Function on a daily Cloud Scheduler cron (needs the Blaze plan).
2. Have it read the `membershipSignups` collection and call `getPendingReminders()`.
3. Post to an email provider and the WhatsApp Business API (a template message is
   required to open a conversation), then persist the ledger in Firestore rather than localStorage.

### Demoing it

The Renewals tab has **Preview as if today is…** (a date override), **Seed demo**
buttons that create members expiring in 5/3/1 days, a **Preview** toggle showing the
exact email and WhatsApp text, and **Reset send history**.

---

## 📄 License

This project is created for **Gymnation Fitness Centre**. All rights reserved.
