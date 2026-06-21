import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ToastType = "success" | "error";

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showSuccess: (message: string, onDismiss?: () => void) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showSuccess: () => {},
  showError: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ── Toast UI ──────────────────────────────────────────────────────────────────
function ToastBanner({ state }: { state: ToastState }) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state.visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state.visible]);

  const bg = state.type === "success" ? "#2E7D32" : "#C62828";
  const icon = state.type === "success" ? "checkmark-circle" : "alert-circle";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.banner,
        { backgroundColor: bg, transform: [{ translateY }], opacity },
      ]}
    >
      <Ionicons name={icon} size={22} color="#FFF" />
      <Text style={styles.bannerText}>{state.message}</Text>
    </Animated.View>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastState, setToastState] = useState<ToastState>({
    visible: false,
    message: "",
    type: "success",
  });
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (message: string, type: ToastType, onDismiss?: () => void) => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    if (callbackTimer.current) clearTimeout(callbackTimer.current);

    setToastState({ visible: true, message, type });

    // Start hiding after 2s, call callback 300ms later (after exit animation)
    dismissTimer.current = setTimeout(() => {
      setToastState((s) => ({ ...s, visible: false }));
    }, 2000);

    callbackTimer.current = setTimeout(() => {
      onDismiss?.();
    }, 2300);
  };

  const showSuccess = (message: string, onDismiss?: () => void) =>
    show(message, "success", onDismiss);

  const showError = (message: string) => show(message, "error");

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      <ToastBanner state={toastState} />
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  bannerText: {
    flex: 1,
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 20,
  },
});
