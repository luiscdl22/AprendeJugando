import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * StarContext — estado global de estrellas.
 * Cualquier pantalla puede leer `estrellas` o llamar `actualizarEstrellas`
 * sin necesidad de recargar desde AsyncStorage manualmente.
 */
const StarContext = createContext(null);

export function StarProvider({ children }) {
  const [estrellas, setEstrellas] = useState({});

  // Carga inicial desde AsyncStorage — llamar al arrancar la app
  const cargarEstrellas = useCallback(async () => {
    try {
      const e = await AsyncStorage.getItem('estrellas');
      if (e) setEstrellas(JSON.parse(e));
    } catch (_) {}
  }, []);

  // Guarda las estrellas de una categoría manteniendo el mejor puntaje
  const actualizarEstrellas = useCallback(async (categoria, cantidad) => {
    try {
      const guardado = await AsyncStorage.getItem('estrellas');
      const actual   = guardado ? JSON.parse(guardado) : {};
      const mejor    = Math.max(cantidad, actual[categoria] || 0);
      const nuevo    = { ...actual, [categoria]: mejor };
      await AsyncStorage.setItem('estrellas', JSON.stringify(nuevo));
      // Actualiza el estado en memoria — todas las pantallas suscritas se re-renderizan
      setEstrellas(nuevo);
    } catch (_) {}
  }, []);

  return (
    <StarContext.Provider value={{ estrellas, cargarEstrellas, actualizarEstrellas }}>
      {children}
    </StarContext.Provider>
  );
}

// Hook de acceso al context — uso: const { estrellas, actualizarEstrellas } = useStars();
export function useStars() {
  const ctx = useContext(StarContext);
  if (!ctx) throw new Error('useStars debe usarse dentro de <StarProvider>');
  return ctx;
}