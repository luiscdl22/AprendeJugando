import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet, Text, View, Image, Animated, Easing,
  Dimensions, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { useStars } from '../context/StarContext';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

const NATURALEZA = [
  {
    id: 'arbol',
    nombre: 'Árbol',
    articulo: 'el',
    silueta: require('../assets/images/Naturaleza/arbol silueta.png'),
    color: require('../assets/images/Naturaleza/arbol color.png'),
    dato: 'Los árboles producen el oxígeno que respiramos.',
    pista: 'Tiene tronco, ramas y hojas.',
  },
  {
    id: 'cactus',
    nombre: 'Cactus',
    articulo: 'el',
    silueta: require('../assets/images/Naturaleza/cactus silueta.png'),
    color: require('../assets/images/Naturaleza/cactus color.png'),
    dato: 'El cactus guarda agua dentro de su tronco para sobrevivir sin lluvia.',
    pista: 'Vive en el desierto y tiene espinas.',
  },
  {
    id: 'estrella',
    nombre: 'Estrella',
    articulo: 'la',
    silueta: require('../assets/images/Naturaleza/estrella silueta.png'),
    color: require('../assets/images/Naturaleza/estrella color.png'),
    dato: 'Las estrellas son enormes bolas de gas que producen luz y calor.',
    pista: 'Brilla en el cielo por la noche.',
  },
  {
    id: 'flor',
    nombre: 'Flor',
    articulo: 'la',
    silueta: require('../assets/images/Naturaleza/flor silueta.png'),
    color: require('../assets/images/Naturaleza/flor color.png'),
    dato: 'Las flores atraen a las abejas para ayudar a crear más plantas.',
    pista: 'Tiene pétalos y un aroma agradable.',
  },
  {
    id: 'luna',
    nombre: 'Luna',
    articulo: 'la',
    silueta: require('../assets/images/Naturaleza/luna silueta.png'),
    color: require('../assets/images/Naturaleza/luna color.png'),
    dato: 'La Luna tarda unos 27 días en dar una vuelta completa a la Tierra.',
    pista: 'Aparece en el cielo de noche y cambia de forma.',
  },
  {
    id: 'montana',
    nombre: 'Montaña',
    articulo: 'la',
    silueta: require('../assets/images/Naturaleza/montaña silueta.png'),
    color: require('../assets/images/Naturaleza/montaña color.png'),
    dato: 'El Everest es la montaña más alta del mundo con casi 9,000 metros.',
    pista: 'Es muy alta y tiene nieve en la cima.',
  },
  {
    id: 'hoja',
    nombre: 'Hoja',
    articulo: 'la',
    silueta: require('../assets/images/Naturaleza/hoja silueta.png'),
    color: require('../assets/images/Naturaleza/hoja color.png'),
    dato: 'Las hojas convierten la luz solar en alimento para la planta.',
    pista: 'Crece en las ramas y capta la luz del sol.',
  },
  {
    id: 'sol',
    nombre: 'Sol',
    articulo: 'el',
    silueta: require('../assets/images/Naturaleza/sol silueta.png'),
    color: require('../assets/images/Naturaleza/sol color.png'),
    dato: 'El Sol es una estrella gigante a 150 millones de km de la Tierra.',
    pista: 'Nos da luz y calor durante el día.',
  },
  {
    id: 'piedra',
    nombre: 'Piedra',
    articulo: 'la',
    silueta: require('../assets/images/Naturaleza/piedra silueta.png'),
    color: require('../assets/images/Naturaleza/piedra color.png'),
    dato: 'Las piedras se forman durante millones de años bajo tierra o en volcanes.',
    pista: 'Es dura, no se mueve sola y la puedes encontrar en el suelo.',
  },
  {
    id: 'nube',
    nombre: 'Nube',
    articulo: 'la',
    silueta: require('../assets/images/Naturaleza/nube silueta.png'),
    color: require('../assets/images/Naturaleza/nube color.png'),
    dato: 'Las nubes están hechas de gotitas de agua tan pequeñas que flotan en el aire.',
    pista: 'Flota en el cielo y puede traer lluvia.',
  },
];

const TIPOS = ['nombre', 'sino', 'silueta'];

function mezclar(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function otrosAleatorios(todos, excluirId, cantidad) {
  return mezclar(todos.filter(a => a.id !== excluirId)).slice(0, cantidad);
}

function generarNiveles() {
  const seleccionados = mezclar(NATURALEZA).slice(0, NATURALEZA.length);
  return seleccionados.map((elemento, i) => {
    const tipo = TIPOS[i % TIPOS.length === 0 && i > 0
      ? Math.floor(Math.random() * TIPOS.length)
      : i % TIPOS.length];
    const otros = otrosAleatorios(NATURALEZA, elemento.id, 2);

    if (tipo === 'nombre') {
      return {
        tipo, elemento, dato: elemento.dato,
        opciones: mezclar([elemento.nombre, ...otros.map(o => o.nombre)]),
        respuestaCorrecta: elemento.nombre,
      };
    }
    if (tipo === 'sino') {
      const esVerdadero = Math.random() > 0.5;
      const nombreMostrado = esVerdadero ? elemento.nombre : otros[0].nombre;
      return {
        tipo, elemento, dato: elemento.dato, nombreMostrado,
        respuestaCorrecta: esVerdadero ? 'Sí' : 'No',
        opciones: ['Sí', 'No'],
      };
    }
    const opcionesNaturaleza = mezclar([elemento, ...otros]);
    return {
      tipo, elemento, dato: elemento.dato,
      opcionesNaturaleza,
      respuestaCorrecta: elemento.id,
    };
  });
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
  }, [delay, duracion, valor]);
  return valor.interpolate({ inputRange: [0, 1], outputRange: [0, -distancia] });
}

export default function NaturalezaScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const { actualizarEstrellas } = useStars();

  const [niveles, setNiveles] = useState(() => generarNiveles());
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

  const nivel = niveles[indiceNivel];
  const totalNiveles = niveles.length;

  useEffect(() => {
    if (finalizado) actualizarEstrellas('naturaleza', puntos);
  }, [actualizarEstrellas, finalizado, puntos]);

  if (!fontsLoaded) return null;

  const resetAnimaciones = () => {
    opacidadImagen.setValue(1);
    escalaImagen.setValue(1);
    escalaFeedback.setValue(0.92);
  };

  const reiniciar = () => {
    setNiveles(generarNiveles());
    setIndiceNivel(0); setPuntos(0); setRespuesta(null);
    setOpcionElegida(null); setMostrarColor(false);
    setMostrarDato(false); setFinalizado(false);
    resetAnimaciones();
  };

  const avanzarNivel = () => {
    if (indiceNivel + 1 >= totalNiveles) { setFinalizado(true); return; }
    setIndiceNivel(v => v + 1);
    setRespuesta(null); setOpcionElegida(null);
    setMostrarColor(false); setMostrarDato(false);
    resetAnimaciones();
  };

  const animarCambio = (callback) => {
    Animated.parallel([
      Animated.timing(opacidadImagen, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(escalaImagen, { toValue: 0.9, duration: 160, useNativeDriver: true }),
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
    const correcto = opcion === nivel.respuestaCorrecta;
    setRespuesta(correcto ? 'correcto' : 'incorrecto');
    if (correcto) setPuntos(v => v + 1);
    animarCambio(() => { setMostrarColor(true); setMostrarDato(true); });
  };

  const estadoFinal = respuesta === 'correcto' ? 'correcto' : 'incorrecto';

  const etiquetaTipo = () => {
  if (!nivel) return '';
  if (nivel.tipo === 'nombre') return '¿Qué elemento es?';
  if (nivel.tipo === 'sino') return `¿Es ${nivel.elemento.articulo === 'la' ? 'una' : 'un'} ${nivel.nombreMostrado}?`;
  if (nivel.tipo === 'silueta') return `¿Cuál silueta es ${nivel.elemento.articulo} ${nivel.elemento.nombre}?`;
};

  // ── Pantalla final ──
  if (finalizado) {
    return (
      <LinearGradient colors={['#1A6B3A', '#4CAF7A', '#E8F4FD']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.fondo}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.contenidoFin}>
          <View style={styles.cuerpoFin}>
            <Text style={styles.tituloFin}>¡Muy bien!</Text>
            <Text style={styles.subtituloFin}>Terminaste los {totalNiveles} niveles de naturaleza.</Text>
            <Text style={styles.subtituloFin}>Ganaste {puntos} de {totalNiveles} estrellas.</Text>
            <View style={styles.filaEstrellasFin}>
              {Array.from({ length: totalNiveles }).map((_, i) => (
                <Image key={i} source={require('../assets/images/estrella.png')}
                  style={[styles.estrellaFin, i >= puntos && styles.estrellaFinVacia]} resizeMode="contain" />
              ))}
            </View>
            <CustomButton label="Jugar otra vez" onPress={reiniciar} variant="primary" fullWidth />
            <CustomButton label="Volver al menú" onPress={() => navigation.goBack()} variant="secondary" fullWidth style={{ marginTop: 8 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Pantalla de juego ──
  return (
    <LinearGradient colors={['#1A6B3A', '#4CAF7A', '#E8F4FD']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.fondo}>
      <StatusBar style="light" />
      <Animated.View style={[styles.burbuja, styles.burbuja1, { transform: [{ translateY: flote1 }] }]} />
      <Animated.View style={[styles.burbuja, styles.burbuja2, { transform: [{ translateY: flote2 }] }]} />
      <Animated.View style={[styles.burbuja, styles.burbuja3, { transform: [{ translateY: flote3 }] }]} />

      <SafeAreaView style={styles.contenido}>

        {/* ── Header fijo ── */}
        <View style={styles.headerCoral}>
          <View style={styles.headerFila}>
            <CustomButton
              label="←"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.botonRegresar}
            />
            <View style={styles.headerCentro}>
              <Text style={styles.headerTitulo}>Naturaleza</Text>
            </View>
            <View style={styles.badgeEstrella}>
              <Text style={styles.badgeIcon}>⭐</Text>
              <Text style={styles.badgeNum}>{puntos}</Text>
            </View>
          </View>

          {/* Badge tipo */}
          <View style={styles.badgeTipo}>
            <Text style={styles.textoBadge}>
              {nivel.tipo === 'nombre' && '🔍 Adivina la silueta'}
              {nivel.tipo === 'sino' && '✅ Sí o No'}
              {nivel.tipo === 'silueta' && '🔍 Elige la silueta'}
            </Text>
          </View>

          {/* Barra de progreso */}
          <View style={styles.barraFondo}>
            <View style={[styles.barraRelleno, { width: `${(indiceNivel / totalNiveles) * 100}%` }]} />
          </View>
          <Text style={styles.textoProgreso}>Pregunta {indiceNivel + 1}/{totalNiveles}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── Tarjeta principal ── */}
          <View style={styles.tarjetaSilueta}>
            <View style={styles.circuloImagen}>
              <Animated.View style={{ transform: [{ scale: escalaImagen }], opacity: opacidadImagen }}>
                {nivel.tipo === 'silueta' ? (
                  <Text style={styles.nombreGrande}>{nivel.elemento.nombre}</Text>
                ) : (
                  <Image
                    source={mostrarColor ? nivel.elemento.color : nivel.elemento.silueta}
                    style={styles.silueta}
                    resizeMode="contain"
                  />
                )}
              </Animated.View>
            </View>
            <Text style={styles.textoPista}>📍 {nivel.elemento.pista}</Text>
          </View>

          <Text style={styles.pregunta}>{etiquetaTipo()}</Text>

          {/* TIPO NOMBRE — 3 botones con número */}
          {nivel.tipo === 'nombre' && (
            <View style={styles.opciones}>
              {nivel.opciones.map((opcion, i) => {
                const seleccionada = opcionElegida === opcion;
                const colorBase = !respuesta || !seleccionada ? 'rgba(255,255,255,0.75)' : (respuesta === 'correcto' ? '#88CC88' : '#F47C7C');
                const bordeBase = !respuesta || !seleccionada ? 'rgba(26,60,94,0.2)' : (respuesta === 'correcto' ? '#4AAE4A' : '#D45A5A');
                return (
                  <TouchableOpacity key={opcion}
                    style={[styles.botonOpcion, { backgroundColor: colorBase, borderColor: bordeBase }]}
                    onPress={() => elegir(opcion)} activeOpacity={0.84} disabled={!!respuesta}>
                    <Text style={styles.numeroOpcion}>{i + 1}.</Text>
                    <Text style={styles.textoOpcion}>{opcion}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* TIPO SINO — Sí / No */}
          {nivel.tipo === 'sino' && (
            <View style={styles.opcionesSiNo}>
              {['Sí', 'No'].map((opcion) => {
                const seleccionada = opcionElegida === opcion;
                const colorBase = !respuesta || !seleccionada
                  ? (opcion === 'Sí' ? 'rgba(136,204,136,0.3)' : 'rgba(244,124,124,0.3)')
                  : (respuesta === 'correcto' ? '#88CC88' : '#F47C7C');
                const bordeBase = !respuesta || !seleccionada
                  ? (opcion === 'Sí' ? '#4AAE4A' : '#D45A5A')
                  : (respuesta === 'correcto' ? '#4AAE4A' : '#D45A5A');
                return (
                  <TouchableOpacity key={opcion}
                    style={[styles.botonSiNo, { backgroundColor: colorBase, borderColor: bordeBase }]}
                    onPress={() => elegir(opcion)} activeOpacity={0.84} disabled={!!respuesta}>
                    <Text style={styles.textoSiNo}>{opcion === 'Sí' ? '✓' : '✗'}</Text>
                    <Text style={styles.textoOpcion}>{opcion}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* TIPO SILUETA — 3 tarjetas con imágenes */}
          {nivel.tipo === 'silueta' && (
          <View style={styles.opcionesSilueta}>
            {nivel.opcionesNaturaleza.map((el) => {
              const seleccionada = opcionElegida === el.id;
              const esCorrecta = el.id === nivel.respuestaCorrecta;

              let colorBase = 'rgba(255,255,255,0.75)';
              let bordeBase = 'rgba(26,60,94,0.2)';

              if (respuesta) {
                if (esCorrecta) {
                  colorBase = 'rgba(66, 161, 66, 0.35)';
                  bordeBase = '#4AAE4A';
                } else if (seleccionada) {
                  colorBase = '#F47C7C';
                  bordeBase = '#D45A5A';
                }
              }

              return (
                <TouchableOpacity key={el.id}
                  style={[styles.tarjetaSiluetaOpcion, { backgroundColor: colorBase, borderColor: bordeBase }]}
                  onPress={() => elegir(el.id)} activeOpacity={0.84} disabled={!!respuesta}>
                  <Image
                    source={mostrarColor && esCorrecta ? el.color : el.silueta}
                    style={styles.siluetaOpcion}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

          {/* ── Tarjeta "Era:" — solo si la respuesta fue incorrecta ── */}
          {respuesta === 'incorrecto' && (
              <View style={styles.tarjetaEra}>
                {nivel.tipo !== 'silueta' && (
                  <Text style={styles.textoEra}>
                    Es:{' '}
                    <Text style={styles.textoEraDestacado}>{nivel.elemento.nombre}</Text>
                  </Text>
                )}
                <TouchableOpacity style={styles.botonContinuarEra} onPress={avanzarNivel} activeOpacity={0.85}>
                  <Text style={styles.textoBotonContinuarEra}>
                    {indiceNivel + 1 >= totalNiveles ? 'Ver mis resultados →' : 'Siguiente →'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

        </ScrollView>
      </SafeAreaView>

      {/* ── Overlay de celebración — solo si la respuesta es correcta ── */}
      {respuesta === 'correcto' && mostrarDato && (
        <View style={[styles.overlayCelebracion, styles.overlayCorrecto]}>
          <SafeAreaView style={styles.overlayContenido}>

            <View style={styles.overlayFila}>
              <View style={styles.overlayBadgeCategoria}>
                <Text style={styles.overlayBadgeCategoriaTexto}>Naturaleza</Text>
              </View>
              <View style={styles.overlayBadgeProgreso}>
                <Text style={styles.overlayBadgeProgresoTexto}>{indiceNivel + 1}/{totalNiveles}</Text>
              </View>
            </View>

            <View style={styles.overlayCuerpo}>
              <Text style={styles.overlayTitulo}>¡Correcto!</Text>

              <View style={styles.tarjetaResultado}>
                <View style={styles.circuloResultado}>
                  <Image source={nivel.elemento.color} style={styles.imagenResultado} resizeMode="contain" />
                </View>
                <Text style={styles.nombreResultado}>{nivel.elemento.nombre}</Text>

                <View style={styles.lineaDivisoria} />

                <View style={styles.badgeDato}>
                  <Text style={styles.badgeDatoTexto}>💡 ¿Sabías que...?</Text>
                </View>
                <Text style={styles.textoDato}>{nivel.elemento.dato}</Text>
              </View>

              <TouchableOpacity style={styles.botonContinuar} onPress={avanzarNivel} activeOpacity={0.85}>
                <Text style={styles.textoBotonContinuar}>
                  {indiceNivel + 1 >= totalNiveles ? 'Ver mis resultados →' : '¡Siguiente silueta! →'}
                </Text>
              </TouchableOpacity>
            </View>

          </SafeAreaView>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1 },
  contenidoFin: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  scroll: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 16 },

  burbuja: { position: 'absolute', borderRadius: 999 },
  burbuja1: { width: 120, height: 120, top: 40, left: -40, backgroundColor: 'rgba(255,255,255,0.10)' },
  burbuja2: { width: 80, height: 80, top: 180, right: -20, backgroundColor: 'rgba(255,255,255,0.08)' },
  burbuja3: { width: 60, height: 60, bottom: 200, left: 20, backgroundColor: 'rgba(255,255,255,0.07)' },

  // ── Header ──
  headerCoral: {
    backgroundColor: 'transparent',
    paddingBottom: 10,
  },
  headerFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  headerCentro: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitulo: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  badgeEstrella: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC400',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  badgeIcon: { fontSize: 14 },
  badgeNum: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14,
    color: '#1A3C5E',
  },
  badgeTipo: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  textoBadge: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  barraFondo: {
    marginHorizontal: 16,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    backgroundColor: '#FFC400',
    borderRadius: 999,
  },
  textoProgreso: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'left',
    paddingHorizontal: 16,
    marginTop: 4,
  },

  // ── Tarjeta silueta ──
  tarjetaSilueta: {
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#0D4A26',
    backgroundColor: '#0D4A26',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    elevation: 5,
  },
  circuloImagen: {
    width: width * 0.52,
    height: width * 0.52,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  silueta: {
    width: width * 0.65,
    height: width * 0.46,
  },
  nombreGrande: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 36,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  textoPista: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  nombreDestacado: {
    color: '#FFC400',
    fontFamily: 'Baloo2_800ExtraBold',
  },

  pregunta: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#0D4A26',
    textAlign: 'center',
    marginBottom: 10,
  },

  // ── Opciones tipo nombre ──
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

  // ── Opciones Sí/No ──
  opcionesSiNo: { flexDirection: 'row', gap: 12 },
  botonSiNo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 22,
    borderWidth: 3,
    gap: 4,
  },
  textoSiNo: { fontSize: 32 },

  // ── Opciones silueta ──
  opcionesSilueta: { flexDirection: 'row', gap: 10 },
  tarjetaSiluetaOpcion: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 3,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  siluetaOpcion: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
  },

  // ── Tarjeta "Era:" (respuesta incorrecta) ──
  tarjetaEra: {
    backgroundColor: 'rgba(244,124,124,0.95)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D45A5A',
    padding: 16,
    marginTop: 14,
    alignItems: 'center',
    gap: 12,
  },
  textoEra: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 16,
    color: '#1A3C5E',
    textAlign: 'center',
  },
  textoEraDestacado: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 17,
  },
  botonContinuarEra: {
    backgroundColor: '#FFC400',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A3C5E',
  },
  textoBotonContinuarEra: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 15,
    color: '#1A3C5E',
  },

  // ── Overlay de celebración ──
  overlayCelebracion: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  overlayCorrecto: { backgroundColor: '#4CAF7A' },
  overlayContenido: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },

  overlayFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  overlayCuerpo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  overlayBadgeCategoria: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  overlayBadgeCategoriaTexto: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  overlayBadgeProgreso: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  overlayBadgeProgresoTexto: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  overlayTitulo: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 30,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },

  tarjetaResultado: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#0D4A26',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  circuloResultado: {
    width: width * 0.80,
    height: width * 0.80,
    borderRadius: 40,
    backgroundColor: '#0D4A26',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  imagenResultado: {
    width: width * 0.80,
    height: width * 0.80,
  },
  nombreResultado: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 24,
    color: '#1A3C5E',
    marginBottom: 14,
  },
  lineaDivisoria: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(26,60,94,0.15)',
    marginBottom: 14,
  },
  badgeDato: {
    backgroundColor: '#1A6B3A',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  badgeDatoTexto: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  textoDato: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 15,
    color: '#1A3C5E',
    textAlign: 'center',
    lineHeight: 22,
  },

  botonContinuar: {
    backgroundColor: '#FFC400',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1A3C5E',
    elevation: 6,
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
  },
  textoBotonContinuar: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#1A3C5E',
  },

  // ── Pantalla final ──
  cuerpoFin: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  tituloFin: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 30, color: '#FFFFFF', textAlign: 'center' },
  subtituloFin: { fontFamily: 'Baloo2_700Bold', fontSize: 17, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  filaEstrellasFin: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginVertical: 8, maxWidth: 240 },
  estrellaFin: { width: 28, height: 28 },
  estrellaFinVacia: { tintColor: 'rgba(255,255,255,0.35)' },
  botonRegresar: {
    borderRadius: 18,
    borderWidth: 3,
    elevation: 0,
    shadowOpacity: 0,
  },
});