import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Mail, Smartphone, ArrowRight, ShieldCheck, CheckCircle2, User, Sparkles, MessageSquare, Camera, Edit3, Calendar, Heart, Award, ArrowLeft, Check, Save } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { signInWithGooglePopup, saveUserToFirebase, authenticateUserWithFirebase, getUserFromFirebase, sendFirebasePhoneOtp } from '../firebase';
import { WhatsAppIcon } from './ui/social-icons';
import { WhatsAppConfig, formatWhatsAppNumber } from '../utils/whatsapp';
import { sendOtpEmail } from '../utils/bookingNotifications';
import { saveUserProfile, findUserProfile } from '../utils/localStorage';
import CustomDatePicker from './ui/CustomDatePicker';

export default function GymNationAuthModal({ isOpen, onClose, onLoginSuccess, onLogoutSuccess, onOpenLegal, currentUser }) {
  const [authMode, setAuthMode] = useState('phone'); // 'phone' | 'email'
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'success' | 'profile' | 'edit-profile'
  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [fullName, setFullName] = useState('');
  
  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [phoneConfirmationResult, setPhoneConfirmationResult] = useState(null);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeUser, setActiveUser] = useState(currentUser || null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Prefer not to say',
    bloodGroup: '',
    emergencyContact: '',
    address: '',
    fitnessGoal: 'General Fitness',
    height: '',
    weight: '',
    photoURL: ''
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const otpInputRefs = [
    useRef(null), useRef(null), useRef(null),
    useRef(null), useRef(null), useRef(null)
  ];

  const countryCodes = [
    { code: '+91', label: 'India (+91)', flag: '🇮🇳' },
    { code: '+1', label: 'USA / Canada (+1)', flag: '🇺🇸' },
    { code: '+44', label: 'UK (+44)', flag: '🇬🇧' },
    { code: '+971', label: 'UAE (+971)', flag: '🇦🇪' },
    { code: '+65', label: 'Singapore (+65)', flag: '🇸🇬' },
  ];

  // Reset modal state and fetch latest Firestore profile when opened
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setIsEditingProfile(false);
      setErrorMsg('');
      setSaveSuccessMsg('');
      setIsLoading(false);
      setPhoneConfirmationResult(null);
      
      // Load current cached user first
      let active = null;
      try {
        const saved = localStorage.getItem('gymnation_user');
        active = saved ? JSON.parse(saved) : (currentUser || null);
        setActiveUser(active);
        if (active) {
          setProfileForm({
            name: active.name || '',
            phone: active.phone || '',
            email: active.email || '',
            dob: active.dob || '',
            gender: active.gender || 'Prefer not to say',
            bloodGroup: active.bloodGroup || '',
            emergencyContact: active.emergencyContact || '',
            address: active.address || '',
            fitnessGoal: active.fitnessGoal || 'General Fitness',
            height: active.height || '',
            weight: active.weight || '',
            photoURL: active.photoURL || ''
          });
        }
      } catch (e) {
        console.error(e);
      }

      // Fetch fresh remote profile from Firebase Firestore
      if (active && (active.phone || active.email || active.uid)) {
        const idToSearch = active.phone || active.email || active.uid;
        getUserFromFirebase(idToSearch).then((remoteData) => {
          if (remoteData) {
            const merged = { ...active, ...remoteData };
            setActiveUser(merged);
            localStorage.setItem('gymnation_user', JSON.stringify(merged));
            saveUserProfile(merged);
            setProfileForm({
              name: merged.name || '',
              phone: merged.phone || '',
              email: merged.email || '',
              dob: merged.dob || '',
              gender: merged.gender || 'Prefer not to say',
              bloodGroup: merged.bloodGroup || '',
              emergencyContact: merged.emergencyContact || '',
              address: merged.address || '',
              fitnessGoal: merged.fitnessGoal || 'General Fitness',
              height: merged.height || '',
              weight: merged.weight || '',
              photoURL: merged.photoURL || ''
            });
          }
        }).catch((err) => console.warn('Firestore refresh note:', err));
      }
    }
  }, [isOpen, currentUser]);

  // Countdown timer for OTP
  useEffect(() => {
    if (step !== 'otp' || canResend) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, canResend]);

  if (!isOpen) return null;

  // Outbound SMS Gateway Dispatcher
  const dispatchSmsOtp = async (targetPhone, code) => {
    try {
      const endpoint = import.meta.env.VITE_SMS_ENDPOINT;
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: targetPhone,
            message: `Your GymNation verification OTP is ${code}. Valid for 10 minutes. Do not share it with anyone.`,
          }),
        });
      } else {
        console.info(`[SMS GATEWAY DISPATCH] Outbound SMS OTP generated for ${targetPhone}: ${code}`);
      }
    } catch (err) {
      console.warn('SMS gateway dispatch warning:', err.message);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (authMode === 'phone') {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        setErrorMsg('Please enter a valid 10-digit phone number');
        return;
      }
    } else {
      if (!emailAddress || !emailAddress.includes('@')) {
        setErrorMsg('Please enter a valid email address');
        return;
      }
    }

    setIsLoading(true);

    if (authMode === 'phone') {
      const targetNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

      try {
        // Real Firebase Phone Authentication with SMS
        const confirmation = await sendFirebasePhoneOtp(targetNumber);
        setPhoneConfirmationResult(confirmation);
        setGeneratedOtp('');
        setOtpDigits(['', '', '', '', '', '']);
        setTimer(60);
        setCanResend(false);
        setIsLoading(false);
        setStep('otp');

        setTimeout(() => {
          if (otpInputRefs[0].current) otpInputRefs[0].current.focus();
        }, 150);
        return;
      } catch (phoneErr) {
        console.warn('Firebase Phone Auth SMS note:', phoneErr.code, phoneErr.message);
        // Fallback to in-app OTP & WhatsApp OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setPhoneConfirmationResult(null);
        dispatchSmsOtp(targetNumber, code);
        setOtpDigits(['', '', '', '', '', '']);
        setTimer(30);
        setCanResend(false);
        setIsLoading(false);
        setStep('otp');

        setTimeout(() => {
          if (otpInputRefs[0].current) otpInputRefs[0].current.focus();
        }, 150);
        return;
      }
    }

    // Email OTP Dispatch
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setPhoneConfirmationResult(null);
    setOtpDigits(['', '', '', '', '', '']);
    setTimer(30);
    setCanResend(false);
    setIsLoading(false);
    setStep('otp');
    sendOtpEmail(emailAddress, code);

    setTimeout(() => {
      if (otpInputRefs[0].current) otpInputRefs[0].current.focus();
    }, 150);
  };

  const handleSendWhatsAppOtp = () => {
    const target = authMode === 'phone' ? formatWhatsAppNumber(phoneNumber) : WhatsAppConfig.ActiveNumber;
    const messageText = `🏋️ *GYMNATION VERIFICATION CODE*\n\nYour security OTP is: *${generatedOtp}*\n\nValid for 10 minutes. Please do not share this code with anyone.`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${target}&text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Real Firebase Google Auth Sign-In with Popup
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const googleUser = await signInWithGooglePopup();

      // Check for existing profile in local cache or Firebase Firestore
      const lookupEmail = (googleUser.email || '').toLowerCase().trim();
      const existingLocal = findUserProfile(lookupEmail) || findUserProfile(googleUser.uid);
      let existingRemote = null;
      try {
        existingRemote = await getUserFromFirebase(lookupEmail) || await getUserFromFirebase(googleUser.uid);
      } catch (e) {
        console.warn('Google user profile lookup note:', e);
      }

      const existingProfile = existingRemote || existingLocal || {};

      const authenticatedUser = {
        ...existingProfile,
        name: existingProfile.name || googleUser.displayName || 'GymNation Athlete',
        email: googleUser.email || existingProfile.email || '',
        photoURL: existingProfile.photoURL || googleUser.photoURL || '',
        dob: existingProfile.dob || '',
        gender: existingProfile.gender || 'Prefer not to say',
        bloodGroup: existingProfile.bloodGroup || '',
        emergencyContact: existingProfile.emergencyContact || '',
        fitnessGoal: existingProfile.fitnessGoal || 'General Fitness',
        height: existingProfile.height || '',
        weight: existingProfile.weight || '',
        address: existingProfile.address || '',
        uid: googleUser.uid,
        provider: 'Google',
        lastLoginAt: new Date().toISOString(),
        loggedInAt: new Date().toISOString()
      };

      // Save user record in Firebase Firestore
      await saveUserToFirebase(authenticatedUser);

      localStorage.setItem('gymnation_user', JSON.stringify(authenticatedUser));
      saveUserProfile(authenticatedUser);
      setActiveUser(authenticatedUser);
      setIsLoading(false);
      setStep('success');

      if (onLoginSuccess) onLoginSuccess(authenticatedUser);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.warn('Google Sign-In Error:', err.code, err.message);
      setIsLoading(false);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google sign-in popup was closed.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Domain not authorized in Firebase Console.');
      } else if (err.code === 'auth/configuration-not-found') {
        // Firebase Console Google Auth provider not enabled yet
        const demoUser = {
          name: 'Demo Member (Google)',
          email: 'gymnation.member@gmail.com',
          photoURL: '',
          uid: `demo-user-${Date.now()}`,
          provider: 'Google (Demo)',
          loggedInAt: new Date().toISOString()
        };

        saveUserToFirebase(demoUser);

        localStorage.setItem('gymnation_user', JSON.stringify(demoUser));
        setActiveUser(demoUser);
        setStep('success');
        if (onLoginSuccess) onLoginSuccess(demoUser);
        setTimeout(() => onClose(), 1200);
      } else {
        setErrorMsg(err.message || 'Failed to authenticate with Google.');
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      if (otpInputRefs[nextIdx].current) otpInputRefs[nextIdx].current.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setErrorMsg('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    let firebaseAuthUser = null;

    // 1. If real Firebase Phone Confirmation is active, verify via Firebase Phone Auth
    if (phoneConfirmationResult) {
      try {
        const userCredential = await phoneConfirmationResult.confirm(entered);
        firebaseAuthUser = userCredential.user;
      } catch (confirmErr) {
        setIsLoading(false);
        if (confirmErr.code === 'auth/invalid-verification-code') {
          setErrorMsg('Invalid SMS OTP code. Please check the code sent to your phone.');
        } else {
          setErrorMsg(confirmErr.message || 'Failed to verify SMS code.');
        }
        return;
      }
    } else {
      // Strict fallback OTP validation
      if (generatedOtp && entered !== generatedOtp) {
        setIsLoading(false);
        setErrorMsg('Invalid OTP code. Please enter the correct 6-digit code received.');
        return;
      }
    }

    // Check for existing profile in local cache first
    const lookupKey = authMode === 'phone' ? `${countryCode} ${phoneNumber}` : emailAddress;
    const existingLocal = findUserProfile(lookupKey) || findUserProfile(phoneNumber);

    // Also check Firebase Firestore for existing user records
    let existingRemote = null;
    try {
      existingRemote = await getUserFromFirebase(lookupKey) || await getUserFromFirebase(phoneNumber) || await getUserFromFirebase(emailAddress);
    } catch (e) {
      console.warn('Existing profile lookup note:', e);
    }

    const existingProfile = existingRemote || existingLocal || {};

    const userObj = {
      ...existingProfile,
      name: existingProfile.name || fullName || (authMode === 'phone' ? `Member ${phoneNumber.slice(-4)}` : emailAddress.split('@')[0]),
      phone: authMode === 'phone' ? `${countryCode} ${phoneNumber}` : (existingProfile.phone || ''),
      email: authMode === 'email' ? emailAddress : (existingProfile.email || ''),
      photoURL: existingProfile.photoURL || '',
      dob: existingProfile.dob || '',
      gender: existingProfile.gender || 'Prefer not to say',
      bloodGroup: existingProfile.bloodGroup || '',
      emergencyContact: existingProfile.emergencyContact || '',
      fitnessGoal: existingProfile.fitnessGoal || 'General Fitness',
      height: existingProfile.height || '',
      weight: existingProfile.weight || '',
      address: existingProfile.address || '',
      uid: firebaseAuthUser?.uid || existingProfile.uid || `user-${Date.now()}`,
      provider: authMode === 'phone' ? 'Phone' : 'Email/OTP',
      lastLoginAt: new Date().toISOString(),
      loggedInAt: new Date().toISOString()
    };

    // Perform Email Firebase Authentication if user used email
    if (authMode === 'email') {
      try {
        const fbUser = await authenticateUserWithFirebase(userObj);
        if (fbUser && fbUser.uid) {
          userObj.uid = fbUser.uid;
        }
      } catch (authErr) {
        console.warn('Firebase authentication notice:', authErr.message);
      }
    }

    // Save/merge signed up user to Firebase Firestore users collection
    try {
      await saveUserToFirebase(userObj);
    } catch (err) {
      console.warn('Firebase user save warning:', err.message);
    }

    localStorage.setItem('gymnation_user', JSON.stringify(userObj));
    saveUserProfile(userObj);
    setActiveUser(userObj);
    setIsLoading(false);
    setStep('success');

    if (onLoginSuccess) onLoginSuccess(userObj);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 3MB for base64 storage)
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((prev) => ({ ...prev, photoURL: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSaveSuccessMsg('');

    try {
      const updatedUser = {
        ...(activeUser || {}),
        ...profileForm,
        name: profileForm.name.trim() || activeUser?.name || 'GymNation Member',
        phone: profileForm.phone.trim() || activeUser?.phone || '',
        email: profileForm.email.trim() || activeUser?.email || '',
        updatedAt: new Date().toISOString()
      };

      // Save to Firebase Firestore
      await saveUserToFirebase(updatedUser);

      // Save locally
      localStorage.setItem('gymnation_user', JSON.stringify(updatedUser));
      saveUserProfile(updatedUser);
      setActiveUser(updatedUser);

      if (onLoginSuccess) onLoginSuccess(updatedUser);

      setSaveSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSaveSuccessMsg('');
        setIsEditingProfile(false);
      }, 1000);
    } catch (err) {
      console.warn('Failed to update profile:', err);
      setErrorMsg('Could not save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gymnation_user');
    setActiveUser(null);
    if (onLogoutSuccess) onLogoutSuccess();
    setStep('input');
    setIsEditingProfile(false);
    setPhoneNumber('');
    setEmailAddress('');
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-[420px] bg-black text-white border border-slate-800/80 rounded-3xl p-7 shadow-2xl shadow-orange-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 p-2 rounded-full transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-orange-600/15 blur-3xl pointer-events-none rounded-full" />

        {/* Logo at Top */}
        <div className="flex flex-col items-center justify-center pt-2 pb-5">
          <img
            src={logoImg}
            alt="GYMNATION"
            className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          />
          <span className="font-teko text-2xl tracking-wider text-white mt-1">
            GYM<span className="text-orange-500">NATION</span>
          </span>
        </div>

        {/* ALREADY LOGGED IN VIEW & MANAGE PROFILE */}
        {activeUser && step === 'input' ? (
          <div className="py-2 animate-in fade-in duration-300">
            {/* Hidden File Input for Picture Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {!isEditingProfile ? (
              /* PROFILE SUMMARY OVERVIEW */
              <div className="space-y-4">
                {/* Profile Header Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-5 text-center shadow-lg">
                  {/* Background Ambient Glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-orange-500/10 blur-xl pointer-events-none rounded-full" />

                  <div className="relative inline-block mx-auto mb-3">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-500 shadow-lg shadow-orange-500/20 bg-slate-900 flex items-center justify-center">
                      {activeUser.photoURL ? (
                        <img
                          src={activeUser.photoURL}
                          alt={activeUser.name || 'Member'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                          <User className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(true);
                        setTimeout(() => fileInputRef.current?.click(), 100);
                      }}
                      title="Change Profile Photo"
                      className="absolute bottom-0 right-0 p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-md transition-transform active:scale-90 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-xl font-black text-white tracking-wide">
                    {activeUser.name || 'GymNation Athlete'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeUser.phone || activeUser.email || 'Member ID: #GN-' + (activeUser.uid?.slice(-6) || '8839')}
                  </p>

                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Member
                    </span>
                    {activeUser.fitnessGoal && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-orange-500/15 border border-orange-500/30 text-orange-400">
                        🎯 {activeUser.fitnessGoal}
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile Key Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-left text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Email</span>
                    <span className="text-slate-200 font-medium truncate block mt-0.5">
                      {activeUser.email || 'Not provided'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Phone</span>
                    <span className="text-slate-200 font-medium truncate block mt-0.5">
                      {activeUser.phone || 'Not provided'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Date of Birth</span>
                    <span className="text-slate-200 font-medium truncate block mt-0.5">
                      {activeUser.dob || 'Not set'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Blood Group</span>
                    <span className="text-slate-200 font-medium truncate block mt-0.5">
                      {activeUser.bloodGroup || 'Not set'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm({
                        name: activeUser.name || '',
                        phone: activeUser.phone || '',
                        email: activeUser.email || '',
                        dob: activeUser.dob || '',
                        gender: activeUser.gender || 'Prefer not to say',
                        bloodGroup: activeUser.bloodGroup || '',
                        emergencyContact: activeUser.emergencyContact || '',
                        address: activeUser.address || '',
                        fitnessGoal: activeUser.fitnessGoal || 'General Fitness',
                        height: activeUser.height || '',
                        weight: activeUser.weight || '',
                        photoURL: activeUser.photoURL || ''
                      });
                      setIsEditingProfile(true);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    MANAGE PROFILE
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold tracking-wider uppercase rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Continue to Workouts
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2 text-xs text-slate-500 hover:text-rose-400 font-medium transition-colors cursor-pointer"
                  >
                    Sign out of this account
                  </button>
                </div>
              </div>
            ) : (
              /* MANAGE PROFILE FORM */
              <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[62vh] overflow-y-auto pr-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Profile
                  </button>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Edit Details
                  </span>
                </div>

                {saveSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs text-center font-medium flex items-center justify-center gap-1.5 animate-in fade-in">
                    <Check className="w-4 h-4" />
                    {saveSuccessMsg}
                  </div>
                )}

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Profile Picture Upload Header */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 bg-slate-950 shrink-0 flex items-center justify-center">
                    {profileForm.photoURL ? (
                      <img
                        src={profileForm.photoURL}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-orange-400" />
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <span className="text-xs font-bold text-white block">Profile Picture</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 rounded-lg transition-all cursor-pointer"
                      >
                        Upload Photo
                      </button>
                      {profileForm.photoURL && (
                        <button
                          type="button"
                          onClick={() => setProfileForm((prev) => ({ ...prev, photoURL: '' }))}
                          className="px-2 py-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Phone & Email in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="member@gymnation.fit"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* DOB & Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Date of Birth
                    </label>
                    <CustomDatePicker
                      value={profileForm.dob}
                      onChange={(dateStr) => setProfileForm((prev) => ({ ...prev, dob: dateStr }))}
                      placeholder="DD-MM-YYYY"
                      minYear={1940}
                      maxYear={new Date().getFullYear()}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Gender
                    </label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Blood Group & Emergency Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Blood Group
                    </label>
                    <select
                      value={profileForm.bloodGroup}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, bloodGroup: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                    >
                      <option value="">Select Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      value={profileForm.emergencyContact}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                      placeholder="Contact Number"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Primary Fitness Goal */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Primary Fitness Goal
                  </label>
                  <select
                    value={profileForm.fitnessGoal}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, fitnessGoal: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                  >
                    <option value="Weight Loss">Weight Loss & Fat Burn</option>
                    <option value="Muscle Building">Muscle Building & Hypertrophy</option>
                    <option value="Strength Training">Strength & Powerlifting</option>
                    <option value="Endurance">Cardio & Athletic Endurance</option>
                    <option value="General Fitness">General Health & Fitness</option>
                    <option value="CrossFit / HIIT">CrossFit & HIIT Training</option>
                  </select>
                </div>

                {/* Height, Weight in 2 columns */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={profileForm.height}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, height: e.target.value }))}
                      placeholder="e.g. 178"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={profileForm.weight}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, weight: e.target.value }))}
                      placeholder="e.g. 75"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Address / Location */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    City / Address
                  </label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g. Bangalore, Indiranagar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="w-1/3 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        SAVE PROFILE
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : step === 'success' ? (
          /* SUCCESS STATE */
          <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-9 h-9 animate-bounce" />
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-wide">Login Successful!</h3>
            <p className="text-sm text-slate-400">Welcome to the GymNation community.</p>
          </div>
        ) : step === 'otp' ? (
          /* OTP VERIFICATION VIEW */
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">Enter Security OTP</h3>
              <p className="text-xs text-slate-400 mt-1">
                We sent a 6-digit code to{' '}
                <span className="text-orange-400 font-medium">
                  {authMode === 'phone' ? `${countryCode} ${phoneNumber}` : emailAddress}
                </span>
              </p>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex justify-between gap-2 py-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={otpInputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-13 text-center text-xl font-bold bg-slate-900 text-white border border-slate-800 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                />
              ))}
            </div>

            {/* WhatsApp or Email Dispatch Notice */}
            <div className="flex flex-col items-center gap-2 pt-0.5">
              {authMode === 'phone' ? (
                <button
                  type="button"
                  onClick={handleSendWhatsAppOtp}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs font-semibold rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                  <span>Receive OTP on WhatsApp</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium rounded-xl">
                  <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Check your inbox & spam folder for code</span>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 text-center font-medium">{errorMsg}</p>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={isLoading}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-wider rounded-xl transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'VERIFY & CONTINUE'
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <button
                onClick={() => setStep('input')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Change {authMode === 'phone' ? 'Number' : 'Email'}
              </button>
              
              <button
                onClick={() => handleSendOtp(null)}
                disabled={!canResend}
                className={`transition-colors cursor-pointer ${
                  canResend ? 'text-orange-400 hover:text-orange-300 font-medium' : 'text-slate-500'
                }`}
              >
                {canResend ? 'Resend OTP' : `Resend in ${timer}s`}
              </button>
            </div>
          </div>
        ) : (
          /* STEP 1: PHONE / EMAIL INPUT (Cult.fit Style) */
          <div className="space-y-6">
            <form onSubmit={handleSendOtp} className="space-y-5">
              {/* Phone or Email Input Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {authMode === 'phone' ? 'Phone Number' : 'Email Address'}
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'phone' ? 'email' : 'phone');
                      setErrorMsg('');
                    }}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium cursor-pointer"
                  >
                    Use {authMode === 'phone' ? 'Email' : 'Phone'} instead
                  </button>
                </div>

                {authMode === 'phone' ? (
                  /* Phone Input with Country Selector (Cult.fit design) */
                  <div className="relative flex items-center border-b-2 border-slate-700 focus-within:border-white transition-colors pb-2">
                    {/* Country Code Dropdown Trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center gap-1 text-base font-bold text-white pr-3 hover:text-orange-400 transition-colors cursor-pointer"
                      >
                        <span>{countryCode}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>

                      {/* Dropdown Menu */}
                      {showCountryDropdown && (
                        <div className="absolute top-8 left-0 z-30 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 text-xs">
                          {countryCodes.map((item) => (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => {
                                setCountryCode(item.code);
                                setShowCountryDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between transition-colors"
                            >
                              <span>{item.flag} {item.code}</span>
                              <span className="text-[10px] text-slate-500">{item.label.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Vertical Divider */}
                    <div className="h-5 w-px bg-slate-700 mr-3" />

                    {/* Input Field */}
                    <input
                      type="tel"
                      placeholder="Enter 10-digit phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      className="w-full bg-transparent text-white placeholder-slate-500 text-base font-medium focus:outline-none tracking-wider"
                    />
                  </div>
                ) : (
                  /* Email Input */
                  <div className="relative flex items-center border-b-2 border-slate-700 focus-within:border-white transition-colors pb-2">
                    <Mail className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full bg-transparent text-white placeholder-slate-500 text-base font-medium focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
              )}

              {/* Primary Cult.fit Style CONTINUE Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-slate-200 hover:bg-white text-black font-extrabold tracking-wider rounded-xl transition-all shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  'CONTINUE'
                )}
              </button>
            </form>

            {/* Social Logins Divider (Cult.fit Style) */}
            <div className="space-y-4 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-800" />
                <span className="absolute bg-black px-4 text-xs font-semibold text-slate-400">
                  Or connect with
                </span>
              </div>

              {/* Only Google Sign-In Button */}
              <div className="flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  aria-label="Connect with Google"
                  title="Connect with Google"
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-850 text-white font-semibold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>

            {/* Cult.fit Style Terms & Privacy Disclaimer */}
            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                * By Continuing you agree to the{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegal && onOpenLegal('terms')}
                  className="text-slate-400 hover:text-white font-semibold underline transition-colors cursor-pointer"
                >
                  Terms of Services
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegal && onOpenLegal('privacy')}
                  className="text-slate-400 hover:text-white font-semibold underline transition-colors cursor-pointer"
                >
                  Privacy policy
                </button>.
              </p>
            </div>
            {/* Hidden reCAPTCHA container for Firebase Phone Auth */}
            <div id="recaptcha-container" />
          </div>
        )}
      </div>
    </div>
  );
}
