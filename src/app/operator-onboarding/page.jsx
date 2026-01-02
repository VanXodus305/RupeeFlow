"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function OperatorOnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    stationName: "",
    stationAddress: "",
    chargerPower: 7.4,
    ratePerKwh: 12,
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user?.role !== "operator") {
      router.push("/login");
      return;
    }

    const checkOperatorExists = async () => {
      try {
        const response = await fetch("/api/operator/check");
        const data = await response.json();
        if (data.exists) {
          router.push("/station-dashboard");
        }
      } catch (err) {
        console.error("Error checking operator profile:", err);
      }
    };

    checkOperatorExists();
  }, [session, status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "stationName" || name === "stationAddress"
          ? value
          : parseFloat(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/operator/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create operator profile");
      }

      await response.json();
      router.push("/station-dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create operator profile");
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground/60 text-lg">Loading...</p>
      </div>
    );
  }

  if (!session || session.user?.role !== "operator") return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden">
      {/* Background gradient (same as role-selection) */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-200 via-background-100/30 to-background-200 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"
            style={{ fontFamily: "Conthrax, sans-serif" }}
          >
            Station Onboarding
          </h1>
          <p className="mt-3 text-foreground/70">
            Configure your charging station to start accepting sessions
          </p>
        </div>

        {/* Glass Card */}
        <Card className="bg-gradient-to-br from-background-100/60 to-background-200/60 backdrop-blur-xl border border-primary/20 shadow-xl">
          <CardHeader className="pb-0" />
          <CardBody className="space-y-6 p-8">
            {error && (
              <div className="rounded-lg bg-danger-50/10 border border-danger/30 text-danger px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Station Name"
                name="stationName"
                value={formData.stationName}
                onChange={handleChange}
                placeholder="Demo Charging Station"
                isRequired
                variant="bordered"
                classNames={{
                  label: "text-foreground/80 font-medium",
                  input: "text-foreground",
                  inputWrapper:
                    "border-primary/30 hover:border-primary/50 bg-background/40",
                }}
              />

              <Input
                label="Station Address"
                name="stationAddress"
                value={formData.stationAddress}
                onChange={handleChange}
                placeholder="123 Main Street, City"
                variant="bordered"
                classNames={{
                  label: "text-foreground/80 font-medium",
                  input: "text-foreground",
                  inputWrapper:
                    "border-primary/30 hover:border-primary/50 bg-background/40",
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Charger Power (kW)"
                  name="chargerPower"
                  value={formData.chargerPower.toString()}
                  onChange={handleChange}
                  step="0.1"
                  min="0.1"
                  variant="bordered"
                  classNames={{
                    label: "text-foreground/80 font-medium",
                    input: "text-foreground",
                    inputWrapper:
                      "border-secondary/30 hover:border-secondary/50 bg-background/40",
                  }}
                />

                <Input
                  type="number"
                  label="Rate per kWh (₹)"
                  name="ratePerKwh"
                  value={formData.ratePerKwh.toString()}
                  onChange={handleChange}
                  step="0.1"
                  min="0.1"
                  startContent={<span className="text-foreground/50">₹</span>}
                  variant="bordered"
                  classNames={{
                    label: "text-foreground/80 font-medium",
                    input: "text-foreground",
                    inputWrapper:
                      "border-secondary/30 hover:border-secondary/50 bg-background/40",
                  }}
                />
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                radius="full"
                className="w-full bg-gradient-to-r from-primary to-secondary text-background-200 font-semibold text-lg py-6 hover:shadow-lg hover:shadow-primary/40 transition-all"
              >
                {isLoading ? "Creating Station..." : "Create Station"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

