import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Easing,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GameCard from '../components/GameCard';
import { useStars } from '../context/StarContext';

const { width } = Dimensions.get('window');

const theme = {
  gradTop: '#6C3FCF',
  gradMid: '#4A6FD4',
  gradBot: '#E8F4FD',
  cardAdivina: '#8B5CF6',
  text: '#1A365D',
  glassBorder: 'rgba(255,255,255,0.35)',
};

const AVATARES = [
  { id: 1, imagen: require('../assets/images/avatar1.png') },
  { id: 2, imagen: require('../assets/images/avatar2.png') },
  { id: 3, imagen: require('../assets/images/avatar3.png') },
  { id: 4, imagen: require('../assets/images/avatar4.png') },
  { id: 5, imagen: require('../assets/images/avatar5.png') },
];

const CATEGORIAS = [
  {
    id: 'animales',
    titulo: 'Animales',
    subtitulo: 'Siluetas que se descubren',
    color: '#8B5CF6',
    icono: require('../assets/images/cat_animales.png'),
    descripcion: 'Adivina la silueta y aprende un dato al acertar.',
    actividad: 'Adivina la Silueta',
    ruta: 'Animales',
  },
  {
    id: 'vehiculos',
    titulo: 'Vehículos',
    subtitulo: 'Piezas y forma',
    color: '#4FC3D5',
    icono: require('../assets/images/cat_transportes.png'),
    descripcion: 'Une partes como ruedas, cabina y carga.',
    actividad: 'Rompecabezas por capas',
    ruta: 'CategoriaDetalle',
    categoria: {
      titulo: 'Vehículos',
      subtitulo: 'Rompecabezas por capas',
      color: '#4FC3D5',
      icono: require('../assets/images/cat_transportes.png'),
      videoSource: null,
      resumen: 'Descubre partes del vehículo limpiando la capa oculta.',
      detalle: 'Arrastra las piezas al lugar correcto y mira cómo cobra vida.',
      accion: 'Abrir actividad',
      modo: 'capas',
    },
  },
  {
    id: 'dinosaurios',
    titulo: 'Dinosaurios',
    subtitulo: 'Huella y tamaño',
    color: '#88CC88',
    icono: require('../assets/images/cat_utiles.png'),
    descripcion: 'Completa la silueta y revela al dinosaurio.',
    actividad: 'Completa la forma',
    ruta: 'CategoriaDetalle',
    categoria: {
      titulo: 'Dinosaurios',
      subtitulo: 'Completa la forma',
      color: '#88CC88',
      icono: require('../assets/images/cat_utiles.png'),
      videoSource: null,
      resumen: 'Une capas y piezas para completar el dinosaurio.',
      detalle: 'Cada pieza rescata una parte diferente de la figura.',
      accion: 'Abrir actividad',
      modo: 'completar',
    },
  },
  {
    id: 'espacio',
    titulo: 'Espacio',
    subtitulo: 'Capa de nubes',
    color: '#FF9F43',
    icono: require('../assets/images/cat_frutas.png'),
    descripcion: 'Descubre planetas, estrellas y cohetes.',
    actividad: 'Explora por capas',
    ruta: 'CategoriaDetalle',
    categoria: {
      titulo: 'Espacio',
      subtitulo: 'Explora por capas',
      color: '#FF9F43',
      icono: require('../assets/images/cat_frutas.png'),
      videoSource: null,
      resumen: 'Quita nubes o polvo espacial para encontrar las piezas.',
      detalle: 'Cuando juntes todo, la figura espacial se ilumina.',
      accion: 'Abrir actividad',
      modo: 'explorar',
    },
  },
];

const ESTRELLAS_POR_NIVEL = 5;

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

  return valor.interpolate({ inputRange: [0, 1], outputRange: [0, -distancia] });
}

export default function MenuScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const [perfil, setPerfil] = useState(null);
  const { estrellas } = useStars();

  const entradaHeader = useRef(new Animated.Value(0)).current;
  const entradaCards = useRef(new Animated.Value(0)).current;
  const entradaTexto = useRef(new Animated.Value(0)).current;

  const flote1 = useFlote(12, 2800, 0);
  const flote2 = useFlote(18, 3400, 200);
  const flote3 = useFlote(10, 2600, 400);

  useEffect(() => {
    const cargar = async () => {
      try {
        const p = await AsyncStorage.getItem('perfil');
        if (p) setPerfil(JSON.parse(p));
      } catch (_) {}
    };

    cargar();
    const unsubscribe = navigation.addListener('focus', cargar);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    Animated.stagger(160, [
      Animated.spring(entradaHeader, { toValue: 1, friction: 7, useNativeDriver: true }),
      Animated.spring(entradaCards, { toValue: 1, friction: 7, useNativeDriver: true }),
      Animated.spring(entradaTexto, { toValue: 1, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [entradaCards, entradaHeader, entradaTexto]);

  if (!fontsLoaded) return null;

  const totalEstrellas = Object.values(estrellas).reduce((sum, value) => sum + value, 0);
  const nivel = Math.floor(totalEstrellas / ESTRELLAS_POR_NIVEL) + 1;
  const progreso = totalEstrellas % ESTRELLAS_POR_NIVEL;
  const porcentajeBarra = progreso / ESTRELLAS_POR_NIVEL;

  const avatarImg = perfil
    ? AVATARES.find((a) => a.id === perfil.avatarSeleccionado)?.imagen
    : null;

  const abrirCategoria = (categoria) => {
    if (categoria.id === 'animales') {
      navigation.navigate(categoria.ruta);
      return;
    }

    navigation.navigate('CategoriaDetalle', { categoria: categoria.categoria });
  };

  return (
    <LinearGradient
      colors={[theme.gradTop, theme.gradMid, theme.gradBot]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.fondo}
    >
      <StatusBar style="light" />

      <Animated.View style={[styles.burbuja, styles.burbuja1, { transform: [{ translateY: flote1 }] }]} />
      <Animated.View style={[styles.burbuja, styles.burbuja2, { transform: [{ translateY: flote2 }] }]} />
      <Animated.View style={[styles.burbuja, styles.burbuja3, { transform: [{ translateY: flote3 }] }]} />

      <SafeAreaView style={styles.contenido}>
        <View style={styles.filaPerfil}>
          <TouchableOpacity
            style={styles.botonMiPerfil}
            onPress={() => navigation.navigate('Perfil')}
            activeOpacity={0.85}
          >
            <View style={styles.miniAvatar}>
              <Image
                source={avatarImg ?? require('../assets/images/mascota.png')}
                style={styles.miniAvatarImg}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.textoMiPerfil}>Mi perfil</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Animated.View
            style={[
              styles.panelPerfil,
              {
                opacity: entradaHeader,
                transform: [{ translateY: entradaHeader.interpolate({ inputRange: [0, 1], outputRange: [-22, 0] }) }],
              },
            ]}
          >
            <View style={styles.filaAvatar}>
              <View style={styles.circuloAvatar}>
                <Image
                  source={avatarImg ?? require('../assets/images/mascota.png')}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.bloqueNombre}>
                <Text style={styles.saludo}>¡Hola de nuevo!</Text>
                <Text style={styles.nombreJugador}>{perfil?.nombre ?? 'Explorador'}</Text>
              </View>

              <View style={styles.badgeEstrellas}>
                <Image
                  source={require('../assets/images/estrella.png')}
                  style={styles.estrellaIcono}
                  resizeMode="contain"
                />
                <Text style={styles.badgeNum}>{totalEstrellas}</Text>
                <Text style={styles.badgeLabel}>ESTRELLAS</Text>
              </View>
            </View>

            <View style={styles.filaNivel}>
              <Text style={styles.textoNivel}>Nivel {nivel}</Text>
              <Text style={styles.textoFaltante}>{progreso}/{ESTRELLAS_POR_NIVEL} para el siguiente</Text>
            </View>
            <View style={styles.barraFondo}>
              <LinearGradient
                colors={['#FFD166', '#FF9F43']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.barraRelleno, { width: `${Math.max(porcentajeBarra * 100, 4)}%` }]}
              />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.bloqueSimple,
              {
                opacity: entradaTexto,
                transform: [{ translateY: entradaTexto.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
              },
            ]}
          >
            <Text style={styles.tituloSimple}>Lee, mira y juega sin prisa.</Text>
            <Text style={styles.textoSimple}>
              Cada categoría abre una pantalla estable para que el niño pueda observar, entender y avanzar con calma.
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              { opacity: entradaCards, transform: [{ translateY: entradaCards.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] },
            ]}
          >
            <View style={styles.filaSeccion}>
              <Text style={styles.tituloSeccion}>Categorías y actividades</Text>
              <TouchableOpacity
                style={styles.botonComoJugar}
                onPress={() => navigation.navigate('ComoJugar')}
                activeOpacity={0.8}
              >
                <Text style={styles.textoComoJugar}>¿Cómo jugar?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.gridCategorias}>
              {CATEGORIAS.map((categoria) => (
                <View key={categoria.id} style={styles.cardCategoriaWrap}>
                  <GameCard
                    titulo={categoria.titulo}
                    subtipo={categoria.subtitulo}
                    icono={categoria.icono}
                    color={categoria.color}
                    onPress={() => abrirCategoria(categoria)}
                  />
                  <Text style={styles.textoActividad}>{categoria.actividad}</Text>
                </View>
              ))}
            </View>

            <View style={styles.bloqueResumenActividad}>
              <View style={styles.fichaActividad}>
                <Text style={styles.valorActividad}>4</Text>
                <Text style={styles.etiquetaActividad}>mundos</Text>
              </View>
              <View style={styles.fichaActividad}>
                <Text style={styles.valorActividad}>4</Text>
                <Text style={styles.etiquetaActividad}>actividades</Text>
              </View>
              <View style={styles.fichaActividad}>
                <Text style={styles.valorActividad}>Variar</Text>
                <Text style={styles.etiquetaActividad}>cada tema</Text>
              </View>
            </View>
          </Animated.View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },

  burbuja: { position: 'absolute', borderRadius: 999 },
  burbuja1: { width: 120, height: 120, top: 40, left: -40, backgroundColor: 'rgba(255,255,255,0.10)' },
  burbuja2: { width: 80, height: 80, top: 180, right: -20, backgroundColor: 'rgba(255,255,255,0.08)' },
  burbuja3: { width: 60, height: 60, bottom: 200, left: 20, backgroundColor: 'rgba(255,255,255,0.07)' },

  filaPerfil: {
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  botonMiPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: theme.glassBorder,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1.5,
    borderColor: '#FFD166',
  },
  miniAvatarImg: { width: '100%', height: '100%' },
  textoMiPerfil: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  panelPerfil: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    padding: 18,
    marginBottom: 16,
  },
  filaAvatar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  circuloAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatarImg: { width: '100%', height: '100%' },
  bloqueNombre: { flex: 1 },
  saludo: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  nombreJugador: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  badgeEstrellas: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 72,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  estrellaIcono: { width: 28, height: 28 },
  badgeNum: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 20,
    color: theme.text,
    lineHeight: 24,
  },
  badgeLabel: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 9,
    color: theme.text,
    letterSpacing: 0.5,
  },

  filaNivel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  textoNivel: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  textoFaltante: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  barraFondo: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    borderRadius: 10,
    minWidth: 14,
  },

  bloqueSimple: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  tituloSimple: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: theme.text,
    marginBottom: 4,
  },
  textoSimple: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },

  filaSeccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tituloSeccion: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 20,
    color: theme.text,
  },
  botonComoJugar: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 50,
    paddingVertical: 7,
    paddingHorizontal: 14,
    elevation: 2,
  },
  textoComoJugar: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: theme.text,
  },
  cardUnicaWrap: {
    marginBottom: 12,
  },
  gridCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  cardCategoriaWrap: {
    width: '48%',
  },
  textoActividad: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.95,
  },
  bloqueResumenActividad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  fichaActividad: {
    flexGrow: 1,
    flexBasis: 96,
    minWidth: 96,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  valorActividad: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 22,
    color: '#FFFFFF',
    lineHeight: 26,
  },
  etiquetaActividad: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 16,
  },
});