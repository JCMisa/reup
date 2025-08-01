import { NavbarComponent } from "@/components/custom/Navbar";
import { navItemsRoutes } from "@/constants";
import AuthFlow from "@/components/custom/AuthFlow";
import React from "react";

const RoutesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthFlow>
      <div className="relative">
        <NavbarComponent navItems={navItemsRoutes} />
        {children}
      </div>
    </AuthFlow>
  );
};

export default RoutesLayout;
