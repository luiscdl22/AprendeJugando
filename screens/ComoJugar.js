// screens/ComoJugar.js

import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from "@expo-google-fonts/baloo-2";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { Audio } from "expo-av";

import { TUTORIAL_PASOS, TUTORIAL_TEXTOS, TUTORIAL_AUDIOS, TUTORIAL_CONFIG } from "../data/tutorial";

const { width, height } = Dimensions.get("window");

// MAPA DE MUSICA PARA TUTORIAL
const MUSICA_TUTORIAL = require("../assets/sounds/musica_tutorial.mp3");

function useFlote(distancia, duracion, delay = 0) {
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
  }, [delay, duracion, valor]);
  return valor.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -distancia],
  });
}

export default function ComoJugar({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const [pasoActual, setPasoActual] = useState(0);
  const [mostrandoDemo, setMostrandoDemo] = useState(false);
  const [mostrandoIntro, setMostrandoIntro] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floteBuho = useFlote(6, 2400, 0);
  const floteBurbuja1 = useFlote(12, 2800, 0);
  const floteBurbuja2 = useFlote(16, 3400, 200);
  const floteNube = useFlote(4, 3000, 300);
  const floteSabioDemo = useFlote(6, 2400, 0);

  const paso = TUTORIAL_PASOS[pasoActual];

  // 🎵 Estado para musica de fondo
  const musicaRef = useRef(null);
  const [musicaActiva, setMusicaActiva] = useState(true);

  const introAudio = useAudioPlayer(TUTORIAL_AUDIOS.intro);
  const pasoAudio = useAudioPlayer(paso?.audio || null);
  const finalAudio = useAudioPlayer(TUTORIAL_AUDIOS.final);

  // 🎵 Cargar musica de fondo del tutorial
  useEffect(() => {
    const cargarMusica = async () => {
      try {
        if (musicaRef.current) {
          await musicaRef.current.stopAsync();
          await musicaRef.current.unloadAsync();
          musicaRef.current = null;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          MUSICA_TUTORIAL,
          { shouldPlay: true, isLooping: true, volume: 0.2 }
        );
        
        musicaRef.current = sound;
        setMusicaActiva(true);
        await sound.playAsync();
      } catch (error) {
        console.log('Error cargando musica tutorial:', error);
      }
    };

    cargarMusica();

    return () => {
      if (musicaRef.current) {
        musicaRef.current.stopAsync();
        musicaRef.current.unloadAsync();
        musicaRef.current = null;
      }
    };
  }, []);

  // 🎵 Detener musica al navegar a otra pantalla
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      if (musicaRef.current) {
        musicaRef.current.pauseAsync();
      }
    });

    const unsubscribeFocus = navigation.addListener("focus", () => {
      if (musicaRef.current && !mostrandoDemo && !mostrandoIntro) {
        musicaRef.current.playAsync();
      }
    });

    return () => {
      unsubscribe();
      unsubscribeFocus();
    };
  }, [navigation, mostrandoDemo, mostrandoIntro]);

  useEffect(() => {
    const reproducirAudio = async () => {
      try {
        await Promise.all([
          introAudio?.pause(),
          pasoAudio?.pause(),
          finalAudio?.pause(),
        ]);

        await new Promise((resolve) => setTimeout(resolve, 200));

        if (mostrandoIntro && introAudio) {
          await introAudio.seekTo(0);
          await introAudio.play();
        } else if (mostrandoDemo && finalAudio) {
          await finalAudio.seekTo(0);
          await finalAudio.play();
        } else if (!mostrandoIntro && !mostrandoDemo && pasoAudio) {
          await pasoAudio.seekTo(0);
          await pasoAudio.play();
        }
      } catch (error) {
        console.log("Audio no disponible");
      }
    };

    const timer = setTimeout(reproducirAudio, 400);
    return () => {
      clearTimeout(timer);
      try {
        introAudio?.pause();
        pasoAudio?.pause();
        finalAudio?.pause();
      } catch (e) {}
    };
  }, [pasoActual, mostrandoIntro, mostrandoDemo, introAudio, pasoAudio, finalAudio]);

  if (!fontsLoaded) return null;

  const avanzar = () => {
    if (procesando) return;
    setProcesando(true);

    try {
      pasoAudio?.pause();
    } catch (e) {}

    if (pasoActual < TUTORIAL_PASOS.length - 1) {
      setPasoActual(pasoActual + 1);
      scaleAnim.setValue(0.92);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      setMostrandoDemo(true);
      // 🎵 Pausar musica al entrar a la demo
      if (musicaRef.current) {
        musicaRef.current.pauseAsync();
      }
    }

    setTimeout(() => setProcesando(false), 400);
  };

  const retroceder = () => {
    if (procesando || pasoActual === 0) return;
    setProcesando(true);

    try {
      pasoAudio?.pause();
    } catch (e) {}

    setPasoActual(pasoActual - 1);
    scaleAnim.setValue(0.92);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();

    setTimeout(() => setProcesando(false), 400);
  };

  const irAlMenu = () => {
    if (procesando) return;
    setProcesando(true);

    try {
      introAudio?.pause();
      pasoAudio?.pause();
      finalAudio?.pause();
    } catch (e) {}

    // 🎵 Detener musica al salir
    if (musicaRef.current) {
      musicaRef.current.stopAsync();
      musicaRef.current.unloadAsync();
      musicaRef.current = null;
    }

    navigation.goBack();
    setTimeout(() => setProcesando(false), 400);
  };

  const irAlPaso1 = () => {
    if (procesando) return;
    setProcesando(true);

    try {
      pasoAudio?.pause();
      finalAudio?.pause();
    } catch (e) {}

    setPasoActual(0);
    setMostrandoDemo(false);
    scaleAnim.setValue(1);

    // 🎵 Reanudar musica al volver a los pasos
    if (musicaRef.current) {
      musicaRef.current.playAsync();
    }

    setTimeout(() => setProcesando(false), 400);
  };

  const iniciarTutorial = () => {
    if (procesando) return;
    setProcesando(true);

    try {
      introAudio?.pause();
    } catch (e) {}

    setMostrandoIntro(false);
    setTimeout(() => setProcesando(false), 400);
  };

  // Pantalla de introducción
  if (mostrandoIntro) {
    return (
      <LinearGradient
        colors={TUTORIAL_CONFIG.colorFondo}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.fondo}
      >
        <StatusBar style="light" />

        <Animated.View
          style={[
            styles.burbuja,
            styles.burbuja1,
            { transform: [{ translateY: floteBurbuja1 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.burbuja,
            styles.burbuja2,
            { transform: [{ translateY: floteBurbuja2 }] },
          ]}
        />

        <SafeAreaView style={styles.contenidoIntro}>
          <View style={styles.bloqueTitulo}>
            <Text style={styles.textoTitulo}>{TUTORIAL_CONFIG.titulo}</Text>
          </View>

          <View style={styles.bloqueBuhoIntro}>
            <Animated.View style={{ transform: [{ translateY: floteBuho }] }}>
              <Image
                source={require("../assets/images/mascota.png")}
                style={styles.buhoIntro}
                resizeMode="contain"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.globoIntro,
                { transform: [{ translateY: floteNube }] },
              ]}
            >
              <View style={styles.globoIntroPunta} />
              <Text style={styles.globoIntroTexto}>
                {TUTORIAL_TEXTOS.intro}
              </Text>
            </Animated.View>
          </View>

          <TouchableOpacity
            style={styles.botonComenzar}
            onPress={iniciarTutorial}
            activeOpacity={0.8}
            disabled={procesando}
          >
            <LinearGradient
              colors={["#FFD166", "#FFC400"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.botonComenzarGradient}
            >
              <Text style={styles.botonComenzarTexto}>Comenzar</Text>
              <Ionicons name="arrow-forward" size={28} color="#1A365D" />
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Pantalla de demostración final
  if (mostrandoDemo) {
    const estrellasPosiciones = [
      { top: '8%', left: '4%', size: 22 },
      { top: '5%', right: '6%', size: 18 },
      { top: '14%', left: '20%', size: 14 },
      { top: '20%', right: '18%', size: 20 },
      { top: '26%', left: '6%', size: 12 },
      { top: '32%', right: '4%', size: 16 },
      { bottom: '22%', left: '5%', size: 18 },
      { bottom: '28%', right: '4%', size: 12 },
      { bottom: '16%', left: '18%', size: 20 },
      { bottom: '10%', right: '20%', size: 14 },
      { bottom: '3%', left: '8%', size: 16 },
      { bottom: '2%', right: '5%', size: 22 },
      { top: '50%', left: '2%', size: 10 },
      { top: '55%', right: '2%', size: 10 },
      { top: '75%', left: '3%', size: 8 },
      { top: '80%', right: '3%', size: 8 },
    ];

    return (
      <LinearGradient
        colors={TUTORIAL_CONFIG.colorFondo}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.fondo}
      >
        <StatusBar style="light" />

        <Animated.View
          style={[
            styles.burbuja,
            styles.burbuja1,
            { transform: [{ translateY: floteBurbuja1 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.burbuja,
            styles.burbuja2,
            { transform: [{ translateY: floteBurbuja2 }] },
          ]}
        />

        {estrellasPosiciones.map((pos, index) => (
          <Animated.View
            key={index}
            style={[
              styles.estrellaRegada,
              {
                top: pos.top,
                left: pos.left,
                right: pos.right,
                bottom: pos.bottom,
              },
            ]}
          >
            <Ionicons name="star" size={pos.size} color="#FFD166" />
          </Animated.View>
        ))}

        <View style={styles.demoHeader}>
          <Text style={styles.demoHeaderTitulo}>Aprende y Gana</Text>
        </View>

        <View style={styles.buhoEsquinaFinal}>
          <Animated.View style={{ transform: [{ translateY: floteSabioDemo }] }}>
            <Image
              source={require("../assets/images/buho_saludando.png")}
              style={styles.buhoEsquinaImg}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <SafeAreaView style={styles.contenido}>
          <View style={styles.demoContainer}>
            <Animated.View
              style={[
                styles.tarjetaDemo,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Text style={styles.demoSubtitulo}>
                {TUTORIAL_TEXTOS.final}
              </Text>

              <View style={styles.demoBotones}>
                <TouchableOpacity
                  style={styles.botonSi}
                  onPress={irAlPaso1}
                  activeOpacity={0.8}
                  disabled={procesando}
                >
                  <LinearGradient
                    colors={["#4CAF7A", "#388E3C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.botonSiGradient}
                  >
                    <Text style={styles.botonSiTexto}>Sí</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botonNo}
                  onPress={irAlMenu}
                  activeOpacity={0.8}
                  disabled={procesando}
                >
                  <LinearGradient
                    colors={["#F47C7C", "#D45A5A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.botonNoGradient}
                  >
                    <Text style={styles.botonNoTexto}>No</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Pantalla de pasos del tutorial
  return (
    <LinearGradient
      colors={TUTORIAL_CONFIG.colorFondo}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.fondo}
    >
      <StatusBar style="light" />

      <Animated.View
        style={[
          styles.burbuja,
          styles.burbuja1,
          { transform: [{ translateY: floteBurbuja1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.burbuja,
          styles.burbuja2,
          { transform: [{ translateY: floteBurbuja2 }] },
        ]}
      />

      <SafeAreaView style={styles.contenido}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.botonAtras,
              pasoActual === 0 && styles.botonAtrasDisabled,
            ]}
            onPress={retroceder}
            activeOpacity={0.7}
            disabled={pasoActual === 0 || procesando}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.progresoPuntos}>
            {TUTORIAL_PASOS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.puntoProgreso,
                  index === pasoActual && styles.puntoProgresoActivo,
                  index < pasoActual && styles.puntoProgresoCompletado,
                ]}
              />
            ))}
          </View>

          <View style={{ width: 40 }} />
        </View>

        <View style={styles.contenidoPrincipal}>
          <View style={styles.bloqueTituloPaso}>
            <Text style={styles.textoTituloPaso}>Paso {paso.numero}</Text>
            <Text style={styles.textoSubtituloPaso}>{paso.titulo}</Text>
          </View>

          <View style={styles.imagenPasoContainer}>
            <Image
              source={paso.imagen}
              style={styles.imagenPaso}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity
            style={styles.botonSiguiente}
            onPress={avanzar}
            activeOpacity={0.8}
            disabled={procesando}
          >
            <LinearGradient
              colors={["#FFD166", "#FFC400"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.botonSiguienteGradient}
            >
              <Text style={styles.botonSiguienteTexto}>
                {pasoActual === TUTORIAL_PASOS.length - 1
                  ? "Ver demostración"
                  : "Siguiente"}
              </Text>
              <Ionicons name="arrow-forward" size={28} color="#1A365D" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bloqueBuhoDialogo}>
          <View style={styles.buhoEsquinaPasos}>
            <Animated.View style={{ transform: [{ translateY: floteBuho }] }}>
              <Image
                source={require("../assets/images/buho_saludando.png")}
                style={styles.buhoEsquinaImg}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.globoDialogo,
              { transform: [{ translateY: floteNube }] },
            ]}
          >
            <View style={styles.globoPunta} />
            <Text
              style={styles.globoTexto}
              adjustsFontSizeToFit
              numberOfLines={3}
            >
              {paso.descripcion}
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================================
// ESTILOS (LOS MISMOS QUE TENÍAS)
// ============================================================
const styles = StyleSheet.create({
  fondo: { flex: 1 },

  contenidoIntro: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "space-between",
  },
  bloqueTitulo: {
    alignItems: "center",
  },
  textoTitulo: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: width * 0.095,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bloqueBuhoIntro: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flex: 1.5,
    width: "100%",
    marginTop: 10,
    marginBottom: -150,
    marginLeft: -65,
    marginRight: 0,
  },
  buhoIntro: {
    width: width * 0.9,
    height: width * 0.9,
    marginTop: 60,
  },
  globoIntro: {
    position: "absolute",
    top: 50,
    right: -10,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 40,
    maxWidth: width * 0.55,
    shadowColor: "#1A365D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  globoIntroPunta: {
    position: "absolute",
    bottom: -12,
    left: 25,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(255,255,255,0.95)",
  },
  globoIntroTexto: {
    fontFamily: "Baloo2_700Bold",
    fontSize: width * 0.05,
    color: "#1A365D",
    textAlign: "center",
    lineHeight: width * 0.06,
  },
  botonComenzar: {
    width: "100%",
    borderRadius: 50,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#1A365D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    marginBottom: 20,
  },
  botonComenzarGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderWidth: 3,
    borderColor: "#1A3C5E",
    borderRadius: 50,
  },
  botonComenzarTexto: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: width * 0.065,
    color: "#1A365D",
  },

  contenido: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    zIndex: 20,
  },
  botonAtras: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  botonAtrasDisabled: {
    opacity: 0.3,
  },
  progresoPuntos: {
    flexDirection: "row",
    gap: 10,
  },
  puntoProgreso: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  puntoProgresoActivo: {
    backgroundColor: "#FFD166",
    width: 32,
  },
  puntoProgresoCompletado: {
    backgroundColor: "#4CAF7A",
  },

  burbuja: { position: "absolute", borderRadius: 999 },
  burbuja1: {
    width: 100,
    height: 100,
    top: 40,
    right: -25,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  burbuja2: {
    width: 70,
    height: 70,
    bottom: 80,
    left: -20,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  contenidoPrincipal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  bloqueTituloPaso: {
    alignItems: "center",
    marginBottom: 6,
  },
  textoTituloPaso: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: width * 0.095,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  textoSubtituloPaso: {
    fontFamily: "Baloo2_700Bold",
    fontSize: width * 0.055,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },

  imagenPasoContainer: {
    width: width * 0.72,
    height: width * 0.72,
    marginBottom: 6,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#1A365D",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
  },
  imagenPaso: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  botonSiguiente: {
    width: width * 0.7,
    borderRadius: 50,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#1A365D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
  },
  botonSiguienteGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderWidth: 3,
    borderColor: "#1A3C5E",
    borderRadius: 50,
  },
  botonSiguienteTexto: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: width * 0.055,
    color: "#1A365D",
  },

  buhoEsquinaPasos: {
    position: "absolute",
    bottom: 0,
    left: -70,
    width: 300,
    height: 300,
    zIndex: 5,
    pointerEvents: "none",
  },
  buhoEsquinaFinal: {
    position: "absolute",
    bottom: 35,
    left: -55,
    width: 300,
    height: 300,
    zIndex: 5,
    pointerEvents: "none",
  },
  buhoEsquinaImg: {
    width: "100%",
    height: "100%",
  },

  bloqueBuhoDialogo: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    width: "100%",
    paddingLeft: 0,
    position: "relative",
  },

  globoDialogo: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginLeft: 130,
    marginBottom: 150,
    maxWidth: width * 0.55,
    shadowColor: "#1A365D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
    position: "relative",
  },
  globoPunta: {
    position: "absolute",
    left: -14,
    bottom: 20,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 16,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "rgba(255,255,255,0.95)",
  },
  globoTexto: {
    fontFamily: "Baloo2_700Bold",
    fontSize: width * 0.04,
    color: "#1A365D",
    textAlign: "center",
    lineHeight: width * 0.05,
  },

  demoHeader: {
    position: "absolute",
    top: 60,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  demoHeaderTitulo: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: width * 0.095,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  demoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tarjetaDemo: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    width: "100%",
    elevation: 8,
    shadowColor: "#1A365D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    zIndex: 10,
  },
  demoSubtitulo: {
    fontFamily: "Baloo2_700Bold",
    fontSize: width * 0.045,
    color: "#1A365D",
    textAlign: "center",
    lineHeight: width * 0.06,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  demoBotones: {
    flexDirection: "row",
    width: "100%",
    gap: 20,
    justifyContent: "center",
  },
  botonSi: {
    flex: 1,
    maxWidth: 160,
    aspectRatio: 1,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#1A365D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
  },
  botonSiGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1A3C5E",
    borderRadius: 28,
  },
  botonSiTexto: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 24,
    color: "#FFFFFF",
  },
  botonNo: {
    flex: 1,
    maxWidth: 160,
    aspectRatio: 1,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#1A365D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
  },
  botonNoGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1A3C5E",
    borderRadius: 28,
  },
  botonNoTexto: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 24,
    color: "#FFFFFF",
  },

  estrellaRegada: {
    position: "absolute",
    zIndex: 1,
    opacity: 0.35,
  },
});