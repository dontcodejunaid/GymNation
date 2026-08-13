import React, { useRef, useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { X, QrCode, ShieldCheck, Download, Calendar, MapPin, Sparkles, User, Dumbbell, Layers } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { generateStaticToken } from '../services/qrEngine';
import { withPassPrefix } from '../utils/passId';

export default function DigitalMemberCardModal({ memberData, isOpen, onClose, onOpenRecovery }) {
  const cardRef = useRef(null);
  const [selectedPassIndex, setSelectedPassIndex] = useState(0);

  const passesList = useMemo(() => {
    if (!memberData) return [];
    let list = [];
    if (Array.isArray(memberData.passes) && memberData.passes.length > 0) {
      list = memberData.passes;
    } else {
      const rawPayId = String(memberData.paymentResult?.paymentId || '2026-8492');
      const cleanPayId = withPassPrefix(rawPayId).toUpperCase();

      list = [
        {
          id: cleanPayId,
          service: String(memberData.plan?.name || 'Standard Membership'),
          name: String(memberData.customer?.name || 'Gymnation Member'),
          date: memberData.date || 'Active',
          time: memberData.time || '',
          trainer: memberData.trainer || '',
          status: 'Active'
        }
      ];
    }

    // Normalize IDs to uppercase and deduplicate passes by unique ID and service name
    const seen = new Set();
    return list.map((p) => ({
      ...p,
      id: withPassPrefix(String(p.id)).toUpperCase()
    })).filter((p) => {
      const key = `${p.id}_${p.service || ''}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [memberData]);

  if (!isOpen || !memberData || passesList.length === 0) return null;

  const activeIndex = selectedPassIndex < passesList.length ? selectedPassIndex : 0;
  const currentPass = passesList[activeIndex] || passesList[0];

  const memberName = String(currentPass.name || currentPass.customerName || memberData.customer?.name || 'Gymnation Member');
  const memberPhone = String(memberData.customer?.phone || '+91 98765 43210');
  const planName = String(currentPass.service || 'Standard Membership');
  const rawPassId = String(currentPass.id || 'GN-84920194');
  const passId = withPassPrefix(rawPassId).toUpperCase();
  
  // Expiry date calculation (1 month or 1 year)
  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 30);
  const formattedValidity = validUntilDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const staticQrPayload = generateStaticToken(memberName, passId);

  // High-Resolution 1-Page PDF Pass Download Handler
  const handlePrintPass = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [85.6, 120]
      });

      // Card Background (Dark Navy)
      doc.setFillColor(9, 13, 22);
      doc.rect(0, 0, 85.6, 120, 'F');

      // Top Header Accent Line (Orange)
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 0, 85.6, 6, 'F');

      // Brand Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('GYMNATION', 42.8, 14, { align: 'center' });

      doc.setFontSize(8);
      doc.setTextColor(249, 115, 22);
      doc.text('FITNESS CENTRE • DIGITAL PASS', 42.8, 19, { align: 'center' });

      // Divider
      doc.setDrawColor(51, 65, 85);
      doc.line(10, 23, 75.6, 23);

      // Member Details
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(memberName.toUpperCase(), 42.8, 30, { align: 'center' });

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text(`PASS ID: ${passId}`, 42.8, 35, { align: 'center' });
      doc.text(`PLAN: ${planName}`, 42.8, 40, { align: 'center' });
      doc.text(`VALID TILL: ${formattedValidity}`, 42.8, 45, { align: 'center' });

      // QR Code Box (White background)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(17.8, 49, 50, 50, 3, 3, 'F');

      // Draw QR Code SVG onto canvas -> PDF
      const qrSvgElement = document.querySelector('.gymnation-qr-container svg');
      if (qrSvgElement) {
        const xml = new XMLSerializer().serializeToString(qrSvgElement);
        const svg64 = btoa(unescape(encodeURIComponent(xml)));
        const image64 = 'data:image/svg+xml;base64,' + svg64;

        const img = new Image();
        img.src = image64;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 300, 300);
          ctx.drawImage(img, 0, 0, 300, 300);
          const pngData = canvas.toDataURL('image/png');

          doc.addImage(pngData, 'PNG', 20.3, 51.5, 45, 45);
          
          // Footer Security Text
          doc.setFontSize(6);
          doc.setTextColor(148, 163, 184);
          doc.text(`STATIC PASS TOKEN: ${staticQrPayload}`, 42.8, 104, { align: 'center' });
          doc.text('SCAN AT GYM TURNSTILE FOR ENTRY • AMRIT NAGAR BRANCH', 42.8, 108, { align: 'center' });

          doc.save(`Gymnation_Pass_${passId}.pdf`);
        };
      } else {
        doc.save(`Gymnation_Pass_${passId}.pdf`);
      }

    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 space-y-6 p-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-extrabold text-white">Digital Entry Pass</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Membership Selector (If member holds multiple active plans) */}
        {passesList.length > 1 && (
          <div className="space-y-2 rounded-2xl bg-slate-950/60 border border-slate-800 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>All Active Memberships ({passesList.length})</span>
              </span>
              <span className="text-[10px] text-slate-400">Tap pass to switch</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {passesList.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPassIndex(idx)}
                  type="button"
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    activeIndex === idx
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 border-orange-400 shadow-md shadow-orange-500/20 scale-105'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-orange-500/40 hover:text-white'
                  }`}
                >
                  {p.service || `Membership #${idx + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* On-Screen Digital Membership Card */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 border border-orange-500/40 p-6 shadow-2xl text-slate-100 space-y-5"
        >
          {/* Decorative Lighting Orbs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header: Brand Logo & Status */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="Gymnation" className="w-9 h-9 object-contain" />
              <div>
                <span className="text-base font-black tracking-wider uppercase text-white block leading-none">
                  GYMNATION
                </span>
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">
                  Fitness Centre
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              ● ACTIVE PASS ({activeIndex + 1}/{passesList.length})
            </span>
          </div>

          {/* Member Main Info */}
          <div className="relative z-10 space-y-3 pt-2">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">MEMBER NAME</span>
              <h4 className="text-xl font-black text-white tracking-tight">{memberName}</h4>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">PASS ID</span>
                <span className="font-mono text-amber-400 font-bold">{passId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">SELECTED PLAN</span>
                <span className="text-white font-bold truncate block">{planName}</span>
              </div>
            </div>

            {/* List of All Active Memberships Badges */}
            {passesList.length > 1 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  All Subscriptions on this Pass ({passesList.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {passesList.map((p, idx) => (
                    <span
                      key={idx}
                      onClick={() => setSelectedPassIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                        activeIndex === idx
                          ? 'bg-orange-500/30 border-orange-400 text-orange-200 ring-1 ring-orange-500'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      ✓ {p.service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Real SVG QR Code for Turnstile Check-In */}
          <div className="relative z-10 p-5 rounded-2xl bg-white/95 backdrop-blur-md flex flex-col items-center justify-center gap-2 text-slate-950 shadow-xl gymnation-qr-container">
            <QRCodeSVG 
              value={staticQrPayload} 
              size={144} 
              level="M" 
              includeMargin={true}
              marginSize={2}
            />
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-700">
              SCAN AT GYM TURNSTILE FOR ENTRY
            </span>
            <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">
              PASS TOKEN: {passId}
            </span>
          </div>

          {/* Footer Metadata */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>Amrit Nagar Branch</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Valid Till: {formattedValidity}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintPass}
            className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700 shadow-md"
          >
            <Download className="w-4 h-4 text-orange-400" />
            <span>Download Pass (.PDF)</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs transition-colors shadow-lg shadow-orange-600/20"
          >
            Close
          </button>
        </div>

        {onOpenRecovery && (
          <div className="text-center pt-1">
            <button
              onClick={onOpenRecovery}
              type="button"
              className="text-[11px] text-slate-400 hover:text-orange-400 font-medium transition-colors underline"
            >
              Need to find or recover a different pass? Click here
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

