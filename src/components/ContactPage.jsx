import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Mail,
  Send,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Loader2
} from 'lucide-react';
import { InstagramIcon, WhatsAppIcon, LinkedInIcon, FacebookIcon, YoutubeIcon } from './ui/social-icons';
import { WhatsAppConfig } from '../utils/whatsapp';
import LocationMap from './ui/expanded-map';
import logoImg from '../assets/logo.png';
import { saveNewsletterSubscriberToFirebase } from '../firebase';
import { sendNewsletterSubscriptionEmail } from '../utils/bookingNotifications';

export default function ContactPage({ onNavigate, onOpenLegal }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const phoneDigits = WhatsAppConfig.ActiveNumber;
  const phoneDisplay = `+${phoneDigits.slice(0, 2)} ${phoneDigits.slice(2, 7)} ${phoneDigits.slice(7)}`;

  const whatsappMessage = encodeURIComponent(
    "Hi Gymnation! I'm reaching out from your Contact Page. I'd like more information regarding memberships and facilities."
  );
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneDigits}&text=${whatsappMessage}`;

  const socials = [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/code_innovativetechnologies',
      Icon: InstagramIcon,
      color: 'hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 text-pink-400 hover:text-white',
      borderColor: 'hover:border-pink-500/50'
    },
    {
      label: 'WhatsApp',
      href: whatsappUrl,
      Icon: WhatsAppIcon,
      color: 'hover:bg-[#25D366] text-emerald-400 hover:text-white',
      borderColor: 'hover:border-emerald-500/50'
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/code-innovative-technologies',
      Icon: LinkedInIcon,
      color: 'hover:bg-[#0A66C2] text-sky-400 hover:text-white',
      borderColor: 'hover:border-sky-500/50'
    },
    {
      label: 'Facebook',
      href: 'https://facebook.com',
      Icon: FacebookIcon,
      color: 'hover:bg-[#1877F2] text-blue-400 hover:text-white',
      borderColor: 'hover:border-blue-500/50'
    },
    {
      label: 'YouTube',
      href: 'https://youtube.com',
      Icon: YoutubeIcon,
      color: 'hover:bg-[#FF0000] text-red-400 hover:text-white',
      borderColor: 'hover:border-red-500/50'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (formData.email) {
        await saveNewsletterSubscriberToFirebase(formData.email);
        await sendNewsletterSubscriptionEmail(formData.email);
      }
    } catch (err) {
      console.warn('Contact form submission info:', err);
    }

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="relative min-h-[calc(100vh-70px)] w-full bg-slate-950 text-slate-100 flex flex-col justify-start lg:justify-center items-center py-4 px-3 sm:px-6 lg:px-8 overflow-x-hidden overflow-y-auto lg:overflow-hidden">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 h-80 w-[45rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-5 right-10 h-60 w-60 rounded-full bg-amber-500/5 blur-3xl"
      />

      <div className="relative w-full max-w-5xl flex flex-col gap-3 sm:gap-3.5 my-auto py-1 sm:py-2">
        
        {/* Clean Responsive Header */}
        <div className="text-center px-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-400 backdrop-blur-md mb-1">
            <Sparkles className="h-3 w-3 text-orange-400 animate-pulse" />
            <span>24/7 Member &amp; Guest Assistance</span>
          </div>

          <h1 className="font-teko text-3xl sm:text-4xl lg:text-4.5xl font-black uppercase tracking-wide text-white leading-tight sm:leading-none">
            CONTACT <span className="text-orange-500">GYMNATION</span>
          </h1>

          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 max-w-md sm:max-w-xl mx-auto leading-relaxed">
            Get in touch with our team for memberships, personal training, and general inquiries.
          </p>
        </div>

        {/* 2-Column Responsive Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
          
          {/* LEFT CARD: Contact Channels, Hours & Socials */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-3.5 sm:p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-3 sm:gap-3.5">
            
            {/* 3 Contact Rows */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5 mb-1">
                <Phone className="h-3.5 w-3.5 text-orange-500" />
                <span>Contact Channels</span>
              </div>

              {/* Phone */}
              <a
                href={`tel:+${phoneDigits}`}
                className="group flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-2 sm:p-2.5 transition-all duration-300 hover:border-orange-500/50 hover:bg-slate-900/90 active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase text-slate-400 leading-none">Direct Phone</div>
                    <div className="font-teko text-base sm:text-lg font-bold text-white group-hover:text-orange-400 transition-colors leading-tight truncate">
                      {phoneDisplay}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium shrink-0 ml-2">
                  Front Desk
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-2 sm:p-2.5 transition-all duration-300 hover:border-emerald-500/50 hover:bg-slate-900/90 active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                    <WhatsAppIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase text-slate-400 leading-none">WhatsApp Support</div>
                    <div className="font-teko text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight truncate">
                      Chat with Trainer
                    </div>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] text-slate-400 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ml-2">
                  Online <ExternalLink className="h-2.5 w-2.5" />
                </span>
              </a>

              {/* Email */}
              <a
                href="mailto:support@gymnation.com"
                className="group flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-2 sm:p-2.5 transition-all duration-300 hover:border-orange-500/50 hover:bg-slate-900/90 active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase text-slate-400 leading-none">Email Helpdesk</div>
                    <div className="font-mono text-[11px] sm:text-xs font-bold text-white group-hover:text-orange-400 transition-colors leading-tight truncate">
                      support@gymnation.com
                    </div>
                  </div>
                </div>
                <span className="text-[9px] sm:text-[10px] text-slate-400 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded-full shrink-0 ml-2">
                  Official
                </span>
              </a>
            </div>

            {/* Working Hours */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-2.5 sm:p-3">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-orange-400 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                  <span>Working Hours</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Mon - Sun</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center justify-between rounded-lg bg-slate-900/80 border border-slate-800/80 px-2.5 py-1.5">
                  <span className="text-slate-300 font-medium">Morning Shift</span>
                  <span className="font-mono text-orange-400 font-bold text-[10px]">6:00 AM - 1:00 PM</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-900/80 border border-slate-800/80 px-2.5 py-1.5">
                  <span className="text-slate-300 font-medium">Evening Shift</span>
                  <span className="font-mono text-orange-400 font-bold text-[10px]">5:00 PM - 10:00 PM</span>
                </div>
              </div>
            </div>

            {/* Community Social Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="Gymnation" className="h-5 sm:h-6 w-auto" />
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">Follow Community</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {socials.map(({ label, href, Icon, color, borderColor }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    aria-label={label}
                    className={`flex h-7 w-7 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 transition-all duration-300 hover:scale-110 active:scale-95 ${borderColor} ${color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT CARD: Map with Address + Message Box */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-3.5 sm:p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-3 sm:gap-3.5">
            
            {/* Live Map & Address Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span>Gym Location &amp; Map</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-950/70 border border-slate-800 px-2 py-0.5 rounded-full">
                  Electronic City
                </span>
              </div>

              <div className="w-full rounded-xl overflow-hidden border border-slate-800/80">
                <LocationMap
                  location="Gymnation Fitness Centre, Shikaripalya, Electronic City"
                  latitude={12.8360}
                  longitude={77.6572}
                  zoom={14}
                  className="w-full"
                />
              </div>

              {/* Address inline below map */}
              <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 text-[11px] bg-slate-950/60 rounded-xl p-2 sm:p-2.5 border border-slate-800/80">
                <div className="flex items-start gap-1.5 min-w-0 flex-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500 mt-0.5" />
                  <p className="text-slate-300 text-[11px] leading-snug">
                    01, Gollahalli Main Rd, Shikaripalya, Electronic City, Bengaluru 560100
                  </p>
                </div>
                <span className="text-[9px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0 font-medium self-start sm:self-center">
                  Free Parking
                </span>
              </div>
            </div>

            {/* Quick Message Form */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-2.5 sm:p-3">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-orange-400 mb-2">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-orange-500" />
                  <span>Leave Us a Message</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Quick Response</span>
              </div>

              {submitted ? (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-center">
                  <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-400 mb-1" />
                  <h4 className="text-xs font-bold text-white">Message Received!</h4>
                  <p className="text-[10px] text-emerald-300/90 mt-0.5">
                    Our team will contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                    <input
                      type="tel"
                      placeholder="Phone (Optional)"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-1.5">
                    <input
                      type="email"
                      required
                      placeholder="Your Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-orange-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow transition-all hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-3 w-3" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>

        {/* Responsive Footer Row */}
        <div className="pt-2.5 pb-6 sm:pb-2 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 text-center sm:text-left">
          <div>&copy; {new Date().getFullYear()} Gymnation Fitness Centre. Electronic City, Bengaluru</div>
          <div className="flex items-center gap-3 text-slate-400">
            <button
              onClick={() => onNavigate && onNavigate('/home')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Back to Home
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate && onNavigate('#book-appointment')}
              className="text-orange-400 hover:text-orange-300 font-bold transition-colors cursor-pointer"
            >
              Book Session
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenLegal && onOpenLegal('terms')}
              className="hover:text-orange-400 transition-colors cursor-pointer"
            >
              Terms
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenLegal && onOpenLegal('privacy')}
              className="hover:text-orange-400 transition-colors cursor-pointer"
            >
              Privacy
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
