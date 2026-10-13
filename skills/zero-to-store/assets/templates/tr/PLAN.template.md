# PLAN — {{PROJE_ADI}} Yol Haritası (İNDEKS)

> Bu dosya indekstir (≤200 satır). Faz detayları `docs/plan/phase-XX-*.md`
> dosyalarındadır. Biten fazlar İŞARETLENİR, silinmez. Subagent görevleri
> faz dosyalarındaki tanımlardan verilir.
> Durum: [ ] bekliyor · [~] ne sürüyor · [x] YYYY-AA-GG · [iptal] gerekçe
> Proje Merkezi bu dosyayı canlı okur: tablo sütunlarını DEĞİŞTİRME;
> süreler `2s`, `1.5s`, `1s30d`, `45d` biçiminde (s=saat, d=dakika).

## Bağımlılık Grafiği
```
P01 (altyapı) ─┬─> P02 auth ──┐
               ├─> P03 onboarding ─┼─> P06 ana özellik A ──> P08 entegrasyon
               ├─> P04 panel iskeleti ┘
               └─> P05 landing
```
Paralel gruplar: G1 = {P01} · G2 = {P02, P03, P04, P05} · G3 = {P06, P07} ...

## Faz İndeksi
| # | Faz | Durum | Bağlı | Grup | Tahmin | Başlangıç | Bitiş | Süre | Dosya |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Temel altyapı | [ ] | — | G1 | 2s | | | | [phase-01](docs/plan/phase-01-altyapi.md) |
| 02 | Auth | [ ] | 01 | G2 | 1.5s | | | | [phase-02](docs/plan/phase-02-auth.md) |

## İstatistik
- Tamamlanan: 0 / N faz (0%)
- Toplam geçen süre: — · Ortalama faz süresi: —
- Tahmini kalan süre: — (paralel gruplar dikkate alınarak)
- Son güncelleme: —

## Faz Tamamlanma Günlüğü
<!-- Her satır "- " ile başlar. Örnek:
- [x] P01 — 2026-09-01 10:00 → 12:10 (2s10d; subagent 1s40d, denetim 30d). TODO +1, ihtiyaç +0 -->
