import { BackgroundLines } from "@/components/ui/background-lines";
import { SignIn } from "@clerk/nextjs";

const SigninPage = () => {
  return (
    <div>
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
        <div className="mt-[40rem] md:mt-0 flex flex-col gap-4 items-center justify-center">
          <SignIn />

          <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
            Welcome back to ReUp! Ready to continue perfecting your resume? Sign
            in to access your progress and powerful AI feedback. Let&apos;s get
            you one step closer to your dream job!
          </p>
        </div>
      </BackgroundLines>
    </div>
  );
};

export default SigninPage;
