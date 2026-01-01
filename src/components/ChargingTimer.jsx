"use client";

import { Card, CardBody, Progress } from "@heroui/react";
import {
  FiClock,
  FiZap,
  FiDollarSign,
  FiBattery,
  FiActivity,
} from "react-icons/fi";

export default function ChargingTimer({
  secondsUsed,
  totalKwh,
  totalCost,
  currentPower,
  chargePercentage,
  initialBatteryPercent = 0,
}) {
  const minutes = Math.floor(secondsUsed / 60);
  const seconds = secondsUsed % 60;

  // Calculate MATIC equivalent (1 MATIC ≈ 50 INR as approximate rate)
  const maticAmount = (totalCost / 50).toFixed(4);

  // Calculate progress from initial percentage to current (max 100%)
  const progressPercentage = initialBatteryPercent + (chargePercentage || 0);
  const displayPercentage = Math.min(100, progressPercentage);

  return (
    <Card className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 backdrop-blur-sm">
      <CardBody className="gap-6">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg animate-pulse"></div>
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <FiZap className="text-background-200 text-lg animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground font-conthrax">
                Charging in Progress
              </h2>
              <p className="text-xs text-foreground/50">
                Securing your energy transfer on blockchain
              </p>
            </div>
          </div>

          {/* Main Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6">
            {/* Duration */}
            <div className="bg-gradient-to-br from-background-200/50 to-background-100/30 border border-primary/20 rounded-lg p-3 md:p-4 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <FiClock className="text-primary text-xs md:text-sm" />
                <p className="text-xs text-foreground/60 font-semibold">
                  Duration
                </p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-primary font-conthrax">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </p>
            </div>

            {/* Energy */}
            <div className="bg-gradient-to-br from-background-200/50 to-background-100/30 border border-secondary/20 rounded-lg p-3 md:p-4 hover:border-secondary/40 transition-all hover:shadow-lg hover:shadow-secondary/10">
              <div className="flex items-center gap-2 mb-2">
                <FiZap className="text-secondary text-xs md:text-sm" />
                <p className="text-xs text-foreground/60 font-semibold">
                  Energy
                </p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-secondary font-conthrax">
                {totalKwh.toFixed(2)}
              </p>
              <p className="text-xs text-foreground/50 mt-1">kWh</p>
            </div>

            {/* Cost in Rupees */}
            <div className="bg-gradient-to-br from-background-200/50 to-background-100/30 border border-primary/20 rounded-lg p-3 md:p-4 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <FiDollarSign className="text-primary text-xs md:text-sm" />
                <p className="text-xs text-foreground/60 font-semibold">Cost</p>
              </div>
              <p className="text-xl md:text-2xl font-bold text-primary font-conthrax">
                ₹{totalCost.toFixed(2)}
              </p>
              <p className="text-xs text-secondary font-semibold mt-1 font-conthrax">
                {maticAmount} MATIC
              </p>
            </div>

            {/* Power */}
            <div className="bg-gradient-to-br from-background-200/50 to-background-100/30 border border-secondary/20 rounded-lg p-3 md:p-4 hover:border-secondary/40 transition-all hover:shadow-lg hover:shadow-secondary/10">
              <div className="flex items-center gap-2 mb-2">
                <FiActivity className="text-secondary text-xs md:text-sm" />
                <p className="text-xs text-foreground/60 font-semibold">
                  Power
                </p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-secondary font-conthrax">
                {currentPower.toFixed(1)}
              </p>
              <p className="text-xs text-foreground/50 mt-1">kW</p>
            </div>
          </div>

          {/* Battery Progress Section */}
          <div className="bg-gradient-to-r from-background-100/40 to-background-200/40 border border-primary/20 rounded-lg p-3 md:p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                <FiBattery className="text-secondary text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground font-conthrax">
                  Battery Charge
                </p>
                <p className="text-xs text-foreground/50 font-conthrax">
                  {initialBatteryPercent.toFixed(1)}% →{" "}
                  {displayPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Percentage Display Above Progress */}
            <div className="flex justify-between items-end mb-2 px-1">
              <div className="text-left">
                <p className="text-xl md:text-2xl font-bold text-primary font-conthrax">
                  {displayPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm md:text-base font-bold text-secondary font-conthrax">
                  +{chargePercentage.toFixed(2)}%
                </p>
              </div>
            </div>

            <Progress
              size="lg"
              value={displayPercentage}
              maxValue={100}
              className="bg-background-200/50"
              classNames={{
                indicator:
                  "bg-gradient-to-r from-primary via-secondary to-primary animate-pulse",
                track: "bg-background-100/20 border border-primary/10",
              }}
              showValueLabel={false}
            />

            {/* Charging Rate Info */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
              <div className="bg-background-200/50 rounded-lg p-2 md:p-3 text-center border border-primary/10">
                <p className="text-xs text-foreground/50">Charge Rate</p>
                <p className="text-xs md:text-sm font-bold text-primary font-conthrax break-words">
                  {(chargePercentage / (secondsUsed / 60) || 0).toFixed(2)}%/min
                </p>
              </div>
              <div className="bg-background-200/50 rounded-lg p-2 md:p-3 text-center border border-primary/10">
                <p className="text-xs text-foreground/50">Energy Rate</p>
                <p className="text-xs md:text-sm font-bold text-secondary font-conthrax break-words">
                  {(totalKwh / (secondsUsed / 60) || 0).toFixed(2)} kWh/min
                </p>
              </div>
              <div className="bg-background-200/50 rounded-lg p-2 md:p-3 text-center border border-primary/10">
                <p className="text-xs text-foreground/50">Cost/min</p>
                <p className="text-xs md:text-sm font-bold text-primary font-conthrax break-words">
                  ₹{(totalCost / (secondsUsed / 60) || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Live Stats Bar */}
          <div className="flex gap-3 mt-4 text-xs">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <p className="text-foreground/70">
                Live Session • {Math.ceil(secondsUsed)} sec elapsed
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
