# CLAUDE.md — {{PROJE_ADI}}

> Bu dosya bir İNDEKSTİR (≤400 satır). Detay taşımaz; her konu için ilgili
> docs/ dosyasına yönlendirir. Her session bu dosyayı okur, sonra yalnızca
> işi için gereken dokümanları açar.

## 0. Session Başlangıç Prosedürü
1. Bu dosyayı oku.
2. `PLAN.md` indeksini oku; biten fazları, sıradaki fazı, tahmini kalan
   süreyi kullanıcıya özetle. Yalnızca çalışılacak fazın dosyasını aç.
3. `TODO.md`'yi oku; bekleyen işleri öncelik sırasıyla hatırlat.
4. Proje Merkezi'ni başlat (`node hub/server.mjs`, arka planda) ve
   `node hub/server.mjs --status` çalıştır; gönderilmiş ihtiyaçları
   `hub/README.md` akışıyla işle, bekleyenleri linkiyle "senden şunlar
   bekleniyor" diye özetle.
5. Araç durumunu (Bölüm 2) kontrol et; eksik varsa hatırlat.
6. Ancak bundan sonra işe başla.

## 1. Proje Özeti
- **Proje adı:** {{PROJE_ADI}} — **Ne yapar:** {{KISA_ACIKLAMA}}
- **Bundle ID:** {{BUNDLE_ID}} (DEĞİŞTİRİLEMEZ)
- **Diller:** {{DILLER}} | Varsayılan: {{VARSAYILAN_DIL}}
- **Web varlığı:** {{LANDING_MI_SITE_MI}} — **Panel deploy:** {{HEDEF}}
- **Stack:** Flutter (Riverpod, go_router) · React panel · Supabase ·
  Firebase (FCM/Crashlytics/Analytics) · AdMob · RevenueCat · R2
- **Repo:** monorepo — `apps/mobile` · `apps/panel` · `apps/web` · ortak `supabase/`
  (her uygulamanın kendi sürümü/CHANGELOG'u/tag'i: `mobile/vX.Y.Z` — RULES Bölüm 15)
- **Release:** `./release.sh mobile all internal` → test edildikten sonra
  `./release.sh mobile all promote` · `./release.sh web` · `./release.sh panel` ·
  sürüm farkı: `./release.sh changes <app>` (ayrıntı: `docs/RELEASE.md`)

## 2. Araçlar (MCP/CLI) Durumu
| Araç | Durum | Not |
|---|---|---|
| Supabase MCP | {{BAGLI/EKSIK}} | |
| Firebase CLI | {{BAGLI/EKSIK}} | |
| Chrome MCP | {{BAGLI/EKSIK}} | |
| RevenueCat MCP | {{BAGLI/EKSIK}} | |

## 3. KURALLAR — KESİN
Projenin tüm kuralları **`docs/RULES.md`** dosyasındadır ve KESİNDİR.
Herhangi bir iş yapmadan önce ilgili bölümünü oku. Özet hatırlatma:
- SOLID + Clean Architecture, feature-first; hiçbir dosya 300 satırı geçmez
- Tüm metinler i18n (ARB); hardcode metin yok
- Her ekran: loading/empty/error/offline + back tuşu davranışı
- Her özellik: analytics event'leri + Crashlytics breadcrumb ile birlikte gelir
- Her özellik: Android emulator + iOS simulator'da test edilmeden bitmez
- Giriş sadece Google + Apple; e-posta yok
- Reklam AdMob (premium'a gösterilmez), IAP RevenueCat
- Fazlar subagent (Sonnet) ile, bağımsızlar PARALEL; fazlar arası soru yok
- Kullanıcıdan gereken her şey İhtiyaç Merkezi'ne (hub/needs/) — sohbetten key istenmez
- Store işlemi yalnızca docs/RELEASE.md'deki DOĞRU hesapta; çoklu hesapta önce SOR (Bölüm 12.8)
- Store metinleri/görselleri desteklenen HER dilde; release öncesi `fastlane check_metadata`
- Detay taşıyan bilgi docs/ altına yazılır, buraya sadece referans gelir

## 4. Doküman Haritası (detay için oku)
| Konu | Dosya |
|---|---|
| Mimari, klasör yapısı, base yapılar, component listesi | `docs/ARCHITECTURE.md` |
| DB şeması (dump), RLS, index'ler | `docs/DB_SCHEMA.md` |
| Auth akışları, provider ayarları, hesap silme | `docs/AUTH.md` |
| Push: payload şeması, route listesi, device_tokens | `docs/PUSH.md` |
| Reklam yerleşim planı, ad unit'ler, RevenueCat ürün/entitlement | `docs/MONETIZATION.md` |
| Analytics event tablosu, user property'ler | `docs/ANALYTICS.md` |
| Release süreci, fastlane, key path'leri, changelog akışı, DOĞRU store hesapları, test linkleri | `docs/RELEASE.md` |
| ASO: ad/paket adı kararı, kelime tabloları, store metinleri, görsel mesajları, deneyler | `docs/ASO.md` |
| SEO: kelime-sayfa eşlemesi, Lighthouse sonuçları, Search Console | `docs/SEO.md` |
| Store görselleri üretimi (capture + render) | `tool/store_screenshots/README.md` |
| Web CI/CD workflow'ları, secret isimleri | `docs/CICD.md` |
| Admin panel yapısı ve yönetilen alanlar | `docs/ADMIN_PANEL.md` |
| Karar günlüğü (tarih — karar — gerekçe) | `docs/DECISIONS.md` |
| Faz detayları | `docs/plan/phase-XX-*.md` |
| Proje Merkezi: ihtiyaç kaydı şeması, işleme akışı, PLAN.md biçimi | `hub/README.md` |

## 5. Çalışma Dosyaları
- **`PLAN.md`** — faz indeksi, durumlar, süreler, istatistik (biten işaretlenir)
- **`TODO.md`** — plan dışı/ertelenen işler (bitince silinir)
- **Proje Merkezi** — `node hub/server.mjs --open` → http://127.0.0.1:{{PORT}}
  canlı plan + İhtiyaç Merkezi (kullanıcıdan beklenen key/dosya/bilgi)
- **`CHANGELOG.md`** — yayınlanan sürümler
