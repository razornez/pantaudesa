import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import * as Sentry from "@sentry/nextjs";
import { db } from "@/lib/db";
import { sendErrorAlert } from "@/lib/alert";

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
      const u = user as {
        id: string;
        name?: string | null;
        image?: string | null;
        username?: string | null;
        nama?: string | null;
        avatarUrl?: string | null;
        role?: string | null;
      };
      session.user.id       = u.id;
      // Prefer custom `nama` over NextAuth `name`; fall back gracefully
      session.user.name     = u.nama ?? u.name ?? "";
      session.user.image    = u.avatarUrl ?? u.image ?? null;
      session.user.username = u.username ?? "";
      session.user.role     = u.role ?? "WARGA";
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
      const msg = error.message ?? String(error);
      console.error("[auth] ERROR:", error.name, msg, (error as Error).stack ?? "");
      Sentry.captureException(error, { tags: { source: "next-auth" } });
      sendErrorAlert({
        subject:  `Auth Error: ${error.name}`,
        title:    error.name,
        body:     msg,
        metadata: { stack: (error as Error).stack?.split("\n")[1]?.trim() },
      });
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
