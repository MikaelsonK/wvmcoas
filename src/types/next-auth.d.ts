import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "EVALUATOR" | "RESIDENT";
      name?: string | null;
      email?: string | null;
    };
  }
}
