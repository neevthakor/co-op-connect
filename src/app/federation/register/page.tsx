import { redirect } from 'next/navigation';

export default function FederationRegisterPage() {
  // Federation Admin registration is private. Admins must use seeded accounts.
  redirect('/federation/login');
}
