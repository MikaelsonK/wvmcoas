"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Form, TextField, Label, Input, Button, Link } from "react-aria-components";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

const schema = z.object({
  email:           z.string().email("Invalid email address"),
  password:        z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Passwords must be at least 6 characters"),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 placeholder:text-gray-400 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [pending, setPending]   = useState(false);

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
      setPending(true);
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
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl overflow-hidden mb-4 shadow-sm">
            <Image src="/oas_logo.png" alt="OAS Portal" width={48} height={48} className="object-cover" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">OAS Portal</h1>
          <p className="text-sm text-gray-400 mt-0.5">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-8">

          {success ? (
            /* Success state */
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <ShieldCheck size={24} className="text-green-600" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Account registered!</p>
                <p className="text-xs text-gray-400 mt-0.5">Redirecting to sign in…</p>
              </div>
            </div>
          ) : (
            <>
              {/* Error */}
              {error && (
                <div role="alert" className="mb-4 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[13px]">
                  {error}
                </div>
              )}

              <Form onSubmit={handleSignup} className="flex flex-col gap-4">

                <TextField
                  isRequired
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={set("email")}
                  className="flex flex-col gap-1.5"
                >
                  <Label className="text-[12.5px] font-semibold text-gray-600">Email</Label>
                  <Input
                    id="signup-email"
                    placeholder="you@hospital.com"
                    className={inputClass}
                  />
                </TextField>

                <TextField
                  isRequired
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={set("password")}
                  className="flex flex-col gap-1.5"
                >
                  <Label className="text-[12.5px] font-semibold text-gray-600">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      placeholder="Min. 6 characters"
                      className={`${inputClass} pr-10`}
                    />
                    <Button
                      slot={null}
                      aria-label={showPass ? "Hide password" : "Show password"}
                      onPress={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors outline-none cursor-pointer"
                    >
                      {showPass ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
                    </Button>
                  </div>
                </TextField>

                <TextField
                  isRequired
                  type={showConf ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={set("confirmPassword")}
                  className="flex flex-col gap-1.5"
                >
                  <Label className="text-[12.5px] font-semibold text-gray-600">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm"
                      placeholder="Re-enter password"
                      className={`${inputClass} pr-10`}
                    />
                    <Button
                      slot={null}
                      aria-label={showConf ? "Hide password" : "Show password"}
                      onPress={() => setShowConf(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors outline-none cursor-pointer"
                    >
                      {showConf ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
                    </Button>
                  </div>
                </TextField>

                <Button
                  id="signup-submit-btn"
                  type="submit"
                  isPending={pending}
                  className="mt-1 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] disabled:opacity-50 transition-colors duration-150 cursor-default flex items-center justify-center gap-2"
                >
                  {({ isPending }) => isPending ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden />
                  ) : "Create Account"}
                </Button>

              </Form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 text-center text-[12.5px] text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-red font-semibold hover:underline outline-none">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
