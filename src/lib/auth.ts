import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import * as Sentry from "@sentry/nextjs";
import { db } from "@/lib/db";
import { sendErrorAlert } from "@/lib/alert";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  // Use JWT for Credentials (PIN), database for Resend (magic link)
  // NextAuth v5 uses JWT by default when Credentials is present
  session: { strategy: "jwt" },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from:   process.env.RESEND_FROM ?? "noreply@razornez.net",
      name:   "PantauDesa",
    }),
    Credentials({
      id:   "pin",
      name: "PIN",
      credentials: { email: { type: "email" } },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const user = await db.user.findUnique({
          where:  { email: String(credentials.email).toLowerCase() },
          select: {
            id: true, email: true, nama: true, name: true,
            username: true, avatarUrl: true, image: true,
            role: true, emailVerified: true,
          },
        });
        if (!user || !user.emailVerified) return null;
        return {
          id:       user.id,
          email:    user.email,
          name:     user.nama ?? user.name ?? "",
          image:    user.avatarUrl ?? user.image ?? null,
          username: user.username ?? "",
          role:     user.role as string,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id       = user.id;
        const u        = user as Record<string, unknown>;
        token.username = (u.username as string | undefined) ?? "";
        token.role     = (u.role     as string | undefined) ?? "WARGA";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id       = token.id as string;
      session.user.username = (token.username as string | undefined) ?? "";
      session.user.role     = (token.role     as string | undefined) ?? "WARGA";
      return session;
    },
  },
  events: {
    signIn(message) {
      console.log("[auth] signIn", JSON.stringify({ userId: message.user.id, isNew: message.isNewUser }));
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
    warn(code)              { console.warn("[auth] WARN:", code); },
    debug(code, metadata)   { console.log("[auth] DEBUG:", code, JSON.stringify(metadata)); },
  },
  pages: {
    signIn:        "/login",
    verifyRequest: "/login/verify",
    newUser:       "/daftar",
    error:         "/login/auth-error",
  },
});
