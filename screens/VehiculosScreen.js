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

const VEHICULOS = [
  {
    id: 'autobus',
    nombre: 'Autobús',
    articulo: 'el',
    silueta: require('../assets/images/Vehiculos/autobus silueta.png'),
    color: require('../assets/images/Vehiculos/autobus color.png'),
    dato: 'El autobús es uno de los transportes más usados en las ciudades.',
    pista: 'Lleva a muchas personas a la vez.',
  },
  {
    id: 'avion',
    nombre: 'Avión',
    articulo: 'el',
    silueta: require('../assets/images/Vehiculos/avion silueta.png'),
    color: require('../assets/images/Vehiculos/avion color.png'),
    dato: 'Los aviones pueden volar a más de 900 km/h.',
    pista: 'Vuela muy alto por el cielo.',
  },
  {
    id: 'barco',
    nombre: 'Barco',
    articulo: 'el',
    silueta: require('../assets/images/Vehiculos/barco silueta.png'),
    color: require('../assets/images/Vehiculos/barco color.png'),
    dato: 'Los barcos pueden transportar carga enorme de un país a otro.',
    pista: 'Navega por el mar o los ríos.',
  },
  {
    id: 'bicicleta',
    nombre: 'Bicicleta',
    articulo: 'la',
    silueta: require('../assets/images/Vehiculos/bicicleta silueta.png'),
    color: require('../assets/images/Vehiculos/bicicleta color.png'),
    dato: 'La bicicleta no contamina y es muy buena para la salud.',
    pista: 'Se mueve pedaleando y tiene dos ruedas.',
  },
  {
    id: 'bomberos',
    nombre: 'Camión de bomberos',
    articulo: 'el',
    silueta: require('../assets/images/Vehiculos/bomberos silueta.png'),
    color: require('../assets/images/Vehiculos/bomberos color.png'),
    dato: 'Los camiones de bomberos llevan agua y mangueras para apagar incendios.',
    pista: 'Es rojo y ayuda a apagar incendios.',
  },
  {
    id: 'carro',
    nombre: 'Carro',
    articulo: 'el',
    silueta: require('../assets/images/Vehiculos/carro silueta.png'),
    color: require('../assets/images/Vehiculos/carro color.png'),
    dato: 'Los carros eléctricos no usan gasolina y contaminan menos.',
    pista: 'Tiene cuatro ruedas y lo manejan personas.',
  },
  {
    id: 'cohete',
    nombre: 'Cohete',
    articulo: 'el',
    silueta: require('../assets/images/Vehiculos/cohete silueta.png'),
    color: require('../assets/images/Vehiculos/cohete color.png'),
    dato: 'Los cohetes necesitan una gran cantidad de combustible para salir de la Tierra.',
    pista: 'Vuela hasta el espacio dejando una gran llama detrás.',
  },
  {
    id: 'helicoptero',
    nombre: 'Helicóptero',
    articulo: 'el',
    silueta: require('../assets/images/Vehiculos/helicoptero silueta.png'),
    color: require('../assets/images/Vehiculos/helicoptero color.png'),
    dato: 'Los helicópteros pueden quedarse quietos en el aire sin moverse.',
    pista: 'Tiene hélices que giran para volar.',
  },
  {
    id: 'tractor',
    nombre: 'Tractor',
    articulo: 'el',
    silueta: require('../assets/images/Vehiculos/tractor silueta.png'),
    color: require('../assets/images/Vehiculos/tractor color.png'),
    dato: 'Los tractores ayudan a arar la tierra y sembrar los campos.',
    pista: 'Trabaja en el campo y tiene ruedas muy grandes atrás.',
  },
  {
    id: 'tren',
    nombre: 'Tren',
    articulo: 'el',
    silueta: require('../assets/images/Vehiculos/tren silueta.png'),
    color: require('../assets/images/Vehiculos/tren color.png'),
    dato: 'Los trenes bala en Japón pueden ir a más de 300 km/h.',
    pista: 'Corre sobre rieles y tiene muchos vagones.',
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
  const seleccionados = mezclar(VEHICULOS).slice(0, VEHICULOS.length);
  return seleccionados.map((vehiculo, i) => {
    const tipo = TIPOS[i % TIPOS.length === 0 && i > 0
      ? Math.floor(Math.random() * TIPOS.length)
      : i % TIPOS.length];
    const otros = otrosAleatorios(VEHICULOS, vehiculo.id, 2);

    if (tipo === 'nombre') {
      return {
        tipo, vehiculo, dato: vehiculo.dato,
        opciones: mezclar([vehiculo.nombre, ...otros.map(o => o.nombre)]),
        respuestaCorrecta: vehiculo.nombre,
      };
    }
    if (tipo === 'sino') {
      const esVerdadero = Math.random() > 0.5;
      const otroElegido = otros[0];
      const nombreMostrado = esVerdadero ? vehiculo.nombre : otroElegido.nombre;
      const articuloMostrado = esVerdadero ? vehiculo.articulo : otroElegido.articulo;
      return {
        tipo, vehiculo, dato: vehiculo.dato, nombreMostrado, articuloMostrado,
        respuestaCorrecta: esVerdadero ? 'Sí' : 'No',
        opciones: ['Sí', 'No'],
      };
    }
    const opcionesVehiculos = mezclar([vehiculo, ...otros]);
    return {
      tipo, vehiculo, dato: vehiculo.dato,
      opcionesVehiculos,
      respuestaCorrecta: vehiculo.id,
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

export default function VehiculosScreen({ navigation }) {
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
    if (finalizado) actualizarEstrellas('vehiculos', puntos);
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
    if (nivel.tipo === 'nombre') return '¿Cuál vehículo es?';
    if (nivel.tipo === 'sino') return `¿Es ${nivel.articuloMostrado === 'la' ? 'una' : 'un'} ${nivel.nombreMostrado}?`;
    if (nivel.tipo === 'silueta') return `¿Cuál silueta es ${nivel.vehiculo.articulo} ${nivel.vehiculo.nombre}?`;
  };

  // ── Pantalla final ──
  if (finalizado) {
    return (
      <LinearGradient colors={['#1A6B8A', '#4FC3D5', '#E8F4FD']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.fondo}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.contenidoFin}>
          <View style={styles.cuerpoFin}>
            <Text style={styles.tituloFin}>¡Muy bien!</Text>
            <Text style={styles.subtituloFin}>Terminaste los {totalNiveles} niveles de vehículos.</Text>
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
    <LinearGradient colors={['#1A6B8A', '#4FC3D5', '#E8F4FD']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.fondo}>
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
              <Text style={styles.headerTitulo}>Vehículos</Text>
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
                  <Text style={styles.nombreGrande}>{nivel.vehiculo.nombre}</Text>
                ) : (
                  <Image
                    source={mostrarColor ? nivel.vehiculo.color : nivel.vehiculo.silueta}
                    style={styles.silueta}
                    resizeMode="contain"
                  />
                )}
              </Animated.View>
            </View>
            <Text style={styles.textoPista}>📍 {nivel.vehiculo.pista}</Text>
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
              {nivel.opcionesVehiculos.map((v) => {
                const seleccionada = opcionElegida === v.id;
                const esCorrecta = v.id === nivel.respuestaCorrecta;

                let colorBase = 'rgba(255,255,255,0.75)';
                let bordeBase = 'rgba(26,60,94,0.2)';

                if (respuesta) {
                  if (esCorrecta) {
                    colorBase = 'rgba(136,204,136,0.35)';
                    bordeBase = '#4AAE4A';
                  } else if (seleccionada) {
                    colorBase = '#F47C7C';
                    bordeBase = '#D45A5A';
                  }
                }

                return (
                  <TouchableOpacity key={v.id}
                    style={[styles.tarjetaSiluetaOpcion, { backgroundColor: colorBase, borderColor: bordeBase }]}
                    onPress={() => elegir(v.id)} activeOpacity={0.84} disabled={!!respuesta}>
                    <Image
                      source={mostrarColor && esCorrecta ? v.color : v.silueta}
                      style={styles.siluetaOpcion}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ── Tarjeta "Es:" — solo si la respuesta fue incorrecta ── */}
          {respuesta === 'incorrecto' && (
            <View style={styles.tarjetaEra}>
              {nivel.tipo !== 'silueta' && (
                <Text style={styles.textoEra}>
                  Es:{' '}
                  <Text style={styles.textoEraDestacado}>{nivel.vehiculo.nombre}</Text>
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

            {/* Fila superior — fija arriba */}
            <View style={styles.overlayFila}>
              <View style={styles.overlayBadgeCategoria}>
                <Text style={styles.overlayBadgeCategoriaTexto}>Vehículos</Text>
              </View>
              <View style={styles.overlayBadgeProgreso}>
                <Text style={styles.overlayBadgeProgresoTexto}>{indiceNivel + 1}/{totalNiveles}</Text>
              </View>
            </View>

            {/* Bloque centrado — ocupa el resto del espacio */}
            <View style={styles.overlayCuerpo}>
              <Text style={styles.overlayTitulo}>¡Correcto!</Text>

              <View style={styles.tarjetaResultado}>
                <View style={styles.circuloResultado}>
                  <Image source={nivel.vehiculo.color} style={styles.imagenResultado} resizeMode="contain" />
                </View>
                <Text style={styles.nombreResultado}>{nivel.vehiculo.nombre}</Text>

                <View style={styles.lineaDivisoria} />

                <View style={styles.badgeDato}>
                  <Text style={styles.badgeDatoTexto}>💡 ¿Sabías que...?</Text>
                </View>
                <Text style={styles.textoDato}>{nivel.vehiculo.dato}</Text>
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
    borderColor: '#0D4A5E',
    backgroundColor: '#0D4A5E',
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
    width: width * 0.45,
    height: width * 0.26,
  },
  nombreGrande: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 8,
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
    color: '#0D4A5E',
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

  // ── Tarjeta "Es:" (respuesta incorrecta) ──
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
  overlayCorrecto: { backgroundColor: '#4FC3D5' },
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
    shadowColor: '#0D4A5E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  circuloResultado: {
    width: width * 0.80,
    height: width * 0.80,
    borderRadius: 40,
    backgroundColor: '#0D4A5E',
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
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  lineaDivisoria: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(26,60,94,0.15)',
    marginBottom: 14,
  },
  badgeDato: {
    backgroundColor: '#1A6B8A',
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