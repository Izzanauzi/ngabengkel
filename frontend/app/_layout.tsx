// import { Stack } from 'expo-router';

// export default function RootLayout() {
//   return (
//     <Stack screenOptions={{ headerShown: false }}>
      
//     </Stack>
//   );
// }
// app/_layout.tsx
import { Slot } from "expo-router";
import { AuthProvider } from "../src/contexts/auth.context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}