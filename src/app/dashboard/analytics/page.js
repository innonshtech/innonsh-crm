import { redirect } from 'next/navigation';

export default function LegacyAnalyticsRedirectPage() {
  redirect('/dashboard/reports');
}
