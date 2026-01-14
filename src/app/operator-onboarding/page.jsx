"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export default function OperatorOnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [stations, setStations] = useState([
    {
      id: 1,
      stationName: "",
      stationAddress: "",
      chargerPower: 7.4,
      ratePerKwh: 12,
    },
  ]);
  const [nextStationId, setNextStationId] = useState(2);

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

  const handleStationChange = (id, field, value) => {
    setStations((prev) =>
      prev.map((station) =>
        station.id === id
          ? {
              ...station,
              [field]:
                field === "stationName" || field === "stationAddress"
                  ? value
                  : parseFloat(value),
            }
          : station
      )
    );
  };

  const addStation = () => {
    setStations((prev) => [
      ...prev,
      {
        id: nextStationId,
        stationName: "",
        stationAddress: "",
        chargerPower: 7.4,
        ratePerKwh: 12,
      },
    ]);
    setNextStationId((prev) => prev + 1);
  };

  const removeStation = (id) => {
    if (stations.length > 1) {
      setStations((prev) => prev.filter((station) => station.id !== id));
    } else {
      setError("You must have at least one station");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!walletAddress) {
      setError("Wallet address is required");
      setIsLoading(false);
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setError(
        "Invalid wallet address format. Must be 0x followed by 40 hex characters"
      );
      setIsLoading(false);
      return;
    }

    if (stations.some((s) => !s.stationName.trim())) {
      setError("All station names are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/operator/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          stations,
        }),
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
      <div className="absolute inset-0 bg-gradient-to-b from-background-200 via-background-100/30 to-background-200 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"
            style={{ fontFamily: "Conthrax, sans-serif" }}
          >
            Operator Onboarding
          </h1>
          <p className="mt-3 text-foreground/70">
            Set up your charging company and stations
          </p>
        </div>

        <Card className="bg-gradient-to-br from-background-100/60 to-background-200/60 backdrop-blur-xl border border-primary/20 shadow-xl">
          <CardHeader className="pb-0" />
          <CardBody className="space-y-6 p-8">
            {error && (
              <div className="rounded-lg bg-danger-50/10 border border-danger/30 text-danger px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Wallet Address Section */}
              <div className="border-b border-primary/10 pb-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Account Details
                </h2>

                <div className="space-y-4">
                  <Input
                    label="Wallet Address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    isRequired
                    description="Your Ethereum wallet address for receiving settlements"
                    variant="bordered"
                    classNames={{
                      label: "text-foreground/80 font-medium",
                      input: "text-foreground font-mono text-sm",
                      inputWrapper:
                        "border-primary/30 hover:border-primary/50 bg-background/40",
                      description: "text-foreground/60 text-xs",
                    }}
                  />
                </div>
              </div>

              {/* Charging Stations */}
              <div className="border-b border-primary/10 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Charging Stations
                  </h2>
                  <Button
                    isIconOnly
                    className="bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    onClick={addStation}
                  >
                    <FiPlus size={20} />
                  </Button>
                </div>

                <div className="space-y-6">
                  {stations.map((station, index) => (
                    <Card
                      key={station.id}
                      className="bg-background-200/30 border border-secondary/20"
                    >
                      <CardBody className="space-y-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base font-semibold text-foreground">
                            Station {index + 1}
                          </h3>
                          {stations.length > 1 && (
                            <Button
                              isIconOnly
                              size="sm"
                              className="bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                              onClick={() => removeStation(station.id)}
                            >
                              <FiTrash2 size={16} />
                            </Button>
                          )}
                        </div>

                        <Input
                          label="Station Name"
                          value={station.stationName}
                          onChange={(e) =>
                            handleStationChange(
                              station.id,
                              "stationName",
                              e.target.value
                            )
                          }
                          placeholder="Station Name"
                          isRequired
                          variant="bordered"
                          classNames={{
                            label: "text-foreground/80 font-medium",
                            input: "text-foreground",
                            inputWrapper:
                              "border-secondary/30 hover:border-secondary/50 bg-background/40",
                          }}
                        />

                        <Input
                          label="Station Address"
                          value={station.stationAddress}
                          onChange={(e) =>
                            handleStationChange(
                              station.id,
                              "stationAddress",
                              e.target.value
                            )
                          }
                          placeholder="Street Address"
                          variant="bordered"
                          classNames={{
                            label: "text-foreground/80 font-medium",
                            input: "text-foreground",
                            inputWrapper:
                              "border-secondary/30 hover:border-secondary/50 bg-background/40",
                          }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            type="number"
                            label="Charger Power (kW)"
                            value={station.chargerPower.toString()}
                            onChange={(e) =>
                              handleStationChange(
                                station.id,
                                "chargerPower",
                                e.target.value
                              )
                            }
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
                            value={station.ratePerKwh.toString()}
                            onChange={(e) =>
                              handleStationChange(
                                station.id,
                                "ratePerKwh",
                                e.target.value
                              )
                            }
                            step="0.1"
                            min="0.1"
                            startContent={
                              <span className="text-foreground/50">₹</span>
                            }
                            variant="bordered"
                            classNames={{
                              label: "text-foreground/80 font-medium",
                              input: "text-foreground",
                              inputWrapper:
                                "border-secondary/30 hover:border-secondary/50 bg-background/40",
                            }}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                radius="full"
                className="w-full bg-gradient-to-r from-primary to-secondary text-background-200 font-semibold text-lg py-6 hover:shadow-lg hover:shadow-primary/40 transition-all"
              >
                {isLoading ? "Creating Operator Profile..." : "Complete Setup"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
