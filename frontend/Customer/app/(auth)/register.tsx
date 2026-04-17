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
import { Link, router } from "expo-router";
import { baseFetch } from "../../src/utils/baseFetch";

const CarIcon = () => <Text style={{ fontSize: 28 }}>🚗</Text>;

interface RegisterForm {
  nama: string;
  email: string;
  telepon: string;
  password: string;
  konfirmasiPassword: string;
}

interface FieldErrors {
  nama?: string;
  email?: string;
  telepon?: string;
  password?: string;
  konfirmasiPassword?: string;
}

interface AuthResponse {
  token: string;
  user: {
    user_id: string;
    nama: string;
    email: string;
    role: "customer" | "admin";
  };
}

interface ApiError {
  code: number;
  message: string;
  errors?: string[];
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    nama: "",
    email: "",
    telepon: "",
    password: "",
    konfirmasiPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  const handleChange = (name: keyof RegisterForm, value: string) => {
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: undefined });
    }
    if (globalError) setGlobalError(null);
    if (apiErrors.length > 0) setApiErrors([]);
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!form.nama.trim()) {
      errors.nama = "Nama lengkap wajib diisi";
    }

    if (!form.email.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Format email tidak valid";
    }

    if (!form.telepon.trim()) {
      errors.telepon = "Nomor telepon wajib diisi";
    } else if (!/^08\d{8,11}$/.test(form.telepon)) {
      errors.telepon = "Format nomor telepon tidak valid (contoh: 08123456789)";
    }

    if (!form.password) {
      errors.password = "Password wajib diisi";
    } else if (form.password.length < 8) {
      errors.password = "Password minimal 8 karakter";
    }

    if (!form.konfirmasiPassword) {
      errors.konfirmasiPassword = "Konfirmasi password wajib diisi";
    } else if (form.password !== form.konfirmasiPassword) {
      errors.konfirmasiPassword = "Password tidak cocok";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setGlobalError(null);
    setApiErrors([]);

    try {
      const response = await baseFetch<AuthResponse>({
        url: "/auth/register",
        method: "POST",
        payload: {
          nama: form.nama,
          email: form.email,
          telepon: form.telepon,
          password: form.password,
        },
      });

      // Register berhasil → response 201 dengan AuthResponse
      // Token bisa disimpan di sini jika diperlukan (misal: AsyncStorage)
      // Untuk sekarang langsung redirect ke login
      router.replace("/(auth)/login");
    } catch (error: any) {
      // Error 
      const apiError: ApiError | undefined = error?.response?.data;

      if (error?.response?.status === 400) {
        if (apiError?.errors && apiError.errors.length > 0) {
          setApiErrors(apiError.errors);
        } else {
          setGlobalError(
            apiError?.message ?? "Email sudah terdaftar. Silahkan gunakan email lain."
          );
        }
      } else if (error?.response?.status === 401) {
        setGlobalError("Tidak terotorisasi. Silahkan coba lagi.");
      } else {
        setGlobalError(
          apiError?.message ?? "Terjadi kesalahan. Silahkan coba lagi."
        );
      }
    } finally {
      setLoading(false);
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

        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Register</Text>
          <Text style={styles.subheading}>
            Daftar untuk memesan servis dan kelola kendaraan anda{"\n"}dengan mudah
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <FormField
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap Anda"
            value={form.nama}
            onChangeText={(val) => handleChange("nama", val)}
            error={fieldErrors.nama}
          />

          <FormField
            label="Email"
            placeholder="Masukkan email Anda"
            value={form.email}
            onChangeText={(val) => handleChange("email", val)}
            error={fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormField
            label="Nomor Telepon"
            placeholder="08xxxxxxxxxx"
            value={form.telepon}
            onChangeText={(val) => handleChange("telepon", val)}
            error={fieldErrors.telepon}
            keyboardType="phone-pad"
          />

          <FormField
            label="Password"
            placeholder="Minimal 8 karakter"
            value={form.password}
            onChangeText={(val) => handleChange("password", val)}
            error={fieldErrors.password}
            secureTextEntry
          />

          <FormField
            label="Konfirmasi Password"
            placeholder="Ulangi password"
            value={form.konfirmasiPassword}
            onChangeText={(val) => handleChange("konfirmasiPassword", val)}
            error={fieldErrors.konfirmasiPassword}
            secureTextEntry
          />

          {/* Global error message */}
          {globalError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{globalError}</Text>
            </View>
          )}

          {/* API error */}
          {apiErrors.length > 0 && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                {apiErrors.map((err, i) => (
                  <Text key={i} style={styles.errorText}>• {err}</Text>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnTextPrimary}>Daftar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <Link href="/(auth)/login">
              <Text style={styles.loginLink}>Masuk</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: FormFieldProps) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error && <Text style={styles.fieldErrorText}>{error}</Text>}
    </View>
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

  navbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    marginBottom: 32,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
  },

  headingContainer: {
    marginBottom: 28,
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  subheading: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
    lineHeight: 20,
  },

  form: {
    gap: 2,
  },
  fieldWrapper: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 6,
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
  inputError: {
    borderColor: "#FF4D4D",
    backgroundColor: "#FFF5F5",
  },
  fieldErrorText: {
    fontSize: 12,
    color: "#FF4D4D",
    marginTop: 4,
    marginLeft: 4,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFCCCC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
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
    marginTop: 32,
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
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#555",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a2e",
    textDecorationLine: "underline",
  },
});