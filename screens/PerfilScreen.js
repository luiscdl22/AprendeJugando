import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATARES = [
  { id: 1, imagen: require('../assets/images/avatar1.png') },
  { id: 2, imagen: require('../assets/images/avatar2.png') },
  { id: 3, imagen: require('../assets/images/avatar3.png') },
  { id: 4, imagen: require('../assets/images/avatar4.png') },
  { id: 5, imagen: require('../assets/images/avatar5.png') },
];

const CATEGORIAS_INFO = [
  { id: 'animales',    nombre: 'Animales',        color: '#F47C7C', icono: require('../assets/images/cat_animales.png') },
  { id: 'frutas',      nombre: 'Frutas',           color: '#FFB347', icono: require('../assets/images/cat_frutas.png') },
  { id: 'transportes', nombre: 'Transportes',      color: '#4FC3D5', icono: require('../assets/images/cat_transportes.png') },
  { id: 'utiles',      nombre: 'Útiles Escolares', color: '#88CC88', icono: require('../assets/images/cat_utiles.png') },
];

export default function PerfilScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const [perfil, setPerfil] = useState(null);
  const [estrellas, setEstrellas] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const perfilGuardado = await AsyncStorage.getItem('perfil');
      const estrellasGuardadas = await AsyncStorage.getItem('estrellas');
      if (perfilGuardado) setPerfil(JSON.parse(perfilGuardado));
      if (estrellasGuardadas) setEstrellas(JSON.parse(estrellasGuardadas));
    } catch (e) {}
  };

  const avatarImg = perfil
    ? AVATARES.find((a) => a.id === perfil.avatarSeleccionado)?.imagen
    : null;

  const totalEstrellas = Object.values(estrellas).reduce((sum, v) => sum + v, 0);

  if (!fontsLoaded || !perfil) return null;

  return (
    <LinearGradient
      colors={['#E8F4FD', '#C5E3F7', '#A8D4F0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.fondo}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.contenido}>

        {/* Header */}
        <TouchableOpacity style={styles.botonRegresar} onPress={() => navigation.goBack()}>
          <Text style={styles.textoRegresar}>← Regresar</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Tarjeta principal del perfil */}
          <View style={styles.tarjetaPerfil}>
            <View style={styles.circuloAvatarGrande}>
              {avatarImg && (
                <Image source={avatarImg} style={styles.avatarImg} resizeMode="cover" />
              )}
            </View>

            <Text style={styles.nombreTexto}>{perfil.nombre}</Text>
            <Text style={styles.edadTexto}>{perfil.edad} años</Text>

            <View style={styles.filaTotalEstrellas}>
              <Text style={styles.estrella}>⭐</Text>
              <Text style={styles.totalEstrellasTexto}>{totalEstrellas} estrellas en total</Text>
            </View>

            <TouchableOpacity
              style={styles.botonCambiarAvatar}
              onPress={() => navigation.navigate('CambiarAvatar')}
              activeOpacity={0.8}
            >
              <Text style={styles.botonCambiarAvatarTexto}>🎨 Cambiar personaje</Text>
            </TouchableOpacity>
          </View>

          {/* Estrellas por categoría */}
          <Text style={styles.subtituloSeccion}>Mis categorías</Text>

          {CATEGORIAS_INFO.map((cat) => {
            const estrellascat = estrellas[cat.id] || 0;
            return (
              <View key={cat.id} style={[styles.filaCat, { borderLeftColor: cat.color }]}>
                <View style={[styles.iconoCatCirculo, { backgroundColor: cat.color }]}>
                  <Image source={cat.icono} style={styles.iconoCat} resizeMode="contain" />
                </View>
                <Text style={styles.nombreCat}>{cat.nombre}</Text>
                <View style={styles.estrellasFilaDerecha}>
                  {[...Array(3)].map((_, i) => (
                    <Text key={i} style={{ fontSize: 20, opacity: i < estrellascat ? 1 : 0.2 }}>⭐</Text>
                  ))}
                </View>
              </View>
            );
          })}

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },

  botonRegresar: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFC400',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#1A3C5E',
    elevation: 4,
    marginBottom: 16,
  },
  textoRegresar: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 15,
    color: '#1A3C5E',
  },

  scroll: { paddingBottom: 20 },

  // Tarjeta perfil
  tarjetaPerfil: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'rgba(26,60,94,0.15)',
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
  },
  circuloAvatarGrande: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: '#FFC400',
    overflow: 'hidden',
    marginBottom: 14,
    elevation: 6,
  },
  avatarImg: { width: '100%', height: '100%' },

  nombreTexto: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 30,
    color: '#1A3C5E',
  },
  edadTexto: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 16,
    color: '#2E6B9E',
    marginTop: 2,
    marginBottom: 12,
  },
  filaTotalEstrellas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,196,0,0.18)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  estrella: { fontSize: 22 },
  totalEstrellasTexto: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 16,
    color: '#1A3C5E',
  },

  botonCambiarAvatar: {
    backgroundColor: '#FFC400',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#1A3C5E',
    elevation: 4,
  },
  botonCambiarAvatarTexto: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 15,
    color: '#1A3C5E',
  },

  // Categorías
  subtituloSeccion: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 22,
    color: '#1A3C5E',
    marginBottom: 12,
  },
  filaCat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 18,
    borderLeftWidth: 6,
    padding: 12,
    marginBottom: 10,
    elevation: 3,
    gap: 12,
  },
  iconoCatCirculo: {
    width: 46, height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoCat: { width: 30, height: 30 },
  nombreCat: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 16,
    color: '#1A3C5E',
    flex: 1,
  },
  estrellasFilaDerecha: {
    flexDirection: 'row',
    gap: 2,
  },
});