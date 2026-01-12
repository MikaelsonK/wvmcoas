import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { env } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EVALUATOR" | "RESIDENT";
};

function isAuthUser(u: unknown): u is AuthUser {
  if (typeof u !== "object" || u === null) return false;

  if (!("id" in u) || !("email" in u) || !("name" in u) || !("role" in u)) return false;

  const id = u.id;
  const email = u.email;
  const name = u.name;
  const role = u.role;

  return (
    typeof id === "string" &&
    typeof email === "string" &&
    typeof name === "string" &&
    (role === "ADMIN" || role === "EVALUATOR" || role === "RESIDENT")
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };

        return authUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && isAuthUser(user)) {
        token.userId = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      const tokenUserId = token.userId;
      const tokenRole = token.role;

      if (typeof tokenUserId === "string" && (tokenRole === "ADMIN" || tokenRole === "EVALUATOR" || tokenRole === "RESIDENT")) {
        session.user.id = tokenUserId;
        session.user.role = tokenRole;
      }

      return session;
    },
  },
};
