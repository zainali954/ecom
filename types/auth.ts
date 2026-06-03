import type { DefaultSession } from "next-auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  emailVerified: Date | null;
}

export interface AuthActionState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "customer" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "customer" | "admin";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: "customer" | "admin";
  }
}
