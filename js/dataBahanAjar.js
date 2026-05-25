// ──────────────────────────────────────────────────────────────
// js/dataBahanAjar.js
// Dummy data bersama untuk stok-app.js dan tracking-app.js
// Diekspos sebagai variabel global agar bisa diakses kedua file.
// ──────────────────────────────────────────────────────────────

var upbjjList = ['Jakarta', 'Surabaya', 'Makassar', 'Padang', 'Denpasar'];

var kategoriList = ['MK Wajib', 'MK Pilihan', 'Praktikum', 'Problem-Based'];

var pengirimanList = [
  { kode: 'REG', nama: 'JNE Regular (3-5 hari)' },
  { kode: 'EXP', nama: 'JNE Express (1-2 hari)' }
];

var paket = [
  {
    kode: 'PAKET-UT-001',
    nama: 'PAKET IPS Dasar',
    isi: ['EKMA4116 – Pengantar Manajemen', 'EKMA4115 – Pengantar Akuntansi'],
    harga: 120000
  },
  {
    kode: 'PAKET-UT-002',
    nama: 'PAKET IPA Dasar',
    isi: ['BIOL4201 – Biologi Umum (Praktikum)', 'FISIP4001 – Dasar-Dasar Sosiologi'],
    harga: 140000
  },
  {
    kode: 'PAKET-UT-003',
    nama: 'PAKET Hukum & Sosial',
    isi: ['HKUM4201 – Hukum Tata Negara', 'FISIP4001 – Dasar-Dasar Sosiologi'],
    harga: 95000
  }
];

var stokData = [
  {
    kode: 'EKMA4116', judul: 'Pengantar Manajemen',
    kategori: 'MK Wajib', upbjj: 'Jakarta', lokasiRak: 'R1-A3',
    harga: 65000, qty: 28, safety: 20,
    catatanHTML: '<em>Edisi 2024, cetak ulang</em>'
  },
  {
    kode: 'EKMA4115', judul: 'Pengantar Akuntansi',
    kategori: 'MK Wajib', upbjj: 'Jakarta', lokasiRak: 'R1-A4',
    harga: 60000, qty: 7, safety: 15,
    catatanHTML: '<strong>Cover baru</strong>'
  },
  {
    kode: 'BIOL4201', judul: 'Biologi Umum (Praktikum)',
    kategori: 'Praktikum', upbjj: 'Surabaya', lokasiRak: 'R3-B2',
    harga: 80000, qty: 12, safety: 10,
    catatanHTML: 'Butuh <u>pendingin</u> untuk kit basah'
  },
  {
    kode: 'FISIP4001', judul: 'Dasar-Dasar Sosiologi',
    kategori: 'MK Pilihan', upbjj: 'Makassar', lokasiRak: 'R2-C1',
    harga: 55000, qty: 2, safety: 8,
    catatanHTML: 'Stok <i>menipis</i>, prioritaskan reorder'
  },
  {
    kode: 'HKUM4201', judul: 'Hukum Tata Negara',
    kategori: 'MK Pilihan', upbjj: 'Padang', lokasiRak: 'R4-D1',
    harga: 70000, qty: 0, safety: 5,
    catatanHTML: '<b>REORDER SEGERA</b>'
  },
  {
    kode: 'PBIS4101', judul: 'Writing for General Communication',
    kategori: 'Problem-Based', upbjj: 'Denpasar', lokasiRak: 'R5-E3',
    harga: 75000, qty: 35, safety: 20,
    catatanHTML: 'Edisi revisi 2023'
  },
  {
    kode: 'ADPU4330', judul: 'Perkembangan Administrasi Negara',
    kategori: 'MK Wajib', upbjj: 'Surabaya', lokasiRak: 'R3-B5',
    harga: 58000, qty: 4, safety: 12,
    catatanHTML: 'Verifikasi <em>supplier</em> pending'
  }
];

var trackingData = {
  'DO2025-001': {
    nim: '123456789',
    nama: 'Rina Wulandari',
    ekspedisi: 'JNE Regular (3-5 hari)',
    tanggalKirim: '2025-08-25',
    paketKode: 'PAKET-UT-001',
    namaPaket: 'PAKET IPS Dasar',
    totalHarga: 120000,
    status: 'Dalam Perjalanan',
    perjalanan: [
      { waktu: '2025-08-25 10:12', keterangan: 'Penerimaan di Loket: TANGSEL' },
      { waktu: '2025-08-25 14:07', keterangan: 'Tiba di Hub: JAKSEL' },
      { waktu: '2025-08-26 08:44', keterangan: 'Diteruskan ke Kantor Tujuan' }
    ]
  }
};
