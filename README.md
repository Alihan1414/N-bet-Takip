# 📋 Nöbet Çizelgesi & WhatsApp Takip Sistemi

Modern, mobil uyumlu (PWA) ve akıllı döngü mantığına sahip **Nöbet Çizelgesi & WhatsApp Entegrasyon Uygulaması**.

Hedef Nöbet Hattı: **+90 541 571 98 89**

---

## 🚀 Özellikler

- 📱 **Mobil Uygulama (PWA) Desteği:** iOS Safari ve Android Chrome üzerinden doğrudan telefona yüklenebilir (Ana Ekrana Ekle).
- 🔄 **Akıllı Döngü & Tekrar Önleme:** Bir kategoride nöbet tutan kişi, o listedeki herkes nöbetini bitirene kadar tekrar seçilemez. Liste tamamlandığında döngü otomatik sıfırlanır.
- 💬 **WhatsApp Entegrasyonu:** Tek tıkla formatlanmış mesajı WhatsApp Web veya WhatsApp Uygulaması üzerinden doğrudan hedefe iletir. Emojiler bozulmadan aktarılır.
- ⚙️ **Kişi Yönetimi & Anlık Ekleme:** Talebe ve İhvan gibi listelere ana ekrandan doğrudan yeni isim yazıp ekleyebilir veya paneli kullanarak listeleri düzenleyebilirsiniz.
- 📜 **Geçmiş Takibi:** Yapılan tüm nöbet seçimleri tarayıcı hafızasında (`localStorage`) saklanır ve geriye dönük incelenebilir.
- ⚡ **Sıfır Bağımlılık (Zero Dependencies):** Ekstra kurulum gerektirmez, doğrudan statik olarak her yerde çalışır.

---

## 📲 Telefona Nasıl Yüklenir?

### 🍎 iOS (iPhone / iPad - Safari):
1. Safari tarayıcısında siteyi açın.
2. Alttaki **Paylaş** (kare içinden yukarı ok çıkan `📤`) simgesine dokunun.
3. Aşağı kaydırıp **"Ana Ekrana Ekle"** seçeneğini seçin.
4. Sağ üstteki **"Ekle"** butonuna basın. Uygulama tıpkı App Store uygulaması gibi ana ekranınıza gelecektir.

### 🤖 Android (Google Chrome):
1. Chrome tarayıcısında siteyi açın.
2. Ekranın üstündeki **"📲 Uygulamayı Yükle"** butonuna basın veya sağ üstteki **üç nokta (⋮)** menüsünden **"Uygulamayı Yükle"** ya da **"Ana ekrana ekle"** seçeneğini seçin.

---

## 🌐 Vercel'e Nasıl Dağıtılır (Deploy)?

Bu proje `vercel.json` ile tam uyumludur:
1. [vercel.com](https://vercel.com) adresine gidin ve GitHub hesabınızla (`ALIHAN1414`) giriş yapın.
2. **"Add New Project"** butonuna tıklayın.
3. GitHub reponuzu (`nobet-sistemi`) seçin.
4. **"Deploy"** butonuna tıklayın!
5. 10 saniye içinde size özel ücretsiz bir link (`https://nobet-sistemi-...vercel.app`) oluşturulacaktır.

---

## 💻 Yerel Çalıştırma

Proje klasöründeki **`baslat.bat`** dosyasına çift tıklayarak veya terminalde aşağıdaki komutu çalıştırarak açabilirsiniz:

```bash
node server.js
```
Ardından tarayıcınızda `http://localhost:3300` adresine gidin.
