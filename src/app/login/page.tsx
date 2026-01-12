"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });

    if (result?.error) setError("Invalid email/password.");
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: "24px auto" }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit} className="row">
        <div className="col">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div className="col">
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
        <button>Login</button>
      </form>
      <p><small>Use seeded credentials after seeding.</small></p>
    </div>
  );
}
