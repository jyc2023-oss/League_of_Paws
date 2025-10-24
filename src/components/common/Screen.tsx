import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';

type ScreenProps = {
  children: React.ReactNode;
  padded?: boolean;
};

const Screen = ({children, padded = true}: ScreenProps): JSX.Element => (
  <SafeAreaView style={styles.safeArea}>
    <View style={[styles.container, padded && styles.padded]}>{children}</View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  padded: {
    paddingHorizontal: 16,
    paddingVertical: 12
  }
});

export default Screen;
