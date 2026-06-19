"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Form, TextField, Label, Input, Button, Link } from "react-aria-components";
import { TrendingUp, FileCheck, CalendarDays, LogIn, Eye, EyeOff, ArrowLeft, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router   = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [toast, setToast]       = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading]   = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setToast(null);

    if (!email || !password) {
      setToast({ type: "error", message: "Please fill in all fields." });
      return;
    }

    try {
      setLoading(true);
      const result = await signIn("credentials", {
        email, password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setToast({ type: "error", message: "Invalid email or password. Please try again." });
      } else if (result?.url) {
        setToast({ type: "success", message: "Welcome back! Redirecting to your dashboard…" });
        setTimeout(() => { window.location.href = result.url || "/"; }, 1200);
      }
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 4000);
    }
  }

  const features = [
    { Icon: TrendingUp,    title: "Real-Time Rotation Tracker",  desc: "Log operations, track procedure targets, and export summaries." },
    { Icon: FileCheck,     title: "Competency Grading Sheets",   desc: "Consolidate OSCE, oral exams, quizzes, and RISE scores." },
    { Icon: CalendarDays,  title: "Interactive Event Calendar",  desc: "Monitor rotation dates and download blank assessment templates." },
  ];

  return (
    <div className="flex min-h-screen w-full max-lg:flex-col">

      {/* ══════════════════════════════════════
          LEFT — Branding Panel
      ══════════════════════════════════════ */}
      <div className="flex-[1.2] bg-gradient-to-br from-[#a00707] via-[#7a0505] to-[#4a0000] flex flex-col justify-between p-[60px] max-md:p-10 text-white relative overflow-hidden">

        {/* Decorative circles */}
        <div className="lp-deco-circle lp-deco-circle-1" aria-hidden="true" />
        <div className="lp-deco-circle lp-deco-circle-2" aria-hidden="true" />
        <div className="lp-deco-circle lp-deco-circle-3" aria-hidden="true" />
        {/* Subtle grid */}
        <div className="lp-grid" aria-hidden="true" />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-11 h-11 rounded-[10px] overflow-hidden border border-white/25 bg-white/10 backdrop-blur-sm flex-shrink-0 shadow-lg">
            <img src="/oas_logo.png" alt="OAS Portal Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="block font-bold text-[17px] tracking-tight leading-tight">OAS Portal</span>
            <span className="block text-[11px] text-white/50 tracking-wide">OBGYNE Residency</span>
          </div>
        </div>

        {/* Hero */}
        <div className="my-auto z-10 max-w-[460px] max-lg:my-10">
          <div className="lp-badge mb-6">
            <Sparkles size={11} />
            Residency Management System
          </div>

          <h1 className="text-[42px] max-md:text-[30px] font-extrabold leading-[1.13] tracking-[-1px] mb-5 text-white">
            Online Assessment &amp;<br />
            <span className="lp-gold-text">Rotations Tracker</span>
          </h1>

          <p className="text-[15px] text-white/72 leading-relaxed mb-10 max-w-[400px]">
            Empowering residency programs with real-time competency metrics,
            clinical rotation trackers, and comprehensive evaluations — all in one place.
          </p>

          <ul className="flex flex-col gap-4 max-lg:hidden">
            {features.map(({ Icon, title, desc }) => (
              <li key={title} className="lp-feature-item group">
                <div className="lp-feature-icon">
                  <Icon size={17} />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-white mb-0.5">{title}</p>
                  <p className="text-[12px] text-white/58 leading-snug">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-white/35 z-10">
          © 2022 OAS Portal · All rights reserved · OBGYNE Residency
        </p>
      </div>

      {/* ══════════════════════════════════════
          RIGHT — Form Panel
      ══════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center bg-[#f5f6f8] px-10 py-14 max-md:px-5 relative overflow-hidden">

        {/* Background texture dots */}
        <div className="lp-dots" aria-hidden="true" />

        {/* Soft glow behind card */}
        <div className="lp-card-glow" aria-hidden="true" />

        <div className="w-full max-w-[430px] relative z-10">

          {/* Card */}
          <div className="bg-white rounded-[28px] border border-gray-200/70 shadow-[0_8px_40px_rgba(0,0,0,0.07),0_2px_8px_rgba(0,0,0,0.04)] p-11 max-md:p-8 relative overflow-hidden">

            {/* Card top accent line */}
            <div className="lp-card-accent" aria-hidden="true" />

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#a00707] to-[#7f0000] flex items-center justify-center shadow-[0_6px_20px_rgba(160,7,7,0.3)] flex-shrink-0">
                  <LogIn size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-[24px] font-extrabold text-gray-900 tracking-tight leading-tight mb-0.5">
                    Welcome back
                  </h2>
                  <p className="text-[13px] text-gray-400 font-normal">Sign in to access your dashboard</p>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[11.5px] text-gray-350 font-medium tracking-wide uppercase" style={{ color: "#b0b8c1" }}>
                  Enter your credentials
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </div>

            {/* Toast */}
            {toast && (
              <div
                className={`mb-6 flex items-start gap-3 px-4 py-3 rounded-xl text-[13px] font-medium lp-toast-slide ${
                  toast.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
                role="alert"
              >
                <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
                }`} />
                {toast.message}
              </div>
            )}

            {/* Form */}
            <Form onSubmit={onSubmit} className="flex flex-col gap-5">

              {/* Email */}
              <TextField
                isRequired
                type="email"
                value={email}
                onChange={setEmail}
                className="flex flex-col gap-1.5"
              >
                <Label className="text-[12.5px] font-semibold text-gray-600 tracking-wide">
                  Email Address
                </Label>
                <Input
                  id="login-email"
                  className="lp-input"
                  placeholder="name@hospital.com"
                  autoComplete="email"
                />
              </TextField>

              {/* Password */}
              <TextField
                isRequired
                type={showPass ? "text" : "password"}
                value={password}
                onChange={setPassword}
                className="flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-[12.5px] font-semibold text-gray-600 tracking-wide">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    className="lp-input pr-12"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded-md"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </TextField>

              {/* Submit */}
              <Button
                id="login-submit-btn"
                type="submit"
                isDisabled={loading}
                className="lp-submit-btn"
              >
                {loading ? (
                  <span className="lp-spinner" />
                ) : (
                  <>
                    <LogIn size={16} />
                    Sign In
                  </>
                )}
              </Button>

            </Form>

            {/* Footer */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-[13px] text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-[#a00707] hover:text-[#7f0000] hover:underline outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded transition-colors"
                >
                  Pre-Register
                </Link>
              </p>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-[12.5px] text-gray-400 hover:text-gray-700 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded"
              >
                <ArrowLeft size={13} />
                Back to Home
              </Link>
            </div>

          </div>

          {/* Beneath-card trust badge */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[11.5px] text-gray-400">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secured · OBGYNE Residency Program · Data Privacy Protected
          </div>

        </div>
      </div>

      {/* ══ Scoped styles ══ */}
      <style>{`
        /* ── Left panel decorative circles ── */
        .lp-deco-circle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .lp-deco-circle-1 {
          width: 420px; height: 420px;
          top: -140px; right: -120px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .lp-deco-circle-2 {
          width: 280px; height: 280px;
          bottom: -80px; left: -80px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .lp-deco-circle-3 {
          width: 160px; height: 160px;
          top: 42%; right: 30px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
        }

        /* ── Left panel grid ── */
        .lp-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* ── Badge ── */
        .lp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 13px;
          border-radius: 100px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #f5c842;
          background: rgba(245, 200, 66, 0.12);
          border: 1px solid rgba(245, 200, 66, 0.28);
          width: fit-content;
        }

        /* ── Gold shimmer text ── */
        .lp-gold-text {
          background: linear-gradient(110deg, #fbbf24 0%, #f5c842 40%, #fde68a 60%, #f5c842 80%, #fbbf24 100%);
          background-size: 250% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: lpShimmer 3.5s linear infinite;
        }
        @keyframes lpShimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 250% center; }
        }

        /* ── Feature items ── */
        .lp-feature-item {
          display: flex;
          gap: 15px;
          align-items: flex-start;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
          cursor: default;
        }
        .lp-feature-item:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.18);
          transform: translateX(5px);
        }
        .lp-feature-icon {
          width: 36px; height: 36px;
          border-radius: 9px;
          background: rgba(245, 200, 66, 0.15);
          border: 1px solid rgba(245, 200, 66, 0.25);
          display: flex; align-items: center; justify-content: center;
          color: #f5c842;
          flex-shrink: 0;
        }

        /* ── Right panel dots ── */
        .lp-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        /* ── Card glow ── */
        .lp-card-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(160, 7, 7, 0.06) 0%, transparent 65%);
          pointer-events: none;
        }

        /* ── Card top accent ── */
        .lp-card-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #a00707 0%, #cd9804 50%, #a00707 100%);
          border-radius: 28px 28px 0 0;
        }

        /* ── Input ── */
        .lp-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          font-family: 'Poppins', sans-serif;
          color: #1f2937;
          background: #fafafa;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }
        .lp-input::placeholder { color: #9ca3af; }
        .lp-input:hover { border-color: #d1d5db; background: #fff; }
        .lp-input:focus {
          border-color: #a00707;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(160, 7, 7, 0.08);
        }

        /* ── Submit button ── */
        .lp-submit-btn {
          width: 100%;
          padding: 13.5px 24px;
          font-size: 14.5px;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          color: #fff;
          background: linear-gradient(135deg, #a00707 0%, #800606 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          letter-spacing: 0.1px;
          box-shadow: 0 6px 20px rgba(160, 7, 7, 0.28), 0 2px 6px rgba(160, 7, 7, 0.2);
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          margin-top: 2px;
        }
        .lp-submit-btn:hover:not([disabled]) {
          transform: translateY(-1.5px);
          box-shadow: 0 10px 28px rgba(160, 7, 7, 0.35), 0 4px 10px rgba(160, 7, 7, 0.25);
          background: linear-gradient(135deg, #b50808 0%, #900707 100%);
        }
        .lp-submit-btn:active:not([disabled]) {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(160, 7, 7, 0.2);
        }
        .lp-submit-btn[disabled] {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* ── Spinner ── */
        .lp-spinner {
          display: inline-block;
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lpSpin 0.65s linear infinite;
        }
        @keyframes lpSpin { to { transform: rotate(360deg); } }

        /* ── Toast slide-in ── */
        .lp-toast-slide {
          animation: lpToastIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes lpToastIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

    </div>
  );
}
