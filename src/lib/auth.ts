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
        token.role = (user as any).role;
        token.userId = user.id;
        token.workerId = (user as any).workerId;
        token.customerId = (user as any).customerId;
        token.cooperativeId = (user as any).cooperativeId;
        token.federationId = (user as any).federationId;
        token.societyId = (user as any).societyId;
        token.institutionId = (user as any).institutionId;
        token.verificationStatus = (user as any).verificationStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).role = token.role;
        (session.user as any).workerId = token.workerId;
        (session.user as any).customerId = token.customerId;
        (session.user as any).cooperativeId = token.cooperativeId;
        (session.user as any).federationId = token.federationId;
        (session.user as any).societyId = token.societyId;
        (session.user as any).institutionId = token.institutionId;
        (session.user as any).verificationStatus = token.verificationStatus;
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
