import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

export function usePulso(escala = 1.06, duracion = 700) {
  const valor = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulsar = Animated.loop(
      Animated.sequence([
        Animated.timing(valor, {
          toValue: escala,
          duration: duracion,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(valor, {
          toValue: 1,
          duration: duracion,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulsar.start();
    return () => pulsar.stop();
  }, [escala, duracion]);

  return valor;
}