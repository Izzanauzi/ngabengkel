import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Jangan isi apa-apa di dalam sini dulu agar otomatis baca semua file */}
    </Stack>
  );
}