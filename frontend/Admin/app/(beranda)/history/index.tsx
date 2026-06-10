import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerHistory } from "../../../src/hooks/history.hooks";
import type { CustomerWithStats } from "../../../src/@types/history.types";

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getInitials(nama: string): string {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatTanggal(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── CustomerCard ─────────────────────────────────────────────────────────────
function CustomerCard({
  customer,
  onPress,
}: {
  customer: CustomerWithStats;
  onPress: () => void;
}) {
  const color = getAvatarColor(customer.nama);
  const initials = getInitials(customer.nama);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Left border accent */}
      <View style={[styles.cardAccent, { backgroundColor: color }]} />

      <View style={styles.cardContent}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName} numberOfLines={1}>
              {customer.nama}
            </Text>
            <Text style={styles.customerPhone}>{customer.telepon}</Text>
            {customer.terakhir_servis && (
              <Text style={styles.lastService}>
                Terakhir: {formatTanggal(customer.terakhir_servis)}
              </Text>
            )}
          </View>
          <View style={styles.woBadge}>
            <Text style={styles.woBadgeText}>{customer.total_wo}x Servis</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total WO</Text>
            <Text style={[styles.statValue, { color: "#1E40AF" }]}>
              {customer.total_wo}x
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Pengeluaran</Text>
            <Text style={[styles.statValue, { color: "#059669" }]}>
              {customer.total_biaya > 0
                ? formatRupiah(customer.total_biaya)
                : "-"}
            </Text>
          </View>
          <TouchableOpacity style={styles.historyBtn} onPress={onPress}>
            <Text style={styles.historyBtnText}>Lihat Histori</Text>
            <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { customers, stats, isLoading, isRefreshing, refresh, error } =
    useCustomerHistory(debouncedQuery);

  const handleCustomerPress = (customer: CustomerWithStats) => {
    router.push(`/(beranda)/history/${customer.user_id}`);
  };

  const renderItem = useCallback(
    ({ item }: { item: CustomerWithStats }) => (
      <CustomerCard
        customer={item}
        onPress={() => handleCustomerPress(item)}
      />
    ),
    []
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>
          {debouncedQuery ? "Customer tidak ditemukan" : "Belum ada customer"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {debouncedQuery
            ? `Tidak ada customer dengan nama atau nomor "${debouncedQuery}"`
            : "Customer yang pernah servis akan muncul di sini"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{stats.totalCustomer}</Text>
          <Text style={styles.statCardLabel}>Customer</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{stats.totalWO}</Text>
          <Text style={styles.statCardLabel}>Total WO</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>
            {stats.totalTransaksi >= 1_000_000
              ? `${(stats.totalTransaksi / 1_000_000).toFixed(1)}Jt`
              : `${(stats.totalTransaksi / 1_000).toFixed(0)}Rb`}
          </Text>
          <Text style={styles.statCardLabel}>Total Transaksi</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#94A3B8"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari customer berdasarkan nama atau nomor HP..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Count label */}
      <Text style={styles.countLabel}>
        {isLoading
          ? "Memuat..."
          : `${customers.length} Customer · Ketuk untuk lihat riwayat servis`}
      </Text>

      {/* Error state */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Coba lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {isLoading && customers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Memuat data customer...</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.user_id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
            />
          }
          contentContainerStyle={
            customers.length === 0 ? styles.emptyList : styles.list
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Stats header
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statCardLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    padding: 0,
  },

  // Count label
  countLabel: {
    fontSize: 12,
    color: "#64748B",
    marginHorizontal: 16,
    marginBottom: 8,
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  emptyList: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAccent: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 14,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  customerInfo: {
    flex: 1,
    gap: 2,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  customerPhone: {
    fontSize: 13,
    color: "#64748B",
  },
  lastService: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  woBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  woBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3B82F6",
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  statItem: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#94A3B8",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E2E8F0",
  },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  historyBtnText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600",
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
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
    lineHeight: 20,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#94A3B8",
  },

  // Error
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#EF4444",
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#EF4444",
    borderRadius: 6,
  },
  retryText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});