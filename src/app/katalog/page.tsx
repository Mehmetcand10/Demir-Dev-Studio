import Image from "next/image";
import Link from "next/link";
import { Lock, ShoppingBag } from "lucide-react";
import { createClient } from '@/utils/supabase/server';

export default async function Katalog() {
  const supabase = createClient();
  
  // 1. O Anki Kullanıcıyı ve Yetkisini Kontrol Et (Gatekeeping Engine)
  const { data: { user } } = await supabase.auth.getUser();
  
  let isApproved = false;
  let userRole = 'butik';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_approved, role')
      .eq('id', user.id)
      .single();
      
    isApproved = profile?.is_approved || false;
    userRole = profile?.role || 'butik';
  }

  // 2. Gerçek Veritabanından (Supabase) Ürünleri Al
  let productQuery = supabase.from('products').select('*').order('created_at', { ascending: false });

  // Zeka Katmanı: Toptancıların (Satıcıların) vitrinde (katalogda) KENDİ ürünlerini görmesini engelleme kuralı
  if (user && userRole === 'toptanci') {
    productQuery = productQuery.neq('wholesaler_id', user.id);
  }

  const { data: products } = await productQuery;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Sezon Koleksiyonu</h1>
          <p className="text-anthracite-500">Toptancıdan doğrudan butiğinize ulaştırılan en yeni modeller.</p>
        </div>
      </div>

      {(!products || products.length === 0) ? (
        <div className="text-center py-20 bg-anthracite-50 dark:bg-anthracite-800/20 text-anthracite-500 border border-dashed border-anthracite-200 dark:border-anthracite-700 rounded-3xl">
          Veritabanında henüz ürün bulunmuyor. Lütfen Admin panelinden ürün ekleyin.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            // Fiyat Algoritması: Sizin kârınız yansıyan net satış fiyatı
            const displayedPrice = Number(product.base_wholesale_price) + Number(product.margin_price || 100);
            
            return (
              <div key={product.id} className="group flex flex-col relative bg-white dark:bg-anthracite-900 rounded-2xl overflow-hidden border border-anthracite-100 dark:border-anthracite-800 transition-all hover:shadow-xl hover:border-anthracite-300">
                
                {/* Dinamik Product Image */}
                <div className="relative aspect-[3/4] w-full bg-anthracite-50 overflow-hidden">
                  <Image 
                    src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'} 
                    alt={product.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Canlı Gatekeeping Efekti */}
                  {!isApproved && (
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Lock className="w-8 h-8 text-anthracite-800 dark:text-white mb-2" />
                      <span className="text-sm font-bold bg-white dark:bg-black px-3 py-1 rounded text-center">
                        Seri Fiyatı İçin <br/> Giriş Yapın
                      </span>
                    </div>
                  )}
                </div>

                {/* Dinamik Değerler */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-anthracite-900 dark:text-white line-clamp-1">{product.name}</h3>
                  </div>
                  
                  <p className="text-sm text-anthracite-500 mb-4">{product.gsm} • M.O.Q: {product.min_order_quantity} Adet seri</p>
                  
                  <div className="mt-auto pt-4 border-t border-anthracite-100 dark:border-anthracite-800 flex items-center justify-between">
                    {isApproved ? (
                      <>
                        <div className="flex flex-col">
                          <span className="text-xs text-anthracite-400">Toplam Seri Fiyatı</span>
                          <span className="font-bold text-lg text-anthracite-900 dark:text-white">
                            {(displayedPrice * parseInt(product.min_order_quantity)).toLocaleString("tr-TR")} ₺
                          </span>
                        </div>
                        <Link href={`/product/${product.id}`} className="bg-anthracite-900 dark:bg-white text-white dark:text-black p-2 rounded-full hover:scale-110 transition-transform">
                          <ShoppingBag className="w-4 h-4" />
                        </Link>
                      </>
                    ) : (
                      <div className="w-full text-center text-sm font-medium text-anthracite-600 dark:text-anthracite-300">
                        {user ? "Admin Onayı Bekleniyor" : "Fiyatı görmek için giriş yapın"}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
