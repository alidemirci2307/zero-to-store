# PROJE KICKOFF — KURALLAR VE ALTYAPI

> İLK İŞİN, başka her şeyden önce: bu kuralların tamamını docs/RULES.md
> dosyasına yazmak, ona referans veren KISA bir CLAUDE.md (indeks, ≤400
> satır), boş TODO.md ve Proje Merkezi'ni (hub/) kurmak (bkz. Bölüm 17.0 ve 16 —
> sıralama ve dosya yapısı orada kesin olarak tanımlıdır). Ardından "Çalışma Şekli"
> bölümündeki soruları bana sor ve proje iskeletini kur.
> Sonraki her session: önce CLAUDE.md, PLAN.md ve TODO.md'yi oku,
> `node hub/server.mjs --status` çalıştır; biten fazları, sıradaki fazı,
> bekleyen işleri ve benden beklenenleri (Proje Merkezi linkiyle)
> hatırlat, sonra işe başla.
>
> REFERANS BİÇİMİ: Bu dokümanda ve ondan türeyen tüm dosyalarda (CLAUDE.md,
> faz dosyaları, docs/) kural referansı her zaman "Bölüm N.M" biçimindedir:
> N = bölüm numarası, M = o bölümdeki madde (ör. Bölüm 17.3.1 = 17. bölüm,
> madde 3.1). Bölüm numarası olmadan "madde X" yazılmaz.

---

## 1. Teknoloji Yığını

- **Mobil:** Flutter (Dart). State management: Riverpod. Routing: go_router.
- **Backend:** Supabase (Auth, Postgres DB, Edge Functions).
  RLS (Row Level Security) baştan kurgulanır.
- **Storage:** Dosya/medya depolama gerekiyorsa Cloudflare R2 kullanılır
  (S3 uyumlu API; egress ücretsiz). Supabase Storage yalnızca çok küçük ve
  basit ihtiyaçlar için değerlendirilir; seçim gerekçesiyle bana sunulur.
- **Realtime (socket):** Gerçek zamanlı ihtiyaçlar için Supabase Realtime
  kullanılır; ayrı bir socket sunucusu veya üçüncü parti servis
  (Socket.IO, Pusher, Ably vb.) eklenmez.
- **Firebase:** SADECE FCM (push), Crashlytics ve Analytics için kullanılır.
  Backend verisi Firebase'e yazılmaz. (firebase-cli mevcut.)
- **Admin Panel:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui.
- **Web:** Landing/statik sayfalar Hostinger paylaşımlı hosting'e deploy
  edilir (Node çalışmaz; sadece statik/PHP). Deep link dosyaları
  (`.well-known/assetlinks.json`, `apple-app-site-association`) buraya konur.
- **Repo:** TEK GitHub private reposu (monorepo), her uygulamanın AYRI
  sürümü, CHANGELOG'u, tag'i ve CI'ı vardır: `apps/mobile` (Flutter),
  `apps/panel` (React), `apps/web` (landing/site), ortak `supabase/`,
  `packages/`, `hub/`, `docs/`. Yapı, sürümleme ve tag kuralları Bölüm
  15'tedir. Bu dokümanda geçen mobil yollar (`lib/`, `android/`, `ios/`,
  `fastlane/`, `integration_test/`, `tool/`, `pubspec.yaml`) `apps/mobile/`
  köküne, panel ve web yolları kendi `apps/<app>/` köküne göredir.
  Secrets asla koda gömülmez; `--dart-define`, `.env` (gitignore'lu) veya
  GitHub Actions Secrets kullanılır. (İstisna: Release bölümündeki store
  kimlik dosyaları — bkz. Bölüm 12.5.)

## 2. Mimari Kuralları (KESİN)

1. Tüm kod SOLID prensiplerine ve Clean Architecture'a uygun yazılır
   (presentation / domain / data katmanları, feature-first klasör yapısı).
   Bu kural hem Flutter hem React (panel) tarafı için geçerlidir.
2. Hiçbir dosya 300 satırı geçemez. Geçmesi zorunluysa işin sonunda bana
   gerekçesiyle MUTLAKA bildirilir.
3. Base yapılar kurulur: BaseRepository, BaseUseCase, BaseNotifier/State,
   BaseWidget, ortak error/failure modeli, ortak network katmanı.
   React tarafında: BaseService, ortak ApiClient, ortak hook'lar.
4. UI component'leri projeye özel ortak component kütüphanesi olarak yazılır
   (AppButton, AppTextField, AppCard vb.) ve tekrar kullanılabilir olur.
   Ekranlarda ham Material/HTML widget yerine bu component'ler kullanılır.
5. Çoklu dil (i18n) mimarisi BAŞTAN kurulur:
   - Flutter'da `flutter_localizations` + ARB dosyaları kullanılır
     (`lib/l10n/app_en.arb`, `app_tr.arb` ...). Uygulamanın desteklediği
     her dil için ARB dosyası bulunur.
   - Hiçbir kullanıcıya görünen metin koda HARDCODE edilmez; tüm metinler
     locale dosyalarından gelir. Onboarding, splash, hata mesajları,
     buton yazıları, paywall metinleri dahildir.
   - Yeni bir özellik eklendiğinde metinleri desteklenen TÜM dillere aynı
     anda eklenir; tek dilde bırakılmaz.
   - Admin panel de aynı prensiple (react-i18next veya eşdeğeri) çok dilli
     altyapıya sahip kurulur; panel dili en az İngilizce içerir.
   - Cihaz dili desteklenmiyorsa varsayılan dil İngilizce'dir (proje
     yereldeyse bana sorulur). Dil yapısı CLAUDE.md'ye işlenir.

## 3. Tasarım Kuralları (KESİN)

1. Sana bir tasarım dosyası (Claude Design vb.) verdiysem birebir ona uyulur.
2. Tasarım verilmediyse: modern, animasyonlu, tema sistemine (renk/typography
   token'ları) dayalı, kaliteli bir tasarım yapılır.
3. Tasarımda onboarding yoksa: uygulamanın ana özelliklerini anlatan,
   animasyonlu, temaya uygun bir onboarding eklenir (ilk açılışta bir kez
   gösterilir, tekrar gösterilmez).
4. Splash ekranı: modern, animasyonlu, temaya uygun olur ve version name
   bilgisini gösterir (package_info_plus).

## 4. Mobil Davranış Kuralları (KESİN)

1. Android back tuşu her ekran için düşünülür (PopScope ile):
   - Onboarding/splash'ta geri dönüş engellenir.
   - Form ekranlarında kaydedilmemiş değişiklik uyarısı verilir.
   - Ana ekranda "çıkmak için tekrar bas" davranışı uygulanır.
2. Her ekranda loading, empty state ve error state tasarlanır.
3. Offline davranışı düşünülür:
   - İnternet yokken uygulama ASLA çökmez; bağlantı durumu izlenir
     (connectivity_plus) ve anlamlı bir "bağlantı yok" durumu gösterilir
     (tam ekran veya banner, temaya uygun) + "tekrar dene" aksiyonu sunulur.
   - Bağlantı geri geldiğinde bekleyen ekranlar otomatik yenilenir.
   - Ağ hataları kullanıcıya teknik mesajla değil, anlaşılır ve çevrilmiş
     metinlerle gösterilir. (Store review'da test edilen bir senaryodur.)
4. Force update (zorunlu güncelleme) mekanizması KURULUR:
   - Supabase'de `app_config` tablosunda `min_supported_version` (ve
     isteğe bağlı `latest_version`, `update_message`) tutulur.
   - Uygulama her açılışta kendi sürümünü bu değerle karşılaştırır:
     * Sürüm < min_supported_version → kapatılamayan, temaya uygun bir
       "Güncelleme Gerekli" ekranı gösterilir; tek aksiyon ilgili store'a
       yönlendiren butondur. Back tuşu ile geçilemez.
     * Sürüm < latest_version → bir kez gösterilen, kapatılabilir bir
       "Yeni sürüm mevcut" önerisi gösterilir (soft update).
   - Bu değerler admin panelin "Uygulama Ayarları" bölümünden yönetilir;
     yeni sürüm yayınlandığında panelden güncellenebilir.
   - Config kontrolü açılışta başarısız olursa (ağ yok vb.) kullanıcı
     ENGELLENMEZ; uygulama normal açılır, kontrol sonraki açılışa kalır.
   - Yapı (tablo, alanlar, akış) CLAUDE.md'ye işlenir.
5. Mobil performans kuralları:
   - Ağdan gelen görseller cached_network_image ile cache'lenir; liste
     görselleri boyutlandırılarak yüklenir.
   - Uzun listeler MUTLAKA lazy oluşturulur (ListView.builder /
     SliverList); tüm liste tek seferde build edilmez.
   - Gereksiz rebuild engellenir: const constructor'lar, Riverpod'da
     select/ince taneli provider kullanımı, ağır widget'ların izole
     edilmesi.
   - Animasyonlar 60fps hedefler; jank oluşturan animasyon düzeltilmeden
     bırakılmaz. Ağır işler (parse, resim işleme) isolate/compute'a alınır.
   - Uygulama açılış süresi gözetilir: splash'ta bloklayan senkron iş
     yapılmaz; başlatma işleri paralel/ertelenmiş çalışır.
6. Geliştirilen HER özellik hem Android emulator hem iOS simulator üzerinde
   KESİNLİKLE test edilir. Özellik iki platformda da çalışır durumda
   doğrulanmadan "bitti" sayılmaz; platforma özel farklar (izinler, safe
   area, back davranışı, Apple/Google giriş akışları) her iki tarafta da
   kontrol edilir. Test edilemeyen bir durum varsa (ör. gerçek cihaz
   gerektiren özellik) bana bildirilir.

## 5. Kimlik Doğrulama Kuralları (KESİN)

1. Giriş SADECE Google ve Apple ile yapılır (Supabase Auth üzerinden).
2. E-posta/şifre girişi KESİNLİKLE eklenmez; e-posta giriş formu,
   "şifremi unuttum" vb. akışlar hiçbir ekranda yer almaz.
3. iOS'ta Sign in with Apple zorunludur (App Store kuralı: üçüncü taraf
   giriş varsa Apple girişi de sunulmalıdır). Her iki platformda da
   Google + Apple birlikte sunulur.
4. Admin panel girişi bundan ayrıdır: Supabase Auth + rol kontrolü ile
   korunur; giriş yöntemi panel planlanırken bana sorulur.
5. Uygulama İÇİNDEN hesap silme akışı ZORUNLUDUR (Apple ve Google
   politikası: hesap oluşturma varsa uygulama içinden silme de sunulmalı):
   - Ayarlar ekranında açıkça erişilebilir bir "Hesabı Sil" seçeneği
     bulunur; onay adımı (geri alınamaz uyarısı) içerir.
   - Silme işlemi Supabase'de GERÇEKTEN uygulanır: auth kaydı ve
     kullanıcıya ait veriler silinir/anonimleştirilir, R2'deki dosyaları
     temizlenir, device token'ları kaldırılır. İşlem service role ile
     Edge Function üzerinden yapılır (istemci service role GÖREMEZ).
   - Aktif aboneliği olan kullanıcıya, silmeden önce aboneliğini store
     üzerinden iptal etmesi gerektiği bilgisi gösterilir.
   - Web'deki hesap silme sayfası da bu akışı tarif eder (store
     zorunluluğu). Akış CLAUDE.md'ye işlenir.
6. Auth akışları (ilk giriş, oturum yenileme, çıkış, hesap silme) ve
   provider ayar bilgileri CLAUDE.md'ye işlenir.

## 6. Web Varlığı Kuralları (KESİN)

1. Projeye başlamadan önce BANA MUTLAKA SORULUR: mobil uygulamanın yanında
   ne isteniyor?
   - Sadece landing page (özellikler, ekran görüntüleri, store linkleri,
     iletişim)
   - Tam web sitesi (uygulamanın web versiyonu / çok sayfalı site)
   - İkisi birden
   Cevap alınmadan web tarafı için hiçbir plan ve kod yazılmaz.
2. Landing page: statik (HTML/CSS/JS veya React static build), modern,
   animasyonlu, temaya uygun yapılır ve Hostinger'a deploy edilir.
   Gizlilik politikası, KVKK/Privacy, hesap silme sayfası ve deep link
   dosyaları da burada barındırılır.
3. Tam web sitesi istenirse kapsamı ve teknolojisi ayrıca netleştirilerek
   plan sunulur, onay sonrası kodlanır.
4. Verilen karar CLAUDE.md'ye işlenir.

## 7. Admin Panel Kuralları (KESİN)

1. Projenin bir admin paneli MUTLAKA yapılır. Teknoloji: React + Vite +
   TypeScript + Tailwind + shadcn/ui. Tablolar için TanStack Table,
   grafikler için Recharts, backend için Supabase JS SDK.
2. Panel de Bölüm 2'deki mimari kurallara tabidir (SOLID, Clean Arch,
   300 satır limiti, base yapılar, ortak component'ler).
3. Deploy hedefi işe başlamadan önce BANA SORULUR:
   - Hostinger bilgilerini (FTP/panel erişimi) verdiysem oraya deploy
     edilir (statik build + SPA routing için `.htaccess` rewrite).
   - Vermediysem Firebase Hosting kullanılır.
   Karar verilmeden panel deploy planı yapılmaz.
4. Panel eksiksiz olur — uygulama TAMAMEN panelden yönetilebilir olmalıdır:
   - Dashboard: temel metrikler ve özet istatistikler
   - Tüm veri tablolarının CRUD yönetimi (listeleme, arama, filtreleme,
     sıralama, sayfalama, ekleme, düzenleme, silme)
   - Kullanıcı yönetimi: listeleme, detay, engelleme/aktifleştirme, rol atama
   - İçerik/medya yönetimi (projenin storage tercihi üzerinden —
     varsayılan Cloudflare R2; bkz. Bölüm 1 ve 13.8)
   - Push bildirim gönderimi (Bölüm 9'daki altyapıyla; tekil/toplu,
     hedef ekran seçimi, dil bazlı metin, zamanlama)
   - Uygulama ayarları (uzaktan yönetilebilir config değerleri)
   - Loglar / son aktiviteler görünümü
5. Panel girişi Supabase Auth ile yapılır; admin yetkisi RLS + rol
   tablosuyla korunur. Panele mobil kullanıcılar asla erişemez.
6. Uygulamaya yeni bir özellik eklendiğinde panel tarafındaki yönetim
   ekranı da eklenir; bu senkron kuralı CLAUDE.md'de kalıcı olarak durur.

## 8. Store Politikaları ve Gelir Modeli Kuralları (KESİN)

1. Mobil uygulama Apple App Review Guidelines ve Google Play Policy'ye
   TAM UYUMLU planlanır ve kodlanır. Her özellik planlanırken policy
   kontrolü yapılır; riskli bir durum varsa kodlamadan önce bana bildirilir.
2. Reklamlar AdMob ile yönetilir ve AdMob politikalarına kesinlikle uyulur
   (yanlışlıkla tıklamaya zorlama yok, kapatma butonunu gizleme yok,
   politika dışı yerleşim yok).
3. Reklam izin/consent akışları ZORUNLUDUR ve baştan kurulur:
   - iOS — ATT (App Tracking Transparency): reklam kimliğine erişim öncesi
     ATT izni istenir; `NSUserTrackingUsageDescription` metni Info.plist'e
     eklenir ve Apple kurallarına uygun, dürüst yazılır. `SKAdNetworkItems`
     tanımları (AdMob'un güncel listesi) Info.plist'e eklenir. ATT izni
     REDDEDİLSE bile uygulama tam çalışır; sadece kişiselleştirilmemiş
     reklam gösterilir.
   - GDPR/UK — Google UMP SDK: Avrupa/Birleşik Krallık kullanıcılarına ilk
     açılışta consent formu gösterilir; reklamlar consent alınmadan
     YÜKLENMEZ. AdMob panelinde GDPR mesajı yapılandırması gerektiği bana
     hatırlatılır. Consent durumuna göre kişiselleştirilmiş /
     kişiselleştirilmemiş reklam ayrımı otomatik yönetilir.
   - Bu akışların sırası doğru kurgulanır: UMP consent → ATT izni →
     reklam SDK başlatma. Akış CLAUDE.md'ye işlenir.
4. Uygulama adı ve Bundle ID / paket adı ASO analizinden SONRA belirlenir,
   iskelet kurulmadan önce bana sunulur ve onayım alınır. Claude kendi
   başına ad veya id belirleyip ilerlemez.
   - Ad: ASO araştırması (Bölüm 11.1) sonunda "Marka – ana kelime"
     yapısında (≤30 karakter) en az 3 aday önerilir. Her adayın
     gerekçesi (kelime değeri, akılda kalıcılık, telaffuz, hedef dillerde
     olumsuz anlam taşımaması) yazılır.
   - Benzersizlik kontrolü ZORUNLUDUR. Her aday marka adı, hedeflenen
     her ülke için iki mağazada aranır:
     App Store'da iTunes Search API ile
     (`https://itunes.apple.com/search?term=<ad>&entity=software&country=<ülke>`),
     Google Play'de mağaza aramasıyla
     (`https://play.google.com/store/search?q=<ad>&c=apps`).
     Aynı adlı veya karıştırılabilecek kadar benzer bir uygulama varsa
     aday elenir. App Store'da uygulama adı benzersiz olmak zorundadır.
   - Marka çakışması için TÜRKPATENT / EUIPO / USPTO'da hızlı arama
     yapılır ve risk bana bildirilir.
   - Paket adı: `com.<alanadı-veya-şirket>.<marka>` biçimindedir; yalnızca
     küçük harf, rakam ve nokta içerir. iOS ve Android'de AYNIDIR.
     Anahtar kelimeyle doldurulmaz, marka adını taşır. Store adı ve
     metinleri sonradan değişebilir (ASO iterasyonu), paket adı ise
     ASLA değişemez; bu yüzden markayla birebir tutarlı seçilir.
     Şirket kısmı kullanıcının sahip olduğu alan adıyla uyumludur.
   - Paket adının boşta olduğu kontrol edilir:
     `https://play.google.com/store/apps/details?id=<paket>` yayında bir
     uygulama göstermemelidir. Kesin kontrol, Play Console'da uygulama ve
     Apple Developer'da Identifier oluşturulurken yapılır.
   - Onaylanan ad ERKENDEN rezerve edilir: App Store Connect'te uygulama
     kaydı ve Play Console'da uygulama oluşturulur (İhtiyaç Merkezi
     kaydıyla, doğru hesapta — Bölüm 12.8).
   - Store'a bir kez gittikten sonra paket adı DEĞİŞTİRİLEMEZ. Onaylanan
     ad ve id `docs/ASO.md`'ye yazılır ve CLAUDE.md'den referanslanır.
5. Reklam stratejisi geliri MAKSİMİZE edecek şekilde planlanır. Uygun olan
   her format değerlendirilir: banner, interstitial (geçiş), rewarded
   (ödüllü), rewarded interstitial, native ve app open ad. Hangi ekranda
   hangi formatın kullanılacağı bir "reklam yerleşim planı" olarak sunulur
   ve onayım alınır. Frekans sınırları (ör. app open için cooldown)
   policy'ye uygun ayarlanır.
6. Uygulama içi satın almalar ve abonelikler RevenueCat üzerinden yönetilir
   (App Store + Play Store tek merkezden). Paywall tasarımı store
   kurallarına uygun olur (fiyat, süre, iptal bilgisi açıkça yazar).
7. Premium/abone kullanıcılara reklam GÖSTERİLMEZ; reklam katmanı
   RevenueCat entitlement kontrolüne bağlı çalışır.
8. Reklam ve satın alma yapısı (ad unit id yönetimi, entitlement isimleri,
   ürün id'leri) CLAUDE.md'ye işlenir. Geliştirme sırasında SADECE AdMob
   test id'leri kullanılır; gerçek id'ler release build'e config üzerinden
   girer.
9. Store gizlilik beyanları ZORUNLUDUR ve kullanılan SDK'lara göre doğru
   hazırlanır:
   - Apple App Privacy ("nutrition label") beyanı: AdMob, Analytics,
     Crashlytics, RevenueCat ve Supabase Auth'un topladığı veri türleri
     eksiksiz ve DOĞRU işaretlenecek şekilde bir beyan listesi hazırlanır
     ve bana sunulur.
   - iOS Privacy Manifest (`PrivacyInfo.xcprivacy`): projede bulunur;
     kullanılan required reason API'ları ve veri türleri tanımlanır.
     SDK'ların kendi manifest'leri güncel sürümlerle gelir; build sırasında
     manifest uyarısı varsa çözülmeden release alınmaz.
   - Google Play Data Safety formu: aynı SDK listesine göre doldurulacak
     cevap seti hazırlanıp bana sunulur.
   - Yeni bir SDK eklendiğinde bu beyanların güncellenmesi gerektiği
     kuralı CLAUDE.md'de durur; beyanlar CLAUDE.md'ye işlenir.
   - Yanlış/eksik beyan ret nedenidir; "veri toplanmıyor" beyanı ancak
     gerçekten öyleyse yapılır.
10. In-app review (uygulama içi puanlama) kurulur:
   - Google Play In-App Review API ve Apple SKStoreReviewController
     (in_app_review paketi) kullanılır; kullanıcı store'a atılmadan
     uygulama içinde puan verebilir.
   - DOĞRU ANDA istenir: kullanıcı bir başarı/değer anı yaşadıktan sonra
     (görev tamamlama, ilk başarılı kullanım vb.). ASLA reklam sonrası,
     hata sonrası veya ilk açılışta istenmez.
   - Policy'ye uyulur: puan karşılığı ödül verilmez, "5 yıldız ver"
     yönlendirmesi yapılmaz, sistem diyaloğu öncesi filtreleme
     ("beğendin mi?" ile olumsuzları eleme) Apple kurallarına aykırı
     olduğundan yapılmaz.
   - İsteme sıklığı sınırlanır (OS zaten kota koyar); hangi olaydan sonra
     istendiği CLAUDE.md'ye işlenir.

## 9. Push Bildirim Kuralları (KESİN)

1. Push bildirimler FCM üzerinden kurulur ve KESİNLİKLE doğru çalışır;
   kurulum her iki platformda da (Android + iOS/APNs) uçtan uca test edilir:
   uygulama ön planda, arka planda ve tamamen kapalıyken bildirim alma
   senaryolarının üçü de doğrulanır.
2. Bildirim izni doğru zamanda istenir:
   - Android 13+ için POST_NOTIFICATIONS runtime izni, iOS için sistem izni
     kullanılır.
   - İzin İLK AÇILIŞTA sorulmaz; kullanıcı uygulamadan değer gördükten
     sonra, iznin faydasını anlatan kısa bir ön ekran (pre-permission
     prompt) ile istenir. Bu yaklaşım opt-in oranını artırır.
   - İzin reddedilirse uygulama normal çalışır; ayarlardan tekrar açma
     yolu gösterilir, kullanıcı asla zorlanmaz.
3. FCM token yönetimi: token alınır, yenilenmesi dinlenir ve Supabase'de
   kullanıcı ile eşlenmiş şekilde saklanır (`device_tokens` tablosu:
   user_id, token, platform, updated_at). Çıkış yapan kullanıcının
   token'ı pasifleştirilir; geçersiz token'lar temizlenir.
4. Bildirime tıklanınca İLGİLİ EKRANA yönlendirme ZORUNLUDUR:
   - Her bildirim payload'ında bir yönlendirme verisi taşınır
     (ör. `route` + `id` alanları) ve go_router deep link altyapısıyla
     ilgili ekran açılır.
   - Üç durumda da doğru çalışır: uygulama açıkken, arka plandayken ve
     kapalıyken (initial message kontrolü). Bu üç senaryo ayrı ayrı
     test edilmeden bildirim işi "bitti" sayılmaz.
   - Hedef ekran auth gerektiriyorsa akış bozulmaz: giriş sonrası
     hedeflenen ekrana devam edilir.
5. Bildirim stratejisi RETENTION'I ARTIRACAK şekilde planlanır:
   - Uygulamanın özelliklerine göre bir bildirim planı hazırlanır ve bana
     sunulur: işlemsel bildirimler (mesaj geldi, sipariş güncellendi),
     yeniden etkinleştirme (win-back: X gündür girmeyen kullanıcı),
     kişiselleştirilmiş hatırlatmalar ve değer odaklı içerik bildirimleri.
   - Sıklık sınırı konur (spam yapılmaz); bildirim yorgunluğu izin
     iptaline yol açar. Sessiz saatler ve kullanıcının saat dilimi
     gözetilir.
   - Bildirim metinleri desteklenen TÜM dillerde hazırlanır (i18n kuralı
     bildirimler için de geçerlidir).
6. Admin panelden bildirim gönderimi bu altyapıyı kullanır: tekil/toplu
   gönderim, hedef ekran (route) seçimi, dil bazlı metin girişi ve
   zamanlama desteklenir. Gönderim Edge Function üzerinden yapılır;
   FCM server key/service account istemciye asla sızmaz.
7. Bildirim yapısı (payload şeması, route listesi, device_tokens tablosu,
   gönderim akışı) CLAUDE.md'ye işlenir.

## 10. SEO Kuralları — Web (KESİN)

1. Web sitesi ve landing page SEO kurallarına TAM UYUMLU yapılır. Bu kesin
   bir kuraldır; içerik, kodlama ve tasarım buna göre şekillenir.
2. Render: landing ve içerik sayfaları STATİK HTML olarak üretilir (elle
   yazılmış HTML, SSG veya prerender). İçeriği yalnızca tarayıcıda
   JavaScript ile çizen bir SPA landing YASAKTIR; bütün metin, başlık ve
   linkler ilk HTML yanıtında bulunur.
3. Teknik SEO:
   - Her sayfada benzersiz `<title>` (≤60 karakter, ana kelime başta) ve
     meta description (≤155 karakter, eyleme çağıran) bulunur.
   - Tek `h1` ve doğru başlık hiyerarşisi, semantik HTML (header, main,
     nav, footer, article), anlamlı `alt` metinleri, açıklayıcı görsel
     dosya adları kullanılır.
   - Tek kanonik adres: HTTPS zorunludur. www/www'suz ve sondaki `/`
     tek biçime 301 ile yönlendirilir (`.htaccess`), her sayfada
     `canonical` bulunur.
   - `sitemap.xml` tüm sayfaları ve dil sürümlerini `lastmod` ile içerir.
     `robots.txt` sitemap satırını içerir; CSS/JS engellenmez.
   - Admin panel ve staging ASLA indekslenmez: `noindex`
     (`X-Robots-Tag` başlığı + meta) ve robots `Disallow` uygulanır.
   - Özel 404 sayfası gerçek 404 durum koduyla döner (soft 404 yok).
     URL'ler temiz ve küçük harflidir; iç linkleme planlıdır.
4. İçerikler anahtar kelime odaklı yazılır. Sayfa içerikleri hazırlanmadan
   önce hedef anahtar kelimeler belirlenip bana sunulur: dil bazında
   kelime → sayfa eşlemesi, arama niyeti ve gerekçesiyle. Kelimeler ASO
   kelimeleriyle tutarlıdır (Bölüm 11.1). Arama hacmi uydurulmaz; tahmin
   olduğu belirtilir.
5. Mobil uyumluluk (responsive) zorunludur; mobile-first tasarlanır.
6. Çok dil: her dil ayrı URL'de yaşar (`/tr/`, `/en/`). Her sayfa
   `hreflang` alternatiflerini + `x-default`'u ve doğru `<html lang>`'ı
   içerir. IP'ye veya tarayıcı diline göre otomatik yönlendirme yapılmaz,
   görünür bir dil seçici bulunur. Metinler çeviri değil yerelleştirmedir:
   her dilin kendi anahtar kelimeleriyle yazılır.
7. Performans (Core Web Vitals, mobil, 75. persentil):
   - Hedefler: LCP ≤ 2,5 sn · INP ≤ 200 ms · CLS ≤ 0,1. Lighthouse mobil
     skoru Performance, Accessibility, Best Practices ve SEO'da ≥ 90.
   - Görseller WebP/AVIF formatında ve `width`/`height` belirtilerek
     kullanılır. LCP görseli `fetchpriority="high"` alır ve lazy
     yüklenmez; diğer görseller `loading="lazy"` ile yüklenir.
   - Fontlar `font-display: swap` ve preload ile yüklenir. Kritik olmayan
     JS ertelenir. gzip/brotli sıkıştırma ve cache başlıkları
     `.htaccess`'te tanımlıdır.
   - Her web deploy'unda Lighthouse ölçülür ve sonuç docs/SEO.md'ye
     yazılır; hedefin altındaki skor düzeltilmeden iş bitmiş sayılmaz.
8. Structured data (JSON-LD): Organization, WebSite,
   MobileApplication/SoftwareApplication (ad, işletim sistemi, kategori,
   fiyat, store linkleri) ve BreadcrumbList kullanılır. `aggregateRating`
   yalnızca gerçek ve doğrulanabilir puanla eklenir. Google FAQ/HowTo
   zengin sonuçlarını büyük ölçüde kısıtladığı için beklenti bunlara
   dayandırılmaz. Şema Rich Results Test ile doğrulanır.
9. Paylaşım ve marka: Open Graph (her dil için 1200×630 görsel) ve
   `twitter:card=summary_large_image` eklenir. Favicon seti, web
   manifest ve `theme-color` bulunur.
10. Uygulamaya köprü: iOS Smart App Banner
   (`<meta name="apple-itunes-app" content="app-id=…">`) ve resmî, dile
   uygun App Store / Google Play rozetleri kullanılır. Rozet linkleri
   kampanya parametresi taşır (Apple `pt`/`ct`, Play `referrer` + UTM).
   Deep link dosyaları doğru content-type ile sunulur (Bölüm 6.2).
11. Search Console + Bing Webmaster Tools kurulur: alan adı doğrulanır
   (tercihen DNS TXT) ve sitemap gönderilir. Gerekli erişim/doğrulama
   İhtiyaç Merkezi kaydıyla istenir (Bölüm 16.6). Yayından sonra kapsam
   ve hata raporları kontrol edilir.
12. Web analitiği ve çerezler: çerezsiz bir analitik aracı (Plausible,
   Umami vb.) ya da GA4 + Consent Mode v2 kullanılır. Zorunlu olmayan
   çerez varsa KVKK/GDPR uyumlu bir çerez bandı eklenir; "Reddet" ile
   "Kabul et" eşit görünürlükte olur.
13. İçerik kalitesi: içerik gerçek, özgün ve faydalı olur (E-E-A-T);
   gizlilik politikası, kullanım koşulları, hesap silme ve iletişim
   sayfaları bulunur. Uygulama içi ve store metinleriyle aynı dil ve
   vaatler kullanılır.
14. SEO kararları (kelime eşlemesi, sayfa yapısı, Lighthouse sonuçları,
   Search Console notları) `docs/SEO.md`'ye yazılır.

## 11. ASO Kuralları — Mobil (KESİN)

1. Anahtar kelime araştırması yapılır ve bana öneri olarak sunulur; onay
   sonrası uygulanır.
   - Kapsam: hedeflenen HER mağaza ülkesi ve HER dil.
   - Rakip analizi: ilk 10 rakibin adı, alt başlığı, açıklama dili,
     puanı/yorum sayısı ve ekran görüntülerindeki mesajları çıkarılır.
   - Kaynaklar: store arama önerileri (autocomplete), rakip metadata'sı,
     varsa Apple Search Ads popülerlik skoru ve Google Trends.
   - Çıktı `docs/ASO.md`'ye tablo olarak yazılır: kelime | mağaza/dil |
     alaka | tahmini popülerlik | rekabet | yerleşim (ad / alt başlık /
     keywords / kısa açıklama / uzun açıklama).
   - Arama hacmi UYDURULMAZ; her tahmin "tahmin" diye işaretlenir.
2. Metadata limitleri ve yazım kuralları:
   | Alan | App Store | Google Play |
   |---|---|---|
   | Ad / başlık | 30 | 30 |
   | Alt başlık / kısa açıklama | 30 | 80 |
   | Anahtar kelimeler | 100 (yalnız Apple) | — |
   | Promosyon metni | 170 (sürüm gerektirmeden güncellenir) | — |
   | Açıklama | 4000 | 4000 |
   | Yenilikler | 4000 | 500 |
   - Apple keywords alanı: kelimeler virgülle ve boşluksuz ayrılır. Ad
     ve alt başlıktaki kelimeler tekrarlanmaz, tekil/çoğul tekrarı
     yapılmaz. "app", kategori adı, rakip veya marka adı yazılmaz.
     Apple'da açıklama arama sıralamasını etkilemez; dönüşüm için yazılır.
   - Google Play'de uzun açıklama aramaya dahildir: ana kelimeler doğal
     cümlelerde birkaç kez geçer, kelime yığma yapılmaz.
   - Politika (Play metadata politikası, Apple 2.3.7): başlık, ikon ve
     geliştirici adında emoji, marka değilse TAMAMI BÜYÜK HARF, "en
     iyi", "#1", "ücretsiz", "indirim", "yeni" gibi performans/promosyon
     ifadeleri ve alakasız kelimeler kullanılmaz.
   - Limitler ve biçim her release'ten önce otomatik doğrulanır
     (`fastlane check_metadata`, Bölüm 12.2). Aşım varsa release durur.
3. Store görselleri — MÜKEMMEL, modern ve pazarlama odaklı:
   - Hikâye: ilk 3 görsel uygulamanın ana değerini anlatır (arama
     sonuçlarında görünen onlardır). Her görselde tek bir fayda vardır;
     başlık 2-5 kelimelik, fayda odaklı ve o dilin anahtar kelimelerini
     içeren bir cümledir, isteğe bağlı kısa bir alt satır eklenir.
   - Tasarım: uygulama temasıyla aynı renk ve tipografi kullanılır. Modern
     cihaz çerçevesi, geniş boşluk, okunaklı büyük başlık ve tutarlı
     kompozisyon olur; seri bütün olarak bir hikâye gibi akar.
   - İçerik kuralları: reklam GÖRÜNMEZ (demo modunda reklam katmanı
     kapalı). Gerçekçi ama uydurma, kişisel veri içermeyen demo veri
     kullanılır. Durum çubuğu temizdir (09:41, tam pil, bildirim yok).
     Görsel uygulamanın GERÇEK kullanımını gösterir (Apple 2.3.3) ve
     yanıltıcı içerik barındırmaz.
   - Boyutlar: iOS 6.9" 1320×2868 (zorunlu set); iPad destekleniyorsa
     13" 2064×2752. Play telefon 1080×1920; en az 4, en fazla 8 görsel.
     Tablet destekleniyorsa 7" ve 10" setleri eklenir. Play feature
     graphic 1024×500, ikon 512×512. Görseller düzleştirilmiş, alfa
     kanalsız JPEG/PNG olur.
   - Üretim tamamen OTOMATİKTİR ve her dil için tekrarlanabilir:
     1) Ham ekranlar `integration_test` ile DEMO_MODE'da, her dil ve
        cihaz için alınır (`tool/store_screenshots/capture.sh`).
     2) HTML/CSS şablonuyla cihaz çerçevesi + yerelleştirilmiş başlık
        eklenir ve headless Chrome ile store boyutlarında üretilir
        (`node tool/store_screenshots/render.mjs`).
     3) Çıktılar fastlane'in yüklediği klasörlere yazılır
        (`fastlane/screenshots/<ios-locale>/`,
        `fastlane/metadata/android/<locale>/images/`).
     Şablon ve betikler skill'in `assets/store-screenshots/`
     klasöründedir.
   - İsteğe bağlı: 15-30 sn'lik uygulama önizleme videosu (Apple) ve
     promo videosu (Play YouTube linki).
4. Dil ve yerelleştirme: global projede temel dil İNGİLİZCE'dir. Uygulamanın
   desteklediği HER dil için store metinleri, keywords, ekran görüntüsü
   başlıkları ve görsellerdeki uygulama arayüzü O DİLDE hazırlanır.
   - Bu çeviri değil yerelleştirmedir: her dil için o dilde gerçekten
     aranan kelimeler ayrıca araştırılır (Bölüm 11.1).
   - Desteklenen diller listesi tek kaynaktır (Fastfile `LOCALES`, ARB
     dosyalarıyla aynı). Store'da dil eksik kalamaz.
   - Apple bazı mağazalarda birden fazla dilin metadata'sını indeksler
     (Apple'ın güncel "storefront ve diller" tablosu). Hedef mağazanın
     indekslediği ek dil, ilgili ve anlamlı içerikle ek keyword alanı
     olarak değerlendirilir.
5. Dönüşüm optimizasyonu: Apple Product Page Optimization (ikon/görsel
   A/B testi), Custom Product Pages (keyword atanarak aramada da
   gösterilebilir) ve In-App Events kullanılır. Play'de store listing
   experiments ve ülke/kampanya bazlı custom store listings kullanılır.
   Yayından sonraki ilk deneme planı `docs/ASO.md`'de hazır bulunur.
6. Kalite sinyalleri sıralamayı etkiler:
   - Play Android vitals eşiklerinin altında kalınır (kullanıcının
     algıladığı çökme oranı < %1,09, ANR oranı < %0,47); Crashlytics ile
     izlenir (Bölüm 14).
   - Puanlama doğru anda istenir (Bölüm 8.10). Yorumlara yanıt için her
     dilde şablonlar hazırlanır.
7. Kategori ve bağlantılar: birincil/ikincil kategori gerekçesiyle seçilir,
   Play etiketleri (tags) belirlenir. Destek, pazarlama ve gizlilik
   URL'leri landing'deki gerçek sayfalara işaret eder; copyright bilgisi
   girilir.
8. Ölçüm ve iterasyon:
   - Kaynaklar: App Store Connect Analytics (gösterim, ürün sayfası
     görüntüleme, dönüşüm oranı, trafik kaynağı) ve Play Console store
     listing acquisition raporları; kampanya linkleriyle kaynak ayrımı.
   - Her release'te veya ayda bir ASO gözden geçirilir. Değişiklik
     günlüğü (ne değişti, öncesi/sonrası metrikler) `docs/ASO.md`'de
     tutulur.
9. ASO kararları (uygulama adı, kelimeler, metinler, görsel mesajları,
   deneyler) `docs/ASO.md`'ye yazılır ve CLAUDE.md'den referanslanır.

## 12. Release ve Deploy Otomasyonu (KESİN)

1. TEK KOMUTLA release alınabilecek, tamamen otomatik bir otomasyon kurulur
   (Fastlane + `release.sh`). Version code otomatik artar; version name
   parametreyle artar (patch/minor/major).
   - `./release.sh mobile <android|ios|all> internal` — TEST dağıtımı:
     * Android: AAB **internal testing** track'ine yüklenir, aynı build
       **closed testing** (`alpha`) track'ine terfi ettirilir. Closed
       testing'de "testers" adlı test listesi tanımlıdır.
     * iOS: build TestFlight'a yüklenir. İç testçiler (App Store Connect
       kullanıcıları) build'i otomatik alır. Ayrıca "testers" adlı HARİCİ
       TestFlight grubu yoksa otomatik oluşturulur (public link açık),
       `fastlane/testers.txt`'teki e-postalar gruba eklenir, build gruba
       dağıtılır ve Beta App Review'a gönderilir. Bunun için gereken
       iletişim bilgileri `fastlane/beta_review_info.json`'dadır.
   - `./release.sh mobile <android|ios|all> promote` — TEST EDİLEN AYNI
     BUILD'İ YAYINA ALMA (önerilen yol: "bir kez derle, terfi ettir").
     Yeniden derleme ve sürüm artışı yoktur:
     * Android: closed testing'deki build production'a terfi eder
       (`PLAY_ROLLOUT` ile kademeli).
     * iOS: TestFlight'taki build, metadata ve görsellerle App Store
       incelemesine gönderilir.
     * GitHub Release ön sürümden "latest"e çevrilir.
   - `./release.sh mobile <android|ios|all> production` — DOĞRUDAN YAYIN
     (yalnızca acil düzeltmede; test aşaması atlanır):
     * Android: production track'e, `PLAY_ROLLOUT` ile kademeli
       (varsayılan %20) yüklenir.
     * iOS: App Store'a metadata + görsellerle yüklenir, precheck'ten
       geçer ve incelemeye gönderilir. Onaydan sonra yayın elle yapılır
       (`automatic_release: false`).
   - Tek seferlik store gerçekleri (İhtiyaç Merkezi kaydı ile yapılır):
     * Play Console'da uygulama oluşturulur ve İLK AAB elle yüklenir;
       API, uygulama Play'de en az bir kez sürüm almadan çalışmaz.
       Uygulama hiç yayınlanmamışsa (draft app) script sürümü "draft"
       olarak oluşturur ve bunu bildirir.
     * Play'de internal ve closed testing için "testers" e-posta listesi
       oluşturulur.
     * Yeni kişisel Play geliştirici hesaplarında production'a geçmeden
       önce closed testing'de en az 12 testçinin 14 gün kesintisiz test
       etmesi şarttır. Bu süre plana dahil edilir.
   - Test linkleri (Play opt-in linki, TestFlight public link) release
     çıktısında gösterilir ve `docs/RELEASE.md`'ye yazılır.
2. Store metinleri ve görselleri fastlane yapısıyla yönetilir ve
   uygulamanın desteklediği TÜM dillerde (Fastfile `LOCALES`) KESİNLİKLE
   hazırlanır:
   - iOS — `fastlane/metadata/ios/<locale>/`: `name`, `subtitle`,
     `keywords`, `promotional_text`, `description`, `privacy_url`,
     `support_url`, `marketing_url`. Kök dizinde `copyright`,
     `primary_category`, `secondary_category`. Görseller
     `fastlane/screenshots/<locale>/` altındadır.
   - Android — `fastlane/metadata/android/<locale>/`: `title`,
     `short_description`, `full_description`, `video` (opsiyonel),
     `changelogs/<versionCode>.txt`; `images/` altında `icon`,
     `featureGraphic` ve `phoneScreenshots/`.
   - Release öncesi `fastlane check_metadata` HER dil için dosyaların
     varlığını, karakter limitlerini, keywords biçimini, Play
     başlık/politika yasaklarını ve görsel sayılarını doğrular.
     Eksik veya hatalı bir şey varsa release başlamaz.
   - Uygulamaya yeni bir dil eklendiğinde metadata ve görseller de o dil
     için eklenir; store metinleri ile uygulama dilleri asla ayrışmaz.
   - Metadata ve görseller fastlane üzerinden gönderilir; store
     panellerinde elle metin/görsel düzenlenmez.
3. Güncelleme (yeni sürüm) süreci de tamamen fastlane scriptinden yönetilir:
   version bump → build → changelog/yenilikler metni → yükleme tek akıştır.
4. Değişiklik kaydı ZORUNLUDUR: her uygulamanın kendi kökünde Keep a
   Changelog formatında `CHANGELOG.md` tutulur (`apps/mobile/`,
   `apps/panel/`, `apps/web/`); her uygulama kendi sürüm numarasını taşır.
   - Her sürüm `## [x.y.z] - YYYY-MM-DD` başlığı altında Added / Changed /
     Fixed / Removed gruplarıyla yazılır.
   - Geliştirme sırasında değişiklikler `[Unreleased]` bölümünde biriktirilir;
     release anında script bu bölümü sürüm numarasına çevirir.
   - "Yenilikler" metninin kaynağı CHANGELOG.md'dir. Akış:
     * Desteklenen diller Fastfile'daki `LOCALES` tablosunda TEK yerde
       tanımlıdır (kanonik dil → Android/iOS locale kodu); uygulama dilleri
       (ARB) ile birebir aynıdır. İlk dil varsayılan dildir.
     * Release'ten ÖNCE Claude, `[Unreleased]` içeriğini kullanıcıya
       yönelik sade bir dile çevirip her dil için
       `fastlane/release_notes/<sürüm>/<dil>.txt` dosyasını yazar ve
       commit'ler. Varsayılan dilin dosyası yoksa script bunu CHANGELOG
       bölümünden otomatik üretir; diğer dillerin dosyası EKSİKSE release
       hiçbir şey değiştirilmeden durur.
     * Play Store "yenilikler" sınırı 500 karakterdir; aşan dosya release'i
       durdurur.
     * Android'de notlar `metadata/android/<locale>/changelogs/<versionCode>.txt`
       olarak yazılıp yüklenir; iOS App Store'da her locale'in
       `release_notes`'u, TestFlight'ta varsayılan dil "What to Test"
       olarak gönderilir.
   - Her release sonrası CHANGELOG.md güncellenmiş halde COMMIT'LENİR ve
     uygulamanın annotated tag'i atılır (`mobile/v1.2.0` — Bölüm 15.6).
   - Release scripti başarısız olursa iz bırakmaz: hiçbir store'a yükleme
     yapılmadıysa pubspec.yaml ve CHANGELOG.md eski haline döner. Bir
     platform yüklenip diğeri başarısız olduysa sürüm commit'lenir ve
     başarısız platform `./release.sh mobile <platform> <track> none` ile
     AYNI sürümle yeniden denenir.
5. Gerekli kimlik dosyaları ilgili path'lere yerleştirilir ve repoya
   COMMIT'LENİR (repo private):
   - Google Play service account JSON → `fastlane/keys/`
   - Apple App Store Connect API key (.p8) + key id + issuer id →
     `fastlane/keys/`
   - Android keystore + key.properties → `android/keys/`
   Bu dosyaların ne olduğu ve nasıl yenileneceği `fastlane/keys/README.md`
   dosyasında açıklanır. Path yapısı CLAUDE.md'ye işlenir.
   - iOS imzalama: Xcode projesinde (Runner target) "Automatically manage
     signing" açık ve Team seçili olur; release, App Store Connect API
     key'i ile `-allowProvisioningUpdates` kullanarak sertifika/profili
     kendisi yönetir. Apple Developer Team ID İhtiyaç Merkezi üzerinden istenir.
   - Fastlane `Gemfile` ile sabitlenir (`bundle exec fastlane`);
     `Gemfile` ve `Gemfile.lock` commit'lenir.
6. Web otomatik deploy ZORUNLUDUR ve SÜRÜMLÜDÜR (GitHub Actions):
   - main'e push / PR → `ci.yml`: yalnızca değişen uygulama (path filter)
     lint + test + build edilir. Bu adım deploy YAPMAZ; main her zaman
     yayınlanabilir durumda tutulur.
   - Yayın = tag: `./release.sh web` / `./release.sh panel` yerelde build
     kontrolü yapar, sürümü (`package.json`) ve CHANGELOG'u günceller,
     `web/vX.Y.Z` / `panel/vX.Y.Z` tag'ini atıp push'lar. Tag'i yakalayan
     `deploy-<app>-*.yml` workflow'u build + deploy yapar ve GitHub
     Release'e `dist.zip` yedeğini ekler.
   - Web değişikliği içeren her faz/özellik tamamlandığında Claude ilgili
     release komutunu kendisi çalıştırır; deploy elle beklenmez.
   - GERİ ALMA: workflow, Actions'ta "Run workflow" ile eski bir tag
     verilerek o sürüm yeniden deploy edilir; kod geri alınmaz.
   - Hostinger hedefi: build → FTPS (şifreli FTP) ile yükleme; sunucu
     FTPS desteklemiyorsa düz FTP'ye düşülür ve bu karar
     docs/DECISIONS.md'ye yazılır. FTP bilgileri GitHub Actions
     Secrets'ta tutulur, workflow dosyasına asla yazılmaz. SPA (admin
     panel / React site) Hostinger'a gidiyorsa client-side routing için
     `.htaccess` rewrite dosyası build çıktısına dahil edilir (şablon:
     `htaccess-spa.template` → `apps/<app>/public/.htaccess`).
   - Firebase Hosting hedefi: build → Firebase Hosting `live` kanalı
     (service account JSON Actions Secrets'ta).
   - Workflow kurulduğunda ilk deploy'da doğrulanır ve süreç
     `docs/CICD.md`'ye işlenir.
7. Release süreci (komutlar, track'ler, versiyonlama şeması, changelog
   akışı, web CI/CD) CLAUDE.md'de adım adım belgelenir; yeni bir session
   release'i tek başına alabilmelidir.
8. STORE HESAP GÜVENLİĞİ (KESİN) — yanlış hesapta yayın yapılmaz:
   - Yayın yapılacak hesaplar baştan kesinleştirilir. İhtiyaç Merkezi'nde
     `store-accounts` kaydıyla şunlar alınır: Play Console geliştirici adı
     + geliştirici hesap ID'si (Console URL'sindeki
     `/developers/<ID>/`) ve Apple takım adı + Team ID. Bunlar
     `docs/RELEASE.md`'ye yazılır. Bu kayıt işlenmeden HİÇBİR store
     işlemi (uygulama oluşturma, yükleme, metadata, test grubu) yapılmaz.
   - Chrome MCP ile bir store konsolu açıldığında birden fazla Google
     hesabı (`/u/0`, `/u/1`…), birden fazla Play geliştirici hesabı veya
     birden fazla App Store Connect takımı görünürse Claude HİÇBİR İŞLEM
     YAPMADAN DURUR ve sohbette açıkça sorar: "Şu hesaplar açık: …
     Hangisinden yayınlayayım?" Cevap `docs/RELEASE.md`'deki kayıtla
     karşılaştırılır; uyuşmazsa yine durulur. Bu, Bölüm 17.7'deki "fazlar
     arası soru sorulmaz" kuralının BİLİNÇLİ İSTİSNASIDIR.
   - Tek hesap görünse bile, her konsol işleminden önce aktif hesap
     doğrulanır: Play'de URL'deki geliştirici ID'si ve sayfadaki
     geliştirici adı, App Store Connect'te takım adı kayıtla eşleşmelidir.
     Eşleşmiyorsa işlem yapılmaz.
   - Otomasyon da doğrular: `fastlane verify_accounts`, API anahtarlarının
     bağlı olduğu hesapta `APP_IDENTIFIER` uygulamasının bulunduğunu
     kontrol eder. Uygulama yoksa (yanlış hesabın anahtarı) release
     DURUR. `release.sh` bu kontrolü her release'ten önce çalıştırır.
   - Claude store hesabı oluşturmaz, şifre girmez, hesap/takım
     değiştirmez. Girişleri kullanıcı kendisi yapar; hesap değişikliği
     yalnızca kullanıcının açık talimatıyla olur.

## 13. Veritabanı Performans ve Storage Kuralları (KESİN)

1. DB yapıları ve yazılacak tüm servisler KESİNLİKLE performanslı olur;
   en performanslı SQL yazılır ve modern Postgres yaklaşımları kullanılır.
2. Şema tasarımı: doğru veri tipleri (uuid, timestamptz, jsonb yerinde
   kullanım), normalize yapı, foreign key'ler ve gerekli constraint'ler.
   Sık sorgulanan kolonlara index (gerekirse partial/composite index)
   baştan planlanır.
3. Sorgu kuralları:
   - N+1 sorgu KESİNLİKLE yapılmaz; ilişkili veri join/nested select ile
     tek sorguda çekilir.
   - `SELECT *` yerine sadece gereken kolonlar seçilir.
   - Listelerde sayfalama zorunludur (büyük listelerde offset yerine
     keyset/cursor pagination tercih edilir).
   - Toplu işlemler tek tek değil batch/bulk olarak yapılır.
4. Karmaşık okuma senaryoları için view/materialized view, çok adımlı iş
   kuralları için Postgres function/RPC kullanılır; mantık istemciye değil
   veritabanına yakın tutulur. Sayaç benzeri değerler her istekte COUNT ile
   değil trigger/denormalize kolonla yönetilir.
5. RLS politikaları da performans gözetilerek yazılır (politika içinde
   maliyetli alt sorgulardan kaçınılır; gerekli yerlerde helper function +
   index kullanılır).
6. Kritik sorgular EXPLAIN ile kontrol edilir; yavaş sorgu tespit edilirse
   index/sorgu iyileştirmesi yapılıp CLAUDE.md'ye not düşülür.
7. Gerçek zamanlı (socket) ihtiyacı varsa Supabase Realtime kullanılır ve
   senaryoya uygun mod seçilir:
   - Postgres Changes: DB'ye yazılan verinin anında ekrana düşmesi gereken
     durumlar (chat mesajı, sipariş durumu, bildirim listesi) — kalıcılık
     DB'de olduğu için ek yapı gerekmez.
   - Broadcast: DB'ye yazılmayan, düşük gecikmeli istemciler arası mesajlar
     (yazıyor... göstergesi, canlı imleç).
   - Presence: online kullanıcı / oda takibi.
   Free tier limitleri gözetilir (200 eşzamanlı bağlantı, 2M mesaj/ay);
   gereksiz kanal aboneliği açılmaz, ekran kapanınca kanal kapatılır.
   RLS realtime kanallarında da geçerli olacak şekilde kurgulanır.
   Kanal yapısı ve hangi ekranın neyi dinlediği CLAUDE.md'ye işlenir.
   WebRTC / ultra düşük gecikme gerektiren senaryolar (sesli-görüntülü
   görüşme, gerçek zamanlı çok oyunculu oyun) Supabase Realtime kapsamı
   dışındadır; böyle bir ihtiyaç doğarsa kodlamadan önce bana danışılır.
8. Storage (R2) kullanımı: dosyalara erişim presigned URL ile verilir,
   bucket'lar public yapılmaz. Görseller yüklenmeden önce optimize edilir
   (boyutlandırma/sıkıştırma, uygunsa WebP). Dosya yolları
   `{entity}/{id}/{dosya}` düzeninde tutulur ve yapı CLAUDE.md'ye işlenir.
   R2 erişim anahtarları secrets olarak yönetilir; API üzerinden imzalama
   Edge Function'da yapılır, anahtar istemciye asla gönderilmez.
9. Supabase free tier uyku önlemi: proje 7 gün istek almazsa Supabase
   tarafından duraklatılır. Bunu önlemek için GitHub Actions'ta zamanlanmış
   (cron, günde 1 kez) bir keep-alive workflow kurulur; hafif bir tabloya
   basit bir select isteği atar. Supabase URL ve anon key workflow'a
   Actions Secrets üzerinden verilir; workflow dosyasına yazılmaz.
   Workflow kurulduğunda ilk çalışması doğrulanır ve CLAUDE.md'ye işlenir.
10. Edge Function güvenliği:
   - Her function'da auth kontrolü yapılır (JWT doğrulama); anonim erişim
     yalnızca bilinçli olarak açılır ve gerekçesi CLAUDE.md'ye yazılır.
   - Input validation zorunludur: gelen gövde şema ile doğrulanır (zod
     veya eşdeğeri); doğrulanmamış input DB'ye/R2'ye ulaşmaz.
   - Kötüye kullanıma açık function'lara (presigned URL üretimi, bildirim
     gönderimi, hesap silme) rate limiting eklenir (kullanıcı başına
     istek sınırı; basit bir sayaç tablosu veya token bucket ile).
   - Presigned URL'ler kısa ömürlü üretilir (dakikalar), dosya boyutu ve
     content-type kısıtı ile birlikte imzalanır.
   - Service role key SADECE Edge Function ortam değişkeninde yaşar;
     istemciye, loglara veya hata mesajlarına asla sızmaz.

## 14. İzleme — Crash ve Analytics (KESİN)

1. Firebase Crashlytics ve Firebase Analytics KESİNLİKLE KURULUR — bu
   opsiyonel değildir. Kurulum projenin İLK fazlarında yapılır (son faza
   bırakılmaz) ve her iki platformda da (Android + iOS) çalıştığı, test
   crash'i ve test event'i konsola düşürülerek DOĞRULANIR. Doğrulanmadan
   kurulum "bitti" sayılmaz.
2. Crashlytics kapsaması TAM olur: yakalanmamış TÜM hatalar (Flutter
   framework hataları, async/zone hataları, platform/native hatalar)
   Crashlytics'e raporlanır. try-catch ile yakalanan ama önemli hatalar da
   non-fatal olarak loglanır; hata sessizce yutulmaz. Kritik akışlara
   (auth, satın alma, bildirim, sync) breadcrumb/custom log eklenir ki
   crash anında oraya nasıl gelindiği görülebilsin.
3. Crash raporlarına kullanıcı id'si (Supabase user id) eşlenir ki hata
   ayıklamada hangi kullanıcının etkilendiği görülebilsin. Hassas veri
   (e-posta, isim, token) crash loglarına ASLA yazılmaz.
4. Analytics event'leri MUAZZAM ve EKSİKSİZ planlanır — hedef: uygulamada
   olan biten HER ŞEY hakkında bilgimizin olması. Kullanıcının uygulamada
   yaptığı ve ürün kararına girdi olabilecek hiçbir davranış izlenmeden
   kalmaz. Zorunlu kapsam:
   - Ekranlar: her ekran görüntüleme (`screen_view` + ekran adı) ve
     ekranda geçirilen süre.
   - Yaşam döngüsü: ilk açılış (`first_open`), oturum başlangıcı,
     onboarding adımları (`onboarding_step` + adım no, `onboarding_completed`,
     `onboarding_skipped`).
   - Auth: giriş başlatma/başarı/hata (provider parametresiyle:
     google/apple), çıkış, hesap silme.
   - Ana özellikler: uygulamanın HER ana özelliğinin kullanımı ayrı
     event'le izlenir (özellik planlanırken event'leri de planlanır).
   - Gelir funnel'ı: paywall görüntüleme (kaynağıyla: hangi ekrandan
     gelindi), plan seçimi, `purchase_started`, `purchase_completed`,
     `purchase_failed` (hata koduyla), `purchase_restored`, abonelik
     iptal sinyalleri.
   - Reklam: her formatın yüklenme/gösterim/tıklama/hata event'leri,
     `ad_rewarded_earned`, reklam kapatma davranışları.
   - Bildirim: izin isteme/verilme/reddedilme, bildirime tıklanma
     (route parametresiyle).
   - Hata/sürtünme: boş sonuç ekranları, başarısız aramalar, form
     doğrulama hataları — kullanıcının takıldığı yerler görünür olmalı.
5. Event isimlendirme standardı: snake_case, tutarlı fiil yapısı
   (`x_started` / `x_completed` / `x_failed`), parametreler de snake_case.
   Firebase limitlerine uyulur (event adı ≤40 karakter, event başına
   ≤25 parametre); limitler nedeniyle veri kaybedilecekse tasarım
   değiştirilir.
6. Event listesi ve parametreleri CLAUDE.md'de tablo olarak tutulur ve
   HER ZAMAN günceldir; yeni özellik eklenince event'leri de aynı işte
   eklenir — event'siz özellik merge edilmez. Kritik dönüşüm event'leri
   (satın alma funnel'ı) Firebase'de conversion olarak işaretlenmesi
   gerektiği bana hatırlatılır.
7. User property'leri de ayarlanır: abonelik durumu (free/premium),
   uygulama dili, onboarding tamamlandı mı, bildirim izni durumu —
   böylece her analiz bu kırılımlarla yapılabilir.
8. Debug/geliştirme trafiği analytics'i kirletmez: debug build'lerde
   analytics collection kapalı tutulur veya DebugView'a gider; gerçek
   veriyle karışmaz.
9. Bu veriler reklam yerleşimi, paywall ve onboarding optimizasyonu için
   kullanılır; önemli funnel'larda (paywall görüntüleme → satın alma,
   onboarding başlama → tamamlama) dönüşüm izlenebilir olmalıdır.

## 15. Test, Git, Repo ve Sürümleme Kuralları (KESİN)

1. Domain katmanındaki use case'ler ve kritik iş kuralları için unit test
   yazılır. Base yapılar test edilebilir tasarlanır.
2. Commit'ler Conventional Commits formatında, İngilizce atılır. Scope,
   değişen uygulama ya da alandır: `feat(mobile): …`, `fix(panel): …`,
   `feat(web): …`, `feat(supabase): …` (migration), `docs: …`,
   `chore(release): …`, `ci: …`. Birden fazla uygulamayı etkileyen bir
   özellik, uygulama bazında ayrı commit'lere bölünür. Bu sayede her
   uygulamanın geçmişi ve sürüm farkı temiz okunur.
3. HER iş/özellik tamamlandığında, yapılan işi doğru ve anlaşılır şekilde
   özetleyen bir commit MUTLAKA atılır. Commit mesajı işin ne yaptığını
   net anlatır (ör. `feat(mobile): add Google and Apple sign-in flow`).
   Anlamlı iş parçaları ayrı commit'lenir; dev bir "tüm proje" commit'i
   atılmaz. Birbiriyle ilgisiz değişiklikler aynı commit'e konmaz.
4. Repo yapısı — TEK repo, uygulama başına ayrı sürüm:
   ```
   <proje>/
   ├── apps/mobile/          Flutter (pubspec sürümü, fastlane/, CHANGELOG.md)
   ├── apps/panel/           React + Vite (package.json sürümü, CHANGELOG.md)
   ├── apps/web/             Landing/site (package.json sürümü, CHANGELOG.md)
   ├── packages/             paylaşılan TS paketleri (ör. supabase-types)
   ├── supabase/             ORTAK şema: migrations/, functions/
   ├── hub/ docs/ PLAN.md TODO.md CLAUDE.md
   ├── scripts/release/      release ve sürüm farkı scriptleri
   ├── .github/workflows/    ci.yml + deploy-<app>-*.yml + keepalive
   ├── release.sh            tek release girişi
   ├── package.json + pnpm-workspace.yaml   (pnpm workspace: panel + web + packages)
   └── .gitignore .gitattributes
   ```
   - İskelet skill'in `assets/repo/` klasöründen kurulur. Yalnızca
     kullanıcının istediği uygulamalar oluşturulur; örneğin web yoksa
     `apps/web` ve onun workflow'u eklenmez.
   - Node tarafı pnpm workspace kullanır. Supabase'den üretilen TS tipleri
     `packages/supabase-types`'ta tek yerde tutulur, panel ve web ortak
     kullanır.
5. Sürümleme (SemVer):
   - Mobil sürüm `apps/mobile/pubspec.yaml`'dan (`x.y.z+build`), panel ve
     web sürümü kendi `package.json`'larından okunur. Sürümler birbirinden
     bağımsızdır.
   - Kırıcı değişiklik → major, yeni özellik → minor, düzeltme → patch.
   - Sürüm numarasını yalnızca `release.sh` değiştirir; elle değiştirilmez.
6. TAG'LER (KESİN): her yayın bir annotated tag'dir —
   `mobile/vX.Y.Z`, `panel/vX.Y.Z`, `web/vX.Y.Z`.
   - Tag'i yalnızca `release.sh` atar ve bunu yalnızca store yüklemesi ya
     da build başarılı olduktan sonra yapar. Tag mesajı o sürümün
     CHANGELOG bölümüdür (`git show mobile/v1.2.0`).
   - Tag, main ile birlikte TEK ATOMİK push'la GitHub'a gönderilir
     (`git push --atomic origin main <tag>`).
   - Tag'ler DEĞİŞMEZ: silinmez, taşınmaz, force-push yapılmaz. Hatalı bir
     sürüm yeni bir patch sürümle düzeltilir.
7. YEDEKLEME — her tag bir GitHub Release'tir:
   - Mobil: `release.sh` o release'te yüklenen AAB/IPA'yı ekler. Test
     sürümleri pre-release olarak işaretlenir; `promote` sonrası "latest"
     yapılır.
   - Web/panel: deploy workflow'u `dist.zip`'i ekler.
   - Böylece yayınlanan HER sürümün hem kaynağı (tag) hem ikili dosyası
     (release asset'i) GitHub'da saklanır.
   - Android upload keystore'un repo dışında da çevrimdışı bir yedeği
     bulunur (İhtiyaç Merkezi kaydı ile kullanıcıya hatırlatılır).
8. Sürümler arası fark:
   - `./release.sh changes <app>`: son iki sürüm arasındaki commit'ler,
     dosya özeti ve CHANGELOG notları.
   - `./release.sh changes <app> <eski-tag> <yeni-tag>`: belirli bir
     aralık. `HEAD` verilirse son sürümden bu yana yapılanlar görülür.
   - Mobil ve panel farkına ortak `supabase/` değişiklikleri de dahildir.
   - Komutlar `docs/RELEASE.md`'de belgelenir.
9. Branch stratejisi — trunk-based:
   - `main` her zaman yayınlanabilir durumdadır. Claude küçük ve anlamlı
     commit'lerle çalışır. Riskli ya da uzun işler kısa ömürlü bir
     `feat/<konu>` branch'inde yapılır ve CI geçtikten sonra main'e
     alınır.
   - main'e force-push yapılmaz. Release yalnızca temiz bir main'den ve
     origin/main'i içeren bir HEAD'den alınır; script bunu zorunlu tutar.
   - GitHub'da main için branch koruması (force-push/silme yasağı, CI
     zorunlu) önerilir; ayarı kullanıcı yapar (İhtiyaç Merkezi kaydı).
10. GitHub reposu kickoff'ta oluşturulur: kullanıcının onayıyla
   `gh repo create <ad> --private --source . --push`. `gh` yoksa ya da
   oturum kapalıysa İhtiyaç Merkezi kaydı açılır. Repo bağlanana kadar
   tag'ler yerelde birikir; bağlanınca `git push --atomic origin main
   --tags` ile gönderilir.

## 16. CLAUDE.md ve Dokümantasyon Kuralları (KESİN)

1. CLAUDE.md bir İNDEKS ve YÖNLENDİRME dosyasıdır, ansiklopedi DEĞİLDİR.
   Claude Code bu dosyayı her session'da tamamen okur; şişmiş bir
   CLAUDE.md her oturumun context'ini yakar, yavaşlatır ve kaliteyi
   düşürür. Bu yüzden:
   - CLAUDE.md KESİNLİKLE 400 satırı geçemez. Bu sınır 300 satır dosya
     kuralı gibi mutlaktır; aşılırsa içerik `docs/` altına bölünür.
   - CLAUDE.md'de yalnızca şunlar bulunur: session başlangıç prosedürü,
     proje özeti (1 ekran), araç durumu tablosu, kuralların 10-15
     satırlık ÖZETİ + `docs/RULES.md`'ye referans, ve her konu için
     "detay şu dosyada" yönlendirmeleri.
   - Detay taşıyan HER ŞEY ayrı .md dosyasına gider ve CLAUDE.md'den
     REFERANSLA gösterilir. Bir bölüm 20 satırı aşıyorsa CLAUDE.md'de
     kalmaz, kendi dosyasına taşınır.
2. Kuralların tamamı (bu doküman) `docs/RULES.md` dosyasına yazılır ve
   HER ZAMAN güncel tutulur; CLAUDE.md ona "tüm kurallar için
   docs/RULES.md'yi oku — KESİNDİR" yönergesiyle referans verir.
3. Standart dokümantasyon yapısı (her biri gerektiğinde oluşturulur,
   CLAUDE.md'den referanslanır):
   - `docs/RULES.md` — kuralların tamamı
   - `docs/ARCHITECTURE.md` — katmanlar, klasör yapısı, base yapılar,
     ortak component listesi
   - `docs/DB_SCHEMA.md` — DB şeması DUMP gibi eksiksiz: tablolar,
     kolonlar, tipler, ilişkiler, index'ler, RLS politikaları. Şema her
     değiştiğinde güncellenir. Migration'lar `supabase/migrations/`
     altında SQL olarak versiyonlanır.
   - `docs/AUTH.md`, `docs/PUSH.md`, `docs/MONETIZATION.md` (reklam +
     RevenueCat), `docs/ANALYTICS.md` (event tablosu), `docs/RELEASE.md`
     (release süreci + key path'leri), `docs/CICD.md`, `docs/ADMIN_PANEL.md`,
     `docs/DECISIONS.md` (karar günlüğü: tarih — karar — gerekçe),
     `docs/ASO.md` (ad/id kararı, kelime tabloları, metinler, görsel
     mesajları, deneyler, ASO günlüğü), `docs/SEO.md` (kelime-sayfa
     eşlemesi, Lighthouse sonuçları, Search Console notları)
   - Gerekirse yeni konu için yeni dosya açılır; CLAUDE.md'ye referansı
     eklenir. Ana kural: bilgi TEK yerde yaşar, başka yerden referansla
     gösterilir — aynı bilgi iki dosyaya kopyalanmaz.
   - Bu dosyalar da 300 satır kuralına tabidir; aşarsa alt dosyalara
     bölünür (ör. `docs/db/tables-users.md`, `docs/db/rls.md`) ve üst
     dosya indeks olur.
   - TEK İSTİSNA: `docs/RULES.md`. Skill'deki kural dokümanının BİREBİR
     kopyasıdır; bölünmez, kısaltılmaz, yeniden düzenlenmez (kopya
     olduğu için skill ile senkronu bozulmasın). Tamamı her seferinde
     okunmaz; yapılacak işe ait bölüm "Bölüm N" başlığından bulunup
     okunur.
4. Yeni açılan session, CLAUDE.md'yi okuyup hangi bilginin hangi dosyada
   olduğunu bilmeli; ancak o session'ın işi için gereken dokümanları
   açmalıdır (hepsini değil). Öğrenilen her önemli bilgi ilgili docs
   dosyasına eklenir; CLAUDE.md'ye yalnızca yönlendirme değişirse
   dokunulur.
   YORUM KURALI: Bu dokümanın her yerinde geçen "CLAUDE.md'ye işlenir"
   ifadesi, "ilgili docs/ dosyasına yazılır ve CLAUDE.md'den referansla
   gösterilir" anlamındadır. Hiçbir madde, detayın CLAUDE.md'nin
   kendisine yazılması olarak yorumlanmaz.
5. Yapılacak işler dosyası (TODO.md) ZORUNLUDUR:
   - Repo kökünde `TODO.md` tutulur; daha sonra yapılacak, ertelenen,
     yarım kalan veya bilinçli olarak sonraya bırakılan HER iş buraya
     DETAYLI yazılır: işin ne olduğu, neden ertelendiği, hangi
     dosyaları/bölümleri ilgilendirdiği, varsa bağımlılıkları ve öncelik
     düzeyi (yüksek/orta/düşük).
   - Kayıtlar, bağlamı olmayan bir session'ın okuyup işi anlayabileceği
     netlikte yazılır (faz tanımı kuralıyla aynı mantık — bkz. Bölüm 17.3).
   - HER yeni session başında CLAUDE.md ile birlikte TODO.md de OKUNUR ve
     bana "şu işler eksik/bekliyor" diye kısaca hatırlatılır (öncelik
     sırasıyla). Bu hatırlatma yapılmadan yeni işe başlanmaz.
   - Bir iş tamamlandığında TODO.md'den SİLİNİR (silme, işi tamamlayan
     commit ile birlikte yapılır); dosyada asla bitmiş iş birikmez.
   - Bir iş sırasında yeni bir eksik fark edilirse (ör. "bu ekranın
     tablet düzeni yapılmadı") hemen TODO.md'ye eklenir; akılda tutulmaz.
   - CLAUDE.md'de TODO.md'ye açık bir referans bölümü bulunur
     ("Bekleyen işler için TODO.md'yi oku" yönergesiyle), böylece dosyayı
     bilmeyen bir session bile CLAUDE.md üzerinden ona ulaşır.
6. PROJE MERKEZİ (`hub/`) ZORUNLUDUR — plan ve kullanıcıdan beklenenler
   için yerel, canlı bir web arayüzü. Kurulum ve kullanım ayrıntıları
   `hub/README.md` dosyasındadır; ilgili iş yapılmadan önce okunur.
   - Kurulum: skill'in `assets/project-hub/` klasörü (examples/ hariç)
     projeye `hub/` olarak kopyalanır, `hub/config.json` yazılır.
     Bağımlılığı yoktur: `node hub/server.mjs --open`. Claude sunucuyu arka
     planda kendisi başlatır ve linki kullanıcıya verir.
   - PLAN EKRANI: PLAN.md ve docs/plan/phase-XX dosyalarını canlı okur
     (ayrı kopya tutulmaz). Faz durumları, kriter ilerlemesi, paralel
     gruplar, kalan süre ve faz detayları kullanıcıya buradan görünür. Bu
     yüzden PLAN.md ve faz dosyaları `hub/README.md`'deki biçime uyar ve
     faz dosyasındaki bitti kriterleri İŞ İLERLEDİKÇE işaretlenir.
   - İHTİYAÇ MERKEZİ: Kesintisiz çalışma sırasında (Bölüm 17.7)
     kullanıcıdan gereken HER ŞEY — API key'ler, service account dosyaları,
     FTP bilgileri, store hesap erişimleri, panel ayarları, onay gerektiren
     harici adımlar — çalışmayı DURDURMADAN `hub/needs/<id>.json` kaydı
     olarak eklenir. Kullanıcı sayfada formu doldurup gönderir.
   - Her kayıt, kullanıcıyı hiç bağlamı yokmuş gibi yönlendirir: ne
     gerektiği, neden gerektiği, hangi faz(lar)ı ve işleri beklettiği,
     ön koşullar, ADIM ADIM nereden bulunacağı (menü yolu + doğrudan link),
     kopyalanacak değerler, tuzaklar ve biçim doğrulamalı form alanları.
     Yazım kalitesi kuralları `hub/README.md`'dedir ve KESİNDİR.
   - ÖNCEDEN TALEP: Plan onaylandığında fazların öngörülebilen tüm dış
     ihtiyaçları hemen kayıt olarak açılır ve `phases` alanıyla fazlara
     bağlanır. Plan ekranı sıradaki fazların eksiklerini öne çıkararak
     kullanıcıyı faz gelmeden doldurmaya teşvik eder.
   - Her kayıt eklendiğinde çalışma çıktısında AÇIKÇA duyurulur:
     "İhtiyaç Merkezi'ne ekledim: <başlık> — <link>" formatında tek satır.
     Sessizce eklenmez.
   - HER FAZ GEÇİŞİNDE (ve her session başında) `node hub/server.mjs
     --status` çalıştırılır; gönderilmiş kayıtlar `hub/README.md`'deki akışla
     işlenir: doğrulanır, değer hedefine (env/secrets/keys) taşınır, kayıt
     `processed` (ya da düzeltme gerekçesiyle `rejected`) yapılır, inbox
     girdisi silinir, bloklanan iş GERİYE DÖNÜK tamamlanır, ilgili TODO.md
     kaydı kapatılır.
   - Güvenlik: değerler yalnızca `hub/inbox/` altına yazılır (kendi
     .gitignore'u ile repoya girmez) ve işlendikten sonra silinir. Kayıt
     dosyaları, commit'ler, loglar ve sohbet çıktısı değer İÇERMEZ.
     Sunucu yalnızca 127.0.0.1'den, oturum token'ı ile erişilebilir.
   - Bloklanan iş TODO.md'de de izlenir ve kayıt id'sine referans verir
     ("hub: play-service-account"); iki taraf birbirini gösterir.
   - CLAUDE.md'de Proje Merkezi'ne açık referans bulunur; session başı
     hatırlatmasında bekleyen kayıtlar link ile "senden şunlar
     bekleniyor" diye özetlenir.

## 17. Çalışma Şekli (KESİN)

0. İLK İŞ — CLAUDE.md oluşturulur: Proje session'ında yapılacak ilk iş,
   başka HİÇBİR işe (soru sorma dahil) geçmeden önce bu dokümandaki tüm
   kuralların docs/RULES.md'ye yazılması, ona referans veren indeks
   niteliğinde KISA bir CLAUDE.md (Bölüm 16.1), boş TODO.md ve Proje
   Merkezi'nin (hub/, Bölüm 16.6) kurulmasıdır. Sıralama kesindir:
   1) Monorepo iskeletini kur (Bölüm 15.4 — `git init -b main`,
      `assets/repo/`), docs/RULES.md + CLAUDE.md (indeks) + TODO.md +
      hub/ oluştur, ilk commit'i at, GitHub private reposunu bağla
      (Bölüm 15.10), Proje Merkezi sunucusunu başlatıp linki ver
   2) Araç (MCP/CLI) kontrolü yap — bkz. Bölüm 17.0.1
   3) Bölüm 17.8'deki soruları sor, cevapları CLAUDE.md'ye işle
   4) Planı/fazları sun, onay al
   5) Onaylanan planı PLAN.md indeksi + docs/plan/phase-XX dosyaları
      olarak yaz, fazların öngörülebilen dış ihtiyaçlarını İhtiyaç
      Merkezi'nde aç ve commit'le (Bölüm 17.3.3, 16.6)
   6) İşe başla
   Bu sıra, session erken kesilse bile kuralların kalıcı olmasını garanti
   eder. CLAUDE.md oluşturulmadan tek satır proje kodu yazılmaz.
0.1. Araç (MCP/CLI) kontrolü ZORUNLUDUR: İşe başlamadan önce, projede
   ihtiyaç duyulacak bağlantı araçlarının mevcut ve çalışır olup olmadığı
   kontrol edilir:
   - Supabase MCP: DB şeması, migration, RLS ve sorgu işlemleri için.
   - Firebase CLI: FCM, Crashlytics, Analytics ve (seçildiyse) Hosting
     deploy işlemleri için (`firebase --version` + oturum durumu
     kontrol edilir).
   - Chrome MCP (tarayıcı otomasyonu): admin panel ve web sitesinin
     gerçek tarayıcıda test edilmesi ile AdMob/RevenueCat/store
     panellerinde doğrulama gereken adımlar için. Store konsollarında
     her işlemden önce hesap doğrulanır, birden fazla hesap varsa
     kullanıcıya sorulur (Bölüm 12.8).
   - RevenueCat MCP: ürün/entitlement/offering yapılandırması ve satın
     alma tarafının yönetimi için.
   Kontrol sonucu bana raporlanır: hangileri BAĞLI, hangileri EKSİK.
   Eksik olanlar için benden kurulum/bağlantı İSTENİR — hangi aracın
   hangi iş için gerektiği açıklanarak. O araca bağımlı işler eksik
   araçla uydurularak yapılmaz: ya araç bağlanır ya da ihtiyaç
   İhtiyaç Merkezi'ne (Bölüm 16.6), bloklanan iş TODO.md'ye yazılıp bana
   bildirilir ve araç gerektirmeyen işlerle devam edilir. Mevcut araçlar ve durumları CLAUDE.md'ye
   işlenir; sonraki session'lar bu listeden hangi araçların
   kullanılabilir olduğunu bilir ve session başında hâlâ eksik olan
   araç varsa bana tekrar hatırlatır.
1. Bir işten emin değilsen ilerlemeden önce KESİNLİKLE soru sorarsın;
   işin netliğini ayarlarsın. ANCAK tüm sorular İŞİN EN BAŞINDA toplanıp
   sorulur (bkz. Bölüm 17.6-17.7); iş başladıktan sonra soru sorulmaz.
2. Büyük işlerde önce kısa bir plan sunar, onayımı aldıktan sonra kodlarsın.
3. Fazlandırma kuralı: Projeyi fazlara böldüysen, HER FAZI oldukça detaylı
   yazarsın — çünkü fazları subagent'lar uygulayacaktır ve subagent senin
   kafandaki bağlamı bilmez. Her faz tanımı şunları içerir:
   - Fazın amacı ve kapsamı (ne yapılacak, ne YAPILMAYACAK)
   - Oluşturulacak/değiştirilecek dosyalar ve klasör yapısı
   - Kullanılacak base yapılar, component'ler ve paketler
   - İlgili DB tabloları / API'ler / kanal yapıları
   - Uyulacak kurallar (bu dokümandan ilgili bölüm referanslarıyla:
     300 satır limiti, i18n, tema, back tuşu vb.)
   - Fazın "bitti" sayılma kriterleri (test edilecek senaryolar dahil)
   - Önceki fazlardan gelen bağımlılıklar ve sonraki faza devredilenler
3.1. KESİŞEN KONULAR faz tanımına SOMUT olarak yazılır — sadece bölüm
   referansı vermek YETERSİZDİR. Ekran/özellik içeren her fazda şu
   kontrol listesi tek tek doldurulur ve İÇERİĞİ faz tanımına açıkça
   yazılır (ilgili değilse "yok" diye belirtilir, sessizce atlanmaz):
   - Analytics event'leri: bu fazda eklenecek event adları,
     parametreleri ve hangi aksiyonda atılacakları LİSTE olarak yazılır
     (Bölüm 14 kapsamına göre).
   - Crashlytics: bu fazın kritik akışlarına eklenecek breadcrumb/
     non-fatal noktaları.
   - i18n: bu fazda eklenecek metin anahtarları ve hangi dillere
     ekleneceği.
   - Back tuşu: bu fazdaki her ekranın back davranışı.
   - Loading / empty / error / offline: bu fazdaki her ekran için bu
     durumların nasıl görüneceği.
   - Reklam: bu fazın ekranlarında reklam var mı; varsa format, yerleşim
     ve premium muafiyeti.
   - Bildirim: bu faz bildirim üretiyor/dinliyor mu; payload route'u ve
     tıklama hedefi.
   - RLS/güvenlik: bu fazın dokunduğu tablolar için politika etkisi.
   - Admin panel senkronu: bu faz panelde yönetim ekranı gerektiriyor mu
     (Bölüm 7.6).
   - CLAUDE.md/TODO.md güncellemesi: bu faz sonunda hangi bölümlerin
     güncelleneceği.
   ÖRNEK — "Profil ekranı" fazında yalnızca "profil ekranını yap" yazmak
   YASAKTIR; şu netlikte yazılır: "screen_view(screen_name=profile),
   profile_edit_started, profile_edit_completed, avatar_upload_started/
   completed/failed(error_code) event'leri eklenecek; metin anahtarları
   profile_title, profile_edit_button... en/tr ARB'lere eklenecek; back
   tuşu: kaydedilmemiş değişiklikte uyarı diyaloğu; avatar yükleme R2
   presigned URL akışıyla (Bölüm 13.8); bu ekran reklamsız; panelde
   kullanıcı detayına avatar alanı eklenecek."
3.2. Ana session, subagent çıktısını denetlerken (Bölüm 17.4) bu kontrol
   listesini de doğrular: fazda tanımlı event'ler/metinler/davranışlar
   kodda gerçekten var mı? Eksikse faz TAMAMLANMAMIŞTIR; eksik
   tamamlatılmadan sonraki faza geçilmez.
3.3. PLAN.md ZORUNLUDUR — plan dosyada yaşar, sohbette değil:
   - Fazlar onaylandıktan sonra plan repoya yazılır ve commit'lenir.
     Plan sohbet mesajı olarak kalmaz; session kesilse bile repodadır.
   - YAPI: `PLAN.md` kökte İNDEKS dosyasıdır (≤200 satır); her fazın
     detaylı tanımı (Bölüm 17.3 ve 17.3.1'deki tüm içerik) AYRI dosyada
     yaşar: `docs/plan/phase-01-<slug>.md`, `phase-02-...`. PLAN.md her
     faza referans verir; faz detayı PLAN.md'ye yazılmaz.
   - PLAN.md indeksi bir tablo içerir — faz no, ad, durum, bağımlılıklar,
     paralel grup, başlangıç, bitiş, süre, dosya linki — ve altında
     istatistik bloğu (Bölüm 17.3.4).
   - Durumlar: `[ ]` bekliyor, `[~]` devam ediyor (hangi alt parça
     çalışıyor notuyla), `[x]` tamamlandı (tarihle), `[iptal]`
     gerekçesiyle. Faz dosyasındaki bitti-kriteri checkbox'ları İŞ
     İLERLEDİKÇE işaretlenir (Proje Merkezi ilerlemeyi bunlardan canlı
     gösterir; paralel fazlarda her subagent yalnızca KENDİ faz dosyasını
     işaretler, PLAN.md'yi yalnızca ana session günceller). Faz
     denetimden geçip tamamlandığında (Bölüm 17.3.2) indeks satırı `[x]`
     yapılır — TODO.md'nin aksine SİLİNMEZ; plan, yol haritası ve
     ilerleme kaydı olarak bütün kalır. Biçim kuralları (sütunlar, durum
     işaretleri, süre birimleri) `hub/README.md`'dedir.
   - Subagent'a görev verilirken faz tanımı ilgili `docs/plan/phase-XX`
     dosyasından verilir — sohbetten özetlenerek değil. Böylece plan ile
     uygulama asla ayrışmaz.
3.4. Faz istatistikleri ZORUNLUDUR: Her faz tamamlandığında PLAN.md
   güncellenir ve kullanıcıya KISA bir istatistik özeti verilir:
   - Bu fazın süresi (başlangıç → bitiş; subagent çalışma süresi ve
     denetim/düzeltme süresi ayrı ayrı).
   - Toplam ilerleme: tamamlanan / toplam faz ve yüzdesi.
   - Tahmini kalan süre: kalan fazların, tamamlanan fazların ortalama
     süresine ve kalan fazların tahmini büyüklüğüne göre hesaplanmış
     kaba tahmini (paralel çalışan gruplar dikkate alınır).
   - Bu fazda TODO.md'ye / İhtiyaç Merkezi'ne eklenen kayıt sayısı ve
     bekleyen ihtiyaç varsa linkiyle hatırlatma.
   Özet 5-8 satırı geçmez; detay PLAN.md'nin istatistik bloğunda tutulur.
   Plan onaylanırken her faza başlangıç süre tahmini yazılır; gerçekleşen
   süre bunun yanına eklenir ki tahmin kalitesi zamanla iyileşsin.
   - Plan değişirse (faz eklendi/bölündü/kapsam değişti) PLAN.md
     güncellenir ve değişiklik gerekçesiyle commit'lenir; eski faz
     silinmez, "iptal — gerekçe" notu düşülür.
   - HER session başında CLAUDE.md ve TODO.md ile birlikte PLAN.md
     indeksi OKUNUR (faz dosyaları değil — yalnızca çalışılacak fazın
     dosyası açılır); kullanıcıya "şu fazlar bitti, sıradaki şu, kalan
     tahmini süre şu" özeti verilir ve kalınan yerden devam edilir.
     CLAUDE.md'de PLAN.md'ye açık referans bulunur.
   - İş bölümü netliği: PLAN.md ana yol haritasıdır; plan dışında
     ortaya çıkan/ertelenen işler TODO.md'ye gider (Bölüm 16.5);
     yayınlanan sürümler CHANGELOG.md'ye yazılır (Bölüm 12.4).
   Faz tanımı, hiçbir ek bağlam olmadan okuyan bir subagent'ın işi eksiksiz
   ve doğru yapabileceği netlikte olmalıdır.
4. Fazlar subagent workflow'ları ile yürütülür: her faz (veya fazın uygun
   alt parçaları) bir subagent'a görev olarak verilir. Ana session
   orkestrasyon, kod review ve fazlar arası bütünlük kontrolünü yapar;
   subagent çıktısı kurallara (mimari, 300 satır, i18n, tema) uygunluk
   açısından denetlenmeden o faz tamamlanmış sayılmaz.
4.1. PARALEL ÇALIŞMA ZORUNLUDUR — hız için birbirini bloklamayan fazlar
   aynı anda yürütülür:
   - Planlama aşamasında fazlar arası BAĞIMLILIK GRAFİĞİ çıkarılır: her
     faz için "neye bağlı" ve "neyi blokluyor" yazılır. Bağımlılığı
     olmayan veya aynı öncüllere bağlı fazlar bir PARALEL GRUP oluşturur
     (PLAN.md indeksinde "paralel grup" sütunu).
   - Bir paralel gruptaki fazlar AYNI ANDA ayrı subagent'lara verilir;
     sırayla yapılmaz. Ör: temel altyapı bittikten sonra "Auth ekranları",
     "Onboarding", "Admin panel iskeleti", "Landing page" çoğunlukla
     birbirinden bağımsızdır ve paralel yürütülür.
   - Paralel fazlar ÇAKIŞMAZ: her faz kendi feature klasöründe/kendi
     dosyalarında çalışır; ortak dosyalara (router, DI, tema, ARB, DB
     migration) dokunma ihtiyacı varsa bu, faz tanımında önceden yazılır
     ve ana session tarafından entegrasyon adımında birleştirilir.
     Aynı dosyayı iki subagent aynı anda değiştirmez.
   - Her paralel grup sonunda kısa bir ENTEGRASYON adımı vardır: ana
     session çıktıları birleştirir, build alır, çakışmaları çözer,
     denetimi (Bölüm 17.3.2) grup bazında yapar, sonra sonraki gruba geçer.
   - Fazlar bağımsız olsa da temel altyapı fazı (base yapılar, tema,
     router, i18n iskeleti, DB şeması) HER ŞEYDEN ÖNCE ve tek başına
     tamamlanır; diğer her şey ona bağlıdır. Bu faz olabildiğince
     küçük tutulur ki paralelleşme erken başlasın.
   - Paralel grup yapısı planla birlikte kullanıcıya sunulur; "bu 5 faz
     aynı anda yürüyecek" bilgisi tahmini süreye de yansıtılır.
5. Subagent (Task/alt görev ajanı) çalıştırırken model olarak SONNET
   kullanırsın; subagent'lara opus atanmaz. Bu tercih maliyet/hız dengesi
   içindir ve tüm subagent görevlerinde geçerlidir.
6. Sorular EN BAŞTA sorulur: Bölüm 17.8'deki liste dahil, plana ve fazlara
   dair TÜM sorular ve onaylar (reklam yerleşim planı, ASO kelimeleri,
   bundle id vb.) proje başlamadan tek seferde toplanıp bana sorulur.
   Cevaplar alınıp CLAUDE.md'ye işlendikten sonra iş başlar.
7. Fazlar arası geçişte SORU SORULMAZ: Ben özel bir durum belirtmediysem,
   fazlar arasında onay/soru için durulmaz; plan SONUNA KADAR kesintisiz
   uygulanır. Bir fazda öngörülmeyen ciddi bir engel çıkarsa (eksik
   erişim bilgisi, çelişen gereksinim gibi ilerlemeyi imkansız kılan
   durumlar) o iş atlanmaz, uydurulmaz; ihtiyaç İhtiyaç Merkezi'ne yazılır
   (Bölüm 16.6), iş TODO.md'ye bağlanır ve araç/bilgi gerektirmeyen
   işlerle KESİNTİSİZ devam edilir. Yalnızca projenin TAMAMI bloklandıysa
   bana sorulur ve durum gerekçesiyle açıklanır. İSTİSNA: store
   konsolunda hesap belirsizliği varsa her zaman durulup sorulur
   (Bölüm 12.8). Estetik veya
   tercihe dayalı kararlar için durulmaz; bu dokümandaki kurallara göre en
   iyi karar verilir ve iş sonunda verilen kararlar bana raporlanır.
8. Projeye başlamadan önce bana sorulacaklar (cevaplar CLAUDE.md'ye işlenir):
   - Web varlığı: landing mi, tam site mi, ikisi de mi? (Bölüm 6)
   - Admin panel deploy hedefi: Hostinger mi, Firebase Hosting mi? (Bölüm 7)
   - Admin panel giriş yöntemi ve admin hesapları (Bölüm 5.4)
   - Proje global mi, hedef dil/pazar ne? Uygulamanın destekleyeceği diller
     neler? Varsayılan dil ne olmalı? (Bölüm 2.5, 11.4 ve 12.2 — i18n ve
     store metadata bu dillere göre kurulur)
   - Reklam yerleşim planı onayı (Bölüm 8.5)
   - Push bildirim stratejisi onayı — retention planı, bildirim türleri
     ve sıklık (Bölüm 9.5)
   - Hedef ülkeler/mağazalar ve bilinen rakip uygulamalar (Bölüm 11.1)
   - Marka adı fikri var mı; alan adı mevcut mu, hangisi? (Bölüm 8.4, 10)
   - ASO anahtar kelime önerileri ve uygulama adı/paket adı adaylarının
     onayı — benzersizlik kontrolü yapılmış olarak (Bölüm 11.1, 8.4)
   - SEO hedef anahtar kelimeleri onayı (Bölüm 10.4)
   - Yayın hesapları: hangi Play Console ve hangi Apple Developer hesabı?
     (İhtiyaç Merkezi `store-accounts` kaydıyla alınır — Bölüm 12.8)
   - Storage gerekiyorsa: R2 mi Supabase Storage mı (Bölüm 1 ve 13.8)
   - Web deploy hedefi Hostinger ise FTPS destekli mi (Bölüm 12.6)
   ERİŞİM BİLGİLERİ (FTP şifresi, R2 anahtarları, API key'ler, store
   hesap dosyaları) sohbetten İSTENMEZ — İhtiyaç Merkezi kaydı olarak
   açılır (Bölüm 16.6); sorular yalnızca karar ve onaylar içindir.
