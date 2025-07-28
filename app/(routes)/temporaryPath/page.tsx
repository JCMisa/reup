import { getUserAnalyzedResumes } from "@/lib/actions/analyzedResumes";
import { parseStringify } from "@/lib/utils";
import React from "react";

const page = async () => {
  const userResumes: AnalyzedResumeType[] = await getUserAnalyzedResumes();
  if (!userResumes || userResumes.length === 0)
    return <div>No user resumes found</div>;

  return (
    <div className="flex flex-col gap-4">
      {userResumes.map((resume) => (
        <div key={resume.analyzedResumeId}>
          <p>
            {(parseStringify(resume.feedback) as FeedbackType).overallScore}
          </p>
        </div>
      ))}
    </div>
  );
};

export default page;
