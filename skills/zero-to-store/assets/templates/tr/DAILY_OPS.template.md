# Günlük operasyon — {{PROJECT_NAME}}

> YEREL bir zamanlanmış görevin talimatı (RULES.md Bölüm 18), ör. her gün
> 09:00'da. Kimlikler, eşikler ve otonomi seviyesi `ops/config.json`
> dosyasından gelir; buraya asla yazılmaz. Raporları {{REPORT_LANGUAGE}}
> dilinde yaz. Subagent'lara `model: "sonnet"` ver; derleme, test ve analyze
> yalnızca ana oturumda çalışır.

## 0. Koruma
1. Proje köküne geç; `ops/config.json`, `docs/OPS.md`, en son
   `docs/ops/daily/*.md` raporunu ("Yarın" bölümü) ve pazartesileri en son
   `docs/ops/weekly-*.md` dosyasını oku.
2. Kilit: `ops/.lock` varsa ve 6 saatten yeniyse dur ve "önceki çalışma
   hâlâ sürüyor" bildirimi gönder. Daha eskiyse bayat olarak raporla ve
   üzerine yaz. Kilidi şimdi oluştur, sonunda ve hata durumunda da kaldır.
3. `git status --porcelain` boş değilse yalnızca veri ve rapor moduna geç.
   Boşsa `git checkout main && git pull --rebase origin main` çalıştır.
4. Kendi açmadığın bir emülatörü ya da simülatörü asla kapatma.

## 1. Veri toplama (salt okunur)
- İki mağazanın yayın durumu (incelemedeki sürümler, kademeli yayın
  oranları, phased release durumu).
- Platform başına Crashlytics: 7 ve 90 gün için öne çıkan sorunlar ve
  sürümler; fatal, non-fatal ve ANR ayrı ayrı; geri gelen ya da yeni
  sorunlara bak.
- Play Android vitals: son sürüm için kullanıcının algıladığı çökme ve ANR
  oranları.
- Analitik: `docs/ANALYTICS.md`'deki huniler ve hatalar, son 7 gün ve
  önceki 7 gün.
- İki mağazanın yorum ve puanları; dünkü raporda olmayanları yeni olarak
  işaretle.
- `ops/config.json`'daki anahtar kelime ve ülkeler için ASO sıraları.
- Varsa `ops/scripts/` altındaki proje script'lerini kullan; yoksa bağlı
  MCP araçlarını ya da hesap kontrolünden sonra Chrome MCP'yi salt okunur
  kullan (Bölüm 12.8).
- Robot trafiğini ayıkla ve gerçek kullanıcıları ayrı say.
  `minHumansForRatios` sayısının altında oran ve huni yorumlama; bunu yaz.

## 2. Çökmeler
- Önce regresyonlar, sonra gerçek kullanıcıyı etkileyen yeni sorunlar.
- İncelediğin her sorun için: yığın izi, özel anahtarlar ve loglar → koddaki
  kök neden → etkilenen sürüm ve cihazlar (robot mu, insan mı).
- Önce mevcut notları listele, sonra her soruna günde bir not ekle:
  "İncelendi <tarih> (günlük operasyon): <kök neden> → <aksiyon>".
- Sorun yoksa "0 sorun" yaz.

## 3. Karar
1. En yeni sürümde regresyon ya da SLO'nun altında çökmesiz kullanıcı oranı
   → kademeli yayın sürüyorsa hemen `./release.sh halt` çalıştır.
2. Yorumlardan somut bir hata (önce 1-2 yıldızlılar) → kodda yeniden üret.
3. Analitikte verilerle kanıtlanmış bir davranış sorunu (yalnızca insan
   verisi).
4. Dünkü "Yarın" maddeleri ve yol haritasındaki sıradaki madde.
5. ASO: sıra düşüşleri, puan değişimleri, yorum temaları; alan ve dil grubu
   başına haftada en fazla bir deneme (Bölüm 18.9).

Yayın yalnızca kullanıcıyı etkileyen, verilerle kanıtlanmış bir düzeltme ya
da ölçülebilir bir iyileştirme için yapılır; günde en fazla bir yayın.
"Bugün yayın yok" normal bir sonuçtur.

## 4. Geliştirme (otonomi `fix-to-testing` ya da üstü)
- Günün değişikliğini küçük tut; ~600 satırı aşanı parçala.
- Hatayı yeniden üreten bir test ekle; `flutter analyze` sıfır sorun
  vermeli, `flutter test` geçmeli.
- Diff'i en az iki bağımsız subagent'a çürütmeye çalıştırarak incelet
  (doğruluk ve regresyon; platform ve i18n); doğruladıklarını düzelt.
- Proje kurallarına uy: kullanıcıya görünen her metin bütün ARB
  dosyalarında, analitik yalnızca analitik servisi üzerinden, yeni veri
  türü yok.
- Kesin sınırlar listesindeki (Bölüm 18.8) her iş bunun yerine İhtiyaç
  Merkezi kaydı olur.

## 5. Yayın
- `./release.sh mobile all internal` (önce CHANGELOG `[Unreleased]` ve
  sürüm notu çevirileri).
- Yalnızca bekleme süresini (`soakHours`) yeni çökme kümesi olmadan geçmiş
  daha eski bir build'i terfi ettir: `./release.sh mobile all promote`.
  `fix-to-testing` seviyesinde terfi kullanıcıya listelenir.
- Sağlıklı bir kademeli yayını adım adım genişlet: `./release.sh rollout
  0.5`, sonra `1`.
- Bir adım başarısız olursa bir kez tekrar dene; sonra dur ve hatanın
  tamamını rapora yaz. Yayın olmayan günlerde store build'i başlatacak
  hiçbir şey push'lama.

## 6. Yorumlar
- Yorumun dilinde cevap ver: kısa, sakin, teşekkür eden. Yayınlanmamış bir
  şeyi vaat etme, kişisel veri isteme, tartışmaya girme, bir kez cevap ver.
- Bir düzeltmeden yalnızca yayındaysa, sürümüyle birlikte bahset.
- 1-2 yıldızlı cevaplar yalnızca `full-auto` seviyesinde gönderilir; diğer
  seviyelerde kullanıcı için rapora taslak olarak yaz.
- Gönderilen her cevabı rapora yaz.

## 7. Haftalık değerlendirme (pazartesi)
- 28 günlük veri kullan: bu hafta ve geçen hafta.
- En fazla beş aksiyon; her biri için neden (hangi sayı), nasıl ölçüleceği
  (hangi olay) ve hangi dosya.
- Geçen haftanın aksiyonlarını ve süren ASO denemesini referans değerine
  göre kontrol et; eksik loglamayı listele.
- `docs/ops/weekly-YYYY-MM-DD.md` dosyasını yaz.

## 8. Rapor ve bildirim
- `ops/metrics.jsonl` dosyasına bir satır ekle (biçim: `hub/README.md`).
- `docs/ops/daily/YYYY-MM-DD.md` dosyasını şu bölümlerle yaz: Özet, Rakamlar
  (7 gün ve önceki 7 gün), Çökmeler, Yorumlar, ASO, Geliştirme, Yayın,
  Kullanıcıdan beklenenler, Yarın. Hangi modun çalıştığını yaz (tek ajan ya
  da çok ajanlı).
- Yalnızca kullanıcının yapabileceği her iş için İhtiyaç Merkezi kaydı aç.
- Üç satırlık bir özet bildirimi gönder (push ya da ayarlı kanal).
- Bugün yayın günü değilse raporu `[ci skip]` ile commit'le.

## 9. Bitiş
- `ops/.lock` dosyasını kaldır.
- Son mesaj: rapor yolu, özet, yaptıkların (notlar, yayın, cevaplar, ASO) ve
  kullanıcının yapması gerekenler.
