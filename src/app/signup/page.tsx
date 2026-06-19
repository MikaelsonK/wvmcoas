"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Form, TextField, Label, Input, Button, Link } from "react-aria-components";
import { UserPlus, ShieldCheck } from "lucide-react";

const schema = z.object({
  email:           z.string().email("Invalid email address"),
  password:        z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Passwords must be at least 6 characters"),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  function set(key: keyof typeof formData) {
    return (val: string) => setFormData(prev => ({ ...prev, [key]: val }));
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = schema.safeParse(formData);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Registration failed. This email may already be registered.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full max-lg:flex-col">

      {/* ── Left: Branding panel ── */}
      <div className="flex-[1.2] bg-gradient-to-br from-brand-red to-[#4a0000] flex flex-col justify-between p-[60px] max-md:p-10 text-white relative overflow-hidden bg-watermark-dark">

        {/* Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-white/10 backdrop-blur-sm flex-shrink-0">
            <img src="/oas_logo.png" alt="OAS Portal Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-[18px] tracking-tight">OAS Portal</span>
        </div>

        {/* Content */}
        <div className="my-auto z-10 max-w-[460px] max-lg:my-10">
          <h1 className="text-[40px] max-md:text-[30px] font-extrabold leading-tight tracking-tight mb-4 text-white">
            Join the OBGYNE Residency Program
          </h1>
          <p className="text-[15px] text-white/80 leading-relaxed mb-10">
            Pre-register your account to gain access to clinical rotation tracking, competency grading, and evaluation tools designed for residents.
          </p>

          <ul className="flex flex-col gap-5 max-lg:hidden">
            {[
              { icon: "🏥", title: "Role-Based Access",      desc: "Separate dashboards for Residents, Evaluators, and Admins." },
              { icon: "📊", title: "Progress Tracking",      desc: "Monitor procedure completions against required targets." },
              { icon: "🔒", title: "Secure & Confidential",  desc: "All clinical data is securely stored and role-gated." },
            ].map(({ icon, title, desc }) => (
              <li key={title} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center flex-shrink-0 text-xl">
                  {icon}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white mb-0.5">{title}</p>
                  <p className="text-[12.5px] text-white/65 leading-snug">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-white/40 z-10">
          &copy; 2022 OAS Portal. All rights reserved. OBGYNE Residency.
        </p>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-[#f8fafc] px-10 py-14 max-md:px-5 bg-watermark-light relative">
        <div className="w-full max-w-[420px] bg-white rounded-3xl border border-gray-200/80 shadow-sm p-11 max-md:p-8 relative z-10">

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-[26px] font-extrabold text-gray-900 tracking-tight mb-1">Create Account</h2>
            <p className="text-[13.5px] text-gray-500">Register to access the OAS Portal</p>
          </div>

          {/* Success state */}
          {success ? (
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <ShieldCheck size={28} className="text-green-600" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900 mb-1">Account registered!</p>
                <p className="text-[13px] text-gray-500">Redirecting you to the login page…</p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl text-[13.5px] font-medium bg-red-50 border border-red-200 text-red-700">
                  {error}
                </div>
              )}

              <Form onSubmit={handleSignup} className="flex flex-col gap-0">

                <TextField
                  isRequired
                  type="email"
                  value={formData.email}
                  onChange={set("email")}
                  className="flex flex-col gap-1.5 mb-5"
                >
                  <Label className="text-[12.5px] font-semibold text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    className="w-full px-4 py-[11px] text-[14px] bg-white border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:border-brand-red focus:ring-4 focus:ring-brand-red/8 placeholder:text-gray-400"
                    placeholder="yourname@hospital.com"
                    autoComplete="email"
                  />
                </TextField>

                <TextField
                  isRequired
                  type="password"
                  value={formData.password}
                  onChange={set("password")}
                  className="flex flex-col gap-1.5 mb-5"
                >
                  <Label className="text-[12.5px] font-semibold text-gray-700">Password</Label>
                  <Input
                    id="password"
                    className="w-full px-4 py-[11px] text-[14px] bg-white border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:border-brand-red focus:ring-4 focus:ring-brand-red/8 placeholder:text-gray-400"
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                  />
                </TextField>

                <TextField
                  isRequired
                  type="password"
                  value={formData.confirmPassword}
                  onChange={set("confirmPassword")}
                  className="flex flex-col gap-1.5 mb-6"
                >
                  <Label className="text-[12.5px] font-semibold text-gray-700">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    className="w-full px-4 py-[11px] text-[14px] bg-white border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:border-brand-red focus:ring-4 focus:ring-brand-red/8 placeholder:text-gray-400"
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                </TextField>

                <Button
                  type="submit"
                  isDisabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-[13px] rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-brand-red to-[#7f0000] shadow-md shadow-brand-red/20 hover:brightness-110 hover:scale-[1.01] hover:shadow-lg hover:shadow-brand-red/30 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer"
                >
                  {loading ? (
                    "Creating account…"
                  ) : (
                    <><UserPlus size={15} /> Create Account</>
                  )}
                </Button>

              </Form>

              {/* Privacy notice */}
              <div className="mt-5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-[12px] text-blue-700 leading-snug">
                🔒 By registering, you agree to our Terms of Service and Data Privacy Policy.
              </div>
            </>
          )}

          {/* Footer links */}
          <div className="mt-7 flex flex-col items-center gap-3 text-[13px] text-gray-500">
            <span>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand-red hover:underline outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded"
              >
                Sign In
              </Link>
            </span>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded"
            >
              ← Back to Home
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
