import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function EmptyState() {
  return (
    <View style={styles.emptyBox}>
      <Ionicons name="clipboard-outline" size={50} color="#bbb" />
      <Text style={styles.emptyText}>Belum ada riwayat servis</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  emptyBox: {
    marginTop: 50,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
  },
})