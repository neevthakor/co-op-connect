import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string | null;
      workerId?: string | null;
      customerId?: string | null;
      cooperativeId?: string | null;
      federationId?: string | null;
      societyId?: string | null;
      institutionId?: string | null;
      verificationStatus?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role?: string | null;
    workerId?: string | null;
    customerId?: string | null;
    cooperativeId?: string | null;
    federationId?: string | null;
    societyId?: string | null;
    institutionId?: string | null;
    verificationStatus?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    userId?: string;
    role?: string | null;
    workerId?: string | null;
    customerId?: string | null;
    cooperativeId?: string | null;
    federationId?: string | null;
    societyId?: string | null;
    institutionId?: string | null;
    verificationStatus?: string | null;
  }
}
