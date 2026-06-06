import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

// Definisikan tipe data props yang akan diterima komponen
interface HistoryCardProps {
  title: string;
  code: string;
  services: string[];
  date: string;
  price: string;
  status: string;
  onPress?: () => void;
}

export default function HistoryCard({ title, code, services, date, price, status, onPress }: HistoryCardProps) {
  return (
    <View style={styles.card}>
      {/* HEADER CARD */}
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.vehicle}>{title}</Text>
          <Text style={styles.code}>{code}</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ {status}</Text>
        </View>
      </View>

      {/* LIST SERVICE */}
      <View style={styles.list}>
        {services.map((srv, index) => (
          <Text key={index} style={styles.serviceItem}>
            • {srv}
          </Text>
        ))}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.date}>{date}</Text>
          <Text style={styles.price}>{price}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Lihat Detail</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vehicle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  code: {
    color: '#888',
    fontSize: 12,
  },
  badge: {
    backgroundColor: '#e6f7ec',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#2ecc71',
    fontSize: 12,
  },
  list: {
    marginVertical: 10,
  },
  serviceItem: {
    color: '#555',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#888',
    fontSize: 12,
  },
  price: {
    color: '#3B7BF6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    borderWidth: 1,
    borderColor: '#3B7BF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: {
    color: '#3B7BF6',
    fontSize: 12,
  },
})