import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotaTagihanScreen() {
  // State untuk menyimpan pilihan metode pembayaran
  const [paymentMethod, setPaymentMethod] = useState('Tunai');

  // Komponen Reusable untuk Radio Button
  const RadioButton = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.outerCircle, selected && styles.selectedOuterCircle]}>
        {selected && <View style={styles.innerCircle} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nota Tagihan</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* KARTU 1: INFO WORK ORDER */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.woNumber}>WO-2025-0042</Text>
              <Text style={styles.notaNumber}>Nota #NTA-2025-0038</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Belum Lunas</Text>
            </View>
          </View>

          <Text style={styles.infoLabel}>Customer</Text>
          <Text style={styles.infoValue}>Budi Santoso</Text>

          <Text style={styles.infoLabel}>Kendaraan</Text>
          <Text style={styles.infoValue}>Honda Vario 150 · D 1234 ABC</Text>

          <Text style={styles.infoLabel}>Mekanik</Text>
          <Text style={styles.infoValue}>Agus Riyadi</Text>

          <Text style={styles.infoLabel}>Tanggal Selesai</Text>
          <Text style={styles.infoValue}>10 Jun 2024, 15:30</Text>
        </View>

        {/* KARTU 2: RINCIAN BIAYA */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>RINCIAN BIAYA</Text>
          
          <View style={styles.costItemRow}>
            <Text style={styles.costItemName}>Jasa Servis</Text>
            <Text style={styles.costItemPrice}>Rp 150.000</Text>
          </View>

          <View style={styles.costItemRow}>
            <Text style={styles.costItemName}>Oli Mesin 10W-40 × 1</Text>
            <Text style={styles.costItemPrice}>Rp 65.000</Text>
          </View>

          <View style={styles.costItemRow}>
            <Text style={styles.costItemName}>Filter Oli × 1</Text>
            <Text style={styles.costItemPrice}>Rp 35.000</Text>
          </View>

          <View style={styles.costItemRow}>
            <Text style={styles.costItemName}>Busi NGK × 2</Text>
            <Text style={styles.costItemPrice}>Rp 56.000</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Subtotal</Text>
            <Text style={styles.subtotalValue}>Rp 306.000</Text>
          </View>

          <View style={styles.discountRow}>
            <Text style={styles.discountLabel}>Diskon</Text>
            <Text style={styles.discountValue}>- Rp 6.000</Text>
          </View>

          <View style={styles.thickDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rp 300.000</Text>
          </View>
        </View>

        {/* KARTU 3: METODE PEMBAYARAN */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>METODE PEMBAYARAN</Text>
          
          <RadioButton 
            label="Tunai" 
            selected={paymentMethod === 'Tunai'} 
            onPress={() => setPaymentMethod('Tunai')} 
          />
          <RadioButton 
            label="Transfer Bank" 
            selected={paymentMethod === 'Transfer Bank'} 
            onPress={() => setPaymentMethod('Transfer Bank')} 
          />
          <RadioButton 
            label="QRIS" 
            selected={paymentMethod === 'QRIS'} 
            onPress={() => setPaymentMethod('QRIS')} 
          />

          {/* TOMBOL KONFIRMASI PEMBAYARAN */}
          <TouchableOpacity style={styles.btnConfirm}>
            <Text style={styles.btnConfirmText}>Konfirmasi Pembayaran</Text>
          </TouchableOpacity>
        </View>

        {/* Spacing bawah untuk scroll yang nyaman */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerContainer: {
    backgroundColor: '#1a73e8', // Biru primary sesuai request
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40, // Sesuaikan dengan safe area device
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  
  // Gaya Kartu Info
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  woNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  notaNumber: {
    fontSize: 13,
    color: '#888',
  },
  statusBadge: {
    backgroundColor: '#fef5e7', // Background kuning pucat
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#d98a2c', // Teks emas keorenan
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    marginTop: 12,
  },
  infoValue: {
    fontSize: 15,
    color: '#222',
  },

  // Gaya Kartu Rincian Biaya
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  costItemRow: {
    marginBottom: 14,
  },
  costItemName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  costItemPrice: {
    fontSize: 15,
    color: '#222',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  thickDivider: {
    height: 1.5,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discountLabel: {
    fontSize: 14,
    color: '#666',
  },
  discountValue: {
    fontSize: 15,
    color: '#222',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a73e8', // Biru primary
  },

  // Gaya Metode Pembayaran
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  outerCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedOuterCircle: {
    borderColor: '#1a73e8',
  },
  innerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#1a73e8',
  },
  radioLabel: {
    fontSize: 15,
    color: '#333',
  },
  
  // Tombol Konfirmasi
  btnConfirm: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});