"use client";

import StatusOverlay from "@/components/custom/StatusOverlay";
import { usePuterStore } from "@/lib/puter";
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import Summary from "./_components/Summary";
import ATS from "./_components/ATS";
import Details from "./_components/Details";

export const meta = () => [
  { title: "ReUp | Resume Details" },
  {
    name: "description",
    content:
      "View your analyzed resume and personalized AI feedback. Explore detailed insights to optimize your resume and boost your job application success with ReUp.",
  },
  {
    name: "keywords",
    content:
      "ReUp, resume details, AI feedback, resume analysis, job application, professional resume, resume insights, optimize resume, feedback, resume review",
  },
];

interface ResumeDetailsProps {
  params: Promise<{
    resumeId: string;
  }>;
}

const ResumeDetails = ({ params }: ResumeDetailsProps) => {
  const { resumeId } = use(params);

  const { fs, kv } = usePuterStore();

  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [statusText, setStatusText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      try {
        setIsLoading(true);

        setStatusText("Loading resume...");

        const resume = await kv.get(`resume:${resumeId}`);

        if (!resume) return;

        const data = JSON.parse(resume);

        const resumeBlob = await fs.read(data.resumePath); // will return a blob not the pdf name stored in neon
        console.log("resumeBlob: ", resumeBlob);
        if (!resumeBlob) return;
        const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
        const resumeUrl = URL.createObjectURL(pdfBlob);
        console.log("resumeUrl: ", resumeUrl);
        setResumeUrl(resumeUrl);
        setStatusText("Resume url loading...");

        const imageBlob = await fs.read(data.imagePath); // will return a blob not the image name stored in neon
        console.log("imageBlob: ", imageBlob);
        if (!imageBlob) return;
        const imageUrl = URL.createObjectURL(imageBlob);
        console.log("imageUrl: ", imageUrl);
        setImageUrl(imageUrl);
        setStatusText("Image url loading...");

        setFeedback(data.feedback);

        setStatusText("Resume loaded successfully");

        console.log("data: ", { resumeUrl, imageUrl, feedback: data.feedback });
      } catch (error) {
        console.log("error: ", error);
        setStatusText("Error loading resume");
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [resumeId, fs, kv]);

  return (
    <main className="min-h-screen w-full relative bg-background">
      {/* Primary Color Glow Background */}
      <div className="absolute inset-0 z-0 resume-glow-bg" />

      <div className="p-4 md:p-8 lg:p-10 !py-20">
        <Link
          href={"/"}
          className="flex items-center gap-1 text-sm font-semibold cursor-pointer"
        >
          <ArrowLeftIcon className="size-4" /> Back to Homepage
        </Link>

        <div className="flex flex-row w-full max-lg:flex-col-reverse">
          <section className="flex flex-col gap-8 w-1/2 px-8 max-lg:w-full py-6 bg-cover h-[100vh] sticky top-0 items-center justify-center">
            {imageUrl && resumeUrl && (
              <div className="animate-in fade-in duration-1000 max-sm:m-0 h-[90%] max-2xl:h-fit w-fit">
                <Link
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={imageUrl}
                    alt="Resume Image"
                    width={500}
                    height={500}
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </Link>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-8 w-1/2 px-8 max-lg:w-full py-6">
            <h2 className="text-4xl font-bold">Resume Review</h2>
            {feedback ? (
              <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                <Summary feedback={feedback} />
                <ATS
                  score={feedback.ATS.score || 0}
                  suggestions={feedback.ATS.tips || []}
                />
                <Details feedback={feedback} />
              </div>
            ) : (
              <StatusOverlay
                isVisible={isLoading}
                statusText={statusText}
                isModal={false}
                size="md"
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ResumeDetails;
