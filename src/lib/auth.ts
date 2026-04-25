import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from:   process.env.RESEND_FROM ?? "noreply@razornez.net",
      name:   "PantauDesa",
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id       = user.id;
      session.user.username = (user as { username?: string }).username ?? "";
      session.user.role     = (user as { role?: string }).role ?? "WARGA";
      return session;
    },
  },
  pages: {
    signIn:      "/login",
    verifyRequest: "/login/verify",
    newUser:     "/daftar",
  },
});
