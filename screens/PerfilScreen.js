import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../components/CustomButton';
import StatusMark from '../components/StatusMark';

const AVATARES = [
  { id: 1, imagen: require('../assets/images/avatar1.png') },
  { id: 2, imagen: require('../assets/images/avatar2.png') },
  { id: 3, imagen: require('../assets/images/avatar3.png') },
  { id: 4, imagen: require('../assets/images/avatar4.png') },
  { id: 5, imagen: require('../assets/images/avatar5.png') },
];

export default function PerfilScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const [perfil, setPerfil]           = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  // Controla si se muestra el selector de avatar inline
  const [cambiandoAvatar, setCambiandoAvatar] = useState(false);
  const [avatarTemp, setAvatarTemp]   = useState(null);

  useEffect(() => { cargarDatos(); }, []);

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

  // Guarda el nuevo avatar y cierra el selector
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
    ? AVATARES.find(a => a.id === perfil.avatarSeleccionado)?.imagen
    : null;

  if (!fontsLoaded || !perfil) return null;

  return (
    <LinearGradient
      colors={['#D0E8F2', '#B8DAF0', '#A0CCE8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.fondo}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.contenido}>

        <CustomButton
          label="Regresar"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={{ alignSelf: 'flex-start', marginBottom: 16 }}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Tarjeta principal de perfil */}
          <View style={styles.tarjetaPerfil}>

            {/* Avatar grande con botón de edición */}
            <View style={styles.contenedorAvatar}>
              <View style={styles.circuloAvatarGrande}>
                {avatarImg && (
                  <Image source={avatarImg} style={styles.avatarImg} resizeMode="cover" />
                )}
              </View>
              {/* Botón de lápiz para abrir selector de avatar */}
              <TouchableOpacity
                style={styles.botonEditarAvatar}
                onPress={() => setCambiandoAvatar(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.iconoEditar}>Editar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.nombreTexto}>{perfil.nombre}</Text>
            <Text style={styles.edadTexto}>{perfil.edad} años</Text>

            <CustomButton
              label="Cambiar personaje"
              onPress={() => setCambiandoAvatar(true)}
              variant="primary"
              style={{ marginTop: 8 }}
            />
          </View>

          {/* Botón cerrar sesión */}
          <CustomButton
            label="Cambiar jugador"
            onPress={() => setModalVisible(true)}
            variant="danger"
            fullWidth
            style={{ marginTop: 16 }}
          />

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Modal selector de avatar */}
      <Modal
        transparent
        animationType="slide"
        visible={cambiandoAvatar}
        onRequestClose={() => setCambiandoAvatar(false)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.tituloModal}>Elige tu personaje</Text>

            <View style={styles.gridAvatares}>
              {AVATARES.map(av => (
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
                      {avatarTemp === av.id && <View style={styles.seleccionAvatar}><StatusMark variant="check" size={22} /></View>}
                </TouchableOpacity>
              ))}
            </View>

            <CustomButton label="Guardar" onPress={guardarAvatar} variant="primary" fullWidth />
            <CustomButton
              label="Cancelar"
              onPress={() => { setAvatarTemp(perfil.avatarSeleccionado); setCambiandoAvatar(false); }}
              variant="secondary"
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal confirmación cambiar jugador */}
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
            <Text style={styles.tituloModal}>¿Cambiar jugador?</Text>
            <Text style={styles.subtituloModal}>
              Se cerrará la sesión de{'\n'}
              <Text style={styles.nombreModal}>{perfil.nombre}</Text>
            </Text>
            <CustomButton label="Sí, cambiar" onPress={cerrarSesion} variant="danger" fullWidth />
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

  // Tarjeta perfil — blanca, sin bordes duros, sombra suave
  tarjetaPerfil: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#A8C2DC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },

  // Avatar con botón de lápiz superpuesto
  contenedorAvatar: {
    position: 'relative',
    marginBottom: 14,
  },
  circuloAvatarGrande: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFD166',
    overflow: 'hidden',
    elevation: 4,
  },
  avatarImg: { width: '100%', height: '100%' },
  botonEditarAvatar: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    minWidth: 72,
    height: 34,
    borderRadius: 18,
    backgroundColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  iconoEditar: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 11,
    color: '#1A365D',
  },

  nombreTexto: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 30,
    color: '#1A365D',
  },
  edadTexto: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 16,
    color: '#4A6FD4',
    marginTop: 2,
    marginBottom: 8,
  },

  // Modal base
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26,54,93,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  tarjetaModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    elevation: 10,
    gap: 10,
  },
  tituloModal: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 22,
    color: '#1A365D',
    textAlign: 'center',
  },
  subtituloModal: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 16,
    color: '#4A6FD4',
    textAlign: 'center',
    lineHeight: 24,
  },
  nombreModal: {
    fontFamily: 'Baloo2_800ExtraBold',
    color: '#1A365D',
  },
  mascotaModal: { width: 90, height: 90 },

  // Grid de avatares en el modal
  gridAvatares: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginVertical: 8,
  },
  opcionAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: '#F4F7FB',
    elevation: 2,
  },
  opcionAvatarSeleccionada: {
    borderColor: '#FFD166',
    backgroundColor: '#FFF8E1',
  },
  imgAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  seleccionAvatar: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});