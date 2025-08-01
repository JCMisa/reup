"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Lock, Mail } from "lucide-react";
import { isAdmin } from "@/lib/utils";

export default function InvitePage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // User is not authenticated, redirect to sign-in
      router.push("/sign-in");
      return;
    }

    // Check if user is admin
    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (isAdmin(userEmail)) {
      // Admin should go to admin page or main page
      router.push("/admin");
      return;
    }

    // Check if user already has a valid invite code
    const checkExistingInvite = async () => {
      try {
        const response = await fetch("/api/invite/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        });

        const data = await response.json();

        if (data.hasValidInvite) {
          // User already has valid invite code, redirect to main page
          router.push("/");
        } else {
          // User needs to enter invite code
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Error checking invite code:", error);
        setIsChecking(false);
      }
    };

    checkExistingInvite();
  }, [user, isLoaded, router]);

  const handleSubmit = async () => {
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit invite code");
      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/invite/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Invite code assigned successfully!");
        // Redirect to main page
        router.push("/");
      } else {
        toast.error(data.error || "Invalid invite code");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Welcome to ReUp
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Enter your invite code to get started
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Please enter the 6-digit invite code you received
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  value={code}
                  onChange={(value) => setCode(value)}
                  maxLength={6}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot
                      index={0}
                      className="w-12 h-12 text-lg font-semibold rounded-lg border"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-12 h-12 text-lg font-semibold rounded-lg border"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-12 h-12 text-lg font-semibold rounded-lg border"
                    />
                    <InputOTPSlot
                      index={3}
                      className="w-12 h-12 text-lg font-semibold rounded-lg border"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-12 h-12 text-lg font-semibold rounded-lg border"
                    />
                    <InputOTPSlot
                      index={5}
                      className="w-12 h-12 text-lg font-semibold rounded-lg border"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={code.length !== 6 || isLoading}
              className="w-full h-12 text-base font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Continue to App
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Don&apos;t have an invite code? Contact your administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
