import { Text } from 'react-native'
import { Tabs } from 'expo-router'
import BottomTab from '../../src/components/bottomTab'

export default function BerandaLayout() {
  return (
    <Tabs
<<<<<<< HEAD
      tabBar={(props) => <BottomTab {...props} />}
=======
      tabBar={(props) => <BottomTab {...props} />} 
>>>>>>> e593e676bb3868d8c0dc8fdea2f1c103317e98de
      screenOptions={{
        tabBarActiveTintColor: '#3B7BF6',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Beranda',
        }}
      />
      <Tabs.Screen
        name="services/index"
        options={{
          title: 'Servis',
        }}
      />
      <Tabs.Screen
        name="history/index"
        options={{
          title: 'Riwayat',
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profil',
        }}
      />
    </Tabs>
  )
}