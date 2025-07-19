import ModeToggle from "@/components/custom/ModeToggle";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <Button>Click Me</Button>
      <ModeToggle />
      <UserButton />
    </div>
  );
}
