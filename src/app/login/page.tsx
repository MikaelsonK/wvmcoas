"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Form, TextField, Label, Input, Button, Link } from "react-aria-components";
import { Eye, EyeOff } from "lucide-react";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 placeholder:text-gray-400 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [pending, setPending]   = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setPending(true);
      const result = await signIn("credentials", {
        email, password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else if (result?.url) {
        window.location.href = result.url;
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
            <img src="/oas_logo.png" alt="OAS Portal" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">OAS Portal</h1>
          <p className="text-sm text-gray-400 mt-0.5">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-8">

          {/* Error */}
          {error && (
            <div role="alert" className="mb-5 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[13px]">
              {error}
            </div>
          )}

          <Form onSubmit={onSubmit} className="flex flex-col gap-4">

            <TextField
              isRequired
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              className="flex flex-col gap-1.5"
            >
              <Label className="text-[12.5px] font-semibold text-gray-600">Email</Label>
              <Input
                id="login-email"
                placeholder="you@hospital.com"
                className={inputClass}
              />
            </TextField>

            <TextField
              isRequired
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              className="flex flex-col gap-1.5"
            >
              <Label className="text-[12.5px] font-semibold text-gray-600">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  placeholder="••••••••"
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

            <Button
              id="login-submit-btn"
              type="submit"
              isPending={pending}
              className="mt-1 w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] disabled:opacity-50 transition-colors duration-150 cursor-default flex items-center justify-center gap-2"
            >
              {({ isPending }) => isPending ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden />
              ) : "Sign In"}
            </Button>

          </Form>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center text-[12.5px] text-gray-400">
          No account?{" "}
          <Link href="/signup" className="text-brand-red font-semibold hover:underline outline-none">
            Pre-Register
          </Link>
        </div>

      </div>
    </div>
  );
}
