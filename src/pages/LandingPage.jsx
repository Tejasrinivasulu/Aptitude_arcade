import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Mail,
  MessageCircle,
  Flame,
  Clock,
  Trophy,
  BarChart3,
} from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const STATS = [
  { icon: Flame, label: '14 Days', sub: 'Daily Streak', bg: 'bg-orange-50', ring: 'bg-orange-100', color: 'text-orange-500' },
  { icon: Clock, label: '30 Min', sub: 'Per Test', bg: 'bg-blue-50', ring: 'bg-blue-100', color: 'text-blue-500' },
  { icon: Trophy, label: 'Grand Finale', sub: 'Qualifier', bg: 'bg-amber-50', ring: 'bg-amber-100', color: 'text-amber-500' },
  { icon: BarChart3, label: 'Live Rankings', sub: 'Campus-wide', bg: 'bg-emerald-50', ring: 'bg-emerald-100', color: 'text-emerald-500' },
];

export default function LandingPage() {
  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqData = [
    { q: "Is this free?", a: "Yes, completely." },
    { q: "What time does the test start?", a: "The test starts at 10:00 AM IST." },
    { q: "What time does the test end?", a: "Each day's window closes at 12:00 PM IST the next day." },
    { q: "What if I miss a day?", a: "Your streak resets to zero. That's the point." },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-black flex flex-col justify-between antialiased selection:bg-[#FFE6D5]">
      {/* SECTION 1 — Navbar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-[#F0F0F0] px-6 py-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <img src="/arcade-logo.png" alt="Aptitude Arcade Logo" className="h-8 w-auto object-contain rounded-md shadow-sm" />
          <span className="text-xl md:text-2xl font-black tracking-tight text-black">Aptitude Arcade</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <a
            href="https://chat.whatsapp.com/KZNAUM1o7Qw0skVB5LA88T"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs md:text-sm font-bold uppercase tracking-wider px-3 md:px-4 py-2.5 rounded-xl transition-all"
          >
            <MessageCircle size={16} className="shrink-0" />
            <span className="hidden sm:inline">WhatsApp Community</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
          <Link
            to="/login"
            className="bg-[#FF6B2B] hover:bg-[#e0531b] text-white text-xs md:text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all flex items-center gap-1"
          >
            Enter Portal →
          </Link>
        </div>
      </header>

      {/* SECTION 1.5 — Logos */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#F0F0F0] bg-[#FAFAFA]">
        <img src="/iste-logo.png" alt="ISTE Logo" className="h-12 md:h-14 w-auto object-contain" />
        <img src="/mbu-logo.png" alt="MBU Logo" className="h-12 md:h-14 w-auto object-contain" />
      </div>

      {/* Main Sections */}
      <main className="flex-grow">
        {/* SECTION 2 — Hero */}
        <section 
          className="relative px-6 pt-8 pb-20 md:pt-10 md:pb-24 text-center flex flex-col items-center justify-center space-y-6 overflow-hidden min-h-[65vh]"
        >
          {/* Warm ambient background */}
          <div className="absolute inset-0 bg-[#FAFAFA]" />
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-b from-[#FF6B2B]/[0.06] via-[#FFD3B6]/[0.08] to-transparent blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6B2B]/10 to-transparent" />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-5 w-full">
            <motion.p
              {...fadeUp(0.1)}
              className="text-[#FF6B2B] text-[11px] font-black tracking-widest uppercase bg-white/80 px-4 py-1.5 rounded-full border border-orange-100 shadow-sm"
            >
              14-DAY SPRINT // ISTE MBU
            </motion.p>

            <motion.h1
              {...fadeUp(0.25)}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-black max-w-3xl"
            >
              Level Up Your Aptitude.<br />
              <span className="text-[#FF6B2B]">Conquer Competitive Exams.</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.4)}
              className="text-[#666666] text-sm md:text-base font-medium max-w-lg leading-relaxed"
            >
              14 daily aptitude challenges. Maintain your streak to qualify for the Grand Finale.
            </motion.p>

            <motion.div
              {...fadeUp(0.55)}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2"
            >
              <Link
                to="/signup"
                className="group relative w-full sm:w-auto px-8 py-3.5 bg-[#FF6B2B] hover:bg-[#e0531b] text-white font-bold rounded-xl shadow-lg shadow-[#FF6B2B]/20 transition-all text-sm uppercase tracking-wider hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="relative z-10">Register Now →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 text-black font-bold rounded-xl border border-gray-200 shadow-sm transition-all text-sm uppercase tracking-wider hover:-translate-y-0.5"
              >
                Student Login →
              </Link>
            </motion.div>

            {/* Stat Cards */}
            <motion.div
              {...fadeUp(0.7)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-8 w-full max-w-2xl"
            >
              {STATS.map(({ icon: Icon, label, sub, bg, ring, color }) => (
                <div
                  key={label}
                  className={`flex flex-col items-center gap-2.5 px-4 py-4 ${bg} rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className={`${ring} w-10 h-10 rounded-xl flex items-center justify-center`}>
                    <Icon size={20} className={`${color} shrink-0`} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-black leading-tight">{label}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SECTION 3 — Execution Flow */}
        <section className="bg-[#F9FAFB] px-6 py-24 border-t border-[#F0F0F0]">
          <div className="w-full max-w-[95%] mx-auto flex flex-col items-center">
            <p className="text-[#FF6B2B] text-[10px] font-black tracking-widest uppercase mb-2">
              EXECUTION FLOW
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-20 text-center">
              Simple rules. Strict timeline.
            </h2>

            <div className="relative w-full">
              {/* Connecting Line */}
              <div className="absolute top-[40px] left-[10%] w-[80%] h-[2px] bg-[#E5E5E5] hidden md:block z-0"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                {/* Step 1 */}
                <div className="flex flex-col items-start">
                  <div className="w-20 h-20 bg-black flex items-center justify-center text-white text-2xl font-black mb-8 shadow-sm">
                    01
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E5E5] rounded text-[10px] font-bold text-[#FF6B2B] uppercase tracking-wider mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B2B]"></span>
                    10:00 AM
                  </div>
                  <h3 className="text-lg font-black text-black uppercase tracking-wider mb-3">Learn</h3>
                  <p className="text-sm font-medium text-[#666666] leading-relaxed">
                    Tutorial drops every morning. Read it, watch it, understand it completely.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-start">
                  <div className="w-20 h-20 bg-white border-2 border-[#E5E5E5] flex items-center justify-center text-black text-2xl font-black mb-8 shadow-sm">
                    02
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E5E5] rounded text-[10px] font-bold text-[#FF6B2B] uppercase tracking-wider mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B2B]"></span>
                    10AM – NEXT DAY 12PM
                  </div>
                  <h3 className="text-lg font-black text-black uppercase tracking-wider mb-3">Attempt</h3>
                  <p className="text-sm font-medium text-[#666666] leading-relaxed">
                    The quiz opens at 10:00 AM and stays open until 12:00 PM the next day. Complete it securely in that window.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-start">
                  <div className="w-20 h-20 bg-[#FF6B2B] flex items-center justify-center text-white text-2xl font-black mb-8 shadow-sm">
                    03
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E5E5] rounded text-[10px] font-bold text-[#FF6B2B] uppercase tracking-wider mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B2B]"></span>
                    NEXT DAY: 12:00 PM
                  </div>
                  <h3 className="text-lg font-black text-black uppercase tracking-wider mb-3">Compete</h3>
                  <p className="text-sm font-medium text-[#666666] leading-relaxed">
                    After the window closes, see your rank on the leaderboard and identify weak spots.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 — Nexera 2k26 Heritage */}
        <section className="relative px-6 py-32 overflow-hidden border-t border-[#F0F0F0]">
          {/* Vibrant Mesh Gradient Background to show off Glassmorphism */}
          <div className="absolute inset-0 bg-[#FFFAF5]"></div>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[80%] rounded-full bg-gradient-to-br from-[#FF6B2B]/30 to-[#FF9E6B]/30 blur-[100px] animate-pulse"></div>
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[70%] rounded-full bg-gradient-to-br from-[#FFD3B6]/60 to-[#FF8B54]/40 blur-[120px]"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[60%] rounded-full bg-gradient-to-tr from-[#FF6B2B]/20 to-transparent blur-[80px]"></div>
          </div>

          <div className="max-w-7xl mx-auto bg-white/40 backdrop-blur-2xl border border-white/70 shadow-[0_30px_60px_rgba(255,107,43,0.1)] rounded-[2.5rem] p-10 md:p-16 lg:p-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 overflow-hidden">
            {/* Massive Faint Nexera Logo Watermark spanning the whole card, zoomed in to hide top logos */}
            <img 
              src="/nexera-logo.png" 
              alt="Nexera Watermark" 
              className="absolute inset-0 w-full h-full object-cover scale-[1.35] opacity-25 select-none pointer-events-none z-0 mix-blend-multiply origin-center"
            />
            {/* Left Column */}
            <div className="relative">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/50 px-4 py-1.5 rounded-full mb-8 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B2B] animate-pulse"></span>
                  <span className="text-[#FF6B2B] text-[10px] font-black tracking-widest uppercase">
                    SUMMER EDITION // NEXERA 2K26
                  </span>
                </div>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#1A1A1A] tracking-tight leading-[1.1] drop-shadow-sm">
                  A Tradition of<br />Excellence.
                </h2>
              </div>
            </div>
            
            {/* Right Column (Frosted Plaque) */}
            <div className="relative z-10 bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[2rem] p-8 md:p-10 lg:p-12 shadow-xl shadow-black/5">
              <div className="space-y-8">
                <p className="text-[#333333] text-xl font-medium leading-relaxed tracking-wide">
                  As a cornerstone of our club's legacy, the summer months are dedicated to <strong className="text-black font-black bg-white/80 px-3 py-1 rounded-md shadow-sm">Nexera 2k26</strong>—our traditional festival of innovation, skill, and competition.
                </p>
                <div className="w-16 h-1.5 bg-gradient-to-r from-[#FF6B2B] to-[#FF9E6B] rounded-full shadow-[0_0_10px_rgba(255,107,43,0.5)]"></div>
                <p className="text-[#555555] text-lg font-medium leading-relaxed">
                  Aptitude Arcade stands proudly as the flagship intellectual challenge of this summer series. It's not just a quiz; it's a rite of passage designed to test your limits and sharpen your mind alongside the brightest peers in the community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7 — FAQ */}
        <section className="bg-[#F5F5F5] px-6 py-20 border-t border-[#F0F0F0]">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-black text-black tracking-tight">
              Quick answers.
            </h2>

            <div className="space-y-3.5">
              {faqData.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden transition-all shadow-sm"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-sm md:text-base text-black focus:outline-none"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#FF6B2B] transition-transform duration-300 ${
                          isOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-[#666666] font-medium leading-relaxed border-t border-slate-50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-white relative overflow-hidden pt-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-12">
          {/* Top Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-1">
              <p className="text-white/60 font-medium text-sm">Aptitude Arcade Platform</p>
              <p className="text-white hover:text-[#FF6B2B] transition-colors cursor-pointer text-sm font-bold">istesvec.champs@gmail.com</p>
            </div>
            
            <div className="flex items-center gap-5">
              {/* Custom SVG Instagram Icon */}
              <a href="https://www.instagram.com/accounts/login/" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Middle Row */}
          <div className="flex flex-col md:flex-row justify-between items-center text-xs md:text-sm">
            <p className="font-bold text-white">Developers</p>
            <p className="text-white/60 font-medium">Made with <span className="text-[#FF6B2B]">❤️</span> by Iste web team</p>
          </div>

          {/* Divider Line */}
          <div className="w-full h-px bg-white/10"></div>
        </div>

        {/* Marquee */}
        <div className="w-full overflow-hidden pt-8 select-none pointer-events-none pb-0 mb-[-2vw]">
          <div className="animate-marquee flex whitespace-nowrap w-max">
            <span className="text-[14vw] md:text-[18vw] font-black text-[#1A1A1A] leading-[0.75] tracking-tighter pr-16">
              APTITUDE ARCADE
            </span>
            <span className="text-[14vw] md:text-[18vw] font-black text-[#1A1A1A] leading-[0.75] tracking-tighter pr-16">
              APTITUDE ARCADE
            </span>
            <span className="text-[14vw] md:text-[18vw] font-black text-[#1A1A1A] leading-[0.75] tracking-tighter pr-16">
              APTITUDE ARCADE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
