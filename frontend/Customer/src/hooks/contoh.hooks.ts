/**
 * TEMPLATE HOOKS - React Native
 *
 * Cara pakai:
 * 1. Duplikat file ini, ganti nama sesuai domain (misal: division.hooks.ts)
 * 2. Ganti semua kata "Test/test/tests" dengan nama entity kamu
 * 3. Sesuaikan endpoint URL-nya
 * 4. Hapus komentar yang tidak diperlukan
 *
 * Dependensi:
 * - @tanstack/react-query  →  npm install @tanstack/react-query
 */

 import { baseFetch } from "@/utils/baseFetch";
 import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
 import { useMemo } from "react";
 
 // ============================================================
 // TIPE DATA — sesuaikan dengan response API kamu
 // ============================================================
 
 interface Test {
   id: string;
   name: string;
   // ... field lainnya
 }
 
 interface ApiResponse<T> {
   statusCode: number;
   message: string;
   data: T;
 }
 
 // ============================================================
 // GET ALL — mengambil list data berdasarkan ID relasi
 // ============================================================
 
 export function useGetAllTestByOtherId(otherId: string | undefined) {
   const { data, isLoading, isPending, refetch } = useQuery<ApiResponse<Test[]>>({
     // Hanya fetch kalau otherId tersedia
     enabled: !!otherId,
 
     // Key unik untuk cache — tambahkan semua variabel yang mempengaruhi hasil
     queryKey: ["getTestsByOtherId", otherId],
 
     queryFn: () =>
       baseFetch<ApiResponse<Test[]>>({
         method: "GET",
         url: `/tests`,
         params: { otherId }, // kirim sebagai query param, sesuaikan kalau pakai path param
         options: {
           showError: false, // false = kita handle error sendiri, tidak pakai Alert otomatis
         },
       }),
 
     retry: false,
     staleTime: 5 * 60 * 1000, // Data dianggap fresh selama 5 menit
     refetchOnMount: false,     // Tidak refetch saat komponen re-mount
     refetchOnWindowFocus: false, // Tidak refetch saat app kembali ke foreground
   });
 
   // Ambil array data hanya kalau response sukses, default ke []
   const tests = useMemo(() => {
     return data?.statusCode === 200 ? data.data : [];
   }, [data]);
 
   return {
     tests,
     isLoading,
     isPending,
     refetch,
   };
 }
 
 // ============================================================
 // GET DETAIL — mengambil satu data berdasarkan ID
 // ============================================================
 
 export function useGetTestById(testId: string | undefined) {
   const { data, isLoading, refetch } = useQuery<ApiResponse<Test>>({
     enabled: !!testId,
     queryKey: ["getTestById", testId],
 
     queryFn: () =>
       baseFetch<ApiResponse<Test>>({
         method: "GET",
         url: `/test/${testId}`,
         options: { showError: false },
       }),
 
     retry: false,
     staleTime: 5 * 60 * 1000,
     refetchOnMount: false,
     refetchOnWindowFocus: false,
   });
 
   const test = useMemo(() => {
     return data?.statusCode === 200 ? data.data : null;
   }, [data]);
 
   return { test, isLoading, refetch };
 }
 
 // ============================================================
 // ADD / CREATE — menambah data baru
 // ============================================================
 
 interface AddTestPayload {
   name: string;
   // ... field lainnya sesuai API
 }
 
 interface UseAddTestMutationProps {
   successAction: () => void;
 }
 
 export function useAddTestMutation({ successAction }: UseAddTestMutationProps) {
   const queryClient = useQueryClient();
 
   const addTestMutation = useMutation({
     mutationFn: (payload: AddTestPayload) =>
       baseFetch<ApiResponse<Test>>({
         method: "POST",
         url: `/test`,
         payload,
         options: { showError: false }, // false = kita tangani error sendiri di onError
       }),
 
     onSuccess: (data) => {
       if (data?.statusCode === 200 || data?.statusCode === 201) {
         // Invalidate cache supaya list otomatis refresh
         queryClient.invalidateQueries({ queryKey: ["getTestsByOtherId"] });
         successAction();
         // Alert.alert("Berhasil", "Test berhasil ditambahkan!"); // ← aktifkan kalau perlu
       }
       // Kalau statusCode bukan 200/201, API kita anggap gagal meski tidak throw
     },
 
     onError: (_error) => {
       // baseFetch sudah handle Alert.alert kalau showError: true
       // Kalau showError: false, handle di sini
       // Alert.alert("Gagal", "Test gagal ditambahkan");
     },
   });
 
   return { addTestMutation };
 }
 
 // ============================================================
 // EDIT / UPDATE — memperbarui data yang sudah ada
 // ============================================================
 
 interface EditTestPayload {
   testId: string;
   payload: Partial<AddTestPayload>;
 }
 
 interface UseEditTestMutationProps {
   successAction: () => void;
 }
 
 export function useEditTestMutation({ successAction }: UseEditTestMutationProps) {
   const queryClient = useQueryClient();
 
   const editTestMutation = useMutation({
     mutationFn: ({ testId, payload }: EditTestPayload) =>
       baseFetch<ApiResponse<Test>>({
         method: "PUT",
         url: `/test/${testId}`,
         payload,
         options: { showError: false },
       }),
 
     onSuccess: (data) => {
       if (data?.statusCode === 200 || data?.statusCode === 201) {
         // Invalidate semua query yang relevan
         queryClient.invalidateQueries({ queryKey: ["getTestsByOtherId"] });
         queryClient.invalidateQueries({ queryKey: ["getTestById"] });
         successAction();
         // Alert.alert("Berhasil", "Test berhasil diperbarui!");
       }
     },
 
     onError: (_error) => {
       // Alert.alert("Gagal", "Test gagal diperbarui");
     },
   });
 
   return { editTestMutation };
 }
 
 // ============================================================
 // DELETE — menghapus data
 // ============================================================
 
 interface DeleteTestPayload {
   testId: string;
 }
 
 interface UseDeleteTestMutationProps {
   successAction: () => void;
 }
 
 export function useDeleteTestMutation({ successAction }: UseDeleteTestMutationProps) {
   const queryClient = useQueryClient();
 
   const deleteTestMutation = useMutation({
     mutationFn: ({ testId }: DeleteTestPayload) =>
       baseFetch<ApiResponse<null>>({
         method: "DELETE",
         url: `/test/${testId}`,
         options: { showError: false },
       }),
 
     onSuccess: (data) => {
       if (data?.statusCode === 200) {
         queryClient.invalidateQueries({ queryKey: ["getTestsByOtherId"] });
         successAction();
         // Alert.alert("Berhasil", "Test berhasil dihapus!");
       }
     },
 
     onError: (_error) => {
       // Alert.alert("Gagal", "Test gagal dihapus");
     },
   });
 
   return { deleteTestMutation };
 }
 
 // ============================================================
 // CONTOH PEMAKAIAN DI KOMPONEN
 // ============================================================
 //
 // import { useGetAllTestByOtherId, useAddTestMutation } from "@/hooks/example.hooks";
 //
 // export default function TestScreen() {
 //   const { tests, isLoading } = useGetAllTestByOtherId("abc123");
 //
 //   const { addTestMutation } = useAddTestMutation({
 //     successAction: () => console.log("Berhasil tambah!"),
 //   });
 //
 //   const handleAdd = () => {
 //     addTestMutation.mutate({ name: "Test Baru" });
 //   };
 //
 //   if (isLoading) return <ActivityIndicator />;
 //
 //   return (
 //     <FlatList
 //       data={tests}
 //       keyExtractor={(item) => item.id}
 //       renderItem={({ item }) => <Text>{item.name}</Text>}
 //     />
 //   );
 // }