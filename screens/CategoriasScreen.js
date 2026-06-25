import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
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

const CATEGORIAS = [
  { id: 'animales',    nombre: 'Animales',        color: '#F47C7C', colorBorde: '#D45A5A', icono: require('../assets/images/cat_animales.png') },
  { id: 'frutas',      nombre: 'Frutas',           color: '#FFB347', colorBorde: '#E0903A', icono: require('../assets/images/cat_frutas.png') },
  { id: 'transportes', nombre: 'Transportes',      color: '#4FC3D5', colorBorde: '#3AA8BA', icono: require('../assets/images/cat_transportes.png') },
  { id: 'utiles',      nombre: 'Utiles Escolares', color: '#88CC88', colorBorde: '#6AAE6A', icono: require('../assets/images/cat_utiles.png') },
];

function useFlote(distancia, duracion, delay = 0) {
  const valor = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(valor, { toValue: 1, duration: duracion, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(valor, { toValue: 0, duration: duracion, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return valor.interpolate({ inputRange: [0, 1], outputRange: [0, -distancia] });
}

export default function CategoriasScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const [perfil, setPerfil] = useState(null);
  const flote1 = useFlote(10, 2600, 0);
  const flote2 = useFlote(14, 3200, 300);
  const flote3 = useFlote(8,  2800, 500);
  const floteMascota = useFlote(6, 2400, 0);

  useEffect(() => {
    const cargar = async () => {
      try {
        const p = await AsyncStorage.getItem('perfil');
        if (p) setPerfil(JSON.parse(p));
      } catch (e) {}
    };
    cargar();
  }, []);

  if (!fontsLoaded) return null;

  const elegirCategoria = (categoria) => {
    // navigation.navigate('Juego', { categoria: categoria.id });
  };

  return (
    <LinearGradient
      colors={['#E8F4FD', '#C5E3F7', '#A8D4F0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.fondo}
    >
      <StatusBar style="dark" />

      {/* Círculos animados — misma lógica, colores ajustados */}
      <Animated.View style={[styles.circulo, styles.circulo1, { transform: [{ translateY: flote1 }] }]} />
      <Animated.View style={[styles.circulo, styles.circulo2, { transform: [{ translateY: flote2 }] }]} />
      <Animated.View style={[styles.circulo, styles.circulo3, { transform: [{ translateY: flote3 }] }]} />

      <SafeAreaView style={styles.contenido}>
        {/* Header: regresar + botón perfil */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.botonRegresar} onPress={() => navigation.goBack()}>
            <Text style={styles.textoRegresar}>← Regresar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonPerfil}
            onPress={() => navigation.navigate('Perfil')}
            activeOpacity={0.8}
          >
            {perfil && AVATARES.find(a => a.id === perfil.avatarSeleccionado) ? (
              <Image
                source={AVATARES.find(a => a.id === perfil.avatarSeleccionado).imagen}
                style={styles.avatarPequeno}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.iconoPerfil}>👤</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.titulo}>Elige una categoría</Text>

        <View style={styles.grid}>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.tarjeta, { backgroundColor: cat.color, borderColor: cat.colorBorde }]}
              activeOpacity={0.85}
              onPress={() => elegirCategoria(cat)}
            >
              <View style={styles.circuloIcono}>
                <Image source={cat.icono} style={styles.icono} resizeMode="contain" />
              </View>
              <Text style={styles.nombreCategoria}>{cat.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bloqueMascota}>
          <Animated.View style={{ transform: [{ translateY: floteMascota }] }}>
            <Image
              source={require('../assets/images/mascota.png')}
              style={styles.mascotaImg}
              resizeMode="contain"
            />
          </Animated.View>
          <View style={styles.globo}>
            <Text style={styles.textoGlobo}>¡Escoge una categoría para comenzar!</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  botonRegresar: {
    backgroundColor: '#FFC400',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#1A3C5E',
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 0,
    elevation: 4,
  },
  textoRegresar: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 15,
    color: '#1A3C5E',
  },
  botonPerfil: {
    width: 50, height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFC400',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  avatarPequeno: { width: '100%', height: '100%' },
  iconoPerfil: { fontSize: 24 },

  titulo: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 28,
    color: '#1A3C5E',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },

  // Círculos — mismas posiciones, colores celeste/coral/verde
  circulo: { position: 'absolute', borderRadius: 999 },
  circulo1: { width: 90, height: 90, top: 80,    left: -25,  backgroundColor: 'rgba(255,107,107,0.22)' },
  circulo2: { width: 65, height: 65, top: 160,   right: -15, backgroundColor: 'rgba(255,196,0,0.26)'   },
  circulo3: { width: 80, height: 80, bottom: 90, right: -20, backgroundColor: 'rgba(76,175,80,0.22)'   },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tarjeta: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#00000033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
  },
  circuloIcono: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  icono: { width: 62, height: 62 },
  nombreCategoria: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  bloqueMascota: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
  },
  mascotaImg: { width: 170, height: 170 },
  globo: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#2E6B9E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginLeft: 10,
    maxWidth: 155,
  },
  textoGlobo: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 15,
    color: '#1A3C5E',
    textAlign: 'center',
    lineHeight: 22,
  },
});