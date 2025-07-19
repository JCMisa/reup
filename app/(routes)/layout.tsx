import { NavbarComponent } from "@/components/custom/Navbar";
import { navItemsRoutes } from "@/constants";
import React from "react";

const RoutesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      <NavbarComponent navItems={navItemsRoutes} />
      {children}
    </div>
  );
};

export default RoutesLayout;
