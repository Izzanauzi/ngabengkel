import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { Transaction } from "../../@types/laporan.types";

interface TransaksiItemProps {
  transaction: Transaction;
}

function formatRupiah(v: number) {
  return "Rp " + v.toLocaleString("id-ID");
}

function formatTanggal(s: string | null) {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return s; }
}

export default function TransaksiItem({ transaction }: TransaksiItemProps) {
  const nomorWO = transaction.nomor_wo ?? `#${transaction.wo_id.slice(0, 8).toUpperCase()}`;
  const shortWO = nomorWO.replace("WO-", "#WO-").split("-").slice(0, 2).join("-");

  return (
    <View style={styles.row}>
      {/* Nomor WO */}
      <View style={styles.nomorCol}>
        <View style={styles.nomorBadge}>
          <Text style={styles.nomorText}>{shortWO}</Text>
        </View>
      </View>

      {/* Customer + kendaraan */}
      <View style={styles.customerCol}>
        <Text style={styles.customerName} numberOfLines={1}>
          {transaction.nama_customer ?? "-"}
        </Text>
        <Text style={styles.customerSub} numberOfLines={1}>
          {formatTanggal(transaction.tanggal_bayar)} · {transaction.nama_kendaraan ?? "-"}
        </Text>
      </View>

      {/* Total + status */}
      <View style={styles.totalCol}>
        <Text style={styles.totalText}>{formatRupiah(transaction.total_biaya)}</Text>
        <Text style={styles.lunas}>Lunas</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 8,
  },
  nomorCol: { width: 72 },
  nomorBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  nomorText: { fontSize: 11, fontWeight: "700", color: "#2563EB" },
  customerCol: { flex: 1 },
  customerName: { fontSize: 13, fontWeight: "600", color: "#111827" },
  customerSub: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
  totalCol: { alignItems: "flex-end" },
  totalText: { fontSize: 13, fontWeight: "700", color: "#111827" },
  lunas: { fontSize: 11, fontWeight: "600", color: "#16A34A", marginTop: 1 },
});