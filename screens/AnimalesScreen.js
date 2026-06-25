import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';

const { width } = Dimensions.get('window');

const TODOS_LOS_ANIMALES = [
  {
    id: 1,
    nombre: 'Gato',
    silueta: require('../assets/images/gato silueta.png'),
    color: require('../assets/images/gato color.png'),
    pista: 'Le encanta dormir y ronronear',
    distractores: ['Perro', 'Conejo'],
  },
  {
    id: 2,
    nombre: 'Perro',
    silueta: require('../assets/images/perro silueta.png'),
    color: require('../assets/images/perro color.png'),
    pista: 'Es el mejor amigo del humano',
    distractores: ['Lobo', 'Gato'],
  },
  {
    id: 3,
    nombre: 'León',
    silueta: require('../assets/images/leon silueta.png'),
    color: require('../assets/images/leon color.png'),
    pista: 'Es el rey de la selva',
    distractores: ['Tigre', 'Leopardo'],
  },
  {
    id: 4,
    nombre: 'Cocodrilo',
    silueta: require('../assets/images/cocodrilo silueta.png'),
    color: require('../assets/images/cocodrilo color.png'),
    pista: 'Tiene dientes muy afilados y vive en el agua',
    distractores: ['Lagarto', 'Iguana'],
  },
  {
    id: 5,
    nombre: 'Jirafa',
    silueta: require('../assets/images/jirafa silueta.png'),
    color: require('../assets/images/jirafa color.png'),
    pista: 'Tiene el cuello más largo de todos',
    distractores: ['Camello', 'Caballo'],
  },
  {
    id: 6,
    nombre: 'Vaca',
    silueta: require('../assets/images/vaca silueta.png'),
    color: require('../assets/images/vaca color.png'),
    pista: 'Nos da leche y vive en el campo',
    distractores: ['Toro', 'Cabra'],
  },
];

function mezclar(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generarRondas() {
  const seleccionados = mezclar(TODOS_LOS_ANIMALES).slice(0, 3);
  return seleccionados.map(animal => ({
    ...animal,
    opciones: mezclar([animal.nombre, ...animal.distractores]),
  }));
}

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

export default function AnimalesScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const [rondas, setRondas] = useState(() => generarRondas());
  const [rondaActual, setRondaActual] = useState(0);
  const [estrellas, setEstrellas] = useState(0);
  const [respondido, setRespondido] = useState(null);
  const [opcionElegida, setOpcionElegida] = useState(null);
  const [terminado, setTerminado] = useState(false);
  const [mostrarColor, setMostrarColor] = useState(false);

  const escalaEstrella = useRef(new Animated.Value(1)).current;
  const escalaImagen = useRef(new Animated.Value(1)).current;
  const opacidadImagen = useRef(new Animated.Value(1)).current;
  const flotarImagen = useFlote(7, 2400, 0);

  if (!fontsLoaded) return null;

  const ronda = rondas[rondaActual];

  const animarEstrella = () => {
    Animated.sequence([
      Animated.spring(escalaEstrella, { toValue: 1.5, useNativeDriver: true, speed: 40 }),
      Animated.spring(escalaEstrella, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
  };

  const animarCambioImagen = (callback) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacidadImagen, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(escalaImagen, { toValue: 0.85, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => {
      callback();
      Animated.parallel([
        Animated.timing(opacidadImagen, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(escalaImagen, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    });
  };

  const elegir = (opcion) => {
    if (respondido) return;
    setOpcionElegida(opcion);
    const correcto = opcion === ronda.nombre;
    setRespondido(correcto ? 'correcto' : 'incorrecto');
    animarCambioImagen(() => setMostrarColor(true));

    if (correcto) {
      animarEstrella();
      setEstrellas(e => e + 1);
    }

    setTimeout(() => {
      if (rondaActual + 1 >= rondas.length) {
        setTerminado(true);
      } else {
        setRondaActual(r => r + 1);
        setRespondido(null);
        setOpcionElegida(null);
        setMostrarColor(false);
      }
    }, 1400);
  };

  const reiniciar = () => {
    setRondas(generarRondas());
    setRondaActual(0);
    setEstrellas(0);
    setRespondido(null);
    setOpcionElegida(null);
    setTerminado(false);
    setMostrarColor(false);
  };

  const colorOpcion = (opcion) => {
    if (!respondido || opcionElegida !== opcion) return 'rgba(255,255,255,0.75)';
    return respondido === 'correcto' ? '#88CC88' : '#F47C7C';
  };

  const borderOpcion = (opcion) => {
    if (!respondido || opcionElegida !== opcion) return 'rgba(26,60,94,0.2)';
    return respondido === 'correcto' ? '#4AAE4A' : '#D45A5A';
  };

  // ── Pantalla final ──
  if (terminado) {
    return (
      <LinearGradient
        colors={['#E8F4FD', '#C5E3F7', '#A8D4F0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.fondo}
      >
        <StatusBar style="dark" />
        <SafeAreaView style={styles.contenidoFin}>
          <View style={styles.cuerpoFin}>
            <Text style={styles.emojiGrande}>
              {estrellas === 3 ? '🏆' : estrellas >= 2 ? '😄' : '💪'}
            </Text>
            <Text style={styles.tituloFin}>
              {estrellas === 3 ? '¡Perfecto!' : estrellas >= 2 ? '¡Muy bien!' : '¡Sigue practicando!'}
            </Text>
            <Text style={styles.subtituloFin}>Conseguiste {estrellas} de 3 estrellas</Text>
            <View style={styles.filaEstrellasFin}>
              {[0, 1, 2].map(i => (
                <Text key={i} style={{ fontSize: 44 }}>{i < estrellas ? '⭐' : '☆'}</Text>
              ))}
            </View>
            <TouchableOpacity style={styles.botonFin} onPress={reiniciar}>
              <Text style={styles.textoBotonFin}>🔄 Jugar de nuevo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.botonFin, styles.botonSalir]} onPress={() => navigation.goBack()}>
              <Text style={[styles.textoBotonFin, { color: '#1A3C5E' }]}>← Volver</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Pantalla de juego ──
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.botonRegresar} onPress={() => navigation.goBack()}>
            <Text style={styles.textoRegresar}>← Regresar</Text>
          </TouchableOpacity>
          <Animated.View style={[styles.badgeEstrella, { transform: [{ scale: escalaEstrella }] }]}>
            <Text style={styles.badgeIcon}>⭐</Text>
            <Text style={styles.badgeNum}>{estrellas}</Text>
          </Animated.View>
        </View>

        {/* Título + progreso */}
        <Text style={styles.titulo}>🐾 Animales</Text>
        <View style={styles.progresoPuntos}>
          {rondas.map((_, i) => (
            <View
              key={i}
              style={[
                styles.punto,
                i === rondaActual && styles.puntoActivo,
                i < rondaActual && styles.puntoHecho,
              ]}
            />
          ))}
        </View>
        <Text style={styles.textoRonda}>Ronda {rondaActual + 1} de {rondas.length}</Text>

        {/* Tarjeta silueta — estilo igual a tarjetas de categorías */}
        <View style={styles.tarjetaSilueta}>
          <View style={styles.circuloImagen}>
            <Animated.View style={{
              transform: [
                { translateY: flotarImagen },
                { scale: escalaImagen },
              ],
              opacity: opacidadImagen,
            }}>
              <Image
                source={mostrarColor ? ronda.color : ronda.silueta}
                style={styles.silueta}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
          <Text style={styles.textoPista}>📍 {ronda.pista}</Text>
        </View>

        {/* Pregunta */}
        <Text style={styles.pregunta}>¿Cuál es este animal? 🔍</Text>

        {/* Opciones */}
        <View style={styles.opciones}>
          {ronda.opciones.map((op, i) => (
            <TouchableOpacity
              key={op}
              style={[
                styles.botonOpcion,
                { backgroundColor: colorOpcion(op), borderColor: borderOpcion(op) },
              ]}
              onPress={() => elegir(op)}
              activeOpacity={0.8}
              disabled={!!respondido}
            >
              <Text style={styles.numeroOpcion}>{i + 1}.</Text>
              <Text style={styles.textoOpcion}>{op}</Text>
              {respondido && opcionElegida === op && (
                <Text style={styles.iconoRespuesta}>
                  {respondido === 'correcto' ? '✓' : '✗'}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  contenidoFin: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },

  // Header
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
  badgeEstrella: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC400',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 3,
    borderColor: '#1A3C5E',
    gap: 6,
    elevation: 4,
  },
  badgeIcon: { fontSize: 18 },
  badgeNum: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#1A3C5E',
  },

  // Título
  titulo: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 26,
    color: '#1A3C5E',
    textAlign: 'center',
    marginBottom: 10,
  },

  // Progreso
  progresoPuntos: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 4,
  },
  punto: {
    width: 28, height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(26,60,94,0.15)',
  },
  puntoActivo: {
    backgroundColor: '#1A3C5E',
    width: 36,
  },
  puntoHecho: {
    backgroundColor: '#FFC400',
  },
  textoRonda: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: '#2E6B9E',
    textAlign: 'center',
    marginBottom: 10,
  },

  // Tarjeta 
  tarjetaSilueta: {
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#1A3C5E',
    backgroundColor: '#204972',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  // Círculo interior 
  circuloImagen: {
    width: width * 0.58,
    height: width * 0.58,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  silueta: {
    width: width * 0.72,
    height: width * 0.52,
    
  },
    
  textoPista: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Pregunta
  pregunta: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 19,
    color: '#1A3C5E',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Opciones 
  opciones: { gap: 10 },
  botonOpcion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 3,
    gap: 12,
  },
  numeroOpcion: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 17,
    color: '#1A3C5E',
    width: 24,
  },
  textoOpcion: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 17,
    color: '#1A3C5E',
    flex: 1,
  },
  iconoRespuesta: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A3C5E',
  },

  // Pantalla final
  cuerpoFin: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  emojiGrande: { fontSize: 72 },
  tituloFin: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 30,
    color: '#1A3C5E',
    textAlign: 'center',
  },
  subtituloFin: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 17,
    color: '#2E6B9E',
    textAlign: 'center',
  },
  filaEstrellasFin: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  botonFin: {
    backgroundColor: '#FFC400',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1A3C5E',
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    elevation: 6,
  },
  botonSalir: {
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  textoBotonFin: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#1A3C5E',
  },
  
});