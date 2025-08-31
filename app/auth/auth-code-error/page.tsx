'use client'

import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function AuthCodeError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const clearAuthData = async () => {
    try {
      await supabase.auth.signOut();
      // Clear any stale localStorage data
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      window.location.href = '/auth/login';
    } catch (err) {
      console.error('Error clearing auth data:', err);
      window.location.href = '/auth/login';
    }
  };

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'no_code':
        return 'No authorization code received from Google. This might be a temporary issue.';
      case 'exchange_failed':
        return 'Failed to exchange authorization code for session. Please try again.';
      case 'user_fetch_failed':
        return 'Unable to fetch user information after authentication.';
      case 'no_user':
        return 'Authentication succeeded but no user data was found.';
      case 'unexpected_error':
        return 'An unexpected error occurred during authentication.';
      case 'missing_tokens':
        return 'OAuth tokens were not found in the callback URL.';
      case 'session_setup_failed':
        return 'Failed to establish authentication session with the provided tokens.';
      case 'client_processing_failed':
        return 'An error occurred while processing the authentication callback.';
      default:
        return 'There was an error signing you in. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-red-600">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            {getErrorMessage(error)}
          </CardDescription>
          {error && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Error code: {error}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full cursor-pointer text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
            <Link href="/auth/login">Try Again</Link>
          </Button>
          <Button
            onClick={clearAuthData}
            variant="outline"
            className="w-full cursor-pointer text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:text-gray-900"
          >
            Clear Auth Data & Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
