# CLAUDE.md — {{PROJE_ADI}}

> Bu dosya bir İNDEKSTİR (≤400 satır). Detay taşımaz; her konu için ilgili
> docs/ dosyasına yönlendirir. Her session bu dosyayı okur, sonra yalnızca
> işi için gereken dokümanları açar.
>
> **Konuşma dili: {{KONUSMA_DILI}}.** Kullanıcıya giden her mesaj bu
> dildedir; dosyalar, araçlar ya da subagent'lar İngilizce olsa bile (RULES
> Bölüm 17.10).

## 0. Session Başlangıç Prosedürü
1. Bu dosyayı oku.
2. `PLAN.md` indeksini oku; biten fazları, sıradaki fazı, tahmini kalan
   süreyi ve son session'dan beri Claude'un kendi verdiği kararları
   (`docs/DECISIONS.md`) kullanıcıya özetle. Yalnızca çalışılacak fazın dosyasını aç.
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
- **Web varlığı:** {{WEB_VARLIGI}} — **Admin panel:** {{PANEL}} — **Hosting:** {{HOSTING}}
- **Stack:** Flutter (Riverpod, go_router) · Firebase Analytics + Crashlytics ·
  backend: {{BACKEND}} · gelir modeli: {{GELIR_MODELI}} · tasarım: {{TASARIM_YAKLASIMI}}
  (tüm başlangıç cevapları: `docs/PRODUCT.md`, kararlar: `docs/DECISIONS.md`)
- **Repo:** monorepo — yalnızca seçilen uygulamalar (`apps/mobile` · `apps/panel` · `apps/web`) · ortak backend klasörü
  (her uygulamanın kendi sürümü/CHANGELOG'u/tag'i: `mobile/vX.Y.Z` — RULES Bölüm 15)
- **Release:** `./release.sh mobile all internal` → test edildikten sonra
  `./release.sh mobile all promote` · `./release.sh web` · `./release.sh panel` ·
  sürüm farkı: `./release.sh changes <app>` (ayrıntı: `docs/RELEASE.md`)

## 2. Araçlar (MCP/CLI) Durumu
| Araç | Durum | Not |
|---|---|---|
| Backend araçları ({{BACKEND}}: Supabase MCP + CLI ya da Firebase CLI) | {{BAGLI/EKSIK}} | |
| Firebase CLI + FlutterFire CLI (her zaman) | {{BAGLI/EKSIK}} | |
| Chrome MCP (konsol işleri, RULES Bölüm 16.7) | {{BAGLI/EKSIK}} | |
| RevenueCat MCP (satın alma varsa) | {{BAGLI/EKSIK}} | |
| GitHub CLI (`gh`) | {{BAGLI/EKSIK}} | |
| Claude Design (Artifact aracı, seçildiyse) | {{BAGLI/EKSIK}} | |

## 3. KURALLAR — KESİN
Projenin tüm kuralları **`docs/RULES.md`** dosyasındadır ve KESİNDİR.
Herhangi bir iş yapmadan önce ilgili bölümünü oku. Özet hatırlatma:
- SOLID + Clean Architecture, feature-first; hiçbir dosya 300 satırı geçmez
- Tüm metinler i18n (ARB); hardcode metin yok
- Her ekran: loading/empty/error/offline + back tuşu davranışı
- Her özellik: analytics event'leri + Crashlytics breadcrumb ile birlikte gelir
- Her özellik: Android emulator + iOS simulator'da test edilmeden bitmez
- Giriş sadece Google + Apple (e-posta yok); ana işlev hesapsız çalışıyorsa misafir modu
- Gelir modeli seçildiği gibi: AdMob reklamları premium'a gösterilmez, IAP RevenueCat, politikaya uygun paywall (RULES Bölüm 3.9)
- Arayüz onaylanan tasarıma birebir uyar (`docs/design/DESIGN.md`)
- Fazlar subagent (Sonnet) ile, bağımsızlar PARALEL; fazlar arası soru: {{FAZ_ARASI_SORU}} (`yok` = tüm sorular en başta, planlama sırasında sorulur — RULES Bölüm 17.7)
- Yoldaki kararlar: Claude en iyi pratiğe göre kendisi karar verir; para, yasal ya da geri alınamaz adımlarda asla tek başına değil; her kararı `docs/DECISIONS.md`'ye yazar (RULES Bölüm 17.12)
- Önce Claude yapar (CLI, MCP, Chrome — RULES Bölüm 16.7); yalnızca kalanı İhtiyaç Merkezi'ne (hub/needs/); sohbetten key istenmez
- Store işlemi yalnızca docs/RELEASE.md'deki DOĞRU hesapta; çoklu hesapta önce SOR (Bölüm 12.8)
- Store metinleri/görselleri desteklenen HER dilde; release öncesi `fastlane check_metadata`
- Detay taşıyan bilgi docs/ altına yazılır, buraya sadece referans gelir

## 4. Doküman Haritası (detay için oku)
| Konu | Dosya |
|---|---|
| Başlangıç cevapları: fikir, hedef kitle, v1 kapsamı, yığın seçimleri | `docs/PRODUCT.md` |
| Tasarım brief'i, onaylanan Design System + canvas linkleri, onay tarihi | `docs/design/` |
| Mimari, klasör yapısı, base yapılar, component listesi | `docs/ARCHITECTURE.md` |
| DB şeması (dump), RLS, index'ler | `docs/DB_SCHEMA.md` |
| Auth akışları, provider ayarları, hesap silme | `docs/AUTH.md` |
| Push: payload şeması, route listesi, device_tokens | `docs/PUSH.md` |
| Reklam yerleşim planı, ad unit'ler, RevenueCat ürün/entitlement | `docs/MONETIZATION.md` |
| Analytics event tablosu, user property'ler | `docs/ANALYTICS.md` |
| Release süreci, fastlane, key path'leri, changelog akışı, DOĞRU store hesapları, test linkleri | `docs/RELEASE.md` |
| Yayın sonrası operasyon: otonomi seviyesi, zamanlama, SLO, raporlar (`docs/ops/`), metrikler (`ops/`) | `docs/OPS.md` |
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
