import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { useStars } from '../context/StarContext';
import CustomButton from '../components/CustomButton';
import StatusMark from '../components/StatusMark';

const { width } = Dimensions.get('window');

const NIVELES = [
  {
    id: 'gato-1',
    nombre: 'Gato',
    silueta: require('../assets/images/gato silueta.png'),
    color: require('../assets/images/gato color.png'),
    pista: 'Le encanta dormir y ronronear.',
    dato: 'Los gatos usan sus bigotes para medir espacios y orientarse.',
    opciones: ['Gato', 'Perro', 'Vaca'],
  },
  {
    id: 'perro-1',
    nombre: 'Perro',
    silueta: require('../assets/images/perro silueta.png'),
    color: require('../assets/images/perro color.png'),
    pista: 'Es el mejor amigo del humano.',
    dato: 'Los perros tienen un olfato muy fuerte y aprenden con mucha práctica.',
    opciones: ['Perro', 'León', 'Jirafa'],
  },
  {
    id: 'leon-1',
    nombre: 'León',
    silueta: require('../assets/images/leon silueta.png'),
    color: require('../assets/images/leon color.png'),
    pista: 'Es el rey de la selva.',
    dato: 'Los leones viven en grupos llamados manadas.',
    opciones: ['León', 'Cocodrilo', 'Vaca'],
  },
  {
    id: 'cocodrilo-1',
    nombre: 'Cocodrilo',
    silueta: require('../assets/images/cocodrilo silueta.png'),
    color: require('../assets/images/cocodrilo color.png'),
    pista: 'Tiene dientes muy afilados y vive en el agua.',
    dato: 'Los cocodrilos pueden quedarse muy quietos para cazar.',
    opciones: ['Cocodrilo', 'Jirafa', 'Gato'],
  },
  {
    id: 'jirafa-1',
    nombre: 'Jirafa',
    silueta: require('../assets/images/jirafa silueta.png'),
    color: require('../assets/images/jirafa color.png'),
    pista: 'Tiene el cuello más largo de todos.',
    dato: 'Las jirafas comen hojas de árboles muy altos.',
    opciones: ['Jirafa', 'Perro', 'León'],
  },
  {
    id: 'vaca-1',
    nombre: 'Vaca',
    silueta: require('../assets/images/vaca silueta.png'),
    color: require('../assets/images/vaca color.png'),
    pista: 'Nos da leche y vive en el campo.',
    dato: 'Las vacas mastican varias veces para digerir mejor la comida.',
    opciones: ['Vaca', 'Gato', 'Cocodrilo'],
  },
  {
    id: 'gato-2',
    nombre: 'Gato',
    silueta: require('../assets/images/gato silueta.png'),
    color: require('../assets/images/gato color.png'),
    pista: 'Se limpia lamiéndose el pelaje.',
    dato: 'Los gatos son muy limpios y duermen muchas horas al día.',
    opciones: ['Gato', 'Jirafa', 'Perro'],
  },
  {
    id: 'perro-2',
    nombre: 'Perro',
    silueta: require('../assets/images/perro silueta.png'),
    color: require('../assets/images/perro color.png'),
    pista: 'Puede aprender trucos y cuidar hogares.',
    dato: 'Los perros entienden gestos, voces y rutinas con facilidad.',
    opciones: ['Perro', 'Vaca', 'León'],
  },
  {
    id: 'leon-2',
    nombre: 'León',
    silueta: require('../assets/images/leon silueta.png'),
    color: require('../assets/images/leon color.png'),
    pista: 'Su rugido se escucha muy lejos.',
    dato: 'El rugido del león sirve para comunicarse y asustar a otros animales.',
    opciones: ['León', 'Gato', 'Jirafa'],
  },
  {
    id: 'jirafa-2',
    nombre: 'Jirafa',
    silueta: require('../assets/images/jirafa silueta.png'),
    color: require('../assets/images/jirafa color.png'),
    pista: 'Su lengua es muy larga para comer hojas.',
    dato: 'La lengua de la jirafa puede ayudarla a alcanzar hojas altas con facilidad.',
    opciones: ['Jirafa', 'Vaca', 'Cocodrilo'],
  },
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
  }, [delay, duracion, valor]);
  return valor.interpolate({ inputRange: [0, 1], outputRange: [0, -distancia] });
}

export default function AnimalesScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const { actualizarEstrellas } = useStars();

  const [indiceNivel, setIndiceNivel] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [respuesta, setRespuesta] = useState(null);
  const [opcionElegida, setOpcionElegida] = useState(null);
  const [mostrarColor, setMostrarColor] = useState(false);
  const [mostrarDato, setMostrarDato] = useState(false);
  const [finalizado, setFinalizado] = useState(false);

  const escalaImagen = useRef(new Animated.Value(1)).current;
  const opacidadImagen = useRef(new Animated.Value(1)).current;
  const escalaFeedback = useRef(new Animated.Value(0.92)).current;

  const flote1 = useFlote(10, 2600, 0);
  const flote2 = useFlote(14, 3200, 300);
  const flote3 = useFlote(8, 2800, 500);

  const nivel = NIVELES[indiceNivel];
  const totalNiveles = NIVELES.length;

  useEffect(() => {
    if (finalizado) {
      actualizarEstrellas('animales', puntos);
    }
  }, [actualizarEstrellas, finalizado, puntos]);

  if (!fontsLoaded) return null;

  const reiniciar = () => {
    setIndiceNivel(0);
    setPuntos(0);
    setRespuesta(null);
    setOpcionElegida(null);
    setMostrarColor(false);
    setMostrarDato(false);
    setFinalizado(false);
    opacidadImagen.setValue(1);
    escalaImagen.setValue(1);
    escalaFeedback.setValue(0.92);
  };

  const avanzarNivel = () => {
    if (indiceNivel + 1 >= totalNiveles) {
      setFinalizado(true);
      return;
    }

    setIndiceNivel((valor) => valor + 1);
    setRespuesta(null);
    setOpcionElegida(null);
    setMostrarColor(false);
    setMostrarDato(false);
    opacidadImagen.setValue(1);
    escalaImagen.setValue(1);
    escalaFeedback.setValue(0.92);
  };

  const animarCambio = (callback) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacidadImagen, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(escalaImagen, { toValue: 0.9, duration: 160, useNativeDriver: true }),
      ]),
    ]).start(() => {
      callback();
      Animated.parallel([
        Animated.timing(opacidadImagen, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(escalaImagen, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.spring(escalaFeedback, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    });
  };

  const elegir = (opcion) => {
    if (respuesta) return;

    setOpcionElegida(opcion);
    const correcto = opcion === nivel.nombre;
    setRespuesta(correcto ? 'correcto' : 'incorrecto');
    if (correcto) setPuntos((valor) => valor + 1);

    animarCambio(() => {
      setMostrarColor(true);
      setMostrarDato(true);
    });

    setTimeout(() => {
      avanzarNivel();
    }, 1600);
  };

  const estadoFinal = respuesta === 'correcto' ? 'correcto' : respuesta === 'incorrecto' ? 'incorrecto' : null;
  const mensajeFeedback = respuesta === 'correcto'
    ? 'Correcto'
    : respuesta === 'incorrecto'
      ? `Era ${nivel.nombre}`
      : '';

  if (finalizado) {
    return (
      <LinearGradient
        colors={['#6C3FCF', '#4A6FD4', '#E8F4FD']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.fondo}
      >
        <StatusBar style="light" />
        <SafeAreaView style={styles.contenidoFin}>
          <View style={styles.cuerpoFin}>
            <Text style={styles.tituloFin}>¡Muy bien!</Text>
            <Text style={styles.subtituloFin}>Terminaste los {totalNiveles} niveles de animales.</Text>
            <Text style={styles.subtituloFin}>Ganaste {puntos} estrellas.</Text>

            <View style={styles.filaEstrellasFin}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <Image
                  key={i}
                  source={require('../assets/images/estrella.png')}
                  style={[styles.estrellaFin, i >= puntos && styles.estrellaFinVacia]}
                  resizeMode="contain"
                />
              ))}
            </View>

            <CustomButton label="Jugar otra vez" onPress={reiniciar} variant="primary" fullWidth />
            <CustomButton label="Volver al menú" onPress={() => navigation.goBack()} variant="secondary" fullWidth style={{ marginTop: 8 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#6C3FCF', '#4A6FD4', '#E8F4FD']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.fondo}
    >
      <StatusBar style="light" />

      <Animated.View style={[styles.burbuja, styles.burbuja1, { transform: [{ translateY: flote1 }] }]} />
      <Animated.View style={[styles.burbuja, styles.burbuja2, { transform: [{ translateY: flote2 }] }]} />
      <Animated.View style={[styles.burbuja, styles.burbuja3, { transform: [{ translateY: flote3 }] }]} />

      <SafeAreaView style={styles.contenido}>
        <View style={styles.header}>
          <CustomButton label="Regresar" onPress={() => navigation.goBack()} variant="secondary" />
          <View style={styles.progresoCabecera}>
            <Text style={styles.progresoTexto}>Nivel {indiceNivel + 1}/{totalNiveles}</Text>
            <Text style={styles.progresoTexto}>Estrellas {puntos}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.bloqueIntro}>
            <Image source={require('../assets/images/mascota.png')} style={styles.introImg} resizeMode="contain" />
            <View style={styles.globoIntro}>
              <Text style={styles.textoIntro}>Mira la silueta, elige la respuesta correcta y gana una estrella.</Text>
            </View>
          </View>

          <Text style={styles.titulo}>Adivina la Silueta</Text>
          <Text style={styles.subtitulo}>Una actividad simple para observar, responder y aprender.</Text>

          <View style={styles.tarjetaSilueta}>
            <View style={styles.circuloImagen}>
              <Animated.View style={{
                transform: [{ scale: escalaImagen }],
                opacity: opacidadImagen,
              }}>
                <Image
                  source={mostrarColor ? nivel.color : nivel.silueta}
                  style={styles.silueta}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
            <Text style={styles.textoPista}>Pista: {nivel.pista}</Text>
          </View>

          {mostrarDato && (
            <Animated.View style={[styles.feedback, estadoFinal === 'correcto' ? styles.feedbackCorrecto : styles.feedbackIncorrecto, { transform: [{ scale: escalaFeedback }] }]}>
              <View style={styles.filaFeedback}>
                {estadoFinal === 'correcto' ? <StatusMark variant="check" size={24} /> : <View style={styles.mensajeIncorrecto}><Text style={styles.textoMensajeIncorrecto}>!</Text></View>}
                <Text style={styles.tituloFeedback}>{mensajeFeedback}</Text>
              </View>
              <Text style={styles.textoFeedback}>{nivel.dato}</Text>
            </Animated.View>
          )}

          <Text style={styles.pregunta}>¿Cuál animal es?</Text>

          <View style={styles.opciones}>
            {nivel.opciones.map((opcion) => {
              const seleccionada = opcionElegida === opcion;
              const colorBase = !respuesta || !seleccionada ? 'rgba(255,255,255,0.75)' : (respuesta === 'correcto' ? '#88CC88' : '#F47C7C');
              const bordeBase = !respuesta || !seleccionada ? 'rgba(26,60,94,0.2)' : (respuesta === 'correcto' ? '#4AAE4A' : '#D45A5A');

              return (
                <TouchableOpacity
                  key={opcion}
                  style={[styles.botonOpcion, { backgroundColor: colorBase, borderColor: bordeBase }]}
                  onPress={() => elegir(opcion)}
                  activeOpacity={0.84}
                  disabled={!!respuesta}
                >
                  <Text style={styles.textoOpcion}>{opcion}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1, paddingTop: 10 },
  contenidoFin: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },

  burbuja: { position: 'absolute', borderRadius: 999 },
  burbuja1: { width: 120, height: 120, top: 40, left: -40, backgroundColor: 'rgba(255,255,255,0.10)' },
  burbuja2: { width: 80, height: 80, top: 180, right: -20, backgroundColor: 'rgba(255,255,255,0.08)' },
  burbuja3: { width: 60, height: 60, bottom: 200, left: 20, backgroundColor: 'rgba(255,255,255,0.07)' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  progresoCabecera: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    alignItems: 'center',
  },
  progresoTexto: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  bloqueIntro: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 14,
  },
  introImg: { width: 90, height: 90 },
  globoIntro: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    borderTopLeftRadius: 4,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  textoIntro: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  titulo: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitulo: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    marginBottom: 14,
  },
  tarjetaSilueta: {
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#1A3C5E',
    backgroundColor: '#204972',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
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
  feedback: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  feedbackCorrecto: {
    backgroundColor: 'rgba(136,204,136,0.95)',
    borderColor: '#4AAE4A',
  },
  feedbackIncorrecto: {
    backgroundColor: 'rgba(244,124,124,0.95)',
    borderColor: '#D45A5A',
  },
  filaFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  tituloFeedback: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#1A3C5E',
  },
  textoFeedback: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 14,
    color: '#1A3C5E',
    lineHeight: 20,
  },
  mensajeIncorrecto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A3C5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoMensajeIncorrecto: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  pregunta: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 19,
    color: '#1A3C5E',
    textAlign: 'center',
    marginBottom: 8,
  },
  opciones: { gap: 10 },
  botonOpcion: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 3,
  },
  textoOpcion: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 17,
    color: '#1A3C5E',
    textAlign: 'center',
  },
  cuerpoFin: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  tituloFin: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 30,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtituloFin: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  filaEstrellasFin: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 8,
    maxWidth: 240,
  },
  estrellaFin: {
    width: 28,
    height: 28,
  },
  estrellaFinVacia: {
    tintColor: 'rgba(255,255,255,0.35)',
  },
});
