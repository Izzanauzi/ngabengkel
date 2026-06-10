/**
 * app/(beranda)/work_order/work_order_detail.tsx
 */
 import React, { useState } from "react";
 import {
   View, Text, StyleSheet, ScrollView, TouchableOpacity,
   ActivityIndicator, Modal, TextInput,
   KeyboardAvoidingView, Platform, Alert,
 } from "react-native";
 import { router, useLocalSearchParams } from "expo-router";
 import { Ionicons } from "@expo/vector-icons";
 import {
   useGetWorkOrderById,
   useStartWorkOrderMutation,
   useFinishWorkOrderMutation,
   useUploadProgressMutation,
   useSuspendWorkOrderMutation,
 } from "../../../src/hooks/work_order.hooks";
 import { ProgressItem } from "../../../src/components/work_order/progressItem";
 import { NotaTagihanModal } from "../../../src/components/work_order/notaTagihanModal";
 import type { WorkOrderStatus, WOItem } from "../../../src/@types/work_order.types";
 
 const formatRupiah = (v: number | null | undefined) => {
   if (!v) return "Rp 0";
   return "Rp " + v.toLocaleString("id-ID");
 };
 const formatDate = (s: string) => {
   try {
     return new Date(s).toLocaleDateString("id-ID", {
       day: "numeric", month: "short", year: "numeric",
       hour: "2-digit", minute: "2-digit",
     });
   } catch { return s; }
 };
 
 const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
   dibuat:               { label: "Dibuat",               color: "#2563EB", bg: "#EFF6FF" },
   sedang_dikerjakan:    { label: "Sedang Dikerjakan",    color: "#EA580C", bg: "#FFF7ED" },
   suspend:              { label: "Suspend",               color: "#CA8A04", bg: "#FEFCE8" },
   menunggu_persetujuan: { label: "Menunggu Persetujuan", color: "#7C3AED", bg: "#F5F3FF" },
   tindakan_ditolak:     { label: "Tindakan Ditolak",     color: "#DC2626", bg: "#FEF2F2" },
   selesai:              { label: "Selesai",               color: "#16A34A", bg: "#F0FDF4" },
   lunas:                { label: "Lunas",                 color: "#15803D", bg: "#ECFDF5" },
 };
 
 // ── Add Progress Modal ────────────────────────────────────────────────────────
 function AddProgressModal({
   visible, woId, onClose,
 }: { visible: boolean; woId: string; onClose: () => void }) {
   const [deskripsi, setDeskripsi] = useState("");
   const [tipe, setTipe] = useState("catatan");
   const [fotoUrl, setFotoUrl] = useState("");
 
   // FIX: hooks ini butuh successAction
   const { uploadProgressMutation } = useUploadProgressMutation({
     successAction: () => {
       setDeskripsi(""); setFotoUrl(""); onClose();
     },
   });
 
   const handleSubmit = () => {
     if (!deskripsi.trim()) { Alert.alert("Validasi", "Deskripsi wajib diisi."); return; }
     uploadProgressMutation.mutate(
       { woId, payload: { deskripsi: deskripsi.trim(), tipe, foto_url: fotoUrl.trim() || undefined } },
       { onError: () => Alert.alert("Gagal", "Gagal menambahkan progress.") }
     );
   };
 
   return (
     <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
         <View style={mStyles.overlay}>
           <View style={mStyles.sheet}>
             <View style={mStyles.handle} />
             <Text style={mStyles.title}>Upload Progres</Text>
             <Text style={mStyles.label}>Tipe</Text>
             <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
               {["catatan", "foto", "material"].map((t) => (
                 <TouchableOpacity key={t}
                   style={[mStyles.tipeBtn, tipe === t && mStyles.tipeBtnActive]}
                   onPress={() => setTipe(t)}>
                   <Text style={[mStyles.tipeBtnText, tipe === t && mStyles.tipeBtnTextActive]}>
                     {t.charAt(0).toUpperCase() + t.slice(1)}
                   </Text>
                 </TouchableOpacity>
               ))}
             </View>
             <Text style={mStyles.label}>Deskripsi <Text style={{ color: "#EF4444" }}>*</Text></Text>
             <TextInput style={[mStyles.input, { minHeight: 80 }]} value={deskripsi}
               onChangeText={setDeskripsi} placeholder="Tulis catatan progress..."
               placeholderTextColor="#9CA3AF" multiline textAlignVertical="top" />
             <Text style={mStyles.label}>URL Foto (opsional)</Text>
             <TextInput style={mStyles.input} value={fotoUrl} onChangeText={setFotoUrl}
               placeholder="https://..." placeholderTextColor="#9CA3AF" />
             <View style={mStyles.btnRow}>
               <TouchableOpacity style={mStyles.cancelBtn} onPress={onClose}>
                 <Text style={mStyles.cancelText}>Batal</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={[mStyles.submitBtn, uploadProgressMutation.isPending && { opacity: 0.6 }]}
                 onPress={handleSubmit} disabled={uploadProgressMutation.isPending}>
                 {uploadProgressMutation.isPending
                   ? <ActivityIndicator color="#FFF" size="small" />
                   : <Text style={mStyles.submitText}>Kirim</Text>}
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </KeyboardAvoidingView>
     </Modal>
   );
 }
 
 // ── Suspend Modal ─────────────────────────────────────────────────────────────
 function SuspendModal({
   visible, woId, onClose,
 }: { visible: boolean; woId: string; onClose: () => void }) {
   const [deskripsi, setDeskripsi] = useState("");
   const [biaya, setBiaya] = useState("");
 
   // FIX: hooks ini butuh successAction
   const { suspendWorkOrderMutation } = useSuspendWorkOrderMutation({
     successAction: () => { setDeskripsi(""); setBiaya(""); onClose(); },
   });
 
   const handleSubmit = () => {
     if (!deskripsi.trim()) { Alert.alert("Validasi", "Keterangan wajib diisi."); return; }
     suspendWorkOrderMutation.mutate(
       { woId, payload: { deskripsi: deskripsi.trim(), est_biaya_tambahan: biaya ? parseFloat(biaya) : 0 } },
       { onError: () => Alert.alert("Gagal", "Gagal suspend WO.") }
     );
   };
 
   return (
     <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
         <View style={mStyles.overlay}>
           <View style={mStyles.sheet}>
             <View style={mStyles.handle} />
             <Text style={mStyles.title}>Suspend Work Order</Text>
             <View style={{ flexDirection: "row", gap: 8, backgroundColor: "#FFFBEB", borderRadius: 10, padding: 12, marginBottom: 12 }}>
               <Ionicons name="information-circle-outline" size={15} color="#D97706" />
               <Text style={{ flex: 1, fontSize: 12, color: "#D97706", lineHeight: 18 }}>
                 WO akan berstatus menunggu persetujuan customer.
               </Text>
             </View>
             <Text style={mStyles.label}>Keterangan <Text style={{ color: "#EF4444" }}>*</Text></Text>
             <TextInput style={[mStyles.input, { minHeight: 80 }]} value={deskripsi}
               onChangeText={setDeskripsi} placeholder="Jelaskan alasan suspend..."
               placeholderTextColor="#9CA3AF" multiline textAlignVertical="top" />
             <Text style={mStyles.label}>Est. Biaya Tambahan (opsional)</Text>
             <TextInput style={mStyles.input} value={biaya}
               onChangeText={(v) => setBiaya(v.replace(/\D/g, ""))}
               placeholder="0" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
             <View style={mStyles.btnRow}>
               <TouchableOpacity style={mStyles.cancelBtn} onPress={onClose}>
                 <Text style={mStyles.cancelText}>Batal</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={[mStyles.submitBtn, { backgroundColor: "#D97706" }, suspendWorkOrderMutation.isPending && { opacity: 0.6 }]}
                 onPress={handleSubmit} disabled={suspendWorkOrderMutation.isPending}>
                 {suspendWorkOrderMutation.isPending
                   ? <ActivityIndicator color="#FFF" size="small" />
                   : <Text style={mStyles.submitText}>Suspend</Text>}
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </KeyboardAvoidingView>
     </Modal>
   );
 }
 
 const mStyles = StyleSheet.create({
   overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
   sheet: { backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: Platform.OS === "ios" ? 36 : 24 },
   handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
   title: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 16 },
   label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 4 },
   input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827", marginBottom: 8 },
   tipeBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
   tipeBtnActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
   tipeBtnText: { fontSize: 13, color: "#6B7280" },
   tipeBtnTextActive: { color: "#FFF", fontWeight: "600" },
   btnRow: { flexDirection: "row", gap: 12, marginTop: 16 },
   cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: "#E5E7EB", alignItems: "center" },
   cancelText: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
   submitBtn: { flex: 2, paddingVertical: 13, borderRadius: 12, backgroundColor: "#2563EB", alignItems: "center" },
   submitText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
 });
 
 // ── Main Detail Screen ────────────────────────────────────────────────────────
 export default function WorkOrderDetailScreen() {
   const { id } = useLocalSearchParams<{ id: string }>();
   const { workOrder, isLoading, refetch } = useGetWorkOrderById(id ?? "");
 
   const [showProgress, setShowProgress] = useState(false);
   const [showSuspend, setShowSuspend] = useState(false);
   const [showNota, setShowNota] = useState(false);
 
   // FIX: semua hooks butuh successAction
   const { startWorkOrderMutation } = useStartWorkOrderMutation({
     successAction: () => refetch(),
   });
   const { finishWorkOrderMutation } = useFinishWorkOrderMutation({
     successAction: () => refetch(),
   });
 
   if (isLoading) {
     return <View style={s.center}><ActivityIndicator size="large" color="#2563EB" /></View>;
   }
   if (!workOrder) {
     return (
       <View style={s.center}>
         <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
         <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 8 }}>Work order tidak ditemukan</Text>
         <TouchableOpacity onPress={() => router.back()}>
           <Text style={{ color: "#2563EB", marginTop: 8 }}>Kembali</Text>
         </TouchableOpacity>
       </View>
     );
   }
 
   const status = workOrder.status as WorkOrderStatus;
   const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#6B7280", bg: "#F3F4F6" };
   const isDibuat = status === "dibuat";
   const isSedang = status === "sedang_dikerjakan";
   const isSelesai = status === "selesai" || status === "lunas";
 
   const items: WOItem[] = (workOrder as any).items ?? [];
   const totalMaterial = items.reduce((sum, i) => sum + i.subtotal, 0);
   const totalEstimasi = totalMaterial + (workOrder.biaya_jasa ?? 0);
 
   return (
     <View style={s.root}>
       {/* Header */}
       <View style={s.header}>
         <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
           <Ionicons name="chevron-back" size={22} color="#FFF" />
         </TouchableOpacity>
         <Text style={s.headerTitle}>Work Order</Text>
         <View style={{ width: 36 }} />
       </View>
 
       {/* Hero Card */}
       <View style={s.heroCard}>
         <View style={s.heroTop}>
           <TouchableOpacity style={s.backLink} onPress={() => router.back()}>
             <Ionicons name="chevron-back" size={14} color="rgba(255,255,255,0.8)" />
             <Text style={s.backLinkText}>Work Order</Text>
           </TouchableOpacity>
           <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
             <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: cfg.color }} />
             <Text style={[s.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
           </View>
         </View>
 
         <View style={s.woNumberBadge}>
           <Text style={s.woNumberText}>{workOrder.nomor_wo}</Text>
         </View>
         <Text style={s.customerName}>{workOrder.user?.nama ?? "Walk-in"}</Text>
         <Text style={s.tanggal}>{formatDate(workOrder.created_at)}</Text>
 
         {workOrder.kendaraan && (
           <View style={s.kendaraanRow}>
             <View style={s.kendaraanInfo}>
               <Ionicons name="car-outline" size={13} color="rgba(255,255,255,0.8)" />
               <Text style={s.kendaraanText}>
                 {workOrder.kendaraan.merek} {workOrder.kendaraan.model}
                 {(workOrder.kendaraan as any).tahun ? ` ${(workOrder.kendaraan as any).tahun}` : ""}
               </Text>
             </View>
             <View style={s.platBadge}>
               <Text style={s.platText}>{workOrder.kendaraan.nomor_polisi}</Text>
             </View>
           </View>
         )}
 
         {workOrder.mekanik?.nama && (
           <View style={[s.kendaraanInfo, { marginTop: 8 }]}>
             <Ionicons name="build-outline" size={13} color="rgba(255,255,255,0.7)" />
             <Text style={[s.kendaraanText, { color: "rgba(255,255,255,0.8)" }]}>{workOrder.mekanik.nama}</Text>
           </View>
         )}
         {workOrder.user?.telepon && (
           <View style={[s.kendaraanInfo, { marginTop: 6 }]}>
             <Ionicons name="call-outline" size={13} color="rgba(255,255,255,0.7)" />
             <Text style={[s.kendaraanText, { color: "rgba(255,255,255,0.8)" }]}>{workOrder.user.telepon}</Text>
           </View>
         )}
       </View>
 
       {/* Scrollable Content */}
       <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
 
         {workOrder.deskripsi_kerusakan && (
           <View style={s.section}>
             <Text style={s.sectionLabel}>KELUHAN CUSTOMER</Text>
             <Text style={s.deskripsiText}>{workOrder.deskripsi_kerusakan}</Text>
           </View>
         )}
 
         {/* Action Buttons 2x2 */}
         {isSedang && (
           <View style={s.actionGrid}>
             <TouchableOpacity style={[s.actionBtn, { backgroundColor: "#EFF6FF" }]} onPress={() => setShowProgress(true)} activeOpacity={0.8}>
               <Ionicons name="camera-outline" size={18} color="#2563EB" />
               <Text style={[s.actionBtnText, { color: "#2563EB" }]}>Upload Progres</Text>
             </TouchableOpacity>
             <TouchableOpacity style={[s.actionBtn, { backgroundColor: "#F5F3FF" }]} activeOpacity={0.8}>
               <Ionicons name="cube-outline" size={18} color="#7C3AED" />
               <Text style={[s.actionBtnText, { color: "#7C3AED" }]}>Tambah Material</Text>
             </TouchableOpacity>
             <TouchableOpacity style={[s.actionBtn, { backgroundColor: "#FFFBEB" }]} onPress={() => setShowSuspend(true)} activeOpacity={0.8}>
               <Ionicons name="pause-circle-outline" size={18} color="#D97706" />
               <Text style={[s.actionBtnText, { color: "#D97706" }]}>Suspend WO</Text>
             </TouchableOpacity>
             <TouchableOpacity
               style={[s.actionBtn, { backgroundColor: "#F0FDF4" }, finishWorkOrderMutation.isPending && { opacity: 0.6 }]}
               onPress={() => Alert.alert("Selesaikan WO", "Tandai work order ini sebagai selesai?", [
                 { text: "Batal", style: "cancel" },
                 { text: "Selesai", onPress: () => finishWorkOrderMutation.mutate(workOrder.wo_id) },
               ])}
               disabled={finishWorkOrderMutation.isPending}
               activeOpacity={0.8}
             >
               {finishWorkOrderMutation.isPending
                 ? <ActivityIndicator size="small" color="#16A34A" />
                 : <>
                     <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
                     <Text style={[s.actionBtnText, { color: "#16A34A" }]}>Tandai Selesai</Text>
                   </>}
             </TouchableOpacity>
           </View>
         )}
 
         {isDibuat && (
           <TouchableOpacity
             style={[s.fullBtn, { backgroundColor: "#2563EB" }, startWorkOrderMutation.isPending && { opacity: 0.6 }]}
             onPress={() => Alert.alert("Mulai WO", "Yakin ingin memulai work order ini?", [
               { text: "Batal", style: "cancel" },
               { text: "Mulai", onPress: () => startWorkOrderMutation.mutate(workOrder.wo_id) },
             ])}
             disabled={startWorkOrderMutation.isPending}
           >
             {startWorkOrderMutation.isPending
               ? <ActivityIndicator color="#FFF" />
               : <><Ionicons name="play-circle-outline" size={18} color="#FFF" /><Text style={s.fullBtnText}>Mulai Pengerjaan</Text></>}
           </TouchableOpacity>
         )}
 
         {isSelesai && (
           <TouchableOpacity style={[s.fullBtn, { backgroundColor: "#2563EB" }]} onPress={() => setShowNota(true)}>
             <Ionicons name="document-text-outline" size={18} color="#FFF" />
             <Text style={s.fullBtnText}>Buat Nota Tagihan</Text>
           </TouchableOpacity>
         )}
 
         {/* Progress Timeline */}
         <View style={s.section}>
           <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
             <Text style={s.sectionLabel}>PROGRES PENGERJAAN</Text>
             <Text style={{ fontSize: 12, color: "#6B7280" }}>{(workOrder as any).progress?.length ?? 0} catatan</Text>
           </View>
           {((workOrder as any).progress ?? []).length > 0
             ? (workOrder as any).progress.map((p: any) => <ProgressItem key={p.progress_id} item={p} />)
             : <Text style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingVertical: 16 }}>Belum ada catatan progress</Text>}
         </View>
 
         {/* Material Digunakan */}
         {items.length > 0 && (
           <View style={s.section}>
             <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
               <Text style={s.sectionLabel}>MATERIAL DIGUNAKAN</Text>
               {isSedang && (
                 <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                   <Ionicons name="add" size={14} color="#2563EB" />
                   <Text style={{ fontSize: 12, color: "#2563EB", fontWeight: "600" }}>Tambah</Text>
                 </TouchableOpacity>
               )}
             </View>
             {items.map((item) => (
               <View key={item.wo_item_id} style={s.materialRow}>
                 <View style={s.materialIcon}>
                   <Ionicons name="cube-outline" size={14} color="#7C3AED" />
                 </View>
                 <View style={{ flex: 1 }}>
                   <Text style={s.materialName}>{item.nama_item}</Text>
                   <Text style={s.materialSubtitle}>{item.jumlah} pcs × {formatRupiah(item.harga_satuan)}</Text>
                 </View>
                 <Text style={s.materialHarga}>{formatRupiah(item.subtotal)}</Text>
                 {isSedang && (
                   <TouchableOpacity style={{ padding: 4, marginLeft: 4 }}>
                     <Ionicons name="trash-outline" size={16} color="#EF4444" />
                   </TouchableOpacity>
                 )}
               </View>
             ))}
             <View style={s.divider} />
             <View style={s.summaryRow}><Text style={s.summaryLabel}>Material</Text><Text style={s.summaryValue}>{formatRupiah(totalMaterial)}</Text></View>
             {workOrder.biaya_jasa ? (
               <View style={s.summaryRow}><Text style={s.summaryLabel}>Biaya Jasa</Text><Text style={s.summaryValue}>{formatRupiah(workOrder.biaya_jasa)}</Text></View>
             ) : null}
             <View style={[s.summaryRow, s.totalRow]}>
               <Text style={s.totalLabel}>Total Estimasi</Text>
               <Text style={s.totalValue}>{formatRupiah(totalEstimasi)}</Text>
             </View>
           </View>
         )}
 
         <View style={{ height: 100 }} />
       </ScrollView>
 
       {/* FAB */}
       <TouchableOpacity style={s.fab} onPress={() => router.push("/(beranda)/work_order/create_work_order" as any)} activeOpacity={0.85}>
         <Ionicons name="add" size={18} color="#FFF" />
         <Text style={s.fabText}>Buat WO Baru</Text>
       </TouchableOpacity>
 
       {/* Modals */}
       <AddProgressModal visible={showProgress} woId={workOrder.wo_id} onClose={() => { setShowProgress(false); refetch(); }} />
       <SuspendModal visible={showSuspend} woId={workOrder.wo_id} onClose={() => { setShowSuspend(false); refetch(); }} />
       <NotaTagihanModal visible={showNota} onClose={() => setShowNota(false)} workOrder={workOrder} totalMaterial={totalMaterial} />
     </View>
   );
 }
 
 const HEADER_COLOR = "#1E3A5F";
 
 const s = StyleSheet.create({
   root: { flex: 1, backgroundColor: HEADER_COLOR },
   center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 0 : 8 },
   backBtn: { width: 36, height: 36, justifyContent: "center" },
   headerTitle: { fontSize: 16, fontWeight: "700", color: "#FFF" },
   heroCard: { marginHorizontal: 16, marginBottom: 0, padding: 16 },
   heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
   backLink: { flexDirection: "row", alignItems: "center", gap: 2 },
   backLinkText: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "500" },
   statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
   statusBadgeText: { fontSize: 12, fontWeight: "600" },
   woNumberBadge: { backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
   woNumberText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
   customerName: { color: "#FFF", fontSize: 22, fontWeight: "800", marginBottom: 2 },
   tanggal: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 12 },
   kendaraanRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 10, marginBottom: 4 },
   kendaraanInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
   kendaraanText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
   platBadge: { backgroundColor: "#FFF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
   platText: { color: HEADER_COLOR, fontSize: 11, fontWeight: "700" },
   scroll: { flex: 1, backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
   scrollContent: { padding: 20 },
   section: { marginBottom: 24 },
   sectionLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", letterSpacing: 1, marginBottom: 8 },
   deskripsiText: { fontSize: 14, color: "#374151", lineHeight: 20 },
   actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
   actionBtn: { width: "47.5%", flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 12 },
   actionBtnText: { fontSize: 13, fontWeight: "600" },
   fullBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 14, marginBottom: 20 },
   fullBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
   materialRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
   materialIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#F3E8FF", justifyContent: "center", alignItems: "center" },
   materialName: { fontSize: 13, fontWeight: "600", color: "#111827" },
   materialSubtitle: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
   materialHarga: { fontSize: 13, fontWeight: "600", color: "#111827" },
   divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 10 },
   summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
   summaryLabel: { fontSize: 13, color: "#6B7280" },
   summaryValue: { fontSize: 13, fontWeight: "600", color: "#111827" },
   totalRow: { marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
   totalLabel: { fontSize: 14, fontWeight: "700", color: "#111827" },
   totalValue: { fontSize: 16, fontWeight: "800", color: "#2563EB" },
   fab: { position: "absolute", bottom: 24, right: 16, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#2563EB", borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, shadowColor: "#2563EB", shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
   fabText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
 });