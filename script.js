// FontMatch AI - File JavaScript Utama (Bahasa Indonesia)
document.addEventListener('DOMContentLoaded', function() {
    // ========== VARIABEL GLOBAL ==========
    const API_KEY = ''; // Isi dengan API key DeepSeek kamu
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    
    let temaSekarang = 'light';
    let warnaTerpilih = ['#2563eb'];
    let favorit = JSON.parse(localStorage.getItem('fontmatch_favorites')) || [];
    let hasilSekarang = [];

    // ========== ELEMEN DOM ==========
    // Elemen Form
    const pilihFontUtama = document.getElementById('primaryFont');
    const inputFontKustom = document.getElementById('customFont');
    const tipeWebsiteTerpilih = document.getElementById('selectedWebsiteType');
    const suasanaTerpilih = document.getElementById('selectedMood');
    const inputWarnaUtama = document.getElementById('primaryColor');
    const nilaiWarnaSpan = document.getElementById('colorValue');
    const paletteWarna = document.getElementById('colorPalette');
    const tombolTambahWarna = document.getElementById('addColorBtn');
    
    // Elemen Tombol
    const tombolHasilkan = document.getElementById('generateBtn');
    const tombolAcak = document.getElementById('randomBtn');
    const tombolDemo = document.getElementById('demoBtn');
    const tombolHapus = document.getElementById('clearBtn');
    const tombolSalin = document.getElementById('copyBtn');
    const tombolTampilkanFavorit = document.getElementById('showFavoritesBtn');
    
    // Elemen Preview
    const teksPreview = document.getElementById('previewText');
    const inputUkuranFont = document.getElementById('fontSize');
    const nilaiUkuranSpan = document.getElementById('sizeValue');
    const hasilPreview = document.getElementById('previewResult');
    
    // Elemen Hasil
    const loadingDiv = document.getElementById('loading');
    const containerHasil = document.getElementById('resultsContainer');
    const kodeCSS = document.getElementById('cssCode');
    
    // Elemen Modal
    const modalFavorit = document.getElementById('favoritesModal');
    const containerFavorit = document.getElementById('favoritesContainer');
    const tombolTutupModal = document.querySelector('.modal-close');
    
    // Elemen Toast
    const toast = document.getElementById('toast');
    const pesanToast = document.getElementById('toastMessage');

    // ========== DATABASE FONT ==========
    const databaseFont = {
        'Poppins': {
            kategori: 'sans-serif',
            suasana: ['modern', 'professional', 'bersih', 'tech'],
            kombinasi: ['Inter', 'Roboto', 'Merriweather', 'Playfair Display'],
            deskripsi: 'Font sans-serif modern dengan bentuk geometris'
        },
        'Inter': {
            kategori: 'sans-serif',
            suasana: ['professional', 'minimal', 'bersih', 'tech'],
            kombinasi: ['Poppins', 'Roboto', 'Merriweather', 'Lato'],
            deskripsi: 'Font yang dirancang khusus untuk antarmuka digital'
        },
        'Montserrat': {
            kategori: 'sans-serif',
            suasana: ['modern', 'elegan', 'professional'],
            kombinasi: ['Open Sans', 'Lato', 'Playfair Display', 'Source Sans Pro'],
            deskripsi: 'Font geometric sans-serif terinspirasi poster vintage'
        },
        'Roboto': {
            kategori: 'sans-serif',
            suasana: ['modern', 'ramah', 'professional', 'tech'],
            kombinasi: ['Open Sans', 'Lato', 'Merriweather', 'Poppins'],
            deskripsi: 'Font default Android, sangat readable untuk layar'
        },
        'Nunito': {
            kategori: 'sans-serif',
            suasana: ['ramah', 'bersenang-senang', 'modern', 'bersih'],
            kombinasi: ['Poppins', 'Open Sans', 'Lato', 'Merriweather'],
            deskripsi: 'Font sans-serif dengan ujung membulat, friendly dan approachable'
        },
        'Open Sans': {
            kategori: 'sans-serif',
            suasana: ['ramah', 'professional', 'bersih', 'netral'],
            kombinasi: ['Roboto', 'Lato', 'Merriweather', 'Playfair Display'],
            deskripsi: 'Font humanist sans-serif yang sangat versatile'
        },
        'Lato': {
            kategori: 'sans-serif',
            suasana: ['professional', 'serius', 'korporat', 'bersih'],
            kombinasi: ['Open Sans', 'Roboto', 'Merriweather', 'Playfair Display'],
            deskripsi: 'Font sans-serif dengan warmth dan seriousness'
        },
        'Playfair Display': {
            kategori: 'serif',
            suasana: ['elegan', 'mewah', 'tradisional', 'kreatif'],
            kombinasi: ['Inter', 'Open Sans', 'Lato', 'Source Sans Pro'],
            deskripsi: 'Font serif yang elegan untuk heading dan display'
        },
        'Merriweather': {
            kategori: 'serif',
            suasana: ['tradisional', 'serius', 'readable', 'professional'],
            kombinasi: ['Open Sans', 'Roboto', 'Lato', 'Montserrat'],
            deskripsi: 'Font serif yang dirancang untuk readability di layar'
        },
        'Space Grotesk': {
            kategori: 'monospace',
            suasana: ['tech', 'modern', 'futuristik', 'geometris'],
            kombinasi: ['Inter', 'Roboto', 'Open Sans', 'Poppins'],
            deskripsi: 'Font monospace/sans-serif hybrid untuk tampilan tech dan futuristik'
        }
    };

    // ========== FUNGSI UTILITAS ==========
    function tampilkanToast(pesan, tipe = 'success') {
        pesanToast.textContent = pesan;
        toast.className = 'toast';
        toast.classList.add('show');
        
        if (tipe === 'error') {
            toast.style.borderLeftColor = 'var(--error-color)';
        } else if (tipe === 'warning') {
            toast.style.borderLeftColor = 'var(--warning-color)';
        } else {
            toast.style.borderLeftColor = 'var(--success-color)';
        }
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function salinKePapanKlip(teks) {
        navigator.clipboard.writeText(teks).then(() => {
            tampilkanToast('Kode CSS berhasil disalin!', 'success');
            tombolSalin.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
            tombolSalin.classList.add('copied');
            
            setTimeout(() => {
                tombolSalin.innerHTML = '<i class="far fa-copy"></i> Salin CSS';
                tombolSalin.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Gagal menyalin: ', err);
            tampilkanToast('Gagal menyalin kode', 'error');
        });
    }

    function dapatkanFontAcak() {
        const fonts = Object.keys(databaseFont);
        return fonts[Math.floor(Math.random() * fonts.length)];
    }

    function dapatkanSuasanaAcak() {
        const suasana = ['professional', 'modern', 'playful', 'elegant', 'friendly', 'tech'];
        return suasana[Math.floor(Math.random() * suasana.length)];
    }

    function dapatkanTipeWebsiteAcak() {
        const tipe = ['portfolio', 'ecommerce', 'blog', 'company', 'landing'];
        return tipe[Math.floor(Math.random() * tipe.length)];
    }

    // ========== PENANGANAN FORM ==========
    // Tombol Tipe Website
    document.querySelectorAll('.chip').forEach(tombol => {
        tombol.addEventListener('click', function() {
            document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            tipeWebsiteTerpilih.value = this.dataset.value;
        });
    });

    // Item Suasana
    document.querySelectorAll('.mood-card').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.mood-card').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            suasanaTerpilih.value = this.dataset.mood;
        });
    });

    // Pilih Warna
    inputWarnaUtama.addEventListener('input', function() {
        nilaiWarnaSpan.textContent = this.value;
    });

    // Tombol Tambah Warna
    tombolTambahWarna.addEventListener('click', function() {
        const warna = inputWarnaUtama.value;
        
        if (!warnaTerpilih.includes(warna) && warnaTerpilih.length < 5) {
            warnaTerpilih.push(warna);
            perbaruiPaletteWarna();
            tampilkanToast(`Warna ${warna} ditambahkan`, 'success');
        } else if (warnaTerpilih.length >= 5) {
            tampilkanToast('Maksimal 5 warna', 'warning');
        }
    });

    function perbaruiPaletteWarna() {
        paletteWarna.innerHTML = '';
        
        warnaTerpilih.forEach((warna, index) => {
            const chipWarna = document.createElement('div');
            chipWarna.className = 'color-chip';
            chipWarna.innerHTML = `
                <div class="color-preview" style="background-color: ${warna}"></div>
                <span>${warna}</span>
                <button class="remove-color" data-index="${index}">×</button>
            `;
            paletteWarna.appendChild(chipWarna);
        });

        // Tambah event listener untuk tombol hapus
        document.querySelectorAll('.remove-color').forEach(tombol => {
            tombol.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                warnaTerpilih.splice(index, 1);
                perbaruiPaletteWarna();
                tampilkanToast('Warna dihapus', 'success');
            });
        });
    }

    // ========== FUNGSI PREVIEW ==========
    inputUkuranFont.addEventListener('input', function() {
        const ukuran = this.value + 'px';
        nilaiUkuranSpan.textContent = ukuran;
        
        // Perbarui ukuran teks preview
        const kartuPreview = hasilPreview.querySelector('.preview-card');
        if (kartuPreview) {
            kartuPreview.style.fontSize = ukuran;
        }
    });

    teksPreview.addEventListener('input', function() {
        perbaruiPreview();
    });

    function perbaruiPreview(kombinasiFont = null) {
        const kartuPreview = hasilPreview.querySelector('.preview-card');
        if (!kartuPreview) return;

        const teks = teksPreview.value || 'Selamat datang di website kami. Ini adalah contoh heading diikuti teks body untuk mendemonstrasikan kombinasi font dalam aksi.';
        const baris = teks.split('\n');
        
        let heading = baris[0] || 'Selamat Datang di Platform Kami';
        let body = baris.slice(1).join('\n') || 'Ini adalah contoh teks body untuk menunjukkan bagaimana kombinasi font pilihan Anda akan terlihat. Tipografi yang baik meningkatkan keterbacaan dan menciptakan pengalaman pengguna yang lebih baik.';
        
        if (kombinasiFont) {
            kartuPreview.innerHTML = `
                <h3 class="preview-heading" style="font-family: '${kombinasiFont.heading}', sans-serif; font-size: ${inputUkuranFont.value}px;">
                    ${heading}
                </h3>
                <p class="preview-body" style="font-family: '${kombinasiFont.body}', sans-serif; font-size: ${inputUkuranFont.value}px;">
                    ${body}
                </p>
                <div class="preview-actions">
                    <button class="preview-button primary" style="font-family: '${kombinasiFont.button || kombinasiFont.heading}', sans-serif; font-size: ${parseInt(inputUkuranFont.value) - 2}px;">
                        Mulai Sekarang
                    </button>
                    <button class="preview-button secondary" style="font-family: '${kombinasiFont.body}', sans-serif; font-size: ${parseInt(inputUkuranFont.value) - 2}px;">
                        Pelajari Lebih Lanjut
                    </button>
                </div>
            `;
        }
    }

    // ========== INTEGRASI AI ==========
    async function hasilkanKombinasiFontDenganAI(dataPengguna) {
        try {
            loadingDiv.classList.remove('hidden');
            containerHasil.innerHTML = '';
            
            // Jika tidak ada API key, gunakan fallback lokal
            if (!API_KEY) {
                tampilkanToast('Menggunakan database lokal (tambahkan API key untuk hasil lebih baik)', 'warning');
                await new Promise(resolve => setTimeout(resolve, 1000));
                return hasilkanKombinasiFontLokal(dataPengguna);
            }
            
            const prompt = `
Kamu adalah desainer tipografi ahli. Berikan rekomendasi kombinasi font untuk website dengan spesifikasi berikut:

FONT UTAMA: ${dataPengguna.primaryFont}
TIPE WEBSITE: ${dataPengguna.websiteType}
SUASANA/MOOD: ${dataPengguna.mood}
WARNA UTAMA: ${dataPengguna.colors.join(', ')}

Berikan 3 rekomendasi kombinasi font yang berbeda. Setiap kombinasi harus berisi:
1. FONT UNTUK HEADING: [nama font]
2. FONT UNTUK BODY TEXT: [nama font]
3. FONT UNTUK BUTTON/ACCENT (opsional): [nama font]
4. DESKRIPSI SINGKAT: Mengapa kombinasi ini cocok (maksimal 2 kalimat)
5. TINGKAT KECOCOKAN: 1-5 bintang
6. CONTOH CSS IMPLEMENTASI: Kode CSS untuk kombinasi ini

Format respons dalam JSON array:
[
  {
    "heading": "nama-font-heading",
    "body": "nama-font-body",
    "button": "nama-font-button",
    "description": "deskripsi singkat",
    "rating": 5,
    "css": "kode css contoh"
  }
]

Gunakan font yang umum tersedia di Google Fonts. Prioritaskan readability dan aesthetic yang sesuai dengan mood "${dataPengguna.mood}".
`;
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        {
                            role: "system",
                            content: "Kamu adalah asisten yang ahli dalam tipografi dan desain web. Berikan respons dalam format JSON saja."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error API: ${response.status}`);
            }
            
            const data = await response.json();
            const responsAI = data.choices[0].message.content;
            
            // Parse respons JSON
            let kombinasi;
            try {
                // Extract JSON dari respons
                const jsonMatch = responsAI.match(/\[.*\]/s);
                if (jsonMatch) {
                    kombinasi = JSON.parse(jsonMatch[0]);
                } else {
                    // Fallback ke generasi lokal
                    tampilkanToast('Format respons AI tidak valid, menggunakan database lokal', 'warning');
                    kombinasi = hasilkanKombinasiFontLokal(dataPengguna);
                }
            } catch (error) {
                console.error('Error parsing AI response:', error);
                kombinasi = hasilkanKombinasiFontLokal(dataPengguna);
            }
            
            return kombinasi;
            
        } catch (error) {
            console.error('AI Error:', error);
            tampilkanToast('Gagal menghubungi AI, menggunakan database lokal', 'error');
            return hasilkanKombinasiFontLokal(dataPengguna);
        } finally {
            loadingDiv.classList.add('hidden');
        }
    }

    function hasilkanKombinasiFontLokal(dataPengguna) {
        const fontUtama = dataPengguna.primaryFont;
        const suasana = dataPengguna.mood;
        
        const infoFont = databaseFont[fontUtama] || databaseFont['Inter'];
        const kemungkinanKombinasi = infoFont.kombinasi || ['Inter', 'Roboto', 'Open Sans'];
        
        // Hasilkan 3 kombinasi
        const kombinasi = [];
        const kombinasiTerpakai = new Set();
        
        for (let i = 0; i < 3; i++) {
            let fontBody;
            let percobaan = 0;
            
            // Cari kombinasi unik
            do {
                fontBody = kemungkinanKombinasi[Math.floor(Math.random() * kemungkinanKombinasi.length)];
                percobaan++;
                if (percobaan > 10) {
                    fontBody = 'Inter'; // Fallback
                    break;
                }
            } while (kombinasiTerpakai.has(fontBody) || fontBody === fontUtama);
            
            kombinasiTerpakai.add(fontBody);
            
            // Hasilkan deskripsi berdasarkan suasana
            const deskripsi = {
                professional: `Kombinasi yang profesional antara ${fontUtama} untuk heading dan ${fontBody} untuk body text. Cocok untuk website ${dataPengguna.websiteType}.`,
                modern: `Tampilan modern dan bersih dengan ${fontUtama} sebagai heading dan ${fontBody} sebagai body. Sangat cocok untuk ${dataPengguna.websiteType} yang contemporary.`,
                playful: `Kombinasi playful dan friendly dengan ${fontUtama} yang menarik perhatian dan ${fontBody} yang mudah dibaca.`,
                elegant: `Kesan elegan dan sophisticated dengan kombinasi ${fontUtama} dan ${fontBody}. Cocok untuk ${dataPengguna.websiteType} premium.`,
                friendly: `Kombinasi yang welcoming dan approachable. ${fontUtama} memberikan personality, ${fontBody} menjaga readability.`,
                tech: `Tech-forward pairing dengan ${fontUtama} dan ${fontBody}. Cocok untuk ${dataPengguna.websiteType} di industri teknologi.`
            };
            
            const deskripsiText = deskripsi[suasana] || `Kombinasi bagus antara ${fontUtama} dan ${fontBody} untuk ${dataPengguna.websiteType}.`;
            
            // Hasilkan CSS
            const css = `/* Kombinasi Font ${i + 1} */
:root {
    --font-heading: '${fontUtama}', sans-serif;
    --font-body: '${fontBody}', sans-serif;
    --font-accent: '${fontUtama}', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: 600;
    line-height: 1.3;
    color: ${dataPengguna.colors[0] || '#2563eb'};
}

body, p, li, span {
    font-family: var(--font-body);
    font-weight: 400;
    line-height: 1.6;
    color: #333;
}

button, .btn, .cta {
    font-family: var(--font-accent);
    font-weight: 500;
    letter-spacing: 0.5px;
}`;
            
            kombinasi.push({
                heading: fontUtama,
                body: fontBody,
                button: Math.random() > 0.5 ? fontUtama : fontBody,
                description: deskripsiText,
                rating: Math.floor(Math.random() * 2) + 4, // 4-5 bintang
                css: css
            });
        }
        
        return kombinasi;
    }

    // ========== TAMPILKAN HASIL ==========
    function tampilkanHasil(kombinasi) {
        hasilSekarang = kombinasi;
        containerHasil.innerHTML = '';
        
        if (!kombinasi || kombinasi.length === 0) {
            containerHasil.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h4>Tidak ada hasil ditemukan</h4>
                    <p>Coba gunakan font yang berbeda atau suasana yang lain.</p>
                </div>
            `;
            return;
        }
        
        // Perbarui jumlah hasil
        document.getElementById('resultsCount').textContent = `${kombinasi.length} kombinasi`;
        
        kombinasi.forEach((kombinasi, index) => {
            const kartuHasil = document.createElement('div');
            kartuHasil.className = 'font-result-item';
            kartuHasil.dataset.index = index;
            
            // Hasilkan rating bintang
            const bintang = '★'.repeat(kombinasi.rating) + '☆'.repeat(5 - kombinasi.rating);
            
            kartuHasil.innerHTML = `
                <div class="font-item-header">
                    <div class="font-item-names">
                        <span class="font-item-name">${kombinasi.heading} + ${kombinasi.body}</span>
                        <span class="font-item-role">Kombinasi ${index + 1}</span>
                    </div>
                    <div class="font-item-rating" title="Rating: ${kombinasi.rating}/5">
                        ${bintang}
                    </div>
                </div>
                <p class="font-item-description">${kombinasi.description}</p>
                <div class="font-item-preview">
                    <h4>Preview:</h4>
                    <p style="font-family: '${kombinasi.heading}', sans-serif; font-size: 18px; margin-bottom: 8px;">
                        Heading dengan ${kombinasi.heading}
                    </p>
                    <p style="font-family: '${kombinasi.body}', sans-serif; font-size: 14px;">
                        Body text dengan ${kombinasi.body} - readability yang baik untuk pengalaman pengguna.
                    </p>
                </div>
                <div class="css-example">${kombinasi.css}</div>
                <div class="font-item-actions">
                    <button class="action-btn primary terapkan-font-btn" data-index="${index}">
                        <i class="fas fa-paint-brush"></i> Terapkan ke Preview
                    </button>
                    <button class="action-btn gunakan-css-btn" data-index="${index}">
                        <i class="fas fa-code"></i> Gunakan CSS ini
                    </button>
                    <button class="action-btn simpan-favorit-btn" data-index="${index}">
                        <i class="far fa-heart"></i> Simpan Favorit
                    </button>
                </div>
            `;
            
            containerHasil.appendChild(kartuHasil);
        });
        
        // Tambah event listener ke tombol aksi
        document.querySelectorAll('.terapkan-font-btn').forEach(tombol => {
            tombol.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                terapkanKombinasiFont(kombinasi[index]);
            });
        });
        
        document.querySelectorAll('.gunakan-css-btn').forEach(tombol => {
            tombol.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                perbaruiKodeCSS(kombinasi[index].css);
            });
        });
        
        document.querySelectorAll('.simpan-favorit-btn').forEach(tombol => {
            tombol.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                simpanKeFavorit(kombinasi[index]);
            });
        });
    }

    function terapkanKombinasiFont(kombinasi) {
        perbaruiPreview(kombinasi);
        perbaruiKodeCSS(kombinasi.css);
        tampilkanToast(`Kombinasi font diterapkan: ${kombinasi.heading} + ${kombinasi.body}`, 'success');
        
        // Scroll ke bagian preview
        document.querySelector('.preview-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    function perbaruiKodeCSS(css) {
        kodeCSS.textContent = css;
    }

    // ========== MANAJEMEN FAVORIT ==========
    function simpanKeFavorit(kombinasi) {
        // Cek apakah sudah ada di favorit
        const sudahAda = favorit.some(fav => 
            fav.heading === kombinasi.heading && fav.body === kombinasi.body
        );
        
        if (sudahAda) {
            tampilkanToast('Kombinasi font sudah ada di favorit', 'warning');
            return;
        }
        
        favorit.push({
            ...kombinasi,
            disimpanPada: new Date().toISOString(),
            dataPengguna: {
                primaryFont: pilihFontUtama.value || inputFontKustom.value,
                websiteType: tipeWebsiteTerpilih.value,
                mood: suasanaTerpilih.value
            }
        });
        
        localStorage.setItem('fontmatch_favorites', JSON.stringify(favorit));
        tampilkanToast('Kombinasi font disimpan ke favorit!', 'success');
        perbaruiJumlahFavorit();
    }

    function tampilkanFavorit() {
        modalFavorit.classList.remove('hidden');
        containerFavorit.innerHTML = '';
        
        if (favorit.length === 0) {
            containerFavorit.innerHTML = `
                <div class="empty-favorites">
                    <i class="far fa-heart"></i>
                    <p>Belum ada favorit tersimpan</p>
                    <small>Simpan kombinasi font yang Anda sukai untuk mengaksesnya nanti</small>
                </div>
            `;
            return;
        }
        
        favorit.forEach((fav, index) => {
            const kartuFavorit = document.createElement('div');
            kartuFavorit.className = 'font-result-item';
            
            const bintang = '★'.repeat(fav.rating) + '☆'.repeat(5 - fav.rating);
            const tanggalSimpan = new Date(fav.disimpanPada).toLocaleDateString('id-ID');
            
            kartuFavorit.innerHTML = `
                <div class="font-item-header">
                    <div class="font-item-names">
                        <span class="font-item-name">${fav.heading} + ${fav.body}</span>
                        <span class="font-item-role">Disimpan: ${tanggalSimpan}</span>
                    </div>
                    <div class="font-item-rating">
                        ${bintang}
                    </div>
                </div>
                <p class="font-item-description">${fav.description}</p>
                <div class="font-item-actions">
                    <button class="action-btn primary gunakan-favorit-btn" data-index="${index}">
                        <i class="fas fa-play"></i> Gunakan Lagi
                    </button>
                    <button class="action-btn hapus-favorit-btn" data-index="${index}">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            `;
            
            containerFavorit.appendChild(kartuFavorit);
        });
        
        // Tambah event listener
        document.querySelectorAll('.gunakan-favorit-btn').forEach(tombol => {
            tombol.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                terapkanKombinasiFont(favorit[index]);
                modalFavorit.classList.add('hidden');
            });
        });
        
        document.querySelectorAll('.hapus-favorit-btn').forEach(tombol => {
            tombol.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                hapusFavorit(index);
            });
        });
    }

    function hapusFavorit(index) {
        if (confirm('Hapus kombinasi font ini dari favorit?')) {
            favorit.splice(index, 1);
            localStorage.setItem('fontmatch_favorites', JSON.stringify(favorit));
            tampilkanFavorit();
            perbaruiJumlahFavorit();
            tampilkanToast('Kombinasi font dihapus dari favorit', 'success');
        }
    }

    function perbaruiJumlahFavorit() {
        const jumlah = favorit.length;
        if (jumlah > 0) {
            tombolTampilkanFavorit.innerHTML = `<i class="fas fa-heart"></i> Favorit (${jumlah})`;
        } else {
            tombolTampilkanFavorit.innerHTML = `<i class="fas fa-heart"></i> Favorit`;
        }
    }

    // ========== EVENT LISTENER ==========
    tombolHasilkan.addEventListener('click', async function() {
        // Dapatkan input pengguna
        let fontUtama = pilihFontUtama.value;
        if (!fontUtama && inputFontKustom.value) {
            fontUtama = inputFontKustom.value;
        }
        
        if (!fontUtama) {
            tampilkanToast('Pilih atau ketik font utama terlebih dahulu', 'error');
            pilihFontUtama.focus();
            return;
        }
        
        const dataPengguna = {
            primaryFont: fontUtama,
            websiteType: tipeWebsiteTerpilih.value,
            mood: suasanaTerpilih.value,
            colors: warnaTerpilih
        };
        
        // Hasilkan kombinasi font
        const kombinasi = await hasilkanKombinasiFontDenganAI(dataPengguna);
        
        // Tampilkan hasil
        tampilkanHasil(kombinasi);
        
        // Scroll ke hasil
        containerHasil.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        tampilkanToast('Kombinasi font berhasil dihasilkan!', 'success');
    });

    tombolAcak.addEventListener('click', function() {
        // Set nilai acak
        const fontAcak = dapatkanFontAcak();
        const suasanaAcak = dapatkanSuasanaAcak();
        const tipeAcak = dapatkanTipeWebsiteAcak();
        
        // Perbarui form
        pilihFontUtama.value = fontAcak;
        tipeWebsiteTerpilih.value = tipeAcak;
        suasanaTerpilih.value = suasanaAcak;
        
        // Perbarui UI
        document.querySelectorAll('.chip').forEach(tombol => {
            tombol.classList.remove('active');
            if (tombol.dataset.value === tipeAcak) {
                tombol.classList.add('active');
            }
        });
        
        document.querySelectorAll('.mood-card').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.mood === suasanaAcak) {
                item.classList.add('active');
            }
        });
        
        // Hasilkan warna acak
        const warnaAcak = '#' + Math.floor(Math.random()*16777215).toString(16);
        warnaTerpilih = [warnaAcak];
        inputWarnaUtama.value = warnaAcak;
        nilaiWarnaSpan.textContent = warnaAcak;
        perbaruiPaletteWarna();
        
        tampilkanToast('Pengaturan acak diterapkan! Klik Hasilkan untuk hasil', 'success');
    });

    tombolDemo.addEventListener('click', function() {
        // Set nilai demo
        pilihFontUtama.value = 'Poppins';
        tipeWebsiteTerpilih.value = 'portfolio';
        suasanaTerpilih.value = 'modern';
        
        // Perbarui UI
        document.querySelectorAll('.chip').forEach(tombol => {
            tombol.classList.remove('active');
            if (tombol.dataset.value === 'portfolio') {
                tombol.classList.add('active');
            }
        });
        
        document.querySelectorAll('.mood-card').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.mood === 'modern') {
                item.classList.add('active');
            }
        });
        
        warnaTerpilih = ['#2563eb', '#7c3aed'];
        perbaruiPaletteWarna();
        
        tampilkanToast('Mode demo diaktifkan! Klik Hasilkan untuk melihat contoh', 'success');
    });

    tombolHapus.addEventListener('click', function() {
        if (confirm('Reset semua pengaturan ke default?')) {
            // Reset form
            pilihFontUtama.value = '';
            inputFontKustom.value = '';
            tipeWebsiteTerpilih.value = 'portfolio';
            suasanaTerpilih.value = 'professional';
            warnaTerpilih = ['#2563eb'];
            inputWarnaUtama.value = '#2563eb';
            nilaiWarnaSpan.textContent = '#2563eb';
            
            // Reset UI
            document.querySelectorAll('.chip').forEach(tombol => {
                tombol.classList.remove('active');
                if (tombol.dataset.value === 'portfolio') {
                    tombol.classList.add('active');
                }
            });
            
            document.querySelectorAll('.mood-card').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.mood === 'professional') {
                    item.classList.add('active');
                }
            });
            
            perbaruiPaletteWarna();
            teksPreview.value = 'Selamat datang di website kami. Ini adalah contoh heading diikuti teks body untuk mendemonstrasikan kombinasi font dalam aksi.';
            inputUkuranFont.value = 16;
            nilaiUkuranSpan.textContent = '16px';
            
            // Hapus hasil
            containerHasil.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h4>Belum ada hasil</h4>
                    <p>Konfigurasi preferensi Anda dan hasilkan kombinasi font untuk melihat rekomendasi AI di sini.</p>
                </div>
            `;
            
            kodeCSS.textContent = '/* Pilih kombinasi font untuk menghasilkan kode CSS */';
            document.getElementById('resultsCount').textContent = '0 kombinasi';
            
            tampilkanToast('Form berhasil direset', 'success');
        }
    });

    tombolSalin.addEventListener('click', function() {
        salinKePapanKlip(kodeCSS.textContent);
    });

    tombolTampilkanFavorit.addEventListener('click', function() {
        tampilkanFavorit();
    });

    tombolTutupModal.addEventListener('click', function() {
        modalFavorit.classList.add('hidden');
    });

    // Tutup modal ketika klik di luar
    modalFavorit.addEventListener('click', function(event) {
        if (event.target === modalFavorit) {
            modalFavorit.classList.add('hidden');
        }
    });

    // ========== INISIALISASI ==========
    function init() {
        // Inisialisasi palette warna
        perbaruiPaletteWarna();
        
        // Perbarui jumlah favorit
        perbaruiJumlahFavorit();
        
        // Set preview awal
        perbaruiPreview();
        
        // Tampilkan pesan selamat datang
        setTimeout(() => {
            tampilkanToast('Selamat datang di FontMatch AI! Pilih font dan klik Hasilkan untuk mulai.', 'success');
        }, 1000);
    }

    // Inisialisasi aplikasi
    init();
});