import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useState, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerHistoryDetail } from "../../../src/hooks/history.hooks";
import type {
  Customer,
  WorkOrder,
  WOItem,
  Progress,
  Kendaraan,
  Mekanik,
} from "../../../src/@types/history.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatTanggal(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getTotalBiaya(wo: WorkOrder): number {
  const totalMaterial = wo.items.reduce((sum, i) => sum + i.subtotal, 0);
  return (wo.biaya_jasa || 0) + totalMaterial;
}

const STATUS_CONFIG: Record<
  WorkOrder["status"],
  { label: string; color: string; bg: string; icon: string }
> = {
  dibuat: { label: "Dibuat", color: "#6366F1", bg: "#EEF2FF", icon: "document-text-outline" },
  sedang_dikerjakan: { label: "Dikerjakan", color: "#F59E0B", bg: "#FFFBEB", icon: "construct-outline" },
  menunggu_persetujuan: { label: "Menunggu", color: "#F97316", bg: "#FFF7ED", icon: "time-outline" },
  selesai: { label: "Selesai", color: "#10B981", bg: "#ECFDF5", icon: "checkmark-circle-outline" },
  lunas: { label: "Lunas", color: "#059669", bg: "#D1FAE5", icon: "checkmark-done-circle-outline" },
};

// ─── WO Card ──────────────────────────────────────────────────────────────────
function WOCard({
  wo,
  onPress,
  isExpanded,
}: {
  wo: WorkOrder;
  onPress: () => void;
  isExpanded: boolean;
}) {
  const status = STATUS_CONFIG[wo.status];
  const totalBiaya = getTotalBiaya(wo);

  return (
    <View style={styles.woCard}>
      {/* Card Header */}
      <TouchableOpacity
        style={styles.woCardHeader}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.woTopRow}>
          <Text style={styles.woNumber}>{wo.nomor_wo}</Text>
          <View style={styles.badgeRow}>
            {wo.status === "selesai" || wo.status === "lunas" ? (
              <View style={[styles.badge, { backgroundColor: STATUS_CONFIG.selesai.bg }]}>
                <Ionicons name="checkmark-circle" size={12} color={STATUS_CONFIG.selesai.color} />
                <Text style={[styles.badgeText, { color: STATUS_CONFIG.selesai.color }]}>
                  Selesai
                </Text>
              </View>
            ) : null}
            {wo.status === "lunas" && (
              <View style={[styles.badge, { backgroundColor: "#D1FAE5" }]}>
                <Ionicons name="cash-outline" size={12} color="#059669" />
                <Text style={[styles.badgeText, { color: "#059669" }]}>Lunas</Text>
              </View>
            )}
            {wo.status !== "selesai" && wo.status !== "lunas" && (
              <View style={[styles.badge, { backgroundColor: status.bg }]}>
                <Text style={[styles.badgeText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Meta info */}
        <View style={styles.woMeta}>
          <View style={styles.woMetaRow}>
            <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
            <Text style={styles.woMetaText}>{formatTanggal(wo.created_at)}</Text>
          </View>
          <View style={styles.woMetaRow}>
            <Ionicons name="car-outline" size={13} color="#94A3B8" />
            <Text style={styles.woMetaText}>
              {wo.kendaraan.merek} {wo.kendaraan.model} {wo.kendaraan.tahun}
            </Text>
            <View style={styles.platBadge}>
              <Text style={styles.platText}>{wo.kendaraan.nomor_polisi}</Text>
            </View>
          </View>
          <View style={styles.woMetaRow}>
            <Ionicons name="build-outline" size={13} color="#94A3B8" />
            <Text style={styles.woMetaText} numberOfLines={isExpanded ? undefined : 1}>
              {wo.deskripsi_kerusakan}
            </Text>
          </View>
          {wo.mekanik && (
            <View style={styles.woMetaRow}>
              <Ionicons name="person-outline" size={13} color="#94A3B8" />
              <Text style={styles.woMetaText}>{wo.mekanik.nama}</Text>
            </View>
          )}
        </View>

        {/* Footer row */}
        <View style={styles.woFooter}>
          <View>
            <Text style={styles.totalLabel}>Total Biaya</Text>
            <Text style={styles.totalValue}>{formatRupiah(totalBiaya)}</Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#94A3B8"
          />
        </View>
      </TouchableOpacity>

      {/* Expanded Detail */}
      {isExpanded && (
        <View style={styles.woDetail}>
          <View style={styles.detailDivider} />

          {/* Items */}
          {wo.items.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>
                <Ionicons name="cube-outline" size={13} color="#475569" /> Material & Sparepart
              </Text>
              {wo.items.map((item) => (
                <View key={item.wo_item_id} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.nama_item}
                  </Text>
                  <Text style={styles.itemQty}>{item.jumlah}x</Text>
                  <Text style={styles.itemSubtotal}>{formatRupiah(item.subtotal)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Biaya breakdown */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>
              <Ionicons name="receipt-outline" size={13} color="#475569" /> Rincian Biaya
            </Text>
            <View style={styles.biayaRow}>
              <Text style={styles.biayaLabel}>Biaya Jasa</Text>
              <Text style={styles.biayaValue}>{formatRupiah(wo.biaya_jasa || 0)}</Text>
            </View>
            <View style={styles.biayaRow}>
              <Text style={styles.biayaLabel}>Total Material</Text>
              <Text style={styles.biayaValue}>
                {formatRupiah(wo.items.reduce((s, i) => s + i.subtotal, 0))}
              </Text>
            </View>
            <View style={[styles.biayaRow, styles.biayaTotalRow]}>
              <Text style={styles.biayaTotalLabel}>Total</Text>
              <Text style={styles.biayaTotalValue}>{formatRupiah(totalBiaya)}</Text>
            </View>
          </View>

          {/* Progress */}
          {wo.progress.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>
                <Ionicons name="time-outline" size={13} color="#475569" /> Riwayat Progress
              </Text>
              {wo.progress.map((p, idx) => (
                <View key={p.progress_id} style={styles.progressItem}>
                  <View style={styles.progressDot}>
                    <View
                      style={[
                        styles.progressDotInner,
                        { backgroundColor: p.tipe === "suspend" ? "#F59E0B" : "#3B82F6" },
                      ]}
                    />
                    {idx < wo.progress.length - 1 && (
                      <View style={styles.progressLine} />
                    )}
                  </View>
                  <View style={styles.progressContent}>
                    <Text style={styles.progressDesc}>{p.deskripsi}</Text>
                    {p.est_biaya_tambahan && (
                      <Text style={styles.progressExtra}>
                        + {formatRupiah(p.est_biaya_tambahan)}
                      </Text>
                    )}
                    <Text style={styles.progressDate}>
                      {formatTanggal(p.created_at)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomerHistoryDetailPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [expandedWoId, setExpandedWoId] = useState<string | null>(null);

  const { customer, workOrders, summary, isLoading, isRefreshing, refresh, error } =
    useCustomerHistoryDetail(id);

  const toggleExpand = useCallback((woId: string) => {
    setExpandedWoId((prev) => (prev === woId ? null : woId));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: WorkOrder }) => (
      <WOCard
        wo={item}
        onPress={() => toggleExpand(item.wo_id)}
        isExpanded={expandedWoId === item.wo_id}
      />
    ),
    [expandedWoId, toggleExpand]
  );

  if (isLoading && !customer) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Memuat histori...</Text>
      </View>
    );
  }

  if (error && !customer) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Gagal memuat data</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Customer Profile Header */}
      {customer && (
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {customer.nama
                .split(" ")
                .slice(0, 2)
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{customer.nama}</Text>
            <Text style={styles.profilePhone}>{customer.telepon}</Text>
            {customer.email && (
              <Text style={styles.profileEmail}>{customer.email}</Text>
            )}
          </View>
        </View>
      )}

      {/* Summary stats */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{summary.totalWO}</Text>
          <Text style={styles.summaryLabel}>Total WO</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: "#059669", fontSize: 14 }]}>
            {formatRupiah(summary.totalBiaya)}
          </Text>
          <Text style={styles.summaryLabel}>Total Biaya</Text>
        </View>
      </View>

      {/* Section title */}
      <Text style={styles.sectionTitle}>
        RIWAYAT SERVIS ({workOrders.length})
      </Text>

      {/* Empty state */}
      {!isLoading && workOrders.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={56} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Belum ada riwayat servis</Text>
          <Text style={styles.emptySubtitle}>
            Customer ini belum pernah melakukan servis
          </Text>
        </View>
      )}

      {/* WO List */}
      <FlatList
        data={workOrders}
        keyExtractor={(item) => item.wo_id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },

  // Profile header
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
  },
  profilePhone: {
    fontSize: 13,
    color: "#64748B",
  },
  profileEmail: {
    fontSize: 12,
    color: "#94A3B8",
  },

  // Summary
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E40AF",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },

  // Section title
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },

  // WO Card
  woCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  woCardHeader: {
    padding: 14,
    gap: 10,
  },
  woTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  woNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3B82F6",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Meta
  woMeta: {
    gap: 6,
  },
  woMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  woMetaText: {
    fontSize: 13,
    color: "#475569",
    flex: 1,
  },
  platBadge: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  platText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Footer
  woFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 11,
    color: "#94A3B8",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
  },

  // Expanded detail
  woDetail: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 12,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 4,
  },
  detailSection: {
    gap: 8,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Items
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
  },
  itemQty: {
    fontSize: 12,
    color: "#64748B",
    minWidth: 28,
    textAlign: "center",
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    minWidth: 80,
    textAlign: "right",
  },

  // Biaya
  biayaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  biayaLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  biayaValue: {
    fontSize: 13,
    color: "#334155",
  },
  biayaTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
    marginTop: 4,
  },
  biayaTotalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  biayaTotalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#059669",
  },

  // Progress
  progressItem: {
    flexDirection: "row",
    gap: 12,
  },
  progressDot: {
    alignItems: "center",
    width: 14,
    marginTop: 4,
  },
  progressDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#E2E8F0",
    marginTop: 4,
    minHeight: 16,
  },
  progressContent: {
    flex: 1,
    paddingBottom: 12,
    gap: 2,
  },
  progressDesc: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  progressExtra: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
  },
  progressDate: {
    fontSize: 11,
    color: "#94A3B8",
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 32,
  },

  // Error
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  errorSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // Loading
  loadingText: {
    fontSize: 14,
    color: "#94A3B8",
  },
});