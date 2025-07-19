import { BackgroundLines } from "@/components/ui/background-lines";
import { SignUp } from "@clerk/nextjs";

export const meta = () => [
  { title: "ReUp | Signup" },
  {
    name: "description",
    content:
      "Sign up for ReUp to start crafting your professional resume and receive AI-powered feedback to enhance your job application.",
  },
  {
    name: "keywords",
    content:
      "ReUp, resume builder, AI feedback, resume verifyer, job application, professional resume, sign up, register",
  },
];

const SignupPage = () => {
  return (
    <div>
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
        <div className="mt-[40rem] md:mt-0 flex flex-col gap-4 items-center justify-center">
          <SignUp />
          <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
            Ready to craft a standout resume and land your dream job? Sign up
            for ReUp today and unlock our intuitive builder and instant AI
            feedback. Your future starts now!
          </p>
        </div>
      </BackgroundLines>
    </div>
  );
};

export default SignupPage;
