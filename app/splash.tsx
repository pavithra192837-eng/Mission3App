import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
     <Image
  source={require('../assets/images/splash-icon.png')}
  style={{
    width: '100%',
    height: '100%',
    position: 'absolute'
  }}
  resizeMode="cover"
/>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

 logo: {
  width: 180,
  height: 180,
  marginBottom: 25,
},

  
  
})