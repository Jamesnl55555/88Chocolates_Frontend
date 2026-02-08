import { useApp } from "@/contexts/AppContext";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  View
} from "react-native";

type Props = {
  onFinish?: () => void;
};

const { width, height } = Dimensions.get("window");

export default function Loading({ onFinish }: Props) {
  const { setIsLoading } = useApp();
  // Pulse animation for logo
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Loading bar animation
  const loadingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Loader line animation
    Animated.sequence([
      Animated.timing(loadingAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();

    // Auto finish after 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      onFinish?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [setIsLoading, onFinish]);

  const lineWidth = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../../assets/images/logo.png")}
        style={[
          styles.logo,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
        resizeMode="contain"
      />

      <View style={styles.loaderLine}>
        <Animated.View
          style={[
            styles.line,
            {
              width: lineWidth,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: "#F5E3CF",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 250,
    height: 250,
    marginBottom: 40,
  },

  loaderLine: {
    width: "50%",
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    overflow: "hidden",
  },

  line: {
    height: "100%",
    backgroundColor: "#411C0E",
    borderRadius: 30,
    shadowColor: "#411C0E",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
});
