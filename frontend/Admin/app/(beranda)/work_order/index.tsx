import React from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";
import { useWorkOrderFilter } from "../../../src/hooks/work_order.hooks";
import SummaryCards from "../../../src/components/work_order/summaryCards";
import SearchRow from "../../../src/components/work_order/searchRow";
import StatusTabs from "../../../src/components/work_order/statusTabs";
import EmptyState from "../../../src/components/work_order/emptyState";
import WorkOrderCard from "../../../src/components/work_order/workOrderCard";

export default function WorkOrderScreen() {
  const {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    refreshing,
    filtered,
    countByStatus,
    summaryCount,
    isLoading,
    handleRefresh,
  } = useWorkOrderFilter();

  return (
    <View style={styles.container}>
      {/* 1. Summary Bagian Atas */}
      <SummaryCards counts={summaryCount} />

      {/* 2. Bar Pencarian & Tombol Tambah */}
      <SearchRow search={search} setSearch={setSearch} />

      {/* 3. Bar Kategori Filter Status */}
      <StatusTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        countByStatus={countByStatus}
      />

      {/* 4. Konten List / Loading */}
      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Memuat work order...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.wo_id}
          renderItem={({ item }) => <WorkOrderCard workOrder={item} />}
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
            <EmptyState search={search} activeTab={activeTab} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  listContent: { padding: 16, paddingBottom: 100 },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingTop: 60,
  },
  loadingText: { fontSize: 13, color: "#9CA3AF" },
});
