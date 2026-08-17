# 🏋️ Gymnation Fitness Centre Web App

A modern, high-performance, and feature-rich Web Application designed for **Gymnation Fitness Centre**. Built using **React 19**, **Vite**, **Tailwind CSS v4**, **Framer Motion**, **GSAP**, and **Google Firebase Firestore**, this application delivers an ultra-smooth, visually engaging user experience with interactive tools for fitness enthusiasts and robust management tools for gym owners.

---

## 📸 Screenshots & Showcase

### 💥 Hero Section & Landing Banner
> *Dark-mode dynamic aesthetic with high-definition dumbbell backdrop, animated layered typography, and instant call-to-action buttons for trial booking and membership selection.*

![Gymnation Hero Banner](public/hero_section_1785909279707.png)

---

### 📍 Dedicated Contact & Live Location Hub
> *Dedicated single-page contact view with direct front-desk calling, WhatsApp support, live interactive OpenStreetMap embed, operational shift timings, and quick inquiry dispatch.*

- **📞 Direct Phone & WhatsApp**: One-tap phone call (`+91 97420 41444`) and pre-filled WhatsApp trainer chat.
- **✉️ Official Inquiries**: Support helpdesk integration (`support@gymnation.com`).
- **🗺️ Interactive Map & Address**: Live map centered on Electronic City, Bengaluru (`12.8360° N, 77.6572° E`) with free member parking details.
- **⏰ Operating Shift Hours**: Clearly displayed morning (`6:00 AM - 1:00 PM`) and evening (`5:00 PM - 10:00 PM`) timings.
- **📝 Instant Message Form**: Quick inquiry submission with instant status feedback.

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

### 📱 Full Mobile Responsiveness
> *Fluid responsive design across smartphones, tablets, and desktops with touch-optimized drawer menus, horizontal tab navigation, and zero viewport overflow.*

| 📱 Mobile Hero Banner | 💳 Mobile Membership Tiers |
| :---: | :---: |
| ![Mobile Hero View](public/mobile_hero_view.png) | ![Mobile Membership View](public/mobile_membership_view.png) |

| 🧮 Mobile BMI Calculator | 📅 Mobile Booking Workflow |
| :---: | :---: |
| ![Mobile BMI View](public/mobile_bmi_view.png) | ![Mobile Booking View](public/mobile_booking_view.png) |

---

## ✨ Key Features

- **⚡ Fast & Modern UI**: Built with React 19 and Vite for instant load times and hot-module replacement (HMR).
- **🎨 Glassmorphism & Sleek Dark Mode**: Rich gradients, micro-animations, and animated typography using Framer Motion and GSAP.
- **📍 Contact & Navigation Hub**: Dedicated `/contact` view with Carto/OpenStreetMap tiles, shift timings, direct contact channels, and community links.
- **📅 Interactive Booking Engine**: Reserve free trial passes or personal trainer slots with auto-generated booking IDs.
- **📱 Instant WhatsApp Alerts**: Automatically formats and pre-fills WhatsApp messages for direct front-desk confirmation.
- **📆 Calendar Export**: One-click download of `.ics` calendar events and direct Google Calendar integration.
- **🧮 Comprehensive Health Suite**:
  - BMI & Macro Nutrient Calculator
  - Multi-Metric Body Measurement Progress Logger (Persisted via LocalStorage)
- **🤖 Smart Interactive Assistant**: Quick FAQ chatbot helper for common visitor queries.
- **💳 Dynamic Membership Billing**: Toggle between Monthly and discounted Yearly rates.
- **💬 Social Proof & Live Reviews**: Dynamic client feedback feed and trainer highlight profiles.
- **👑 Owner & Admin Portal (`#/admin`)**:
  - Real-time Cloud Booking Management & CSV exports
  - Live Membership Register & Automated Renewal Reminders
  - Special Offer & Announcement Banner Editor with Countdown Timers
  - Dynamic Trainer and Class Schedule Management
  - About Us Section Content and Founder Story Editor
  - Business Performance & Revenue Analytics Dashboard

---

## 🔒 Security Architecture & Protection

- **🛡️ Firestore Security Rules (`firestore.rules`)**:
  - Public read-only access for catalogs (Trainers, Plans, Classes, Offers, About Content).
  - Validation on customer bookings and signups.
  - Strict admin-only access for viewing member PII, financial details, and database modifications.
- **🔐 Tabnabbing & Navigation Safety**:
  - All external redirects and WhatsApp/Maps links enforce `rel="noopener noreferrer"`.
- **🚫 Zero Credential Leakage in Git**:
  - `.env` and production secrets are protected via `.gitignore` and excluded from repository commits.
- **📦 Dependency Health**:
  - Verified and patched with `npm audit` (0 known vulnerabilities).

---

## 🛠️ Tech Stack & Dependencies

- **Frontend Core**: React 19, JavaScript (ESNext)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4, PostCSS, Autoprefixer
- **Database & Auth**: Google Firebase Cloud Firestore, Firebase Authentication
- **Animations**: Framer Motion, GSAP
- **Icons**: Lucide React, React Icons
- **Utility Libraries**: `clsx`, `tailwind-merge`, `class-variance-authority`, `@paper-design/shaders`, `jspdf`, `qrcode.react`
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

4. **Deploy Firestore Security Rules**
   - Deploy `firestore.rules` directly using the Firebase CLI or paste the contents into the **Firebase Console → Firestore Database → Rules** tab:
     ```bash
     firebase deploy --only firestore:rules
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your web browser.

6. **Build for production**
   ```bash
   npm run build
   ```

7. **Preview production build**
   ```bash
   npm run preview
   ```

---

## 📂 Project Structure

```
BodyFit/
├── firestore.rules        # Production Firestore database security rules
├── public/                # Static assets, icons & README screenshots
├── src/
│   ├── assets/            # Branded media assets & dumbbell graphics
│   ├── components/        # React components
│   │   ├── admin/         # Owner & Admin Portal panels (Bookings, Renewals, Offers, etc.)
│   │   ├── ui/            # Reusable UI primitives, maps, and animated components
│   │   ├── About.jsx      # Gym history & overview
│   │   ├── BMICalculator.jsx # Health & macro calculator
│   │   ├── BookingForm.jsx  # Multi-step booking modal workflow
│   │   ├── ContactPage.jsx  # Dedicated Contact Hub & Location component
│   │   ├── Facilities.jsx # Gym amenities showcase
│   │   ├── Footer.jsx     # Global site footer with links & newsletter
│   │   ├── Hero.jsx       # Landing page hero banner
│   │   ├── MembershipPlans.jsx # Tiered pricing
│   │   ├── OffersBanner.jsx # Real-time countdown promotion bar
│   │   ├── ProgressTracker.jsx # Body measurement logger
│   │   ├── Trainers.jsx   # Certified personal trainers list
│   │   └── ...
│   ├── context/           # React context providers
│   ├── utils/             # Helper utilities (Firebase auth, WhatsApp, notifications)
│   ├── firebase.js        # Firebase Firestore & Auth integration
│   ├── App.jsx            # Main app container & routing logic
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind CSS configuration & global styles
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔔 Membership Expiry Reminders

Members are automatically tracked **5, 3 and 1 days** before their plan lapses. The logic lives in `src/utils/membershipExpiry.js`; the **Renewals** tab in the admin portal serves as the dashboard.

**Channels supported:**

| Channel | Behaviour |
| :--- | :--- |
| Email | Sends directly via EmailJS once `VITE_EMAILJS_*` is configured. |
| WhatsApp | Opens a pre-filled chat with personalized expiration alerts for direct dispatch. |

---

## 📄 License

This project is created for **Gymnation Fitness Centre**. All rights reserved.
