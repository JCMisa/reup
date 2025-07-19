"use client";

import { useUploadedFile } from "@/context/UploadedFileContext";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { BackgroundLines } from "@/components/ui/background-lines";
import { FileUpload } from "@/components/ui/file-upload";
import { UserDetailContext } from "@/context/UserDetailContext";

export default function ReUpPage() {
  const { userDetails } = useContext(UserDetailContext) || {};
  const { uploadedFile } = useUploadedFile();

  // Form states
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
  });

  useEffect(() => {
    if (uploadedFile) {
      // Create a URL for the file
      const url = URL.createObjectURL(uploadedFile);
      setFileUrl(url);

      // Clean up the URL when component unmounts
      return () => URL.revokeObjectURL(url);
    }
  }, [uploadedFile]);

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAnalyze = () => {
    console.log({
      file: fileUrl,
      ...formData,
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-4">
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
        <h1 className="text-2xl font-bold mb-6">
          <span className="text-primary">ReUp</span> Your Resume
        </h1>

        {uploadedFile ? (
          <div className="rounded-lg border p-4 mb-6 w-full max-w-3xl">
            <p className="font-medium">File name: {uploadedFile.name}</p>
            <p>
              Size: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB of 5MB
              limit
            </p>
            <p>Type: {uploadedFile.type}</p>
            <p className="text-sm text-neutral-500 mt-1">
              {((uploadedFile.size / (5 * 1024 * 1024)) * 100).toFixed(1)}% of
              available space used
            </p>
          </div>
        ) : (
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
            Please upload your resume to begin the analysis
          </p>
        )}

        <div className="w-full max-w-3xl space-y-4 z-10">
          <div className="grid gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 w-full">
              <div className="w-full">
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium mb-1"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  onChange={handleInputChange}
                  value={formData.companyName}
                  className="w-full p-2 rounded-md border bg-white/5 border-neutral-200 dark:border-neutral-800"
                  placeholder="Enter the company name"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="jobTitle"
                  className="block text-sm font-medium mb-1"
                >
                  Job Title
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  onChange={handleInputChange}
                  value={formData.jobTitle}
                  className="w-full p-2 rounded-md border bg-white/5 border-neutral-200 dark:border-neutral-800"
                  placeholder="Enter the job title"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="jobDescription"
                className="block text-sm font-medium mb-1"
              >
                Job Description
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                onChange={handleInputChange}
                value={formData.jobDescription}
                className="w-full p-2 rounded-md border bg-white/5 border-neutral-200 dark:border-neutral-800 min-h-[100px]"
                placeholder="Paste the job description here"
              />
            </div>
          </div>
        </div>

        {!uploadedFile ? (
          <div className="relative z-10 w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-neutral-200/20 dark:bg-neutral-800/20 backdrop-blur-sm border-neutral-200 dark:border-neutral-800 rounded-lg mt-3">
            <FileUpload user={userDetails} onChange={handleFileUpload} />
          </div>
        ) : (
          <>
            {fileUrl && uploadedFile.type.startsWith("image/") && (
              <div className="mt-4 relative h-[500px] w-full max-w-3xl z-10">
                <Image
                  src={fileUrl}
                  alt={uploadedFile.name}
                  fill
                  className="rounded-lg object-contain"
                  priority
                />
              </div>
            )}

            {fileUrl && uploadedFile.type === "application/pdf" && (
              <div className="mt-4 h-[500px] w-full max-w-3xl z-10">
                <iframe
                  src={fileUrl}
                  className="h-full w-full rounded-lg"
                  title={uploadedFile.name}
                />
              </div>
            )}
          </>
        )}

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={
            !uploadedFile ||
            !formData.companyName ||
            !formData.jobTitle ||
            !formData.jobDescription
          }
          className={`mt-6 px-6 py-2 rounded-md text-white font-medium transition-colors z-10 w-full lg:w-[45%]
            ${
              !uploadedFile ||
              !formData.companyName ||
              !formData.jobTitle ||
              !formData.jobDescription
                ? "bg-neutral-500 cursor-not-allowed"
                : "bg-primary hover:bg-primary-600 cursor-pointer"
            }`}
        >
          Analyze Resume
        </button>
      </BackgroundLines>
    </div>
  );
}
