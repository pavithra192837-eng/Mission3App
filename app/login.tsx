import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { login, signup } from './services/api';

const STUDENT_NAME_KEY = 'learnmate_student_name';
const STUDENT_TOKEN_KEY = 'learnmate_token';
const SAVED_CREDENTIALS_KEY = 'learnmate_saved_credentials';

type SavedCredentials = {
  email: string;
  password: string;
  studentName: string;
  token: string;
};

export default function LoginScreen() {
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Exit App', 'Do you want to exit the app?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  const isValidEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value).toLowerCase());
  };

  const isOnlyLetters = (value: string) => /^[A-Za-z]+$/.test(value);
  const isOnlyNumbers = (value: string) => /^\d+$/.test(value);
  const isOnlySpecials = (value: string) => /^[^A-Za-z0-9\s]+$/.test(value);

  const getFriendlyErrorMessage = (message: string) => {
    const normalized = (message || '').toLowerCase();

    if (normalized.includes('missing password')) {
      return 'Wrong password';
    }

    if (normalized.includes('missing_api_key') || normalized.includes('missing api key')) {
      return 'Unable to login: API key is missing or invalid.';
    }

    if (normalized.includes('user not found') || normalized.includes('wrong email')) {
      return 'Wrong email or password';
    }

    if (normalized.includes('missing email')) {
      return 'Please enter your email';
    }

    if (normalized.includes('only defined users succeed registration')) {
      return 'Signup failed: use a valid email and password';
    }

    return message || 'Authentication failed.';
  };

  const loadSavedCredentials = async () => {
    try {
      const saved = await AsyncStorage.getItem(SAVED_CREDENTIALS_KEY);
      return saved ? (JSON.parse(saved) as SavedCredentials) : null;
    } catch {
      return null;
    }
  };

  const saveCredentialsLocally = async (email: string, password: string, studentName: string, token: string) => {
    try {
      await AsyncStorage.setItem(
        SAVED_CREDENTIALS_KEY,
        JSON.stringify({ email, password, studentName, token }),
      );
    } catch {
      // ignore local save failure
    }
  };

  const handleForgotPassword = async () => {
    const emailTrimmed = email.trim();
    if (!isValidEmail(emailTrimmed)) {
      Alert.alert('Invalid Email', 'Please enter your registered email address.');
      return;
    }

    const saved = await loadSavedCredentials();
    if (!saved || saved.email !== emailTrimmed) {
      Alert.alert(
        'No saved account',
        'We could not find a saved account for this email. Please sign up again or continue as guest.',
      );
      return;
    }

    if (password.trim() === '') {
      Alert.alert('Enter New Password', 'Type a new password into the password field, then tap Forgot Password again.');
      return;
    }

    await saveCredentialsLocally(emailTrimmed, password, studentName.trim() || saved.studentName, saved.token || 'local-reset-token');
    setAuthError('');
    Alert.alert('Password Reset', 'Your password was updated locally. You can now login with the new password.');
  };

  const handleLogin = async () => {
    if (studentName.trim() === '' || email.trim() === '' || password.trim() === '') {
      Alert.alert('Missing Details', 'Please enter your name, email, and password.');
      return;
    }

    if (emailError) {
      Alert.alert('Invalid Email', emailError);
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address (e.g. abc@gmail.com).');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      let result;

      if (isSigningUp) {
        try {
          result = await signup(email, password);
        } catch (signupError: any) {
          const message = (signupError?.message || '').toLowerCase();
          const fallback =
            message.includes('only defined users succeed registration') ||
            message.includes('missing_api_key') ||
            message.includes('missing api key');

          if (fallback) {
            result = { token: 'local-signup-token' };
            await saveCredentialsLocally(email, password, studentName.trim(), result.token);
          } else {
            throw signupError;
          }
        }
      } else {
        try {
          result = await login(email, password);
        } catch (loginError: any) {
          const saved = await loadSavedCredentials();
          if (saved?.email === email && saved.password === password) {
            await AsyncStorage.setItem(STUDENT_NAME_KEY, studentName.trim());
            await AsyncStorage.setItem(STUDENT_TOKEN_KEY, saved.token || 'local-login-token');
            router.replace('/(tabs)');
            return;
          }

          throw loginError;
        }
      }

      await AsyncStorage.setItem(STUDENT_NAME_KEY, studentName.trim());
      if (result?.token) {
        await AsyncStorage.setItem(STUDENT_TOKEN_KEY, result.token);
      }
      if (isSigningUp) {
        await saveCredentialsLocally(email, password, studentName.trim(), result?.token || 'local-signup-token');
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      setAuthError(getFriendlyErrorMessage(error?.message || 'Authentication failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 24}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContainer}>
            <Text style={styles.title}>📚 LearnMate</Text>
            <Text style={styles.subtitle}>Your Personal E-Learning Companion</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Student Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
                value={studentName}
                onChangeText={setStudentName}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                onBlur={() => {
                  const v = email.trim();
                  if (v === '') {
                    setEmailError('');
                    return;
                  }
                  if (isOnlyLetters(v)) {
                    setEmailError('Email cannot be only letters.');
                    return;
                  }
                  if (isOnlyNumbers(v)) {
                    setEmailError('Email cannot be only numbers.');
                    return;
                  }
                  if (isOnlySpecials(v)) {
                    setEmailError('Email cannot be only special characters.');
                    return;
                  }
                  if (!isValidEmail(v)) {
                    setEmailError('Please enter a valid email address (e.g. abc@gmail.com).');
                  } else {
                    setEmailError('');
                  }
                }}
              />
              {emailError !== '' && <Text style={styles.errorText}>{emailError}</Text>}

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />

              <View style={styles.passwordActionsRow}>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.showPassword}>{showPassword ? 'Hide Password' : 'Show Password'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  !(studentName.trim() && email.trim() && password.trim() && isValidEmail(email)) && styles.disabledButton,
                ]}
                onPress={handleLogin}
                disabled={isLoading || !(studentName.trim() && email.trim() && password.trim() && isValidEmail(email))}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginText}>{isSigningUp ? 'Signup' : 'Login'}</Text>
                )}
              </TouchableOpacity>

              {authError !== '' && <Text style={styles.errorText}>{authError}</Text>}

              <TouchableOpacity
                style={styles.switchModeButton}
                onPress={() => {
                  setAuthError('');
                  setIsSigningUp((current) => !current);
                }}
              >
                <Text style={styles.switchModeText}>
                  {isSigningUp ? 'Already have an account? Login' : 'New user? Signup'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.guestButton} onPress={() => router.replace('/(tabs)')} disabled={isLoading}>
                <Text style={styles.guestText}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.footer}>Learn • Practice • Grow 🚀</Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5c6ca9',
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 25,
  },
  label: {
    color: '#ffffff',
    marginBottom: 8,
    fontSize: 15,
  },
  input: {
    backgroundColor: '#334155',
    color: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  showPassword: {
    color: '#60a5fa',
    fontWeight: '600',
  },
  forgotPassword: {
    color: '#fbbf24',
    fontWeight: '600',
    marginLeft: 16,
  },
  passwordActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  loginText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
  },
  switchModeButton: {
    paddingVertical: 10,
  },
  switchModeText: {
    color: '#a5b4fc',
    textAlign: 'center',
  },
  guestButton: {
    borderWidth: 1,
    borderColor: '#4f46e5',
    padding: 12,
    borderRadius: 12,
  },
  guestText: {
    color: '#4f46e5',
    textAlign: 'center',
    fontWeight: '600',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 12,
  },
  footer: {
    color: '#c5cbd3',
    textAlign: 'center',
    marginTop: 35,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
