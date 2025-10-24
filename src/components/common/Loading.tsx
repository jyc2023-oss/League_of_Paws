import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {palette} from '@app/theme';

type LoadingProps = {
  size?: 'small' | 'large';
};

const Loading = ({size = 'large'}: LoadingProps): JSX.Element => (
  <View style={styles.container}>
    <ActivityIndicator size={size} color={palette.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default Loading;
