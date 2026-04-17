import { decode as atob, encode as btoa } from 'base-64';

export const encryptIt = (value: string): string => {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const decryptIt = (encryptedValue: string): string => {
  const base64 = encryptedValue.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64);
};

export const formatRupiah = (number: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

// Fungsi getTwoInitials, formatDate, dll tinggal copy & beri tipe string