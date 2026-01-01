"use client";

import Link from "next/link";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { FaChevronDown } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";

const GlobalNavbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("home");
  const navbarRef = useRef(null);

  useEffect(() => {
    // Only enable section highlighting on the homepage
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const handleScroll = () => {
      const sections = [
        { id: "home", offset: 0 },
        {
          id: "features",
          offset: document.getElementById("features")?.offsetTop || 0,
        },
        {
          id: "how-it-works",
          offset: document.getElementById("how-it-works")?.offsetTop || 0,
        },
        {
          id: "about",
          offset: document.getElementById("about")?.offsetTop || 0,
        },
      ];

      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollPosition >= sections[i].offset) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const isLinkActive = (sectionId) => activeSection === sectionId;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const closeNavbar = () => {
    if (navbarRef.current) {
      navbarRef.current.classList.add("hidden");
      setTimeout(() => {
        navbarRef.current?.classList.remove("hidden");
      }, 100);
    }
  };

  return (
    <Navbar
      ref={navbarRef}
      isBlurred
      isBordered
      className="fixed top-0 w-full z-50 bg-gradient-to-r from-background-200/60 via-background-200/50 to-background-100/60 backdrop-blur-3xl"
      classNames={{
        wrapper: "max-w-full px-4 sm:px-6 flex justify-between items-center",
      }}
      maxWidth="full"
    >
      {/* Logo */}
      <NavbarBrand className="flex-shrink-0 mr-auto">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="relative w-[84px] h-[84px] sm:w-24 sm:h-24">
            <Image
              src="/images/logo.png"
              alt="RupeeFlow Logo"
              fill
              className="object-contain"
            />
          </div>
        </Link>
      </NavbarBrand>

      {/* Center Navigation - Desktop */}
      <NavbarContent className="hidden md:flex gap-8 flex-1 justify-evenly mx-auto">
        <NavbarItem>
          <Link
            href="/"
            className={`transition-colors duration-200 font-medium ${
              isLinkActive("home")
                ? "text-primary"
                : "text-foreground hover:text-primary"
            }`}
          >
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/#features"
            className={`transition-colors duration-200 font-medium ${
              isLinkActive("features")
                ? "text-primary"
                : "text-foreground hover:text-primary"
            }`}
          >
            Features
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/#how-it-works"
            className={`transition-colors duration-200 font-medium ${
              isLinkActive("how-it-works")
                ? "text-primary"
                : "text-foreground hover:text-primary"
            }`}
          >
            How It Works
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/#about"
            className={`transition-colors duration-200 font-medium ${
              isLinkActive("about")
                ? "text-primary"
                : "text-foreground hover:text-primary"
            }`}
          >
            About
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-4 flex-shrink-0 ml-auto">
        {!session ? (
          <NavbarItem className="hidden sm:flex">
            <Button
              as={Link}
              href="/login"
              className="bg-gradient-to-r from-primary to-primary/80 text-background-200 font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all duration-200"
              radius="lg"
              size="md"
            >
              Sign In
            </Button>
          </NavbarItem>
        ) : (
          <NavbarItem className="hidden sm:flex">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <button className="flex items-center gap-2 px-4 py-2 rounded-large hover:bg-white/10 transition-colors duration-200">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="w-8 h-8 rounded-large object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-large bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-background-200">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-foreground font-medium text-sm">
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <FaChevronDown className="text-primary text-xs" />
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Profile Actions"
                // className="bg-background-200/95 backdrop-blur-xl border border-primary/20"
                itemClasses={{
                  base: "gap-4 text-foreground data-[hover=true]:bg-primary/10 data-[hover=true]:text-primary transition-colors",
                }}
              >
                <DropdownItem isReadOnly key="profile" className="h-14 gap-2">
                  <p className="text-sm font-semibold text-primary">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-foreground/70">
                    {session.user.email}
                  </p>
                </DropdownItem>
                <DropdownItem
                  key="dashboard"
                  as={Link}
                  href={
                    session.user.role === "operator"
                      ? "/station-dashboard"
                      : "/ev-owner-dashboard"
                  }
                >
                  Dashboard
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="text-foreground data-[hover=true]:bg-red-500/20 data-[hover=true]:text-red-500 transition-colors"
                  onAction={handleSignOut}
                >
                  Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        )}

        {/* Mobile Menu Toggle */}
        <NavbarMenuToggle
          aria-label="Toggle navigation"
          className="md:hidden text-foreground hover:text-primary"
        />
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="bg-gradient-to-b from-background-200/95 to-background-100/95 backdrop-blur-xl border-t border-primary/20 px-0">
        {/* Navigation Section */}
        <div className="px-4 py-3 space-y-4">
          <NavbarMenuItem>
            <Link
              href="/"
              onClick={closeNavbar}
              className="w-full text-foreground hover:text-primary transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-white/5"
            >
              Home
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              href="/#features"
              onClick={closeNavbar}
              className="w-full text-foreground hover:text-primary transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-white/5"
            >
              Features
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              href="/#how-it-works"
              onClick={closeNavbar}
              className="w-full text-foreground hover:text-primary transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-white/5"
            >
              How It Works
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              href="/#about"
              onClick={closeNavbar}
              className="w-full text-foreground hover:text-primary transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-white/5"
            >
              About
            </Link>
          </NavbarMenuItem>
        </div>

        {!session ? (
          <NavbarMenuItem className="px-4 pb-4">
            <Button
              as={Link}
              href="/login"
              onClick={closeNavbar}
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-background-200 font-semibold"
              radius="lg"
              size="lg"
            >
              Sign In
            </Button>
          </NavbarMenuItem>
        ) : (
          <>
            {/* Divider */}
            <div className="my-3 border-t border-primary/20"></div>

            {/* User Profile Section */}
            <div className="px-4 py-3 mx-2 rounded-xl bg-white/5 backdrop-blur-sm mb-3">
              <div className="flex items-center gap-3 mb-3">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-base font-bold text-background-200 flex-shrink-0">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-foreground/60 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>

              {/* Dashboard & Sign Out Buttons */}
              <div className="flex gap-2">
                <Link
                  href={
                    session.user.role === "operator"
                      ? "/station-dashboard"
                      : "/ev-owner-dashboard"
                  }
                  onClick={closeNavbar}
                  className="flex-1 text-center text-foreground hover:text-primary transition-colors duration-200 py-2 px-2 rounded-lg hover:bg-white/10 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    closeNavbar();
                    handleSignOut();
                  }}
                  className="flex-1 text-center text-red-400 hover:text-red-300 transition-colors duration-200 py-2 px-2 rounded-lg hover:bg-red-500/20 text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
};

export default GlobalNavbar;
