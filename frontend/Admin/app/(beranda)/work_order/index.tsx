import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useState, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useGetAllWorkOrders } from "../../../src/hooks/work_order.hooks";
import { WorkOrder, WorkOrderStatus } from "../../../src/@types/work_order.types";

// ============================================================
// KONSTANTA
// ============================================================

type TabValue = WorkOrderStatus | "semua";

const STATUS_TABS: { label: string; value: TabValue }[] = [
  { label: "Semua", value: "semua" },
  { label: "Dibuat", value: "dibuat" },
  { label: "Sedang Dikerjakan", value: "sedang_dikerjakan" },
  { label: "Suspend", value: "suspend" },
  { label: "Menunggu", value: "menunggu_persetujuan" },
  { label: "Ditolak", value: "tindakan_ditolak" },
  { label: "Selesai", value: "selesai" },
  { label: "Lunas", value: "lunas" },
];

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  dibuat:               { bg: "#EFF6FF", text: "#2563EB" },
  sedang_dikerjakan:    { bg: "#FFF7ED", text: "#EA580C" },
  suspend:              { bg: "#FEF9C3", text: "#CA8A04" },
  menunggu_persetujuan: { bg: "#F5F3FF", text: "#7C3AED" },
  tindakan_ditolak:     { bg: "#FEF2F2", text: "#DC2626" },
  selesai:              { bg: "#F0FDF4", text: "#16A34A" },
  lunas:                { bg: "#ECFDF5", text: "#15803D" },
};

const STATUS_LABEL: Record<string, string> = {
  dibuat:               "Dibuat",
  sedang_dikerjakan:    "Dikerjakan",
  suspend:              "Suspend",
  menunggu_persetujuan: "Menunggu",
  tindakan_ditolak:     "Ditolak",
  selesai:              "Selesai",
  lunas:                "Lunas",
};

// ============================================================
// KOMPONEN STATUS BADGE
// ============================================================

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLOR[status] ?? { bg: "#F3F4F6", text: "#6B7280" };
  return (
    <View style={[badgeStyles.container, { backgroundColor: s.bg }]}>
      <View style={[badgeStyles.dot, { backgroundColor: s.text }]} />
      <Text style={[badgeStyles.text, { color: s.text }]}>
        {STATUS_LABEL[status] ?? status}
      </Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 12, fontWeight: "600" },
});

// ============================================================
// KOMPONEN CARD WORK ORDER
// ============================================================

function WorkOrderCard({ item }: { item: WorkOrder }) {
  return (
    <TouchableOpacity
      style={cardStyles.container}
      activeOpacity={0.85}
      onPress={() =>
        router.push(
          `/(beranda)/work_order/work_order_detail?id=${item.wo_id}` as any
        )
      }
    >
      <View style={cardStyles.header}>
        <Text style={cardStyles.nomorWo}>{item.nomor_wo}</Text>
        <StatusBadge status={item.status} />
      </View>

      {item.user?.nama && (
        <Text style={cardStyles.customerName}>{item.user.nama}</Text>
      )}

      {item.kendaraan && (
        <View style={cardStyles.kendaraanRow}>
          <Ionicons name="car-outline" size={14} color="#6B7280" />
          <Text style={cardStyles.kendaraanText}>
            {item.kendaraan.merek} {item.kendaraan.model}
          </Text>
          <View style={cardStyles.platBadge}>
            <Text style={cardStyles.platText}>
              {item.kendaraan.nomor_polisi}
            </Text>
          </View>
        </View>
      )}

      <View style={cardStyles.footer}>
        <Ionicons name="link-outline" size={12} color="#D1D5DB" />
        <Text style={cardStyles.woIdText} numberOfLines={1}>
          {item.wo_id}
        </Text>
        <Text style={cardStyles.detailLink}>Detail &gt;</Text>
      </View>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nomorWo: { fontSize: 14, fontWeight: "700", color: "#111827" },
  customerName: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  kendaraanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  kendaraanText: { fontSize: 13, color: "#6B7280" },
  platBadge: {
    backgroundColor: "#1E3A5F",
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  woIdText: { fontSize: 11, color: "#D1D5DB", flex: 1 },
  detailLink: { fontSize: 12, color: "#2563EB", fontWeight: "600" },
});

// ============================================================
// SCREEN UTAMA
// ============================================================

export default function WorkOrderScreen() {
  const { workOrders, isLoading, isPending, refetch } = useGetAllWorkOrders();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("semua");
  const [refreshing, setRefreshing] = useState(false);

  // Refetch setiap kali layar ini difokuskan (navigasi balik dari create/detail)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Hitung jumlah per status untuk tab label
  const countByStatus = useMemo(() => {
    const map: Record<string, number> = { semua: workOrders.length };
    workOrders.forEach((wo) => {
      map[wo.status] = (map[wo.status] ?? 0) + 1;
    });
    return map;
  }, [workOrders]);

  // Summary card counts
  const summaryCount = useMemo(() => ({
    total:      workOrders.length,
    dikerjakan: workOrders.filter((w) => w.status === "sedang_dikerjakan").length,
    suspend:    workOrders.filter((w) => w.status === "suspend").length,
    selesai:    workOrders.filter((w) => w.status === "selesai" || w.status === "lunas").length,
  }), [workOrders]);

  // Filtering: tab + search
  const filtered = useMemo(() => {
    let list = workOrders;

    // Filter tab
    if (activeTab !== "semua") {
      list = list.filter((wo) => wo.status === activeTab);
    }

    // Filter search
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (wo) =>
          wo.nomor_wo.toLowerCase().includes(q) ||
          wo.user?.nama?.toLowerCase().includes(q) ||
          wo.kendaraan?.nomor_polisi?.toLowerCase().includes(q) ||
          wo.kendaraan?.merek?.toLowerCase().includes(q) ||
          wo.kendaraan?.model?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [workOrders, activeTab, search]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        {[
          { label: "Total WO",   value: summaryCount.total,      color: "#2563EB" },
          { label: "Dikerjakan", value: summaryCount.dikerjakan,  color: "#EA580C" },
          { label: "Suspend",    value: summaryCount.suspend,     color: "#CA8A04" },
          { label: "Selesai",    value: summaryCount.selesai,     color: "#16A34A" },
        ].map((item) => (
          <View key={item.label} style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: item.color }]}>
              {item.value}
            </Text>
            <Text style={styles.summaryLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Search + Buat WO */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari WO, nama customer, plat..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          activeOpacity={0.85}
          onPress={() =>
            router.push("/(beranda)/work_order/create_work_order" as any)
          }
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.createBtnText}>Buat WO</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Filter */}
      <FlatList
        data={STATUS_TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.value}
        style={styles.tabList}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          const count = countByStatus[item.value] ?? 0;
          const isActive = activeTab === item.value;
          return (
            <TouchableOpacity
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(item.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {item.label}
                {count > 0 ? ` ${count}` : ""}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* List */}
      <View style={{ flex: 1 }}>
      {isLoading || isPending ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Memuat work order...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.wo_id}
          renderItem={({ item }) => <WorkOrderCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2563EB"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color="#D1D5DB"
              />
              <Text style={styles.emptyTitle}>
                {search || activeTab !== "semua"
                  ? "Tidak ada hasil"
                  : "Belum ada work order"}
              </Text>
              {search ? (
                <Text style={styles.emptySubtitle}>
                  Coba kata kunci lain atau hapus filter
                </Text>
              ) : activeTab !== "semua" ? (
                <Text style={styles.emptySubtitle}>
                  Tidak ada WO dengan status ini
                </Text>
              ) : null}
            </View>
          }
        />
        )}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },

  // Summary
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryValue: { fontSize: 22, fontWeight: "800" },
  summaryLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center",
  },

  // Search
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827", outlineStyle: 'none' },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 5,
  },
  createBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },

  // Tabs
  tabList: {
    marginTop: 14,
    marginBottom: 8,
    flexGrow: 0,    // ← penting: cegah tab FlatList meregang
    flexShrink: 0,
  }, 
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
tabText: { fontSize: 13, color: "#6B7280", fontWeight: "600" }, 
tabTextActive: { color: "#6B7280", fontWeight: "600" }, 
centerContent: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  // List
  listContent: { padding: 16, paddingBottom: 100 },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingTop: 60,
  },
  loadingText: { fontSize: 13, color: "#9CA3AF" },
  emptyContainer: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 15, color: "#6B7280", fontWeight: "600" },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
});