// ──────────────────────────────────────────────
// stok-app.js  — Vue 2 logic untuk stok.html
// Bergantung pada: js/dataBahanAjar.js (dimuat lebih dulu di HTML)
// ──────────────────────────────────────────────

var stokApp = new Vue({
  el: '#app',

  data: {
    // ── Master Data — diambil dari js/dataBahanAjar.js ──
    upbjjList: upbjjList,
    kategoriList: kategoriList,

    // Salin array agar perubahan runtime tidak memodifikasi sumber data asli
    stok: stokData.map(function (item) { return Object.assign({}, item); }),

    // ── Filter State ──
    filterUpbjj: '',
    filterKategori: '',
    filterMenipis: false,
    filterKosong: false,
    sortKey: '',
    sortDir: 'asc',

    // ── Modal State ──
    showModalTambah: false,
    showModalEdit: false,

    // ── Form Tambah ──
    formTambah: {
      kode: '', judul: '', kategori: '', upbjj: '',
      lokasiRak: '', harga: '', qty: '', safety: '', catatanHTML: ''
    },
    errTambah: {},

    // ── Form Edit ──
    formEdit: {},
    errEdit: {},
    editIndex: -1,

    // ── Alert ──
    alert: { show: false, type: 'success', msg: '', icon: '' }
  },

  // ─────────────────────────────────────────────
  // COMPUTED — cached, tidak recompute tanpa perubahan
  // ─────────────────────────────────────────────
  computed: {
    filteredStok: function () {
      var vm = this;
      var result = vm.stok.filter(function (item) {
        if (vm.filterUpbjj && item.upbjj !== vm.filterUpbjj) return false;
        if (vm.filterKategori && item.kategori !== vm.filterKategori) return false;
        if (vm.filterMenipis && !(item.qty > 0 && item.qty < item.safety)) return false;
        if (vm.filterKosong && item.qty !== 0) return false;
        return true;
      });

      if (vm.sortKey) {
        result = result.slice().sort(function (a, b) {
          var av = a[vm.sortKey];
          var bv = b[vm.sortKey];
          if (typeof av === 'string') av = av.toLowerCase();
          if (typeof bv === 'string') bv = bv.toLowerCase();
          if (av < bv) return vm.sortDir === 'asc' ? -1 : 1;
          if (av > bv) return vm.sortDir === 'asc' ? 1 : -1;
          return 0;
        });
      }
      return result;
    },

    stokAman: function () {
      return this.stok.filter(function (i) { return i.qty >= i.safety; }).length;
    },
    stokMenipis: function () {
      return this.stok.filter(function (i) { return i.qty > 0 && i.qty < i.safety; }).length;
    },
    stokKosong: function () {
      return this.stok.filter(function (i) { return i.qty === 0; }).length;
    }
  },

  // ─────────────────────────────────────────────
  // WATCHERS — minimal 2 watcher
  // ─────────────────────────────────────────────
  watch: {
    // Watcher 1: Reset filterKategori saat filterUpbjj berubah
    filterUpbjj: function (newVal) {
      this.filterKategori = '';
      if (newVal === '') {
        this.tampilAlert('info', 'ℹ️', 'Filter UT-Daerah direset. Menampilkan semua data.');
      }
    },

    // Watcher 2: Pantau perubahan stok kosong → beri peringatan
    stokKosong: function (newVal, oldVal) {
      if (newVal > oldVal) {
        this.tampilAlert('error', '🚨', 'Perhatian! Ada bahan ajar yang baru mencapai stok 0. Segera lakukan reorder!');
      }
    },

    // Watcher 3: Pantau checkbox filterMenipis & filterKosong agar tidak aktif bersamaan
    filterMenipis: function (val) {
      if (val && this.filterKosong) {
        this.filterKosong = false;
        this.tampilAlert('warning', '⚠️', 'Filter "Kosong" dinonaktifkan karena tidak bisa bersamaan dengan "Menipis".');
      }
    },

    filterKosong: function (val) {
      if (val && this.filterMenipis) {
        this.filterMenipis = false;
      }
    }
  },

  // ─────────────────────────────────────────────
  // METHODS
  // ─────────────────────────────────────────────
  methods: {
    formatRupiah: function (angka) {
      return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },

    toggleSort: function (key) {
      if (this.sortKey === key) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortDir = 'asc';
      }
    },

    resetFilter: function () {
      this.filterUpbjj = '';
      this.filterKategori = '';
      this.filterMenipis = false;
      this.filterKosong = false;
      this.sortKey = '';
      this.sortDir = 'asc';
      this.tampilAlert('success', '✅', 'Filter berhasil direset.');
    },

    tampilAlert: function (type, icon, msg) {
      var vm = this;
      vm.alert = { show: true, type: type, icon: icon, msg: msg };
      setTimeout(function () { vm.alert.show = false; }, 3500);
    },

    // ── Modal Tambah ──
    bukaModalTambah: function () {
      this.formTambah = { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: '', qty: '', safety: '', catatanHTML: '' };
      this.errTambah = {};
      this.showModalTambah = true;
    },

    validasiTambah: function () {
      var f = this.formTambah;
      var err = {};
      if (!f.kode) err.kode = 'Kode MK wajib diisi.';
      else if (this.stok.some(function (s) { return s.kode === f.kode; })) err.kode = 'Kode MK sudah ada.';
      if (!f.judul) err.judul = 'Nama MK wajib diisi.';
      if (!f.kategori) err.kategori = 'Kategori wajib dipilih.';
      if (!f.upbjj) err.upbjj = 'UT-Daerah wajib dipilih.';
      if (!f.lokasiRak) err.lokasiRak = 'Lokasi rak wajib diisi.';
      if (f.harga === '' || f.harga < 0) err.harga = 'Harga wajib diisi (≥ 0).';
      if (f.qty === '' || f.qty < 0) err.qty = 'Stok wajib diisi (≥ 0).';
      if (f.safety === '' || f.safety < 0) err.safety = 'Safety stok wajib diisi (≥ 0).';
      this.errTambah = err;
      return Object.keys(err).length === 0;
    },

    simpanTambah: function () {
      if (!this.validasiTambah()) return;
      var f = this.formTambah;
      this.stok.push({
        kode: f.kode, judul: f.judul, kategori: f.kategori,
        upbjj: f.upbjj, lokasiRak: f.lokasiRak,
        harga: Number(f.harga), qty: Number(f.qty),
        safety: Number(f.safety), catatanHTML: f.catatanHTML
      });
      this.showModalTambah = false;
      this.tampilAlert('success', '✅', 'Bahan ajar "' + f.judul + '" berhasil ditambahkan!');
    },

    // ── Modal Edit ──
    bukaModalEdit: function (item) {
      this.editIndex = this.stok.indexOf(item);
      this.formEdit = Object.assign({}, item);
      this.errEdit = {};
      this.showModalEdit = true;
    },

    validasiEdit: function () {
      var f = this.formEdit;
      var err = {};
      if (!f.judul) err.judul = 'Nama MK wajib diisi.';
      if (f.qty === '' || f.qty < 0) err.qty = 'Stok wajib diisi (≥ 0).';
      if (f.safety === '' || f.safety < 0) err.safety = 'Safety stok wajib diisi (≥ 0).';
      this.errEdit = err;
      return Object.keys(err).length === 0;
    },

    simpanEdit: function () {
      if (!this.validasiEdit()) return;
      Vue.set(this.stok, this.editIndex, Object.assign({}, this.formEdit));
      this.showModalEdit = false;
      this.tampilAlert('success', '✅', 'Data "' + this.formEdit.judul + '" berhasil diperbarui!');
    }
  }
});
