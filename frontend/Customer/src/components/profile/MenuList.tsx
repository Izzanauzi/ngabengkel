import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function MenuList() {
  return (
    <View style={styles.menuContainer}>
      <View style={styles.menuItem}>
        <View style={styles.menuLeft}>
          <Ionicons name="notifications-outline" size={20} color="#f4b400" />
          <Text style={styles.menuText}>Notifikasi</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#999" />
      </View>

      <View style={styles.divider} />

      <View style={styles.menuItem}>
        <View style={styles.menuLeft}>
          <Ionicons name="document-text-outline" size={20} color="#888" />
          <Text style={styles.menuText}>Syarat & Ketentuan</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#999" />
      </View>

      <View style={styles.divider} />

      <View style={styles.menuItem}>
        <View style={styles.menuLeft}>
          <Ionicons name="help-circle-outline" size={20} color="#e74c3c" />
          <Text style={styles.menuText}>Bantuan</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#999" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 10,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
})