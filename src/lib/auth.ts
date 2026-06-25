import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";

const ALLOWED_GITHUB_USERNAMES = ["anjali9265"]; 

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const username = (profile as { login?: string })?.login;
      // Only allow sign in for allowed GitHub usernames
      if (!username || !ALLOWED_GITHUB_USERNAMES.includes(username)) {
        return false;
      }
      return true;
    },
    session({ session, user }) {
      // Attach the DB user id to the session so API routes can use it
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
};
