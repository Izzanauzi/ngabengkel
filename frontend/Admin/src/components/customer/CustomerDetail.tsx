import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAllKendaraan } from '../../hooks/work_order.hooks';

export default function CustomerDetail({ customer, onBack }: any) {
  const { kendaraanList, isLoading: loadingKendaraan } = useGetAllKendaraan(customer.user_id);

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
              {loadingKendaraan ? '...' : kendaraanList.length} Kendaraan
            </Text>
          </View>
          <View style={styles.detailHeaderBadge}>
            <Text style={styles.detailBadgeText}># {customer.wo} Riwayat WO</Text>
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
        </View>

        {loadingKendaraan ? (
          <ActivityIndicator size="small" color="#1a73e8" style={{ marginBottom: 16 }} />
        ) : kendaraanList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="car-outline" size={32} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada kendaraan</Text>
          </View>
        ) : (
          kendaraanList.map((k) => (
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
        </View>

        <View style={styles.emptyCard}>
          <Ionicons name="receipt-outline" size={32} color="#ccc" />
          <Text style={styles.emptyText}>Belum ada histori</Text>
        </View>

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
  vehicleCardItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, alignItems: 'center' },
  vehicleIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#e8f0fe', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  vehicleNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicleModelName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  yearBadge: { backgroundColor: '#e8f0fe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  yearBadgeText: { color: '#1a73e8', fontSize: 11, fontWeight: 'bold' },
  vehicleMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  plateNumberBadge: { backgroundColor: '#222', color: '#fff', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8, letterSpacing: 0.5 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 12, alignItems: 'center' },
  emptyText: { color: '#bbb', fontSize: 14, marginTop: 8 },
});
