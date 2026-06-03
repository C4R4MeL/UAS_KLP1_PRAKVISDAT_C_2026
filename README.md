# 🚀 Dashboard Analitik: Burnout Founder Startup

Dashboard interaktif berbasis **D3.js** untuk menganalisis tingkat burnout, pola kerja, dan risiko kegagalan startup pada 50.000 founder startup di seluruh dunia.

---

## 📁 Struktur Proyek

```
UAS2/
├── index.html              # Halaman utama dashboard
├── preprocessing.ipynb     # Notebook preprocessing data
├── css/
│   └── style.css           # Stylesheet dashboard
├── js/
│   └── app.js              # Logika D3.js & semua visualisasi
└── data/
    ├── startup_founder_burnout_2026.csv   # Dataset mentah (29 kolom)
    └── startup_burnout_cleaned.csv        # Dataset hasil preprocessing (32 kolom)
```

---

## 📊 Sumber Dataset

**Startup Founder Burnout and Failure Risk Dataset**
oleh Mohan Krishna Thalla
🔗 [Kaggle Dataset](https://www.kaggle.com/datasets/mohankrishnathalla/startup-founder-burnout-and-failure-risk-dataset)

| Informasi | Detail |
|---|---|
| Jumlah Baris | 50.000 data founder |
| Kolom Asli | 29 kolom |
| Kolom Setelah Preprocessing | 32 kolom (+3 kategori informasi baru) |

---

## ⚙️ Persiapan Data (Preprocessing)

Persiapan data dilakukan di `preprocessing.ipynb` dengan tahapan berikut:

```
Data Mentah Awal (29 kolom informasi)
    ↓  Menyeragamkan format penulisan nama kolom
    ↓  Menyamakan istilah kategori kejenuhan (Moderate menjadi Medium, Severe menjadi High)
    ↓  Memeriksa data kosong → tidak ditemukan
    ↓  Memeriksa data ganda → tidak ditemukan
    ↓  Memeriksa data ekstrem (outlier) → hanya ditemukan pada jam kerja dan jam tidur (< 0,4% dari total data)
    ↓  Menambahkan informasi baru pendukung (tingkat pendanaan, ukuran startup, dan estimasi nominal dana)
Data Siap Pakai (32 kolom informasi)
```

### Kategori Informasi Baru yang Ditambahkan

| Nama Informasi | Sumber Data | Penjelasan |
|---|---|---|
| Tingkat Pendanaan | Tahap Pendanaan | Rendah (Modal Sendiri/Awal), Sedang (Pendanaan Awal/Seri A), Tinggi (Seri B/C) |
| Kategori Ukuran Startup | Jumlah Anggota Tim | Kecil (10 orang atau kurang), Sedang (11-50 orang), Besar (lebih dari 50 orang) |
| Estimasi Nominal Dana | Tahap Pendanaan | Perkiraan jumlah dana dalam bentuk angka untuk keperluan analisis |

---

## 🎛️ Fitur Dashboard

### Penyaringan Data (Filter Global)
- **Cara Kerja**: Pengguna dapat memilih untuk menampilkan data berdasarkan *Mode Kerja* (Remote, Hybrid, On-site, atau Semua) dan *Kondisi Ekonomi* (Pasar Bergairah, Ekonomi Stabil, Resesi, Musim Dingin Pendanaan, atau Semua).
- Semua grafik di dashboard akan langsung memperbarui tampilannya secara otomatis sesuai pilihan penyaringan tersebut.

### Kartu Informasi Utama (KPI Cards)
Terdapat 6 kartu informasi ringkas yang menampilkan angka penting secara langsung:
1. **Total Founder** — jumlah pendiri startup yang sedang dianalisis.
2. **Rata-rata Skor Kejenuhan** — nilai rata-rata tingkat burnout (skala 0 sampai 10).
3. **Tingkat Kritis** — persentase pendiri yang mengalami tingkat kejenuhan tinggi (skor di atas 6,5).
4. **Tingkat Kegagalan** — persentase startup yang terpaksa ditutup atau gagal.
5. **Rata-rata Jam Tidur** — jumlah jam tidur harian rata-rata pendiri.
6. **Pencarian Dukungan Mental** — persentase pendiri yang mencari bantuan psikologis.

---

## 📈 Penjelasan Visualisasi

Berikut adalah penjelasan mengenai lima grafik utama dalam dashboard interaktif ini. Seluruh grafik dirancang menggunakan bahasa visual yang mudah dipahami oleh siapa saja.

---

### Visualisasi 1 — Radar Chart: Profil Kesehatan Mental Berdasarkan Tipe Pendiri

**Tujuan**: Membandingkan kondisi kesehatan mental dari delapan tipe kepribadian pendiri startup secara menyeluruh untuk melihat kelompok mana yang paling rentan terhadap stres dan kejenuhan.

**Mengapa Memilih Grafik Ini?**: Grafik radar (berbentuk seperti jaring laba-laba) dipilih karena mampu menampilkan beberapa aspek penilaian secara bersamaan dalam satu ruang. Semakin lebar area jaring suatu kelompok, semakin besar pula tingkat tekanan atau risiko yang mereka alami.

**Aspek yang Dinilai**:
Enam aspek kesehatan mental dinilai dalam skala rata-rata, yaitu: Tingkat Stres, Kelelahan Mengambil Keputusan, Tekanan dari Investor, Konflik dengan Co-founder, Keseimbangan Hidup, dan Skor Kejenuhan (Burnout).

**Tipe Pendiri yang Dibandingkan**: *Burned-Out Operator*, *Calm Operator*, *Chaotic Innovator*, *Growth Obsessed Founder*, *Serial Entrepreneur*, *Solo Hustler*, *Technical Builder*, dan *Visionary CEO*.

**Interaksi Pengguna**: Pengguna dapat mengklik nama tipe pendiri pada legenda untuk menyembunyikan atau menampilkan data tipe tersebut pada grafik. Mengarahkan kursor ke titik grafik akan memunculkan detail angka rata-rata di setiap aspek.

**Temuan Utama**: Dashboard akan secara otomatis memunculkan teks informasi mengenai tipe pendiri dengan tingkat kejenuhan rata-rata paling tinggi dan paling rendah.

---

### Visualisasi 2 — Donut Chart: Efektivitas Dukungan Kesehatan Mental terhadap Kejenuhan

**Tujuan**: Melihat apakah terdapat perbedaan tingkat kejenuhan antara kelompok pendiri yang mencari bantuan kesehatan mental dengan kelompok yang tidak mencari bantuan.

**Mengapa Memilih Grafik Ini?**: Grafik lingkaran berbentuk donat sangat cocok untuk menunjukkan pembagian porsi atau persentase dari suatu kelompok. Perbandingan visual dibuat dengan menyandingkan dua grafik donat (kelompok yang mencari bantuan vs kelompok yang tidak). Warna hijau melambangkan kejenuhan rendah, kuning untuk kejenuhan sedang, dan merah untuk kejenuhan tinggi.

**Interaksi Pengguna**: Pengguna dapat berpindah tampilan antara kelompok "Mencari Bantuan" dan "Tidak Mencari Bantuan" menggunakan tombol pilihan. Mengarahkan kursor ke bagian lingkaran akan menampilkan jumlah pendiri beserta persentasenya secara detail.

**Temuan Utama**: Bagian bawah grafik akan otomatis membandingkan persentase pendiri yang mengalami kejenuhan tingkat tinggi dari kedua kelompok tersebut.

---

### Visualisasi 3 — Grouped Bar Chart: Rata-rata Risiko Kegagalan Startup per Industri dan Tingkat Pendanaan

**Tujuan**: Mengetahui sektor industri mana yang paling berisiko mengalami kegagalan, serta melihat apakah jumlah pendanaan yang didapat memengaruhi risiko kegagalan tersebut.

**Mengapa Memilih Grafik Ini?**: Grafik batang berkelompok digunakan agar pembaca dapat membandingkan dua kategori sekaligus secara langsung—yaitu jenis industri (pada bagian bawah grafik) dan tingkat pendanaan (melalui perbedaan warna batang di setiap industri).

**Aspek yang Dinilai**:
- **Kategori Industri**: Jenis industri startup (seperti kecerdasan buatan/AI, teknologi keuangan/Fintech, e-commerce, bioteknologi, dan lainnya).
- **Risiko Kegagalan**: Rata-rata kemungkinan startup tutup (skasla 0 hingga 1).
- **Tingkat Pendanaan**: Dikelompokkan menjadi Rendah, Sedang, dan Tinggi.

**Interaksi Pengguna**: Mengarahkan kursor ke setiap batang grafik akan menampilkan nama industri, tingkat pendanaan, dan nilai kemungkinan kegagalan startup secara akurat.

**Temuan Utama**: Grafik secara otomatis menampilkan industri dengan risiko kegagalan tertinggi dan terendah pada bagian bawah bagan.

---

### Visualisasi 4 — Scatter Plot: Hubungan Jam Kerja Mingguan dan Tingkat Kejenuhan

**Tujuan**: Mengamati apakah jam kerja mingguan pendiri startup berhubungan langsung dengan tingkat kejenuhan mereka.

**Mengapa Memilih Grafik Ini?**: Grafik tebaran titik (scatter plot) adalah cara terbaik untuk melihat pola hubungan antara dua ukuran angka. Penyebaran titik-titik pada grafik akan memperlihatkan kecenderungan umum: jika titik-titik cenderung naik ke kanan atas, berarti ada hubungan yang kuat di mana semakin banyak jam kerja, semakin tinggi pula kejenuhan yang dialami.

**Aspek yang Dinilai**:
- **Sumbu Bawah**: Jumlah jam kerja dalam seminggu.
- **Sumbu Samping**: Skor kejenuhan (burnout) dari skala 0 hingga 10.
- **Warna Titik**: Hijau (Kejenuhan Rendah), Kuning (Sedang), dan Merah (Tinggi).

Untuk kenyamanan visual dan kecepatan halaman, grafik ini menampilkan contoh acak sebanyak 800 data yang mewakili keseluruhan data.

**Garis Bantu**: Terdapat dua garis putus-putus sebagai batas rata-rata jam kerja dan rata-rata skor kejenuhan. Garis ini membagi grafik menjadi 4 area untuk memudahkan identifikasi kelompok yang bekerja sangat keras sekaligus mengalami kejenuhan tinggi (area kanan atas).

**Kekuatan Hubungan (Korelasi)**: Dashboard menghitung kekuatan kaitan antara jam kerja dan kejenuhan dari seluruh data secara langsung. Hubungan ini berkisar antara -1 (berlawanan arah) hingga +1 (searah dan sangat kuat).

**Interaksi Pengguna**: Mengarahkan kursor ke setiap titik akan menampilkan jam kerja, skor kejenuhan, serta informasi apakah kondisi pendiri tersebut berada di atas atau di bawah rata-rata umum.

---

### Visualisasi 5 — Heatmap: Peta Hubungan Kunci Antar Faktor Kesehatan Mental dan Kerja

**Tujuan**: Melihat kaitan dan tingkat kekuatan hubungan di antara 8 faktor utama dalam kehidupan kerja pendiri secara menyeluruh.

**Mengapa Memilih Grafik Ini?**: Peta hubungan berwarna (heatmap) sangat efisien karena dapat merangkum 64 hubungan antar faktor ke dalam satu tabel berkode warna yang sederhana. Pembaca dapat langsung mengenali faktor-faktor apa saja yang saling memengaruhi secara kuat hanya dengan melihat warna kotak.

**8 Faktor yang Dianalisis**:
Jam Kerja Mingguan, Jam Tidur Harian, Tingkat Stres, Kelelahan Mengambil Keputusan, Tekanan dari Investor, Konflik dengan Co-founder, Keseimbangan Hidup, dan Skor Kejenuhan.

**Cara Membaca Warna**:
- **Merah Tua**: Menunjukkan hubungan berlawanan arah yang kuat (jika faktor A naik, faktor B turun drastis).
- **Hitam**: Menunjukkan tidak ada hubungan sama sekali antara kedua faktor.
- **Biru Tua**: Menunjukkan hubungan searah yang kuat (jika faktor A naik, faktor B juga naik secara signifikan).

**Pengecualian Data**: Nilai jam kerja atau jam tidur yang sangat ekstrem (outlier) yang ditemukan dalam data tetap dimasukkan karena menggambarkan kondisi nyata di dunia startup (seperti pendiri yang bekerja di atas 99 jam per minggu). Hal ini tidak memengaruhi hasil akhir peta hubungan secara signifikan karena besarnya jumlah data yang dianalisis (50.000 pendiri).

**Interaksi Pengguna**: Mengarahkan kursor ke kotak mana pun akan memunculkan penjelasan bahasa sehari-hari mengenai seberapa kuat dan ke mana arah hubungan kedua faktor tersebut.

---

## 🔍 Analisis Data Hasil Visualisasi

Berikut adalah analisis terhadap data yang disajikan oleh visualisasi di dashboard:

### 1. Gambaran Umum Data
Secara keseluruhan, rata-rata skor kejenuhan pendiri startup berada pada angka **3,44 dari skala 10** (kategori rendah ke sedang). Namun, sebanyak **10,4% pendiri (5.210 orang)** berada dalam kondisi kritis dengan tingkat kejenuhan yang sangat tinggi. Di sisi lain, rata-rata jam tidur pendiri startup hanya **5,69 jam per hari** (di bawah anjuran kesehatan), dan hanya **27,3%** pendiri yang mencari bantuan psikologis untuk kesehatan mental mereka. Selain itu, **23,7%** dari startup yang tercatat dalam data mengalami kegagalan usaha.

### 2. Analisis Profil Berdasarkan Tipe Pendiri
Tipe kepribadian pendiri menentukan tingkat kerentanan mereka terhadap stres:
- Tipe **Burned-Out Operator** merupakan kelompok paling rentan dengan rata-rata skor kejenuhan tertinggi (**5,00**), dipicu oleh stres yang tinggi (5,54) dan tekanan besar dari investor (6,20).
- Tipe **Calm Operator** merupakan kelompok paling sehat mental dengan skor kejenuhan terendah (**1,38**), didukung oleh keseimbangan hidup yang sangat baik (**9,33**) meskipun mereka tetap mengalami tekanan investor yang setara dengan tipe lainnya.
- Tipe **Solo Hustler** (bekerja sendiri) dan **Growth Obsessed** (terobsesi pada pertumbuhan cepat) menempati posisi risiko tertinggi berikutnya dengan rata-rata kejenuhan masing-masing **4,38** dan **4,35**.

### 3. Analisis Hubungan Dukungan Mental
Pendiri yang secara aktif mencari bantuan kesehatan mental mencatat persentase kejenuhan tinggi sebesar **18,9%**, berbanding terbalik dengan mereka yang tidak mencari bantuan (**7,7%**). Hal ini menunjukkan adanya pola alami di mana pendiri startup umumnya baru akan mencari bantuan kesehatan mental ketika tingkat kejenuhan mereka sudah berada pada tahap yang berat atau kritis (bersifat penanganan, bukan pencegahan).

### 4. Analisis Risiko Kegagalan Startup
Risiko kegagalan bervariasi tergantung pada sektor industri dan ketersediaan dana:
- Sektor **ClimateTech** (teknologi iklim) memiliki rata-rata kemungkinan gagal tertinggi sebesar **0,396**, sedangkan sektor **AI** (kecerdasan buatan) memiliki risiko terendah sebesar **0,377**.
- Tingkat pendanaan yang lebih besar terbukti membantu menurunkan risiko kegagalan startup secara konsisten di setiap sektor industri. Sebagai contoh, di sektor ClimateTech, risiko kegagalan bagi startup dengan pendanaan rendah adalah **0,413**, tetapi risiko tersebut turun menjadi **0,349** pada startup dengan pendanaan tinggi.

### 5. Analisis Hubungan Jam Kerja dengan Kejenuhan
Terdapat hubungan searah yang kuat antara durasi jam kerja mingguan dengan tingkat kejenuhan pendiri. Rata-rata jam kerja pendiri startup adalah **63,70 jam per minggu** (sangat jauh di atas jam kerja normal). Sebanyak **61,0% pendiri** bekerja 60 jam atau lebih dalam seminggu, dan dari kelompok pekerja keras ini, sebanyak **16,3%** mengalami tingkat kejenuhan yang sangat tinggi.

### 6. Analisis Hubungan Antar Faktor Utama
Peta hubungan (heatmap) mengungkapkan beberapa korelasi penting:
- **Keseimbangan Hidup dan Kejenuhan**: Memiliki hubungan berlawanan arah yang sangat kuat (nilai korelasi **−0,92**). Ini berarti semakin buruk keseimbangan hidup pendiri, tingkat kejenuhan mereka dipastikan akan melonjak tinggi.
- **Kelelahan Keputusan dan Kejenuhan**: Memiliki hubungan searah yang sangat kuat (nilai korelasi **0,82**), menandakan bahwa kelelahan fisik dan mental akibat terus-menerus mengambil keputusan penting menjadi penyebab utama terjadinya kejenuhan.
- **Tingkat Stres**: Berperan sebagai jembatan utama yang menghubungkan jam kerja yang panjang dengan kelelahan keputusan dan menurunnya kualitas tidur.

---

## 📌 Kesimpulan dan Saran

### 4.1 Kesimpulan Hasil Analisis
Berdasarkan hasil visualisasi dan analisis data dari 50.000 pendiri startup, diperoleh beberapa poin kesimpulan sebagai berikut:
1. **Gambaran Umum**: Rata-rata skor kejenuhan pendiri startup berada pada angka **3,44 dari skala 10** (kategori rendah ke sedang). Namun, terdapat **10,4% pendiri** yang mengalami kejenuhan tingkat kritis (burnout parah). Secara kesehatan fisik, pendiri startup kekurangan tidur dengan rata-rata hanya **5,69 jam per hari**.
2. **Profil Kepribadian**: Tingkat stres dan kejenuhan sangat dipengaruhi oleh karakter kerja pendiri. Tipe *Burned-Out Operator* dan *Solo Hustler* memiliki tingkat kejenuhan rata-rata tertinggi (masing-masing skor 5,00 dan 4,38), sementara tipe *Calm Operator* memiliki ketahanan mental terbaik dengan skor kejenuhan terendah (1,38).
3. **Efektivitas Dukungan**: Layanan kesehatan mental di ekosistem startup saat ini masih bersifat reaktif. Hal ini terlihat dari proporsi kejenuhan tinggi yang justru lebih besar pada pendiri yang mencari bantuan (18,9%) dibandingkan yang tidak mencari bantuan (7,7%), mengindikasikan mereka baru berkonsultasi ketika kondisi stres sudah parah.
4. **Risiko Sektor dan Pendanaan**: Sektor industri *ClimateTech* mencatat risiko kegagalan usaha (shutdown) rata-rata tertinggi (0,396), sedangkan sektor *AI* memiliki risiko terendah (0,377). Meskipun demikian, ketersediaan pendanaan yang lebih besar terbukti secara konsisten mengurangi kemungkinan kegagalan startup di seluruh sektor industri.
5. **Kaitan Jam Kerja**: Jam kerja yang ekstrem merupakan pemicu langsung terhadap peningkatan kejenuhan pendiri startup, dengan korelasi positif yang kuat antara durasi jam kerja mingguan dengan skor burnout.

### 4.2 Insight Utama
Dari kesimpulan hasil analisis di atas, diperoleh pemahaman mendalam (insight utama) mengenai ekosistem startup:
1. **Rantai Penyebab Kejenuhan**: Kejenuhan tinggi tidak terjadi secara tiba-tiba, melainkan melalui rantai kondisi kerja: 
   **Jam Kerja Berlebihan (≥60 jam/minggu)** $\rightarrow$ **Stres Meningkat** $\rightarrow$ **Kelelahan Mengambil Keputusan** $\rightarrow$ **Keseimbangan Hidup Terganggu** $\rightarrow$ **Kejenuhan Tinggi (Burnout)**.
2. **Keseimbangan Hidup sebagai Pelindung**: Keseimbangan hidup (work-life balance) memiliki kaitan terkuat sebagai faktor penekan kejenuhan. Upaya pencegahan stres paling efektif adalah dengan membatasi jam kerja berlebih dan menjaga pola istirahat yang cukup.
3. **Pendanaan sebagai Penopang Bisnis**: Tingkat pendanaan yang lebih tinggi membantu menjaga keberlangsungan operasional startup (mengurangi risiko gagal), tetapi tidak secara langsung meredakan beban stres psikologis yang ditanggung oleh pendiri.
4. **Kecenderungan Penanganan Pasca-Kejadian**: Para pendiri cenderung mengabaikan kesehatan mental di tahap awal dan baru mencari pertolongan profesional setelah kondisi kesehatan mental mereka menurun drastis.

### 4.3 Saran Pengembangan
Sebagai langkah perbaikan untuk pengembangan ke depan, diajukan beberapa saran:
1. **Pengembangan Sistem Dashboard Visualisasi**:
   * **Simulasi Risiko Interaktif (Risk Calculator)**: Menambahkan fitur simulasi interaktif di mana pengguna dapat memasukkan durasi jam kerja, jam tidur, tingkat stres, dan tahap pendanaan mereka untuk memprediksi potensi kejenuhan dan risiko kegagalan startup secara langsung.
   * **Analisis Geografis**: Menambahkan filter atau grafik sebaran peta wilayah untuk menganalisis apakah terdapat perbedaan pola kejenuhan dan risiko startup antar negara atau benua.
   * **Penyaringan Lanjutan**: Memperluas penyaringan global agar pengguna dapat menyaring data berdasarkan skala startup (kecil, sedang, besar) secara bersamaan.
2. **Bagi Praktisi, Pendiri, dan Ekosistem Startup**:
   * **Langkah Preventif Dini**: Membangun program bimbingan kesehatan mental preventif di dalam wadah inkubator dan akselerator startup, agar pendiri dapat mengelola stres sebelum mencapai tingkat kritis.
   * **Manajemen Stres Terintegrasi**: Bagi investor (Venture Capital), disarankan untuk tidak hanya memantau kinerja bisnis startup, tetapi juga memberikan fasilitas pelatihan manajemen waktu dan stres bagi para pendiri sebagai investasi jangka panjang.
   * **Pembatasan Waktu Kerja Mandiri**: Mendorong pendiri startup, khususnya tipe *Solo Hustler*, untuk membagi beban tugas melalui perekrutan tim demi mengurangi kelelahan dalam mengambil keputusan operasional sendirian.

---

## 🛠️ Teknologi yang Digunakan


| Teknologi | Peran |
|---|---|
| **D3.js v7** | Rendering semua visualisasi SVG interaktif |
| **HTML5 + Vanilla CSS** | Struktur dan styling dashboard |
| **Python (pandas, numpy)** | Preprocessing data di Jupyter Notebook |
| **Jupyter Notebook** | Dokumentasi alur preprocessing |

---

## 🚀 Cara Menjalankan

```bash
# Jalankan web server lokal dari folder proyek
python -m http.server 8000
```

Buka browser dan akses: `http://localhost:8000`

---

## 👥 Kelompok

Tugas Akhir Semester — Praktikum Visualisasi Data
Kelompok 1 | Kelas C | 2026
