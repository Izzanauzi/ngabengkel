import { Stack } from 'expo-router'
import { AuthProvider } from '../src/contexts/auth.context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { View, StyleSheet, Platform } from 'react-native'

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <View style={styles.container}>
          <View style={styles.mobileWrapper}>
            <Stack screenOptions={{ headerShown: false }}> {/* ← pindah ke screenOptions */}
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(beranda)" />
            </Stack>
          </View>
        </View>
    </AuthProvider>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e', // warna di luar "hp", sesuaikan selera
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  mobileWrapper: {
    flex: 1,
    width: Platform.OS === 'web' ? 390 : '100%',
    maxWidth: 390,
    overflow: Platform.OS === 'web' ? 'hidden' : undefined,
  },
})