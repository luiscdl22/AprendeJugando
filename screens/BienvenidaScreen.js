import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
  Animated,
  Easing,
  ActivityIndicator,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../components/CustomButton";

const { width, height } = Dimensions.get("window");

const AVATARES = [
  {
    id: 1,
    imagen: require("../assets/images/avatar1.png"),
    nombre: "Valiente",
  },
  { id: 2, imagen: require("../assets/images/avatar2.png"), nombre: "Alegre" },
  {
    id: 3,
    imagen: require("../assets/images/avatar3.png"),
    nombre: "Creativo",
  },
  {
    id: 4,
    imagen: require("../assets/images/avatar4.png"),
    nombre: "Explorador",
  },
  {
    id: 5,
    imagen: require("../assets/images/avatar5.png"),
    nombre: "Amigable",
  },
];

const TOTAL_PASOS = 3;

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
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [delay, duracion, valor]);
  return valor.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -distancia],
  });
}

export default function BienvenidaScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const [paso, setPaso] = useState(1);
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(null);
  const [navegando, setNavegando] = useState(false);
  const [cargando, setCargando] = useState(false);

  const floteBuho = useFlote(6, 2400, 0);
  const floteBurbuja1 = useFlote(12, 2800, 0);
  const floteBurbuja2 = useFlote(16, 3400, 200);
  const floteNube = useFlote(4, 3000, 300);

  const audioInicio = useAudioPlayer(
    require("../assets/sounds/registro_inicio.mp3"),
  );
  const audioEdad = useAudioPlayer(
    require("../assets/sounds/registro_edad.mp3"),
  );
  const audioAvatar = useAudioPlayer(
    require("../assets/sounds/registro_avatar.mp3"),
  );
  const audioListo = useAudioPlayer(
    require("../assets/sounds/registro_listo.mp3"),
  );

  useEffect(() => {
    const reproducirAudioPaso = async () => {
      let audio = null;
      if (paso === 1) audio = audioInicio;
      else if (paso === 2) audio = audioEdad;
      else if (paso === 3) audio = audioAvatar;

      if (audio) {
        try {
          await audio.seekTo(0);
          await audio.play();
        } catch (error) {
          console.log("Audio no disponible");
        }
      }
    };

    const timer = setTimeout(() => {
      reproducirAudioPaso();
    }, 400);

    return () => {
      clearTimeout(timer);
      if (audioInicio)
        try {
          audioInicio.pause();
        } catch (e) {}
      if (audioEdad)
        try {
          audioEdad.pause();
        } catch (e) {}
      if (audioAvatar)
        try {
          audioAvatar.pause();
        } catch (e) {}
    };
  }, [paso]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      if (audioInicio)
        try {
          audioInicio.pause();
        } catch (e) {}
      if (audioEdad)
        try {
          audioEdad.pause();
        } catch (e) {}
      if (audioAvatar)
        try {
          audioAvatar.pause();
        } catch (e) {}
      if (audioListo)
        try {
          audioListo.pause();
        } catch (e) {}
    });

    return unsubscribe;
  }, [navigation]);

  const campoValido = () => {
    if (paso === 1) return nombre.trim().length > 0;
    if (paso === 2) return edad.length > 0;
    if (paso === 3) return avatarSeleccionado !== null;
    return false;
  };

  const continuar = async () => {
    if (!campoValido() || navegando || cargando) return;
    Keyboard.dismiss();

    if (paso === 1 && audioInicio)
      try {
        audioInicio.pause();
      } catch (e) {}
    if (paso === 2 && audioEdad)
      try {
        audioEdad.pause();
      } catch (e) {}
    if (paso === 3 && audioAvatar)
      try {
        audioAvatar.pause();
      } catch (e) {}

    if (paso < TOTAL_PASOS) {
      setPaso(paso + 1);
    } else {
      setCargando(true);

      try {
        if (audioListo) {
          await audioListo.seekTo(0);
          await audioListo.play();

          await new Promise((resolve) => {
            const checkEnd = () => {
              if (audioListo.playing === false) {
                resolve();
              } else {
                setTimeout(checkEnd, 100);
              }
            };
            checkEnd();
          });
        }
      } catch (_) {}

      await AsyncStorage.setItem(
        "perfil",
        JSON.stringify({ nombre: nombre.trim(), edad, avatarSeleccionado }),
      );

      setCargando(false);
      navigation.navigate("Menu");
    }
  };

  const regresar = () => {
    if (navegando || cargando) return;

    if (audioInicio)
      try {
        audioInicio.pause();
      } catch (e) {}
    if (audioEdad)
      try {
        audioEdad.pause();
      } catch (e) {}
    if (audioAvatar)
      try {
        audioAvatar.pause();
      } catch (e) {}
    if (audioListo)
      try {
        audioListo.pause();
      } catch (e) {}

    if (paso === 1) navigation.goBack();
    else setPaso(paso - 1);
  };

  const mensajePaso = () => {
    if (paso === 1)
      return "Antes de empezar, quisiera conocerte. ¿Me puedes decir tu nombre?";
    if (paso === 2) return "Genial. ¿Y cuántos años tienes?";
    if (paso === 3) return "Muy bien. Por último, elige un personaje.";
  };

  const tituloPaso = () => {
    if (paso === 1) return "Escribe tu nombre";
    if (paso === 2) return "¿Cuántos años tienes?";
    if (paso === 3) return "Elige tu personaje";
  };

  if (!fontsLoaded) return null;

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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={regresar}
              style={styles.botonRegresar}
              disabled={navegando || cargando}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              <Text style={styles.textoRegresar}>Regresar</Text>
            </TouchableOpacity>
            <View style={styles.barraPuntos}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[styles.punto, paso >= i && styles.puntoActivo]}
                />
              ))}
            </View>
          </View>

          <View style={styles.contenidoPrincipal}>
            {/* Título del paso */}
            <View style={styles.bloqueTituloPaso}>
              <Text style={styles.textoTituloPaso}>{tituloPaso()}</Text>
            </View>

            {/* Card con contenido */}
            <View style={styles.card}>
              {paso === 1 && (
                <TextInput
                  style={styles.input}
                  placeholder="Escribe tu nombre..."
                  placeholderTextColor="#A0B4C8"
                  value={nombre}
                  onChangeText={setNombre}
                  maxLength={20}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={continuar}
                  editable={!navegando && !cargando}
                />
              )}

              {paso === 2 && (
                <View style={styles.gridEdades}>
                  {["5", "6", "7", "8", "9", "10"].map((e) => (
                    <TouchableOpacity
                      key={e}
                      onPress={() => setEdad(e)}
                      style={[
                        styles.btnEdad,
                        edad === e && styles.btnEdadSeleccionado,
                      ]}
                      activeOpacity={0.8}
                      disabled={navegando || cargando}
                    >
                      <Text
                        style={[
                          styles.textoEdad,
                          edad === e && styles.textoEdadSeleccionado,
                        ]}
                      >
                        {e}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {paso === 3 && (
                <View style={styles.gridAvatares}>
                  {AVATARES.map((av) => (
                    <TouchableOpacity
                      key={av.id}
                      onPress={() => setAvatarSeleccionado(av.id)}
                      style={[
                        styles.circuloAvatar,
                        avatarSeleccionado === av.id &&
                          styles.circuloAvatarSeleccionado,
                      ]}
                      activeOpacity={0.8}
                      disabled={navegando || cargando}
                    >
                      <Image
                        source={av.imagen}
                        style={styles.imgAvatar}
                        resizeMode="cover"
                      />
                      {avatarSeleccionado === av.id && (
                        <View style={styles.seleccionAvatar}>
                          <Ionicons
                            name="checkmark-circle"
                            size={28}
                            color="#4CAF7A"
                          />
                        </View>
                      )}
                      <Text style={styles.nombreAvatar}>{av.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Botón Continuar / A Jugar con spinner */}
            {paso === TOTAL_PASOS ? (
              <TouchableOpacity
                style={[
                  styles.botonJugar,
                  (!campoValido() || cargando) && styles.botonJugarDisabled,
                ]}
                onPress={continuar}
                disabled={!campoValido() || cargando}
                activeOpacity={0.8}
              >
                {cargando ? (
                  <ActivityIndicator size="small" color="#1A365D" />
                ) : (
                  <Text style={styles.botonJugarTexto}>A Jugar</Text>
                )}
              </TouchableOpacity>
            ) : (
              <CustomButton
                label="Continuar"
                onPress={continuar}
                variant="primary"
                fullWidth
                disabled={!campoValido() || navegando || cargando}
                style={{ marginTop: 8 }}
              />
            )}
          </View>

          {/* Búho en esquina inferior + globo de diálogo */}
          <View style={styles.bloqueBuhoDialogo}>
            <Animated.View
              style={[
                styles.buhoEsquina,
                { transform: [{ translateY: floteBuho }] },
              ]}
            >
              <Image
                source={require("../assets/images/buho_saludando.png")}
                style={styles.buhoEsquinaImg}
                resizeMode="contain"
              />
            </Animated.View>

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
                {mensajePaso()}
              </Text>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },

  burbuja: { position: "absolute", borderRadius: 999 },
  burbuja1: {
    width: 80,
    height: 80,
    top: 40,
    right: -20,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  burbuja2: {
    width: 60,
    height: 60,
    bottom: 80,
    left: -15,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    zIndex: 20,
  },
  botonRegresar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    gap: 6,
  },
  textoRegresar: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  barraPuntos: {
    flexDirection: "row",
    gap: 8,
  },
  punto: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  puntoActivo: {
    backgroundColor: "#FFD166",
    width: 24,
  },

  contenidoPrincipal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  bloqueTituloPaso: {
    alignItems: "center",
    marginBottom: 8,
  },
  textoTituloPaso: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: width * 0.08,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 100,
    elevation: 4,
    shadowColor: "#1A365D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    marginBottom: 8,
  },

  input: {
    width: "100%",
    backgroundColor: "#F4F7FB",
    borderRadius: 16,
    padding: 18,
    fontSize: 20,
    fontFamily: "Baloo2_700Bold",
    color: "#1A365D",
    textAlign: "center",
  },

  gridEdades: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  btnEdad: {
    width: 76,
    height: 68,
    borderRadius: 18,
    backgroundColor: "#F4F7FB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "transparent",
    elevation: 2,
  },
  btnEdadSeleccionado: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFD166",
  },
  textoEdad: {
    fontSize: 28,
    fontFamily: "Baloo2_800ExtraBold",
    color: "#1A365D",
  },
  textoEdadSeleccionado: {
    color: "#6C3FCF",
  },

  gridAvatares: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  circuloAvatar: {
    width: (width - 140) / 3,
    height: (width - 140) / 3 + 30,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "transparent",
    backgroundColor: "#F4F7FB",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    elevation: 2,
  },
  circuloAvatarSeleccionado: {
    borderColor: "#FFD166",
    backgroundColor: "#FFF8E1",
  },
  imgAvatar: {
    width: (width - 160) / 3,
    height: (width - 160) / 3,
    borderRadius: 999,
  },
  nombreAvatar: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 10,
    color: "#1A365D",
    marginTop: 2,
    textAlign: "center",
  },
  seleccionAvatar: {
    position: "absolute",
    right: -4,
    top: -4,
  },

  // Búho en esquina + globo
  bloqueBuhoDialogo: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    width: "100%",
    paddingLeft: 0,
    position: "relative",
  },
  buhoEsquina: {
    position: "absolute",
    bottom: 0,
    left: -70,
    width: 300,
    height: 300,
    zIndex: 5,
  },
  buhoEsquinaImg: {
    width: "100%",
    height: "100%",
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

  // Botón Jugar con spinner
  botonJugar: {
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
    shadowOpacity: 0.30,
    shadowRadius: 0,
    elevation: 8,
    marginTop: 8,
  },
  botonJugarDisabled: {
    opacity: 0.5,
  },
  botonJugarTexto: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 22,
    color: "#1A365D",
  },
});