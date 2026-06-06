import React, { useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Pressable, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "../contexts/auth.context";

const MENU_ITEMS = [
  { label: "Mekanik",    icon: "construct-outline",  route: "/mekanik"    },
  { label: "Customer",   icon: "people-outline",     route: "/customer"   },
  { label: "Booking",    icon: "calendar-outline",   route: "/booking"    },
  { label: "Inventori",  icon: "cube-outline",       route: "/inventori"  },
  { label: "Work Order", icon: "clipboard-outline",  route: "/work_order" },
  { label: "Laporan",    icon: "bar-chart-outline",  route: "/laporan"    },
  { label: "Histori",    icon: "time-outline",       route: "/history"    },
];

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function Sidebar({ visible, onClose }: SidebarProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const translateX     = useRef(new Animated.Value(-300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // FIX #3: Pindah animasi ke useEffect, bukan saat render
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -300, duration: 220, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const navigate = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 250);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    setTimeout(() => router.replace("/(auth)/login"), 250);
  };

  const initials = user?.nama
    ? user.nama.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "AD";

  return (
    <>
      {/* FIX #2: overlay selalu ada tapi opacity 0 saat hidden, 
          pointerEvents none saat tidak visible agar tidak block touch */}
      <Pressable
        style={[StyleSheet.absoluteFill, { zIndex: 100 }]}
        onPress={onClose}
        pointerEvents={visible ? "auto" : "none"}
      >
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </Pressable>

      {/* FIX #2: sidebar selalu di DOM, pakai pointerEvents untuk kontrol */}
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[styles.sidebar, { transform: [{ translateX }] }]}
      >
        {/* Brand */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="settings-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.brandName}>Ngabengkel</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={22} color="#888" />
          </TouchableOpacity>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.nama ?? "Admin"}</Text>
            <Text style={styles.userRole}>{user?.role ?? "Super Admin"}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <Text style={styles.menuLabel}>MENU UTAMA</Text>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname.includes(item.label.toLowerCase().replace(" ", "-"));
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => navigate(item.route)}
                activeOpacity={0.75}
              >
                <Ionicons name={item.icon as any} size={20} color={isActive ? "#fff" : "#555"} />
                <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{item.label}</Text>
                {isActive && <Ionicons name="chevron-forward" size={15} color="#fff" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#E53935" />
            <Text style={[styles.footerText, { color: "#E53935" }]}>Keluar</Text>
          </TouchableOpacity>
          <Text style={styles.version}>Ngabengkel Admin · v1.0.0</Text>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sidebar: {
    position: "absolute",
    top: 0, left: 0, bottom: 0, width: 280,
    backgroundColor: "#fff",
    zIndex: 101,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#3B7BF6", justifyContent: "center", alignItems: "center",
  },
  brandName: { fontSize: 18, fontWeight: "800", color: "#1a1a2e" },
  userCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    margin: 16, backgroundColor: "#F0F5FF", padding: 14, borderRadius: 14,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: "#3B7BF6", justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  userName: { fontSize: 14, fontWeight: "700", color: "#1a1a2e" },
  userRole: { fontSize: 12, color: "#3B7BF6", fontWeight: "600", marginTop: 1 },
  menu: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },
  menuLabel: {
    fontSize: 11, fontWeight: "700", color: "#aaa",
    letterSpacing: 1, marginBottom: 6, paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, marginBottom: 2,
  },
  menuItemActive: { backgroundColor: "#3B7BF6" },
  menuText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#444" },
  menuTextActive: { color: "#fff" },
  footer: {
    paddingHorizontal: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: "#f0f0f0", gap: 2,
  },
  footerItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12,
  },
  footerText: { fontSize: 14, fontWeight: "600", color: "#444" },
  version: { fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 8 },
});