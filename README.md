# Aplikasi Todo List (Fullstack Developer Technical Test)

Selamat datang di aplikasi Todo List! Aplikasi ini memungkinkan Anda untuk mencatat, mengelola, dan melacak tugas-tugas Anda. Anda bisa menambahkan tugas baru, menandainya sebagai selesai, mengedit, menghapus, bahkan mengubah urutan tugas.

Aplikasi ini dibuat menggunakan:
* **Backend:** Node.js (dengan Express.js)
* **Database:** PostgreSQL
* **ORM:** Sequelize (untuk berinteraksi dengan database)
* **Frontend:** React.js + Vite
* **UI:** Tailwind.css

## Fitur Utama

* Menampilkan daftar tugas.
* Menambah tugas baru.
* Menandai tugas sebagai selesai (dengan visualisasi teks dicoret).
* Mengedit deskripsi tugas.
* Menghapus tugas.
* Mengubah urutan tugas (menggunakan tombol panah atas/bawah).

---

## Bagaimana Cara Menjalankan Aplikasi Ini?

Ikuti langkah-langkah di bawah ini. Jangan khawatir, kami akan memandu Anda dengan instruksi yang mudah diikuti!

### Prasyarat (Yang Perlu Anda Miliki di Komputer Anda)

Sebelum memulai, pastikan Anda sudah menginstal hal-hal ini di komputer Anda:

1.  **Node.js dan npm:**
    * Node.js adalah "mesin" yang menjalankan kode JavaScript di luar browser.
    * npm (Node Package Manager) adalah alat yang digunakan untuk menginstal library yang dibutuhkan proyek ini.
    * **Cara Cek:** Buka `Command Prompt` (Windows) atau `Terminal` (macOS/Linux) dan ketik:
        ```bash
        node -v
        npm -v
        ```
        Jika Anda melihat nomor versi, berarti sudah terinstal. Jika belum, unduh dari situs resmi Node.js: [https://nodejs.org/](https://nodejs.org/) (disarankan versi LTS).

2.  **PostgreSQL Database Server:**
    * Ini adalah tempat data tugas Anda akan disimpan.
    * **Cara Instal:** Unduh dari situs resmi PostgreSQL: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
    * Selama instalasi, Anda akan diminta untuk membuat **kata sandi** untuk user `postgres` (user default administrator). Ingat kata sandi ini!

### Langkah 1: Persiapan Database (PostgreSQL)

Kita perlu membuat database baru agar aplikasi bisa menyimpan datanya.

1.  **Buka aplikasi pengelolaan PostgreSQL:** Anda bisa menggunakan `pgAdmin` (biasanya terinstal bersama PostgreSQL) atau terminal Anda.
2.  **Buat database baru:**
    * Jika menggunakan `pgAdmin`: Klik kanan pada "Databases", pilih "Create" > "Database...". Beri nama `todo_db`.
    * Jika menggunakan `psql` (di Terminal/Command Prompt):
        ```bash
        psql -U postgres
        # Masukkan kata sandi user postgres Anda
        CREATE DATABASE todo_db;
        \q
        ```
        (Perintah `\q` untuk keluar dari psql)
3.  **Buat user database (Opsional, tapi bagus):** Jika Anda tidak ingin menggunakan user `postgres` langsung, Anda bisa membuat user baru.
    * Di `pgAdmin`: Klik kanan pada "Login/Group Roles", pilih "Create" > "Login/Group Role...". Beri nama misalnya `todo_user` dan atur kata sandi. Berikan izin `Can login` dan `Create database` atau izin lain yang relevan.
    * Di `psql`:
        ```bash
        psql -U postgres
        CREATE USER todo_user WITH PASSWORD 'your_secure_password';
        GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;
        \q
        ```
        **Penting:** Ganti `todo_user` dan `your_secure_password` dengan nama user dan kata sandi pilihan Anda. **Sangat disarankan menggunakan kata sandi yang kuat.**

### Langkah 2: Mengatur Bagian Backend (Server)

Bagian backend adalah otak aplikasi yang mengelola data.

1.  **Buka Terminal/Command Prompt baru.**
2.  **Masuk ke folder backend proyek:**
    ```bash
    cd todo-app/backend
    ```
3.  **Instal library yang dibutuhkan backend:**
    ```bash
    npm install
    ```
    Ini akan membaca file `package.json` dan menginstal semua dependensi yang terdaftar.
4.  **Atur Konfigurasi Database:**
    * Di dalam folder `backend`, Anda akan melihat file bernama `.env.example` (mungkin namanya `.env.template` atau semacamnya).
    * **Duplikat** file ini dan beri nama **`.env`** (titik di depan). Pastikan tidak ada ekstensi file di belakangnya.
    * **Buka file `.env`** dengan editor teks biasa (misalnya Notepad, VS Code).
    * **Edit baris-baris berikut** agar sesuai dengan pengaturan database Anda dari Langkah 1:
        ```
        PORT=5000
        DB_USER=your_pg_user_name  # Contoh: todo_user atau postgres
        DB_HOST=localhost
        DB_DATABASE=todo_db
        DB_PASSWORD=your_pg_password # Contoh: your_secure_password atau kata sandi postgres Anda
        DB_PORT=5432
        ```
    * **Simpan file `.env`** setelah Anda mengubahnya.
5.  **Jalankan Migrasi Database:**
    * Ini adalah langkah penting yang akan membuat tabel `tasks` di database `todo_db` Anda.
    * Dari folder `backend` di Terminal/Command Prompt, ketik:
        ```bash
        npx sequelize-cli db:migrate
        ```
    * Jika berhasil, Anda akan melihat pesan yang menunjukkan bahwa migrasi telah dijalankan.
6.  **Isi Database dengan Data Awal (Opsional tapi Direkomendasikan):**
    * Untuk memiliki beberapa tugas awal, Anda bisa menjalankan seeder.
    * Dari folder `backend` di Terminal/Command Prompt, ketik:
        ```bash
        npx sequelize-cli db:seed:all
        ```
    * Ini akan menambahkan beberapa contoh tugas ke daftar Anda.
7.  **Mulai Server Backend:**
    * Tetap di folder `backend` di Terminal/Command Prompt, ketik:
        ```bash
        npm start
        ```
    * Anda akan melihat pesan seperti "Backend server running on http://localhost:5000". Ini berarti backend Anda sudah berjalan!
    * Biarkan Terminal/Command Prompt ini tetap terbuka saat Anda menggunakan aplikasi.

### Langkah 3: Mengatur Bagian Frontend (Tampilan Aplikasi)

Bagian frontend adalah antarmuka yang akan Anda lihat dan gunakan.

1.  **Buka Terminal/Command Prompt baru** (jangan tutup Terminal/Command Prompt backend yang sudah jalan).
2.  **Masuk ke folder frontend proyek:**
    ```bash
    cd todo-app/frontend
    ```
3.  **Instal library yang dibutuhkan frontend:**
    ```bash
    npm install
    ```
    Ini akan menginstal semua dependensi React.
4.  **Mulai Aplikasi Frontend:**
    ```bash
    npm run dev
    ```
    Ini akan membuka aplikasi Todo List di browser web default Anda (biasanya di `http://localhost:5173`).

---

## Selamat!

Jika semua langkah berhasil, Anda sekarang harus melihat aplikasi Todo List di browser Anda!

* Coba tambahkan tugas baru.
* Klik radio button untuk menandai tugas selesai/Belum selesai.
* Klik pada deskripsi tugas untuk mengeditnya. (double click pada deskripsi dan enter/tekan untuk menyimpan)
* Gunakan tombol "Delete" untuk menghapus tugas.
* Gunakan tombol Bar untuk mengubah urutan tugas.

---

## Dokumentasi API (Untuk Developer)

Jika Anda seorang pengembang dan ingin melihat dokumentasi API backend, Anda bisa mengaksesnya di:
`http://localhost:5000/api-docs` (pastikan server backend berjalan).

---

Terima kasih telah mencoba aplikasi ini!