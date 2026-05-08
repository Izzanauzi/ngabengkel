/**
 * app/(auth)/register.tsx
 *
 * Screen register yang sudah "tipis":
 * - Hanya punya state UI (form input, error display, loading)
 * - Validasi → panggil validateRegisterForm() dari component
 * - API call  → pakai useRegisterMutation() dari hooks
 * - Tampilan  → pakai FormField dari components/auth/
 *
 * Kalau ada bug validasi  → cek RegisterFormField.tsx
 * Kalau ada bug API       → cek auth.hooks.ts
 * Kalau ada bug tampilan  → cek di sini atau RegisterFormField.tsx
 */

 import React, { useCallback, useState } from "react";
 import {
   ActivityIndicator,
   KeyboardAvoidingView,
   Platform,
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
 } from "react-native";
 import { Link } from "expo-router";
 import { FieldErrors, RegisterForm } from "@/types/auth.types";
 import { useRegisterMutation } from "../../hooks/auth.hooks";
 import { FormField, validateRegisterForm } from "../../src/components/registerFormField";
 
 
 const CarIcon = () => <Text style={{ fontSize: 28 }}>🚗</Text>;
 
 const INITIAL_FORM: RegisterForm = {
   nama: "",
   email: "",
   telepon: "",
   password: "",
   konfirmasiPassword: "",
 };
 
 export default function RegisterPage() {
   // State UI
   const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
   const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
   const [globalError, setGlobalError] = useState<string | null>(null);
   const [apiErrors, setApiErrors] = useState<string[]>([]);
 
   // Hook untuk register
   const { registerMutation } = useRegisterMutation({
     onApiErrors: setApiErrors,
     onGlobalError: setGlobalError,
   });
 
   // Handler: update satu field form & reset error-nya
   const handleChange = useCallback(
     (name: keyof RegisterForm, value: string) => {
       setForm((prev) => ({ ...prev, [name]: value }));
       setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
       setGlobalError(null);
       setApiErrors([]);
     },
     []
   );
 
   // Handler: submit
   const handleRegister = useCallback(() => {
     const errors = validateRegisterForm(form);
 
     if (Object.keys(errors).length > 0) {
       setFieldErrors(errors);
       return;
     }
 
     registerMutation.mutate({
       nama: form.nama,
       email: form.email,
       telepon: form.telepon,
       password: form.password,
     });
   }, [form, registerMutation]);
 
   const isLoading = registerMutation.isPending;
 
   return (
     <KeyboardAvoidingView
       behavior={Platform.OS === "ios" ? "padding" : "height"}
       style={styles.container}
     >
       <ScrollView
         contentContainerStyle={styles.scrollContainer}
         keyboardShouldPersistTaps="handled"
       >
         {/* logo */}
         <View style={styles.navbar}>
           <CarIcon />
           <Text style={styles.navTitle}>Ngabengkel</Text>
         </View>
 
         {/* Head */}
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
 
           {/* Global error */}
           {globalError && (
             <View style={styles.errorBox}>
               <Text style={styles.errorIcon}>⚠️</Text>
               <Text style={styles.errorText}>{globalError}</Text>
             </View>
           )}
 
           {/* API errors (list) */}
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
             style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
             onPress={handleRegister}
             disabled={isLoading}
             activeOpacity={0.85}
           >
             {isLoading ? (
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
 
 // ── Styles ──
 
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