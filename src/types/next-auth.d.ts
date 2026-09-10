import { DefaultSession, DefaultUser } from "next-auth";


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      workerId?: string;
      customerId?: string;
      cooperativeId?: string | null;
      federationId?: string | null;
      societyId?: string;
      institutionId?: string;
      verificationStatus?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    workerId?: string;
    customerId?: string;
    cooperativeId?: string | null;
    federationId?: string | null;
    societyId?: string;
    institutionId?: string;
    verificationStatus?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: string;
    workerId?: string;
    customerId?: string;
    cooperativeId?: string | null;
    federationId?: string | null;
    societyId?: string;
    institutionId?: string;
    verificationStatus?: string;
  }
}
