import React from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoadingScreen() {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={['#6C3FCF', '#4A6FD4', '#E8F4FD']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.fondo}
    >
      <View style={styles.contenido}>
        <Animated.Image
          source={require('../assets/images/mascota.png')}
          style={[styles.mascota, { transform: [{ scale: scaleAnim }] }]}
          resizeMode="contain"
        />
        <Text style={styles.titulo}>Aprende Jugando</Text>
        <Text style={styles.subtitulo}>Cargando...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascota: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  titulo: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitulo: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
});