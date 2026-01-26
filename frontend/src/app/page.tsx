'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { user, token, fetchUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUser().then(() => {
        // Redirect based on role
        if (user) {
          router.push('/dashboard');
        }
      });
    } else {
      router.push('/login');
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Marketplace</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

