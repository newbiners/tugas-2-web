// ──────────────────────────────────────────────
// tracking-app.js — Vue 2 logic untuk tracking.html
// Bergantung pada: js/dataBahanAjar.js (dimuat lebih dulu di HTML)
// ──────────────────────────────────────────────

var trackingApp = new Vue({
  el: '#app',

  data: {
    // ── Master Data — diambil dari js/dataBahanAjar.js ──
    pengirimanList: pengirimanList,
    paket: paket,

    statusOptions: [
      'Pesanan Dibuat',
      'Packing & Verifikasi',
      'Dalam Perjalanan',
      'Di Hub Transit',
      'Terkirim'
    ],

    // ── List DO — dikonversi dari trackingData (object) ke array ──
    doList: Object.keys(trackingData).map(function (nomorDO) {
      var d = trackingData[nomorDO];
      return Object.assign({ nomorDO: nomorDO }, d);
    }),

    // ── UI State ──
    searchQuery: '',
    expandedDO: null,
    newPerjalananMap: {},

    // ── Modal DO Baru ──
    showModalDO: false,
    formDO: {
      nim: '', nama: '', ekspedisi: '',
      tanggalKirim: '', paketKode: ''
    },
    errDO: {},

    // ── Modal Update Status ──
    showModalStatus: false,
    doStatusTarget: null,
    statusBaru: '',

    // ── Alert ──
    alert: { show: false, type: 'success', msg: '', icon: '' }
  },

  // ─────────────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────────────
  computed: {
    filteredDO: function () {
      var q = this.searchQuery.toLowerCase().trim();
      if (!q) return this.doList;
      return this.doList.filter(function (d) {
        return d.nomorDO.toLowerCase().includes(q) ||
               d.nim.toLowerCase().includes(q) ||
               d.nama.toLowerCase().includes(q);
      });
    },

    jumlahDalamPerjalanan: function () {
      return this.doList.filter(function (d) { return d.status === 'Dalam Perjalanan' || d.status === 'Di Hub Transit'; }).length;
    },

    jumlahTerkirim: function () {
      return this.doList.filter(function (d) { return d.status === 'Terkirim'; }).length;
    },

    totalNilaiDO: function () {
      return this.doList.reduce(function (acc, d) { return acc + d.totalHarga; }, 0);
    },

    nomorDOBaru: function () {
      var tahun = new Date().getFullYear();
      var seq = this.doList.length + 1;
      return 'DO' + tahun + '-' + String(seq).padStart(3, '0');
    },

    paketDipilih: function () {
      var kode = this.formDO.paketKode;
      if (!kode) return null;
      return this.paket.find(function (p) { return p.kode === kode; }) || null;
    }
  },

  // ─────────────────────────────────────────────
  // WATCHERS
  // ─────────────────────────────────────────────
  watch: {
    // Watcher 1: Pantau perubahan paket yang dipilih → update info harga
    'formDO.paketKode': function (newKode) {
      if (newKode) {
        var paket = this.paket.find(function (p) { return p.kode === newKode; });
        if (paket) {
          this.tampilAlert('info', '💡', 'Paket dipilih: ' + paket.nama + ' — Rp ' + this.formatRupiah(paket.harga));
        }
      }
    },

    // Watcher 2: Pantau perubahan status DO — catat jika ada yang baru terkirim
    doList: {
      deep: true,
      handler: function (list) {
        var terkirim = list.filter(function (d) { return d.status === 'Terkirim'; }).length;
        if (terkirim > 0) {
          // Hanya tampil pesan jika ini bukan kondisi awal
        }
      }
    },

    // Watcher 3: Pantau searchQuery — beri feedback jika tidak ada hasil
    searchQuery: function (q) {
      var vm = this;
      if (q.length > 2 && vm.filteredDO.length === 0) {
        vm.tampilAlert('warning', '🔍', 'Tidak ditemukan DO untuk pencarian "' + q + '"');
      }
    },

    // Watcher 4: Pantau jumlah DO baru (setelah tambah)
    'doList.length': function (newLen, oldLen) {
      if (newLen > oldLen) {
        this.tampilAlert('success', '✅', 'DO baru berhasil dibuat! Total DO: ' + newLen);
      }
    }
  },

  // ─────────────────────────────────────────────
  // METHODS
  // ─────────────────────────────────────────────
  methods: {
    formatRupiah: function (angka) {
      if (!angka) return '0';
      return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },

    hariIni: function () {
      var d = new Date();
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      var dd = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + mm + '-' + dd;
    },

    tampilAlert: function (type, icon, msg) {
      var vm = this;
      vm.alert = { show: true, type: type, icon: icon, msg: msg };
      setTimeout(function () { vm.alert.show = false; }, 3500);
    },

    toggleExpand: function (nomorDO) {
      if (this.expandedDO === nomorDO) {
        this.expandedDO = null;
      } else {
        this.expandedDO = nomorDO;
        // Inisialisasi key di newPerjalananMap jika belum ada
        if (!this.newPerjalananMap[nomorDO]) {
          this.$set(this.newPerjalananMap, nomorDO, '');
        }
      }
    },

    badgeStatusClass: function (status) {
      if (status === 'Terkirim') return 'badge-safe';
      if (status === 'Dalam Perjalanan' || status === 'Di Hub Transit') return 'badge-warning';
      if (status === 'Pesanan Dibuat') return 'badge-neutral';
      return 'badge-info';
    },

    statusIcon: function (status) {
      var icons = {
        'Pesanan Dibuat': '📋',
        'Packing & Verifikasi': '📦',
        'Dalam Perjalanan': '🚚',
        'Di Hub Transit': '🏭',
        'Terkirim': '✅'
      };
      return icons[status] || '📌';
    },

    // ── Modal DO Baru ──
    bukaModalDO: function () {
      this.formDO = { nim: '', nama: '', ekspedisi: '', tanggalKirim: this.hariIni(), paketKode: '' };
      this.errDO = {};
      this.showModalDO = true;
    },

    validasiDO: function () {
      var f = this.formDO;
      var err = {};
      if (!f.nim) err.nim = 'NIM wajib diisi.';
      else if (!/^\d{6,12}$/.test(f.nim)) err.nim = 'NIM harus 6–12 digit angka.';
      if (!f.nama) err.nama = 'Nama wajib diisi.';
      if (!f.ekspedisi) err.ekspedisi = 'Ekspedisi wajib dipilih.';
      if (!f.tanggalKirim) err.tanggalKirim = 'Tanggal kirim wajib diisi.';
      if (!f.paketKode) err.paketKode = 'Paket bahan ajar wajib dipilih.';
      this.errDO = err;
      return Object.keys(err).length === 0;
    },

    simpanDO: function () {
      if (!this.validasiDO()) return;
      var f = this.formDO;
      var paket = this.paket.find(function (p) { return p.kode === f.paketKode; });
      var nomorBaru = this.nomorDOBaru;

      this.doList.push({
        nomorDO: nomorBaru,
        nim: f.nim,
        nama: f.nama,
        ekspedisi: f.ekspedisi,
        tanggalKirim: f.tanggalKirim,
        paketKode: f.paketKode,
        namaPaket: paket ? paket.nama : '-',
        totalHarga: paket ? paket.harga : 0,
        status: 'Pesanan Dibuat',
        perjalanan: [
          { waktu: this.waktuSekarang(), keterangan: 'DO ' + nomorBaru + ' dibuat. Menunggu proses packing.' }
        ]
      });

      // Inisialisasi map perjalanan
      this.$set(this.newPerjalananMap, nomorBaru, '');
      this.showModalDO = false;
    },

    // ── Tambah Perjalanan ──
    tambahPerjalanan: function (item) {
      var keterangan = this.newPerjalananMap[item.nomorDO];
      if (!keterangan || !keterangan.trim()) {
        this.tampilAlert('warning', '⚠️', 'Keterangan perjalanan tidak boleh kosong.');
        return;
      }
      item.perjalanan.push({
        waktu: this.waktuSekarang(),
        keterangan: keterangan.trim()
      });
      this.$set(this.newPerjalananMap, item.nomorDO, '');
      this.tampilAlert('success', '✅', 'Update perjalanan berhasil ditambahkan.');
    },

    waktuSekarang: function () {
      var d = new Date();
      var pad = function (n) { return String(n).padStart(2, '0'); };
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
             ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    },

    // ── Update Status ──
    updateStatus: function (item) {
      this.doStatusTarget = item;
      this.statusBaru = item.status;
      this.showModalStatus = true;
    },

    simpanStatus: function () {
      if (this.doStatusTarget) {
        var lama = this.doStatusTarget.status;
        this.doStatusTarget.status = this.statusBaru;
        this.doStatusTarget.perjalanan.push({
          waktu: this.waktuSekarang(),
          keterangan: 'Status diperbarui: ' + lama + ' → ' + this.statusBaru
        });
        this.tampilAlert('success', '✅', 'Status DO berhasil diperbarui menjadi "' + this.statusBaru + '".');
      }
      this.showModalStatus = false;
    }
  }
});
