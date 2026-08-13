import React, { useState, useEffect } from 'react';
import {
  Target, HeartPulse, Trophy, CheckCircle2, ShieldCheck, Star,
  Sparkles, Award, Dumbbell, Activity, Users2, Edit3, Save, RotateCcw, X
} from 'lucide-react';
import ownerImg from '../assets/owner.png';
import Component from './ui/gradient-bars-background';
import { TextReveal } from './ui/cascade-text';
import { ShinyButton } from './ui/shiny-button';
import { getAboutData, saveAboutData, INITIAL_ABOUT_DATA } from '../utils/adminStore';
import { getAboutFromFirebase, subscribeToAboutFromFirebase } from '../firebase';

export default function About() {
  const [activeTab, setActiveTab] = useState('philosophy');
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(() => getAboutData());

  const [editForm, setEditForm] = useState(data);

  useEffect(() => {
    let isMounted = true;

    async function loadCloudData() {
      try {
        const cloudAbout = await getAboutFromFirebase();
        if (cloudAbout && isMounted) {
          setData(cloudAbout);
        }
      } catch (err) {
        console.warn('Firebase About fetch error:', err);
      }
    }

    loadCloudData();

    const unsubscribeFirebase = subscribeToAboutFromFirebase((cloudAbout) => {
      if (cloudAbout && isMounted) {
        setData(cloudAbout);
      }
    });

    const handleUpdate = () => {
      setData(getAboutData());
    };

    window.addEventListener('gymnation_about_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      isMounted = false;
      if (typeof unsubscribeFirebase === 'function') unsubscribeFirebase();
      window.removeEventListener('gymnation_about_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  useEffect(() => {
    setEditForm(data);
  }, [data]);


  const handleSave = () => {
    setData(editForm);
    try {
      localStorage.setItem('gymnation_about_data', JSON.stringify(editForm));
      window.dispatchEvent(new Event('gymnation_about_updated'));
    } catch (e) {
      console.error(e);
    }
    setIsEditing(false);
  };

  const handleReset = () => {
    setData(INITIAL_ABOUT_DATA);
    setEditForm(INITIAL_ABOUT_DATA);
    localStorage.removeItem('gymnation_about_data');
    setIsEditing(false);
  };

  const iconsMap = {
    trainers: ShieldCheck,
    equipment: Target,
    community: HeartPulse
  };

  const badgeIconsMap = [Award, ShieldCheck, Star, Sparkles];

  return (
    <Component
      numBars={20}
      gradientFrom="rgba(249, 115, 22, 0.45)"
      gradientTo="rgba(15, 23, 42, 0.95)"
      animationDuration={2.8}
      backgroundColor="#020617"
    >
      <section id="about-us" className="scroll-mt-20 py-14 sm:py-16 text-slate-100 relative overflow-hidden w-full bg-transparent">

        {/* Ambient Glowing Background Lighting Orbs */}
        <div className="absolute top-1/4 -left-32 w-[32rem] h-[32rem] bg-gradient-to-r from-orange-600/20 to-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 -right-24 w-[36rem] h-[36rem] bg-gradient-to-l from-amber-500/20 to-orange-600/15 rounded-full blur-[160px] pointer-events-none animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-12">

          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-orange-500 shrink-0" />
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.header.badge}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    header: { ...editForm.header, badge: e.target.value }
                  })}
                  className="bg-slate-900 border border-orange-500/50 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                />
              ) : (
                <TextReveal text={data.header.badge} hoverColor="#f97316" color="#fb923c" staggerDelay={20} />
              )}
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              {isEditing ? (
                <div className="space-y-2 max-w-xl mx-auto">
                  <input
                    type="text"
                    value={editForm.header.titleMain}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      header: { ...editForm.header, titleMain: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1 text-xl text-white font-bold"
                  />
                  <input
                    type="text"
                    value={editForm.header.titleSub}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      header: { ...editForm.header, titleSub: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1 text-xl text-orange-400 font-bold"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center justify-center flex-wrap gap-x-2">
                    <TextReveal text="More Than a Gym" hoverColor="#f97316" color="#ffffff" staggerDelay={25} />
                    <span className="inline-block w-2.5 h-[3px] bg-white align-middle mx-1 rounded-full"></span>
                    <TextReveal text="A Community" hoverColor="#f97316" color="#ffffff" staggerDelay={25} />
                  </div>
                  <div className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    <TextReveal text={data.header.titleSub} hoverColor="#fbbf24" color="#f59e0b" staggerDelay={20} />
                  </div>
                </div>
              )}
            </h2>

            {isEditing ? (
              <textarea
                value={editForm.header.story}
                onChange={(e) => setEditForm({
                  ...editForm,
                  header: { ...editForm.header, story: e.target.value }
                })}
                rows={3}
                className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
              />
            ) : (
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                {data.header.story}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6 space-y-6 flex flex-col justify-start">
              {/* 21st.dev Inspired Interactive Animated Segmented Tabs */}
              <div className="p-2 rounded-2xl bg-slate-950/80 backdrop-blur-2xl border border-slate-800/80 grid grid-cols-3 gap-2 shadow-2xl relative">
                {[
                  { id: 'philosophy', label: 'Philosophy', icon: HeartPulse },
                  { id: 'equipment', label: 'Equipment', icon: Dumbbell },
                  { id: 'coaching', label: 'Coaching', icon: ShieldCheck },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative py-3.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all duration-300 z-10 cursor-pointer overflow-hidden ${
                        isActive
                          ? 'text-white shadow-lg'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-xl shadow-lg shadow-orange-600/30 transition-all duration-300 -z-10 overflow-hidden border-none pointer-events-none w-full h-full">
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 z-10 block pointer-events-none animate-pulse"
                            style={{
                              background: "linear-gradient(-75deg, transparent 20%, rgba(255,255,255,0.7) 50%, transparent 80%)",
                              mixBlendMode: "overlay",
                            }}
                          />
                        </div>
                      )}
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-400'}`} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 21st.dev Style Glowing Glass Content Card with Shiny Sheen */}
              <ShinyButton className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-orange-500/30 via-slate-800/50 to-slate-950/80 shadow-2xl flex flex-col w-full text-left justify-start cursor-default">
                <div className="p-6 sm:p-8 rounded-[23px] bg-slate-950/95 backdrop-blur-2xl space-y-6 flex flex-col justify-between border border-slate-800/80 w-full">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.tabContents[activeTab].title}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            tabContents: {
                              ...editForm.tabContents,
                              [activeTab]: {
                                ...editForm.tabContents[activeTab],
                                title: e.target.value
                              }
                            }
                          })}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-orange-400 font-bold w-full"
                        />
                      ) : (
                        data.tabContents[activeTab].title
                      )}
                    </div>

                    {isEditing ? (
                      <textarea
                        value={editForm.tabContents[activeTab].quote}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          tabContents: {
                            ...editForm.tabContents,
                            [activeTab]: {
                              ...editForm.tabContents[activeTab],
                              quote: e.target.value
                            }
                          }
                        })}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm italic text-slate-200"
                      />
                    ) : (
                      <blockquote className="text-slate-100 text-sm sm:text-base leading-relaxed italic border-l-4 border-gradient-to-b border-orange-500 pl-4 py-1.5 bg-slate-900/40 rounded-r-xl">
                        "{data.tabContents[activeTab].quote}"
                      </blockquote>
                    )}

                    <div className="space-y-3 pt-2">
                      {isEditing ? (
                        editForm.tabContents[activeTab].bullets.map((b, i) => (
                          <input
                            key={i}
                            type="text"
                            value={b}
                            onChange={(e) => {
                              const newBullets = [...editForm.tabContents[activeTab].bullets];
                              newBullets[i] = e.target.value;
                              setEditForm({
                                ...editForm,
                                tabContents: {
                                  ...editForm.tabContents,
                                  [activeTab]: {
                                    ...editForm.tabContents[activeTab],
                                    bullets: newBullets
                                  }
                                }
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 mb-1"
                          />
                        ))
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5">
                          {data.tabContents[activeTab].bullets.map((b, i) => (
                            <ShinyButton key={i} className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-orange-500/40 hover:bg-slate-900 transition-all duration-300 shadow-sm text-left justify-start cursor-default">
                              <div className="p-1.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <span className="font-semibold">{b}</span>
                            </ShinyButton>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gym Location Badge Footer */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-2 text-slate-300 font-medium">
                      <Activity className="w-4 h-4 text-orange-500 animate-pulse" />
                      01, Gollahalli Main Rd, Shikaripalya, Electronic City
                    </span>
                    <span className="text-amber-400 font-bold bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full shadow-inner">
                      5 Yrs Legacy
                    </span>
                  </div>
                </div>
              </ShinyButton>
            </div>

            <div className="lg:col-span-6">
              <ShinyButton className="relative group rounded-3xl p-1 bg-gradient-to-b from-orange-500/40 via-slate-800 to-slate-950 shadow-2xl h-full flex flex-col w-full text-left justify-start cursor-default">
                <div className="bg-slate-950/90 backdrop-blur-xl rounded-[22px] p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between w-full">

                  <div className="relative overflow-hidden rounded-2xl aspect-[16/10] border border-slate-800">
                    <img
                      src={data.founder?.photo || ownerImg}
                      alt="Gymnation Gym Founder & Lead Coach"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-bold">
                      <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700">
                        <Users2 className="w-3.5 h-3.5 text-orange-400" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.founder.badge}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              founder: { ...editForm.founder, badge: e.target.value }
                            })}
                            className="bg-slate-950 border border-slate-700 px-1 py-0.5 text-xs text-white rounded"
                          />
                        ) : (
                          data.founder.badge
                        )}
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.founder.rating}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              founder: { ...editForm.founder, rating: e.target.value }
                            })}
                            className="bg-slate-950 border border-slate-700 px-1 py-0.5 text-xs text-amber-400 rounded"
                          />
                        ) : (
                          data.founder.rating
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-wider font-extrabold text-orange-400">Founder's Commitment</div>

                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.founder.title}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          founder: { ...editForm.founder, title: e.target.value }
                        })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-lg font-bold text-white"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-white">{data.founder.title}</h3>
                    )}

                    {isEditing ? (
                      <textarea
                        value={editForm.founder.note}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          founder: { ...editForm.founder, note: e.target.value }
                        })}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-300"
                      />
                    ) : (
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {data.founder.note}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800">
                    {(isEditing ? editForm.metrics : data.metrics).map((m, idx) => (
                      <div key={idx} className="text-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={m.value}
                              onChange={(e) => {
                                const newMetrics = [...editForm.metrics];
                                newMetrics[idx].value = e.target.value;
                                setEditForm({ ...editForm, metrics: newMetrics });
                              }}
                              className="w-full bg-slate-950 border border-slate-700 rounded text-center text-xs font-bold text-amber-400"
                            />
                            <input
                              type="text"
                              value={m.label}
                              onChange={(e) => {
                                const newMetrics = [...editForm.metrics];
                                newMetrics[idx].label = e.target.value;
                                setEditForm({ ...editForm, metrics: newMetrics });
                              }}
                              className="w-full bg-slate-950 border border-slate-700 rounded text-center text-[10px] text-slate-400"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="text-xs sm:text-sm font-black text-amber-400">{m.value}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{m.label}</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ShinyButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {(isEditing ? editForm.highlights : data.highlights).map((item, idx) => {
              const Icon = iconsMap[item.id] || ShieldCheck;
              return (
                <ShinyButton
                  key={idx}
                  className="!p-5 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 hover:border-orange-500/50 hover:bg-slate-950 transition-all duration-300 group shadow-xl text-left flex items-center gap-4 cursor-default h-full w-full justify-start"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {isEditing ? (
                    <div className="w-full">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const newHighlights = [...editForm.highlights];
                          newHighlights[idx].title = e.target.value;
                          setEditForm({ ...editForm, highlights: newHighlights });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm font-bold text-white"
                      />
                    </div>
                  ) : (
                    <h4 className="text-base sm:text-lg font-extrabold text-white group-hover:text-orange-400 transition-colors leading-tight">{item.title}</h4>
                  )}
                </ShinyButton>
              );
            })}
          </div>

          <div className="rounded-3xl bg-slate-950/90 backdrop-blur-xl p-6 border border-slate-800/80 shadow-2xl space-y-4">
            <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">
              Certifications, Awards & Recognized Gym Standards
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
              {(isEditing ? editForm.badges : data.badges).map((badge, idx) => {
                const Icon = badgeIconsMap[idx % badgeIconsMap.length];
                return (
                  <ShinyButton
                    key={badge.id || idx}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800/80 text-xs sm:text-sm font-semibold text-slate-200 hover:border-orange-500/40 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-orange-500" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={badge.text}
                        onChange={(e) => {
                          const newBadges = [...editForm.badges];
                          newBadges[idx].text = e.target.value;
                          setEditForm({ ...editForm, badges: newBadges });
                        }}
                        className="bg-slate-950 border border-slate-700 px-2 py-0.5 text-xs text-white rounded"
                      />
                    ) : (
                      badge.text
                    )}
                  </ShinyButton>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </Component>
  );
}
