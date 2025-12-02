'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tv, LogIn, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen w-full flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex justify-center items-center mb-6">
            <Tv className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
            <span className="text-3xl font-bold text-gray-800 dark:text-white ml-2">CableCo</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 dark:text-white tracking-tight">
          Your Entertainment,
          <br />
          <span className="text-indigo-600 dark:text-indigo-400">Seamlessly Managed.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          The all-in-one platform for cable customers and providers. Track payments, manage subscriptions, and get timely alerts, all in one place.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/login" className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-transform transform hover:scale-105">
            <LogIn className="mr-2 h-5 w-5"/> Login
          </Link>
          <Link href="/auth/signup" className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10">
            <User className="mr-2 h-5 w-5" /> Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}