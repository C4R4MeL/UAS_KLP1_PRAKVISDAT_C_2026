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

### Visualisasi 1 — Radar Chart: Profil Tipe Founder
**Fungsi**: `renderRadarChart(data)`
**Container**: `#radar-chart`

Menampilkan **radar chart (spider chart)** yang membandingkan profil metrik kesehatan mental antar tipe kepribadian founder.

| Atribut | Detail |
|---|---|
| **Sumbu radar** | Skor Stres, Kelelahan Keputusan, Tekanan Investor, Konflik Co-founder, Keseimbangan Hidup, Burnout |
| **Warna** | Setiap tipe founder memiliki warna unik |
| **Interaktivitas** | Klik legenda untuk toggle tampilan per tipe founder |
| **Tooltip** | Nilai rata-rata tiap metrik saat hover |

**Insight yang ditampilkan**: Tipe founder dengan burnout tertinggi dan terendah secara otomatis diidentifikasi.

**8 Tipe Founder**:
- Burned-Out Operator, Calm Operator, Chaotic Innovator
- Growth Obsessed Founder, Serial Entrepreneur, Solo Hustler
- Technical Builder, Visionary CEO

---

### Visualisasi 2 — Donut Chart: Efektivitas Bantuan Kesehatan Mental
**Fungsi**: `renderDonutChart(data)`
**Container**: `#mental-health-chart`

Menampilkan **donut chart** yang memvisualisasikan perbandingan distribusi tingkat burnout antara founder yang mencari bantuan kesehatan mental (`Seeks_Mental_Health_Support = Yes`) vs yang tidak (`No`).

| Atribut | Detail |
|---|---|
| **Segmen** | Low / Medium / High burnout level |
| **Warna** | Hijau (Low), Kuning (Medium), Merah (High) |
| **Interaktivitas** | Toggle antara kelompok "Mencari Bantuan" dan "Tidak Mencari Bantuan" |
| **Tooltip** | Jumlah dan persentase per segmen |

**Insight yang ditampilkan**: Perbandingan persentase burnout High antara dua kelompok untuk mengevaluasi efektivitas dukungan mental.

---

### Visualisasi 3 — Grouped Bar Chart: Risiko Kegagalan per Industri
**Fungsi**: `renderGroupedBarChart(data)`
**Container**: `#industry-risk-chart`

Menampilkan **grouped bar chart** yang membandingkan rata-rata probabilitas shutdown (risiko kegagalan startup) antar sektor industri, dikelompokkan berdasarkan tingkat pendanaan.

| Atribut | Detail |
|---|---|
| **Sumbu X** | Sektor industri (AI, FinTech, EdTech, dll.) |
| **Sumbu Y** | Rata-rata probabilitas shutdown (0–1) |
| **Grup bar** | Funding Level: Low / Medium / High |
| **Warna** | Biru (Low), Ungu (Medium), Merah muda (High) |
| **Tooltip** | Nilai rata-rata probabilitas shutdown per grup |

**Insight yang ditampilkan**: Industri dengan rata-rata risiko tertinggi dan terendah secara otomatis diidentifikasi.

---

### Visualisasi 4 — Scatter Plot: Jam Kerja vs Skor Burnout
**Fungsi**: `renderScatterPlot(data)`
**Container**: `#workhours-burnout-chart`

Menampilkan **scatter plot** hubungan antara jam kerja mingguan dan skor burnout founder. Setiap titik mewakili satu founder (sampling maksimal 800 titik untuk performa).

| Atribut | Detail |
|---|---|
| **Sumbu X** | Jam kerja mingguan (`weekly_work_hours`) |
| **Sumbu Y** | Skor burnout (`burnout_score`) |
| **Warna titik** | Hijau (Low burnout), Kuning (Medium), Merah (High) |
| **Garis referensi** | Garis rata-rata jam kerja dan garis rata-rata burnout |
| **Tooltip** | Jam kerja, skor burnout, level burnout, analisis kontekstual |

**Metode Korelasi**: Dihitung secara real-time menggunakan **Koefisien Pearson** dari keseluruhan data terfilter.

**Insight yang ditampilkan**: Kategori korelasi (lemah/sedang/kuat) dan persentase founder extreme workload (≥60 jam/minggu) yang mengalami burnout tinggi.

---

### Visualisasi 5 — Heatmap: Matriks Korelasi Pearson
**Fungsi**: `renderHeatmap(data)`
**Container**: `#correlation-heatmap`

Menampilkan **correlation heatmap** berukuran 8×8 yang menunjukkan kekuatan hubungan antar 8 variabel numerik kunci.

| Atribut | Detail |
|---|---|
| **Variabel** | Jam Kerja Mingguan, Jam Tidur, Skor Stres, Kelelahan Keputusan, Tekanan Investor, Konflik Co-founder, Keseimbangan Hidup, Skor Burnout |
| **Skala warna** | Merah tua (−1.0) → Hitam (0) → Biru tua (+1.0) |
| **Diagonal** | Selalu bernilai 1.0 (korelasi variabel dengan dirinya sendiri) |
| **Tooltip** | Nilai `r` eksak dan interpretasi korelasi |

**Metode Perhitungan**: Koefisien Korelasi Pearson dihitung langsung di browser JavaScript:

```
r = Σ[(xi − x̄)(yi − ȳ)] / [(n−1) × sd_x × sd_y]
```

**Skala Interpretasi**:
| Nilai r | Interpretasi |
|---|---|
| 0.7 – 1.0 | Korelasi positif kuat |
| 0.4 – 0.7 | Korelasi positif sedang |
| 0.1 – 0.4 | Korelasi positif lemah |
| -0.1 – 0.1 | Tidak ada korelasi |
| −0.4 – −0.1 | Korelasi negatif lemah |
| −0.7 – −0.4 | Korelasi negatif sedang |
| −1.0 – −0.7 | Korelasi negatif kuat |

**Catatan Outlier**: Variabel `weekly_work_hours` (180 outlier, 0.36%) dan `sleep_hours` (160 outlier, 0.32%) memiliki outlier kecil yang tidak signifikan mempengaruhi nilai korelasi karena jumlahnya <0.4% dari 50.000 data.

**Insight yang ditampilkan**: Pasangan variabel dengan korelasi absolut terkuat secara otomatis diidentifikasi.

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
