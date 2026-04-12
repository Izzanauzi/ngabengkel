import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView 
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../src/contexts/auth.context";
import { baseFetch } from "../../src/utils/baseFetch";
import { LoginResponse } from "../../src/@types/api";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  
  const { login } = useAuth();

  const handleChange = (name: string, value: string) => {
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async () => {
    setInternalLoading(true);
    try {
      // Menggunakan baseFetch yang sudah kita buat di folder utils
      const data = await baseFetch<LoginResponse>({
        url: "/auth/login", // Pastikan path-nya lengkap sesuai main.go
        method: "POST",
        payload: credentials, // Ini data email & password kamu
        
      });
      console.log("Data dari Server:", data);

      if (data?.token) {
        await login(data.token); // Fungsi login dari AuthContext
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          {/* Logo */}
          {/* <Image
            source={require("../../assets/logo/logo-laskara.png")} // Pastikan path & format benar
            style={styles.logo}
            resizeMode="contain"
          /> */}

          <View style={styles.form}>
            {/* Input Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="john@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={credentials.email}
              onChangeText={(val) => handleChange("email", val)}
            />

            {/* Input Password */}
            <Text style={styles.label}>Kata Sandi</Text>
            <div style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Minimal 8 karakter"
                secureTextEntry={!showPassword}
                value={credentials.password}
                onChangeText={(val) => handleChange("password", val)}
              />
              {/* <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image 
                  source={require("../../assets/icon/icon-eye.png")} 
                  style={styles.eyeIcon} 
                />
              </TouchableOpacity> */}
            </div>

            <Link href="/auth/forgot-password" style={styles.forgotPass}>
              Lupa kata sandi?
            </Link>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Link href="/auth/register" asChild>
              <TouchableOpacity style={styles.btnOutline}>
                <Text style={styles.btnTextOutline}>Daftar</Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity 
              style={styles.btnPrimary} 
              onPress={handleLogin}
              disabled={internalLoading}
            >
              {internalLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnTextPrimary}>Masuk</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: {
    backgroundColor: "white",
    width: "100%",
    maxWidth: 400,
    padding: 30,
    borderRadius: 24,
    alignItems: "center",
    elevation: 4, // Shadow Android
    shadowColor: "#000", // Shadow iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  logo: { width: 150, height: 150, marginBottom: 20 },
  form: { w: "100%", width: '100%' },
  label: { fontSize: 16, marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  // eyeIcon: { width: 24, height: 24, opacity: 0.5 },
  forgotPass: { alignSelf: "flex-end", marginTop: 10, color: "#666", fontSize: 14 },
  actionContainer: { flexDirection: "row", gap: 12, marginTop: 30, width: "100%" },
  btnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#A4112D",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnTextOutline: { color: "#A4112D", fontSize: 16, fontWeight: "600" },
  btnPrimary: {
    flex: 1,
    backgroundColor: "#A4112D",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnTextPrimary: { color: "white", fontSize: 16, fontWeight: "600" },
});