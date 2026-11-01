# Tasarım brief'i — {{PROJECT_NAME}}

> Uygulamanın tasarımı için tek kaynak (RULES.md Bölüm 3.6). Claude her
> {{…}} alanını `docs/PRODUCT.md`, `docs/ASO.md` ve `docs/MONETIZATION.md`
> dosyalarından doldurur, ardından Design System'i ve Design canvas'ını bu
> dosyadan üretir. Geçerli olmayan bölümlere "yok" yazılır (ör. reklam
> yoksa). Onaylanan linkler `docs/design/DESIGN.md`'ye yazılır.

## 1. Ürün
- Tek cümleyle ne yaptığı: {{ONE_SENTENCE}}
- Kimin için ve hangi iş için kullanıldığı: {{AUDIENCE_AND_JOB}}
- Pazarlar ve diller: {{COUNTRIES}} · {{LANGUAGES}} (en uzun: {{LONGEST_LANGUAGE}}; RTL: {{YES_NO}})
- Platformlar: {{PLATFORMS}} · tablet: {{YES_NO}} · hesaplar: {{ACCOUNTS_AND_GUEST_MODE}}
- Gelir modeli: {{MODEL}} (Bölüm 8.11)

## 2. Marka ve konsept
- Ad: {{APP_NAME}} · üç sıfatla kişilik: {{ADJECTIVES}}
- Adı konmuş görsel konsept: {{CONCEPT_NAME}} — {{WHAT_IT_LOOKS_AND_FEELS_LIKE}}
- Mevcut varlıklar (logo, renkler, fontlar): {{ASSETS_OR_NONE}}
- Rakiplerin görsel dili ve bu uygulamanın farkı: {{DIFFERENCE}}

## 3. Kalite çıtası (KESİN)
- Özgün: şablon ya da hazır kit görüntüsü yok; özel illüstrasyon ve ikon stili; kendinden emin tipografi.
- Zengin hareket: her kontrolde mikro etkileşimler, anlamlı ekran geçişleri, animasyonlu onboarding ve başarı anları (Lottie ya da Rive), iskelet yükleyiciler. Süre ve eğrileri hareket token'ları belirler.
- Akıcı ve istendiğinde sakin: düşük seviye Android'de 60 fps; sistemin "hareketi azalt" ayarı açıkken sakin bir alternatif.
- Erişilebilir: metin kontrastı ≥ 4.5:1, dokunma hedefleri ≥ 48 dp / 44 pt, %200'e kadar metin büyütme, yalnızca ikon olan kontrollerde etiket.
- Eksiksiz: her ekran her durumuyla (yükleniyor, boş, hata, çevrimdışı, başarılı), açık ve koyu tema, en uzun dil, varsa RTL, küçük (iPhone SE) ve büyük telefonlar, destekleniyorsa tabletler.

## 4. Tasarım sistemi (önce bu kurulur)
- Token'lar: açık ve koyu tema için anlamsal renkler (primary, surface, text, success, warning, error), yazı ölçeği, boşluk, köşe yarıçapı, gölge, hareket.
- Component'ler: butonlar, input'lar, kartlar, liste satırları, sheet'ler, diyaloglar, sekmeler, chip'ler, toast'lar, boş durum bloğu, iskeletler, paywall plan kartları, reklam alanı çerçeveleri, izin ön ekranı kartı.
- Uygulama ikonu yönü, splash ve store ekran görüntüsü çerçeve stili (Bölüm 11.3).

## 5. Ekran envanteri (her biri bir telefon artboard'u, 390×844)
| Akış | Ekranlar | Durumlar |
|---|---|---|
| Açılış | splash, zorunlu güncelleme, güncelleme var, bağlantı yok | — |
| Onboarding | {{STEPS}}, kişiselleştirme soruları, izin ön ekranları | — |
| Paywall | paywall, deneme zaman çizelgesi, satın alma başarılı, geri yükleme sonucu | yükleniyor, hata |
| Giriş | giriş (Google + Apple), misafir modundan giriş daveti | yükleniyor, hata |
| Ana işlev | {{CORE_SCREENS}} | yükleniyor, boş, hata, çevrimdışı, başarılı |
| Ayarlar | ayarlar, dil, premium ve abonelik yönetimi, yasal, onaylı hesap silme | — |
| Sistem anları | bildirim ve ATT ön ekranları, puan isteme anı, kutlama | — |
| Reklamlar | {{SCREENS_WITH_AD_SLOTS}} ve reklam alanları | — |

## 6. Onboarding (Bölüm 3.8)
- Adımlar ve her birinin iş başında gösterdiği değer: {{STEPS_AND_VALUE}}
- Kişiselleştirme soruları ve cevapların sonra nerede kullanıldığı: {{QUESTIONS_AND_USE}}
- İlerleme göstergesi; atla yalnızca akışı bozmadığı yerde.
- Bittiği yer: {{PAYWALL_OR_FIRST_VALUE}}

## 7. Paywall ve premium (Bölüm 3.9)
- Planlar ve deneme: {{PLANS_AND_TRIAL}} (fiyatlar store'dan gelir; asla koda gömülmez)
- ZORUNLU: faturalanacak tutar ve dönem en belirgin fiyattır; deneme süresi, yenileme, fiyat, tarih ve nasıl iptal edileceği; Geri yükle; Koşullar (EULA) ve Gizlilik linkleri; görünür bir kapatma butonu.
- YASAK: gizlenen ya da geciktirilen kapatma, sahte geri sayım ya da kıtlık, ucuz planları gizleyen önceden seçili pahalı plan, koşulsuz "ücretsiz", utandırarak vazgeçirme, ana bir işi bölmek.
- Dönüşüm: ikonlu faydalar, işaretli önerilen plan (tasarrufuyla), deneme zaman çizelgesi, tek ana çağrı butonu, yalnızca gerçekse sosyal kanıt.

## 8. Reklamlar (Bölüm 3.10; reklam yoksa "yok")
- Yerleşim planı, ekran → format: {{PLACEMENTS}}
- Onboarding, paywall, satın alma, ayarlar, hesap silme ve izin ekranlarında reklam yok; açılışta ya da çıkışta geçiş reklamı yok; ödüllü reklamlar isteğe bağlıdır ve ödülü önce söyler; native reklamlar "Reklam" etiketi taşır; premium tüm reklamları kaldırır.

## 9. Bağlılık (Bölüm 3.11)
- Ana ekrandaki bir sonraki faydalı adım: {{NEXT_ACTION}}
- İlk değer anına götüren boş durumlar: {{EMPTY_STATES}}
- İlerleme, seri ya da başarımlar (yalnızca uyduğu yerde): {{HABIT_LOOP}}
- Kutlama ve puan isteme anları: {{MOMENTS}}

## 10. Teslimatlar ve inceleme
- Önce bir "Design System" artifact'i, sonra tek bir "Design" canvas'ı: tüm artboard'lar akış başına gruplanmış, onboarding → paywall → ilk değer için prototip bağlantılarıyla.
- Kullanıcı linkleri Claude'da inceler ve yorum bırakır; Claude kullanıcı onaylayana kadar düzeltir.
- Onaydan sonra: artifact linkleri ve onay tarihi `docs/design/DESIGN.md`'ye yazılır, token'lar Flutter teması ve Tailwind ayarı olur.
