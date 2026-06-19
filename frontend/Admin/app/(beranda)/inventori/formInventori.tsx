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
  if (!visible) return null;
  return (
    <View style={styles.modalOverlay} onRequestClose={onClose}>
      {/* <View > */}
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
      {/* </View> */}
    </View>
  );
};