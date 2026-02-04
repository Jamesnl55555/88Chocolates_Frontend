import React, { useEffect } from "react";
import SplashLoader from "../components/Loader/SplashLoader";

type Props = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1600); // match animation length

    return () => clearTimeout(timer);
  }, []);

  return <SplashLoader />;
}
