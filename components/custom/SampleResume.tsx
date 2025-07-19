import React from "react";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import { resumes } from "@/constants";
import ResumeCard from "./ResumeCard";

const SampleResume = () => {
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

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-6 px-5 sm:px-20">
      <div className="flex flex-col items-center justify-center gap-2">
        <TypewriterEffectSmooth words={words} />
        <p className="text-center text-sm lg:text-lg text-muted-foreground">
          Explore real-world examples of how ReUp&apos;s AI refines, perfects,
          and elevates your professional story.
        </p>
      </div>

      {resumes.length > 0 && (
        <div className="flex flex-wrap max-lg:flex-col gap-6 items-start  w-full max-w-[1850px] justify-evenly">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SampleResume;
