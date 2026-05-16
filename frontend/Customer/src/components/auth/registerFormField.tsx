import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FieldErrors, RegisterForm } from "@/types/auth.types";

interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (val: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export function FormField({
  label, placeholder, value, onChangeText,
  error, secureTextEntry = false,
  keyboardType = "default", autoCapitalize = "sentences",
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputFocused,
        error ? styles.inputError : null,
      ]}>
        <TextInput
          style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? "eye" : "eye-off"} size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color="#FF4D4D" />
          <Text style={styles.fieldErrorText}>{error}</Text>
        </View>
      )}
    </View>
  )
}

// ── Validasi ──────────────────────────────────────────────────
export function validateRegisterForm(form: RegisterForm): FieldErrors {
  const errors: FieldErrors = {}

  if (!form.nama.trim())
    errors.nama = "Nama lengkap wajib diisi"

  if (!form.email.trim())
    errors.email = "Email wajib diisi"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Format email tidak valid"

  if (!form.telepon.trim())
    errors.telepon = "Nomor telepon wajib diisi"
  else if (!/^08\d{8,11}$/.test(form.telepon))
    errors.telepon = "Format nomor telepon tidak valid (contoh: 08123456789)" // ← fix pesan

  if (!form.password)
    errors.password = "Password wajib diisi"
  else if (form.password.length < 8)
    errors.password = "Password minimal 8 karakter"

  if (!form.konfirmasiPassword)
    errors.konfirmasiPassword = "Konfirmasi password wajib diisi"
  else if (form.password !== form.konfirmasiPassword)
    errors.konfirmasiPassword = "Password tidak sesuai"

  return errors
}

const styles = StyleSheet.create({
  fieldWrapper: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", color: "#1a1a2e", marginBottom: 6 },
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
    borderColor: "#3B7BF6",
    borderWidth: 1.5,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: "#1a1a2e" },
  inputError: { borderColor: "#FF4D4D", backgroundColor: "#FFF5F5" },
  eyeBtn: { padding: 4 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4, marginLeft: 2 },
  fieldErrorText: { fontSize: 12, color: "#FF4D4D" },
})