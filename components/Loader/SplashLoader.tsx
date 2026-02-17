import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");
const DOT_SIZE = 20;
const START_Y = height * 0.1;
const CENTER_Y = height / 2 - DOT_SIZE / 2;
const DROP_DISTANCE = CENTER_Y - START_Y;

export default function SplashLoader() {
  const dropAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const centerOpacity = useRef(new Animated.Value(0)).current; // Start hidden

  useEffect(() => {
    Animated.sequence([
      // Falling dot animation
      Animated.timing(dropAnim, {
        toValue: DROP_DISTANCE,
        duration: 500,
        useNativeDriver: true,
      }),
      // Show center dot and expand
      Animated.parallel([
        Animated.timing(centerOpacity, {
          toValue: 1,
          duration: 0, // Make it visible immediately
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 200], // same as HTML scale
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

      {/* Center dot (initially hidden) */}
      <Animated.View
        style={[
          styles.dot,
          styles.centerDot,
          {
            transform: [{ scale }],
            opacity: centerOpacity, // control visibility
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
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: "#F5E3CF",
    top: START_Y,
  },
  centerDot: {
    top: CENTER_Y,
  },
});
