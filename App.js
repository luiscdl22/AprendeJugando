import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StarProvider, useStars } from './context/StarContext';

import HomeScreen      from './screens/HomeScreen';
import BienvenidaScreen from './screens/BienvenidaScreen';
import ComoJugar       from './screens/ComoJugar';
import MenuScreen      from './screens/MenuScreen';
import CategoriaDetalleScreen from './screens/CategoriaDetalleScreen';
import PerfilScreen    from './screens/PerfilScreen';
import AnimalesScreen  from './screens/AnimalesScreen';
import NaturalezaScreen  from './screens/NaturalezaScreen';
import UtilesScreen from './screens/UtilesScreen';
import VehiculosScreen from './screens/VehiculosScreen';


const Stack = createNativeStackNavigator();

// Carga las estrellas desde AsyncStorage al arrancar la app
function AppNavigator() {
  const { cargarEstrellas } = useStars();
  useEffect(() => { cargarEstrellas(); }, []);

  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"       component={HomeScreen} />
      <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />
      <Stack.Screen name="ComoJugar"  component={ComoJugar} />
      <Stack.Screen name="Menu"       component={MenuScreen} />
      <Stack.Screen name="CategoriaDetalle" component={CategoriaDetalleScreen} />
      <Stack.Screen name="Perfil"     component={PerfilScreen} />
      <Stack.Screen name="Animales"   component={AnimalesScreen} />
      <Stack.Screen name="Naturaleza"  component={NaturalezaScreen} />
      <Stack.Screen name="Utiles"     component={UtilesScreen} />
      <Stack.Screen name="Vehiculos"  component={VehiculosScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    // StarProvider envuelve toda la app — cualquier pantalla puede leer/escribir estrellas
    <StarProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </StarProvider>
  );
}