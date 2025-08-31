"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Wallet, TrendingUp, PieChart, BarChart3 } from "lucide-react";

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero content */}
        <div className="text-center lg:text-left space-y-8 px-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              <Wallet className="w-12 h-12 text-blue-600" />
              ExpenseFlow
            </div>
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800">
              Take Control of Your Finances
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Track expenses, analyze spending patterns, and achieve your financial goals with our intuitive expense management platform.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="flex flex-col items-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
              <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Smart Analytics</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
              <PieChart className="w-8 h-8 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Visual Reports</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
              <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Budget Planning</span>
            </div>
          </div>
        </div>

        {/* Right side - Login card */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md bg-white/70 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardHeader className="space-y-4 text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to continue managing your expenses and tracking your financial journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={handleGoogleSignIn}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
                type="button"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Secure sign-in powered by Google OAuth
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
