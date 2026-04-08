import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/api';

export default function LoginScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", "Gagal Login: " + (error.response?.data?.message || "Endpoint tidak ditemukan (404)"));
    } finally {
      setLoading(false); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {/* <Ionicons name="car-sport" size={40} color="#007AFF" /> */}
          <Text style={styles.logoText}>Ngabengkel</Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.title}>Selamat datang kembali!</Text>
          <Text style={styles.subtitle}>Masuk untuk melanjutkan ke layanan bengkel</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={styles.input}
              placeholder="Masukkan email Anda"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input}
              placeholder="Masukkan password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, loading && { backgroundColor: '#A0C4FF' }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Masuk</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>Daftar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  scrollContent: { padding: 24, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 60 },
  logoText: { fontSize: 24, fontWeight: 'bold', marginLeft: 10 },
  welcomeSection: { marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 8, fontStyle: 'italic' },
  form: { marginBottom: 40 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#FFF', height: 50, borderRadius: 25, paddingHorizontal: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  loginButton: { backgroundColor: '#007AFF', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, paddingBottom: 20 },
  footerText: { color: '#444' },
  linkText: { fontWeight: 'bold', textDecorationLine: 'underline' },
});