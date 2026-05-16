/**
 * app/(beranda)/kendaraan/index.tsx
 *
 * Screen list semua kendaraan milik user.
 * Tipis — hanya rakit komponen + hubungkan hooks.
 */
import RequireAuth from '../../../src/components/requireAuth';
//  import RequireAuth from '../../../src/components/RequireAuth'
 import React, { useCallback } from "react";
 import {
   ActivityIndicator,
   Alert,
   FlatList,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
 } from "react-native";
 import { router } from "expo-router";
 import { useGetAllKendaraan, useDeleteKendaraanMutation } from "../../../src/hooks/kendaraan.hooks";
 import { KendaraanCard } from "../../../src/components/kendaraan/kendaraanCard";
 import { Kendaraan } from "../../../src/@types/kendaraan.types";
 
 export default function KendaraanScreen() {
   // ── Data ──────────────────────────────────────────────────
   const { kendaraanList, isLoading, refetch } = useGetAllKendaraan();
 
   // ── Mutation ──────────────────────────────────────────────
   const { deleteKendaraanMutation } = useDeleteKendaraanMutation({
     successAction: () => refetch(),
     onError: (message) => Alert.alert("Gagal", message),
   });
 
   // ── Handlers ──────────────────────────────────────────────
   const handlePressDetail = useCallback((id: string) => {
     router.push(`/(beranda)/kendaraan/${id}`);
   }, []);
 
   const handlePressEdit = useCallback((id: string) => {
     router.push(`/(beranda)/kendaraan/${id}/edit`);
   }, []);
 
   const handlePressDelete = useCallback(
     (id: string) => {
       Alert.alert(
         "Hapus Kendaraan",
         "Kendaraan yang memiliki servis aktif tidak dapat dihapus. Yakin ingin menghapus?",
         [
           { text: "Batal", style: "cancel" },
           {
             text: "Hapus",
             style: "destructive",
             onPress: () => deleteKendaraanMutation.mutate(id),
           },
         ]
       );
     },
     [deleteKendaraanMutation]
   );
 
   const handlePressAdd = useCallback(() => {
     router.push("/(beranda)/kendaraan/create");
   }, []);
 
   const renderItem = useCallback(
     ({ item }: { item: Kendaraan }) => (
       <KendaraanCard
         kendaraan={item}
         onPressDetail={handlePressDetail}
         onPressEdit={handlePressEdit}
         onPressDelete={handlePressDelete}
       />
     ),
     [handlePressDetail, handlePressEdit, handlePressDelete]
   );
 
   // ── Loading ───────────────────────────────────────────────
   if (isLoading) {
     return (
       <View style={styles.center}>
         <ActivityIndicator size="large" color="#3B7BF6" />
       </View>
     );
   }
 
   // ── Empty state ───────────────────────────────────────────
   if (kendaraanList.length === 0) {
     return (
       <View style={styles.center}>
         <Text style={styles.emptyText}>Belum ada kendaraan terdaftar</Text>
         <TouchableOpacity style={styles.btnAdd} onPress={handlePressAdd}>
           <Text style={styles.btnAddText}>+ Tambah Kendaraan</Text>
         </TouchableOpacity>
       </View>
     );
   }
 
   // ── Main ──────────────────────────────────────────────────
   return (
     <View style={styles.container}>
       <FlatList
         data={kendaraanList}
         keyExtractor={(item) => item.kendaraan_id}
         renderItem={renderItem}
         contentContainerStyle={styles.list}
         showsVerticalScrollIndicator={false}
       />
       <TouchableOpacity style={styles.fab} onPress={handlePressAdd}>
         <Text style={styles.fabText}>+ Tambah</Text>
       </TouchableOpacity>
       </View>
   );
 }
 
 const styles = StyleSheet.create({
   container: { flex: 1, backgroundColor: "#F9FAFB" },
   center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" },
   list: { padding: 16, paddingBottom: 100 },
   emptyText: { fontSize: 16, color: "#6B7280", marginBottom: 16 },
   btnAdd: {
     backgroundColor: "#3B7BF6",
     paddingHorizontal: 24,
     paddingVertical: 12,
     borderRadius: 8,
   },
   btnAddText: { color: "#fff", fontWeight: "600", fontSize: 15 },
   fab: {
     position: "absolute",
     bottom: 24,
     right: 24,
     backgroundColor: "#3B7BF6",
     paddingHorizontal: 20,
     paddingVertical: 14,
     borderRadius: 30,
     elevation: 6,
   },
   fabText: { color: "#fff", fontWeight: "700", fontSize: 15 },
 });