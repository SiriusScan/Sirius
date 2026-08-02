import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import { type JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import bcrypt from "bcrypt";

export type UserRole = "admin" | "student";

/**
 * Module augmentation for `next-auth` types.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      subjectId: string;
      role: UserRole;
      sessionVersion: number;
      mustChangePassword: boolean;
    };
  }

  interface User {
    subjectId: string;
    role: UserRole;
    sessionVersion: number;
    mustChangePassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    subjectId?: string;
    role?: UserRole;
    sessionVersion?: number;
    mustChangePassword?: boolean;
  }
}

const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET || undefined,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  callbacks: {
    async jwt({ token, user, trigger }): Promise<JWT> {
      if (user) {
        token.sub = String(user.id);
        token.subjectId = user.subjectId;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        token.mustChangePassword = user.mustChangePassword;
      }

      // Client session.update() — refresh identity flags from DB (e.g. after password change).
      if (trigger === "update" && token.sub) {
        const userId = Number(token.sub);
        if (Number.isFinite(userId) && userId > 0) {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              subjectId: true,
              role: true,
              sessionVersion: true,
              mustChangePassword: true,
              active: true,
              name: true,
              email: true,
            },
          });
          if (!dbUser || !dbUser.active) {
            token.sessionVersion = -1;
            return token;
          }
          token.subjectId = dbUser.subjectId;
          token.role = dbUser.role === "admin" ? "admin" : "student";
          token.sessionVersion = dbUser.sessionVersion;
          token.mustChangePassword = dbUser.mustChangePassword;
          token.name = dbUser.name;
          token.email = dbUser.email;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.subjectId = token.subjectId ?? `local:legacy-${token.sub}`;
        session.user.role = token.role ?? "student";
        session.user.sessionVersion = token.sessionVersion ?? 0;
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Default post-login landing; Layout sends students to /scanner.
      return `${baseUrl}/dashboard`;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { name: credentials.username },
          });

          if (!user || !user.active) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            return null;
          }

          const role = (user.role === "admin" ? "admin" : "student") as UserRole;

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            subjectId: user.subjectId,
            role,
            sessionVersion: user.sessionVersion,
            mustChangePassword: user.mustChangePassword,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  debug: process.env.NODE_ENV === "development",
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
