import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface VehicleCardProps {
  name: string;
  year: string;
  type: string;
  plate: string;
}

export default function VehicleCard({ name, year, type, plate }: VehicleCardProps) {
  return (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleRow}>
        
        <View style={styles.iconBox}>
          <Ionicons name="car-outline" size={24} color="#3B7BF6" />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.vehicleName}>{name}</Text>
          <Text style={styles.subText}>Tahun {year} · {type}</Text>
          <Text style={styles.plate}>{plate}</Text>
        </View>

        <View>
          <TouchableOpacity style={styles.btnEdit}>
            <Text style={styles.textEdit}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnDelete}>
            <Text style={styles.textDelete}>Hapus</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    backgroundColor: '#F0F5FF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleName: {
    fontWeight: 'bold',
  },
  subText: {
    color: '#666',
  },
  plate: {
    backgroundColor: '#F0F5FF',
    color: '#3B7BF6',
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnEdit: {
    borderWidth: 1,
    borderColor: '#3B7BF6',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  textEdit: {
    color: '#3B7BF6',
    fontSize: 12,
  },
  btnDelete: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  textDelete: {
    color: '#fff',
    fontSize: 12,
  },
})