import React from 'react';
import { View, StyleSheet } from 'react-native';

type Props = {
  size?: number;
  percent: number;
  color?: string;
  strokeWidth?: number;
  baseColor?: string;
};

export default function CircularProgress({ size = 40, percent, color = '#34d399', strokeWidth = 6, baseColor = '#22335b' }: Props) {
  const radius = size / 2;
  const rightRotation = `${Math.min(percent, 50) * 3.6}deg`;
  const showLeft = percent > 50;
  const leftRotation = `${Math.max(0, percent - 50) * 3.6}deg`;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View style={[styles.base, { width: size, height: size, borderRadius: radius, borderWidth: strokeWidth, borderColor: baseColor }]} />

      <View style={[styles.halfWrapper, styles.rightHalf, { width: size / 2, height: size }]}> 
        <View
          style={[
            styles.halfCircle,
            {
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: strokeWidth,
              borderTopColor: color,
              borderRightColor: color,
              transform: [{ rotate: rightRotation }],
            },
          ]}
        />
      </View>

      {showLeft && (
        <View style={[styles.halfWrapper, styles.leftHalf, { width: size / 2, height: size }]}> 
          <View
            style={[
              styles.halfCircle,
              {
                width: size,
                height: size,
                borderRadius: radius,
                borderWidth: strokeWidth,
                borderTopColor: color,
                borderRightColor: color,
                transform: [{ rotate: leftRotation }],
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  base: {
    position: 'absolute',
    borderColor: '#22335b',
    backgroundColor: 'transparent',
  },
  halfWrapper: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  rightHalf: {
    right: 0,
  },
  leftHalf: {
    left: 0,
  },
  halfCircle: {
    position: 'absolute',
    top: 0,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});
