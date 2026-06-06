import { Stack } from 'expo-router'
import { AuthProvider } from '../src/contexts/auth.context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { View, StyleSheet, Platform } from 'react-native'
import { ToastProvider } from '../src/contexts/toast.context'

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <View style={styles.container}>
            <View style={styles.mobileWrapper}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(beranda)" />
                <Stack.Screen name="unauthorized" />
              </Stack>
            </View>
          </View>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  mobileWrapper: {
    flex: 1,
    width: Platform.OS === 'web' ? 390 : '100%',
    maxWidth: 390,
    overflow: Platform.OS === 'web' ? 'hidden' : undefined,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: '#EEF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
    zIndex: 999,
  },
  icon: { fontSize: 64 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a2e' },
  message: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
  btnLogin: {
    backgroundColor: '#3B7BF6',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 12,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnBack: { color: '#3B7BF6', fontSize: 14, textDecorationLine: 'underline' },
})