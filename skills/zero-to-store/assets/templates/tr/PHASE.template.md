# Faz {{NO}}: {{FAZ_ADI}}

> Durum: [ ] · Bağlı: {{ONCUL_FAZLAR}} · Bloklar: {{SONRAKI_FAZLAR}} ·
> Paralel grup: {{GRUP}} · Tahmin: {{SURE}} · Gerçekleşen: —

## Amaç ve Kapsam
- Yapılacak: ...
- YAPILMAYACAK (kapsam dışı): ...

## Dosyalar / Klasör Yapısı
- Bu faz SADECE şu klasörlerde çalışır: `apps/mobile/lib/features/xxx/`, `apps/panel/src/features/xxx/`, ...
- Commit scope'u: `feat(mobile)`, `feat(panel)`, `feat(web)`, `feat(supabase)` — uygulama başına ayrı commit
- Ortak dosyalara dokunma ihtiyacı (router/DI/ARB/migration): ... —
  entegrasyon adımında ana session birleştirir.

## Base Yapılar, Component'ler, Paketler
- ...

## DB / API / Kanallar
- ...

## Kesişen Konular (RULES.md Bölüm 17.3.1 — hepsi doldurulur, ilgisizse "yok")
- **Analytics event'leri:** event_adı(parametreler) — ne zaman
- **Crashlytics:** breadcrumb/non-fatal noktaları
- **i18n:** metin anahtarları + diller
- **Back tuşu:** ekran bazında
- **Loading/empty/error/offline:** ekran bazında
- **Reklam:** format + yerleşim + premium muafiyeti / yok
- **Bildirim:** payload route + tıklama hedefi / yok
- **RLS/güvenlik:** etkilenen tablolar / yok
- **Admin panel senkronu:** gereken panel ekranı / yok
- **Kullanıcıdan gerekenler:** İhtiyaç Merkezi kayıt id'leri (`phases` alanında bu faz) / yok
- **Docs güncellemesi:** faz sonunda güncellenecek docs/ dosyaları

## Bitti Kriterleri
<!-- İş ilerledikçe işaretle: Proje Merkezi ilerlemeyi bu kutulardan canlı gösterir. -->
- [ ] ...
- [ ] Android emulator + iOS simulator'da doğrulandı
- [ ] Ana session denetimi geçti (kurallar + kesişen konular kodda mevcut)
- [ ] İlgili docs/ dosyaları güncellendi, PLAN.md indeksi işaretlendi

## Bağımlılıklar
- Önceki fazlardan gelen: ...
- Sonraki faza devredilen: ...
