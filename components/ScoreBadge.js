import React from 'react';
import { View, Text, Image, Animated, StyleSheet } from 'react-native';
import { useFonts, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';

/**
 * ScoreBadge — badge de estrellas global para pantallas de juego.
 *
 * Props:
 * count      (number)          — cantidad de estrellas conseguidas
 * scaleAnim  (Animated.Value)  — valor animado para el efecto de rebote (opcional)
 */

export default function ScoreBadge({ count = 0, scaleAnim }) {
  const [fontsLoaded] = useFonts({ Baloo2_800ExtraBold });
  if (!fontsLoaded) return null;

  const contenido = (
    <View style={styles.badge}>
      <Image
        source={require('../assets/images/estrella.png')}
        style={styles.icono}
        resizeMode="contain"
      />
      <Text style={styles.numero}>{count}</Text>
    </View>
  );

  if (scaleAnim) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {contenido}
      </Animated.View>
    );
  }

  return contenido;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 3,
    borderColor: '#1A3C5E', 
    gap: 6,
    elevation: 4,
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 0,
  },
  icono: {
    width: 20,
    height: 20,
    flexShrink: 0, 
  },
  numero: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#1A3C5E',
    lineHeight: 22,
  },
});