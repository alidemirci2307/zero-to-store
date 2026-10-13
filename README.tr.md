<p align="center">
  <img src="docs/images/banner.png" alt="zero-to-store — uygulama fikrinden App Store ve Google Play'e" width="100%">
</p>

<p align="center">
  <a href="https://github.com/alidemirci2307/zero-to-store/releases"><img src="https://img.shields.io/github/v/release/alidemirci2307/zero-to-store?label=release&color=7c3aed" alt="Release"></a>
  <a href="https://github.com/alidemirci2307/zero-to-store/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/alidemirci2307/zero-to-store/ci.yml?label=CI" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e" alt="MIT"></a>
  <img src="https://img.shields.io/badge/Claude%20Code-plugin-d97757" alt="Claude Code plugin">
  <img src="https://img.shields.io/badge/lang-EN%20%C2%B7%20TR-0ea5e9" alt="İngilizce ve Türkçe">
</p>

<p align="center"><a href="README.md">English</a> · <b>Türkçe</b></p>

**zero-to-store**, bir mobil uygulama fikrini App Store ve Google Play'e kadar
götüren bir Claude Code plugin'idir. Claude ürünü fazlara böler; Flutter
uygulamasını, React admin paneli, Supabase backend'i ve landing sayfasını
paralel olarak geliştirir ve tamamen otomatik, çok dilli store release'leriyle
yayına alır. Arkasındaki kural seti net tercihleri olan, üretim kalitesinde
bir standarttır. Her şeyi yerel **Proje Merkezi**'nden canlı izlersin.

## Neden

- **Tek komutla başlangıç.** `/zero-to-store:kickoff <fikrin>`. Claude bütün
  soruları en başta bir kez sorar, sonra planın tamamını durmadan uygular.
- **Uygulama yayınlatan kurallar.** Clean Architecture, 300 satır dosya sınırı,
  ilk günden i18n, çevrimdışı durumlar, zorunlu güncelleme, hesap silme,
  ATT + UMP onayı, privacy manifest ve store veri güvenliği cevapları.
- **Dahili ASO ve SEO.** Anahtar kelime araştırması, iki mağazada
  benzersizliği kontrol edilen uygulama adları, her dil için doğrulanan metin
  limitleri ve her dilde otomatik üretilen modern store görselleri.
- **Otomatik pilotta release.** Play internal + closed testing ve TestFlight
  "testers" grubu. Test build'leri yeniden derlenmeden production'a terfi
  eder. Her release bir git tag'i ve bir GitHub Release yedeğidir.
- **Asla yanlış hesap yok.** Store hesapları bir kez kesinleştirilir. Konsolda
  birden fazla hesap görünürse Claude durup sorar; API anahtarları başka bir
  hesaba aitse release iptal olur.
- **Ne olduğunu hep bilirsin.** Proje Merkezi yol haritasını canlı gösterir ve
  Claude'un senden tam olarak neye ihtiyacı olduğunu, her birini nereden
  bulacağını adım adım listeler.

## Ekran görüntüleri

**Proje Merkezi — canlı yol haritası**

![Proje Merkezi yol haritası](docs/images/hub-plan.jpg)

**İhtiyaç Merkezi — Claude'un senden beklediği her şey ve nereden bulunacağı**

![İhtiyaç Merkezi](docs/images/hub-needs.jpg)

**Store görselleri — her dil ve her store boyutu için otomatik üretilir**

![Üretilen store görselleri](docs/images/store-screenshots.jpg)

## Hızlı başlangıç

Claude Code plugin'i olarak kur:

```text
/plugin marketplace add alidemirci2307/zero-to-store
/plugin install zero-to-store@zero-to-store
```

Sonra boş bir klasör aç ve uygulamanı anlat:

```text
/zero-to-store:kickoff Yemek planlama uygulaması: haftalık plan, tarifler, otomatik alışveriş listesi, reklamsız premium
```

Diğer kurulum yolları:

- **Terminal:** `claude plugin marketplace add alidemirci2307/zero-to-store && claude plugin install zero-to-store@zero-to-store`
- **skills.sh:** `npx skills add alidemirci2307/zero-to-store`
- **Elle:** repoyu klonla ve `./install.sh` (kişisel) ya da `./install.sh --project` çalıştır

## Nasıl çalışır

1. **İskelet.** Monorepo (`apps/mobile`, `apps/panel`, `apps/web`, ortak
   `supabase/`), CLAUDE.md, kurallar ve Proje Merkezi oluşturulup
   commit'lenir; private bir GitHub reposu bağlanır.
2. **Araç kontrolü.** Supabase MCP, Firebase CLI, Chrome MCP ve RevenueCat
   MCP kontrol edilir; eksikler istenir.
3. **Bütün sorular tek seferde.** Web varlığı, diller, reklam ve bildirim
   stratejisi, ASO/SEO kelimeleri ve iki mağazada kontrol edilmiş uygulama /
   paket adı adayları. Gizli bilgiler sohbette asla istenmez; İhtiyaç
   Merkezi'nden alınır.
4. **Plan.** Bağımlılık grafiği ve paralel gruplarla detaylı fazlar.
   Öngörülebilen her dış ihtiyaç hemen İhtiyaç Merkezi'nde açılır.
5. **Geliştirme.** Fazlar paralel subagent'larda yürür. Her grup entegrasyon
   ve kural denetimiyle biter; ilerleme Proje Merkezi'nde canlı görünür.
6. **Release.** `./release.sh mobile all internal` → test →
   `./release.sh mobile all promote`. Web ve panel tag ile deploy edilir:
   `./release.sh web`.

## İçinde neler var

| Parça | Ne yapar |
|---|---|
| `skills/zero-to-store/references/rules.md` | 17 bölümlük kural seti (İngilizce; `rules.tr.md` Türkçe, CI ile senkron tutulur) |
| `assets/repo/` | Monorepo iskeleti: `release.sh`, release scriptleri, değişen uygulamaya göre CI, tag ile deploy, pnpm workspace |
| `assets/project-hub/` | Bağımlılıksız yerel web uygulaması: canlı yol haritası + İhtiyaç Merkezi (EN/TR arayüz) |
| `assets/store-screenshots/` | Her dil × cihaz için Flutter çekimi + store boyutlarında çerçeveli görseller |
| `assets/templates/` | Metadata/ASO doğrulamalı Fastfile, CLAUDE/PLAN/PHASE/TODO şablonları (EN + TR) |
| `commands/kickoff.md` | `/zero-to-store:kickoff` komutu |

## Release komutları (projende)

| Komut | Sonuç |
|---|---|
| `./release.sh mobile all internal` | Play internal + closed testing, TestFlight "testers" grubu, `mobile/vX.Y.Z` tag'i, AAB/IPA'lı ön sürüm |
| `./release.sh mobile all promote` | Test edilen aynı build production'a çıkar (Play'de kademeli, App Store incelemesi) |
| `./release.sh web` / `./release.sh panel` | `web/vX.Y.Z` tag'i → CI deploy eder ve `dist.zip` ekler |
| `./release.sh changes mobile` | Son iki sürüm arasındaki commit'ler, dosya özeti ve notlar |

## Gereksinimler

- Claude Code (Opus veya Sonnet), Node 18+, Git, GitHub CLI
- Mobil için: Flutter, Xcode (iOS), Android SDK, Ruby + Bundler (fastlane)
- Google Chrome (store görseli üretimi)
- Yayın aşamasında Apple Developer ve Google Play Console hesapları

## Güncelleme

Yeni sürümler [Releases](https://github.com/alidemirci2307/zero-to-store/releases)
ve [CHANGELOG.md](CHANGELOG.md) üzerinden duyurulur. Güncellemek için:

```text
claude plugin update zero-to-store@zero-to-store
```

Ya da otomatik güncellemeyi aç: `/plugin` → Marketplaces → zero-to-store → Enable auto-update.
Mevcut projeler kuralların kendi kopyasını tutar (`docs/RULES.md`). Birini
güncellemek için Claude'a "docs/RULES.md'yi en güncel zero-to-store
kurallarıyla senkronla" demen yeterli.

## SSS

- **Başka dillerde çalışır mı?** Claude seninle kendi dilinde konuşur. Kurallar
  ve şablonlar İngilizce ve Türkçe gelir; proje dokümanları projenin dilini
  izler.
- **Her parçaya ihtiyacım var mı?** Hayır. Yalnızca istediğin uygulamalar
  oluşturulur; web varlığı yoksa `apps/web` ve web workflow'u da olmaz.
- **Anahtarlarım nereye gidiyor?** Bilgisayarındaki `hub/inbox/` klasörüne
  (asla commit'lenmez). Claude her değeri hedefine (env, GitHub Secrets,
  `fastlane/keys/`) taşır ve sonra inbox'tan siler.

## Katkı

Issue ve pull request'ler memnuniyetle karşılanır — bkz. [CONTRIBUTING.md](CONTRIBUTING.md).
Kural değişiklikleri hem `rules.md`'de hem `rules.tr.md`'de yapılmalıdır; CI
iki dosyanın yapısının eşleştiğini kontrol eder.

## Lisans

[MIT](LICENSE) © Ali Demirci. zero-to-store sana zaman kazandırdıysa bir ⭐ başkalarının da bulmasına yardım eder.
