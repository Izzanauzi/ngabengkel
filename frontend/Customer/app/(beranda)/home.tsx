import { StyleSheet, Text, View, Button } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from "../../src/contexts/auth.context";


export default function Home() {
  const router = useRouter();
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const handleLogout = () => setIsLoggedIn(false);
  // const handleLogin = () => setIsLoggedIn(true);
  const { token } = useAuth();

  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      {token ? (
        // ── konten User sudah login ──
        <View>
          <Text>Selamat datang kembali!</Text>
          <Text>Ini konten khusus member</Text>
        </View>
      ) : (
        // ── konten User belum login ──
        <View>
          <Text>Silahkan login untuk melihat konten</Text>
          <Button
            onPress={() => router.push('/(auth)/login')}
            title="Login"
            color="#3B7BF6"
          />
        </View>
      )}

<Button onPress={logout} title="Logout" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 100,
  },
  heading: {
    fontWeight: "bold"
  }
})