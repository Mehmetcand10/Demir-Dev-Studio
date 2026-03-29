import Link from "next/link";
import { ArrowRight, ShieldCheck, Gem, TrendingUp, Store, Package, Users, Maximize2 } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      
      {/* 1. HERO SECTION (Devasa Tipografi ve Karşılama) */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-4 bg-anthracite-50 overflow-hidden">
        
        {/* Arka plan Lüks Efektleri */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-anthracite-900/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-anthracite-200 bg-white/50 backdrop-blur-md px-4 py-1.5 text-xs font-black uppercase tracking-widest text-anthracite-800 shadow-sm">
            <Gem className="w-3.5 h-3.5 text-emerald-600" /> Yeni Nesil B2B Tekstil Ekosistemi
          </span>
          <h1 className="text-5xl sm:text-7xl lg:text-[6rem] font-black tracking-tighter mb-8 max-w-5xl text-anthracite-900 leading-[1.1] drop-shadow-sm">
            MODANIN YENİ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-anthracite-900 to-emerald-700">TEDARİK ZİNCİRİ.</span>
          </h1>
          <p className="text-lg sm:text-xl text-anthracite-600 mb-12 max-w-2xl font-medium leading-relaxed">
            Demir Dev Studio; kaliteli toptancı üretimiyle vizyoner butikleri aracısız, stoksuz ve %100 güvenli şekilde birleştiren Türkiye&apos;nin en ayrıcalıklı kapalı devre toptan platformudur.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto px-4">
            <Link 
              href="/register" 
              className="group flex items-center justify-center gap-3 bg-anthracite-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-anthracite-900/20"
            >
              Ağımıza Başvuru Yap <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/katalog" 
              className="flex items-center justify-center bg-white border-2 border-anthracite-200 px-10 py-5 rounded-2xl font-black text-lg text-anthracite-900 hover:bg-anthracite-50 transition-all shadow-sm"
            >
              Kataloğu İncele
            </Link>
          </div>
        </div>

        {/* Hero Bottom - Çizgisel İstatistik Barı */}
        <div className="absolute bottom-0 w-full border-y border-anthracite-200 bg-white/80 backdrop-blur-md py-6">
           <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-8 md:gap-0 font-black text-sm uppercase tracking-widest text-anthracite-400">
             <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> %100 Lojistik Güvencesi</span>
             <span className="flex items-center gap-2"><Store className="w-5 h-5 text-emerald-500" /> Seçkin Butik Ağı</span>
             <span className="flex items-center gap-2 hidden md:flex"><Package className="w-5 h-5 text-emerald-500" /> Sıfır Stok Riski</span>
             <span className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" /> Komisyon Garantisi</span>
           </div>
        </div>
      </section>

      {/* 2. NASIL ÇALIŞIR? (Döngü İşletmesi) */}
      <section className="w-full bg-white py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-anthracite-900 mb-4">Sistem Nasıl İşliyor?</h2>
            <p className="text-anthracite-500 font-medium max-w-2xl mx-auto">Sıradan toptancı sitelerinin karmaşasını siliyoruz. Kuralları belirli, rolleri net, kusursuz çalışan mekanik bir iş ortaklığı.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             {/* Adım 1 */}
             <div className="bg-anthracite-50 rounded-[3rem] p-10 relative overflow-hidden group hover:bg-white border-2 border-transparent hover:border-anthracite-100 hover:shadow-2xl transition-all duration-500">
                <div className="text-7xl font-black text-anthracite-100 absolute top-8 right-8 z-0 group-hover:text-emerald-50 transition-colors">01</div>
                <div className="relative z-10">
                   <div className="w-16 h-16 bg-anthracite-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                      <Package className="w-8 h-8" />
                   </div>
                   <h3 className="text-2xl font-black text-anthracite-900 mb-3">Toptancı Sadece Üretir</h3>
                   <p className="text-anthracite-500 font-medium leading-relaxed text-sm">Katılımcı üreticiler/toptancılar lüks stüdyo panelinden mallarını (seri/adet) olarak sisteme ekler. Pazar arama, müşteri bulma derdiyle uğraşmaz, kargo numarasını işlemekle sorumludur.</p>
                </div>
             </div>

             {/* Adım 2 */}
             <div className="bg-emerald-50 rounded-[3rem] p-10 relative overflow-hidden group hover:bg-emerald-500 border-2 border-transparent hover:shadow-2xl transition-all duration-500">
                <div className="text-7xl font-black text-emerald-100 absolute top-8 right-8 z-0 group-hover:text-emerald-400 transition-colors">02</div>
                <div className="relative z-10 group-hover:text-white transition-colors">
                   <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                      <ShieldCheck className="w-8 h-8" />
                   </div>
                   <h3 className="text-2xl font-black text-emerald-900 group-hover:text-white mb-3">Demir Dev Denetler</h3>
                   <p className="text-emerald-700 font-medium leading-relaxed text-sm group-hover:text-emerald-50">Sistemin kalbi. Ürünlerin kalite kontrollerini yapar, uygun kar marjını belirleyip yayına alır. Sipariş ödemesinin havalesini bizzat toplayıp ticareti %100 güvenceye kavuşturur.</p>
                </div>
             </div>

             {/* Adım 3 */}
             <div className="bg-anthracite-50 rounded-[3rem] p-10 relative overflow-hidden group hover:bg-white border-2 border-transparent hover:border-anthracite-100 hover:shadow-2xl transition-all duration-500">
                <div className="text-7xl font-black text-anthracite-100 absolute top-8 right-8 z-0 group-hover:text-blue-50 transition-colors">03</div>
                <div className="relative z-10">
                   <div className="w-16 h-16 bg-anthracite-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                      <Store className="w-8 h-8" />
                   </div>
                   <h3 className="text-2xl font-black text-anthracite-900 mb-3">Butik Satar & Kazanır</h3>
                   <p className="text-anthracite-500 font-medium leading-relaxed text-sm">Girişi onaylanmış butik müşterisi, devasa bir lüks vitrine kavuşur. Sıfır toptancı pazarlığı ile aradığı ürünü bulur, tıkla siparişini oluşturur ve kargosunu direkt takip eder.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. NEDEN BİZ? (Value Propositiion & Görsel Şov) */}
      <section className="w-full bg-anthracite-900 py-32 px-4 relative text-white overflow-hidden">
        {/* Dekoratif Işıklar */}
        <div className="absolute top-1/2 left-1/4 w-[50%] h-[50%] bg-emerald-500/20 blur-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center relative z-10">
          <div className="lg:w-1/2 flex flex-col justify-center">
            <span className="text-emerald-500 font-black tracking-widest uppercase text-sm mb-4">Lüksün Standartları</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-[1.1]">Sıfır Risk. <br/>Maksimum Kalite.</h2>
            <p className="text-anthracite-400 font-medium text-lg leading-relaxed mb-10">
              Butik sahipleri için günlerce toptancı aramak, güven sorunu yaşamak ve stok yükü altına girmek bitti. Toptancı için de müşteri kovalama dönemi sona erdi. Biz, ortadaki tüm riskleri alan ve ticareti hızlandıran merkezi bir köprüyüz.
            </p>
            
            <ul className="space-y-6">
               <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20"><Maximize2 className="w-5 h-5 text-emerald-400"/></div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Geniş Vana, Titiz Filtre</h4>
                    <p className="text-sm text-anthracite-400">Piyasadaki her ürün değil, sadece kârlı, trend olan ve satışı garanti olan ürünler elit ağdan geçerek vitrine düşer.</p>
                  </div>
               </li>
               <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20"><Users className="w-5 h-5 text-emerald-400"/></div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">Gatekeeping (Kapalı Devre Üyelik)</h4>
                    <p className="text-sm text-anthracite-400">Toptancı fiyatlarının perakende müşterisinin eline düşmesini engelliyoruz. Fiyatları sadece merkezin (Admin) onayladığı resmi butikler görebilir.</p>
                  </div>
               </li>
            </ul>
          </div>
          
          {/* Aslında Fotoğraf Girmesi Gereken Estetik Card */}
          <div className="lg:w-1/2 w-full h-[600px] bg-gradient-to-tr from-anthracite-800 to-anthracite-900 rounded-[3rem] border border-white/10 p-4 relative shadow-2xl flex items-center justify-center">
             <div className="w-full h-full border border-white/5 rounded-[2.5rem] bg-black/40 flex flex-col items-center justify-center text-center p-10 overflow-hidden relative">
               <div className="w-full h-full absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
               <div className="relative z-10 w-full flex flex-col items-center">
                 <div className="backdrop-blur-xl bg-black/50 border border-white/10 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-500">
                    <span className="bg-emerald-500 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full mb-4 inline-block">Sipariş Onaylandı</span>
                    <h3 className="text-2xl font-black text-white mb-2">Bahar Koleksiyonu 2026</h3>
                    <p className="text-anthracite-400 text-xs font-bold mb-4">Tedarikçi: Premium Tekstil</p>
                    <div className="w-full h-2 bg-anthracite-700 rounded-full overflow-hidden">
                       <div className="w-2/3 h-full bg-emerald-500"></div>
                    </div>
                    <p className="text-right text-[10px] text-white/50 mt-2 tracking-widest">Kargoya Hazırlanıyor</p>
                 </div>
                 
                 <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-[2rem] w-full max-w-[16rem] shadow-2xl transform translate-x-12 -translate-y-8 rotate-3 hover:rotate-0 transition-all duration-500 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">Demir Dev Kasası</p>
                      <p className="text-xl font-black text-white">+ % Kar Marjı</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER / CALL TO ACTION (Aksiyon Çağrısı) */}
      <section className="w-full bg-white py-32 px-4 flex flex-col items-center text-center">
         <span className="w-20 h-20 bg-anthracite-50 rounded-full flex items-center justify-center mb-8 border border-anthracite-100">
           <Gem className="w-10 h-10 text-anthracite-900" />
         </span>
         <h2 className="text-5xl font-black tracking-tight text-anthracite-900 mb-6 max-w-3xl">Tekstil Ekosistemindeki Yerinizi Hemen Alın.</h2>
         <p className="text-xl text-anthracite-500 font-medium mb-10 max-w-2xl">
            Sisteme giriş yapmak sadece davetliler ve onayı geçen ticari hesaplar içindir. Üyelik oluşturduktan sonra onay ekranını bekleyin.
         </p>
         <Link 
            href="/register" 
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-6 rounded-full font-black text-xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105"
         >
            Ücretsiz Ticari Hesap Oluştur
         </Link>
      </section>

    </div>
  );
}
