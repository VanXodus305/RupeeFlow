"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody } from "@heroui/react";

export default function RoleSelectionPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user?.role === "owner") {
      router.push("/ev-owner-dashboard");
    } else if (session.user?.role === "operator") {
      router.push("/station-dashboard");
    }
  }, [session, status, router]);

  const handleRoleSelect = async (selectedRole) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update role");
      }

      const updatedUser = await response.json();

      
      const updateResult = await update({
        user: {
          ...session?.user,
          role: updatedUser.role,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

      if (updateResult?.ok) {
        const redirectPath =
          selectedRole === "operator"
            ? "/operator-onboarding"
            : "/ev-owner-dashboard";
        router.replace(redirectPath);
      }
    } catch (error) {
      console.error("Error in role selection:", error);
      setIsLoading(false);
      alert("Failed to update role: " + error.message);
    }
  };

  if (status === "loading") {
    return <div className="p-8 text-center text-foreground">Loading...</div>;
  }

  if (!session || session.user?.role !== null) {
    return null;
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-24 lg:py-24  overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background-200 via-background-100/30 to-background-200 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto w-full space-y-12 px-8 relative z-10">
        <div className="text-center space-y-2">
          <h1
            className="text-4xl sm:text-5xl lg:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "Conthrax, sans-serif" }}
          >
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Welcome, {session?.user?.name}
            </span>
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-4xl font-bold tracking-tight text-foreground"  style={{ fontFamily: "Conthrax, sans-serif" }}>
            Choose Your Role
          </h2>
          <p className="text-lg text-foreground/70 leading-relaxed ">
            Select how you want to use RupeeFlow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 backdrop-blur-xl hover:border-primary/40 transition-all duration-300 cursor-pointer group">
            <CardBody className="space-y-6 p-8">
              <div className="space-y-4">
                <div className="text-5xl">🔌</div>
                <h2
                  className="text-2xl font-bold text-foreground tracking-tight"
                  style={{ fontFamily: "Conthrax, sans-serif" }}
                >
                  EV Owner
                </h2>
                <p className="text-foreground/70 text-base leading-relaxed">
                  Find and pay for EV charging at nearby stations with real-time
                  settlements and transparent pricing.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-primary/20">
                <div className="flex items-center gap-2 text-foreground/70 text-sm">
                  <span className="text-primary">✓</span>
                  Browse nearby stations
                </div>
                <div className="flex items-center gap-2 text-foreground/70 text-sm">
                  <span className="text-primary">✓</span>
                  Pay per usage
                </div>
                <div className="flex items-center gap-2 text-foreground/70 text-sm">
                  <span className="text-primary">✓</span>
                  Track charging history
                </div>
              </div>

              <Button
                onClick={() => handleRoleSelect("owner")}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-background-200 font-semibold text-lg py-6 hover:shadow-lg hover:shadow-primary/50 transition-all duration-200"
                radius="full"
              >
                {isLoading ? "Setting up..." : "Continue as EV Owner"}
              </Button>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-secondary/20 backdrop-blur-xl hover:border-secondary/40 transition-all duration-300 cursor-pointer group">
            <CardBody className="space-y-6 p-8">
              <div className="space-y-4">
                <div className="text-5xl">⚡</div>
                <h2
                  className="text-2xl font-bold text-foreground tracking-tight"
                  style={{ fontFamily: "Conthrax, sans-serif" }}
                >
                  Station Operator
                </h2>
                <p className="text-foreground/70 text-base leading-relaxed">
                  Manage your charging station and track earnings with
                  transparent blockchain settlements.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-secondary/20">
                <div className="flex items-center gap-2 text-foreground/70 text-sm">
                  <span className="text-secondary">✓</span>
                  Manage stations
                </div>
                <div className="flex items-center gap-2 text-foreground/70 text-sm">
                  <span className="text-secondary">✓</span>
                  Track earnings
                </div>
                <div className="flex items-center gap-2 text-foreground/70 text-sm">
                  <span className="text-secondary">✓</span>
                  Real-time settlements
                </div>
              </div>

              <Button
                onClick={() => handleRoleSelect("operator")}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-secondary to-secondary/80 text-background-200 font-semibold text-lg py-6 hover:shadow-lg hover:shadow-secondary/50 transition-all duration-200"
                radius="full"
              >
                {isLoading ? "Setting up..." : "Continue as Station Operator"}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}
