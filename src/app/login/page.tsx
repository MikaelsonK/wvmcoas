"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Don't auto-redirect to handle errors properly
        callbackUrl: "/",
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else if (result?.url) {
        setSuccess(`Welcome back! Redirecting to ${result.url}`);
        // Wait for a moment then redirect
        setTimeout(() => window.location.href = result.url, 1000);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: "24px auto", padding: "32px" }}>
      <h1 style={{ textAlign: "center" }}>Welcome Back</h1>
      
      {success ? (
        <div style={{ padding: "16px", background: "#e8f5e9", color: "#2e7d32", borderRadius: "8px" }}>
          {success}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="row">
        <div className="col">
          <label htmlFor="email">Email Address</label>
          <input 
            id="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email" 
            placeholder="admin@hospital.com (test account)"
            required 
          />
        </div>
        <div className="col">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            type="password" 
            placeholder="••••••••"
            required 
          />
        </div>
      </form>

      <button style={{ width: "100%", marginTop: "16px", padding: "12px 24px", background: "#a00707", color: "white" }}>
        Sign In
      </button>

      {error ? (
        <p style={{ color: "crimson", textAlign: "center", marginTop: "16px" }}>{error}</p>
      ) : null}

      {/* --- Test Account Hints (Remove in Production) --- */}
      <div style={{ marginTop: "32px", padding: "16px", background: "#f5f5f5", borderRadius: "8px" }}>
        <small><strong>🧪 Testing Credentials:</strong></small>
        <p style={{ fontFamily: "monospace", fontSize: "14px", margin: "8px 0" }}>Admin: admin@hospital.com / SecurePass123!</p>
        <p style={{ fontFamily: "monospace", fontSize: "14px", margin: "8px 0" }}>Evaluator: evaluator@hospital.com / ReviewPass456!</p>
        <p style={{ fontFamily: "monospace", fontSize: "14px", margin: "8px 0" }}>Resident: resident@hospital.com / MyBasicPass789!</p>
      </div>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <Link href="/signup" style={{ color: "#a00707", textDecoration: "underline" }}>Create Account</Link>
        <span style={{ marginLeft: "16px" }}>or</span>
        <Link href="/" style={{ color: "#a00707", textDecoration: "none" }}>&larr; Back to Home</Link>
      </div>
    </div>
  );
}
