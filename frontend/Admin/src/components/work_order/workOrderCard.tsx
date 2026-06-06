import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { WorkOrder } from "../../@types/workorder.types";

// ============================================================
// STATUS CONFIG
// ============================================================

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  dibuat: {
    label: "Dibuat",
    color: "#6B7280",
    dotColor: "#9CA3AF",
  },
  sedang_dikerjakan: {
    label: "Sedang Dikerjakan",
    color: "#2563EB",
    dotColor: "#3B82F6",
  },
  menunggu_persetujuan: {
    label: "Suspend",
    color: "#D97706",
    dotColor: "#F59E0B",
  },
  tindakan_ditolak: {
    label: "Ditolak",
    color: "#DC2626",
    dotColor: "#EF4444",
  },
  selesai: {
    label: "Selesai",
    color: "#059669",
    dotColor: "#10B981",
  },
  lunas: {
    label: "Lunas",
    color: "#059669",
    dotColor: "#10B981",
  },
};

// ============================================================
// HELPERS
// ============================================================

function formatRupiah(value: number | null | undefined): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

// ============================================================
// PROPS
// ============================================================

interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

// ============================================================
// COMPONENT
// ============================================================

export default function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  const statusCfg = STATUS_CONFIG[workOrder.status] ?? {
    label: workOrder.status,
    color: "#6B7280",
    dotColor: "#9CA3AF",
  };

  const mekanikLabel = workOrder.mekanik_id ?? "Belum ditentukan";
  const nomorWO = workOrder.nomor_wo ?? `#${workOrder.wo_id.slice(0, 8).toUpperCase()}`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(beranda)/Servicess/${workOrder.wo_id}` as any)}
      activeOpacity={0.7}
    >
      {/* Header: nomor WO + status */}
      <View style={styles.header}>
        <Text style={styles.nomorWO}>#{nomorWO}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: statusCfg.dotColor }]} />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {/* Info kendaraan + customer */}
      <View style={styles.bodyRow}>
        <View style={styles.iconBox}>
          <Ionicons name="document-text-outline" size={20} color="#6B7280" />
        </View>
        <View style={styles.bodyContent}>
          {/* Nama customer */}
          {workOrder.user?.nama && (
            <Text style={styles.customerName}>{workOrder.user.nama}</Text>
          )}
          {/* Kendaraan + plat */}
          {workOrder.kendaraan && (
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleText}>
                {workOrder.kendaraan.merek} {workOrder.kendaraan.model}
              </Text>
              <View style={styles.platBadge}>
                <Text style={styles.platText}>
                  {workOrder.kendaraan.nomor_polisi}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Footer: mekanik + detail */}
      <View style={styles.footer}>
        <View style={styles.mekanikRow}>
          <Ionicons name="build-outline" size={13} color="#9CA3AF" />
          <Text style={styles.mekanikText}>{mekanikLabel}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailText}>Detail</Text>
          <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  nomorWO: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    fontFamily: "monospace",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bodyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  bodyContent: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  vehicleText: {
    fontSize: 12,
    color: "#6B7280",
  },
  platBadge: {
    backgroundColor: "#1D4ED8",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  platText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#F9FAFB",
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mekanikRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  mekanikText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  detailText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3B82F6",
  },
});