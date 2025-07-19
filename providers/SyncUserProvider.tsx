"use client";

import { ReactNode, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import {
  UserDetailContext,
  UserDetailContextType,
} from "@/context/UserDetailContext";

// Define the maximum number of retries for the sync operation.
const MAX_RETRIES = 3;
// Define the delay between retries in milliseconds.
const RETRY_DELAY = 1000; // 1 second

const SyncUserProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
  // Add a state to track if the component is mounted.
  // This is a common solution to prevent hydration errors.
  const [isMounted, setIsMounted] = useState(false);
  // Get the user object and loading state from Clerk's useUser hook.
  const { user, isLoaded } = useUser();
  // State to track if the user sync is in progress.
  const [isLoading, setIsLoading] = useState(true);
  // State to store any error message if the sync fails.
  const [syncError, setSyncError] = useState<string | null>(null);
  // State to store user details from a context for shared access.
  const [userDetails, setUserDetails] = useState<UserType | null>(null);

  // This useEffect hook sets isMounted to true, but only on the client.
  // On the server, this hook never runs, so isMounted remains false.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // We wait for the component to be mounted on the client before running the sync logic.
    if (!isMounted) {
      return;
    }

    let isSubscribed = true;
    let retryCount = 0;

    const syncUser = async () => {
      try {
        if (isSubscribed) {
          setIsLoading(true);
          setSyncError(null);
        }

        // Make the API call to sync the user.
        const result = await axios.post("/api/users", {});

        if (!isSubscribed) return;

        // Set user details from the API response
        if (result.data && result.data.user) {
          setUserDetails(result.data.user);
        }

        // On successful creation of a new user, show a success toast.
        if (result.status === 201) {
          toast.success("User synced successfully!");
        }

        if (isSubscribed) {
          setIsLoading(false);
        }
      } catch (error) {
        if (!isSubscribed) return;

        // Type assertion for Axios error to access response data.
        const axiosError = error as AxiosError<{ error: string }>;
        const errorMessage =
          axiosError.response?.data?.error ||
          "An unknown error occurred while syncing user.";

        // Check if we can still retry.
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          // Notify user about the retry attempt.
          toast.error(
            `Sync failed, retrying... (${retryCount}/${MAX_RETRIES})`
          );
          // Wait for the defined delay before retrying.
          setTimeout(syncUser, RETRY_DELAY * retryCount);
        } else {
          // If all retries fail, set the final error message and stop loading.
          if (isSubscribed) {
            setSyncError(errorMessage);
            setIsLoading(false);
          }
          toast.error("Failed to sync user after multiple attempts.");
        }
      }
    };

    // We proceed only after Clerk has loaded and the component is mounted.
    if (!isLoaded) {
      return;
    }

    if (user) {
      syncUser();
    } else {
      // If there is no user, the sync process is not needed.
      // We can stop showing the loading indicator.
      if (isSubscribed) {
        setIsLoading(false);
      }
    }

    // Cleanup function to prevent state updates if the component unmounts.
    return () => {
      isSubscribed = false;
    };
  }, [user, isLoaded, isMounted]); // Added isMounted to the dependency array.

  // Before the component is mounted on the client, we render the same UI as the server,
  // which in this case is the loading spinner, because isLoading is initially true.
  // This ensures the initial client render matches the server render.
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If there was a persistent error during sync, show an error UI.
  if (syncError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8 bg-card rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-destructive">
            Sync Failed
          </h2>
          <p className="text-destructive-foreground">{syncError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // While Clerk is loading or we are syncing, show a loading spinner.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If sync is successful (or not needed), render the children components.
  const contextValue: UserDetailContextType = { userDetails, setUserDetails };
  return (
    <UserDetailContext.Provider value={contextValue}>
      {children}
    </UserDetailContext.Provider>
  );
};

export default SyncUserProvider;
