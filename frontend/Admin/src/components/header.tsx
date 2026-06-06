import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/auth.context";

interface HeaderProps {
  title: string;
  onMenuPress: () => void;
  notifCount?: number;
}

export default function Header({ title, onMenuPress, notifCount = 0 }: HeaderProps) {
  const { user } = useAuth();
  const initials = user?.nama
    ? user.nama.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "AD";

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.btn} onPress={onMenuPress} activeOpacity={0.7}>
        <Ionicons name="menu" size={22} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.right}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#3B7BF6",
    gap: 12,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FFB300",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 13 },
});