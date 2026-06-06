import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerDetail({ customer, onBack }: any) {
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
            <Text style={styles.detailSubtitle}>Customer sejak Jan 2024</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeRow}>
          <View style={styles.detailHeaderBadge}>
            <Ionicons name="car-outline" size={14} color="#fff" />
            <Text style={styles.detailBadgeText}>{customer.vehicles} Kendaraan</Text>
          </View>
          <View style={styles.detailHeaderBadge}>
            <Text style={styles.detailBadgeText}># {customer.wo} Riwayat WO</Text>
          </View>
          <View style={styles.detailHeaderBadge}>
            <Text style={styles.detailBadgeText}>Rp 2110rb spent</Text>
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

          <View style={styles.contactItemRow}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail-outline" size={18} color="#1a73e8" />
            </View>
            <Text style={styles.contactItemText}>{customer.name.toLowerCase().replace(' ', '.')}@email.com</Text>
          </View>

          <View style={styles.contactItemRow}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="location-outline" size={18} color="#1a73e8" />
            </View>
            <Text style={styles.contactItemText}>Jl. Merdeka No. 12, Bandung</Text>
          </View>

          <View style={[styles.contactItemRow, { borderBottomWidth: 0 }]}>
            <View style={styles.contactIconContainer}>
              <Ionicons name="calendar-outline" size={18} color="#1a73e8" />
            </View>
            <Text style={styles.contactItemText}>Bergabung Jan 2024</Text>
          </View>
        </View>

        {/* Section KENDARAAN */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <View style={styles.blueBarIndicator} />
            <Text style={styles.sectionHeadingTitle}>Kendaraan</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.blueActionLink}>+ Tambah</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.vehicleCardItem}>
          <View style={styles.vehicleIconBox}>
            <Ionicons name="car-outline" size={24} color="#1a73e8" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.vehicleNameRow}>
              <Text style={styles.vehicleModelName}>{customer.car1}</Text>
              <View style={styles.yearBadge}><Text style={styles.yearBadgeText}>2019</Text></View>
            </View>
            <View style={styles.vehicleMetaRow}>
              <Text style={styles.plateNumberBadge}>{customer.plate1}</Text>
              <Text style={styles.colorText}>Putih</Text>
            </View>
          </View>
        </View>

        {customer.car2 && (
          <View style={styles.vehicleCardItem}>
            <View style={styles.vehicleIconBox}>
              <Ionicons name="car-outline" size={24} color="#1a73e8" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.vehicleNameRow}>
                <Text style={styles.vehicleModelName}>{customer.car2}</Text>
                <View style={styles.yearBadge}><Text style={styles.yearBadgeText}>2021</Text></View>
              </View>
              <View style={styles.vehicleMetaRow}>
                <Text style={styles.plateNumberBadge}>{customer.plate2}</Text>
                <Text style={styles.colorText}>Merah</Text>
              </View>
            </View>
          </View>
        )}

        {/* Section HISTORI SERVIS */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <View style={styles.greenBarIndicator} />
            <Text style={styles.sectionHeadingTitle}>Histori Servis</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.blueActionLink}>Semua  <Ionicons name="chevron-forward" size={14} /></Text>
          </TouchableOpacity>
        </View>

        <View style={styles.woHistoryCard}>
          <View style={styles.woCardHeader}>
            <View style={styles.woIdTag}><Text style={styles.woIdTagText}>#WO-0006</Text></View>
            <View style={styles.woStatusSuccess}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#1ea446" />
              <Text style={styles.woStatusSuccessText}>Selesai</Text>
            </View>
          </View>
          <Text style={styles.woServiceTitle}>Ganti Kampas Rem + Minyak Rem</Text>
          <View style={styles.woCardFooter}>
            <View style={styles.woDateGroup}>
              <Ionicons name="calendar-outline" size={14} color="#888" />
              <Text style={styles.woDateText}>29 Mei 2026</Text>
            </View>
            <Text style={styles.woPriceText}>Rp 310.000</Text>
          </View>
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
  detailSubtitle: { color: '#b3d4ff', fontSize: 13, marginTop: 2 },
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
  blueActionLink: { color: '#1a73e8', fontSize: 14, fontWeight: '600' },
  vehicleCardItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, alignItems: 'center' },
  vehicleIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#e8f0fe', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  vehicleNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicleModelName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  yearBadge: { backgroundColor: '#e8f0fe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  yearBadgeText: { color: '#1a73e8', fontSize: 11, fontWeight: 'bold' },
  vehicleMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  plateNumberBadge: { backgroundColor: '#222', color: '#fff', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8, letterSpacing: 0.5 },
  colorText: { color: '#888', fontSize: 12 },
  woHistoryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 12 },
  woCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  woIdTag: { backgroundColor: '#f0f4f8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  woIdTagText: { color: '#1a73e8', fontSize: 11, fontWeight: 'bold' },
  woStatusSuccess: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f6ec', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  woStatusSuccessText: { color: '#1ea446', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  woServiceTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 12 },
  woCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f3f5', paddingTop: 10 },
  woDateGroup: { flexDirection: 'row', alignItems: 'center' },
  woDateText: { fontSize: 12, color: '#666', marginLeft: 5 },
  woPriceText: { fontSize: 15, fontWeight: 'bold', color: '#1a73e8' }
});