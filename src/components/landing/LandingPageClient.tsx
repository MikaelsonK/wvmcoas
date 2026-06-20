"use client";

import { Link, Button } from "react-aria-components";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";

export function LandingPageClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white bg-watermark">

      {/* ── Header ── */}
      <header className="w-full px-10 max-md:px-5 py-5 flex justify-between items-center border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-md shadow-brand-red/20 transition-transform duration-300 hover:rotate-12 hover:scale-105 cursor-pointer">
            <Image src="/oas_logo.png" alt="OAS Portal Logo" width={40} height={40} className="object-cover" />
          </div>
          <div>
            <strong className="text-[18px] font-bold text-gray-900 block leading-tight tracking-tight">OAS Portal</strong>
            <small className="text-[10px] text-brand-gold font-bold uppercase tracking-[1.5px] block">OBGYNE RESIDENCY</small>
          </div>
        </div>
        <nav className="flex gap-3 items-center">
          <Link
            href="/login"
            className="text-[13px] font-semibold text-gray-700 px-5 py-2 rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-[13px] font-semibold text-white bg-gradient-to-r from-brand-red to-[#800000] px-5 py-2 rounded-full shadow-sm shadow-brand-red/30 hover:shadow-md hover:brightness-110 hover:scale-[1.02] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
          >
            Pre-Register
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center px-5 pt-20 pb-16">
        <h1 className="text-[52px] max-lg:text-[40px] max-md:text-[32px] font-extrabold text-gray-900 tracking-tight leading-[1.12] mb-5 max-w-[820px]">
          Online Assessment &amp;{" "}
          <span className="bg-gradient-to-r from-brand-red to-[#7f0000] bg-clip-text text-transparent">
            Rotations Tracker
          </span>
        </h1>
        <p className="text-[17px] text-gray-500 max-w-[640px] mb-10 leading-relaxed">
          Streamlining clinical evaluations, procedure monitoring, and competence scorecards for medical education programs.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-20">
          <Button
            onPress={() => router.push("/login")}
            className="flex items-center gap-2.5 text-[14px] font-semibold text-white bg-gradient-to-r from-brand-red to-[#7f0000] px-8 py-3.5 rounded-xl shadow-lg shadow-brand-red/25 hover:scale-[1.02] hover:brightness-110 hover:shadow-xl hover:shadow-brand-red/35 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 cursor-pointer group"
          >
            <Rocket size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            Access Dashboard
          </Button>
          <Button
            onPress={() => router.push("/signup")}
            className="text-[14px] font-semibold text-gray-800 bg-white px-8 py-3.5 rounded-xl border border-gray-300 shadow-sm hover:scale-[1.02] hover:border-gray-400 hover:shadow-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 cursor-pointer"
          >
            Create Account
          </Button>
        </div>

        {/* ── Feature Cards ── */}
        <div className="w-full max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-5">

          <div className="bg-white border border-gray-200/70 rounded-2xl p-7 shadow-sm hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-red/5 hover:border-brand-red/15 transition-all duration-300 flex flex-col items-start relative overflow-hidden group text-left">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-brand-red/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-full h-44 flex justify-center items-center mb-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100/80 overflow-hidden">
              <Image
                src="/rotations_track_icon.png"
                alt="Real-Time Rotations Track"
                width={108}
                height={108}
                className="object-contain drop-shadow-md group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300"
              />
            </div>
            <h3 className="text-[17px] font-bold text-gray-900 mb-2.5 leading-snug">Real-Time Rotations Track</h3>
            <p className="text-[13.5px] text-gray-500 leading-relaxed">
              Log clinical operations, track completion targets (e.g. 15 per procedure type), and generate printable progress summary documents.
            </p>
          </div>

          <div className="bg-white border border-gray-200/70 rounded-2xl p-7 shadow-sm hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-red/5 hover:border-brand-red/15 transition-all duration-300 flex flex-col items-start relative overflow-hidden group text-left">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-brand-red/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-full h-44 flex justify-center items-center mb-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100/80 overflow-hidden">
              <Image
                src="/grading_sheets_icon.png"
                alt="Competency Grading Sheets"
                width={108}
                height={108}
                className="object-contain drop-shadow-md group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300"
              />
            </div>
            <h3 className="text-[17px] font-bold text-gray-900 mb-2.5 leading-snug">Competency Grading Sheets</h3>
            <p className="text-[13.5px] text-gray-500 leading-relaxed">
              Aggregate Quizzes, Long Exams, Oral Exams, OSCE, RISE, and Clinical Competence grades filtered by evaluation period and resident year level.
            </p>
          </div>

          <div className="bg-white border border-gray-200/70 rounded-2xl p-7 shadow-sm hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-red/5 hover:border-brand-red/15 transition-all duration-300 flex flex-col items-start relative overflow-hidden group text-left">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-brand-red/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-full h-44 flex justify-center items-center mb-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100/80 overflow-hidden">
              <Image
                src="/calendar_icon.png"
                alt="Interactive Event Calendar"
                width={108}
                height={108}
                className="object-contain drop-shadow-md group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300"
              />
            </div>
            <h3 className="text-[17px] font-bold text-gray-900 mb-2.5 leading-snug">Interactive Event Calendar</h3>
            <p className="text-[13.5px] text-gray-500 leading-relaxed">
              Check rotations dates, customize calendar highlight colors, and download blank PDF templates for clinical assessments.
            </p>
          </div>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full px-10 py-8 border-t border-gray-100 flex flex-col items-center gap-2.5 mt-10">
        <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm shadow-brand-red/20">
          <Image src="/oas_logo.png" alt="OAS Portal Logo" width={28} height={28} className="object-cover" />
        </div>
        <p className="text-[12px] text-gray-400 tracking-wide">
          &copy; 2022 OAS Portal &ndash; All rights Reserved.
        </p>
      </footer>

    </div>
  );
}
