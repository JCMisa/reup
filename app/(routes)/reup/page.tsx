"use client";

import { useUploadedFile } from "@/context/UploadedFileContext";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { BackgroundLines } from "@/components/ui/background-lines";
import { FileUpload } from "@/components/ui/file-upload";
import { UserDetailContext } from "@/context/UserDetailContext";
import { LoaderCircleIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { usePuterStore } from "@/lib/puter";
import { useRouter } from "next/navigation";
import { convertPdfToImages } from "@/lib/pdfToImg";
import { generateUUID } from "@/lib/utils";
import { prepareInstructions } from "@/constants";
import axios from "axios";
import StatusOverlay from "@/components/custom/StatusOverlay";

export default function ReUpPage() {
  const { isLoading, fs, ai, kv } = usePuterStore();
  const router = useRouter();

  const { userDetails } = useContext(UserDetailContext) || {};
  const { uploadedFile, setUploadedFile } = useUploadedFile();

  // Form states
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(uploadedFile || null);
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState("");

  // we need the file url of uploaded file to display the preview of it in the UI
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
    setFile(files[0]);
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

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsUploading(true);
    setStatusText("Uploading file...");
    try {
      const fileUploaded = await fs.upload([file]); // upload the file in the puter cloud storage
      if (!fileUploaded) {
        toast.error("Failed to upload file");
        setStatusText("Failed to upload file");
      }

      // convert image
      setStatusText("Converting to image...");
      if (file.type === "application/pdf") {
        const imageResults = await convertPdfToImages(file, {
          scale: 1.5,
          format: "png",
          quality: 0.95,
        });

        // Process each converted page
        const convertedFiles: File[] = [];
        imageResults.forEach((result, index) => {
          if (result.success && result.imageBlob) {
            const imageFile = new File(
              [result.imageBlob],
              `${file.name.replace(".pdf", "")}_page_${index + 1}.png`,
              {
                type: "image/png",
              }
            );
            convertedFiles.push(imageFile);
            console.log(`Page ${index + 1} converted:`, imageFile);
          } else {
            console.error(`Failed to convert page ${index + 1}:`, result.error);
          }
        });

        console.log(
          `Successfully converted ${convertedFiles.length} out of ${imageResults.length} pages`
        );

        if (convertedFiles.length === 0) {
          toast.error("Failed to convert any pages of the PDF");
          setStatusText("Failed to convert PDF to image");
          return;
        }

        // Upload the first converted image (or you can upload all if needed)
        const uploadedImage = await fs.upload([convertedFiles[0]]); // upload the first converted image for ui display

        if (!uploadedImage) {
          toast.error("Failed to upload image");
          setStatusText("Failed to upload image");
          return;
        }

        setStatusText("Preparing data...");
        const uuid = generateUUID();
        const data = {
          id: uuid,
          resumePath: fileUploaded?.path,
          imagePath: uploadedImage?.path,
          companyName,
          jobTitle,
          jobDescription,
          feedback: "",
        };

        await kv.set(`resume:${uuid}`, JSON.stringify(data)); // creating a record in puter database with the data passed

        setStatusText("Analyzing resume...");

        const feedback = await ai.feedback(
          fileUploaded?.path as string,
          prepareInstructions({ jobTitle, jobDescription })
        );

        if (!feedback) {
          toast.error("Failed to analyze resume");
          setStatusText("Failed to analyze resume");
          return;
        }

        // feedback.message.content can be string or string[]
        let feedbackText: string;
        if (typeof feedback.message.content === "string") {
          feedbackText = feedback.message.content;
        } else if (Array.isArray(feedback.message.content)) {
          feedbackText = feedback.message.content[0].text || "";
        } else {
          feedbackText = "";
        }

        data.feedback = JSON.parse(feedbackText);
        // updating the record in puter database with the updated feedback property
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        const result = await axios.post("/api/analyzed-resume", { data });

        if (result.status === 200) {
          setStatusText("Resume analyzed successfully");
          toast.success("Resume saved successfully");
          console.log("Resume analyzed successfully: ", data);
        }
      }
    } catch (error) {
      console.log("failed to upload file: ", error);
      toast.error("Failed to upload file");
      setStatusText("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error("Please upload a file");
      return;
    }
    handleAnalyze({
      companyName: formData.companyName,
      jobTitle: formData.jobTitle,
      jobDescription: formData.jobDescription,
      file: file,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4">
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">
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
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6 text-center">
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

          {!uploadedFile || !fileUrl ? (
            <div className="relative z-10 w-full max-w-3xl mx-auto min-h-96 border border-dashed bg-neutral-200/20 dark:bg-neutral-800/20 backdrop-blur-sm border-neutral-200 dark:border-neutral-800 rounded-lg mt-3">
              <FileUpload user={userDetails} onChange={handleFileUpload} />
            </div>
          ) : (
            <div className="relative z-10 w-full max-w-3xl mx-auto">
              {/* todo: we do not need image file upload */}
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
              {fileUrl && (
                <button
                  className="w-8 h-8 p-2 bg-primary cursor-pointer text-white rounded-full flex items-center justify-center absolute top-0 right-0 z-20"
                  onClick={() => {
                    setFileUrl(null);
                    setUploadedFile(null);
                    setFile(null);
                  }}
                >
                  <XIcon className="size-4" />
                </button>
              )}
            </div>
          )}

          {/* Analyze Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={
                !uploadedFile ||
                (!file && !fileUrl) ||
                !formData.companyName ||
                !formData.jobTitle ||
                !formData.jobDescription ||
                isUploading
              }
              className={`mt-6 px-6 py-2 rounded-md text-white font-medium transition-colors z-10 w-full min-w-0 lg:w-[30%] flex items-center justify-center 
              ${
                !uploadedFile ||
                (!file && !fileUrl) ||
                !formData.companyName ||
                !formData.jobTitle ||
                !formData.jobDescription
                  ? "bg-neutral-500 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-600 cursor-pointer"
              }`}
            >
              {isUploading ? (
                <LoaderCircleIcon className="size-4 animate-spin" />
              ) : (
                "ReUp Resume"
              )}
            </button>
          </div>
        </div>
      </BackgroundLines>

      {/* Status Overlay */}
      <StatusOverlay isVisible={isUploading} statusText={statusText} />
    </div>
  );
}
