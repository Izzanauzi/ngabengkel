import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../src/contexts/auth.context";
import { baseFetch } from "../../src/utils/baseFetch";
import { LoginResponse } from "../../src/@types/api";

const CarIcon = () => (
  <Text style={{ fontSize: 28 }}>🚗</Text>
);

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [internalLoading, setInternalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();

  const handleChange = (name: string, value: string) => {
    setCredentials({ ...credentials, [name]: value });
    if (errorMessage) setErrorMessage(null); // Reset error saat user mengetik
  };

  const handleLogin = async () => {
    setInternalLoading(true);
    setErrorMessage(null);
    // console.log("Payload dikirim:", credentials); 
    try {
      const data = await baseFetch<LoginResponse>({
        url: "/auth/login",
        method: "POST",
        payload: credentials,
        options: {
          showError: false, 
        },
      });

      if (data?.token) {
        await login(data.token);
      }
    } catch (error: any) {
  //     console.log("ERROR OBJECT:", JSON.stringify(error));
  // console.log("ERROR RESPONSE:", error?.response);
  // console.log("ERROR STATUS:", error?.response?.status);
      // error message 
      if (error?.response?.status === 401) {
        setErrorMessage("Email atau Password salah. Silahkan coba lagi.");
        // console.log("setErrorMessage dipanggil!");
      } else {
        setErrorMessage("Terjadi kesalahan. Silahkan coba lagi.");
      }
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
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.navbar}>
          <CarIcon />
          <Text style={styles.navTitle}>Ngabengkel</Text>
        </View>

        
        <View style={styles.body}>
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>Selamat datang{"\n"}kembali!</Text>
            <Text style={styles.subheading}>
              Masuk untuk melanjutkan ke layanan bengkel
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan email Anda"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={credentials.email}
              onChangeText={(val) => handleChange("email", val)}
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={credentials.password}
              onChangeText={(val) => handleChange("password", val)}
            />

            {/* Error Message */}
            {/* {console.log("RENDER - errorMessage:", errorMessage)} */}
            {errorMessage && (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
          </View>
        </View>

        
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btnPrimary, internalLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={internalLoading}
            activeOpacity={0.85}
          >
            {internalLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnTextPrimary}>Masuk</Text>
            )}
          </TouchableOpacity>

        
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <Link href="/register">
              <Text style={styles.registerLink}>Daftar</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2F7",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // Navbar
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    marginBottom: 40,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
  },


  body: {
    flex: 1,
  },
  headingContainer: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a2e",
    lineHeight: 40,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },

  // Form
  form: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1a1a2e",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFCCCC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
    gap: 8,
  },
  errorIcon: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 13,
    color: "#CC0000",
    flex: 1,
  },

  footer: {
    marginTop: 48,
    alignItems: "center",
    gap: 16,
  },
  btnPrimary: {
    backgroundColor: "#3B7BF6",
    borderRadius: 50,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnTextPrimary: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#555",
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a2e",
    textDecorationLine: "underline",
  },
});
