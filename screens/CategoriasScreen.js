import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';

import GameCard from '../components/GameCard';
import CustomButton from '../components/CustomButton';

const CATEGORIAS = [
  {
    id: 'animales',
    titulo: 'Animales',
    subtitulo: 'Siluetas y datos breves',
    color: '#8B5CF6',
    icono: require('../assets/images/cat_animales.png'),
    videoSource: null,
    resumen: 'Reconoce animales por su forma y aprende un dato por cada acierto.',
    detalle: 'Ideal para practicar observación, memoria visual y lectura guiada.',
    accion: 'Jugar siluetas',
    ruta: 'Animales',
  },
  {
    id: 'frutas',
    titulo: 'Frutas',
    subtitulo: 'Colores y nombres',
    color: '#FF9F43',
    icono: require('../assets/images/cat_frutas.png'),
    videoSource: null,
    resumen: 'Aprende nombres, colores y hábitos saludables con tarjetas claras.',
    detalle: 'Aquí podrás añadir un video corto con ejemplos visuales.',
    accion: 'Ver detalle',
    ruta: null,
  },
  {
    id: 'transportes',
    titulo: 'Transportes',
    subtitulo: 'Lo que se mueve',
    color: '#4FC3D5',
    icono: require('../assets/images/cat_transportes.png'),
    videoSource: null,
    resumen: 'Observa vehículos y comprende para qué sirve cada uno.',
    detalle: 'La pantalla está lista para explicar con video e imagen.',
    accion: 'Ver detalle',
    ruta: null,
  },
  {
    id: 'utiles',
    titulo: 'Útiles',
    subtitulo: 'Material escolar',
    color: '#88CC88',
    icono: require('../assets/images/cat_utiles.png'),
    videoSource: null,
    resumen: 'Relaciona objetos del aula con su uso cotidiano.',
    detalle: 'Perfecto para lectura corta y observación guiada.',
    accion: 'Ver detalle',
    ruta: null,
  },
];

export default function CategoriasScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });

  const categorias = useMemo(() => CATEGORIAS, []);

  if (!fontsLoaded) return null;

  const abrirCategoria = (categoria) => {
    navigation.navigate('CategoriaDetalle', { categoria });
  };

  return (
    <LinearGradient colors={['#6C3FCF', '#4A6FD4', '#E8F4FD']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.fondo}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.contenido}>
        <View style={styles.encabezado}>
          <Text style={styles.titulo}>Categorías</Text>
          <Text style={styles.subtitulo}>Elige una tarjeta para leer con calma y luego jugar.</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.grid}>
            {categorias.map((categoria) => (
              <View key={categoria.id} style={styles.cardWrap}>
                <GameCard
                  titulo={categoria.titulo}
                  subtipo={categoria.subtitulo}
                  icono={categoria.icono}
                  color={categoria.color}
                  onPress={() => abrirCategoria(categoria)}
                />
              </View>
            ))}
          </View>

          <View style={styles.bloqueInfo}>
            <Text style={styles.bloqueTitulo}>Cómo funciona</Text>
            <Text style={styles.bloqueTexto}>Cada categoría abre una pantalla con información fija, espacio para video y un botón para jugar o seguir explorando.</Text>
          </View>

          <CustomButton label="Volver al menú" onPress={() => navigation.goBack()} variant="secondary" fullWidth style={{ marginTop: 6 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  encabezado: { marginBottom: 14 },
  titulo: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 34, color: '#1A3C5E', textAlign: 'center' },
  subtitulo: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: 'rgba(26,60,94,0.82)', textAlign: 'center', marginTop: 4 },
  scroll: { paddingBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  cardWrap: { width: '48%' },
  bloqueInfo: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(26,60,94,0.12)',
    marginBottom: 12,
  },
  bloqueTitulo: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 18, color: '#1A3C5E', marginBottom: 4 },
  bloqueTexto: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: '#1A3C5E', lineHeight: 20 },
});