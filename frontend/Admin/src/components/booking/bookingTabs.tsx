import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export type TabKey = "semua" | "menunggu_konfirmasi";

const TABS: { key: TabKey; label: string }[] = [
  { key: "semua",               label: "Semua"    },
  { key: "menunggu_konfirmasi", label: "Menunggu" },
];

interface BookingTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  counts: Record<TabKey, number>;
}

export default function BookingTabs({ activeTab, onTabChange, counts }: BookingTabsProps) {
  return (
    <View style={styles.row}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabList}
        style={{ flex: 1 }}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.badge, isActive && styles.badgeActive]}>
                <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                  {counts[tab.key]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
{/* 
      <TouchableOpacity
        style={styles.newBtn}
        onPress={() => router.push("/(beranda)/booking/create" as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={16} color="#fff" />
        <Text style={styles.newBtnText}>Booking Baru</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  tabList: {
    flexDirection: "row",
    gap: 6,
    paddingRight: 4,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  tabText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  tabTextActive: { color: "#fff" },
  badge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
  },
  badgeActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#6B7280" },
  badgeTextActive: { color: "#fff" },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  newBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});