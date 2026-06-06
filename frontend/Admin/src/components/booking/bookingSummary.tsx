import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SummaryData {
  label: string;
  value: number;
}

interface BookingSummaryProps {
  total: number;
  menunggu: number;
  disetujui: number; 
  ditolak: number;   
}

export default function BookingSummary({ total, menunggu, disetujui, ditolak }: BookingSummaryProps) {
  const items: SummaryData[] = [
    { label: "Total", value: total },
    { label: "Menunggu", value: menunggu },
    // { label: "Disetujui", value: disetujui },
    // { label: "Ditolak", value: ditolak },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {items.map((s, idx) => (
          <View key={s.label} style={[styles.card, idx === 1 && styles.activeCard]}>
            <Text style={styles.value}>{s.value}</Text>
            <Text style={styles.label}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3B7BF6", // Background biru penuh panel atas
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Transparan putih khas summary atas
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCard: {
    backgroundColor: "rgba(0, 0, 0, 0.15)", // Sedikit gelap untuk tab aktif jika diperlukan
  },
  value: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: "#fff" 
  },
  label: { 
    fontSize: 11, 
    color: "rgba(255, 255, 255, 0.8)", 
    marginTop: 2, 
    fontWeight: "500" 
  },
});