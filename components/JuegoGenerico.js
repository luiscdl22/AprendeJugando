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
import Confetti from "react-native-confetti";
import { useAudioPlayer } from "expo-audio";

import { useStars } from "../context/StarContext";
import CustomButton from "../components/CustomButton";

const { width } = Dimensions.get("window");

function mezclar(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function otrosAleatorios(todos, excluirId, cantidad) {
  return mezclar(todos.filter((a) => a.id !== excluirId)).slice(0, cantidad);
}

function generarNiveles(datos, tipos) {
  const seleccionados = mezclar(datos).slice(0, datos.length);
  return seleccionados.map((item, i) => {
    const tipo =
      tipos[
        i % tipos.length === 0 && i > 0
          ? Math.floor(Math.random() * tipos.length)
          : i % tipos.length
      ];
    const otros = otrosAleatorios(datos, item.id, 2);

    if (tipo === "nombre") {
      return {
        tipo,
        item,
        dato: item.dato,
        opciones: mezclar([item.nombre, ...otros.map((o) => o.nombre)]),
        respuestaCorrecta: item.nombre,
      };
    }
    if (tipo === "sino") {
      const esVerdadero = Math.random() > 0.5;
      const nombreMostrado = esVerdadero ? item.nombre : otros[0].nombre;
      return {
        tipo,
        item,
        dato: item.dato,
        nombreMostrado,
        respuestaCorrecta: esVerdadero ? "Sí" : "No",
        opciones: ["Sí", "No"],
      };
    }
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
  const [mostrarDato, setMostrarDato] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [puntajeFinal, setPuntajeFinal] = useState(0);
  const [mostrarOverlay, setMostrarOverlay] = useState(false);
  const [mostrarCorrecto, setMostrarCorrecto] = useState(false);
  const [mostrarInfo, setMostrarInfo] = useState(false);

  const escalaImagen = useRef(new Animated.Value(1)).current;
  const opacidadImagen = useRef(new Animated.Value(1)).current;
  const escalaFeedback = useRef(new Animated.Value(0.92)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(0.7)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const correctoScale = useRef(new Animated.Value(0.3)).current;
  const correctoOpacity = useRef(new Animated.Value(0)).current;
  const infoOpacity = useRef(new Animated.Value(0)).current;

  const flote1 = useFlote(10, 2600, 0);
  const flote2 = useFlote(14, 3200, 300);
  const flote3 = useFlote(8, 2800, 500);

  const confetiRef = useRef(null);

  const nivel = niveles[indiceNivel];
  const totalNiveles = niveles.length;

  const animalAudio = useAudioPlayer(nivel?.item?.datoAudio || null);
  const aciertoSound = useAudioPlayer(require("../assets/sounds/acierto.mp3"));
  const errorSound = useAudioPlayer(require("../assets/sounds/error.mp3"));

  useEffect(() => {
    if (finalizado) {
      actualizarEstrellas(categoria, puntos);
      setPuntajeFinal(puntos);
    }
  }, [actualizarEstrellas, categoria, finalizado, puntos]);

  useEffect(() => {
    if (respuesta === "correcto" && mostrarDato) {
      setMostrarOverlay(true);
      setMostrarCorrecto(true);
      setMostrarInfo(false);

      Animated.parallel([
        Animated.spring(overlayScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.parallel([
        Animated.spring(correctoScale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(correctoOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      try {
        aciertoSound?.seekTo(0);
        aciertoSound?.play();
      } catch (e) {}

      setTimeout(() => {
        setMostrarCorrecto(false);
        setMostrarInfo(true);

        Animated.timing(infoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();

        setTimeout(() => {
          if (nivel?.item?.datoAudio) {
            try {
              animalAudio?.seekTo(0);
              animalAudio?.play();
            } catch (e) {}
          }
        }, 400);
      }, 1800);
    }

    if (respuesta === "incorrecto") {
      try {
        errorSound?.seekTo(0);
        errorSound?.play();
      } catch (e) {}
    }
  }, [respuesta, mostrarDato, nivel, animalAudio, aciertoSound, errorSound]);

  if (!fontsLoaded) return null;

  const resetAnimaciones = () => {
    opacidadImagen.setValue(1);
    escalaImagen.setValue(1);
    escalaFeedback.setValue(0.92);
    shakeAnim.setValue(0);
    overlayScale.setValue(0.7);
    overlayOpacity.setValue(0);
    correctoScale.setValue(0.3);
    correctoOpacity.setValue(0);
    infoOpacity.setValue(0);
    setMostrarOverlay(false);
    setMostrarCorrecto(false);
    setMostrarInfo(false);
  };

  const reiniciar = () => {
    setNiveles(generarNiveles(datos, ["nombre", "sino", "silueta"]));
    setIndiceNivel(0);
    setPuntos(0);
    setRespuesta(null);
    setOpcionElegida(null);
    setMostrarColor(false);
    setMostrarDato(false);
    setFinalizado(false);
    setPuntajeFinal(0);
    resetAnimaciones();
  };

  const avanzarNivel = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(overlayScale, {
        toValue: 0.7,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMostrarOverlay(false);

      if (indiceNivel + 1 >= totalNiveles) {
        setFinalizado(true);
        if (puntos === totalNiveles) {
          setTimeout(() => {
            confetiRef.current?.startConfetti();
          }, 500);
        }
        return;
      }
      setIndiceNivel((v) => v + 1);
      setRespuesta(null);
      setOpcionElegida(null);
      setMostrarColor(false);
      setMostrarDato(false);
      resetAnimaciones();
    });
  };

  const animarCambio = (callback) => {
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
      callback();
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
        Animated.spring(escalaFeedback, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const animarTemblor = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const elegir = (opcion) => {
    if (respuesta) return;
    setOpcionElegida(opcion);
    const correcto = opcion === nivel.respuestaCorrecta;
    setRespuesta(correcto ? "correcto" : "incorrecto");
    if (correcto) {
      setPuntos((v) => v + 1);
      animarCambio(() => {
        setMostrarColor(true);
        setMostrarDato(true);
      });
    } else {
      animarTemblor();
      animarCambio(() => {
        setMostrarColor(true);
        setMostrarDato(false);
      });
    }
  };

  const etiquetaTipo = () => {
    if (!nivel) return "";
    if (nivel.tipo === "nombre") return "¿Qué animal es este?";
    if (nivel.tipo === "sino") {
      const articulo = nivel.item.articulo === "la" ? "una" : "un";
      return `¿Es ${articulo} ${nivel.nombreMostrado}?`;
    }
    if (nivel.tipo === "silueta") {
      return `¿Cuál es la silueta de ${nivel.item.articulo} ${nivel.item.nombre}?`;
    }
  };

  const etiquetaBadge = () => {
    if (!nivel) return "";
    if (nivel.tipo === "nombre") return "¿Qué animal es?";
    if (nivel.tipo === "sino") return "¿Es cierto o no?";
    if (nivel.tipo === "silueta") return "Elige la silueta";
  };

  const obtenerMensajeMotivador = (puntaje, total) => {
    const porcentaje = puntaje / total;
    if (porcentaje === 1) {
      return {
        mensaje:
          "¡Perfecto! ¡Eres un campeón! Has aprendido todos los animales. ¡Felicidades!",
        icono: "trophy",
      };
    } else if (porcentaje >= 0.7) {
      return {
        mensaje: "¡Excelente! Casi lo logras. ¡Eres muy inteligente!",
        icono: "star",
      };
    } else if (porcentaje >= 0.4) {
      return {
        mensaje:
          "¡Bien hecho! Estás aprendiendo mucho. ¡Un poquito más y lo logras!",
        icono: "happy",
      };
    } else {
      return {
        mensaje:
          "¡No te rindas! Cada vez que juegas aprendes más. ¡Sigue practicando!",
        icono: "fitness",
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
            <Confetti ref={confetiRef} />

            <Ionicons
              name={esPerfecto ? "trophy" : mensaje.icono}
              size={60}
              color="#FFD166"
            />

            <Text style={styles.tituloFin}>
              {esPerfecto ? "¡Muy bien!" : "¡Terminaste!"}
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
              label="Volver al menú"
              onPress={() => navigation.goBack()}
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

      <SafeAreaView style={styles.contenido}>
        <View style={styles.headerCoral}>
          <View style={styles.headerFila}>
            <TouchableOpacity
              style={styles.botonRegresar}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="#1A3C5E" />
            </TouchableOpacity>
            <View style={styles.headerCentro}>
              <Text style={styles.headerTitulo}>{titulo}</Text>
            </View>
            <View style={styles.badgeEstrella}>
              <Ionicons name="star" size={16} color="#1A3C5E" />
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
          <Text style={styles.textoProgreso}>
            Pregunta {indiceNivel + 1}/{totalNiveles}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <Animated.View
            style={[
              styles.tarjetaSilueta,
              {
                transform: [
                  {
                    translateX: shakeAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-8, 8],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.preguntaDentro}>{etiquetaTipo()}</Text>

            <View style={[styles.circuloImagen, { backgroundColor: colorFondo }]}>
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
              <Ionicons name="search-outline" size={16} color="#1A3C5E" />
              <Text style={styles.textoPista} numberOfLines={3}>
                {nivel.item.pista}
              </Text>
            </View>
          </Animated.View>

          {nivel.tipo === "nombre" && (
            <View style={styles.opciones}>
              {nivel.opciones.map((opcion, i) => {
                const seleccionada = opcionElegida === opcion;
                const colorBase =
                  !respuesta || !seleccionada
                    ? "#FFFFFF"
                    : respuesta === "correcto"
                      ? "#88CC88"
                      : "#F47C7C";
                const bordeBase =
                  !respuesta || !seleccionada
                    ? "rgba(26,60,94,0.2)"
                    : respuesta === "correcto"
                      ? "#4AAE4A"
                      : "#D45A5A";
                return (
                  <TouchableOpacity
                    key={opcion}
                    style={[
                      styles.botonOpcion,
                      { backgroundColor: colorBase, borderColor: bordeBase },
                    ]}
                    onPress={() => elegir(opcion)}
                    activeOpacity={0.84}
                    disabled={!!respuesta}
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
                const esCorrecto = opcion === nivel.respuestaCorrecta;

                let colorBase = "#FFFFFF";
                let bordeBase = "rgba(26,60,94,0.2)";
                let textColor = "#1A3C5E";

                if (respuesta) {
                  if (seleccionada && esCorrecto) {
                    colorBase = "#88CC88";
                    bordeBase = "#4AAE4A";
                    textColor = "#1A3C5E";
                  } else if (seleccionada && !esCorrecto) {
                    colorBase = "#F47C7C";
                    bordeBase = "#D45A5A";
                    textColor = "#FFFFFF";
                  } else if (!seleccionada && esCorrecto) {
                    colorBase = "#88CC88";
                    bordeBase = "#4AAE4A";
                    textColor = "#1A3C5E";
                  }
                }

                return (
                  <TouchableOpacity
                    key={opcion}
                    style={[
                      styles.botonSiNo,
                      { backgroundColor: colorBase, borderColor: bordeBase },
                    ]}
                    onPress={() => elegir(opcion)}
                    activeOpacity={0.84}
                    disabled={!!respuesta}
                  >
                    <Ionicons
                      name={
                        opcion === "Sí" ? "checkmark-circle" : "close-circle"
                      }
                      size={28}
                      color={textColor}
                    />
                    <Text style={[styles.textoOpcion, { color: textColor }]}>
                      {opcion}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {nivel.tipo === "silueta" && (
            <View style={styles.opcionesSilueta}>
              {nivel.opcionesItems.map((item) => {
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
                }

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.tarjetaSiluetaOpcion,
                      { backgroundColor: colorBase, borderColor: bordeBase },
                    ]}
                    onPress={() => elegir(item.id)}
                    activeOpacity={0.84}
                    disabled={!!respuesta}
                  >
                    <Image
                      source={
                        mostrarColor && esCorrecta ? item.color : item.silueta
                      }
                      style={styles.siluetaOpcion}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {respuesta === "incorrecto" && (
            <View style={styles.tarjetaEra}>
              <Ionicons name="sad-outline" size={32} color="#1A3C5E" />
              <Text style={styles.textoEra}>
                Era:{" "}
                <Text style={styles.textoEraDestacado}>
                  {nivel.item.nombre}
                </Text>
              </Text>
              <TouchableOpacity
                style={styles.botonContinuarEra}
                onPress={avanzarNivel}
                activeOpacity={0.85}
              >
                <Text style={styles.textoBotonContinuarEra}>
                  {indiceNivel + 1 >= totalNiveles
                    ? "Ver mis resultados"
                    : "Siguiente"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#1A3C5E" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {respuesta === "correcto" && mostrarDato && (
        <Animated.View
          style={[
            styles.overlayCelebracion,
            {
              opacity: overlayOpacity,
              transform: [{ scale: overlayScale }],
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(91,174,91,0.95)", "rgba(46,125,50,0.95)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.overlayGradient}
          >
            <SafeAreaView style={styles.overlayContenido}>
              <View style={styles.overlayFila}>
                <View style={styles.overlayBadgeCategoria}>
                  <Ionicons name="paw" size={14} color="#FFFFFF" />
                  <Text style={styles.overlayBadgeCategoriaTexto}>
                    {titulo}
                  </Text>
                </View>
                <View style={styles.overlayBadgeProgreso}>
                  <Text style={styles.overlayBadgeProgresoTexto}>
                    {indiceNivel + 1}/{totalNiveles}
                  </Text>
                </View>
              </View>

              <View style={styles.overlayCuerpo}>
                {mostrarCorrecto && (
                  <Animated.View
                    style={[
                      styles.correctoContainer,
                      {
                        opacity: correctoOpacity,
                        transform: [{ scale: correctoScale }],
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={70}
                      color="#FFD166"
                    />
                    <Text style={styles.correctoTexto}>¡Correcto!</Text>
                  </Animated.View>
                )}

                {mostrarInfo && (
                  <Animated.View
                    style={[
                      styles.tarjetaResultado,
                      {
                        opacity: infoOpacity,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.circuloResultado,
                        { backgroundColor: colorFondo },
                      ]}
                    >
                      <Image
                        source={nivel.item.color}
                        style={styles.imagenResultado}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.nombreResultado}>
                      {nivel.item.nombre}
                    </Text>

                    <View style={styles.lineaDivisoria} />

                    <View style={styles.badgeDato}>
                      <Ionicons name="bulb-outline" size={14} color="#FFFFFF" />
                      <Text style={styles.badgeDatoTexto}>¿Sabías que...?</Text>
                    </View>
                    <Text style={styles.textoDato}>{nivel.item.dato}</Text>
                  </Animated.View>
                )}

                {mostrarInfo && (
                  <TouchableOpacity
                    style={styles.botonContinuar}
                    onPress={avanzarNivel}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.textoBotonContinuar}>
                      {indiceNivel + 1 >= totalNiveles
                        ? "Ver mis resultados"
                        : "Siguiente silueta"}
                    </Text>
                    <Ionicons name="arrow-forward" size={22} color="#1A3C5E" />
                  </TouchableOpacity>
                )}
              </View>
            </SafeAreaView>
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
    backgroundColor: "#FFC400",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  badgeNum: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 14,
    color: "#1A3C5E",
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
  textoProgreso: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    textAlign: "left",
    paddingHorizontal: 16,
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
    borderWidth: 3,
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
    width: width * 0.62,
    height: width * 0.62,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  silueta: {
    width: width * 0.50,
    height: width * 0.30,
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
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: "rgba(26,60,94,0.12)",
    width: "100%",
  },
  textoPista: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 15,
    color: "#1A3C5E",
    textAlign: "left",
    lineHeight: 20,
    flex: 1,
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

  opcionesSiNo: { flexDirection: "row", gap: 12 },
  botonSiNo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 22,
    borderWidth: 3,
    gap: 8,
    backgroundColor: "#FFFFFF",
  },

  opcionesSilueta: { flexDirection: "row", gap: 10 },
  tarjetaSiluetaOpcion: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 3,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  siluetaOpcion: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
  },

  tarjetaEra: {
    backgroundColor: "rgba(244,124,124,0.95)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D45A5A",
    padding: 16,
    marginTop: 14,
    alignItems: "center",
    gap: 8,
  },
  textoEra: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 18,
    color: "#1A3C5E",
    textAlign: "center",
  },
  textoEraDestacado: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 20,
    color: "#D45A5A",
  },
  botonContinuarEra: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFC400",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 40,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1A3C5E",
    gap: 8,
  },
  textoBotonContinuarEra: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 15,
    color: "#1A3C5E",
  },

  overlayCelebracion: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlayGradient: {
    flex: 1,
  },
  overlayContenido: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  overlayFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 8,
  },
  overlayCuerpo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingVertical: 8,
  },
  overlayBadgeCategoria: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 6,
  },
  overlayBadgeCategoriaTexto: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  overlayBadgeProgreso: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  overlayBadgeProgresoTexto: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },

  correctoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  correctoTexto: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 50,
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  tarjetaResultado: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 10,
    elevation: 8,
    shadowColor: "#1A3C5E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    maxHeight: "72%",
  },
  circuloResultado: {
    width: width * 0.38,
    height: width * 0.38,
    borderRadius: 24,
    backgroundColor: "#1A3C5E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  imagenResultado: {
    width: width * 0.38,
    height: width * 0.38,
  },
  nombreResultado: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 20,
    color: "#1A3C5E",
    marginBottom: 4,
  },
  lineaDivisoria: {
    width: "70%",
    height: 1,
    backgroundColor: "rgba(26,60,94,0.1)",
    marginBottom: 6,
  },
  badgeDato: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C3FCF",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 12,
    marginBottom: 6,
    gap: 4,
  },
  badgeDatoTexto: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  textoDato: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 14,
    color: "#1A3C5E",
    textAlign: "justify",
    lineHeight: 20,
    paddingHorizontal: 2,
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
});