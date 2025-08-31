"use client";

import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Profile {
  full_name: string;
  email: string;
  avatar_url: string;
  current_balance: number;
  starting_balance: number;
  created_at: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBalance, setCurrentBalance] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile");
      } else {
        setProfile(data);
        setCurrentBalance(data.current_balance?.toString() || "0");
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      setError("An unexpected error occurred");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const balance = parseFloat(currentBalance);
      if (isNaN(balance)) {
        setError("Please enter a valid number");
        setIsSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          current_balance: balance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        setError("Failed to update balance. Please try again.");
        console.error("Update error:", updateError);
      } else {
        setProfile((prev) =>
          prev ? { ...prev, current_balance: balance } : null,
        );
        setSuccess("Balance updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCurrentBalance(profile?.current_balance?.toString() || "0");
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Unable to load profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/">← Back</Link>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name</Label>
                <p className="text-sm text-gray-700">
                  {profile.full_name || "Not provided"}
                </p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm text-gray-700">{profile.email}</p>
              </div>
              <div>
                <Label>Member Since</Label>
                <p className="text-sm text-gray-700">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Balance Management</CardTitle>
              <CardDescription>
                Update your current balance to keep track of your finances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Starting Balance</Label>
                <p className="text-sm text-gray-700">
                  ${profile.starting_balance?.toFixed(2) || "0.00"}
                </p>
              </div>

              <div>
                <Label htmlFor="current-balance">Current Balance</Label>
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      id="current-balance"
                      type="number"
                      step="0.01"
                      value={currentBalance}
                      onChange={(e) => setCurrentBalance(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="sm"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                      ${profile.current_balance?.toFixed(2) || "0.00"}
                    </p>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
