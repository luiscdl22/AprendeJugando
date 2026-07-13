import React from "react";
import { TouchableOpacity, Text, View, Image, StyleSheet } from "react-native";
import {
  useFonts,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from "@expo-google-fonts/baloo-2";

const theme = {
  cardLockedBg: "#D6E4F0", 
  cardLockedShadow: "#A8C2DC", 
  lockIcon: "#FFD166",
  textActive: "#FFFFFF",
  textLocked: "rgba(26,54,93,0.55)",
};

/**
 * GameCard — tarjeta de actividad DRY.
 *
 * Props:
 *   titulo      (string)  — nombre de la actividad
 *   subtipo     (string)  — etiqueta inferior
 *   icono       (any)     — require() del ícono
 *   color       (string)  — color de fondo activo
 *   onPress     (func)    — acción al presionar
 *   pendiente   (bool)    — bloqueada
 *   horizontal  (bool)    — layout
 */
export default function GameCard({
  titulo,
  subtipo,
  icono,
  color,
  onPress,
  pendiente = false,
  horizontal = false,
}) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  if (!fontsLoaded) return null;

  const bgColor = pendiente ? theme.cardLockedBg : color;
  const shadowColor = pendiente
    ? theme.cardLockedShadow
    : theme.cardActiveShadow;

  return (
    <TouchableOpacity
      style={[
        styles.tarjeta,
        horizontal ? styles.tarjetaHorizontal : styles.tarjetaVertical,
        { backgroundColor: bgColor, shadowColor },
      ]}
      onPress={pendiente ? null : onPress}
      activeOpacity={pendiente ? 1 : 0.88}
    >
      <View style={[styles.circuloIcono, horizontal && styles.circuloIconoH]}>
        {pendiente ? (
          <Text style={styles.candado}>Bloqueado</Text>
        ) : (
          <Image source={icono} style={styles.icono} resizeMode="contain" />
        )}
      </View>

      {/* Bloque de texto */}
      <View style={[styles.textos, horizontal && styles.textosH]}>
        <Text
          style={[
            styles.titulo,
            horizontal && styles.tituloH,
            pendiente && styles.tituloBloqueado,
          ]}
        >
          {titulo}
        </Text>
        {pendiente && <Text style={styles.proximamente}>Próximamente</Text>}
      </View>

      {/* Etiqueta de subtipo */}
      <View
        style={[
          styles.etiqueta,
          horizontal && styles.etiquetaH,
          pendiente && styles.etiquetaBloqueada,
        ]}
      >
        <Text
          style={[
            styles.etiquetaTexto,
            pendiente && styles.etiquetaTextoBloqueado,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {subtipo}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Tarjeta base 
  tarjeta: {
    borderRadius: 28,
    borderWidth: 0,
    padding: 16,
    elevation: 5,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  tarjetaVertical: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 155,
  },
  tarjetaHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 88,
  },

  // Círculo de ícono 
  circuloIcono: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.30)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  circuloIconoH: {
    marginBottom: 0,
    width: 58,
    height: 58,
    flexShrink: 0,
  },
  icono: { width: 68, height: 68 },
  candado: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 11,
    color: theme.lockIcon,
    textAlign: "center",
    paddingHorizontal: 6,
  },

  textos: { alignItems: "center", flex: 1 },
  textosH: { alignItems: "flex-start" },

  titulo: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 16,
    color: theme.textActive,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tituloH: { fontSize: 18, textAlign: "left" },
  tituloBloqueado: { color: theme.textLocked },

  proximamente: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 12,
    color: "rgba(26,54,93,0.45)",
    marginTop: 2,
  },

  etiqueta: {
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 6,
    alignItems: "center",
  },
  etiquetaH: { marginTop: 0, alignSelf: "center" },
  etiquetaBloqueada: { backgroundColor: "rgba(26,54,93,0.10)" },
  etiquetaTexto: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 12,
    color: theme.textActive,
    textAlign: "center",
  },
  etiquetaTextoBloqueado: { color: theme.textLocked },
});
