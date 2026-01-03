"use client";

import { useState, useEffect } from "react";

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

    const hasMaskInstalled = Boolean(
      window.ethereum && window.ethereum.isMetaMask
    );

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobile = mobileRegex.test(userAgent.toLowerCase());

    const isInMetaMaskApp =
      userAgent.includes("MetaMaskMobile") ||
      (isMobile && window.ethereum && window.ethereum.isMetaMask);

    let deepLink = null;
    if (isMobile && !isInMetaMaskApp) {
      const currentUrl = window.location.href;
      deepLink = `metamask://dapp/${currentUrl}`;
    }

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
