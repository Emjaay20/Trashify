import { Suspense } from 'react';
import { AccountForm } from '@/components/account-form';

export default function LoginPage() {
  return <Suspense fallback={<p className="p-6">Loading sign-in…</p>}><AccountForm mode="login" /></Suspense>;
}
