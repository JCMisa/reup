import React, { Suspense } from "react";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import ResumeCard from "./ResumeCard";
import { getUserAnalyzedResumes } from "@/lib/actions/analyzedResumes";
import EmptyPlaceholder from "./EmptyPlaceholder";
import { getCurrentUser } from "@/lib/actions/users";
import { redirect } from "next/navigation";
import DeleteAllResume from "./DeleteAllResume";

const SampleResume = async () => {
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

  const [user, userResumes] = await Promise.all([
    getCurrentUser(),
    getUserAnalyzedResumes(),
  ]);

  if (!user) {
    redirect("/sign-in");
  }

  const resumes: AnalyzedResumeType[] = userResumes;

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-12 px-5 sm:px-20">
      <div className="flex flex-col items-center justify-center gap-2">
        <TypewriterEffectSmooth words={words} />
        <p className="text-center text-sm lg:text-lg text-muted-foreground">
          Explore real-world examples of how ReUp&apos;s AI refines, perfects,
          and elevates your professional story.
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
