import React, { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from "@expo-google-fonts/baloo-2";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../components/CustomButton";
import StatusMark from "../components/StatusMark";

const { width } = Dimensions.get("window");

const AVATARES = [
  { id: 1, imagen: require("../assets/images/avatar1.png") },
  { id: 2, imagen: require("../assets/images/avatar2.png") },
  { id: 3, imagen: require("../assets/images/avatar3.png") },
  { id: 4, imagen: require("../assets/images/avatar4.png") },
  { id: 5, imagen: require("../assets/images/avatar5.png") },
];

const TOTAL_PASOS = 3;

export default function BienvenidaScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const [paso, setPaso] = useState(1);
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(null);

  // Validación por paso — impide avanzar si el campo está vacío
  const campoValido = () => {
    if (paso === 1) return nombre.trim().length > 0;
    if (paso === 2) return edad.length > 0;
    if (paso === 3) return avatarSeleccionado !== null;
    return false;
  };

  const continuar = async () => {
    if (!campoValido()) return;
    Keyboard.dismiss();
    if (paso < TOTAL_PASOS) {
      setPaso(paso + 1);
    } else {
      await AsyncStorage.setItem(
        "perfil",
        JSON.stringify({ nombre: nombre.trim(), edad, avatarSeleccionado })
      );
      navigation.navigate("Menu");
    }
  };

  const regresar = () => {
    if (paso === 1) navigation.goBack();
    else setPaso(paso - 1);
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
      <SafeAreaView style={styles.contenido}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header: flecha + puntos de progreso */}
          <View style={styles.header}>
            <TouchableOpacity onPress={regresar} style={styles.botonFlecha}>
              <Text style={styles.flecha}>Regresar</Text>
            </TouchableOpacity>
            <View style={styles.barraFondo}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[styles.punto, paso >= i && styles.puntoActivo]}
                />
              ))}
            </View>
          </View>

          {/* Mascota + burbuja con el subtítulo del paso */}
          <View style={styles.bloqueMascota}>
            <Image
              source={require("../assets/images/mascota.png")}
              style={styles.mascota}
              resizeMode="contain"
            />
            <View style={styles.burbuja}>
              <Text style={styles.textoBurbuja}>
                {paso === 1 && "¡Hola! ¿Cómo te llamas?"}
                {paso === 2 && `¡Mucho gusto, ${nombre}!\n¿Cuántos años tienes?`}
                {paso === 3 && "¡Elige tu personaje!"}
              </Text>
            </View>
          </View>

          {/* Card principal */}
          <View style={styles.card}>

            {/* PASO 1 — Nombre */}
            {paso === 1 && (
              <>
                <Text style={styles.titulo}>¿Cómo te llamas?</Text>
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
                />
                {/* Mensaje de validación visible solo si el campo está vacío */}
                {nombre.trim().length === 0 && (
                  <Text style={styles.avisoValidacion}>Escribe tu nombre para continuar</Text>
                )}
              </>
            )}

            {/* PASO 2 — Edad (botones táctiles, más fácil para niños) */}
            {paso === 2 && (
              <>
                <Text style={styles.titulo}>¿Cuántos años tienes?</Text>
                <View style={styles.gridEdades}>
                  {["5", "6", "7", "8", "9", "10"].map((e) => (
                    <TouchableOpacity
                      key={e}
                      onPress={() => setEdad(e)}
                      style={[styles.btnEdad, edad === e && styles.btnEdadSeleccionado]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.textoEdad, edad === e && styles.textoEdadSeleccionado]}>
                        {e}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {edad.length === 0 && (
                  <Text style={styles.avisoValidacion}>Elige tu edad para continuar</Text>
                )}
              </>
            )}

            {/* PASO 3 — Avatar */}
            {paso === 3 && (
              <>
                <Text style={styles.titulo}>Elige tu personaje</Text>
                <View style={styles.gridAvatares}>
                  {AVATARES.map((av) => (
                    <TouchableOpacity
                      key={av.id}
                      onPress={() => setAvatarSeleccionado(av.id)}
                      style={[
                        styles.circuloAvatar,
                        avatarSeleccionado === av.id && styles.circuloAvatarSeleccionado,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Image source={av.imagen} style={styles.imgAvatar} resizeMode="cover" />
                      {avatarSeleccionado === av.id && <View style={styles.seleccionAvatar}><StatusMark variant="check" size={22} /></View>}
                    </TouchableOpacity>
                  ))}
                </View>
                {avatarSeleccionado === null && (
                  <Text style={styles.avisoValidacion}>Elige un personaje para continuar</Text>
                )}
              </>
            )}

            {/* Botón principal — deshabilitado visualmente si el campo no es válido */}
            <CustomButton
              label={paso === TOTAL_PASOS ? "¡A Jugar!" : "Continuar"}
              onPress={continuar}
              variant="primary"
              fullWidth
              disabled={!campoValido()}
              style={{ marginTop: 8 }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },

  // Header con flecha y puntos de progreso
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  botonFlecha: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  flecha: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  barraFondo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  barraRelleno: { display: "none" }, // no se usa con puntos
  punto: {
    width: 14, height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  puntoActivo: {
    backgroundColor: "#FFD166",
    width: 28,
  },

  // Mascota + burbuja de diálogo
  bloqueMascota: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  mascota: { width: 100, height: 100 },
  burbuja: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 20,
    borderTopLeftRadius: 4,
    padding: 14,
    marginLeft: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  textoBurbuja: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 22,
  },

  // Card blanca principal
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 28,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#1A365D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },

  titulo: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 22,
    color: "#1A365D",
    marginBottom: 20,
    textAlign: "center",
  },

  // Input de nombre
  input: {
    width: "100%",
    backgroundColor: "#F4F7FB",
    borderRadius: 16,
    padding: 15,
    fontSize: 18,
    fontFamily: "Baloo2_700Bold",
    color: "#1A365D",
    marginBottom: 8,
  },

  // Aviso de validación — visible cuando el campo está vacío
  avisoValidacion: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 13,
    color: "#EF6C7B",
    marginBottom: 12,
    textAlign: "center",
  },

  // Grid de edades
  gridEdades: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 8,
  },
  btnEdad: {
    width: 72,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#F4F7FB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "transparent",
    elevation: 2,
    shadowColor: "#A8C2DC",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  btnEdadSeleccionado: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFD166",
  },
  textoEdad: {
    fontSize: 26,
    fontFamily: "Baloo2_800ExtraBold",
    color: "#1A365D",
  },
  textoEdadSeleccionado: {
    color: "#6C3FCF",
  },

  // Grid de avatares
  gridAvatares: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    marginBottom: 8,
  },
  circuloAvatar: {
    width: (width - 120) / 3,
    height: (width - 120) / 3,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "transparent",
    backgroundColor: "#F4F7FB",
    elevation: 3,
    shadowColor: "#A8C2DC",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  circuloAvatarSeleccionado: {
    borderColor: "#FFD166",
    backgroundColor: "#FFF8E1",
  },
  imgAvatar: { width: "100%", height: "100%", borderRadius: 999 },
  seleccionAvatar: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});