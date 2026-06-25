import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import BienvenidaScreen from './screens/BienvenidaScreen';
import ComoJugar from './screens/ComoJugar';
import CategoriasScreen from './screens/CategoriasScreen';
import PerfilScreen from './screens/PerfilScreen';
import AnimalesScreen from './screens/AnimalesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />
        <Stack.Screen name="ComoJugar" component={ComoJugar} />
        <Stack.Screen name="Categorias" component={CategoriasScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Animales" component={AnimalesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}