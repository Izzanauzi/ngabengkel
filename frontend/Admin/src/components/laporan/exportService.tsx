import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

export const handleExportTransaksi = (dataTransaksi) => {
  try {
    // Validasi jika data kosong
    if (!dataTransaksi || dataTransaksi.length === 0) {
      alert("Tidak ada data untuk diexport!");
      return;
    }

    // Format kolom Excel agar rapi sesuai kebutuhan tabel kamu
    const dataUntukExcel = dataTransaksi.map((item) => ({
      "NO. WO": item.no_wo || '-',      // Sesuaikan key property-nya dengan data aslimu
      "CUSTOMER": item.customer || '-',
      "TANGGAL": item.tanggal || '-',
      "TOTAL (Rp)": item.total || 0,
      "STATUS": item.status || '-',
    }));

    // Proses membuat file Excel
    const worksheet = XLSX.utils.json_to_sheet(dataUntukExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Transaksi");

    // Download otomatis khusus di Web browser
    if (Platform.OS === 'web') {
      XLSX.writeFile(workbook, "Daftar_Transaksi.xlsx");
    } else {
      alert("Fitur export saat ini baru didukung di versi Web.");
    }
  } catch (error) {
    console.error("Gagal export:", error);
    alert("Terjadi kesalahan saat mengunduh data.");
  }
};