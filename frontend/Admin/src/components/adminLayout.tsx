import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/auth.context";
import Header from "./header";
import Sidebar from "./sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  notificationCount?: number;
}
export default function AdminLayout({
  children,
  title = "Admin",
  notificationCount = 0,
}: AdminLayoutProps) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/unauthorized");
    }
  }, [isLoading, token]);

  // Saat masih loading auth, tampilkan layar kosong agar tidak flicker
  if (isLoading || !token) return null;

  return (
    <View style={styles.root}>
      {/* Header */}
      <Header
        title={title}
        onMenuPress={() => setSidebarOpen(true)}
        notificationCount={notificationCount}
      />

      {/* Page Content */}
      <View style={styles.content}>{children}</View>

      {/* Sidebar (rendered over everything) */}
      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EEF2F7",
  },
  content: {
    flex: 1,
  },
});
