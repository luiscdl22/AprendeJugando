import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';

import { StarProvider, useStars } from './context/StarContext';
import LoadingScreen from './components/LoadingScreen';

import HomeScreen from './screens/HomeScreen';
import BienvenidaScreen from './screens/BienvenidaScreen';
import ComoJugar from './screens/ComoJugar';
import MenuScreen from './screens/MenuScreen';
import CategoriaDetalleScreen from './screens/CategoriaDetalleScreen';
import PerfilScreen from './screens/PerfilScreen';
import AnimalesScreen from './screens/AnimalesScreen';
import NaturalezaScreen from './screens/NaturalezaScreen';
import UtilesScreen from './screens/UtilesScreen';
import VehiculosScreen from './screens/VehiculosScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { cargarEstrellas } = useStars();
  const [fontsLoaded] = useFonts({
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });

  useEffect(() => {
    cargarEstrellas();
  }, []);

  // Muestra la pantalla de carga mientras cargan las fuentes
  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />
      <Stack.Screen name="ComoJugar" component={ComoJugar} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="CategoriaDetalle" component={CategoriaDetalleScreen} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      <Stack.Screen name="Animales" component={AnimalesScreen} />
      <Stack.Screen name="Naturaleza" component={NaturalezaScreen} />
      <Stack.Screen name="Utiles" component={UtilesScreen} />
      <Stack.Screen name="Vehiculos" component={VehiculosScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <StarProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </StarProvider>
  );
}