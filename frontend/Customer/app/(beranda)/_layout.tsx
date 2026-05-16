import { Tabs } from 'expo-router'
import BottomTab from '../../src/components/bottomTab'

export default function BerandaLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTab {...props} />}
      screenOptions={{
        tabBarActiveTintColor: '#3B7BF6',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="services" options={{ title: 'Servis', href: 'services/index' }} />
      <Tabs.Screen name="history" options={{ title: 'Riwayat', href: 'history/index' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', href: 'profile/index' }} />
      
      {/* nggak pakai tab bar */}
      <Tabs.Screen name="services/index" options={{ href: null }} />
      <Tabs.Screen name="services/[id]" options={{ href: null }} />
      <Tabs.Screen name="history/index" options={{ href: null }} />
      <Tabs.Screen name="profile/index" options={{ href: null }} />
      <Tabs.Screen name="booking/index" options={{ href: null }} />
      <Tabs.Screen name="kendaraan/index" options={{ href: null }} />
      <Tabs.Screen name="kendaraan/create" options={{ href: null }} />
      <Tabs.Screen name="kendaraan/[kendaraan]" options={{ href: null }} />
      <Tabs.Screen name="schedule/index" options={{ href: null }} />
    </Tabs>
  )
}