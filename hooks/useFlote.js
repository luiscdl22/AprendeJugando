import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

export function useFlote(distancia = 10, duracion = 2600, delay = 0) {
  const valor = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(valor, {
          toValue: 1,
          duration: duracion,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(valor, {
          toValue: 0,
          duration: duracion,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, duracion]);

  return valor.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -distancia],
  });
}