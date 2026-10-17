import { requireRolePage } from '@/lib/scope';
import Client from './Client';

export default async function Page() {
  await requireRolePage('ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN');
  return <Client />;
}
