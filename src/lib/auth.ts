import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            worker: { select: { id: true, cooperativeId: true, verificationStatus: true } },
            customer: { select: { id: true } },
            cooperativeAdmin: { select: { id: true, cooperativeId: true } },
            federationAdmin: { select: { id: true, federationId: true } },
            societyAdmin: { select: { id: true, societyId: true } },
            institutionalCustomer: { select: { id: true, institutionId: true } },
          },
        });

        if (!user || !user.passwordHash || !user.isActive) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          workerId: user.worker?.id,
          customerId: user.customer?.id,
          cooperativeId: user.cooperativeAdmin?.cooperativeId || user.worker?.cooperativeId,
          federationId: user.federationAdmin?.federationId,
          societyId: user.societyAdmin?.societyId,
          institutionId: user.institutionalCustomer?.institutionId,
          verificationStatus: user.worker?.verificationStatus,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as string as string;
        token.userId = user.id;
        token.workerId = user.workerId as string;
        token.customerId = user.customerId as string;
        token.cooperativeId = user.cooperativeId as string;
        token.federationId = user.federationId as string;
        token.societyId = user.societyId as string;
        token.institutionId = user.institutionId as string;
        token.verificationStatus = user.verificationStatus as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.workerId = token.workerId as string;
        session.user.customerId = token.customerId as string;
        session.user.cooperativeId = token.cooperativeId as string;
        session.user.federationId = token.federationId as string;
        session.user.societyId = token.societyId as string;
        session.user.institutionId = token.institutionId as string;
        session.user.verificationStatus = token.verificationStatus as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
});
