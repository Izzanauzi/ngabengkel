import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAllKendaraan, useGetAllWorkOrders } from '../../hooks/work_order.hooks';

// Fungsi bantuan untuk format Rupiah yang tahan banting (anti Rp 0)
const formatRupiah = (angka: number | string | undefined | null) => {
  if (!angka) return 'Rp 0';
  const numericValue = typeof angka === 'string' ? parseFloat(angka) : Number(angka);
  if (isNaN(numericValue)) return 'Rp 0';
  return 'Rp ' + numericValue.toLocaleString('id-ID');
};

// Fungsi bantuan untuk format Tanggal
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function CustomerDetail({ customer, onBack }: any) {
  // Ambil data kendaraan & filter KHUSUS untuk customer ini
  const { kendaraanList, isLoading: loadingKendaraan } = useGetAllKendaraan();
  const customerKendaraan = kendaraanList?.filter((k: any) => k.user_id === customer.user_id) || [];

  // Ambil data histori WO & filter KHUSUS untuk customer ini
  const { workOrders, isLoading: loadingWO } = useGetAllWorkOrders();
  const historyWO = workOrders?.filter((wo: any) => 
    wo.user_id === customer.user_id || wo.user?.user_id === customer.user_id
  ) || [];

  return (
    <View style={styles.container}>
      <View style={styles.detailHeaderArea}>
        <View style={styles.bgCircleLarge} />
        <View style={styles.bgCircleSmall} />

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Customer</Text>
        </TouchableOpacity>

        <View style={styles.profileRow}>
          <View style={styles.detailAvatar}>
            <Text style={styles.detailAvatarText}>{customer.initials}</Text>
          </View>
          <View>
            <Text style={styles.detailName}>{customer.name}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeRow}>
          <View style={styles.detailHeaderBadge}>
            <Ionicons name="car-outline" size={14} color="#fff" />
            <Text style={styles.detailBadgeText}>
              {loadingKendaraan ? '...' : customerKendaraan.length} Kendaraan
            </Text>
          </View>
          <View style={styles.detailHeaderBadge}>
            <Text style={styles.detailBadgeText}># {loadingWO ? '...' : historyWO.length} Riwayat WO</Text>
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.detailScrollView} showsVerticalScrollIndicator={false}>
        {/* Card INFORMASI KONTAK */}
        <View style={styles.infoContactCard}>
          <Text style={styles.infoContactTitle}>INFORMASI KONTAK</Text>

          <View style={styles.contactItemRow}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="call-outline" size={18} color="#1a73e8" />
            </View>
            <Text style={styles.contactItemText}>{customer.phone}</Text>
          </View>

          {customer.email ? (
            <View style={[styles.contactItemRow, { borderBottomWidth: 0 }]}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="mail-outline" size={18} color="#1a73e8" />
              </View>
              <Text style={styles.contactItemText}>{customer.email}</Text>
            </View>
          ) : (
            <View style={{ height: 4 }} />
          )}
        </View>

        {/* Section KENDARAAN */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <View style={styles.blueBarIndicator} />
            <Text style={styles.sectionHeadingTitle}>Kendaraan</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>+ Tambah</Text>
          </TouchableOpacity>
        </View>

        {loadingKendaraan ? (
          <ActivityIndicator size="small" color="#1a73e8" style={{ marginBottom: 16 }} />
        ) : customerKendaraan.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="car-outline" size={32} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada kendaraan</Text>
          </View>
        ) : (
          customerKendaraan.map((k: any) => (
            <View key={k.kendaraan_id} style={styles.vehicleCardItem}>
              <View style={styles.vehicleIconBox}>
                <Ionicons name="car-outline" size={24} color="#1a73e8" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.vehicleNameRow}>
                  <Text style={styles.vehicleModelName}>{k.merek} {k.model}</Text>
                  {k.tahun ? (
                    <View style={styles.yearBadge}>
                      <Text style={styles.yearBadgeText}>{k.tahun}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.vehicleMetaRow}>
                  <Text style={styles.plateNumberBadge}>{k.nomor_polisi}</Text>
                  {k.warna ? <Text style={styles.colorText}>{k.warna}</Text> : null}
                </View>
              </View>
            </View>
          ))
        )}

        {/* Section HISTORI SERVIS */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <View style={styles.greenBarIndicator} />
            <Text style={styles.sectionHeadingTitle}>Histori Servis</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Semua &gt;</Text>
          </TouchableOpacity>
        </View>

        {loadingWO ? (
          <ActivityIndicator size="small" color="#1ea446" style={{ marginBottom: 16 }} />
        ) : historyWO.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={32} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada histori</Text>
          </View>
        ) : (
          historyWO.map((wo: any) => (
            <View key={wo.wo_id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.woBadge}>
                  <Text style={styles.woBadgeText}>{wo.nomor_wo}</Text>
                </View>
                <View style={[styles.statusBadge, wo.status === 'selesai' || wo.status === 'lunas' ? styles.statusSuccess : styles.statusPending]}>
                  <Ionicons 
                    name={wo.status === 'selesai' || wo.status === 'lunas' ? "checkmark-circle-outline" : "time-outline"} 
                    size={14} 
                    color={wo.status === 'selesai' || wo.status === 'lunas' ? "#16A34A" : "#EA580C"} 
                  />
                  <Text style={[styles.statusText, wo.status === 'selesai' || wo.status === 'lunas' ? styles.statusTextSuccess : styles.statusTextPending]}>
                    {wo.status === 'selesai' || wo.status === 'lunas' ? 'Selesai' : 'Diproses'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.historyTitle} numberOfLines={1}>
                {wo.keluhan || `${wo.kendaraan?.merek} ${wo.kendaraan?.model}`}
              </Text>
              
              <View style={styles.historyFooter}>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={14} color="#999" />
                  <Text style={styles.dateText}>{formatDate(wo.created_at)}</Text>
                </View>
                {/* PERUBAHAN NOMINAL HARGA ADA DI BARIS BAWAH INI */}
                <Text style={styles.priceText}>{formatRupiah(wo.estimasi_biaya || wo.biaya_jasa)}</Text>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  detailHeaderArea: { backgroundColor: '#1a73e8', paddingTop: 20, paddingBottom: 25, paddingHorizontal: 20, position: 'relative', overflow: 'hidden' },
  bgCircleLarge: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255, 255, 255, 0.08)', top: -50, right: -80 },
  bgCircleSmall: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255, 255, 255, 0.06)', top: 130, right: -30 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginLeft: -5, zIndex: 1 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 4 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, zIndex: 1 },
  detailAvatar: { width: 65, height: 65, borderRadius: 20, backgroundColor: '#5294e2', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', marginRight: 15 },
  detailAvatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  detailName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', zIndex: 1 },
  detailHeaderBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
  detailBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  detailScrollView: { flex: 1, padding: 16, marginTop: -15, backgroundColor: '#f5f7fa', borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  infoContactCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  infoContactTitle: { fontSize: 12, fontWeight: 'bold', color: '#1a73e8', letterSpacing: 0.5, marginBottom: 5 },
  contactItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f2f5' },
  contactIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e8f0fe', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  contactItemText: { fontSize: 14, color: '#444' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 15 },
  sectionTitleGroup: { flexDirection: 'row', alignItems: 'center' },
  blueBarIndicator: { width: 4, height: 18, backgroundColor: '#1a73e8', borderRadius: 2, marginRight: 8 },
  greenBarIndicator: { width: 4, height: 18, backgroundColor: '#1ea446', borderRadius: 2, marginRight: 8 },
  sectionHeadingTitle: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  seeAllText: { color: '#1a73e8', fontSize: 13, fontWeight: '600' },
  
  /* Vehicle Styles */
  vehicleCardItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0' },
  vehicleIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#e8f0fe', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  vehicleNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicleModelName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  yearBadge: { backgroundColor: '#e8f0fe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  yearBadgeText: { color: '#1a73e8', fontSize: 11, fontWeight: 'bold' },
  vehicleMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  plateNumberBadge: { backgroundColor: '#222', color: '#fff', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8, letterSpacing: 0.5 },
  colorText: { fontSize: 12, color: '#888' },

  /* History Styles */
  historyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1ea446' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  woBadge: { backgroundColor: '#e8f0fe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  woBadgeText: { color: '#1a73e8', fontSize: 12, fontWeight: 'bold' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusSuccess: { backgroundColor: '#dcfce7' },
  statusPending: { backgroundColor: '#ffedd5' },
  statusText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  statusTextSuccess: { color: '#16A34A' },
  statusTextPending: { color: '#EA580C' },
  historyTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  historyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { color: '#888', fontSize: 13, marginLeft: 6 },
  priceText: { color: '#1a73e8', fontSize: 16, fontWeight: 'bold' },

  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 12, alignItems: 'center' },
  emptyText: { color: '#bbb', fontSize: 14, marginTop: 8 },
});