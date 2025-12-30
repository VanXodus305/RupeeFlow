"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RoleSelectionPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if user already has a role or is not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // If user already has a role, redirect to their dashboard
    if (session.user?.role === "owner") {
      router.push("/ev-owner-dashboard");
    } else if (session.user?.role === "operator") {
      router.push("/station-dashboard");
    }
  }, [session, status, router]);

  const handleRoleSelect = async (selectedRole) => {
    setIsLoading(true);

    try {
      console.log("Step 1: Starting role selection for:", selectedRole);

      // Update user role in database
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
      console.log("Step 2: Role updated in database:", updatedUser);

      // Update the session with the fresh user data from the API response
      // This triggers jwt callback with trigger="update"
      console.log("Step 3: Calling update() with new role...");
      const updateResult = await update({
        user: {
          ...session?.user,
          role: updatedUser.role,
        },
      });
      console.log("Step 4: Session update result:", updateResult);

      // Small wait to ensure session is fully updated
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Redirect to appropriate dashboard or onboarding
      const redirectPath =
        selectedRole === "operator"
          ? "/operator-onboarding"
          : "/ev-owner-dashboard";
      console.log("Step 5: Redirecting to:", redirectPath);
      router.replace(redirectPath);
    } catch (error) {
      console.error("Error in role selection:", error);
      setIsLoading(false);
      alert("Failed to update role: " + error.message);
    }
  };

  if (status === "loading") {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!session || session.user?.role !== null) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          Welcome to RupeeFlow
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Hi {session.user?.name}, choose how you want to use RupeeFlow
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* EV Owner Option */}
          <button
            onClick={() => handleRoleSelect("owner")}
            disabled={isLoading}
            className="group relative p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="text-3xl mb-3">🔌</div>
            <h2 className="text-2xl font-bold mb-2">EV Owner</h2>
            <p className="text-blue-100 text-sm">
              Find and pay for EV charging at nearby stations
            </p>
            <div className="mt-4 pt-4 border-t border-blue-400 text-sm font-semibold">
              {isLoading ? "Setting up..." : "Get Started"}
            </div>
          </button>

          {/* Station Operator Option */}
          <button
            onClick={() => handleRoleSelect("operator")}
            disabled={isLoading}
            className="group relative p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="text-3xl mb-3">⚡</div>
            <h2 className="text-2xl font-bold mb-2">Station Operator</h2>
            <p className="text-green-100 text-sm">
              Manage your charging station and track earnings
            </p>
            <div className="mt-4 pt-4 border-t border-green-400 text-sm font-semibold">
              {isLoading ? "Setting up..." : "Get Started"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
