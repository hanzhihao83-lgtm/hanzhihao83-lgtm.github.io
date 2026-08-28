"use client";

import { useEffect, useState } from "react";

interface NetworkInformationLike extends EventTarget {
  effectiveType?: string;
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformationLike;
}

export function useAutoplayMediaPolicy() {
  const [autoplayAllowed, setAutoplayAllowed] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 769px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as NavigatorWithConnection).connection;

    const updatePolicy = () => {
      const slowConnection = connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
      setAutoplayAllowed(
        desktopQuery.matches &&
        !reducedMotionQuery.matches &&
        !connection?.saveData &&
        !slowConnection,
      );
    };

    updatePolicy();
    desktopQuery.addEventListener("change", updatePolicy);
    reducedMotionQuery.addEventListener("change", updatePolicy);
    connection?.addEventListener("change", updatePolicy);

    return () => {
      desktopQuery.removeEventListener("change", updatePolicy);
      reducedMotionQuery.removeEventListener("change", updatePolicy);
      connection?.removeEventListener("change", updatePolicy);
    };
  }, []);

  return autoplayAllowed;
}
