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
| Kolom Setelah Preprocessing | 32 kolom (+3 hasil feature engineering) |

---

## ⚙️ Preprocessing Data

Preprocessing dilakukan di `preprocessing.ipynb` dengan alur:

```
Dataset Mentah (29 kolom)
    ↓  Rename PascalCase → snake_case
    ↓  Normalisasi burnout_level (Moderate→Medium, Severe→High)
    ↓  Cek Missing Values → tidak ada
    ↓  Cek Duplikat → tidak ada
    ↓  Cek Outlier (IQR) → hanya pada weekly_work_hours & sleep_hours (< 0.4%)
    ↓  Feature Engineering (+3 kolom: funding_level, startup_size_category, funding_amount)
Dataset Clean (32 kolom)
```

### Kolom Hasil Feature Engineering

| Kolom Baru | Sumber | Keterangan |
|---|---|---|
| `funding_level` | `funding_stage` | Low (Bootstrapped/Pre-Seed), Medium (Seed/Series A), High (Series B/C) |
| `startup_size_category` | `team_size` | Small (≤10), Medium (11-50), Large (>50) |
| `funding_amount` | `funding_stage` | Estimasi nominal pendanaan (simulasi berdasarkan tahap) |

---

## 🎛️ Fitur Dashboard

### Filter Global
- **Mode Kerja**: Remote / Hybrid / On-site / Semua
- **Iklim Ekonomi**: Bull Market / Stable Economy / Recession / Funding Winter / Semua

Semua visualisasi diperbarui secara otomatis ketika filter diubah.

### KPI Cards
6 kartu metrik ringkas yang selalu diperbarui sesuai filter:
1. **Total Founder** — jumlah data aktif
2. **Rata-rata Burnout Score** — rata-rata skor kejenuhan (0–10)
3. **Tingkat Kritis** — persentase founder dengan burnout > 6.5
4. **Tingkat Kegagalan** — persentase startup yang gagal
5. **Rata-rata Jam Tidur** — jam tidur harian rata-rata
6. **Mencari Bantuan Mental** — persentase founder yang mencari dukungan kesehatan mental

---

## 📈 Penjelasan Visualisasi

Berikut adalah penjelasan mengenai kelima visualisasi yang digunakan dalam dashboard interaktif ini. Setiap visualisasi dirancang untuk menjawab pertanyaan analitis spesifik terkait fenomena burnout pada founder startup.

---

### Visualisasi 1 — Radar Chart: Profil Kesehatan Mental Berdasarkan Tipe Founder

**Tujuan Analisis**: Membandingkan profil kesehatan mental secara multidimensional antar delapan tipe kepribadian founder, sehingga dapat diidentifikasi kelompok mana yang paling rentan terhadap burnout.

**Alasan Pemilihan Jenis Grafik**: Radar chart (spider chart) dipilih karena mampu menampilkan perbandingan beberapa variabel secara simultan dalam satu bidang visual. Bentuk poligon yang dihasilkan memungkinkan pembaca menilai secara intuitif seberapa "besar" atau "kecil" profil risiko suatu tipe founder dibandingkan tipe lainnya.

**Variabel yang Digunakan**:
Enam dimensi metrik kesehatan mental digunakan sebagai sumbu radar, yaitu: Skor Stres, Kelelahan Keputusan (Decision Fatigue), Tekanan Investor, Konflik Co-founder, Keseimbangan Hidup (Work-Life Balance), dan Skor Burnout. Nilai yang ditampilkan pada setiap sumbu merupakan rata-rata dari seluruh data pada tipe founder tersebut.

**Delapan Tipe Founder yang Dianalisis**: Burned-Out Operator, Calm Operator, Chaotic Innovator, Growth Obsessed Founder, Serial Entrepreneur, Solo Hustler, Technical Builder, dan Visionary CEO.

**Fitur Interaktivitas**: Pengguna dapat mengklik legenda untuk menyembunyikan atau menampilkan kembali tipe founder tertentu, sehingga perbandingan antar kelompok tertentu menjadi lebih jelas. Ketika kursor diarahkan ke titik-titik data pada poligon, tooltip akan menampilkan nilai rata-rata metrik yang bersangkutan.

**Temuan Utama**: Dashboard secara otomatis mengidentifikasi tipe founder dengan skor burnout rata-rata tertinggi dan terendah, memberikan gambaran langsung mengenai kelompok yang paling membutuhkan perhatian.

---

### Visualisasi 2 — Donut Chart: Efektivitas Dukungan Kesehatan Mental terhadap Tingkat Burnout

**Tujuan Analisis**: Mengevaluasi apakah terdapat perbedaan distribusi tingkat burnout antara founder yang mencari dukungan kesehatan mental (Seeks Mental Health Support = Yes) dengan yang tidak (No).

**Alasan Pemilihan Jenis Grafik**: Donut chart dipilih karena cocok untuk menampilkan komposisi proporsi dari keseluruhan data. Dengan membandingkan dua donut chart (kelompok yang mencari bantuan vs yang tidak), perbedaan distribusi dapat terlihat secara visual. Penggunaan warna yang kontras (hijau untuk burnout rendah, kuning untuk sedang, merah untuk tinggi) memperkuat pembacaan data tanpa perlu menelaah angka secara detail.

**Variabel yang Digunakan**:
Data dikelompokkan berdasarkan variabel `seeks_mental_health_support` (Yes/No), kemudian dalam masing-masing kelompok dihitung distribusi `burnout_level` yang terdiri atas tiga kategori: Low, Medium, dan High.

**Fitur Interaktivitas**: Pengguna dapat beralih antara tampilan kelompok "Mencari Bantuan" dan "Tidak Mencari Bantuan" melalui tombol toggle. Tooltip menampilkan jumlah absolut dan persentase untuk setiap segmen burnout level saat kursor diarahkan ke area tertentu.

**Temuan Utama**: Insight di bawah grafik secara otomatis menghitung dan membandingkan persentase founder dengan burnout tinggi (High) dari kedua kelompok, sehingga efektivitas dukungan kesehatan mental dapat dinilai secara kuantitatif.

---

### Visualisasi 3 — Grouped Bar Chart: Rata-rata Risiko Kegagalan Startup per Industri dan Tingkat Pendanaan

**Tujuan Analisis**: Mengidentifikasi sektor industri mana yang memiliki risiko kegagalan startup tertinggi, sekaligus mengamati apakah tingkat pendanaan (funding level) berpengaruh terhadap risiko tersebut.

**Alasan Pemilihan Jenis Grafik**: Grouped bar chart dipilih karena memungkinkan perbandingan dua dimensi secara bersamaan — yaitu antar industri (pada sumbu horizontal) dan antar tingkat pendanaan (melalui pengelompokan bar). Jenis visualisasi ini efektif untuk menganalisis pengaruh dua variabel kategorikal terhadap satu variabel numerik.

**Variabel yang Digunakan**:
- **Sumbu horizontal**: Sektor industri startup (AI, FinTech, E-commerce, Biotech, EdTech, HealthTech, Cybersecurity, Gaming, ClimateTech, dan lainnya).
- **Sumbu vertikal**: Rata-rata probabilitas shutdown (skala 0–1), yang merupakan estimasi kemungkinan startup mengalami kegagalan.
- **Pengelompokan bar**: Berdasarkan funding level yang terdiri dari tiga kategori — Low (Bootstrapped, Pre-Seed), Medium (Seed, Series A), dan High (Series B, Series C).

**Fitur Interaktivitas**: Tooltip muncul saat kursor diarahkan ke masing-masing bar, menampilkan nama industri, tingkat pendanaan, dan nilai rata-rata probabilitas shutdown secara presisi.

**Temuan Utama**: Dashboard secara otomatis menampilkan industri dengan rata-rata risiko kegagalan tertinggi dan terendah di bagian insight, sehingga pembaca dapat langsung mengidentifikasi sektor yang paling berisiko.

---

### Visualisasi 4 — Scatter Plot: Hubungan Jam Kerja Mingguan dan Skor Burnout

**Tujuan Analisis**: Mengeksplorasi hubungan antara intensitas jam kerja mingguan founder dengan tingkat kejenuhan (burnout score), serta mengukur kekuatan korelasi secara statistik.

**Alasan Pemilihan Jenis Grafik**: Scatter plot dipilih karena merupakan jenis visualisasi paling tepat untuk mengamati hubungan (korelasi) antara dua variabel numerik kontinu. Distribusi titik-titik data menunjukkan pola, kecenderungan, dan sebaran hubungan antara kedua variabel secara langsung.

**Variabel yang Digunakan**:
- **Sumbu horizontal**: Jam kerja mingguan (weekly_work_hours), yang merepresentasikan beban kerja founder.
- **Sumbu vertikal**: Skor burnout (burnout_score, skala 0–10), yang mengukur tingkat kejenuhan.
- **Pewarnaan titik**: Setiap titik diwarnai berdasarkan burnout_level — hijau (Low), kuning (Medium), dan merah (High) — untuk memperkuat visualisasi distribusi risiko.

Untuk menjaga performa rendering, diterapkan teknik stratified sampling yang mengambil maksimal 800 titik data dengan proporsi yang representatif dari setiap tingkat burnout.

**Garis Referensi**: Dua garis putus-putus ditampilkan sebagai acuan visual — garis vertikal menunjukkan rata-rata jam kerja dan garis horizontal menunjukkan rata-rata skor burnout. Garis-garis ini membagi area chart menjadi empat kuadran yang membantu identifikasi kelompok berisiko tinggi (jam kerja tinggi dan burnout tinggi, kuadran kanan atas).

**Metode Korelasi**: Koefisien Korelasi Pearson (*r*) dihitung secara real-time dari seluruh data yang terfilter (bukan dari sample), menggunakan rumus:

> *r* = Σ[(xᵢ − x̄)(yᵢ − ȳ)] / [(n−1) × SD_x × SD_y]

Hasil korelasi dikategorikan menjadi tiga tingkat: korelasi positif lemah (*r* < 0.25), sedang (0.25 ≤ *r* ≤ 0.45), atau kuat (*r* > 0.45).

**Fitur Interaktivitas**: Saat kursor diarahkan ke setiap titik, tooltip menampilkan jam kerja, skor burnout, tingkat burnout, serta analisis kontekstual berupa perbandingan nilai burnout founder tersebut dengan rata-rata keseluruhan.

**Temuan Utama**: Insight di bawah grafik menampilkan kategori korelasi yang ditemukan serta persentase founder dengan beban kerja ekstrem (≥60 jam/minggu) yang mengalami burnout tinggi, memberikan bukti kuantitatif mengenai dampak *overwork* terhadap kesehatan mental.

---

### Visualisasi 5 — Heatmap: Matriks Korelasi Pearson Antar Variabel Numerik

**Tujuan Analisis**: Mengidentifikasi kekuatan dan arah hubungan linear antar delapan variabel numerik kunci dalam dataset secara menyeluruh, sehingga faktor-faktor pemicu burnout yang saling berkaitan dapat dikenali.

**Alasan Pemilihan Jenis Grafik**: Correlation heatmap dipilih karena mampu menyajikan matriks korelasi berukuran 8×8 (64 pasangan) dalam satu tampilan yang ringkas dan mudah dipahami. Penggunaan gradasi warna memungkinkan pembaca menangkap pola hubungan secara sekilas tanpa harus membaca satu per satu nilai koefisien.

**Variabel yang Dianalisis (8 variabel)**:
Jam Kerja Mingguan, Jam Tidur Harian, Skor Stres, Kelelahan Keputusan, Tekanan Investor, Konflik Co-founder, Keseimbangan Hidup, dan Skor Burnout.

**Metode Perhitungan**: Koefisien Korelasi Pearson (*r*) dihitung untuk setiap pasangan variabel secara langsung di sisi klien (browser) menggunakan rumus standar:

> *r* = Σ[(xᵢ − x̄)(yᵢ − ȳ)] / [(n−1) × SD_x × SD_y]

Perhitungan dilakukan ulang secara otomatis setiap kali filter dashboard berubah, sehingga nilai korelasi selalu mencerminkan subset data yang sedang ditampilkan.

**Skala Warna**: Heatmap menggunakan skala warna divergen tiga titik — merah tua untuk korelasi negatif kuat (−1.0), hitam untuk tidak ada korelasi (0), dan biru tua untuk korelasi positif kuat (+1.0). Diagonal matriks selalu bernilai 1.0 karena setiap variabel berkorelasi sempurna dengan dirinya sendiri.

**Interpretasi Nilai Korelasi**:

| Rentang Nilai *r* | Interpretasi |
|---|---|
| 0.7 sampai 1.0 | Korelasi positif kuat |
| 0.4 sampai 0.7 | Korelasi positif sedang |
| 0.1 sampai 0.4 | Korelasi positif lemah |
| −0.1 sampai 0.1 | Tidak ada korelasi signifikan |
| −0.4 sampai −0.1 | Korelasi negatif lemah |
| −0.7 sampai −0.4 | Korelasi negatif sedang |
| −1.0 sampai −0.7 | Korelasi negatif kuat |

**Pengaruh Outlier terhadap Korelasi**: Dari hasil analisis outlier pada tahap preprocessing, ditemukan bahwa variabel weekly_work_hours memiliki 180 outlier (0,36%) dan sleep_hours memiliki 160 outlier (0,32%). Outlier tersebut tidak dihapus karena secara kontekstual valid (menggambarkan founder yang bekerja secara ekstrem) dan dengan jumlah data sebesar 50.000, pengaruhnya terhadap nilai koefisien korelasi Pearson sangat kecil — tidak cukup signifikan untuk mengubah interpretasi hubungan antar variabel.

**Fitur Interaktivitas**: Ketika kursor diarahkan ke setiap sel pada matriks, tooltip menampilkan nama kedua variabel, nilai koefisien korelasi eksak, serta interpretasi korelasi (kuat/sedang/lemah/positif/negatif) dalam format yang mudah dipahami.

**Temuan Utama**: Dashboard secara otomatis mengidentifikasi pasangan variabel dengan korelasi absolut terkuat (di luar korelasi mandiri pada diagonal), memberikan petunjuk langsung mengenai faktor-faktor yang paling erat berkaitan satu sama lain dalam konteks burnout founder startup.

---

## 🔍 Analisis Data Hasil Visualisasi

Analisis data berikut didasarkan pada visualisasi yang disajikan dalam dashboard interaktif, menggunakan data dari 50.000 founder startup yang telah diproses.

### 1. Analisis Deskriptif Umum
Dari keseluruhan dataset yang dianalisis, rata-rata skor burnout founder berada pada angka **3,44 dari skala 10**, menunjukkan bahwa mayoritas founder berada pada tingkat kejenuhan rendah hingga sedang. Namun, terdapat **5.210 founder (10,4%)** yang berada dalam kategori burnout kritis (skor di atas 6,5). Di sisi bisnis, sebanyak **11.867 startup (23,7%)** tercatat mengalami kegagalan (shutdown). Dari aspek kesehatan fisik, rata-rata jam tidur founder hanya mencapai **5,69 jam per hari**, yang berada di bawah standar kesehatan umum. Hanya **27,3%** founder yang secara aktif mencari dukungan kesehatan mental.

### 2. Analisis Profil Kesehatan Mental Berdasarkan Tipe Founder (Visualisasi 1)
Analisis radar chart terhadap profil delapan tipe founder menunjukkan pola kerentanan yang berbeda:
- **Burned-Out Operator** memiliki skor burnout rata-rata tertinggi (**5,00**), dengan rata-rata skor stres mencapai 5,54 dan tekanan investor sebesar 6,20. Poligon radar untuk tipe ini memiliki luas area terbesar, menunjukkan akumulasi tekanan di seluruh dimensi kesehatan mental.
- **Calm Operator** merupakan tipe yang paling resilien dengan skor burnout rata-rata terendah (**1,38**) dan skor keseimbangan hidup tertinggi (**9,33**). Meskipun memiliki tekanan investor yang tetap tinggi (6,22), mereka mampu meminimalkan skor stres (2,61) dan konflik co-founder (1,83).
- **Solo Hustler** dan **Growth Obsessed Founder** menempati posisi risiko tertinggi kedua dan ketiga dengan skor rata-rata masing-masing **4,38** dan **4,35**, yang menunjukkan tingginya kerentanan psikologis pada pendiri tunggal atau pendiri yang fokus pada pertumbuhan eksponensial.

### 3. Analisis Efektivitas Dukungan Kesehatan Mental (Visualisasi 2)
Perbandingan proporsi burnout berdasarkan pencarian dukungan kesehatan mental menunjukkan temuan berikut:
- Founder yang **mencari bantuan kesehatan mental** memiliki proporsi burnout tingkat tinggi (High) sebesar **18,9%**, jauh lebih tinggi dibandingkan kelompok yang tidak mencari bantuan (**7,7%**).
- Pada kelompok yang **tidak mencari bantuan**, proporsi burnout tingkat rendah (Low) mendominasi sebesar **60,0%**, sedangkan pada kelompok yang mencari bantuan hanya **44,7%**.
- Perbedaan distribusi ini mengindikasikan adanya efek *selection bias* (bias seleksi), di mana founder yang kondisi burnout-nya sudah parah memiliki kecenderungan lebih tinggi untuk mencari bantuan medis/psikologis.

### 4. Analisis Risiko Kegagalan Startup per Industri dan Pendanaan (Visualisasi 3)
Analisis grouped bar chart mengungkapkan variasi risiko shutdown berdasarkan industri dan pengaruh pendanaan:
- Industri **ClimateTech** mencatat rata-rata probabilitas shutdown tertinggi (**0,396**), disusul oleh industri SaaS (**0,391**) dan Cybersecurity (**0,391**).
- Industri **AI** memiliki rata-rata probabilitas shutdown terendah (**0,377**).
- Pola hubungan tingkat pendanaan (funding level) terhadap risiko kegagalan terlihat konsisten di seluruh industri. Sebagai contoh, pada industri ClimateTech: pendanaan rendah (*Low*) memiliki risiko kegagalan **0,413**, pendanaan sedang (*Medium*) sebesar **0,399**, dan pendanaan tinggi (*High*) menurun menjadi **0,349**. Ini membuktikan secara empiris bahwa ketersediaan modal yang memadai menurunkan tingkat risiko kegagalan usaha.

### 5. Analisis Hubungan Jam Kerja dan Skor Burnout (Visualisasi 4)
Hasil sebaran scatter plot mengonfirmasi adanya hubungan linier yang kuat antara beban kerja dan kejenuhan founder:
- Koefisien korelasi Pearson antara variabel jam kerja mingguan (`weekly_work_hours`) dan skor burnout (`burnout_score`) bernilai **r = 0,577**, yang menunjukkan **korelasi positif kuat**.
- Rata-rata jam kerja mingguan founder bernilai **63,70 jam**, sangat jauh di atas batas standar kerja normal (40 jam per minggu).
- Sebanyak **30.502 founder (61,0%)** bekerja secara ekstrem dengan durasi 60 jam atau lebih per minggu. Dari kelompok pekerja ekstrem tersebut, **16,3%** di antaranya mengalami tingkat burnout tinggi (High).

### 6. Analisis Korelasi Hubungan Antar Variabel (Visualisasi 5)
Matriks korelasi 8×8 pada heatmap memperlihatkan hubungan linear antar variabel numerik sebagai berikut:
- **Korelasi Negatif Terkuat**: Terjadi antara Keseimbangan Hidup (`work_life_balance`) dan Skor Burnout (`burnout_score`) sebesar **r = −0,923**. Hal ini menunjukkan bahwa penurunan kualitas keseimbangan hidup berbanding lurus dengan peningkatan risiko burnout secara hampir sempurna.
- **Korelasi Positif Terkuat**: Terjadi antara Kelelahan Keputusan (`decision_fatigue`) dan Skor Burnout (`burnout_score`) sebesar **r = 0,823**, memosisikan beban mental dalam pengambilan keputusan sebagai pemicu utama kejenuhan founder.
- **Skor Stres (`stress_score`)**: Bertindak sebagai variabel penghubung utama, dengan korelasi positif kuat terhadap kelelahan keputusan (r = 0,761), jam kerja mingguan (r = 0,742), skor burnout (r = 0,735), dan korelasi negatif kuat terhadap keseimbangan hidup (r = −0,751).

---

## 💡 Insight yang Diperoleh

Dari hasil analisis data di atas, dapat ditarik beberapa insight strategis mengenai fenomena burnout dan kegagalan pada startup:

1. **Rantai Kausalitas Burnout**:
   Visualisasi data mengungkap rantai hubungan sebab-akibat yang jelas:
   $$\text{Jam Kerja Ekstrem } (\ge 60 \text{ jam/minggu}) \rightarrow \text{Peningkatan Skor Stres} \rightarrow \text{Kelelahan Keputusan} \rightarrow \text{Kerusakan Keseimbangan Hidup} \rightarrow \text{Burnout Tinggi}$$
2. **Keseimbangan Hidup sebagai Faktor Protektif**:
   Dengan korelasi negatif $r = -0,923$ terhadap burnout, perbaikan kualitas keseimbangan hidup (seperti jam tidur yang cukup dan pembatasan jam kerja) merupakan langkah preventif paling efektif untuk mereduksi tingkat burnout founder.
3. **Kerentanan Berbasis Profil Kepribadian**:
   Tipe founder seperti *Burned-Out Operator* dan *Solo Hustler* memerlukan intervensi kesehatan mental lebih dini karena memiliki kecenderungan menanggung akumulasi stres yang lebih besar dibandingkan tipe *Calm Operator*.
4. **Peran Pendanaan Terhadap Keberlangsungan Usaha**:
   Meskipun tidak secara langsung mengurangi stres founder, pendanaan tingkat tinggi (*High Funding*) terbukti secara signifikan menurunkan probabilitas kegagalan startup di seluruh sektor industri.
5. **Kesenjangan Pencarian Bantuan**:
   Tingginya proporsi burnout (18,9%) pada founder yang mencari bantuan kesehatan mental mencerminkan bahwa penanganan kesehatan mental di ekosistem startup cenderung bersifat reaktif (dilakukan setelah burnout parah terjadi) daripada preventif.

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
