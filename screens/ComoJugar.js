import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

const PASOS = [
  {
    numero: '1',
    color: '#8B5CF6',
    colorBorde: '#6D46D8',
    imagen: require('../assets/images/cat_animales.png'),
    titulo: 'Elige una categoría',
    descripcion: 'Animales, vehículos, dinosaurios o espacio.',
  },
  {
    numero: '2',
    color: '#4FC3D5',
    colorBorde: '#379EB4',
    imagen: require('../assets/images/tut_paso2.png'),
    titulo: 'Lee y observa',
    descripcion: 'La información se queda visible para leer sin prisa.',
  },
  {
    numero: '3',
    color: '#FFB347',
    colorBorde: '#D98D2F',
    imagen: require('../assets/images/tut_paso3.png'),
    titulo: 'Mira el video',
    descripcion: 'Un video corto ayuda a entender mejor la categoría.',
  },
  {
    numero: '4',
    color: '#88CC88',
    colorBorde: '#5FA95F',
    imagen: require('../assets/images/tut_paso4.png'),
    titulo: 'Juega',
    descripcion: 'Después entra al rompecabezas de siluetas.',
  },
];

export default function ComoJugar({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const scrollRef = useRef(null);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={['#6C3FCF', '#4A6FD4', '#E8F4FD']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.fondo}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.contenido}>
        <CustomButton
          label="Regresar"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={{ alignSelf: 'flex-start', marginBottom: 10 }}
        />

        <Text style={styles.titulo}>Cómo jugar</Text>
        <Text style={styles.subtituloPrincipal}>Una guía corta para entrar rápido a las categorías y al rompecabezas.</Text>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContenido}
          showsVerticalScrollIndicator={false}
        >
          {PASOS.map((paso, index) => (
            <View
              key={paso.numero}
              style={[styles.tarjeta, { backgroundColor: paso.color, borderColor: paso.colorBorde }]}
            >
              <View style={styles.filaSuperior}>
                <View style={styles.circuloNumero}>
                  <Text style={styles.numero}>{paso.numero}</Text>
                </View>
                <Text style={styles.titulopaso}>{paso.titulo}</Text>
              </View>

              <View style={styles.circuloImagen}>
                <Image source={paso.imagen} style={styles.imagen} resizeMode="contain" />
              </View>

              <Text style={styles.descripcion}>{paso.descripcion}</Text>
              {index < PASOS.length - 1 && <Text style={styles.flechaEntrada}>Desliza</Text>}
            </View>
          ))}

          <View style={{ height: 20 }} />
        </ScrollView>

        <CustomButton
          label="IR A CATEGORÍAS"
          onPress={() => navigation.navigate('Categorias')}
          variant="primary"
          fullWidth
          style={{ marginTop: 12 }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  titulo: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 34,
    color: '#1A3C5E',
    textAlign: 'center',
    marginBottom: 14,
  },
  subtituloPrincipal: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 14,
    color: 'rgba(26,60,94,0.78)',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 20,
  },
  scroll: { flex: 1 },
  scrollContenido: { paddingBottom: 8 },

  tarjeta: {
    borderRadius: 28,
    borderWidth: 3,
    padding: 22,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 5,
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  circuloNumero: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(26,60,94,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  numero: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 24, color: '#1A3C5E',
  },
  titulopaso: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 22, color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  circuloImagen: {
    width: width * 0.54, height: width * 0.54,
    borderRadius: width * 0.27,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  imagen: { width: width * 0.42, height: width * 0.42 },
  descripcion: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 18, color: '#FFFFFF',
    textAlign: 'center', lineHeight: 25,
  },
  flechaEntrada: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
    textAlign: 'center',
  },
});