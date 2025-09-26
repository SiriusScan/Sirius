import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import bcrypt from "bcrypt";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Get the appropriate NextAuth URL based on environment
 * This fixes the localhost redirect issue by using the request host
 */
const getNextAuthUrl = (req?: any): string => {
  // In production or when NEXTAUTH_URL is explicitly set, use that
  if (process.env.NEXTAUTH_URL && process.env.NODE_ENV === "production") {
    return process.env.NEXTAUTH_URL;
  }

  // For development, try to get the host from the request
  if (req && req.headers) {
    const host = req.headers.host;
    const protocol =
      req.headers["x-forwarded-proto"] ||
      (req.connection?.encrypted ? "https" : "http");

    if (host) {
      return `${protocol}://${host}`;
    }
  }

  // Fallback to localhost for local development
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET || "change-this-secret-in-production-please",
  session: {
    strategy: "jwt",
    maxAge: 100 * 365 * 24 * 60 * 60, // 100 years in seconds - effectively indefinite
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    // Fix redirect callback to use proper URL
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Allow callbacks to the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // For other URLs, redirect to dashboard
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
          console.log("Missing credentials");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { name: credentials.username },
          });

          if (!user) {
            console.log("User not found:", credentials.username);
            return null;
          }

          // Verify the password using bcrypt
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            console.log("Invalid password for user:", credentials.username);
            return null;
          }

          // Return user object that will be passed to JWT
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages: {
    signIn: "/",
    error: "/", // Redirect errors back to sign in page
  },
  // Enable debug in development
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
