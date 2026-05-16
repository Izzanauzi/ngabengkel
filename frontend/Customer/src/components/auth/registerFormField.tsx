import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
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
 
 export function validateRegisterForm(form: RegisterForm): FieldErrors {
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
 
   return errors;
 }
 
 // Styles 
 const styles = StyleSheet.create({
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
 });