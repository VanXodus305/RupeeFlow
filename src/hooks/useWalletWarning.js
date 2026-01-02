"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect wallet availability and mobile status
 * Runs only once on component mount, not continuously
 */
export function useWalletWarning() {
  const [walletStatus, setWalletStatus] = useState({
    hasMaskInstalled: false,
    isMobile: false,
    isInMetaMaskApp: false,
    shouldShowWarning: false,
    deepLink: null,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check MetaMask installation
    const hasMaskInstalled = Boolean(
      window.ethereum && window.ethereum.isMetaMask
    );

    // Check if mobile
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobile = mobileRegex.test(userAgent.toLowerCase());

    // Check if inside MetaMask Mobile app
    const isInMetaMaskApp =
      userAgent.includes("MetaMaskMobile") ||
      (isMobile && window.ethereum && window.ethereum.isMetaMask);

    // Generate deep link for MetaMask Mobile
    let deepLink = null;
    if (isMobile && !isInMetaMaskApp) {
      const currentUrl = window.location.href;
      // Ensure the URL is HTTPS for MetaMask Mobile
      deepLink = `metamask://dapp/${currentUrl}`;
    }

    // Determine if warning should show
    const shouldShowWarning = !hasMaskInstalled && !isInMetaMaskApp;

    setWalletStatus({
      hasMaskInstalled,
      isMobile,
      isInMetaMaskApp,
      shouldShowWarning,
      deepLink,
    });

    setIsInitialized(true);
  }, []);

  return { ...walletStatus, isInitialized };
}
