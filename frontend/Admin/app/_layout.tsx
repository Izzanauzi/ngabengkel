import React, { useState, useEffect } from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import { AuthProvider, useAuth } from "../src/contexts/auth.context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, StyleSheet, Platform } from "react-native";
import { ToastProvider } from "../src/contexts/toast.context";
import Header from "../src/components/header";
import Sidebar from "../src/components/sidebar";

const queryClient = new QueryClient();

const PUBLIC_ROUTES = ["login", "register", "index"];

function AppShell() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const segment = pathname.split("/").pop() ?? "";
  const isPublic =
    PUBLIC_ROUTES.includes(segment) || pathname.startsWith("/(auth)");

  // Auth guard — redirect ke login kalau belum punya token
  useEffect(() => {
    if (!isLoading && !token && !isPublic) {
      router.replace("/(auth)/login");
    }
  }, [isLoading, token, isPublic]);

  const PAGE_TITLES: Record<string, string> = {
    home: "Beranda",
    booking: "Booking",
    history: "Histori",
    profile: "Profil",
    Servicess: "Services",
    work_order: "Work Order",
    mekanik: "Mekanik",
    customer: "Customer",
    inventori: "Inventori",
    laporan: "Laporan",
  };
  const pageTitle = PAGE_TITLES[segment];

  const showShell = !isPublic && !isLoading && !!token;

  return (
    <View style={styles.root}>
      {showShell && (
        <Header
          title={pageTitle}
          onMenuPress={() => setSidebarOpen(true)}
          notifCount={3}
        />
      )}

      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(beranda)" />
        </Stack>
      </View>

      {showShell && (
        <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <View style={styles.container}>
            <View style={styles.mobileWrapper}>
              <AppShell />
            </View>
          </View>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: Platform.OS === "web" ? "center" : "stretch",
  },
  mobileWrapper: {
    flex: 1,
    width: Platform.OS === "web" ? 390 : "100%",
    maxWidth: 390,
    overflow: Platform.OS === "web" ? "hidden" : undefined,
  },
  root: { flex: 1, backgroundColor: "#EEF2F7" },
  content: { flex: 1 },
});
