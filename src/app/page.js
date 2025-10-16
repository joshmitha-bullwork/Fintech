// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Automatically redirect users from the root URL to the login page.
  redirect('/Login');
}