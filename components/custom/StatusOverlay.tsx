import React from "react";
import Loader from "./Loader";

interface StatusOverlayProps {
  isVisible: boolean;
  statusText: string;
  isModal?: boolean;
  size?: "sm" | "md" | "lg";
}

const StatusOverlay: React.FC<StatusOverlayProps> = ({
  isVisible,
  statusText,
  isModal = true,
  size = "md",
}) => {
  if (!isVisible) return null;

  // Size classes
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  // Simple loader mode
  if (!isModal) {
    return (
      <div className="flex items-center justify-center p-6">
        <div
          className={`flex flex-col items-center space-y-4 ${sizeClasses[size]}`}
        >
          <div className="flex justify-center">
            <Loader />
          </div>
          {statusText && (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {statusText}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please wait...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modal mode
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur and dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Status content */}
      <div className="relative bg-background rounded-lg p-10 shadow-2xl border border-border min-w-[300px] max-w-[400px] mx-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Loader */}
          <div className="flex justify-center">
            <Loader />
          </div>

          {/* Status text */}
          <div className="text-center mt-16">
            <p className="text-lg font-medium text-foreground">{statusText}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please wait while we process your request...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusOverlay;
