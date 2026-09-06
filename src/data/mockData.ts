import type { User, Category, Thread, FjbItem } from '../types';

export const currentUser: User = {
  id: 'u1',
  name: 'Alvian Pratama',
  username: 'alvianp',
  avatarColor: '#2563EB',
  avatarInitial: 'A',
  karma: 1280,
  isKsatria: false,
  city: 'Jakarta',
  joinedAt: '2023-02-10',
  bio: 'Suka diskusi soal pendidikan & isu regional Jakarta.',
  badges: ['Donatur Aktif', 'Validator Terpercaya'],
};

export const users: Record<string, User> = {
  u1: currentUser,
  u2: {
    id: 'u2',
    name: 'Ibu Sri Wahyuni',
    username: 'sriwahyuni',
    avatarColor: '#0EA5E9',
    avatarInitial: 'S',
    karma: 4520,
    isKsatria: true,
    city: 'Yogyakarta',
    joinedAt: '2021-05-03',
    bio: 'Ketua Komunitas Peduli Yatim Yogyakarta. Terverifikasi sebagai Ksatria Komunitas.',
    badges: ['Ksatria Komunitas', 'Penggalang Dana Terpercaya', 'Top Kontributor 2024'],
  },
  u3: {
    id: 'u3',
    name: 'Budi Santoso',
    username: 'budisan',
    avatarColor: '#6366F1',
    avatarInitial: 'B',
    karma: 860,
    isKsatria: false,
    city: 'Bandung',
    joinedAt: '2022-11-19',
    badges: ['Donatur Aktif'],
  },
  u4: {
    id: 'u4',
    name: 'Yayasan Kasih Bencana',
    username: 'yasakasih',
    avatarColor: '#10B981',
    avatarInitial: 'Y',
    karma: 7210,
    isKsatria: true,
    city: 'Palu',
    joinedAt: '2020-01-15',
    bio: 'Lembaga resmi tanggap bencana, terverifikasi Ksatria Komunitas sejak 2020.',
    badges: ['Ksatria Komunitas', 'Lembaga Terverifikasi'],
  },
  u5: {
    id: 'u5',
    name: 'Dewi Anggraini',
    username: 'dewiangg',
    avatarColor: '#F59E0B',
    avatarInitial: 'D',
    karma: 320,
    isKsatria: false,
    city: 'Surabaya',
    joinedAt: '2024-03-22',
    badges: [],
  },
  u6: {
    id: 'u6',
    name: 'Rian Firmansyah',
    username: 'rianfirman',
    avatarColor: '#EC4899',
    avatarInitial: 'R',
    karma: 1990,
    isKsatria: false,
    city: 'Medan',
    joinedAt: '2022-06-01',
    badges: ['Validator Terpercaya'],
  },
};

export const categories: Category[] = [
  { id: 'c1', name: 'Regional', slug: 'regional', description: 'Diskusi seputar isu & kegiatan di kotamu', icon: 'LocationCity', threadCount: 482, color: '#2563EB' },
  { id: 'c2', name: 'Pendidikan', slug: 'pendidikan', description: 'Beasiswa, sekolah, literasi, dan masa depan anak bangsa', icon: 'School', threadCount: 231, color: '#0EA5E9' },
  { id: 'c3', name: 'Kesehatan', slug: 'kesehatan', description: 'Bantuan medis, pengobatan, dan kesehatan masyarakat', icon: 'LocalHospital', threadCount: 356, color: '#EF4444' },
  { id: 'c4', name: 'Bencana Alam', slug: 'bencana-alam', description: 'Tanggap darurat dan pemulihan pasca bencana', icon: 'Landslide', threadCount: 189, color: '#F59E0B' },
  { id: 'c5', name: 'Hobi & Sosial', slug: 'hobi-sosial', description: 'Komunitas hobi yang berbagi lebih dari sekadar minat', icon: 'Groups', threadCount: 274, color: '#8B5CF6' },
  { id: 'c6', name: 'Lingkungan', slug: 'lingkungan', description: 'Aksi hijau, konservasi, dan kebersihan lingkungan', icon: 'Park', threadCount: 145, color: '#10B981' },
];

export const threads: Thread[] = [
  {
    id: 't1',
    categoryId: 'c3',
    title: '[Aksi Sosial] Bantu Biaya Operasi Jantung Adik Fira (7 th) dari Yogyakarta',
    authorId: 'u2',
    createdAt: '2026-08-20',
    content:
      'Assalamualaikum warga Qpeduli. Saya Sri, ketua komunitas Peduli Yatim Yogyakarta. Kami menemukan kasus adik Fira, 7 tahun, yang divonis kelainan jantung bawaan dan membutuhkan operasi segera di RS Sardjito. Keluarga sudah menjual apa yang bisa dijual, namun biaya operasi sebesar Rp 185.000.000 masih jauh dari cukup. Semua dokumen medis dan surat keterangan RS sudah kami verifikasi langsung. Mari kita bantu adik Fira mendapat kesempatan hidup lebih baik.',
    isAksiSosial: true,
    campaign: {
      id: 'cp1',
      target: 185000000,
      collected: 132400000,
      donorCount: 842,
      deadline: '2026-10-15',
      guarantorId: 'u2',
      status: 'active',
      disbursed: 60000000,
      milestones: [
        { id: 'm1', label: 'Biaya pemeriksaan pra-operasi', amount: 25000000, released: true },
        { id: 'm2', label: 'Uang muka tindakan operasi', amount: 35000000, released: true },
        { id: 'm3', label: 'Biaya operasi & ruang ICU', amount: 90000000, released: false },
        { id: 'm4', label: 'Perawatan pasca operasi & kontrol', amount: 35000000, released: false },
      ],
    },
    updates: [
      { id: 'up1', authorId: 'u2', date: '2026-08-28', title: 'Pemeriksaan pra-operasi selesai', content: 'Alhamdulillah dana tahap 1 sudah cair dan pemeriksaan pra-operasi sudah dilakukan. Dokter menjadwalkan operasi tanggal 20 September.', imageEmoji: '🩺' },
      { id: 'up2', authorId: 'u2', date: '2026-09-02', title: 'Uang muka operasi dibayarkan', content: 'Tahap 2 sudah kami salurkan ke rumah sakit sebagai uang muka. Terima kasih untuk 842 donatur yang sudah percaya ❤️', imageEmoji: '💙' },
    ],
    comments: [
      { id: 'cm1', authorId: 'u3', date: '2026-08-29', content: 'Semoga adik Fira lekas sembuh, sudah donasi 500rb. Terus update ya kak.', isDonor: true, karmaGiven: 5 },
      { id: 'cm2', authorId: 'u6', date: '2026-09-01', content: 'Terima kasih sudah transparan dengan lampiran kuitansi. Sangat membantu kepercayaan donatur.', isDonor: true, karmaGiven: 8 },
      { id: 'cm3', authorId: 'u5', date: '2026-09-03', content: 'Apakah masih menerima donasi barang/obat dari apotek rekanan?', karmaGiven: 2 },
    ],
    views: 15420,
    hot: true,
  },
  {
    id: 't2',
    categoryId: 'c4',
    title: '[Aksi Sosial] Renovasi Panti Asuhan Nurul Iman Pasca Banjir Bandang Sukabumi',
    authorId: 'u4',
    createdAt: '2026-08-15',
    content:
      'Banjir bandang minggu lalu merusak total bangunan Panti Asuhan Nurul Iman yang menaungi 34 anak. Tim kami sudah turun langsung melakukan asesmen kerusakan. Dibutuhkan dana renovasi darurat agar anak-anak bisa kembali punya tempat tinggal yang layak sebelum musim hujan berikutnya.',
    isAksiSosial: true,
    campaign: {
      id: 'cp2',
      target: 250000000,
      collected: 98750000,
      donorCount: 1203,
      deadline: '2026-11-01',
      guarantorId: 'u4',
      status: 'active',
      disbursed: 40000000,
      milestones: [
        { id: 'm1', label: 'Pembersihan puing & sanitasi darurat', amount: 40000000, released: true },
        { id: 'm2', label: 'Perbaikan atap & struktur utama', amount: 110000000, released: false },
        { id: 'm3', label: 'Perbaikan interior & fasilitas MCK', amount: 100000000, released: false },
      ],
    },
    updates: [
      { id: 'up1', authorId: 'u4', date: '2026-08-22', title: 'Puing sudah dibersihkan', content: 'Tim relawan bersama warga sekitar sudah membersihkan seluruh puing bangunan. Video dokumentasi ada di grup komunitas.', imageEmoji: '🏚️' },
    ],
    comments: [
      { id: 'cm1', authorId: 'u1', date: '2026-08-23', content: 'Ikut donasi dan share ke grup RT. Semoga cepat selesai renovasinya.', isDonor: true, karmaGiven: 6 },
      { id: 'cm2', authorId: 'u3', date: '2026-08-25', content: 'Apakah ada kebutuhan relawan tenaga untuk akhir pekan ini?', karmaGiven: 3 },
    ],
    views: 22100,
    hot: true,
  },
  {
    id: 't3',
    categoryId: 'c2',
    title: '[Aksi Sosial] Beasiswa Kuliah untuk 12 Siswa Berprestasi Kurang Mampu di Medan',
    authorId: 'u6',
    createdAt: '2026-08-25',
    content:
      'Setiap tahun ada saja siswa berprestasi di daerah kami yang tidak bisa lanjut kuliah karena kendala biaya. Tahun ini kami mengidentifikasi 12 siswa dengan nilai rapor & prestasi luar biasa namun dari keluarga tidak mampu. Mari bantu mereka mendapat kesempatan pendidikan tinggi.',
    isAksiSosial: true,
    campaign: {
      id: 'cp3',
      target: 120000000,
      collected: 45300000,
      donorCount: 401,
      deadline: '2026-12-01',
      guarantorId: undefined,
      status: 'pending-verification',
      disbursed: 0,
      milestones: [
        { id: 'm1', label: 'Biaya pendaftaran & UKT semester 1', amount: 60000000, released: false },
        { id: 'm2', label: 'Biaya buku & perlengkapan kuliah', amount: 60000000, released: false },
      ],
    },
    updates: [],
    comments: [
      { id: 'cm1', authorId: 'u5', date: '2026-08-26', content: 'Salut inisiatifnya! Sudah ada guarantor Ksatria Komunitas belum kak?', karmaGiven: 4 },
      { id: 'cm2', authorId: 'u2', date: '2026-08-27', content: 'Saya bisa bantu jadi guarantor jika data siswa sudah lengkap, DM saya ya.', karmaGiven: 10 },
    ],
    views: 8900,
  },
  {
    id: 't4',
    categoryId: 'c1',
    title: 'Diskusi: Titik rawan banjir di Jakarta Selatan musim hujan tahun ini, ada info?',
    authorId: 'u1',
    createdAt: '2026-09-01',
    content:
      'Mau tanya ke warga Jaksel, dari pengalaman tahun lalu titik mana aja yang paling rawan banjir? Mau bikin pemetaan komunitas biar bisa siaga bareng-bareng.',
    isAksiSosial: false,
    updates: [],
    comments: [
      { id: 'cm1', authorId: 'u3', content: 'Kemang & sekitar Kali Krukut biasanya paling parah kak.', date: '2026-09-01', karmaGiven: 2 },
      { id: 'cm2', authorId: 'u5', content: 'Setuju, tahun lalu daerah Pejaten juga sempat parah.', date: '2026-09-02', karmaGiven: 1 },
    ],
    views: 1230,
  },
  {
    id: 't5',
    categoryId: 'c5',
    title: 'Komunitas sepeda gowes Minggu pagi CFD Bandung, yuk merapat!',
    authorId: 'u3',
    createdAt: '2026-08-30',
    content: 'Buat yang suka gowes santai tiap Minggu pagi di CFD Dago, yuk gabung rombongan kami. Sekalian mau bahas rencana gowes amal bulan depan.',
    isAksiSosial: false,
    updates: [],
    comments: [
      { id: 'cm1', authorId: 'u6', content: 'Gas kak, kapan mulai jam berapa biasanya?', date: '2026-08-31', karmaGiven: 1 },
    ],
    views: 640,
  },
  {
    id: 't6',
    categoryId: 'c6',
    title: '[Aksi Sosial] Tanam 5000 Mangrove untuk Selamatkan Pesisir Semarang',
    authorId: 'u4',
    createdAt: '2026-08-10',
    content: 'Abrasi di pesisir Semarang makin parah. Kami menginisiasi gerakan tanam 5000 bibit mangrove bersama warga pesisir. Dana digunakan untuk bibit, alat tanam, dan konsumsi relawan.',
    isAksiSosial: true,
    campaign: {
      id: 'cp4',
      target: 60000000,
      collected: 60000000,
      donorCount: 950,
      deadline: '2026-09-01',
      guarantorId: 'u4',
      status: 'completed',
      disbursed: 60000000,
      milestones: [
        { id: 'm1', label: 'Pengadaan bibit mangrove', amount: 30000000, released: true },
        { id: 'm2', label: 'Alat tanam & konsumsi relawan', amount: 30000000, released: true },
      ],
    },
    updates: [
      { id: 'up1', authorId: 'u4', date: '2026-08-25', title: 'Penanaman 5000 mangrove selesai!', content: 'Terima kasih untuk 950 donatur, target tercapai 100% dan penanaman sudah selesai dilakukan bersama 200 relawan lokal.', imageEmoji: '🌱' },
    ],
    comments: [
      { id: 'cm1', authorId: 'u1', content: 'Keren banget, semoga bisa jadi program tahunan!', date: '2026-08-26', isDonor: true, karmaGiven: 5 },
    ],
    views: 11200,
  },
];

export const fjbItems: FjbItem[] = [
  {
    id: 'f1',
    title: 'Kamera Mirrorless Fujifilm X-T30 (Preloved, Mulus)',
    price: 6500000,
    sellerId: 'u1',
    condition: 'Seperti Baru',
    category: 'Elektronik',
    emoji: '📷',
    campaignId: 'cp1',
    sold: false,
    description: 'Dijual untuk membantu galang dana operasi jantung adik Fira. Kondisi 95% mulus, lengkap dus & charger.',
  },
  {
    id: 'f2',
    title: 'Jasa Desain Logo & Branding UMKM',
    price: 350000,
    sellerId: 'u6',
    condition: 'Baru',
    category: 'Jasa',
    emoji: '🎨',
    campaignId: 'cp3',
    sold: false,
    description: 'Hasil jasa desain akan disalurkan penuh ke kampanye beasiswa siswa Medan.',
  },
  {
    id: 'f3',
    title: 'Sepeda Lipat Element Ecosmo 20"',
    price: 1800000,
    sellerId: 'u3',
    condition: 'Bekas Layak Pakai',
    category: 'Olahraga',
    emoji: '🚲',
    campaignId: 'cp2',
    sold: false,
    description: 'Sepeda jarang dipakai, hasil penjualan 100% untuk renovasi panti asuhan Sukabumi.',
  },
  {
    id: 'f4',
    title: 'Koleksi Buku Novel & Non-Fiksi (30 buku)',
    price: 450000,
    sellerId: 'u5',
    condition: 'Bekas Layak Pakai',
    category: 'Buku',
    emoji: '📚',
    campaignId: 'cp3',
    sold: true,
    description: 'Paket 30 buku campuran, cocok buat pecinta baca. Untuk beasiswa siswa Medan.',
  },
  {
    id: 'f5',
    title: 'Tas Selempang Kulit Asli Handmade',
    price: 275000,
    sellerId: 'u2',
    condition: 'Baru',
    category: 'Fashion',
    emoji: '👜',
    campaignId: 'cp1',
    sold: false,
    description: 'Produk UMKM binaan komunitas, seluruh hasil penjualan untuk biaya operasi adik Fira.',
  },
];

export const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Hari ini';
  if (days === 1) return '1 hari lalu';
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  return `${months} bulan lalu`;
};
