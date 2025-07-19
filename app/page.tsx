import Hero from "@/components/custom/Hero";
import { NavbarComponent } from "@/components/custom/Navbar";
import SampleResume from "@/components/custom/SampleResume";

export const meta = () => [
  { title: "ReUp | Home" },
  {
    name: "description",
    content:
      "ReUp: Craft a professional resume in minutes and get instant AI feedback to stand out. Create, optimize, and land your dream job with confidence.",
  },
  {
    name: "keywords",
    content:
      "ReUp, resume builder, AI feedback, resume verifier, job application, professional resume, home, landing page, resume, create resume, optimize resume, job search",
  },
];

export default function Home() {
  return (
    <div className="relative">
      <NavbarComponent />
      <div className="flex flex-col items-center justify-center gap-20 py-16">
        <Hero />
        <SampleResume />
      </div>
    </div>
  );
}
