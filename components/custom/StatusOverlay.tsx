import React from "react";
import Loader from "./Loader";

interface StatusOverlayProps {
  isVisible: boolean;
  statusText: string;
}

const StatusOverlay: React.FC<StatusOverlayProps> = ({
  isVisible,
  statusText,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur and dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Status content */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-lg p-10 shadow-2xl border border-neutral-200 dark:border-neutral-700 min-w-[300px] max-w-[400px] mx-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Loader */}
          <div className="flex justify-center">
            <Loader />
          </div>

          {/* Status text */}
          <div className="text-center mt-16">
            <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              {statusText}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Please wait while we process your request...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusOverlay;
