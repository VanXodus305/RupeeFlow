"use client";

import React, { memo } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { FiDownload, FiSmartphone } from "react-icons/fi";
import { useWalletWarning } from "@/hooks/useWalletWarning";

function WalletWarningBanner() {
  const {
    hasMaskInstalled,
    isInMetaMaskApp,
    isMobile,
    shouldShowWarning,
    deepLink,
    isInitialized,
  } = useWalletWarning();

  // Don't render anything until initialized
  if (!isInitialized || !shouldShowWarning) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 md:px-8 mx-auto max-w-4xl mb-6">
      <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/50 backdrop-blur-lg shadow-lg">
        <CardBody className="gap-4 py-4 px-5 sm:px-6">
          {/* Header */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <span className="text-2xl sm:text-3xl flex-shrink-0">🔐</span>
            <div className="flex-1">
              <p className="font-bold text-primary text-base sm:text-lg font-conthrax">
                {isMobile
                  ? "MetaMask Mobile App Required"
                  : "MetaMask Wallet Required"}
              </p>
              <p className="text-foreground/70 text-xs sm:text-sm mt-1">
                {isMobile
                  ? "Open this app in MetaMask Mobile for secure blockchain transactions"
                  : "Install MetaMask to complete charging settlements"}
              </p>
            </div>
          </div>

          {/* Message */}
          <p className="text-foreground/80 text-sm leading-relaxed">
            {isMobile
              ? "Your private keys and transactions are secured within the MetaMask app. You can use the browser button below to open this site in MetaMask's secure environment."
              : "MetaMask securely manages your blockchain transactions. Your private keys never leave your device and are required for settlement transactions."}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            {isMobile && deepLink ? (
              <Button
                as="a"
                href={deepLink}
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-background-200 font-semibold py-2.5 h-auto hover:shadow-lg hover:shadow-primary/50 transition-all text-sm sm:text-base"
                startContent={<FiSmartphone className="text-lg" />}
              >
                🦊 Open in MetaMask Mobile
              </Button>
            ) : null}
            <Button
              as="a"
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-primary/20 text-primary font-semibold py-2.5 h-auto border border-primary/50 hover:bg-primary/30 transition-colors text-sm sm:text-base"
              startContent={<FiDownload className="text-lg" />}
            >
              {isMobile ? "Download MetaMask Mobile" : "Install MetaMask"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default memo(WalletWarningBanner);
