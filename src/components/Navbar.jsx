"use client";

import Link from "next/link";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const GlobalNavbar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Navbar
      isBlurred
      className="bg-gradient-to-r from-background-200/80 via-background-200/60 to-background-100/80 backdrop-blur-2xl border-b border-primary/20"
      classNames={{
        wrapper: "px-4 sm:px-6 py-3",
      }}
    >
      {/* Brand/Logo */}
      <NavbarBrand className="mr-4">
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <div className="relative w-20 h-20 sm:w-28 sm:h-28">
            <Image
              src="/images/logo.png"
              alt="RupeeFlow Logo"
              fill
              className="object-contain"
            />
          </div>
        </Link>
      </NavbarBrand>

      {/* Center Navigation */}
      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        <NavbarItem>
          <Link
            href="/"
            className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
          >
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="#features"
            className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
          >
            Features
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="#how-it-works"
            className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
          >
            How It Works
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="#about"
            className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
          >
            About
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* Right Side - Auth */}
      <NavbarContent justify="end">
        {!session ? (
          <NavbarItem className="flex gap-2">
            <Button
              as={Link}
              href="/login"
              className="bg-gradient-to-r from-primary to-primary/80 text-background-200 font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all duration-200"
              radius="full"
              size="sm"
            >
              Sign In
            </Button>
          </NavbarItem>
        ) : (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform hover:scale-110 cursor-pointer border-2 border-primary"
                color="secondary"
                name={session.user.name}
                size="sm"
                src={session.user.image || ""}
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Profile Actions"
              className="bg-background-200/95 backdrop-blur-xl border border-primary/20"
              itemClasses={{
                base: "gap-4 text-foreground hover:text-primary transition-colors",
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
              <DropdownItem key="profile" as={Link} href="/profile">
                Profile
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onAction={handleSignOut}
              >
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </NavbarContent>
    </Navbar>
  );
};

export default GlobalNavbar;
