import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDashboard, useAssignSlot } from '../../../src/hooks/dashboard.hooks';

// ─── Warna & Konstanta ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#1A73E8',
  primaryLight: '#E8F0FE',
  primaryDark: '#1557B0',
  white: '#FFFFFF',
  background: '#F4F6FA',
  card: '#FFFFFF',
  text: '#1C2B4A',
  textSecondary: '#6B7A99',
  border: '#E3E8F0',

  // Status slot
  tersedia: '#34A853',
  tersediaLight: '#E6F4EA',
  terisi: '#EA4335',
  terisiLight: '#FCE8E6',
  naLight: '#F1F3F4',
  naText: '#9AA0A6',

  // Statistik cards
  stat1: '#E8F0FE', // WO Aktif - biru muda
  stat2: '#FEF3E2', // Menunggu - oranye muda
  stat3: '#E6F4EA', // Booking - hijau muda
  stat4: '#F3E8FD', // Slot - ungu muda

  orange: '#F9AB00',
  green: '#34A853',
  purple: '#8430CE',
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

const formatDate = () => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
};

// ─── Komponen: Stat Card ──────────────────────────────────────────────────────
interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  bgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, bgColor, iconColor }) => (
  <View style={[styles.statCard, { backgroundColor: bgColor }]}>
    <Text style={[styles.statIcon, { color: iconColor }]}>{icon}</Text>
    <Text style={[styles.statValue, { color: iconColor }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Komponen: Slot Badge ─────────────────────────────────────────────────────
interface SlotBadgeProps {
  nomor_slot: string;
  status: 'tersedia' | 'terisi' | 'tidak_tersedia';
  woNomor?: string;
  nomorPolisi?: string;
}

const SlotBadge: React.FC<SlotBadgeProps> = ({ nomor_slot, status, woNomor, nomorPolisi }) => {
  const isTersedia = status === 'tersedia';
  const isTidakTersedia = status === 'tidak_tersedia';

  const bg = isTersedia ? COLORS.tersedia : isTidakTersedia ? '#9AA0A6' : COLORS.terisi;

  return (
    <View style={[styles.slotBadge, { backgroundColor: bg }]}>
      <Text style={styles.slotNomor}>{nomor_slot}</Text>
      {nomorPolisi ? (
        <Text style={styles.slotPolisi} numberOfLines={1}>{nomorPolisi}</Text>
      ) : null}
    </View>
  );
};

// ─── Komponen: Antrian Item ───────────────────────────────────────────────────
interface AntrianItemProps {
  wo: any;
  slots: any[];
  onAssign: (wo_id: string, slot_id: string) => void;
  assigning: boolean;
}

const AntrianItem: React.FC<AntrianItemProps> = ({ wo, slots, onAssign, assigning }) => {
  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const availableSlots = slots.filter((s) => s.status === 'tersedia');

  const handleAssign = (slot_id: string) => {
    setShowSlotPicker(false);
    onAssign(wo.wo_id, slot_id);
  };

  return (
    <>
      <View style={styles.antrianItem}>
        <View style={styles.antrianLeft}>
          <Text style={styles.antrianWoId}>{wo.nomor_wo}</Text>
          <Text style={styles.antrianKendaraan}>
            {wo.kendaraan?.merek} {wo.kendaraan?.model}
          </Text>
          <Text style={styles.antrianPolisi}>{wo.kendaraan?.nomor_polisi}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.assignBtn,
            availableSlots.length === 0 && styles.assignBtnDisabled,
          ]}
          onPress={() => setShowSlotPicker(true)}
          disabled={assigning || availableSlots.length === 0}
        >
          {assigning ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={[
              styles.assignBtnText,
              availableSlots.length === 0 && styles.assignBtnTextDisabled,
            ]}>
              Assign Slot
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal pilih slot */}
      <Modal visible={showSlotPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSlotPicker(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pilih Slot</Text>
            <Text style={styles.modalSubtitle}>
              {wo.nomor_wo} — {wo.kendaraan?.nomor_polisi}
            </Text>
            {availableSlots.map((slot) => (
              <TouchableOpacity
                key={slot.slot_id}
                style={styles.slotOption}
                onPress={() => handleAssign(slot.slot_id)}
              >
                <View style={[styles.slotOptionBadge, { backgroundColor: COLORS.tersedia }]}>
                  <Text style={styles.slotOptionNomor}>{slot.nomor_slot}</Text>
                </View>
                <Text style={styles.slotOptionLabel}>Slot {slot.nomor_slot} — Tersedia</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowSlotPicker(false)}
            >
              <Text style={styles.modalCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// ─── Screen Utama ─────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { data, loading, error, refetch } = useDashboard();
  const { assignSlot, loading: assigning } = useAssignSlot();
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const handleAssign = async (wo_id: string, slot_id: string) => {
    setAssigningId(wo_id);
    const ok = await assignSlot(wo_id, slot_id);
    setAssigningId(null);
    if (ok) {
      Alert.alert('Berhasil', 'WO berhasil di-assign ke slot.');
      refetch();
    }
  };

  // ── Loading ──
  if (loading && !data) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat dashboard...</Text>
      </SafeAreaView>
    );
  }

  // ── Error ──
  if (error && !data) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const slots = data?.slots ?? [];
  const antrian = data?.antrian ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, Admin 👋
            </Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>

        {/* ── Stat Cards ── */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="🔧"
            value={data?.woAktif ?? 0}
            label="WO Aktif"
            bgColor={COLORS.stat1}
            iconColor={COLORS.primary}
          />
          <StatCard
            icon="⏳"
            value={data?.menungguPersetujuan ?? 0}
            label="Menunggu Persetujuan"
            bgColor={COLORS.stat2}
            iconColor={COLORS.orange}
          />
          <StatCard
            icon="📋"
            value={data?.bookingMasuk ?? 0}
            label="Booking Masuk"
            bgColor={COLORS.stat3}
            iconColor={COLORS.green}
          />
          <StatCard
            icon="🅿️"
            value={data?.slotTersedia ?? 0}
            label="Slot Tersedia"
            bgColor={COLORS.stat4}
            iconColor={COLORS.purple}
          />
        </View>

        {/* ── Status Slot ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Slot</Text>
          <View style={styles.slotsRow}>
            {slots.map((slot) => (
              <SlotBadge
                key={slot.slot_id}
                nomor_slot={slot.nomor_slot}
                status={slot.status}
                nomorPolisi={
                  antrian.find((wo: any) => wo.slot_id === slot.slot_id)
                    ?.kendaraan?.nomor_polisi
                }
              />
            ))}
          </View>
          {/* Legenda */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.tersedia }]} />
              <Text style={styles.legendLabel}>Tersedia</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.terisi }]} />
              <Text style={styles.legendLabel}>Terisi</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#9AA0A6' }]} />
              <Text style={styles.legendLabel}>N/A</Text>
            </View>
          </View>
        </View>

        {/* ── Antrian Menunggu Slot ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Antrian Menunggu Slot</Text>
          {antrian.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>Tidak ada antrian saat ini</Text>
            </View>
          ) : (
            antrian.map((wo: any) => (
              <AntrianItem
                key={wo.wo_id}
                wo={wo}
                slots={slots}
                onAssign={handleAssign}
                assigning={assigningId === wo.wo_id}
              />
            ))
          )}
        </View>

        {/* Spacer buat FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── FAB: Buat WO ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(beranda)/booking')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>＋</Text>
        <Text style={styles.fabText}>Buat WO</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: 12,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  dateText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Stat Cards
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },

  // Section
  section: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },

  // Slot badges
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotBadge: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 56,
    alignItems: 'center',
  },
  slotNomor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  slotPolisi: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    maxWidth: 72,
    textAlign: 'center',
  },

  // Legenda
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Antrian
  antrianItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  antrianLeft: {
    flex: 1,
    gap: 2,
  },
  antrianWoId: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  antrianKendaraan: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  antrianPolisi: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  assignBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minWidth: 100,
    alignItems: 'center',
  },
  assignBtnDisabled: {
    borderColor: COLORS.border,
  },
  assignBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  assignBtnTextDisabled: {
    color: COLORS.textSecondary,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '300',
    lineHeight: 20,
  },
  fabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  slotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  slotOptionBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  slotOptionNomor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  slotOptionLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  modalCancel: {
    marginTop: 4,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCancelText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Loading & Error
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  errorIcon: {
    fontSize: 36,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});