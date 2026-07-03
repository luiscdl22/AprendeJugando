import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function StatusMark({ variant = 'check', size = 28 }) {
  const bodySize = Math.round(size * 0.58);
  const stroke = Math.max(2, Math.round(size * 0.12));
  const color = variant === 'check' ? '#1A365D' : '#1A3C5E';
  const backgroundColor = variant === 'check' ? '#FFD166' : '#F4F7FB';

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      {variant === 'check' ? (
        <View style={styles.checkWrap}>
          <View
            style={[
              styles.checkShort,
              {
                width: bodySize * 0.42,
                height: stroke,
                backgroundColor: color,
                left: bodySize * 0.08,
                top: bodySize * 0.46,
                transform: [{ rotate: '45deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.checkLong,
              {
                width: bodySize * 0.72,
                height: stroke,
                backgroundColor: color,
                left: bodySize * 0.22,
                top: bodySize * 0.34,
                transform: [{ rotate: '-45deg' }],
              },
            ]}
          />
        </View>
      ) : (
        <View style={styles.lockWrap}>
          <View
            style={[
              styles.lockShackle,
              {
                width: bodySize * 0.5,
                height: bodySize * 0.42,
                borderWidth: stroke,
                borderColor: color,
                top: bodySize * 0.02,
              },
            ]}
          />
          <View
            style={[
              styles.lockBody,
              {
                width: bodySize * 0.78,
                height: bodySize * 0.6,
                backgroundColor: color,
                bottom: bodySize * 0.02,
              },
            ]}
          />
          <View
            style={[
              styles.lockKeyhole,
              {
                width: stroke,
                height: bodySize * 0.2,
                backgroundColor: backgroundColor,
                bottom: bodySize * 0.12,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  checkWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  checkShort: {
    position: 'absolute',
    borderRadius: 999,
  },
  checkLong: {
    position: 'absolute',
    borderRadius: 999,
  },
  lockWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lockShackle: {
    position: 'absolute',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  lockBody: {
    position: 'absolute',
    borderRadius: 8,
  },
  lockKeyhole: {
    position: 'absolute',
    borderRadius: 999,
  },
});