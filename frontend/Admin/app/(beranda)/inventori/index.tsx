import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import {
  InventoryItem,
  InventoryRequest,
  InventoryFilterTab,
  InventoryTipe,
  InventorySatuan,
  STOK_MENIPIS_THRESHOLD,
} from '../../../src/@types/inventori.types';
import {
  useInventory,
  useAddInventory,
  useUpdateInventory,
  useDeleteInventory,
} from '../../../src/hooks/inventori.hooks';

// ─── Constants ────────────────────────────────────────────────────────────────

const SATUAN_OPTIONS: InventorySatuan[] = [
  'pcs', 'liter', 'botol', 'pasang', 'set', 'roll', 'kg', 'gram', 'meter',
];

const EMPTY_FORM: InventoryRequest = {
  tipe: 'sparepart',
  nama: '',
  kode_part: '',
  merek: '',
  kompatibilitas: '',
  satuan: 'pcs',
  stok: 0,
  harga_satuan: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRupiah = (value: number) =>
  `Rp ${value.toLocaleString('id-ID')}`;

const isStokMenipis = (item: InventoryItem) =>
  item.stok <= STOK_MENIPIS_THRESHOLD;

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  value,
  label,
  active,
}: {
  value: number;
  label: string;
  active?: boolean;
}) => (
  <View style={[styles.statCard, active && styles.statCardActive]}>
    <Text style={[styles.statValue, active && styles.statValueActive]}>{value}</Text>
    <Text style={[styles.statLabel, active && styles.statLabelActive]}>{label}</Text>
  </View>
);

const TipeBadge = ({ tipe }: { tipe: InventoryTipe }) => (
  <View style={[styles.badge, tipe === 'sparepart' ? styles.badgeSparepart : styles.badgeMaterial]}>
    <Text style={[styles.badgeText, tipe === 'sparepart' ? styles.badgeTextSparepart : styles.badgeTextMaterial]}>
      {tipe === 'sparepart' ? 'Sparepart' : 'Material'}
    </Text>
  </View>
);

const InventoryCard = ({
  item,
  onEdit,
  onDelete,
}: {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}) => {
  const menipis = isStokMenipis(item);

  return (
    <View style={[styles.card, menipis && styles.cardMenipis]}>
      {menipis && <View style={styles.cardMenipisIndicator} />}
      <View style={styles.cardLeft}>
        <View style={[styles.cardIcon, menipis ? styles.cardIconMenipis : item.tipe === 'sparepart' ? styles.cardIconSparepart : styles.cardIconMaterial]}>
          <MaterialCommunityIcons
            name={item.tipe === 'sparepart' ? 'car-cog' : 'oil'}
            size={20}
            color={menipis ? '#EF4444' : item.tipe === 'sparepart' ? '#F97316' : '#3B82F6'}
          />
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardNama} numberOfLines={2}>{item.nama}</Text>
          <TipeBadge tipe={item.tipe} />
        </View>
        <View style={styles.cardStokRow}>
          {menipis && (
            <Ionicons name="warning" size={14} color="#EF4444" style={{ marginRight: 4 }} />
          )}
          <Text style={[styles.cardStok, menipis ? styles.cardStokMenipis : styles.cardStokOke]}>
            Stok: {item.stok} {item.satuan}
          </Text>
          {menipis && <Text style={styles.menipisLabel}>Hampir Habis</Text>}
        </View>
        <Text style={styles.cardHarga}>{formatRupiah(item.harga_satuan)} / {item.satuan}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
          <Ionicons name="pencil" size={18} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)} style={styles.actionBtn}>
          <Ionicons name="trash" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Form Modal ───────────────────────────────────────────────────────────────

const InventoryFormModal = ({
  visible,
  onClose,
  onSubmit,
  editItem,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryRequest) => void;
  editItem?: InventoryItem | null;
  loading: boolean;
}) => {
  const [form, setForm] = useState<InventoryRequest>(EMPTY_FORM);
  const [showTipe, setShowTipe] = useState(false);
  const [showSatuan, setShowSatuan] = useState(false);

  React.useEffect(() => {
    if (editItem) {
      setForm({
        tipe: editItem.tipe,
        nama: editItem.nama,
        kode_part: editItem.kode_part ?? '',
        merek: editItem.merek ?? '',
        kompatibilitas: editItem.kompatibilitas ?? '',
        satuan: editItem.satuan,
        stok: editItem.stok,
        harga_satuan: editItem.harga_satuan,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setShowTipe(false);
    setShowSatuan(false);
  }, [editItem, visible]);

  const isValid = form.nama.trim() !== '' && form.harga_satuan > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {editItem ? 'Edit Item' : 'Tambah Item Baru'}
              </Text>
              <Text style={styles.modalSubtitle}>Isi detail item inventori</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Nama Item */}
            <Text style={styles.fieldLabel}>Nama Item <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="cube-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contoh: Oli Mesin Shell Helix"
                placeholderTextColor="#9CA3AF"
                value={form.nama}
                onChangeText={(v) => setForm({ ...form, nama: v })}
              />
            </View>

            {/* Kategori / Tipe */}
            <Text style={styles.fieldLabel}>Kategori <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.selectWrap}
              onPress={() => { setShowTipe(!showTipe); setShowSatuan(false); }}
            >
              <MaterialCommunityIcons name="layers-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <Text style={form.tipe ? styles.selectValue : styles.selectPlaceholder}>
                {form.tipe ? (form.tipe === 'sparepart' ? 'Sparepart' : 'Material') : 'Pilih kategori'}
              </Text>
              <Ionicons name={showTipe ? 'chevron-up' : 'chevron-down'} size={18} color="#9CA3AF" />
            </TouchableOpacity>
            {showTipe && (
              <View style={styles.dropdownBox}>
                {(['sparepart', 'material'] as InventoryTipe[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={styles.dropdownItem}
                    onPress={() => { setForm({ ...form, tipe: t }); setShowTipe(false); }}
                  >
                    <TipeBadge tipe={t} />
                    <Text style={styles.dropdownItemText}>
                      {t === 'sparepart' ? 'Onderdil kendaraan' : 'Bahan habis pakai'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Satuan */}
            <Text style={styles.fieldLabel}>Satuan <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.selectWrap}
              onPress={() => { setShowSatuan(!showSatuan); setShowTipe(false); }}
            >
              <MaterialCommunityIcons name="pound" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <Text style={form.satuan ? styles.selectValue : styles.selectPlaceholder}>
                {form.satuan || 'Pilih satuan'}
              </Text>
              <Ionicons name={showSatuan ? 'chevron-up' : 'chevron-down'} size={18} color="#9CA3AF" />
            </TouchableOpacity>
            {showSatuan && (
              <View style={styles.dropdownBox}>
                <View style={styles.satuanGrid}>
                  {SATUAN_OPTIONS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.satuanChip, form.satuan === s && styles.satuanChipActive]}
                      onPress={() => { setForm({ ...form, satuan: s }); setShowSatuan(false); }}
                    >
                      <Text style={[styles.satuanChipText, form.satuan === s && styles.satuanChipTextActive]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Stok & Harga */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>Stok <Text style={styles.required}>*</Text></Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="layers-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={form.stok.toString()}
                    onChangeText={(v) => setForm({ ...form, stok: parseInt(v) || 0 })}
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Harga Satuan <Text style={styles.required}>*</Text></Text>
                <View style={styles.inputWrap}>
                  <Text style={[styles.inputIcon, { color: '#9CA3AF', fontSize: 13 }]}>Rp</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={form.harga_satuan.toString()}
                    onChangeText={(v) => setForm({ ...form, harga_satuan: parseInt(v) || 0 })}
                  />
                </View>
              </View>
            </View>

            {/* Kode Part — hanya untuk sparepart */}
            {form.tipe === 'sparepart' && (
              <>
                <Text style={styles.fieldLabel}>Kode Part</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="barcode" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: KR-HON-001"
                    placeholderTextColor="#9CA3AF"
                    value={form.kode_part ?? ''}
                    onChangeText={(v) => setForm({ ...form, kode_part: v })}
                  />
                </View>

                <Text style={styles.fieldLabel}>Merek</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="tag-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: FDR, NGK, AHM"
                    placeholderTextColor="#9CA3AF"
                    value={form.merek ?? ''}
                    onChangeText={(v) => setForm({ ...form, merek: v })}
                  />
                </View>

                <Text style={styles.fieldLabel}>Kompatibilitas</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="motorbike" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Honda Vario 125/150"
                    placeholderTextColor="#9CA3AF"
                    value={form.kompatibilitas ?? ''}
                    onChangeText={(v) => setForm({ ...form, kompatibilitas: v })}
                  />
                </View>
              </>
            )}

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.btnBatal} onPress={onClose}>
              <Text style={styles.btnBatalText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSimpan, !isValid && styles.btnSimpanDisabled]}
              onPress={() => isValid && onSubmit(form)}
              disabled={!isValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnSimpanText}>Simpan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InventoriScreen() {
  const { data: items, loading, refetch } = useInventory();
  const { addItem, loading: addLoading } = useAddInventory();
  const { updateItem, loading: updateLoading } = useUpdateInventory();
  const { deleteItem } = useDeleteInventory();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<InventoryFilterTab>('semua');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ visible: boolean; item: InventoryItem | null }>({ visible: false, item: null });

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: items.length,
    menipis: items.filter(isStokMenipis).length,
    sparepart: items.filter((i) => i.tipe === 'sparepart').length,
    material: items.filter((i) => i.tipe === 'material').length,
  }), [items]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = items;
    if (activeTab === 'sparepart') list = list.filter((i) => i.tipe === 'sparepart');
    else if (activeTab === 'material') list = list.filter((i) => i.tipe === 'material');
    else if (activeTab === 'menipis') list = list.filter(isStokMenipis);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.nama.toLowerCase().includes(q) ||
          i.merek?.toLowerCase().includes(q) ||
          i.kode_part?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, activeTab, search]);

  const menipisItems = useMemo(() => items.filter(isStokMenipis), [items]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleOpenAdd = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditTarget(item);
    setShowModal(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setDeleteConfirm({ visible: true, item });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.item) return;
    const ok = await deleteItem(deleteConfirm.item.inventory_id);
    setDeleteConfirm({ visible: false, item: null });
    if (ok) refetch();
  };

  const handleSubmit = async (data: InventoryRequest) => {
    if (editTarget) {
      const result = await updateItem(editTarget.inventory_id, data);
      if (result) { setShowModal(false); refetch(); }
    } else {
      const result = await addItem(data);
      if (result) { setShowModal(false); refetch(); }
    }
  };

  // ── Tab config ─────────────────────────────────────────────────────────────
  const tabs: { key: InventoryFilterTab; label: string; count: number; warn?: boolean }[] = [
    { key: 'semua', label: 'Semua', count: stats.total },
    { key: 'sparepart', label: 'Sparepart', count: stats.sparepart },
    { key: 'material', label: 'Material', count: stats.material },
    { key: 'menipis', label: 'Menipis', count: stats.menipis, warn: true },
  ];

  return (
    <View style={styles.container}>
      {/* Header stats */}
      <View style={styles.header}>
        <StatCard value={stats.total} label="Total Item" />
        <StatCard value={stats.menipis} label="Stok Menipis" active />
        <StatCard value={stats.sparepart} label="Sparepart" />
      </View>

      {/* Search + Tambah */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari sparepart atau material..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            {tab.warn && activeTab !== tab.key && (
              <Ionicons name="warning" size={13} color="#EF4444" style={{ marginRight: 3 }} />
            )}
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
            <Text style={[styles.tabCount, activeTab === tab.key && styles.tabCountActive]}>
              {' '}{tab.count}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Warning banner */}
      {menipisItems.length > 0 && activeTab !== 'menipis' && (
        <TouchableOpacity
          style={styles.warningBanner}
          onPress={() => setActiveTab('menipis')}
        >
          <Ionicons name="warning" size={16} color="#EF4444" />
          <Text style={styles.warningText}>
            <Text style={{ fontWeight: '700' }}>{menipisItems.length} item</Text> stok hampir habis — segera restok
          </Text>
          <Text style={styles.warningLihat}>Lihat {'>'}</Text>
        </TouchableOpacity>
      )}

      {/* List */}
      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#3B82F6" size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.inventory_id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="package-variant-closed" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Tidak ada item ditemukan</Text>
            </View>
          }
          renderItem={({ item }) => (
            <InventoryCard
              item={item}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}
        />
      )}

      {/* Form Modal */}
      <InventoryFormModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        editItem={editTarget}
        loading={addLoading || updateLoading}
      />

      {/* Delete Confirm Modal */}
      <Modal visible={deleteConfirm.visible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', marginBottom: 8, color: '#111827' }}>
              Hapus Item
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
              Yakin ingin menghapus "{deleteConfirm.item?.nama}"?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' }}
                onPress={() => setDeleteConfirm({ visible: false, item: null })}
              >
                <Text style={{ color: '#6B7280', fontWeight: '600' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#DC2626', alignItems: 'center' }}
                onPress={handleDeleteConfirm}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  // Header stats
  header: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statCardActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  statValueActive: {
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    textAlign: 'center',
  },
  statLabelActive: {
    color: '#fff',
  },

  // Search row
  searchRow: {
  flexDirection: 'row',
  paddingHorizontal: 16,
  paddingTop: 12,
  paddingBottom: 8,   // ← sudah oke
  gap: 10,
  backgroundColor: '#fff',
},
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Tabs
  tabsContainer: {
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#F3F4F6',
  maxHeight: 52,        // ← tambahkan ini untuk batasi tinggi
},
  tabsContent: {
  paddingHorizontal: 16,
  paddingTop: 10,       // ← tambahkan paddingTop
  paddingBottom: 10,    // ← ganti dari 12
  gap: 8,
  flexDirection: 'row',
  alignItems: 'center',
},
  tab: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 14,
  paddingVertical: 7,       // ← kurangi dari nilai yang lebih besar
  borderRadius: 20,
  backgroundColor: '#F3F4F6',
},
tabActive: {
  backgroundColor: '#2563EB',
},
tabText: {
  fontSize: 13,
  color: '#6B7280',
  fontWeight: '500',
},
tabTextActive: {
  color: '#fff',
  fontWeight: '600',
},
tabCount: {
  fontSize: 13,
  color: '#9CA3AF',
},
tabCountActive: {
  color: 'rgba(255,255,255,0.8)',
},

  // Warning banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  warningLihat: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },

  // List
  listContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 32,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  cardMenipis: {
    borderColor: '#FECACA',
    borderLeftWidth: 0,
  },
  cardMenipisIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  cardLeft: {
    marginLeft: 4,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconSparepart: {
    backgroundColor: '#FFF7ED',
  },
  cardIconMaterial: {
    backgroundColor: '#EFF6FF',
  },
  cardIconMenipis: {
    backgroundColor: '#FEF2F2',
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardNama: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  cardStokRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStok: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardStokOke: {
    color: '#10B981',
  },
  cardStokMenipis: {
    color: '#EF4444',
  },
  menipisLabel: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  cardHarga: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardActions: {
    gap: 4,
  },
  actionBtn: {
    padding: 6,
  },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeSparepart: {
    backgroundColor: '#FFF7ED',
  },
  badgeMaterial: {
    backgroundColor: '#EFF6FF',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextSparepart: {
    color: '#F97316',
  },
  badgeTextMaterial: {
    color: '#3B82F6',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '92%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 14,
  },
  required: {
    color: '#EF4444',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 12,
  },
  selectWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  selectPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
  },
  dropdownBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 12,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#374151',
  },
  satuanGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 4,
  },
  satuanChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  satuanChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  satuanChipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  satuanChipTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    marginTop: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  btnBatal: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  btnBatalText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  btnSimpan: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  btnSimpanDisabled: {
    backgroundColor: '#93C5FD',
  },
  btnSimpanText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
});