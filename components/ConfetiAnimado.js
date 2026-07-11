// components/ConfetiAnimado.js

import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";

const { width, height } = Dimensions.get("window");

const COLORS = [
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#FF6BD6",
  "#FF9F43",
  "#A29BFE",
  "#00D2D3",
  "#F368E0",
  "#FF4757",
  "#2ED573",
  "#1E90FF",
  "#FF6348",
];

const ConfetiAnimado = ({ visible }) => {
  const [particulas, setParticulas] = useState([]);
  const idCounter = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setParticulas([]);
      return;
    }

    const nuevasParticulas = [];
    const cx = width / 2;
    const cy = height / 2;

    const puntos = [
      { x: cx, y: cy - height * 0.18 },
      { x: cx - width * 0.28, y: cy + height * 0.15 }, // ← 0.15 = más abajo
      { x: cx + width * 0.28, y: cy + height * 0.15 }, // ← 0.15 = más abajo
    ];

    puntos.forEach((punto, idx) => {
      const numParticulas = 80 + Math.random() * 40;
      const colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
      const colorSec = COLORS[Math.floor(Math.random() * COLORS.length)];

      for (let i = 0; i < numParticulas; i++) {
        const angulo =
          (i / numParticulas) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const distancia = 80 + Math.random() * 120;

        idCounter.current += 1;

        nuevasParticulas.push({
          id: idCounter.current,
          x: new Animated.Value(punto.x),
          y: new Animated.Value(punto.y),
          dx: Math.cos(angulo) * distancia,
          dy: Math.sin(angulo) * distancia,
          size: 6 + Math.random() * 10,
          color: Math.random() > 0.5 ? colorBase : colorSec,
          opacity: new Animated.Value(1),
          rotation: new Animated.Value(0),
          duracion: 1200 + Math.random() * 1000,
          delay: idx * 300 + Math.random() * 100,
        });
      }
    });

    setParticulas(nuevasParticulas);

    nuevasParticulas.forEach((p) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(p.x, {
            toValue: p.x._value + p.dx,
            duration: p.duracion,
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: p.y._value + p.dy,
            duration: p.duracion,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: p.duracion * 0.9,
            useNativeDriver: true,
          }),
          Animated.timing(p.rotation, {
            toValue: 1,
            duration: p.duracion,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setParticulas((prev) => prev.filter((item) => item.id !== p.id));
        });
      }, p.delay);
    });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setParticulas([]);
      timerRef.current = null;
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible]);

  if (!visible || particulas.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particulas.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            styles.particula,
            {
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                {
                  rotate: p.rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "720deg"],
                  }),
                },
              ],
              width: p.size,
              height: p.size * 0.6,
              backgroundColor: p.color,
              opacity: p.opacity,
              borderRadius: 0,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    pointerEvents: "none",
  },
  particula: {
    position: "absolute",
    top: 0,
  },
});

export default ConfetiAnimado;
