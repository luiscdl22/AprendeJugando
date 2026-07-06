import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAudioPlayer } from "expo-audio";
import {
  useFonts,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from "@expo-google-fonts/baloo-2";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFlote } from "../hooks/useFlote";
import { usePulso } from "../hooks/usePulso";

const { width } = Dimensions.get("window");

// ✅ Variable para controlar que solo suene UNA VEZ al iniciar la app
let audioBienvenidaReproducido = false;

export default function HomeScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const escalaBoton = useRef(new Animated.Value(1)).current;

  const audioBienvenida = useAudioPlayer(
    require("../assets/sounds/bienvenida.mp3"),
  );

  const flote1 = useFlote(10, 2600, 0);
  const flote2 = useFlote(14, 3200, 300);
  const flote3 = useFlote(8, 2200, 600);
  const flote4 = useFlote(16, 3600, 150);
  const floteBuho = useFlote(7, 2400, 0);
  const pulsoBoton = usePulso(1.06, 700);

  const entradaEstrella = useRef(new Animated.Value(0)).current;
  const entradaTitulo = useRef(new Animated.Value(0)).current;
  const entradaBuho = useRef(new Animated.Value(0)).current;
  const entradaBoton = useRef(new Animated.Value(0)).current;

  // ✅ Reproducir audio SOLO al montar la pantalla (cuando se abre la app)
  useEffect(() => {
    // Animaciones de entrada
    Animated.stagger(150, [
      Animated.spring(entradaEstrella, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(entradaTitulo, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(entradaBuho, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(entradaBoton, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // ✅ SOLO reproducir si NO se ha reproducido antes en esta sesión
    if (!audioBienvenidaReproducido && audioBienvenida) {
      const timer = setTimeout(async () => {
        try {
          await audioBienvenida.seekTo(0);
          await audioBienvenida.play();
          audioBienvenidaReproducido = true;
        } catch (error) {
          console.log("Audio de bienvenida no disponible");
        }
      }, 600);

      return () => {
        clearTimeout(timer);
        if (audioBienvenida) {
          try {
            audioBienvenida.pause();
          } catch (e) {}
        }
      };
    }

    // ✅ Si ya se reprodujo, solo limpiamos al desmontar
    return () => {
      if (audioBienvenida) {
        try {
          audioBienvenida.pause();
        } catch (e) {}
      }
    };
  }, []);

  // ✅ Detener audio cuando la pantalla pierde foco (navegación)
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      if (audioBienvenida) {
        try {
          audioBienvenida.pause();
        } catch (e) {}
      }
    });

    return unsubscribe;
  }, [navigation, audioBienvenida]);

  if (!fontsLoaded) {
    return <View style={styles.fondo} />;
  }

  const presionarBoton = () => {
    Animated.spring(escalaBoton, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const soltarBoton = () => {
    Animated.spring(escalaBoton, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handleJugar = async () => {
    // ✅ Detener audio ANTES de navegar
    if (audioBienvenida) {
      try {
        await audioBienvenida.pause();
        await audioBienvenida.seekTo(0);
      } catch (e) {}
    }

    try {
      const perfilGuardado = await AsyncStorage.getItem("perfil");
      navigation.navigate(perfilGuardado ? "Menu" : "Bienvenida");
    } catch (e) {
      navigation.navigate("Bienvenida");
    }
  };

  return (
    <LinearGradient
      colors={["#6C3FCF", "#4A6FD4", "#E8F4FD"]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.fondo}
    >
      <StatusBar style="light" />

      <Animated.View
        style={[
          styles.circulo,
          styles.circulo1,
          { transform: [{ translateY: flote1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.circulo,
          styles.circulo2,
          { transform: [{ translateY: flote2 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.circulo,
          styles.circulo3,
          { transform: [{ translateY: flote3 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.circulo,
          styles.circulo4,
          { transform: [{ translateY: flote4 }] },
        ]}
      />

      <SafeAreaView style={styles.contenido}>
        <View style={styles.bloqueSuperior}>
          <Animated.View
            style={{
              opacity: entradaEstrella,
              transform: [{ scale: entradaEstrella }],
            }}
          >
            <Image
              source={require("../assets/images/estrella.png")}
              style={styles.estrellaImg}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.Text
            style={[
              styles.titulo,
              {
                opacity: entradaTitulo,
                transform: [
                  {
                    translateY: entradaTitulo.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            Aprende con Siluetas
          </Animated.Text>
        </View>

        <View style={styles.escenarioBuho}>
          <View style={styles.plataforma} />
          <Animated.View
            style={{
              opacity: entradaBuho,
              transform: [
                {
                  scale: entradaBuho.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
          >
            <Animated.View style={{ transform: [{ translateY: floteBuho }] }}>
              <Image
                source={require("../assets/images/mascota.png")}
                style={styles.buhoImg}
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
                {
                  translateY: entradaBoton.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.ayuda}>
            <Ionicons name="hand-left" size={18} color="#1A3C5E" />
            <Text style={styles.ayudaTexto}>Toca el botón para empezar</Text>
          </View>

          <Animated.View
            style={{ transform: [{ scale: pulsoBoton }], width: "100%" }}
          >
            <TouchableOpacity
              style={styles.botonContenedor}
              activeOpacity={1}
              onPressIn={presionarBoton}
              onPressOut={soltarBoton}
              onPress={handleJugar}
            >
              <Animated.View
                style={[styles.boton, { transform: [{ scale: escalaBoton }] }]}
              >
                <Text style={styles.textoBoton}>JUGAR</Text>
                <Ionicons name="arrow-forward" size={28} color="#FFFFFF" />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 30,
  },

  circulo: { position: "absolute", borderRadius: 999 },
  circulo1: {
    width: 110,
    height: 110,
    top: 60,
    left: -20,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  circulo2: {
    width: 70,
    height: 70,
    top: 130,
    right: -10,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  circulo3: {
    width: 60,
    height: 60,
    top: width * 0.6,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  circulo4: {
    width: 130,
    height: 130,
    bottom: 160,
    right: -30,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  bloqueSuperior: { alignItems: "center", marginTop: 10 },
  estrellaImg: { width: 70, height: 70 },
  titulo: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 34,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 42,
    marginTop: 8,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },

  escenarioBuho: {
    alignItems: "center",
    justifyContent: "flex-end",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },

  buhoImg: { width: 350, height: 350 },

  bloqueInferior: {
    alignItems: "center",
    width: "100%",
  },
  ayuda: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  ayudaTexto: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 15,
    color: "#1A3C5E",
  },
  botonContenedor: { width: "100%" },
  boton: {
    backgroundColor: "#FFC400",
    paddingVertical: 18,
    width: "100%",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    borderWidth: 4,
    borderColor: "#1A3C5E",
    shadowColor: "#1A3C5E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 8,
  },
  textoBoton: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 24,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
