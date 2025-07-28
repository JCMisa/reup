"use client";

import { useEffect, useState } from "react";
import { usePuterStore } from "@/lib/puter";
import Image from "next/image";
import Link from "next/link";
import ScoreCircle from "./ScoreCircle";
import { parseStringify } from "@/lib/utils";

const ResumeCard = ({
  resume: { analyzedResumeId, companyName, jobTitle, feedback },
}: {
  resume: AnalyzedResumeType;
}) => {
  const { fs, kv } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${analyzedResumeId}`);
      if (!resume) return;

      const data = JSON.parse(resume);

      const imageBlob = await fs.read(data.imagePath); // will return a blob not the image name stored in neon
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setResumeUrl(imageUrl);
    };

    loadResume();
  }, [fs, kv, analyzedResumeId]);

  return (
    <Link
      href={`/resume/${analyzedResumeId}`}
      className="flex flex-col gap-8 h-[560px] w-full lg:w-[450px] xl:w-[490px] rounded-2xl p-4 animate-in fade-in duration-1000 bg-neutral-100 dark:bg-neutral-900"
    >
      <div className="flex flex-row gap-2 justify-between min-h-[110px] max-sm:flex-col items-center max-md:justify-center max-md:items-center">
        <div className="flex flex-col gap-2">
          {companyName && (
            <h2 className="font-bold break-words">{companyName}</h2>
          )}
          {jobTitle && (
            <h3 className="text-lg break-words text-muted-foreground">
              {jobTitle}
            </h3>
          )}
          {!companyName && !jobTitle && <h2 className="font-bold">Resume</h2>}
        </div>
        <div className="flex-shrink-0">
          <ScoreCircle score={parseStringify(feedback).overallScore} />
        </div>
      </div>
      {resumeUrl && (
        <div className="bg-gradient-to-b from-background to-primary-600 p-4 rounded-2xl animate-in fade-in duration-1000">
          <div className="w-full h-full">
            <Image
              src={resumeUrl}
              alt="resume"
              className="w-full h-[350px] max-sm:h-[200px] object-cover object-top rounded-xl"
              width={100}
              height={100}
            />
          </div>
        </div>
      )}
    </Link>
  );
};
export default ResumeCard;
