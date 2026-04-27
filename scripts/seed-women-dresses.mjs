import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

function parseEnv(content) {
  const env = {};
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

const DRESS_NAMES = [
  "Saten Gece Zarafeti Elbise",
  "İnci Yakalı Midi Elbise",
  "Minimal Drapeli Siyah Elbise",
  "V Yaka Şık Davet Elbisesi",
  "Zarif A Kesim Günlük Elbise",
  "Bel Vurgulu Krep Elbise",
  "Pilili Modern Ofis Elbisesi",
  "Sırt Detaylı Premium Elbise",
  "Asimetrik Kesim Kokteyl Elbisesi",
  "Yumuşak Dokulu Triko Elbise",
  "Kemerli Şehir Stili Elbise",
  "Romantik Dantel Dokunuş Elbise",
  "Premium Poplin Maxi Elbise",
  "Vintage Çiçek Desenli Elbise",
  "Monokrom İpek Dokulu Elbise",
  "Omuz Detaylı Parti Elbisesi",
  "Akıcı Saten Uzun Elbise",
  "Minimalist Kısa Ceket Elbise",
  "Modern Balon Kollu Elbise",
  "Kruvaze Kesim Şık Elbise",
  "Yüksek Bel Kalem Elbise",
  "Parlak Dokulu Gece Elbisesi",
  "Soft Tonlu Midi Elbise",
  "Kapitone Görünümlü Elbise",
  "Doğal Keten Yaz Elbisesi",
  "Sade ve Güçlü Ofis Elbisesi",
  "Tül Detaylı Özel Gün Elbisesi",
  "Piliseli Premium Viskon Elbise",
  "Düşük Omuz Trend Elbise",
  "Modern Bohem Uzun Elbise",
  "Smok Detaylı Koton Elbise",
  "Kuşaklı Akşam Elbisesi",
  "Elegan Sade Siyah Midi Elbise",
  "Işıltılı Gece Şıklığı Elbise",
  "Cep Detaylı Günlük Elbise",
  "Çizgisel Desenli City Elbise",
  "Yaka Taşlı Davet Elbisesi",
  "İthal Dokulu Boutique Elbise",
  "İnce Askılı Yazlık Elbise",
  "Kat Kat Volanlı Elbise",
  "Tek Omuz Zarif Elbise",
  "Büzgü Detaylı Şık Elbise",
  "Kumaş Kemerli Midi Elbise",
  "Yırtmaçlı Premium Gece Elbisesi",
  "Sıfır Yaka Basic Chic Elbise",
  "Parıltılı Saten Kokteyl Elbisesi",
  "Boğazlı Triko Kış Elbisesi",
  "İnce Çizgi Dokulu Elbise",
  "Soft Glam Özel Koleksiyon Elbise",
  "Müslin Rahat Kesim Elbise",
];

const FABRICS = [
  "%100 Viskon",
  "%92 Polyester %8 Elastan",
  "%100 Pamuk Poplin",
  "%95 Pamuk %5 Likra",
  "İthal Krep",
  "Saten Dokuma",
  "Triko Ribana",
  "Şifon Katmanlı",
  "Premium Müslin",
];

const COLORS = [
  "Siyah",
  "Ekru",
  "Bej",
  "Bordo",
  "Lacivert",
  "Zümrüt",
  "Pudra",
  "Antrasit",
  "Kiremit",
  "Kahve",
];

function imageFor(idx) {
  const seed = idx + 101;
  return `https://source.unsplash.com/1200x1600/?women,dress,fashion,elegant&sig=${seed}`;
}

function makeProduct(idx, wholesalerId) {
  const base = 420 + (idx % 10) * 95 + Math.floor(idx / 10) * 55;
  const moq = 12 + (idx % 8) * 6;
  const s = 15 + (idx % 7) * 4;
  const m = 20 + (idx % 9) * 5;
  const l = 14 + (idx % 6) * 5;
  const xl = 8 + (idx % 5) * 3;
  const fabric = FABRICS[idx % FABRICS.length];
  const color = COLORS[idx % COLORS.length];
  const gsm = `${180 + (idx % 8) * 20} GSM`;
  const title = DRESS_NAMES[idx];
  return {
    wholesaler_id: wholesalerId,
    name: `Demo ${title}`,
    description: `${color} tonunda ${title.toLowerCase()}. Boutique vitrininde premium görünüm için tasarlandı; canlı çekim, kaliteli dikiş ve yüksek tekrar sipariş potansiyeli sunar.`,
    category: "Elbise / Etek",
    gender: "Kadın",
    fabric_type: fabric,
    gsm,
    stocks: { S: s, M: m, L: l, XL: xl },
    images: [imageFor(idx)],
    base_wholesale_price: base,
    margin_price: Math.round(base * 0.15),
    stock_status: "In Stock",
    min_order_quantity: moq,
    low_stock_threshold: 8,
  };
}

async function main() {
  const rawEnv = await readFile(".env.local", "utf8");
  const env = parseEnv(rawEnv);
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error(".env.local içinde Supabase bilgileri bulunamadı.");

  const email = process.argv[2] || "demo.toptanci.kadin@demirdev.local";
  const password = process.argv[3] || "Demo12345!";

  const supabase = createClient(url, anonKey);

  let signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.error) {
    const signUp = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "toptanci",
          business_name: "Luna Atelier Demo",
          full_name: "Luna Atelier",
          phone_number: "05550000000",
          tax_id: "1111111111",
        },
      },
    });
    if (signUp.error) {
      throw new Error(`Demo hesap oluşturulamadı: ${signUp.error.message}`);
    }
    signIn = await supabase.auth.signInWithPassword({ email, password });
    if (signIn.error) {
      throw new Error(
        `Demo hesap oluşturuldu ancak giriş yapılamadı (mail onayı açık olabilir): ${signIn.error.message}`
      );
    }
  }

  const userId = signIn.data.user?.id;
  if (!userId) throw new Error("Kullanıcı kimliği alınamadı.");

  await supabase
    .from("profiles")
    .update({
      role: "toptanci",
      business_name: "Luna Atelier Demo",
      full_name: "Luna Atelier",
      phone_number: "05550000000",
    })
    .eq("id", userId);

  // Aynı demo tekrar çalıştırılırsa mükerrer olmasın
  await supabase.from("products").delete().eq("wholesaler_id", userId).like("name", "Demo %");

  const rows = Array.from({ length: 50 }, (_, idx) => makeProduct(idx, userId));
  const chunkSize = 25;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from("products").insert(chunk);
    if (error) throw new Error(`Ürün eklenemedi (chunk ${i / chunkSize + 1}): ${error.message}`);
  }

  await supabase.auth.signOut();

  console.log("Demo toptancı ve 50 kadın elbisesi ürünü hazır.");
  console.log(`Giriş e-posta: ${email}`);
  console.log(`Giriş şifre : ${password}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
