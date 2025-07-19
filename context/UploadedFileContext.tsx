"use client";

import { createContext, useContext, useState } from "react";

type UploadedFileContextType = {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
};

const UploadedFileContext = createContext<UploadedFileContextType | undefined>(
  undefined
);

export function UploadedFileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  return (
    <UploadedFileContext.Provider value={{ uploadedFile, setUploadedFile }}>
      {children}
    </UploadedFileContext.Provider>
  );
}

export function useUploadedFile() {
  const context = useContext(UploadedFileContext);
  if (context === undefined) {
    throw new Error(
      "useUploadedFile must be used within a UploadedFileProvider"
    );
  }
  return context;
}
