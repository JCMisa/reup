"use client";

import { useState } from "react";
import { FileUpload } from "../ui/file-upload";
import { GridPattern } from "./GridPattern";
import HeroMainText from "./HeroMainText";

const Hero = () => {
  const [files, setFiles] = useState<File[]>([]);
  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

  return (
    <div className="fixed inset-0 flex flex-col space-y-6 items-center justify-center overflow-hidden sm:px-20 mt-20">
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
        <GridPattern />
      </div>
      <div className="flex flex-col items-center justify-center text-center z-10">
        <HeroMainText />
        <p className="text-center px-40 ">
          Upload your current resume and get personalized, intelligent feedback
          to stand out and land your dream job.
        </p>
      </div>
      <div className="relative z-10 w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-neutral-200/20 dark:bg-neutral-800/20 backdrop-blur-sm border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload onChange={handleFileUpload} />
      </div>
    </div>
  );
};

export default Hero;
