"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RoleSelectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleRoleSelect = async (role) => {
    setIsLoading(true);
    try {
      console.log("Selecting role:", role);

      // Make direct API call to update role in database
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update role");
      }

      console.log("Role updated successfully in DB");

      // Wait a moment for database sync
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Navigate to the appropriate dashboard
      // The middleware will check the updated JWT which will have fresh DB data
      if (role === "owner") {
        router.push("/ev-owner-dashboard");
      } else {
        router.push("/operator-onboarding");
      }
    } catch (error) {
      console.error("Role selection error:", error);
      alert("Error updating role: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "100px auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1>Welcome to RupeeFlow</h1>
      <p>Hi {session.user.name}, what would you like to do?</p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "40px",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            flex: 1,
            maxWidth: "250px",
            padding: "30px",
            border: "2px solid #007bff",
            borderRadius: "8px",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f0f0f0")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "white")
          }
        >
          <h2>⚡ EV Owner</h2>
          <p>Charge your electric vehicle at nearby stations</p>
          <button
            onClick={() => handleRoleSelect("owner")}
            disabled={isLoading}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Loading..." : "Continue"}
          </button>
        </div>

        <div
          style={{
            flex: 1,
            maxWidth: "250px",
            padding: "30px",
            border: "2px solid #28a745",
            borderRadius: "8px",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f0f0f0")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "white")
          }
        >
          <h2>🔋 Station Operator</h2>
          <p>Manage your charging station and earn revenue</p>
          <button
            onClick={() => handleRoleSelect("operator")}
            disabled={isLoading}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Loading..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
