import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useFonts, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';

/**
 * CustomButton — botón global de la app.
 *
 * Props:
 *   label      (string)   — texto del botón
 *   onPress    (func)     — acción al presionar
 *   variant    (string)   — 'primary' | 'secondary' | 'danger'
 *   fullWidth  (bool)     — ocupa el ancho completo del contenedor
 *   disabled   (bool)     — desactiva el botón
 *   style      (object)   — estilos adicionales opcionales
 *
 * Variantes:
 *   primary   = amarillo  #FFC400  (acción principal, ej: JUGAR, CONTINUAR)
 *   secondary = blanco    #FFFFFF  (acción secundaria, ej: Regresar, Volver)
 *   danger    = rojo      #F47C7C  (acción destructiva, ej: Cambiar jugador)
 */

const VARIANTES = {
  primary: {
    backgroundColor: '#FFD24A',
    borderColor: '#1A3C5E',
    textColor: '#1A3C5E',
  },
  secondary: {
    backgroundColor: '#FFFDF7',
    borderColor: '#1A3C5E',
    textColor: '#1A3C5E',
  },
  danger: {
    backgroundColor: '#F47C7C',
    borderColor: '#D45A5A',
    textColor: '#FFFFFF',
  },
};

export default function CustomButton({
  label,
  onPress,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  style,
}) {
  const [fontsLoaded] = useFonts({ Baloo2_800ExtraBold });
  if (!fontsLoaded) return null;

  const v = VARIANTES[variant] ?? VARIANTES.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
      style={[
        styles.base,
        { backgroundColor: v.backgroundColor, borderColor: v.borderColor },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, { color: v.textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 0,
    transform: [{ translateY: 0 }],
  },
  fullWidth: {
    width: '100%',
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 17,
    letterSpacing: 0.5,
    textTransform: 'none',
  },
});