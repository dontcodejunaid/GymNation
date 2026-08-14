import React, { useEffect, useState } from "react";
import { Menu, X, Phone, Calculator, QrCode, User } from "lucide-react";
import { RandomLetterSwap } from "./random-letter-swap";
import { WhatsAppIcon } from "./social-icons";
import { LiquidMetalButton } from "./liquid-metal-button";
import { cn } from "../../lib/utils";
import { WhatsAppConfig } from "../../utils/whatsapp";
import logoImg from "../../assets/logo.png";

const links = [
  { label: "Home", href: "/home", sectionId: "#home" },
  { label: "About Us", href: "/about-us", sectionId: "#about-us" },
  { label: "Facilities", href: "/facilities", sectionId: "#facilities" },
  { label: "Gallery", href: "/gallery", sectionId: "#gallery" },
  { label: "Testimonials", href: "/testimonials", sectionId: "#testimonials" },
  { label: "Contact", href: "/contact", sectionId: "#contact" },
];

const trackedSections = [
  "#home",
  "#about-us",
  "#bmi-calculator",
  "#facilities",
  "#gallery",
  "#testimonials",
  "#contact"
];

export default function RandomLetterSwapNav({ onOpenRecovery, onOpenAuth, currentUser, currentPage = 'home', onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(currentPage === 'contact' ? '#contact' : '#home');

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${WhatsAppConfig.ActiveNumber}&text=${encodeURIComponent(
    "Hi Gymnation! I'd like to know more about your memberships."
  )}`;

  useEffect(() => {
    if (currentPage === 'contact') {
      setActiveSection('#contact');
      return;
    }

    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      // Section scroll tracking using bounding rect
      const navHeight = 100;
      let currentActive = "#home";

      for (const href of trackedSections) {
        if (href === "#contact") continue;
        const section = document.querySelector(href);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= navHeight + 150 && rect.bottom >= navHeight) {
            currentActive = href;
          }
        }
      }

      setActiveSection(currentActive);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [currentPage]);

  const goTo = (event, pathOrId) => {
    if (event) event.preventDefault();
    setMenuOpen(false);

    if (onNavigate) {
      onNavigate(pathOrId);
      return;
    }

    const sectionId = pathOrId.startsWith("#") ? pathOrId : "#" + pathOrId.replace("/", "");
    const cleanPath = pathOrId.startsWith("/") ? pathOrId : "/" + pathOrId.replace("#", "");

    setActiveSection(sectionId);

    if (window.history.pushState) {
      window.history.pushState(null, "", cleanPath);
    }

    const element = document.querySelector(sectionId);
    if (element) {
      const block = sectionId === "#bmi-calculator" ? "center" : "start";
      element.scrollIntoView({ behavior: "smooth", block });
    }
  };

  return (
    <header
      className={cn(
        "z-50 transition-all duration-300 w-full",
        scrolled
          ? "fixed top-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-xl shadow-black/40 py-1.5"
          : "relative bg-slate-950/60 backdrop-blur-md border-b border-slate-800/50 py-2"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6">
        <a
          className="flex shrink-0 items-center gap-2"
          href="/home"
          onClick={(event) => goTo(event, "/home")}
        >
          <img alt="Gymnation" className="h-12 sm:h-14 w-auto transition-transform duration-300 hover:scale-105" src={logoImg} />
          <span className="font-teko text-3xl sm:text-4xl leading-none tracking-wide text-white">
            GYM<span className="text-orange-500">NATION</span>
          </span>
        </a>

        {/* Desktop links */}
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => {
            const isActive = activeSection === link.sectionId;
            return (
              <RandomLetterSwap
                as="a"
                className={cn(
                  "cursor-pointer text-sm font-semibold uppercase tracking-wider transition-all duration-300 relative py-1",
                  isActive
                    ? "text-orange-500 font-bold"
                    : "text-slate-400 hover:text-white"
                )}
                href={link.href}
                key={link.label}
                label={link.label}
                onClick={(event) => goTo(event, link.href)}
                staggerDuration={0.025}
                transition={{ duration: 0.6, type: "spring" }}
              />
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {/* Cult.fit Style Login / Signup / Profile Modal Button */}
          {onOpenAuth && (
            <button
              aria-label={currentUser ? "User Profile" : "Login or Sign Up"}
              title={currentUser ? `Profile (${currentUser.name || currentUser.phone || currentUser.email || 'Member'})` : "Member Login & Sign Up"}
              className={cn(
                "flex h-10 items-center justify-center gap-1.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer",
                currentUser
                  ? "border-orange-500/60 bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 hover:border-orange-500 hover:text-white shadow-[0_0_12px_rgba(249,115,22,0.2)]"
                  : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-orange-500/50 hover:bg-orange-500/20 hover:text-white"
              )}
              onClick={onOpenAuth}
              type="button"
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.name || 'Profile'}
                  className="h-5 w-5 rounded-full object-cover border border-orange-400"
                />
              ) : (
                <User className="h-[16px] w-[16px] text-orange-400" />
              )}
              <span className="hidden sm:inline max-w-[100px] truncate">
                {currentUser ? (currentUser.name ? currentUser.name.split(' ')[0] : 'PROFILE') : 'LOGIN'}
              </span>
            </button>
          )}

          {/* Find Pass / Digital Pass Recovery Button */}
          {onOpenRecovery && (
            <button
              aria-label="Find or Recover Digital Pass"
              title="Find or Recover Lost Digital Pass"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 transition-all duration-300 hover:border-orange-500/50 hover:bg-orange-500/20 hover:text-orange-400 active:scale-95 cursor-pointer"
              onClick={onOpenRecovery}
              type="button"
            >
              <QrCode className="h-[18px] w-[18px]" />
            </button>
          )}

          {/* BMI Calculator Quick Access Icon Button */}
          <a
            aria-label="BMI & Calorie Calculator"
            title="BMI & Calorie Calculator"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 active:scale-95",
              activeSection === "#bmi-calculator"
                ? "border-orange-500 bg-orange-500 text-slate-950 shadow-[0_0_20px_rgba(249,115,22,0.6)] font-bold scale-105"
                : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-orange-500/50 hover:bg-orange-500/20 hover:text-white"
            )}
            href="#bmi-calculator"
            onClick={(event) => goTo(event, "#bmi-calculator")}
          >
            <Calculator className="h-[18px] w-[18px]" />
          </a>

          {/* Caller Button */}
          <a
            aria-label="Call Gymnation Gym"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 transition-all duration-300 hover:border-orange-500/50 hover:bg-orange-500 hover:text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] active:scale-95"
            href="tel:+919742041444"
          >
            <Phone className="h-[18px] w-[18px]" />
          </a>

          {/* WhatsApp Button */}
          <a
            aria-label="Chat with us on WhatsApp"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 transition-all duration-300 hover:border-transparent hover:bg-[#25D366] hover:text-white hover:shadow-[0_0_20px_rgba(37,211,102,0.6)] active:scale-95"
            href={whatsappUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <WhatsAppIcon className="h-[18px] w-[18px]" />
          </a>

          {/* Desktop CTA — WebGL liquid metal button in theme orange */}
          <div className="hidden sm:block">
            <LiquidMetalButton
              label="BOOK NOW"
              labelColor="#ffffff"
              onClick={(event) => goTo(event, "#book-appointment")}
            />
          </div>

          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-slate-800/70 bg-slate-950/95 px-6 py-4 backdrop-blur-xl lg:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <li key={link.label}>
                  <a
                    className={cn(
                      "block rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-wider transition-colors",
                      isActive
                        ? "bg-orange-500/10 text-orange-500 font-bold border-l-2 border-orange-500"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    )}
                    href={link.href}
                    onClick={(event) => goTo(event, link.href)}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
            <li>
              <a
                className="mt-2 block rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 px-3 py-3 text-center text-sm font-black uppercase tracking-wider text-white sm:hidden"
                href="#book-appointment"
                onClick={(event) => goTo(event, "#book-appointment")}
              >
                Book Now
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
