import React, { useState } from "react"
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, View,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { useGetKendaraanById, useUpdateKendaraanMutation } from "../../../../src/hooks/kendaraan.hooks"
import { KendaraanForm } from "../../../../src/components/kendaraan/kendaraanForm"
import { KendaraanRequest } from "../../../../src/@types/kendaraan.types"

export default function KendaraanEditScreen() {
  const { kendaraan: kendaraanId } = useLocalSearchParams<{ kendaraan: string }>()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { kendaraan, isLoading } = useGetKendaraanById(kendaraanId)
  const { updateKendaraanMutation } = useUpdateKendaraanMutation({
    successAction: () => router.back(),
    onError: (message) => setErrorMessage(message),
  })

  // ← semua log dan logic di atas return
  console.log('params kendaraanId:', kendaraanId)
  console.log('kendaraan data:', kendaraan)

  const handleSubmit = (payload: KendaraanRequest) => {
    if (!kendaraanId) return
    setErrorMessage(null)
    updateKendaraanMutation.mutate({ kendaraanId, payload })
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B7BF6" />
      </View>
    )
  }

  if (!kendaraan) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Kendaraan tidak ditemukan</Text>
      </View>
    )
  }

  const initialValues: KendaraanRequest = {
    merek: kendaraan.merek,
    model: kendaraan.model,
    tahun: kendaraan.tahun,
    nomor_polisi: kendaraan.nomor_polisi,
    warna: kendaraan.warna,
    nomor_rangka: kendaraan.nomor_rangka,
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Edit Kendaraan</Text>
        <KendaraanForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isLoading={updateKendaraanMutation.isPending}
          submitLabel="Perbarui Kendaraan"
          errorMessage={errorMessage}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2F7" },
  scroll: { padding: 24, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 24, fontWeight: "800", color: "#1a1a2e", marginBottom: 24 },
  errorText: { fontSize: 16, color: "#EF4444" },
})