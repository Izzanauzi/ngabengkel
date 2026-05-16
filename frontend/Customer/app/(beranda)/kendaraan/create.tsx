import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { router } from "expo-router";
import { useCreateKendaraanMutation } from "../../../src/hooks/kendaraan.hooks";
import { KendaraanForm } from "../../../src/components/kendaraan/kendaraanForm";
import { KendaraanRequest } from "../../../src/@types/kendaraan.types";
import { useToast } from "../../../src/contexts/toast.context";

export default function KendaraanCreateScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { showSuccess } = useToast();

  const { createKendaraanMutation } = useCreateKendaraanMutation({
    successAction: () =>
      showSuccess("Kendaraan berhasil ditambahkan!", () => router.back()),
    onError: (message) => setErrorMessage(message),
  });
 
   const handleSubmit = (payload: KendaraanRequest) => {
     setErrorMessage(null);
     createKendaraanMutation.mutate(payload);
   };
 
   return (
     <KeyboardAvoidingView
       behavior={Platform.OS === "ios" ? "padding" : "height"}
       style={styles.container}
     >
       <ScrollView
         contentContainerStyle={styles.scroll}
         keyboardShouldPersistTaps="handled"
       >
         <Text style={styles.heading}>Tambah Kendaraan</Text>
 
         <KendaraanForm
           onSubmit={handleSubmit}
           isLoading={createKendaraanMutation.isPending}
           submitLabel="Tambah Kendaraan"
           errorMessage={errorMessage}
         />
       </ScrollView>
     </KeyboardAvoidingView>
   );
 }
 
 const styles = StyleSheet.create({
   container: { flex: 1, backgroundColor: "#EEF2F7" },
   scroll: { padding: 24, paddingBottom: 40 },
   heading: {
     fontSize: 24,
     fontWeight: "800",
     color: "#1a1a2e",
     marginBottom: 24,
   },
 });