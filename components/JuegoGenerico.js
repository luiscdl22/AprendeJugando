// components/JuegoGenerico.js

import React, { useEffect, useRef, useState } from "react";
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
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from "@expo-google-fonts/baloo-2";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { Audio } from "expo-av";

import { useStars } from "../context/StarContext";
import CustomButton from "../components/CustomButton";
import ConfetiAnimado from "../components/ConfetiAnimado";
import Correcto from "../components/Correcto";
import Incorrecto from "../components/Incorrecto";

const { width, height } = Dimensions.get("window");

// MAPA DE MUSICA POR CATEGORIA
const MUSICA_CATEGORIA = {
  animales: require("../assets/sounds/musica/animales.mp3"),
  vehiculos: require("../assets/sounds/musica/vehiculos.mp3"),
  utiles: require("../assets/sounds/musica/utiles.mp3"),
  naturaleza: require("../assets/sounds/musica/naturaleza.mp3"),
};

function mezclar(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function otrosAleatorios(todos, excluirId, cantidad) {
  const disponibles = todos.filter((a) => a.id !== excluirId);
  const seleccionados = mezclar(disponibles).slice(0, Math.min(cantidad, disponibles.length));
  return seleccionados;
}

function generarNiveles(datos, tipos) {
  const seleccionados = mezclar(datos).slice(0, 5);
  
  return seleccionados.map((item, i) => {
    const tipo = tipos[i % tipos.length];
    const otros = otrosAleatorios(datos, item.id, 2);

    if (tipo === "nombre") {
      const opcionesBase = [item.nombre, ...otros.map((o) => o.nombre)];
      while (opcionesBase.length < 3) {
        const extra = datos.filter(d => !opcionesBase.includes(d.nombre) && d.id !== item.id);
        if (extra.length === 0) break;
        opcionesBase.push(extra[0].nombre);
      }
      const opciones = mezclar(opcionesBase);
      return {
        tipo,
        item,
        dato: item.dato,
        opciones: opciones,
        respuestaCorrecta: item.nombre,
      };
    }
    if (tipo === "sino") {
      // 50% de probabilidad de mostrar el animal correcto
      const mostrarCorrecto = Math.random() > 0.5;
      const nombreMostrado = mostrarCorrecto ? item.nombre : (otros[0]?.nombre || item.nombre);
      const esVerdadero = nombreMostrado === item.nombre;
      
      return {
        tipo,
        item,
        dato: item.dato,
        nombreMostrado,
        respuestaCorrecta: esVerdadero ? "Sí" : "No",
        opciones: ["Sí", "No"],
      };
    }
    // tipo === "silueta"
    const opcionesItems = mezclar([item, ...otros]);
    return {
      tipo,
      item,
      dato: item.dato,
      opcionesItems,
      respuestaCorrecta: item.id,
    };
  });
}

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
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [delay, duracion, valor]);
  return valor.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -distancia],
  });
}

export default function JuegoGenerico({
  datos,
  categoria,
  titulo,
  coloresGradiente,
  colorFondo,
  navigation,
}) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const { actualizarEstrellas } = useStars();

  const [niveles, setNiveles] = useState(() =>
    generarNiveles(datos, ["nombre", "sino", "silueta"]),
  );
  const [indiceNivel, setIndiceNivel] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [respuesta, setRespuesta] = useState(null);
  const [opcionElegida, setOpcionElegida] = useState(null);
  const [mostrarColor, setMostrarColor] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [puntajeFinal, setPuntajeFinal] = useState(0);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [mostrarSuspenso, setMostrarSuspenso] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [esCorrecto, setEsCorrecto] = useState(false);
  const [mostrarSabiasQue, setMostrarSabiasQue] = useState(false);
  const [mostrarConfeti, setMostrarConfeti] = useState(false);

  const escalaImagen = useRef(new Animated.Value(1)).current;
  const opacidadImagen = useRef(new Animated.Value(1)).current;
  const sabiasQueScale = useRef(new Animated.Value(0.5)).current;
  const sabiasQueOpacity = useRef(new Animated.Value(0)).current;

  const flote1 = useFlote(10, 2600, 0);
  const flote2 = useFlote(14, 3200, 300);
  const flote3 = useFlote(8, 2800, 500);

  const nivel = niveles[indiceNivel];
  const totalNiveles = niveles.length;

  // Estado para musica de fondo
  const musicaRef = useRef(null);
  const [musicaActiva, setMusicaActiva] = useState(true);

  const animalAudio = useAudioPlayer(nivel?.item?.datoAudio || null);
  const aciertoSound = useAudioPlayer(require("../assets/sounds/acierto.mp3"));
  const errorSound = useAudioPlayer(require("../assets/sounds/error.mp3"));
  const bateriaSound = useAudioPlayer(require("../assets/sounds/bateria.mp3"));
  const fiuuuSound = useAudioPlayer(require("../assets/sounds/fiuuu.mp3"));

  // Cargar musica segun categoria
  useEffect(() => {
    const cargarMusica = async () => {
      try {
        if (musicaRef.current) {
          await musicaRef.current.stopAsync();
          await musicaRef.current.unloadAsync();
          musicaRef.current = null;
        }

        const musicaSource = MUSICA_CATEGORIA[categoria];
        if (!musicaSource) return;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          musicaSource,
          { shouldPlay: true, isLooping: true, volume: 0.25 }
        );
        
        musicaRef.current = sound;
        setMusicaActiva(true);
        await sound.playAsync();
      } catch (error) {
        console.log('Error cargando musica:', error);
      }
    };

    cargarMusica();

    return () => {
      if (musicaRef.current) {
        musicaRef.current.stopAsync();
        musicaRef.current.unloadAsync();
        musicaRef.current = null;
      }
    };
  }, [categoria]);

  useEffect(() => {
    if (finalizado) {
      actualizarEstrellas(categoria, puntos);
      setPuntajeFinal(puntos);
      if (musicaRef.current) {
        musicaRef.current.stopAsync();
        musicaRef.current.unloadAsync();
        musicaRef.current = null;
      }
    }
  }, [actualizarEstrellas, categoria, finalizado, puntos]);

  if (!fontsLoaded) return null;

  const pausarMusica = async () => {
    if (musicaRef.current && musicaActiva) {
      try {
        await musicaRef.current.pauseAsync();
        setMusicaActiva(false);
      } catch (error) {}
    }
  };

  const reanudarMusica = async () => {
    if (musicaRef.current && !musicaActiva) {
      try {
        await musicaRef.current.playAsync();
        setMusicaActiva(true);
      } catch (error) {}
    }
  };

  const resetAnimaciones = () => {
    opacidadImagen.setValue(1);
    escalaImagen.setValue(1);
    sabiasQueScale.setValue(0.5);
    sabiasQueOpacity.setValue(0);
  };

  const reiniciar = () => {
    setNiveles(generarNiveles(datos, ["nombre", "sino", "silueta"]));
    setIndiceNivel(0);
    setPuntos(0);
    setRespuesta(null);
    setOpcionElegida(null);
    setMostrarColor(false);
    setFinalizado(false);
    setPuntajeFinal(0);
    setMostrarConfirmacion(false);
    setMostrarSuspenso(false);
    setMostrarResultado(false);
    setEsCorrecto(false);
    setMostrarSabiasQue(false);
    setMostrarConfeti(false);
    resetAnimaciones();
    setTimeout(() => reanudarMusica(), 500);
  };

  const avanzarNivel = () => {
    if (indiceNivel + 1 >= totalNiveles) {
      setFinalizado(true);
      return;
    }
    setIndiceNivel((v) => v + 1);
    setRespuesta(null);
    setOpcionElegida(null);
    setMostrarColor(false);
    setMostrarConfirmacion(false);
    setMostrarSuspenso(false);
    setMostrarResultado(false);
    setEsCorrecto(false);
    setMostrarSabiasQue(false);
    setMostrarConfeti(false);
    resetAnimaciones();
    setTimeout(() => reanudarMusica(), 500);
  };

  const animarCambio = (callback) => {
    callback();

    Animated.parallel([
      Animated.timing(opacidadImagen, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(escalaImagen, {
        toValue: 0.9,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(opacidadImagen, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(escalaImagen, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const animarSabiasQue = () => {
    sabiasQueScale.setValue(0.5);
    sabiasQueOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(sabiasQueScale, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(sabiasQueOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSeleccionarOpcion = (opcion) => {
    if (respuesta) return;
    setOpcionSeleccionada(opcion);
    setMostrarConfirmacion(true);
    pausarMusica();
  };

  const handleConfirmarRespuesta = () => {
    setMostrarConfirmacion(false);
    setMostrarSuspenso(true);

    try {
      bateriaSound?.seekTo(0);
      bateriaSound?.play();
    } catch (e) {}

    setTimeout(() => {
      setMostrarSuspenso(false);

      const correcto = opcionSeleccionada === nivel.respuestaCorrecta;
      setEsCorrecto(correcto);
      setRespuesta(correcto ? "correcto" : "incorrecto");

      if (correcto) {
        setPuntos((v) => v + 1);
        animarCambio(() => {
          setMostrarColor(true);
        });

        try {
          aciertoSound?.seekTo(0);
          aciertoSound?.play();
        } catch (e) {}

        setMostrarConfeti(true);
        setMostrarResultado(true);

        setTimeout(() => {
          setMostrarConfeti(false);
        }, 4000);
      } else {
        animarCambio(() => {
          setMostrarColor(true);
        });

        try {
          errorSound?.seekTo(0);
          errorSound?.play();
        } catch (e) {}

        setMostrarResultado(true);
      }
    }, 3000);
  };

  const handleRechazarRespuesta = () => {
    setMostrarConfirmacion(false);
    setOpcionSeleccionada(null);
    setTimeout(() => reanudarMusica(), 300);
  };

  const handleCorrectoCompletado = () => {
    setMostrarResultado(false);
    setMostrarSabiasQue(true);
    try {
      fiuuuSound?.seekTo(0);
      fiuuuSound?.play();
    } catch (e) {}
    animarSabiasQue();

    if (nivel?.item?.datoAudio) {
      setTimeout(() => {
        try {
          animalAudio?.seekTo(0);
          animalAudio?.play();
        } catch (e) {}
      }, 500);
    }
  };

  const handleIncorrectoCompletado = () => {
    setMostrarResultado(false);
    avanzarNivel();
  };

  const etiquetaTipo = () => {
    if (!nivel) return '';
    if (nivel.tipo === 'nombre') return 'Que es esta silueta?';
    if (nivel.tipo === 'sino') {
      const terminacionFemenina = ['a', 'A'].includes(nivel.nombreMostrado.slice(-1));
      const articulo = terminacionFemenina ? 'una' : 'un';
      return `Es ${articulo} ${nivel.nombreMostrado}?`;
    }
    if (nivel.tipo === 'silueta') return 'Encuentra la silueta';
  };

  const etiquetaBadge = () => {
    if (!nivel) return "";
    if (nivel.tipo === "nombre") return "Que es esta silueta?";
    if (nivel.tipo === "sino") return "Es cierto o no?";
    if (nivel.tipo === "silueta") return "Elige la silueta";
  };

  const obtenerMensajeMotivador = (puntaje, total) => {
    const porcentaje = puntaje / total;
    if (porcentaje === 1) {
      return {
        mensaje: 'Perfecto! Eres un campeon! Respondiste todo correctamente. Felicidades!',
        icono: 'trophy',
      };
    } else if (porcentaje >= 0.7) {
      return {
        mensaje: 'Excelente! Casi lo logras. Eres muy inteligente!',
        icono: 'star',
      };
    } else if (porcentaje >= 0.4) {
      return {
        mensaje: 'Bien hecho! Estas aprendiendo mucho. Un poquito mas y lo logras!',
        icono: 'happy',
      };
    } else {
      return {
        mensaje: 'No te rindas! Cada vez que juegas aprendes mas. Sigue practicando!',
        icono: 'fitness',
      };
    }
  };

  if (finalizado) {
    const mensaje = obtenerMensajeMotivador(puntos, totalNiveles);
    const esPerfecto = puntos === totalNiveles;

    return (
      <LinearGradient
        colors={coloresGradiente}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.fondo}
      >
        <StatusBar style="light" />
        <SafeAreaView style={styles.contenidoFin}>
          <View style={styles.cuerpoFin}>
            <ConfetiAnimado visible={mostrarConfeti} />

            <Ionicons
              name={esPerfecto ? "trophy" : mensaje.icono}
              size={60}
              color="#FFD166"
            />

            <Text style={styles.tituloFin}>
              {esPerfecto ? "Muy bien!" : "Terminaste!"}
            </Text>
            <Text style={styles.subtituloFin}>{mensaje.mensaje}</Text>
            <Text style={styles.subtituloFin}>
              Ganaste {puntos} de {totalNiveles} estrellas.
            </Text>

            <View style={styles.filaEstrellasFin}>
              {Array.from({ length: totalNiveles }).map((_, i) => (
                <Image
                  key={i}
                  source={require("../assets/images/estrella.png")}
                  style={[
                    styles.estrellaFin,
                    i >= puntos && styles.estrellaFinVacia,
                  ]}
                  resizeMode="contain"
                />
              ))}
            </View>

            <CustomButton
              label="Jugar otra vez"
              onPress={reiniciar}
              variant="primary"
              fullWidth
            />
            <CustomButton
              label="Volver al menu"
              onPress={() => {
                if (musicaRef.current) {
                  musicaRef.current.stopAsync();
                  musicaRef.current.unloadAsync();
                  musicaRef.current = null;
                }
                navigation.goBack();
              }}
              variant="secondary"
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={coloresGradiente}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.fondo}
    >
      <StatusBar style="light" />

      <Animated.View
        style={[
          styles.burbuja,
          styles.burbuja1,
          { transform: [{ translateY: flote1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.burbuja,
          styles.burbuja2,
          { transform: [{ translateY: flote2 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.burbuja,
          styles.burbuja3,
          { transform: [{ translateY: flote3 }] },
        ]}
      />

      <ConfetiAnimado visible={mostrarConfeti} />

      <SafeAreaView style={styles.contenido}>
        <View style={styles.headerCoral}>
          <View style={styles.headerFila}>
            <TouchableOpacity
              style={styles.botonRegresar}
              onPress={() => {
                if (musicaRef.current) {
                  musicaRef.current.stopAsync();
                  musicaRef.current.unloadAsync();
                  musicaRef.current = null;
                }
                navigation.goBack();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="#1A3C5E" />
            </TouchableOpacity>
            <View style={styles.headerCentro}>
              <Text style={styles.headerTitulo}>{titulo}</Text>
            </View>

            <View style={styles.badgeEstrella}>
              <Image
                source={require("../assets/images/estrella.png")}
                style={styles.badgeIcono}
                resizeMode="contain"
              />
              <Text style={styles.badgeNum}>{puntos}</Text>
            </View>
          </View>

          <View style={styles.badgeTipo}>
            <Ionicons
              name={
                nivel.tipo === "sino"
                  ? "checkmark-circle-outline"
                  : "search-outline"
              }
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.textoBadge}>{etiquetaBadge()}</Text>
          </View>

          <View style={styles.barraFondo}>
            <View
              style={[
                styles.barraRelleno,
                { width: `${(indiceNivel / totalNiveles) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.textoProgresoCentrado}>
            Pregunta {indiceNivel + 1} de {totalNiveles}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {(nivel.tipo === "nombre" || nivel.tipo === "sino") && (
            <Animated.View style={styles.tarjetaSilueta}>
              <Text style={styles.preguntaDentro}>{etiquetaTipo()}</Text>

              <View style={styles.circuloImagen}>
                <Animated.View
                  style={{
                    transform: [{ scale: escalaImagen }],
                    opacity: opacidadImagen,
                  }}
                >
                  {nivel.tipo === "silueta" ? (
                    <Text style={styles.nombreGrande}>{nivel.item.nombre}</Text>
                  ) : (
                    <Image
                      source={
                        mostrarColor ? nivel.item.color : nivel.item.silueta
                      }
                      style={styles.silueta}
                      resizeMode="contain"
                    />
                  )}
                </Animated.View>
              </View>

              <View style={styles.contenedorPista}>
                <Ionicons name="bulb-outline" size={18} color="#FFD166" />
                <Text style={styles.textoPistaFijo} numberOfLines={2}>
                  {nivel.item.pista}
                </Text>
              </View>
            </Animated.View>
          )}

          {nivel.tipo === "silueta" && (
            <Animated.View
              style={[
                styles.tarjetaSilueta,
                styles.tarjetaSiluetaOpcionSilueta,
              ]}
            >
              <Text
                style={[styles.preguntaDentro, styles.preguntaDentroSilueta]}
              >
                {etiquetaTipo()}
              </Text>

              <View style={[styles.circuloImagen, styles.circuloImagenSilueta]}>
                <Animated.View
                  style={{
                    transform: [{ scale: escalaImagen }],
                    opacity: opacidadImagen,
                  }}
                >
                  <Text
                    style={[styles.nombreGrande, styles.nombreGrandeSilueta]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {nivel.item.nombre}
                  </Text>
                </Animated.View>
              </View>

              <View
                style={[styles.contenedorPista, styles.contenedorPistaSilueta]}
              >
                <Ionicons name="bulb-outline" size={16} color="#FFD166" />
                <Text
                  style={[styles.textoPistaFijo, styles.textoPistaFijoSilueta]}
                  numberOfLines={2}
                >
                  {nivel.item.pista}
                </Text>
              </View>
            </Animated.View>
          )}

          {nivel.tipo === "nombre" && (
            <View style={styles.opciones}>
              {nivel.opciones.map((opcion, i) => {
                const seleccionada = opcionElegida === opcion;
                const esCorrecta = opcion === nivel.respuestaCorrecta;

                let colorBase = "#FFFFFF";
                let bordeBase = "rgba(26,60,94,0.2)";

                if (respuesta) {
                  if (esCorrecta) {
                    colorBase = "#88CC88";
                    bordeBase = "#4AAE4A";
                  } else if (seleccionada) {
                    colorBase = "#F47C7C";
                    bordeBase = "#D45A5A";
                  }
                } else if (seleccionada) {
                  colorBase = "#FFF8E1";
                  bordeBase = "#FFD166";
                }

                return (
                  <TouchableOpacity
                    key={opcion}
                    style={[
                      styles.botonOpcion,
                      { backgroundColor: colorBase, borderColor: bordeBase },
                    ]}
                    onPress={() => {
                      setOpcionElegida(opcion);
                      handleSeleccionarOpcion(opcion);
                    }}
                    activeOpacity={0.84}
                    disabled={!!respuesta || mostrarSuspenso}
                  >
                    <Text style={styles.numeroOpcion}>{i + 1}.</Text>
                    <Text style={styles.textoOpcion}>{opcion}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {nivel.tipo === "sino" && (
            <View style={styles.opcionesSiNo}>
              {["Sí", "No"].map((opcion) => {
                const seleccionada = opcionElegida === opcion;
                const esCorrecta = opcion === nivel.respuestaCorrecta;

                const esSi = opcion === "Sí";
                let bgColor = esSi ? "#4CAF7A" : "#F47C7C";
                let bordeBase = esSi ? "#388E3C" : "#D45A5A";
                let iconColor = "#FFFFFF";

                if (respuesta) {
                  if (esCorrecta) {
                    bgColor = "#4CAF7A";
                    bordeBase = "#4CAF7A";
                    iconColor = "#FFFFFF";
                  } else {
                    bgColor = "#F47C7C";
                    bordeBase = "#D45A5A";
                    iconColor = "#FFFFFF";
                  }
                } else if (seleccionada) {
                  bgColor = "#FFF8E1";
                  bordeBase = "#FFD166";
                  iconColor = "#1A3C5E";
                }

                const iconName =
                  opcion === "Sí" ? "checkmark-circle" : "close-circle";

                return (
                  <TouchableOpacity
                    key={opcion}
                    style={[
                      styles.botonSiNo,
                      { backgroundColor: bgColor, borderColor: bordeBase },
                    ]}
                    onPress={() => {
                      setOpcionElegida(opcion);
                      handleSeleccionarOpcion(opcion);
                    }}
                    activeOpacity={0.84}
                    disabled={!!respuesta || mostrarSuspenso}
                  >
                    <View style={styles.iconoSiNo}>
                      <Ionicons name={iconName} size={52} color={iconColor} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {nivel.tipo === "silueta" && (
            <View style={styles.opcionesSilueta}>
              <View style={styles.filaSiluetaSuperior}>
                {[nivel.opcionesItems[0], nivel.opcionesItems[2]].map(
                  (item) => {
                    const seleccionada = opcionElegida === item.id;
                    const esCorrecta = item.id === nivel.respuestaCorrecta;

                    let colorBase = "#FFFFFF";
                    let bordeBase = "rgba(26,60,94,0.2)";

                    if (respuesta) {
                      if (esCorrecta) {
                        colorBase = "#88CC88";
                        bordeBase = "#4AAE4A";
                      } else if (seleccionada) {
                        colorBase = "#F47C7C";
                        bordeBase = "#D45A5A";
                      }
                    } else if (seleccionada) {
                      colorBase = "#FFF8E1";
                      bordeBase = "#FFD166";
                    }

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.tarjetaSiluetaOpcion,
                          styles.tarjetaSiluetaSuperior,
                          {
                            backgroundColor: colorBase,
                            borderColor: bordeBase,
                          },
                        ]}
                        onPress={() => {
                          setOpcionElegida(item.id);
                          handleSeleccionarOpcion(item.id);
                        }}
                        activeOpacity={0.84}
                        disabled={!!respuesta || mostrarSuspenso}
                      >
                        <Image
                          source={
                            mostrarColor && esCorrecta
                              ? item.color
                              : item.silueta
                          }
                          style={styles.siluetaOpcionGrande}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    );
                  },
                )}
              </View>

              <View style={styles.filaSiluetaInferior}>
                {[nivel.opcionesItems[1]].map((item) => {
                  const seleccionada = opcionElegida === item.id;
                  const esCorrecta = item.id === nivel.respuestaCorrecta;

                  let colorBase = "#FFFFFF";
                  let bordeBase = "rgba(26,60,94,0.2)";

                  if (respuesta) {
                    if (esCorrecta) {
                      colorBase = "#88CC88";
                      bordeBase = "#4AAE4A";
                    } else if (seleccionada) {
                      colorBase = "#F47C7C";
                      bordeBase = "#D45A5A";
                    }
                  } else if (seleccionada) {
                    colorBase = "#FFF8E1";
                    bordeBase = "#FFD166";
                  }

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.tarjetaSiluetaOpcion,
                        styles.tarjetaSiluetaInferior,
                        { backgroundColor: colorBase, borderColor: bordeBase },
                      ]}
                      onPress={() => {
                        setOpcionElegida(item.id);
                        handleSeleccionarOpcion(item.id);
                      }}
                      activeOpacity={0.84}
                      disabled={!!respuesta || mostrarSuspenso}
                    >
                      <Image
                        source={
                          mostrarColor && esCorrecta ? item.color : item.silueta
                        }
                        style={styles.siluetaOpcionGrande}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        transparent
        visible={mostrarConfirmacion}
        animationType="fade"
        onRequestClose={handleRechazarRespuesta}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Image
              source={require("../assets/images/buho_saludando.png")}
              style={styles.buhoModal}
              resizeMode="contain"
            />
            <Text style={styles.modalTitulo}>
              Estas seguro de tu respuesta?
            </Text>
            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={[styles.modalBoton, styles.modalBotonSi]}
                onPress={handleConfirmarRespuesta}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBotonTexto}>Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBoton, styles.modalBotonNo]}
                onPress={handleRechazarRespuesta}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBotonTexto}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Correcto
        visible={mostrarResultado && esCorrecto}
        onComplete={handleCorrectoCompletado}
        estiloExtra={
          nivel?.tipo === "silueta"
            ? styles.textoCorrectoSilueta
            : nivel?.tipo === "sino"
              ? styles.textoCorrectoSino
              : null
        }
      />

      <Incorrecto
        visible={mostrarResultado && !esCorrecto}
        nombre={nivel?.item?.nombre || "Animal"}
        tipo={nivel?.tipo}
        onComplete={handleIncorrectoCompletado}
        estiloExtra={
          nivel?.tipo === "silueta"
            ? styles.textoIncorrectoSilueta
            : nivel?.tipo === "sino"
              ? styles.textoIncorrectoSino
              : null
        }
      />

      {mostrarSabiasQue && (
        <Animated.View
          style={[
            styles.overlaySabiasQue,
            {
              opacity: sabiasQueOpacity,
              transform: [{ scale: sabiasQueScale }],
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(26,54,93,0.85)", "rgba(26,54,93,0.90)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.overlaySabiasQueFondo}
          >
            <View style={styles.tarjetaSabiasQue}>
              <View style={styles.headerSabiasQue}>
                <Ionicons name="bulb-outline" size={24} color="#6C3FCF" />
                <Text style={styles.tituloSabiasQue}>Sabias que...?</Text>
              </View>

              <View style={styles.circuloSabiasQue}>
                <Image
                  source={nivel.item.color}
                  style={styles.imagenSabiasQue}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.nombreSabiasQue}>{nivel.item.nombre}</Text>
              <Text style={styles.textoSabiasQue}>{nivel.item.dato}</Text>

              <TouchableOpacity
                style={styles.botonContinuar}
                onPress={avanzarNivel}
                activeOpacity={0.85}
              >
                <Text style={styles.textoBotonContinuar}>
                  {indiceNivel + 1 >= totalNiveles
                    ? "Ver mis resultados"
                    : "Siguiente"}
                </Text>
                <Ionicons name="arrow-forward" size={22} color="#1A3C5E" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1 },
  contenidoFin: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  scroll: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 16 },

  burbuja: { position: "absolute", borderRadius: 999 },
  burbuja1: {
    width: 120,
    height: 120,
    top: 40,
    left: -40,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  burbuja2: {
    width: 80,
    height: 80,
    top: 180,
    right: -20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  burbuja3: {
    width: 60,
    height: 60,
    bottom: 200,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  headerCoral: {
    backgroundColor: "transparent",
    paddingBottom: 10,
  },
  headerFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  headerCentro: {
    flex: 1,
    alignItems: "center",
  },
  headerTitulo: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 18,
    color: "#FFFFFF",
  },

  badgeEstrella: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  badgeIcono: {
    width: 24,
    height: 24,
  },
  badgeNum: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 18,
    color: "#FFFFFF",
    lineHeight: 22,
    marginTop: 1,
  },

  badgeTipo: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    gap: 6,
  },
  textoBadge: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  barraFondo: {
    marginHorizontal: 16,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    overflow: "hidden",
  },
  barraRelleno: {
    height: "100%",
    backgroundColor: "#FFC400",
    borderRadius: 999,
  },
  textoProgresoCentrado: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 4,
  },

  botonRegresar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },

  tarjetaSilueta: {
    borderRadius: 28,
    borderWidth: 0.5,
    borderColor: "#1A3C5E",
    backgroundColor: "#204972",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
    elevation: 5,
  },
  preguntaDentro: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  circuloImagen: {
    width: width * 0.68,
    height: width * 0.68,
    borderRadius: 999,
    backgroundColor: '#1A3C5E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  silueta: {
    width: width * 0.68,
    height: width * 0.68,
  },
  nombreGrande: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 32,
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  contenedorPista: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    width: "100%",
    paddingHorizontal: 4,
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  textoPistaFijo: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 14,
    color: "#FFFFFF",
    flex: 1,
    lineHeight: 20,
    flexWrap: "wrap",
  },

  tarjetaSiluetaOpcionSilueta: {
    paddingVertical: 6,
    marginBottom: 6,
  },
  preguntaDentroSilueta: {
    fontSize: 25,
    marginBottom: 4,
  },
  circuloImagenSilueta: {
    width: width * 0.42,
    height: width * 0.42,
    marginBottom: 4,
  },
  nombreGrandeSilueta: {
    fontSize: 35,
  },
  contenedorPistaSilueta: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  textoPistaFijoSilueta: {
    fontSize: 12,
    lineHeight: 18,
  },

  opciones: { gap: 10 },
  botonOpcion: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 3,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  numeroOpcion: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 17,
    color: "#1A3C5E",
    width: 24,
  },
  textoOpcion: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 17,
    color: "#1A3C5E",
    flex: 1,
  },

  opcionesSiNo: {
    flexDirection: "row",
    gap: 20,
    marginTop: 12,
    justifyContent: "center",
  },
  botonSiNo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    maxWidth: 160,
    aspectRatio: 1,
    elevation: 6,
    shadowColor: "#1A365D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
  },
  iconoSiNo: {
    alignItems: "center",
    justifyContent: "center",
  },

  opcionesSilueta: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 4,
  },
  filaSiluetaSuperior: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  filaSiluetaInferior: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 12,
  },
  tarjetaSiluetaOpcion: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#1A365D",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
  },
  tarjetaSiluetaSuperior: {
    width: (width - 60) / 2,
    aspectRatio: 1,
  },
  tarjetaSiluetaInferior: {
    width: (width - 60) / 2,
    aspectRatio: 1,
  },
  siluetaOpcionGrande: {
    width: "80%",
    height: "80%",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(26,54,93,0.7)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    width: "100%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  buhoModal: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  modalTitulo: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 22,
    color: "#1A365D",
    textAlign: "center",
    marginBottom: 20,
  },
  modalBotones: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  modalBoton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#1A3C5E",
  },
  modalBotonSi: {
    backgroundColor: "#4CAF7A",
  },
  modalBotonNo: {
    backgroundColor: "#F47C7C",
  },
  modalBotonTexto: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 20,
    color: "#FFFFFF",
  },

  overlaySabiasQue: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  overlaySabiasQueFondo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  tarjetaSabiasQue: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    width: "100%",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  headerSabiasQue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  tituloSabiasQue: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 24,
    color: "#6C3FCF",
  },
  circuloSabiasQue: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: 24,
    backgroundColor: "#1A3C5E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  imagenSabiasQue: {
    width: width * 0.4,
    height: width * 0.4,
  },
  nombreSabiasQue: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 26,
    color: "#1A3C5E",
    marginBottom: 6,
  },
  textoSabiasQue: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 16,
    color: "#1A3C5E",
    textAlign: "justify",
    lineHeight: 26,
    paddingHorizontal: 4,
    marginBottom: 16,
  },

  botonContinuar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFC400",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 50,
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#1A3C5E",
    elevation: 6,
    shadowColor: "#1A3C5E",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    gap: 8,
  },
  textoBotonContinuar: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 18,
    color: "#1A3C5E",
  },

  cuerpoFin: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  tituloFin: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 30,
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtituloFin: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 17,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  filaEstrellasFin: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginVertical: 8,
    maxWidth: 240,
  },
  estrellaFin: { width: 28, height: 28 },
  estrellaFinVacia: { tintColor: "rgba(255,255,255,0.35)" },

  textoCorrectoSilueta: {
    marginBottom: 150,
  },
  textoIncorrectoSilueta: {
    marginBottom: 180, 
    marginTop: -150,
  },
  textoCorrectoSino: {
    marginBottom: 180,
    marginTop: -120,
  },
  textoIncorrectoSino: {
    marginBottom: 180,
    marginTop: -120,
  },
});