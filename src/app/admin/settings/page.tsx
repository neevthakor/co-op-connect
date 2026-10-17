import { requireRolePage } from '@/lib/scope';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  await requireRolePage('ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN');
  return <SettingsClient />;
}
