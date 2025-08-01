"use client";

import React, { Suspense, useEffect, useState } from "react";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import ResumeCard from "./ResumeCard";
import { getUserAnalyzedResumes } from "@/lib/actions/analyzedResumes";
import EmptyPlaceholder from "./EmptyPlaceholder";
import DeleteAllResume from "./DeleteAllResume";
import { useUser } from "@clerk/nextjs";

const SampleResume = () => {
  const { user, isLoaded } = useUser();
  const [resumes, setResumes] = useState<AnalyzedResumeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const words = [
    {
      text: "Unlock",
    },
    {
      text: "Your",
    },
    {
      text: "Resume's",
    },
    {
      text: "Full",
    },
    {
      text: "Potential.",
      className: "text-primary",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded || !user) return;

      try {
        const userResumes = await getUserAnalyzedResumes();
        const resumesData: AnalyzedResumeType[] = Array.isArray(userResumes)
          ? userResumes
          : [];
        setResumes(resumesData);
      } catch (error) {
        console.error("Error fetching resumes:", error);
        setResumes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isLoaded]);

  if (!isLoaded || isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center space-y-12 px-5 sm:px-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading resumes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full flex flex-col items-center justify-center space-y-12 px-5 sm:px-20">
        <div className="text-center">
          <p className="text-muted-foreground">
            Please sign in to view your resumes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-12 px-5 sm:px-20">
      <div className="flex flex-col items-center justify-center gap-2">
        <TypewriterEffectSmooth words={words} />
        <p className="text-center text-sm lg:text-lg text-muted-foreground">
          {resumes.length > 0
            ? "Explore real-world examples of how ReUp's AI refines, perfects, and elevates your professional story."
            : "No resumes found. Please upload a resume to get started."}
        </p>
      </div>

      {resumes.length > 0 ? (
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <DeleteAllResume />
          <div className="flex flex-wrap max-lg:flex-col gap-6 items-start  w-full max-w-[1850px] justify-evenly">
            {resumes.map((resume) => (
              <Suspense key={resume.id} fallback={<div>Loading...</div>}>
                <ResumeCard resume={resume} />
              </Suspense>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 absolute bottom-0">
          <EmptyPlaceholder />
          <p className="text-center text-sm lg:text-lg text-muted-foreground">
            No resumes found.
          </p>
        </div>
      )}
    </div>
  );
};

export default SampleResume;
