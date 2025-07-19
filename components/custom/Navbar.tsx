"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import ModeToggle from "./ModeToggle";
import { UserButton, useUser } from "@clerk/nextjs";
import { navItemsHome } from "@/constants";

export function NavbarComponent({
  navItems = navItemsHome,
}: {
  navItems?: { name: string; link: string }[];
}) {
  const { user } = useUser();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <ModeToggle />
            {user ? (
              <UserButton />
            ) : (
              <>
                <NavbarButton variant="secondary" href="/sign-in">
                  Signin
                </NavbarButton>
                <NavbarButton variant="primary" href="/sign-up">
                  Signup
                </NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            {user ? (
              <UserButton />
            ) : (
              <div className="flex w-full flex-col gap-4">
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full"
                  href="/sign-in"
                >
                  Signin
                </NavbarButton>
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full"
                  href="/sign-up"
                >
                  Signup
                </NavbarButton>
              </div>
            )}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
