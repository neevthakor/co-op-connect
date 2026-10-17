import { requireRolePage } from '@/lib/scope';
import FairMatchClient from './FairMatchClient';

export default async function FairMatchPage() {
  await requireRolePage('ADMIN', 'FEDERATION_ADMIN');
  return <FairMatchClient />;
}
