// components/Correcto.js

import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

export default function Correcto({ visible, onComplete, estiloExtra }) {
  const scale = new Animated.Value(0.3);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity, transform: [{ scale }] }]}>
      <Text style={[styles.texto, estiloExtra]}>¡CORRECTO!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  texto: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 56,
    color: "#4CAF7A",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});