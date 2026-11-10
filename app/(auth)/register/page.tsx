import { Suspense } from 'react';
import { AccountForm } from '@/components/account-form';

export default function RegisterPage() {
  return <Suspense fallback={<p className="p-6">Loading sign-up…</p>}><AccountForm mode="register" /></Suspense>;
}
