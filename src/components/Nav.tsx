"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function Nav() {
  const { data } = useSession();

  return (
    <div className="nav">
      <div className="nav-inner">
        <div className="nav-links">
          <Link href="/"><strong>OAS MVP</strong></Link>
          {data?.user?.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}
          {data?.user?.role === "EVALUATOR" ? <Link href="/evaluator">Evaluator</Link> : null}
          {data?.user?.role === "RESIDENT" ? <Link href="/resident">Resident</Link> : null}
        </div>

        <div className="nav-links">
          {data?.user ? (
            <>
              <small>{data.user.role}</small>
              <button className="secondary" onClick={() => signOut({ callbackUrl: "/login" })}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </div>
      </div>
    </div>
  );
}
