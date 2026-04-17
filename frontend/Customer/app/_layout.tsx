import { Stack } from 'expo-router'
import { AuthProvider } from '../src/contexts/auth.context'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(beranda)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  )
}