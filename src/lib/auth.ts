import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import * as Sentry from "@sentry/nextjs";
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
  events: {
    signIn(message) {
      console.log("[auth] signIn", JSON.stringify({ userId: message.user.id, isNew: message.isNewUser }));
    },
    createUser(message) {
      console.log("[auth] createUser", JSON.stringify({ userId: message.user.id, email: message.user.email }));
    },
    session(message) {
      console.log("[auth] session", JSON.stringify({ userId: message.session.user.id }));
    },
  },
  logger: {
    error(error) {
      console.error("[auth] ERROR:", error.name, error.message, (error as Error).stack ?? "");
      Sentry.captureException(error, { tags: { source: "next-auth" } });
    },
    warn(code) {
      console.warn("[auth] WARN:", code);
    },
    debug(code, metadata) {
      console.log("[auth] DEBUG:", code, JSON.stringify(metadata));
    },
  },
  pages: {
    signIn:        "/login",
    verifyRequest: "/login/verify",
    newUser:       "/daftar",
    error:         "/login/auth-error",
  },
});
