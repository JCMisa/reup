"use client";

import { useContext, useState } from "react";
import { FileUpload } from "../ui/file-upload";
import { GridPattern } from "./GridPattern";
import HeroMainText from "./HeroMainText";
import { AnimatedShinyText } from "../magicui/animated-shiny-text";
import { cn, isAdmin } from "@/lib/utils";
import { ArrowRightIcon, PlusSquareIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useUser } from "@clerk/nextjs";

const Hero = () => {
  const { userDetails } = useContext(UserDetailContext) || {};
  const { user, isLoaded } = useUser();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [files, setFiles] = useState<File[]>([]);
  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

  // Check if user is admin using Clerk user data
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isUserAdmin = isLoaded && user ? isAdmin(userEmail) : false;

  // Debug logging
  console.log("User email:", userEmail);
  console.log("Is admin:", isUserAdmin);

  return (
    <div className="relative flex flex-col space-y-6 items-center justify-center overflow-hidden px-5 sm:px-20">
      {isUserAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-2 cursor-pointer absolute top-3 right-3 z-50"
        >
          <PlusSquareIcon className="size-4" />
          <span className="text-sm">Create Invite Codes</span>
        </Link>
      )}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
        <GridPattern />
      </div>
      <div
        className={cn(
          "z-10 mt-20",
          "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        )}
      >
        <Link href={userDetails ? "/reup" : "/sign-in"}>
          <AnimatedShinyText className="inline-flex items-center gap-2 justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
            <Image src={"/logo.svg"} alt="logo" width={20} height={20} />
            <span>ReUp My Resume</span>
            <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </AnimatedShinyText>
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center text-center z-10">
        <HeroMainText />

        <p className="text-center px-40 ">
          Upload your current resume and get personalized, intelligent feedback
          to stand out and land your dream job.
        </p>
      </div>
      <div className="relative z-10 w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-neutral-200/20 dark:bg-neutral-800/20 backdrop-blur-sm border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload user={userDetails} onChange={handleFileUpload} />
      </div>
    </div>
  );
};

export default Hero;
