import Hero from "@/components/custom/Hero";
import { NavbarComponent } from "@/components/custom/Navbar";

export default function Home() {
  return (
    <div className="relative">
      <NavbarComponent />
      <Hero />
    </div>
  );
}
