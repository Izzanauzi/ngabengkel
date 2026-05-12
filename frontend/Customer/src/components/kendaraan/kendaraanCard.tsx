/**
 * components/kendaraan/KendaraanCard.tsx
 *
 * Menampilkan satu item kendaraan dalam list.
 * Tidak ada API call di sini — data diterima lewat props.
 */

 import React from "react";
 import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
 import { Kendaraan } from "../../@types/kendaraan.types";
 
 interface KendaraanCardProps {
   kendaraan: Kendaraan;
   onPressDetail: (kendaraanId: string) => void;
   onPressEdit: (kendaraanId: string) => void;
   onPressDelete: (kendaraanId: string) => void;
 }
 
 export function KendaraanCard({
   kendaraan,
   onPressDetail,
   onPressEdit,
   onPressDelete,
 }: KendaraanCardProps) {
   return (
     <TouchableOpacity
       style={styles.card}
       onPress={() => onPressDetail(kendaraan.kendaraan_id)}
       activeOpacity={0.8}
     >
       {/* Header */}
       <View style={styles.header}>
         <Text style={styles.namaKendaraan}>
           {kendaraan.merek} {kendaraan.model}
         </Text>
         <Text style={styles.tahun}>{kendaraan.tahun}</Text>
       </View>
 
       {/* Nomor polisi */}
       <View style={styles.platContainer}>
         <Text style={styles.platText}>{kendaraan.nomor_polisi}</Text>
       </View>
 
       {/* Info tambahan */}
       {kendaraan.warna && (
         <Text style={styles.infoText}>Warna: {kendaraan.warna}</Text>
       )}
       {kendaraan.nomor_rangka && (
         <Text style={styles.infoText}>No. Rangka: {kendaraan.nomor_rangka}</Text>
       )}
 
       {/* Action buttons */}
       <View style={styles.actions}>
         <TouchableOpacity
           style={[styles.btn, styles.btnEdit]}
           onPress={() => onPressEdit(kendaraan.kendaraan_id)}
         >
           <Text style={styles.btnEditText}>Edit</Text>
         </TouchableOpacity>
 
         <TouchableOpacity
           style={[styles.btn, styles.btnDelete]}
           onPress={() => onPressDelete(kendaraan.kendaraan_id)}
         >
           <Text style={styles.btnDeleteText}>Hapus</Text>
         </TouchableOpacity>
       </View>
     </TouchableOpacity>
   );
 }
 
 const styles = StyleSheet.create({
   card: {
     backgroundColor: "#FFFFFF",
     borderRadius: 12,
     padding: 16,
     marginBottom: 12,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.06,
     shadowRadius: 8,
     elevation: 2,
   },
   header: {
     flexDirection: "row",
     justifyContent: "space-between",
     alignItems: "center",
     marginBottom: 10,
   },
   namaKendaraan: {
     fontSize: 16,
     fontWeight: "700",
     color: "#1a1a2e",
   },
   tahun: {
     fontSize: 14,
     color: "#6B7280",
   },
   platContainer: {
     alignSelf: "flex-start",
     backgroundColor: "#1a1a2e",
     borderRadius: 6,
     paddingHorizontal: 12,
     paddingVertical: 4,
     marginBottom: 10,
   },
   platText: {
     color: "#FFFFFF",
     fontWeight: "700",
     fontSize: 14,
     letterSpacing: 1,
   },
   infoText: {
     fontSize: 13,
     color: "#6B7280",
     marginBottom: 4,
   },
   actions: {
     flexDirection: "row",
     gap: 8,
     marginTop: 12,
   },
   btn: {
     flex: 1,
     paddingVertical: 8,
     borderRadius: 8,
     alignItems: "center",
   },
   btnEdit: {
     borderWidth: 1,
     borderColor: "#3B7BF6",
   },
   btnEditText: {
     color: "#3B7BF6",
     fontWeight: "600",
     fontSize: 14,
   },
   btnDelete: {
     borderWidth: 1,
     borderColor: "#EF4444",
   },
   btnDeleteText: {
     color: "#EF4444",
     fontWeight: "600",
     fontSize: 14,
   },
 });