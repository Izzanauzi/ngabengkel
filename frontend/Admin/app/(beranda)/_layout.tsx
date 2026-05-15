import { Text } from 'react-native'
import { Tabs } from 'expo-router'


export default function BerandaLayout() {
  return (
    <Tabs
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
          tabBarIcon: () => <Text style={{ fontSize: 20 }}></Text>,
        }}
      />
      <Tabs.Screen
        name="booking/index"
        options={{
          title: 'Booking',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}></Text>,
        }}
      />
      <Tabs.Screen
        name="services/index"
        options={{
          title: 'Services',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}></Text>,
        }}
      />

    </Tabs>
  )
}