// components/Incorrecto.js

import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

export default function Incorrecto({ visible, nombre, onComplete, tipo, estiloExtra }) {
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

  // ✅ "Era:" SOLO se muestra en modo "nombre"
  const mostrarEra = tipo === "nombre";

  return (
    <Animated.View style={[styles.overlay, { opacity, transform: [{ scale }] }]}>
      <Text style={[styles.texto, tipo === "silueta" && styles.textoSilueta, estiloExtra]}>
        ¡UPS! ESA NO ES
      </Text>
      {mostrarEra && (
        <Text style={styles.era}>
          Era: <Text style={styles.eraDestacado}>{nombre}</Text>
        </Text>
      )}
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
    fontSize: 45,
    color: "#F47C7C",
    textAlign: "center",
    marginBottom: 80,
    marginTop: -90,
  },
  textoSilueta: {
    marginTop: -150,
  },
  era: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 20,
    color: "#ffffff",
    textAlign: "center",
    marginTop: 45,
    marginBottom: 65,
  },
  eraDestacado: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 22,
    color: "#D45A5A",
  },
});