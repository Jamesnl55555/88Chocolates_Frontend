import { useApp } from "@/contexts/AppContext";
import React, { useEffect } from "react";
import SplashLoader from "../components/Loader/SplashLoader";

type Props = {
  onFinish?: () => void;
};

export default function SplashScreen({ onFinish }: Props) {
  const { setSplashDone, setIsLoading } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashDone(true);
      setIsLoading(true); // Show loading screen after splash
      onFinish?.();
    }, 1600); // match animation length

    return () => clearTimeout(timer);
  }, [setSplashDone, setIsLoading, onFinish]);

  return <SplashLoader />;
}
