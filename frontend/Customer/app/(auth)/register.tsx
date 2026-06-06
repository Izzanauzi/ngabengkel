import React, { useCallback, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { FieldErrors, RegisterForm } from "@/types/auth.types";
import { useRegisterMutation } from "../../src/hooks/auth.hooks";
import { FormField, validateRegisterForm } from "../../src/components/auth/registerFormField";

const INITIAL_FORM: RegisterForm = {
  nama: "", email: "", telepon: "", password: "", konfirmasiPassword: "",
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  const { registerMutation } = useRegisterMutation({ onGlobalError: setGlobalError })

  const handleChange = useCallback((name: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
    setFieldErrors(prev => ({ ...prev, [name]: undefined }))
    setGlobalError(null)
  }, [])

  const handleRegister = useCallback(() => {
    const errors = validateRegisterForm(form)
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    registerMutation.mutate({ nama: form.nama, email: form.email, telepon: form.telepon, password: form.password })
  }, [form, registerMutation])

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

        <Text style={styles.heading}>Register</Text>
        <Text style={styles.subheading}>
          Daftar untuk memesan servis dan kelola kendaraan anda dengan mudah
        </Text>

        <View style={styles.form}>
          <FormField label="Nama Lengkap" placeholder="Masukkan nama lengkap Anda"
            value={form.nama} onChangeText={v => handleChange("nama", v)} error={fieldErrors.nama} />
          <FormField label="Email" placeholder="Masukkan email Anda"
            value={form.email} onChangeText={v => handleChange("email", v)}
            error={fieldErrors.email} keyboardType="email-address" autoCapitalize="none" />
          <FormField label="Nomor Telepon" placeholder="08xxxxxxxxxx"
            value={form.telepon} onChangeText={v => handleChange("telepon", v)}
            error={fieldErrors.telepon} keyboardType="phone-pad" />
          <FormField label="Password" placeholder="Minimal 8 karakter"
            value={form.password} onChangeText={v => handleChange("password", v)}
            error={fieldErrors.password} secureTextEntry />
          <FormField label="Konfirmasi Password" placeholder="Ulangi password"
            value={form.konfirmasiPassword} onChangeText={v => handleChange("konfirmasiPassword", v)}
            error={fieldErrors.konfirmasiPassword} secureTextEntry />

          {globalError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color="#CC0000" />
              <Text style={styles.errorText}>{globalError}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.btn, registerMutation.isPending && styles.btnDisabled]}
          onPress={handleRegister} disabled={registerMutation.isPending} activeOpacity={0.85}
        >
          {registerMutation.isPending
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Daftar</Text>}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Sudah punya akun? </Text>
          <Link href="/(auth)/login"><Text style={styles.loginLink}>Masuk</Text></Link>
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
  heading: { fontSize: 28, fontWeight: "800", color: "#1a1a2e", marginBottom: 8 },
  subheading: { fontSize: 13, color: "#888", lineHeight: 20, marginBottom: 28 },
  form: { gap: 2, marginBottom: 8 },
  errorBox: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#FFF0F0", borderWidth: 1, borderColor: "#FFCCCC", borderRadius: 10, padding: 12, gap: 8, marginTop: 4 },
  errorText: { fontSize: 13, color: "#CC0000", flex: 1 },
  btn: { backgroundColor: "#3B7BF6", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 16 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  loginText: { fontSize: 14, color: "#555" },
  loginLink: { fontSize: 14, fontWeight: "700", color: "#1a1a2e", textDecorationLine: "underline" },
})