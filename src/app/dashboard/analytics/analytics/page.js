import { redirect } from 'next/navigation';

export default function LegacyNestedAnalyticsRedirectPage() {
  redirect('/dashboard/reports');
}
