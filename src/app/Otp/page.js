// src/app/Otp/page.js
import { Suspense } from 'react';
import OtpComponent from './otpcomponent';

export default function OtpPage() {
  return (
    // The Suspense boundary allows the rest of the page to load
    // while the client component waits for the search params.
    <Suspense fallback={<div>Loading...</div>}>
      <OtpComponent />
    </Suspense>
  );
}