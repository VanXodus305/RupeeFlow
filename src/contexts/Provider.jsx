"use client";

import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

const Provider = ({ children }) => {
  const router = useRouter();
  return (
    <SessionProvider>
      <HeroUIProvider navigate={router.push}>{children}</HeroUIProvider>
    </SessionProvider>
  );
};

export default Provider;
