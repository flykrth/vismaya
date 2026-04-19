import { RegistrationForm } from '@/views/registration/RegistrationForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Secure Your Spot | Vismaya Camp 2026',
  description: 'Register your camper for a workshop.',
};

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading form...</div>}>
      <RegistrationForm />
    </Suspense>
  );
}
