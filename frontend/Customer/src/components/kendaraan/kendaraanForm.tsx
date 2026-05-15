 import React, { useState } from "react";
 import {
   ActivityIndicator,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
 } from "react-native";
 import { KendaraanRequest } from "../../@types/kendaraan.types";
 
 // ── Validasi ───
 
 interface FormErrors {
   merek?: string;
   model?: string;
   tahun?: string;
   nomor_polisi?: string;
 }
 
 export function validateKendaraanForm(form: KendaraanRequest): FormErrors {
   const errors: FormErrors = {};
 
   if (!form.merek.trim()) errors.merek = "Merek wajib diisi";
   if (!form.model.trim()) errors.model = "Model wajib diisi";
   if (!form.nomor_polisi.trim()) errors.nomor_polisi = "Nomor polisi wajib diisi";
 
   if (!form.tahun) {
     errors.tahun = "Tahun wajib diisi";
   } else if (form.tahun < 1900 || form.tahun > 2100) {
     errors.tahun = "Tahun tidak valid";
   }
 
   return errors;
 }
 
 // ── Komponen ──────────────────────────────────────────────────
 
 interface KendaraanFormProps {
   initialValues?: KendaraanRequest;  // diisi saat mode edit
   onSubmit: (payload: KendaraanRequest) => void;
   isLoading: boolean;
   submitLabel?: string;              // "Simpan" atau "Perbarui"
   errorMessage?: string | null;      // error dari API
 }
 
 const DEFAULT_VALUES: KendaraanRequest = {
   merek: "",
   model: "",
   tahun: new Date().getFullYear(),
   nomor_polisi: "",
   warna: null,
   nomor_rangka: null,
 };
 
 export function KendaraanForm({
   initialValues = DEFAULT_VALUES,
   onSubmit,
   isLoading,
   submitLabel = "Simpan",
   errorMessage,
 }: KendaraanFormProps) {
   const [form, setForm] = useState<KendaraanRequest>(initialValues);
   const [errors, setErrors] = useState<FormErrors>({});
 
   const handleChange = (field: keyof KendaraanRequest, value: string) => {
     setForm((prev) => ({
       ...prev,
       [field]:
         field === "tahun"
           ? parseInt(value) || 0
           : value === ""
           ? null   // field opsional → kirim null kalau kosong
           : value,
     }));
     setErrors((prev) => ({ ...prev, [field]: undefined }));
   };
 
   const handleSubmit = () => {
     const validationErrors = validateKendaraanForm(form);
     if (Object.keys(validationErrors).length > 0) {
       setErrors(validationErrors);
       return;
     }
     onSubmit(form);
   };
 
   return (
     <View>
       <Field
         label="Merek *"
         placeholder="Toyota, Honda, Yamaha..."
         value={form.merek}
         onChangeText={(v) => handleChange("merek", v)}
         error={errors.merek}
       />
 
       <Field
         label="Model *"
         placeholder="Avanza, Vario, NMAX..."
         value={form.model}
         onChangeText={(v) => handleChange("model", v)}
         error={errors.model}
       />
 
       <Field
         label="Tahun *"
         placeholder="2020"
         value={form.tahun ? String(form.tahun) : ""}
         onChangeText={(v) => handleChange("tahun", v)}
         error={errors.tahun}
         keyboardType="number-pad"
       />
 
       <Field
         label="Nomor Polisi *"
         placeholder="B 1234 ABC"
         value={form.nomor_polisi}
         onChangeText={(v) => handleChange("nomor_polisi", v.toUpperCase())}
         error={errors.nomor_polisi}
         autoCapitalize="characters"
       />
 
       <Field
         label="Warna"
         placeholder="Putih, Hitam, Merah... (opsional)"
         value={form.warna ?? ""}
         onChangeText={(v) => handleChange("warna", v)}
       />
 
       <Field
         label="Nomor Rangka"
         placeholder="Opsional"
         value={form.nomor_rangka ?? ""}
         onChangeText={(v) => handleChange("nomor_rangka", v)}
         autoCapitalize="characters"
       />
 
       {/* Error dari API */}
       {errorMessage && (
         <View style={styles.errorBox}>
           <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
         </View>
       )}
 
       <TouchableOpacity
         style={[styles.btnSubmit, isLoading && styles.btnDisabled]}
         onPress={handleSubmit}
         disabled={isLoading}
         activeOpacity={0.85}
       >
         {isLoading ? (
           <ActivityIndicator color="#fff" />
         ) : (
           <Text style={styles.btnSubmitText}>{submitLabel}</Text>
         )}
       </TouchableOpacity>
     </View>
   );
 }
 
 // ── Sub komponen field ────────────────────────────────────────
 
 interface FieldProps {
   label: string;
   placeholder: string;
   value: string;
   onChangeText: (v: string) => void;
   error?: string;
   keyboardType?: "default" | "number-pad";
   autoCapitalize?: "none" | "sentences" | "words" | "characters";
 }
 
 function Field({
   label,
   placeholder,
   value,
   onChangeText,
   error,
   keyboardType = "default",
   autoCapitalize = "sentences",
 }: FieldProps) {
   return (
     <View style={styles.fieldWrapper}>
       <Text style={styles.label}>{label}</Text>
       <TextInput
         style={[styles.input, error ? styles.inputError : null]}
         placeholder={placeholder}
         placeholderTextColor="#aaa"
         value={value}
         onChangeText={onChangeText}
         keyboardType={keyboardType}
         autoCapitalize={autoCapitalize}
       />
       {error && <Text style={styles.fieldError}>{error}</Text>}
     </View>
   );
 }
 
 // ── Styles ────────────────────────────────────────────────────
 
 const styles = StyleSheet.create({
   fieldWrapper: { marginBottom: 14 },
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
   fieldError: {
     fontSize: 12,
     color: "#FF4D4D",
     marginTop: 4,
     marginLeft: 4,
   },
   errorBox: {
     backgroundColor: "#FFF0F0",
     borderWidth: 1,
     borderColor: "#FFCCCC",
     borderRadius: 10,
     padding: 12,
     marginBottom: 12,
   },
   errorText: {
     fontSize: 13,
     color: "#CC0000",
   },
   btnSubmit: {
     backgroundColor: "#3B7BF6",
     borderRadius: 50,
     paddingVertical: 16,
     alignItems: "center",
     marginTop: 8,
   },
   btnDisabled: { opacity: 0.7 },
   btnSubmitText: {
     color: "#fff",
     fontSize: 16,
     fontWeight: "700",
   },
 });