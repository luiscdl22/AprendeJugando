import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import { useAudioPlayer } from 'expo-audio';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';

const { width } = Dimensions.get('window');

const VOZ_ELEGIDA = {
  identifier: 'es-us-x-esd-local',
  language: 'es-US',
};

function hablar(texto, extra = {}) {
  Speech.speak(texto, {
    voice: VOZ_ELEGIDA.identifier || undefined,
    language: VOZ_ELEGIDA.language,
    pitch: 1.15,
    rate: 0.92,
    ...extra,
    onError: () => {
      Speech.speak(texto, { language: VOZ_ELEGIDA.language, pitch: 1.15, rate: 0.92 });
    },
  });
}

// Hace que un valor flote suavemente arriba/abajo en bucle infinito
function useFlote(distancia, duracion, delay = 0) {
  const valor = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animacion = Animated.loop(
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
    animacion.start();
    return () => animacion.stop();
  }, []);
  return valor.interpolate({ inputRange: [0, 1], outputRange: [0, -distancia] });
}

function useDestello() {
  const valor = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(valor, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(valor, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    animacion.start();
    return () => animacion.stop();
  }, []);
  return {
    scale: valor.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }),
    rotate: valor.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] }),
  };
}

export default function HomeScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const escalaBoton = useRef(new Animated.Value(1)).current;
  const sonidoJugar = useAudioPlayer(require('../assets/sounds/jugar.wav'));

  // flote de fondo, cada círculo con su propio ritmo para que no se vean sincronizados
  const flote1 = useFlote(10, 2600, 0);
  const flote2 = useFlote(14, 3200, 300);
  const flote3 = useFlote(8, 2200, 600);
  const flote4 = useFlote(16, 3600, 150);
  const floteMascota = useFlote(7, 2400, 0);
  const destello = useDestello();

  // animación de entrada en cascada
  const entradaEstrella = useRef(new Animated.Value(0)).current;
  const entradaTitulo = useRef(new Animated.Value(0)).current;
  const entradaMascota = useRef(new Animated.Value(0)).current;
  const entradaBoton = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(entradaEstrella, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.spring(entradaTitulo, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(entradaMascota, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(entradaBoton, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    hablar(
      '¡Bienvenido a Aprende Jugando! Comencemos. Presiona el botón Jugar para comenzar con la diversión.'
    );
    return () => Speech.stop();
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.fondo} />;
  }

  const presionarBoton = () => {
    Animated.spring(escalaBoton, { toValue: 0.92, useNativeDriver: true, speed: 50 }).start();
  };

  const soltarBoton = () => {
    Animated.spring(escalaBoton, { toValue: 1, useNativeDriver: true, friction: 3 }).start();
  };

  const handleJugar = () => {
    Speech.stop();
    sonidoJugar.seekTo(0);
    sonidoJugar.play();
    // navigation.navigate('Categorias');
  };

  return (
    <LinearGradient
      colors={['#FFF8EC', '#FFE3B8', '#FFD08A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.fondo}
    >
      <StatusBar style="dark" />

      <Animated.View
        style={[styles.circulo, styles.circulo1, { transform: [{ translateY: flote1 }] }]}
      />
      <Animated.View
        style={[styles.circulo, styles.circulo2, { transform: [{ translateY: flote2 }] }]}
      />
      <Animated.View
        style={[styles.circulo, styles.circulo3, { transform: [{ translateY: flote3 }] }]}
      />
      <Animated.View
        style={[styles.circulo, styles.circulo4, { transform: [{ translateY: flote4 }] }]}
      />

      <SafeAreaView style={styles.contenido}>
        <View style={styles.bloqueSuperior}>
          <Animated.View
            style={{
              opacity: entradaEstrella,
              transform: [{ scale: entradaEstrella }],
            }}
          >
            <Animated.View
              style={{ transform: [{ scale: destello.scale }, { rotate: destello.rotate }] }}
            >
              <Image
                source={require('../assets/images/estrella.png')}
                style={styles.estrellaImg}
                resizeMode="contain"
              />
            </Animated.View>
          </Animated.View>

          <Animated.Text
            style={[
              styles.titulo,
              {
                opacity: entradaTitulo,
                transform: [
                  { translateY: entradaTitulo.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) },
                ],
              },
            ]}
          >
            ¡Aprende Jugando{'\n'}con <Text style={styles.tituloAcento}>Siluetas!</Text>
          </Animated.Text>
        </View>

        <View style={styles.escenarioMascota}>
          <View style={styles.plataforma} />
          <Animated.View
            style={{
              opacity: entradaMascota,
              transform: [
                { scale: entradaMascota.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              ],
            }}
          >
            <Animated.View style={{ transform: [{ translateY: floteMascota }] }}>
              <Image
                source={require('../assets/images/mascota.png')}
                style={styles.mascotaImg}
                resizeMode="contain"
              />
            </Animated.View>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.bloqueInferior,
            {
              opacity: entradaBoton,
              transform: [
                { translateY: entradaBoton.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
              ],
            },
          ]}
        >
          <Text style={styles.ayuda}>¡Toca el botón para empezar!</Text>

          <TouchableOpacity
            style={styles.botonContenedor}
            activeOpacity={1}
            onPressIn={presionarBoton}
            onPressOut={soltarBoton}
            onPress={handleJugar}
          >
            <Animated.View style={[styles.boton, { transform: [{ scale: escalaBoton }] }]}>
              <Text style={styles.textoBoton}>¡ JUGAR !</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },

  circulo: { position: 'absolute', borderRadius: 999 },
  circulo1: {
    width: 110,
    height: 110,
    top: 60,
    left: -20,
    backgroundColor: 'rgba(232,93,93,0.32)',
  },
  circulo2: {
    width: 70,
    height: 70,
    top: 130,
    right: -10,
    backgroundColor: 'rgba(255,159,67,0.42)',
  },
  circulo3: {
    width: 60,
    height: 60,
    top: width * 0.6,
    left: 10,
    backgroundColor: 'rgba(23,162,184,0.3)',
  },
  circulo4: {
    width: 130,
    height: 130,
    bottom: 160,
    right: -30,
    backgroundColor: 'rgba(122,184,122,0.32)',
  },

  bloqueSuperior: { alignItems: 'center', marginTop: 10 },
  estrellaImg: { width: 70, height: 70 },
  titulo: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 32,
    color: '#5C3A21',
    textAlign: 'center',
    lineHeight: 40,
    marginTop: 8,
  },
  tituloAcento: {
    color: '#17A2B8',
  },

  escenarioMascota: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  plataforma: {
    position: 'absolute',
    bottom: 14,
    width: 190,
    height: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(111,168,232,0.25)',
  },
  mascotaImg: { width: 270, height: 270 },

  bloqueInferior: { alignItems: 'center', width: '100%' },
  botonContenedor: { width: '100%' },
  boton: {
    backgroundColor: '#FFC400',
    paddingVertical: 18,
    width: '100%',
    borderRadius: 50,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#5C3A21',
    shadowColor: '#5C3A21',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 8,
  },
  textoBoton: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 24,
    color: '#4A2F18',
    letterSpacing: 0.5,
  },
  ayuda: {
    marginBottom: 14,
    fontSize: 14,
    color: '#5C3A21',
    fontWeight: '700',
  },
});