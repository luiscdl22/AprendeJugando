import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import CustomButton from '../components/CustomButton';
import { useStars } from '../context/StarContext';

const AVATARES = [
  { id: 1, imagen: require('../assets/images/avatar1.png'), nombre: 'Valiente' },
  { id: 2, imagen: require('../assets/images/avatar2.png'), nombre: 'Alegre' },
  { id: 3, imagen: require('../assets/images/avatar3.png'), nombre: 'Creativo' },
  { id: 4, imagen: require('../assets/images/avatar4.png'), nombre: 'Explorador' },
  { id: 5, imagen: require('../assets/images/avatar5.png'), nombre: 'Amigable' },
];

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

export default function PerfilScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const [perfil, setPerfil] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cambiandoAvatar, setCambiandoAvatar] = useState(false);
  const [avatarTemp, setAvatarTemp] = useState(null);
  const { estrellas } = useStars();

  const flote1 = useFlote(12, 2800, 0);
  const flote2 = useFlote(16, 3400, 200);
  const flote3 = useFlote(10, 2600, 400);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const p = await AsyncStorage.getItem('perfil');
      if (p) {
        const parsed = JSON.parse(p);
        setPerfil(parsed);
        setAvatarTemp(parsed.avatarSeleccionado);
      }
    } catch (_) {}
  };

  const guardarAvatar = async () => {
    try {
      const nuevo = { ...perfil, avatarSeleccionado: avatarTemp };
      await AsyncStorage.setItem('perfil', JSON.stringify(nuevo));
      setPerfil(nuevo);
    } catch (_) {}
    setCambiandoAvatar(false);
  };

  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('perfil');
      await AsyncStorage.removeItem('estrellas');
    } catch (_) {}
    setModalVisible(false);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const avatarImg = perfil
    ? AVATARES.find((a) => a.id === perfil.avatarSeleccionado)?.imagen
    : null;

  const nombreAvatar = perfil
    ? AVATARES.find((a) => a.id === perfil.avatarSeleccionado)?.nombre
    : '';

  const totalEstrellas = Object.values(estrellas).reduce((sum, v) => sum + v, 0);
  const juegosCompletados = Object.keys(estrellas).length;
  const nivel = Math.floor(totalEstrellas / 5) + 1;

  if (!fontsLoaded || !perfil) return null;

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
        <TouchableOpacity
          style={styles.botonRegresar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.textoRegresar}>Regresar</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.tarjetaPerfil}>
            <View style={styles.contenedorAvatar}>
              <View style={styles.circuloAvatarGrande}>
                {avatarImg && (
                  <Image source={avatarImg} style={styles.avatarImg} resizeMode="cover" />
                )}
              </View>
              <TouchableOpacity
                style={styles.botonEditarAvatar}
                onPress={() => setCambiandoAvatar(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil" size={18} color="#1A365D" />
                <Text style={styles.textoEditarAvatar}>Cambiar avatar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.nombreTexto}>{perfil.nombre}</Text>
            <View style={styles.filaPersonaje}>
              <View style={styles.personajeTag}>
                <Ionicons name="person" size={16} color="#4A6FD4" />
                <Text style={styles.personajeTexto}>{nombreAvatar}</Text>
              </View>
              <View style={styles.edadTag}>
                <Ionicons name="calendar" size={14} color="#6C3FCF" />
                <Text style={styles.edadTexto}>{perfil.edad} años</Text>
              </View>
            </View>

            <View style={styles.filaEstadisticas}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={28} color="#FFD166" />
                <Text style={styles.statNumero}>{totalEstrellas}</Text>
                <Text style={styles.statLabel}>Estrellas</Text>
              </View>
              <View style={styles.separadorStat} />
              <View style={styles.statItem}>
                <Ionicons name="game-controller" size={28} color="#4A6FD4" />
                <Text style={styles.statNumero}>{juegosCompletados}</Text>
                <Text style={styles.statLabel}>Juegos</Text>
              </View>
              <View style={styles.separadorStat} />
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={28} color="#FFC400" />
                <Text style={styles.statNumero}>{nivel}</Text>
                <Text style={styles.statLabel}>Nivel</Text>
              </View>
            </View>

            <View style={styles.barraProgresoWrapper}>
              <View style={styles.filaProgreso}>
                <Text style={styles.textoProgreso}>Siguiente nivel</Text>
                <Text style={styles.textoProgresoValor}>
                  {totalEstrellas % 5} / 5 estrellas
                </Text>
              </View>
              <View style={styles.barraFondo}>
                <View
                  style={[
                    styles.barraRelleno,
                    { width: `${((totalEstrellas % 5) / 5) * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.tarjetaLogros}>
            <View style={styles.headerLogros}>
              <Ionicons name="ribbon" size={24} color="#6C3FCF" />
              <Text style={styles.tituloLogros}>Mis logros</Text>
            </View>
            <View style={styles.gridLogros}>
              {['Animales', 'Vehículos', 'Útiles', 'Naturaleza'].map((cat) => {
                const completado = estrellas[cat.toLowerCase()] > 0;
                return (
                  <View key={cat} style={styles.logroItem}>
                    <View style={[styles.logroCirculo, completado && styles.logroCompletadoCirculo]}>
                      {completado ? (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      ) : (
                        <Ionicons name="lock-closed" size={12} color="#A0B4C8" />
                      )}
                    </View>
                    <Text style={[styles.logroTexto, completado && styles.logroCompletado]}>
                      {cat}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <CustomButton
            label="Salir de mi cuenta"
            onPress={() => setModalVisible(true)}
            variant="danger"
            fullWidth
            style={{ marginTop: 8 }}
          />

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal
        transparent
        animationType="slide"
        visible={cambiandoAvatar}
        onRequestClose={() => setCambiandoAvatar(false)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <View style={styles.modalHeader}>
              <Ionicons name="people" size={28} color="#6C3FCF" />
              <Text style={styles.tituloModal}>Elige tu personaje</Text>
            </View>
            <Text style={styles.subtituloModal}>Toca el que más te guste</Text>

            <View style={styles.gridAvatares}>
              {AVATARES.map((av) => (
                <TouchableOpacity
                  key={av.id}
                  onPress={() => setAvatarTemp(av.id)}
                  style={[
                    styles.opcionAvatar,
                    avatarTemp === av.id && styles.opcionAvatarSeleccionada,
                  ]}
                  activeOpacity={0.8}
                >
                  <Image source={av.imagen} style={styles.imgAvatar} resizeMode="cover" />
                  {avatarTemp === av.id && (
                    <View style={styles.seleccionAvatar}>
                      <Ionicons name="checkmark-circle" size={28} color="#4CAF7A" />
                    </View>
                  )}
                  <Text style={styles.nombreAvatarModal}>{av.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.botonesModal}>
              <CustomButton label="Guardar" onPress={guardarAvatar} variant="primary" fullWidth />
              <CustomButton
                label="Cancelar"
                onPress={() => {
                  setAvatarTemp(perfil.avatarSeleccionado);
                  setCambiandoAvatar(false);
                }}
                variant="secondary"
                fullWidth
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Image
              source={require('../assets/images/mascota.png')}
              style={styles.mascotaModal}
              resizeMode="contain"
            />
            <Ionicons name="warning" size={40} color="#F47C7C" />
            <Text style={styles.tituloModal}>¿Salir de tu cuenta?</Text>
            <Text style={styles.subtituloModal}>Se cerrará la sesión de</Text>
            <Text style={styles.nombreModal}>{perfil.nombre}</Text>
            <CustomButton label="Si, salir" onPress={cerrarSesion} variant="danger" fullWidth />
            <CustomButton
              label="No, quedarme"
              onPress={() => setModalVisible(false)}
              variant="secondary"
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  scroll: { paddingBottom: 20 },

  burbuja: { position: 'absolute', borderRadius: 999 },
  burbuja1: { width: 100, height: 100, top: 30, left: -30, backgroundColor: 'rgba(255,255,255,0.08)' },
  burbuja2: { width: 70, height: 70, top: 150, right: -20, backgroundColor: 'rgba(255,255,255,0.06)' },
  burbuja3: { width: 50, height: 50, bottom: 100, left: 10, backgroundColor: 'rgba(255,255,255,0.05)' },

  botonRegresar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
    gap: 6,
  },
  textoRegresar: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  tarjetaPerfil: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#1A365D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  contenedorAvatar: {
    alignItems: 'center',
    marginBottom: 8,
  },
  circuloAvatarGrande: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#FFD166',
    overflow: 'hidden',
    elevation: 4,
  },
  avatarImg: { width: '100%', height: '100%' },

  botonEditarAvatar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFD166',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#1A3C5E',
    elevation: 6,
    shadowColor: '#1A365D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    marginTop: 10,
  },
  textoEditarAvatar: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#1A365D',
  },

  nombreTexto: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 32,
    color: '#1A365D',
  },
  filaPersonaje: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  personajeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(74,111,212,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  personajeTexto: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 15,
    color: '#4A6FD4',
  },
  edadTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(108,63,207,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  edadTexto: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 15,
    color: '#6C3FCF',
  },

  filaEstadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 14,
    backgroundColor: 'rgba(108,63,207,0.06)',
    borderRadius: 16,
    marginBottom: 16,
  },
  statItem: { alignItems: 'center', flex: 1, gap: 2 },
  statNumero: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 22,
    color: '#1A365D',
  },
  statLabel: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 11,
    color: '#6C3FCF',
  },
  separadorStat: {
    width: 1,
    backgroundColor: 'rgba(108,63,207,0.15)',
  },

  barraProgresoWrapper: { width: '100%' },
  filaProgreso: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  textoProgreso: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: '#1A365D',
  },
  textoProgresoValor: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: '#4A6FD4',
  },
  barraFondo: {
    height: 12,
    backgroundColor: 'rgba(108,63,207,0.12)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#FFD166',
  },

  tarjetaLogros: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 28,
    padding: 18,
    marginBottom: 12,
  },
  headerLogros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  tituloLogros: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#1A365D',
  },
  gridLogros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  logroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108,63,207,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  logroCirculo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(108,63,207,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logroCompletadoCirculo: {
    backgroundColor: '#4CAF7A',
  },
  logroTexto: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: 'rgba(26,54,93,0.4)',
  },
  logroCompletado: {
    color: '#1A365D',
  },

  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26,54,93,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  tarjetaModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxHeight: '90%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  tituloModal: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 22,
    color: '#1A365D',
    textAlign: 'center',
  },
  subtituloModal: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 14,
    color: '#4A6FD4',
    textAlign: 'center',
    marginBottom: 12,
  },
  nombreModal: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 20,
    color: '#6C3FCF',
    marginBottom: 16,
  },
  mascotaModal: { width: 80, height: 80 },

  gridAvatares: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 12,
  },
  opcionAvatar: {
    width: 80,
    height: 100,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: '#F4F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    elevation: 2,
  },
  opcionAvatarSeleccionada: {
    borderColor: '#FFD166',
    backgroundColor: '#FFF8E1',
  },
  imgAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  nombreAvatarModal: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 10,
    color: '#1A365D',
    marginTop: 4,
  },
  seleccionAvatar: {
    position: 'absolute',
    right: -4,
    bottom: 20,
  },
  botonesModal: { width: '100%', marginTop: 8 },
});