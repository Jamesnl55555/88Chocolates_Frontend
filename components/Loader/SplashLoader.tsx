import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function SplashLoader() {
  const dropAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // First dot drops
      Animated.timing(dropAnim, {
        toValue: 310,
        duration: 500,
        useNativeDriver: true,
      }),

      // Second dot expands
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 100],
  });

  return (
    <View style={styles.container}>
      {/* Falling dot */}
      <Animated.View
        style={[
          styles.dot,
          {
            transform: [{ translateY: dropAnim }],
          },
        ]}
      />

      {/* Expanding dot */}
      <Animated.View
        style={[
          styles.dot,
          styles.centerDot,
          {
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#411C0E",
    alignItems: "center",
    justifyContent: "center",
  },

  dot: {
    position: "absolute",
    top: height * 0.1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F5E3CF",
  },

  centerDot: {
    top: height / 2 - 10,
  },
});
