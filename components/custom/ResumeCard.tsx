import Link from "next/link";
import ScoreCircle from "./ScoreCircle";
import Image from "next/image";

const ResumeCard = ({ resume }: { resume: ResumeType }) => {
  return (
    <Link
      href={`/resume/${resume.id}`}
      className="animate-in fade-in duration-200 flex flex-col gap-8 h-[560px] w-full lg:w-[450px] xl:w-[490px] bg-neutral-100/80 dark:bg-neutral-900/80 rounded-2xl p-4"
    >
      <div className="flex flex-row gap-2 justify-between min-h-[110px] max-sm:flex-col items-center max-md:justify-center max-md:items-center">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold break-words">{resume.companyName}</h2>
          <h3 className="text-lg break-words text-muted-foreground">
            {resume.jobTitle}
          </h3>
        </div>

        <div className="flex-shrink-0">
          <ScoreCircle score={resume.feedback.overallScore} />
        </div>
      </div>

      <div className="animate-in fade-in duration-1000 bg-gradient-to-b from-background to-primary p-4 rounded-2xl">
        <div className="w-full h-full">
          <Image
            src={resume.imageUrl}
            alt="resume"
            width={1000}
            height={1000}
            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top shadow-2xl rounded-xl"
          />
        </div>
      </div>
    </Link>
  );
};

export default ResumeCard;
