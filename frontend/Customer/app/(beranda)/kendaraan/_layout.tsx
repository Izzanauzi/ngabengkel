import RequireAuth from '../../../src/components/auth/requireAuth';
import { Stack } from 'expo-router'
export default function KendaraanLayout() {
    return (
      <RequireAuth>
        <Stack screenOptions={{ headerShown: false }} />
      </RequireAuth>
    )
  }