import React, { useState, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useLoginMutation } from "../../src/hooks/auth.hooks";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null) // ← per-field

  const { loginMutation } = useLoginMutation({ onError: setErrorMessage })

  const handleChange = useCallback((name: string, value: string) => {
    setCredentials(prev => ({ ...prev, [name]: value }))
    setErrorMessage(null)
  }, [])

  const handleLogin = useCallback(() => {
    loginMutation.mutate(credentials)
  }, [credentials, loginMutation])

  const webOutline = Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="construct" size={20} color="#fff" />
          </View>
          <Text style={styles.logoText}>Ngabengkel</Text>
        </View>

        <Text style={styles.heading}>Selamat datang{"\n"}kembali!</Text>
        <Text style={styles.subheading}>Masuk untuk melanjutkan ke layanan bengkel</Text>

        {/* Ilustrasi */}
        <View style={styles.ilustrasi}>
          <Ionicons name="build-outline" size={48} color="#c5d3f0" />
          <Text style={styles.ilustrasiText}>Servis mudah, kapan saja & di mana saja</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={[
            styles.inputWrapper,
            focusedField === 'email' && styles.inputFocused,
          ]}>
            <TextInput
              style={[styles.inputFlex, webOutline]}
              placeholder="Masukkan email Anda"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={credentials.email}
              onChangeText={v => handleChange("email", v)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[
            styles.inputWrapper,
            focusedField === 'password' && styles.inputFocused,
          ]}>
            <TextInput
              style={[styles.inputFlex, webOutline]}
              placeholder="Masukkan password"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={credentials.password}
              onChangeText={v => handleChange("password", v)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={18} color="#aaa" />
            </TouchableOpacity>
          </View>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color="#CC0000" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.btn, loginMutation.isPending && styles.btnDisabled]}
          onPress={handleLogin} disabled={loginMutation.isPending} activeOpacity={0.85}
        >
          {loginMutation.isPending
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Masuk</Text>}
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Belum punya akun? </Text>
          <Link href="/(auth)/register"><Text style={styles.registerLink}>Daftar</Text></Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 32 },
  logoCircle: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#3B7BF6", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 18, fontWeight: "700", color: "#3B7BF6" },
  heading: { fontSize: 28, fontWeight: "800", color: "#1a1a2e", lineHeight: 36, marginBottom: 8 },
  subheading: { fontSize: 13, color: "#888", marginBottom: 24 },
  ilustrasi: { backgroundColor: "#F0F5FF", borderRadius: 16, padding: 24, alignItems: "center", gap: 8, marginBottom: 28 },
  ilustrasiText: { fontSize: 13, color: "#3B7BF6", fontWeight: "500" },
  form: { gap: 4, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#1a1a2e", marginBottom: 6, marginTop: 12 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: "#3B7BF6", // ← biru, bukan hitam
    borderWidth: 1.5,
  },
  inputFlex: { flex: 1, paddingVertical: 14, fontSize: 15, color: "#1a1a2e" },
  eyeBtn: { padding: 4 },
  errorBox: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#FFF0F0", borderWidth: 1, borderColor: "#FFCCCC", borderRadius: 10, padding: 12, gap: 8, marginTop: 8 },
  errorText: { fontSize: 13, color: "#CC0000", flex: 1 },
  btn: { backgroundColor: "#3B7BF6", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 16 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  registerRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  registerText: { fontSize: 14, color: "#555" },
  registerLink: { fontSize: 14, fontWeight: "700", color: "#1a1a2e", textDecorationLine: "underline" },
})