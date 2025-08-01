"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/lib/utils";

export default function PostAuthRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const handlePostAuthRedirect = async () => {
      // Check if user is admin
      const userEmail = user.primaryEmailAddress?.emailAddress;
      if (isAdmin(userEmail)) {
        // Admin can access all pages, redirect to admin page or main page
        router.push("/admin");
        return;
      }

      // For non-admin users, check if they have a valid invite code
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
          // User has valid invite code, redirect to main page
          router.push("/");
        } else {
          // User needs to enter invite code
          router.push("/invite");
        }
      } catch (error) {
        console.error("Error checking invite code:", error);
        router.push("/invite");
      }
    };

    handlePostAuthRedirect();
  }, [user, isLoaded, router]);

  return null; // This component doesn't render anything
}
