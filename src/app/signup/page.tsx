"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { z } from "zod";

// Validation schema for signup
const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    
    // Validate form data
    const validation = signUpSchema.safeParse(formData);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        // User already exists or credentials are invalid
        setError("An account with this email may already exist.");
      } else if (result?.url) {
        setFormData({ email: "", password: "", confirmPassword: "" });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: "24px auto", padding: "32px" }}>
      <h1 style={{ textAlign: "center" }}>Create Account</h1>
      
      {error ? (
        <p style={{ color: "crimson", textAlign: "center", marginTop: "16px" }}>{error}</p>
      ) : null}

      <form onSubmit={handleSignup} className="row">
        <div className="col" style={{ marginBottom: "24px" }}>
          <label htmlFor="email">Email Address</label>
          <input 
            id="email"
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            type="email" 
            placeholder="yourname@hospital.com"
            required 
          />
        </div>

        <div className="col">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            value={formData.password} 
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
            type="password" 
            placeholder="Min 6 characters"
            required 
          />
        </div>

        <div className="col">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input 
            id="confirmPassword"
            value={formData.confirmPassword} 
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
            type="password" 
            placeholder="Re-enter password"
            required 
          />
        </div>

        {error ? <p style={{ color: "crimson", textAlign: "center" }}>{error}</p> : null}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: "100%", padding: "12px 24px", background: "#cd9804", color: "white" }}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* --- Terms of Service / Privacy Notice --- */}
      <div style={{ 
        marginTop: "24px", 
        padding: "16px", 
        background: "#fff8f5", 
        borderRadius: "8px",
        fontSize: "14px",
        lineHeight: 1.6
      }}>
        <small>🔒 By creating an account, you agree to:</small>
        <ul style={{ margin: "8px 0 0 20px" }}>
          <li>Our Terms of Service</li>
          <li>Data Privacy Policy</li>
          <li>Password security requirements (6+ characters)</li>
        </ul>
      </div>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <Link href="/login" style={{ color: "#a00707", textDecoration: "none" }}>Already have an account? Login &rarr;</Link>
      </div>
    </div>
  );
}
