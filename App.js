import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />

        {/*
          Próximo paso: agregar aquí la pantalla de Categorías, por ejemplo:
          <Stack.Screen name="Categorias" component={CategoriasScreen} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}