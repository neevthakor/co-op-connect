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

        let user;
        try {
          // Fetch ONLY the user first (1 query)
          user = await prisma.user.findUnique({
            where: { email },
          });
        } catch (error) {
          console.error("Auth DB Error:", error);
          throw new Error("Database temporarily unreachable");
        }

        if (!user || !user.passwordHash || !user.isActive) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        // Fetch exactly ONE relation based on role (1 query)
        let worker, customer, cooperativeAdmin, federationAdmin, societyAdmin, institutionalCustomer;
        
        try {
          if (user.role === 'WORKER' || user.role === 'HELPER') {
            worker = await prisma.worker.findUnique({ where: { userId: user.id }, select: { id: true, cooperativeId: true, verificationStatus: true } });
            if (!worker) return null;
          } else if (user.role === 'CUSTOMER') {
            customer = await prisma.customer.findUnique({ where: { userId: user.id }, select: { id: true } });
            if (!customer) return null;
          } else if (user.role === 'COOPERATIVE_ADMIN') {
            cooperativeAdmin = await prisma.cooperativeAdmin.findUnique({ where: { userId: user.id }, select: { id: true, cooperativeId: true } });
            if (!cooperativeAdmin) return null;
          } else if (user.role === 'FEDERATION_ADMIN') {
            federationAdmin = await prisma.federationAdmin.findUnique({ where: { userId: user.id }, select: { id: true, federationId: true } });
            if (!federationAdmin) return null;
          } else if (user.role === 'SOCIETY_ADMIN') {
            societyAdmin = await prisma.societyAdmin.findUnique({ where: { userId: user.id }, select: { id: true, societyId: true } });
            if (!societyAdmin) return null;
          } else if (user.role === 'INSTITUTIONAL_CUSTOMER') {
            institutionalCustomer = await prisma.institutionalCustomer.findUnique({ where: { userId: user.id }, select: { id: true, institutionId: true } });
            if (!institutionalCustomer) return null;
          }
        } catch (e) {
           console.error("Role lookup error", e);
           throw new Error("Database temporarily unreachable");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          workerId: worker?.id,
          customerId: customer?.id,
          cooperativeId: cooperativeAdmin?.cooperativeId || worker?.cooperativeId,
          federationId: federationAdmin?.federationId,
          societyId: societyAdmin?.societyId,
          institutionId: institutionalCustomer?.institutionId,
          verificationStatus: worker?.verificationStatus,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as string;
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
