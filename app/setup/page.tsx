"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Wallet, DollarSign, CheckCircle, ArrowRight, Sparkles } from "lucide-react";

export default function SetupPage() {
  const { user, loading } = useAuth();
  const [startingBalance, setStartingBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError("");

    try {
      const balance = parseFloat(startingBalance);
      if (isNaN(balance)) {
        setError("Please enter a valid number");
        setIsSubmitting(false);
        return;
      }

      // Create or update user profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        starting_balance: balance,
        current_balance: balance,
        starting_balance_set: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        setError("Failed to save profile. Please try again.");
        console.error("Profile error:", profileError);
        setIsSubmitting(false);
        return;
      }

      // Redirect to dashboard
      router.push("/");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Setup error:", err);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Setup info */}
        <div className="text-center lg:text-left space-y-8 px-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              <Sparkles className="w-10 h-10 text-emerald-600" />
              Almost Ready!
            </div>
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">
              Let's set up your financial foundation
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Enter your current balance to start tracking your expenses and build better financial habits.
            </p>
          </div>

          {/* Setup steps */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700">Account created successfully</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-100/80 backdrop-blur-sm rounded-lg border border-emerald-200/50">
              <DollarSign className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-medium text-emerald-800">Set your starting balance</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/30 backdrop-blur-sm rounded-lg border border-white/20 opacity-60">
              <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-500">Start managing expenses</span>
            </div>
          </div>
        </div>

        {/* Right side - Setup form */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md bg-white/70 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardHeader className="space-y-4 text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Welcome, {user.user_metadata?.full_name?.split(' ')[0] || 'there'}!
              </CardTitle>
              <CardDescription className="text-gray-600">
                Tell us your current balance to get started with expense tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="balance" className="text-base font-medium text-gray-700">
                    Current Balance
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={startingBalance}
                      onChange={(e) => setStartingBalance(e.target.value)}
                      required
                      className="pl-10 h-12 text-lg font-medium border-2 border-gray-200 focus:border-emerald-400 transition-colors text-gray-900"
                    />
                  </div>
                  <p className="text-sm text-gray-500 bg-gray-50/80 p-3 rounded-lg">
                    💡 Don't worry, you can always update this later in your profile settings
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Setting up your account...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
