"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isAdmin } from "@/lib/utils";

interface AuthFlowProps {
  children: React.ReactNode;
}

export default function AuthFlow({ children }: AuthFlowProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // User is not authenticated, redirect to sign-in
      router.push("/sign-in");
      return;
    }

    const checkUserAccess = async () => {
      setIsChecking(true);

      try {
        // Check if user is admin
        const userEmail = user.primaryEmailAddress?.emailAddress;
        if (isAdmin(userEmail)) {
          // Admin can access all pages, no need to check invite code
          setIsChecking(false);
          return;
        }

        // For non-admin users, check if they have a valid invite code
        const response = await fetch("/api/invite/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        });

        const data = await response.json();

        if (data.hasValidInvite) {
          // User has valid invite code, allow access
          setIsChecking(false);
        } else {
          // User needs to enter invite code
          toast.error("You need a valid invite code to access this app.");
          router.push("/invite");
        }
      } catch (error) {
        console.error("Error checking user access:", error);
        toast.error("Something went wrong. Please try again.");
        router.push("/invite");
      } finally {
        setIsChecking(false);
      }
    };

    checkUserAccess();
  }, [user, isLoaded, router]);

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

  return <>{children}</>;
}
