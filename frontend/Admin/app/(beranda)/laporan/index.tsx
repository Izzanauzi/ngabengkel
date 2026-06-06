import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useLaporan } from "../../../src/hooks/laporan.hooks";
import { Transaction } from "../../../src/@types/laporan.types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  const months = [
    "Jan","Feb","Mar","Apr","Mei","Jun",
    "Jul","Agt","Sep","Okt","Nov","Des",
  ];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

const formatDisplayDateShort = (dateStr: string): string => {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getWONumber = (tx: Transaction): string => {
  if (tx.nomor_wo) return tx.nomor_wo;
  return `#${tx.wo_id.substring(0, 7).toUpperCase()}`;
};

// ─── Sub-components ─────────────────────────────────────────────────────────

interface DatePickerFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
}) => {
  const [show, setShow] = useState(false);

  // ── Web platform ──
if (Platform.OS === "web") {
  return (
    <View style={styles.dateFieldWrapper}>
      <Text style={styles.dateLabel}>{label}</Text>
      <View style={styles.dateButton}>
        {/* @ts-ignore */}
        <input
          type="date"
          value={formatDate(value)}
          max={formatDate(new Date())}
          onChange={(e: any) => {
            if (e.target.value) {
              const [y, m, d] = e.target.value.split("-").map(Number);
              onChange(new Date(y, m - 1, d));
            }
          }}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#fff",
            fontSize: 13,
            fontWeight: "600",
            cursor: "pointer",
            width: "100%",
            padding: 0,
            margin: 0,
            colorScheme: "dark",
            // Sembunyikan icon kalender bawaan browser
            WebkitAppearance: "none",
          }}
        />
      </View>
    </View>
  );
}

  // ── Native (iOS / Android) ──
  const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShow(Platform.OS === "ios");
    if (selected) onChange(selected);
  };

  return (
    <View style={styles.dateFieldWrapper}>
      <Text style={styles.dateLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="calendar-outline"
          size={14}
          color="#fff"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.dateButtonText}>
          {formatDisplayDateShort(formatDate(value))}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

interface TransactionItemProps {
  item: Transaction;
  index: number;
  total: number;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ item, index, total }) => {
  const woNumber = getWONumber(item);
  const isLast = index === total - 1;

  return (
    <View style={[styles.txItem, isLast && styles.txItemLast]}>
      <View style={styles.txLeft}>
        <View style={styles.woBadge}>
          <Text style={styles.woBadgeText}>{woNumber}</Text>
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txCustomer} numberOfLines={1}>
            {item.customer_nama || "Customer"}
          </Text>
          <Text style={styles.txMeta}>
            {formatDisplayDate(
              item.tanggal_bayar ? item.tanggal_bayar.split("T")[0] : ""
            )}
            {item.kendaraan_info ? ` · ${item.kendaraan_info}` : ""}
          </Text>
        </View>
      </View>
      <View style={styles.txRight}>
        <Text style={styles.txAmount}>{formatRupiah(item.total_biaya)}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Lunas</Text>
        </View>
      </View>
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 5;

export default function LaporanScreen() {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState<Date>(weekAgo);
  const [endDate, setEndDate] = useState<Date>(today);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const { data, loading, error, fetchLaporan, reset } = useLaporan();

  const handleApply = useCallback(() => {
    if (startDate > endDate) return;
    setVisibleCount(ITEMS_PER_PAGE);
    fetchLaporan({
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
    });
  }, [startDate, endDate, fetchLaporan]);

  const handleReset = useCallback(() => {
    setStartDate(weekAgo);
    setEndDate(today);
    setVisibleCount(ITEMS_PER_PAGE);
    reset();
  }, [reset]);

  const visibleTransactions = data?.transaksi?.slice(0, visibleCount) ?? [];
  const hasMore = data ? visibleCount < (data.transaksi?.length ?? 0) : false;
  const rataRata =
    data && data.jumlah_transaksi > 0
      ? data.total_pendapatan / data.jumlah_transaksi
      : 0;

  return (
    <View style={styles.container}>
      {/* ── Header Filter ─────────────────────────────────────── */}
      <View style={styles.filterBar}>
        <Text style={styles.filterTitle}>FILTER PERIODE</Text>
        <View style={styles.filterRow}>
          <DatePickerField
            label="Dari"
            value={startDate}
            onChange={(d) => {
              setStartDate(d);
              if (d > endDate) setEndDate(d);
            }}
          />
          <DatePickerField
            label="Sampai"
            value={endDate}
            onChange={(d) => {
              setEndDate(d);
              if (d < startDate) setStartDate(d);
            }}
          />
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="filter"
                  size={14}
                  color="#fff"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.applyButtonText}>Terapkan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Content ───────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Error state */}
        {error && !loading && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.errorReset}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty / initial state */}
        {!data && !loading && !error && (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={56} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Belum ada data</Text>
            <Text style={styles.emptySubtitle}>
              Pilih periode dan tekan Terapkan untuk melihat laporan
            </Text>
          </View>
        )}

        {/* Data loaded */}
        {data && !loading && (
          <>
            {/* Stat Cards */}
            <View style={styles.statsRow}>
              <View style={styles.statCardLarge}>
                <View style={styles.statLargeHeader}>
                  <View style={styles.statIconCircle}>
                    <Ionicons name="trending-up" size={18} color="#1A73E8" />
                  </View>
                  {data.jumlah_transaksi > 0 && (
                    <View style={styles.growthBadge}>
                      <Ionicons name="arrow-up" size={10} color="#16A34A" />
                      <Text style={styles.growthText}>
                        +{data.jumlah_transaksi} WO
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.statLargeLabel}>Total Pendapatan</Text>
                <Text style={styles.statLargeValue}>
                  {formatRupiah(data.total_pendapatan)}
                </Text>
              </View>

              <View style={styles.statSmallCol}>
                <View style={[styles.statCard, { marginBottom: 10 }]}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#16A34A"
                    />
                    <Text style={[styles.statLabel, { marginLeft: 4 }]}>
                      WO Selesai
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.statValue,
                      { color: "#16A34A", fontSize: 26 },
                    ]}
                  >
                    {data.jumlah_transaksi}
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Ionicons
                      name="calculator-outline"
                      size={14}
                      color="#7C3AED"
                    />
                    <Text style={[styles.statLabel, { marginLeft: 4 }]}>
                      Rata-rata
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.statValue,
                      { color: "#1E293B", fontSize: 13 },
                    ]}
                  >
                    {formatRupiah(rataRata)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Daftar Transaksi */}
            <View style={styles.listCard}>
              <View style={styles.listHeader}>
                <View style={styles.listTitleRow}>
                  <View style={styles.listTitleAccent} />
                  <Text style={styles.listTitle}>Daftar Transaksi</Text>
                </View>
                <TouchableOpacity
                  style={styles.exportButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="download-outline"
                    size={14}
                    color="#1A73E8"
                  />
                  <Text style={styles.exportText}>Export</Text>
                </TouchableOpacity>
              </View>

              {/* Table header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>
                  NO. WO
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>
                  CUSTOMER
                </Text>
                <Text
                  style={[
                    styles.tableHeaderText,
                    { flex: 1.5, textAlign: "right" },
                  ]}
                >
                  TOTAL
                </Text>
              </View>

              {/* Rows */}
              {data.transaksi?.length === 0 ? (
                <View style={styles.noTxBox}>
                  <Text style={styles.noTxText}>
                    Tidak ada transaksi di periode ini
                  </Text>
                </View>
              ) : (
                <>
                  {visibleTransactions.map((tx, idx) => (
                    <TransactionItem
                      key={tx.transaction_id}
                      item={tx}
                      index={idx}
                      total={visibleTransactions.length}
                    />
                  ))}
                  {hasMore && (
                    <TouchableOpacity
                      style={styles.loadMoreBtn}
                      onPress={() =>
                        setVisibleCount((c) => c + ITEMS_PER_PAGE)
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.loadMoreText}>
                        Lihat{" "}
                        {(data.transaksi?.length ?? 0) - visibleCount}{" "}
                        transaksi lainnya
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color="#1A73E8"
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Footer total */}
            <View style={styles.footerTotal}>
              <View>
                <Text style={styles.footerLabel}>Total Periode</Text>
                <Text style={styles.footerPeriod}>
                  {formatDisplayDateShort(data.periode_mulai)} —{" "}
                  {formatDisplayDateShort(data.periode_akhir)}
                </Text>
              </View>
              <Text style={styles.footerAmount}>
                {formatRupiah(data.total_pendapatan)}
              </Text>
            </View>
          </>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1A73E8" />
            <Text style={styles.loadingText}>Memuat laporan...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  // ── Filter bar
  filterBar: {
    backgroundColor: "#1A73E8",
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  filterTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  dateFieldWrapper: {
    flex: 1,
  },
  dateLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    marginBottom: 5,
    fontWeight: "500",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // ── Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 13,
  },
  errorReset: {
    color: "#1A73E8",
    fontWeight: "700",
    fontSize: 12,
  },

  // ── Empty
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#94A3B8",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#CBD5E1",
    marginTop: 6,
    textAlign: "center",
    maxWidth: 240,
  },

  // ── Loading
  loadingBox: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 14,
  },

  // ── Stats
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  statCardLarge: {
    flex: 1.3,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statLargeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
  },
  growthBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 2,
  },
  growthText: {
    color: "#16A34A",
    fontSize: 11,
    fontWeight: "700",
  },
  statLargeLabel: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 4,
  },
  statLargeValue: {
    color: "#1A73E8",
    fontSize: 18,
    fontWeight: "800",
  },
  statSmallCol: {
    flex: 1,
    gap: 10,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardAccent: {
    backgroundColor: "#1A73E8",
  },
  statLabel: {
    color: "#64748B",
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    color: "#1E293B",
    fontSize: 18,
    fontWeight: "800",
  },

  // ── List card
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  listTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  listTitleAccent: {
    width: 4,
    height: 18,
    backgroundColor: "#1A73E8",
    borderRadius: 2,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C5D8FD",
    backgroundColor: "#F0F4FF",
  },
  exportText: {
    color: "#1A73E8",
    fontSize: 12,
    fontWeight: "600",
  },

  // ── Table
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },

  // ── Transaction row
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  txItemLast: {
    borderBottomWidth: 0,
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  woBadge: {
    backgroundColor: "#E8F0FE",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 72,
    alignItems: "center",
  },
  woBadgeText: {
    color: "#1A73E8",
    fontSize: 11,
    fontWeight: "700",
  },
  txInfo: {
    flex: 1,
  },
  txCustomer: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  txMeta: {
    fontSize: 11,
    color: "#94A3B8",
  },
  txRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  statusBadge: {
    backgroundColor: "#F0FDF4",
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  statusText: {
    color: "#16A34A",
    fontSize: 11,
    fontWeight: "600",
  },

  // ── No transactions
  noTxBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  noTxText: {
    color: "#94A3B8",
    fontSize: 13,
  },

  // ── Load more
  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 4,
  },
  loadMoreText: {
    color: "#1A73E8",
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Footer total
  footerTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1A73E8",
    borderRadius: 14,
    padding: 16,
  },
  footerLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginBottom: 2,
  },
  footerPeriod: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
  },
  footerAmount: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});