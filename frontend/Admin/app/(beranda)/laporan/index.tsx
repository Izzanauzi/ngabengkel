import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LaporanSummaryCards from "../../../src/components/laporan/laporanSummaryCards";
import TransaksiItem from "../../../src/components/laporan/transaksiItem";
import { useGetTransactionReport } from "../../../src/hooks/laporan.hooks";
import { formatRupiah } from "../../../src/utils/helper";
import { handleExportTransaksi } from '../../../src/components/laporan/exportService';

function toInputDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function formatDisplayDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Default: 7 hari terakhir
const today = new Date();
const weekAgo = new Date();
weekAgo.setDate(today.getDate() - 7);

// ── Main Page ──
export default function LaporanPage() {
  const [from, setFrom] = useState(toInputDate(weekAgo));
  const [to, setTo] = useState(toInputDate(today));
  const [applied, setApplied] = useState({
    from: toInputDate(weekAgo),
    to: toInputDate(today),
  });
  const [showAll, setShowAll] = useState(false);

  const { report, rataRata, isLoading } = useGetTransactionReport(
    applied.from,
    applied.to
  );

  const displayedTransactions = useMemo(() => {
    if (!report) return [];
    return showAll ? report.transactions : report.transactions.slice(0, 5);
  }, [report, showAll]);

  const remaining = (report?.transactions.length ?? 0) - 5;

  const handleApply = () => {
    if (!from || !to) return;
    setApplied({ from, to });
    setShowAll(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Filter Periode ── */}
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>FILTER PERIODE</Text>
          <View style={styles.filterRow}>
            {/* From */}
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>Dari</Text>
              {Platform.OS === "web" ? (
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    padding: "10px 8px",
                    fontSize: 12,
                    color: "#111827",
                    backgroundColor: "#fff",
                    width: "100%",
                    outline: "none",
                    boxSizing: "border-box",
                    height: 38,
                  }}
                />
              ) : (
                <TouchableOpacity style={styles.datePicker}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.datePickerText}>
                    {formatDisplayDate(from)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* To */}
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>Sampai</Text>
              {Platform.OS === "web" ? (
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    padding: "10px 8px",
                    fontSize: 12,
                    color: "#111827",
                    backgroundColor: "#fff",
                    width: "100%",
                    outline: "none",
                    boxSizing: "border-box",
                    height: 38,
                  }}
                />
              ) : (
                <TouchableOpacity style={styles.datePicker}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.datePickerText}>
                    {formatDisplayDate(to)}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Apply button */}
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Ionicons name="filter-outline" size={14} color="#fff" />
              <Text style={styles.applyBtnText}>Terapkan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Content ── */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Memuat laporan...</Text>
          </View>
        ) : !report ? (
          <View style={styles.emptyBox}>
            <Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              Pilih periode dan klik Terapkan
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <LaporanSummaryCards
              totalPendapatan={report.total_pendapatan}
              woSelesai={report.jumlah_transaksi}
              rataRata={rataRata}
              periodeDari={report.periode_dari}
              periodeSampai={report.periode_sampai}
            />

            {/* Daftar Transaksi */}
            <View style={styles.transaksiCard}>
              <View style={styles.transaksiHeader}>
                <Text style={styles.transaksiTitle}>Daftar Transaksi</Text>
                <TouchableOpacity style={styles.exportBtn} onPress={() => handleExportTransaksi(report?.transactions || [])}>
                  <Ionicons name="download-outline" size={14} color="#2563EB" />
                  <Text style={styles.exportText}>Export</Text>
                </TouchableOpacity>
              </View>

              {/* Table header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: 72 }]}>
                  NO. WO
                </Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>
                  CUSTOMER
                </Text>
                <Text style={[styles.tableHeaderText, { textAlign: "right" }]}>
                  TOTAL
                </Text>
              </View>

              {/* Rows */}
              {displayedTransactions.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>Tidak ada transaksi</Text>
                </View>
              ) : (
                displayedTransactions.map((t) => (
                  <TransaksiItem key={t.transaction_id} transaction={t} />
                ))
              )}

              {/* Show more */}
              {!showAll && remaining > 0 && (
                <TouchableOpacity
                  style={styles.showMoreBtn}
                  onPress={() => setShowAll(true)}
                >
                  <Text style={styles.showMoreText}>
                    Lihat {remaining} transaksi lainnya
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#2563EB" />
                </TouchableOpacity>
              )}
            </View>

            {/* Footer total */}
            <View style={styles.footerCard}>
              <View>
                <Text style={styles.footerLabel}>Total Periode</Text>
                <Text style={styles.footerPeriode}>
                  {formatDisplayDate(report.periode_dari)} —{" "}
                  {formatDisplayDate(report.periode_sampai)}
                </Text>
              </View>
              <Text style={styles.footerTotal}>
                {formatRupiah(report.total_pendapatan)}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  scroll: { padding: 16, paddingBottom: 40 },

  // Filter
  filterCard: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
    marginBottom: 10,
  },
  filterRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, width: "100%" },
  dateField: { flex: 1 },
  dateFieldLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 6,
    fontWeight: "600",
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  datePickerText: { fontSize: 12, color: "#111827" },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  applyBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  // Loading / Empty
  loadingBox: { alignItems: "center", paddingVertical: 60, gap: 12 },
  loadingText: { fontSize: 13, color: "#9CA3AF" },
  emptyBox: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 13, color: "#9CA3AF" },

  // Transaksi card
  transaksiCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  transaksiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  transaksiTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  exportText: { fontSize: 13, fontWeight: "600", color: "#2563EB" },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 4,
  },
  showMoreText: { fontSize: 13, fontWeight: "600", color: "#2563EB" },

  // Footer
  footerCard: {
    backgroundColor: "#1E3A5F",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },
  footerPeriode: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  footerTotal: { fontSize: 18, fontWeight: "800", color: "#fff" },
});
