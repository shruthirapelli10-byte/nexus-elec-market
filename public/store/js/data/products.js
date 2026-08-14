/**
 * Seed catalogue. This is the ONLY place raw product data lives.
 * When Firestore is connected, services/product-service.js swaps this out —
 * the shape below is exactly the document shape to store.
 */
import { productImage, slugify } from "../core/utils.js";

const RAW = [
  ["Aurora Pro 15 Smartphone", "Apple", "smartphones", 134900, 119900, 4.8, 2143, 12, ["6.7\" ProMotion OLED", "A18 Pro chip", "48MP triple camera"], ["Display", '6.7" OLED 120Hz'], true, true],
  ["Galaxy Edge S9 Ultra", "Samsung", "smartphones", 129999, 109999, 4.7, 1876, 40, ["200MP camera", "S-Pen included", "5000mAh"], ["Display", '6.8" AMOLED 2X'], true, true],
  ["Xiaomi Nova 14 Pro", "Xiaomi", "smartphones", 44999, 34999, 4.4, 934, 65, ["120W fast charge", "Leica optics"], ["Battery", "5200mAh"], false, true],
  ["MacBook Air M4 13\"", "Apple", "laptops", 114900, 104900, 4.9, 1502, 18, ["18h battery", "Liquid Retina", "Fanless"], ["Chip", "Apple M4 8-core"], true, true],
  ["Dell XPS 14 Creator", "Dell", "laptops", 189990, 159990, 4.6, 612, 7, ["RTX 4060", "OLED 3.2K", "Thin chassis"], ["GPU", "NVIDIA RTX 4060"], true, false],
  ["Asus ROG Strix G18", "Asus", "laptops", 224990, 198990, 4.7, 421, 4, ["240Hz display", "RTX 4080", "Liquid metal cooling"], ["GPU", "NVIDIA RTX 4080"], false, false],
  ["Lenovo ThinkBook 16 Pro", "Lenovo", "laptops", 99990, 84990, 4.3, 288, 21, ["Ryzen 9", "16\" 2.5K", "Mil-spec build"], ["CPU", "Ryzen 9 7940HS"], false, true],
  ["iPad Air 12.9 M3", "Apple", "tablets", 89900, 79900, 4.8, 998, 15, ["M3 chip", "Apple Pencil Pro", "Laminated display"], ["Storage", "256GB"], true, true],
  ["Galaxy Tab S10+", "Samsung", "tablets", 84999, 71999, 4.5, 533, 26, ["Dolby Atmos", "S-Pen", "IP68"], ["Display", '12.4" AMOLED'], false, false],
  ["Watch Ultra Titanium", "Apple", "smartwatches", 89900, 82900, 4.8, 1204, 9, ["100m water resistant", "Dual-frequency GPS", "36h battery"], ["Case", "49mm titanium"], true, true],
  ["Galaxy Watch 8 Classic", "Samsung", "smartwatches", 43999, 34999, 4.4, 702, 33, ["Rotating bezel", "BioActive sensor"], ["Case", "47mm steel"], false, true],
  ["Bose QuietComfort Ultra", "Bose", "headphones", 37900, 29900, 4.7, 1610, 11, ["Immersive audio", "World-class ANC", "24h battery"], ["Driver", "35mm dynamic"], true, false],
  ["Sony WH-1000XM6", "Sony", "headphones", 34990, 27990, 4.9, 3021, 24, ["Adaptive ANC", "LDAC Hi-Res", "30h battery"], ["Codec", "LDAC / AAC / SBC"], true, true],
  ["JBL Tour One M3", "JBL", "headphones", 24999, 18999, 4.3, 470, 52, ["Smart Tx", "True adaptive ANC"], ["Battery", "70h playback"], false, false],
  ["AirPods Pro 3", "Apple", "earbuds", 26900, 23900, 4.8, 4210, 61, ["Adaptive audio", "USB-C MagSafe", "Hearing aid mode"], ["Chip", "H3"], true, true],
  ["Galaxy Buds4 Pro", "Samsung", "earbuds", 21999, 16999, 4.4, 887, 44, ["24-bit Hi-Fi", "360 audio"], ["Battery", "30h with case"], false, true],
  ["Sony LinkBuds Fit", "Sony", "earbuds", 14990, 11490, 4.2, 356, 0, ["Air fitting", "DSEE Extreme"], ["Battery", "21h with case"], false, false],
  ["JBL Boombox 4", "JBL", "speakers", 42999, 34999, 4.6, 622, 13, ["24h playtime", "IP67", "Massive bass"], ["Output", "180W RMS"], true, false],
  ["Bose SoundLink Max", "Bose", "speakers", 39900, 33900, 4.5, 318, 8, ["20h battery", "Custom transducers"], ["Weight", "2.1kg"], false, true],
  ["PlayStation 5 Pro", "Sony", "consoles", 74990, 69990, 4.9, 2540, 6, ["8K ready", "2TB SSD", "Ray tracing"], ["Storage", "2TB NVMe"], true, true],
  ["Nintendo Switch 2 OLED", "Nintendo", "consoles", 42999, 39999, 4.7, 1830, 30, ["7.9\" OLED", "Joy-Con 2", "4K docked"], ["Display", '7.9" OLED'], true, true],
  ["Odyssey G9 49\" Curved", "Samsung", "monitors", 129999, 99999, 4.6, 402, 5, ["240Hz", "DQHD", "1000R curve"], ["Resolution", "5120 x 1440"], true, false],
  ["Dell UltraSharp 32 6K", "Dell", "monitors", 189990, 164990, 4.7, 176, 3, ["6K IPS Black", "Thunderbolt hub"], ["Resolution", "6144 x 3456"], false, false],
  ["Logitech MX Mechanical", "Logitech", "keyboards", 17995, 13995, 4.6, 1290, 48, ["Low-profile switches", "Smart backlight", "Multi-device"], ["Switches", "Tactile Quiet"], true, true],
  ["Asus ROG Azoth Extreme", "Asus", "keyboards", 32999, 27999, 4.5, 231, 12, ["Gasket mount", "Tri-mode", "OLED dial"], ["Layout", "75%"], false, false],
  ["Logitech MX Master 4S", "Logitech", "mice", 12995, 9995, 4.8, 2004, 74, ["8K DPI", "Quiet clicks", "MagSpeed wheel"], ["DPI", "8000"], true, true],
  ["SanDisk Extreme Pro 4TB SSD", "SanDisk", "storage", 42999, 31999, 4.5, 918, 55, ["2000MB/s", "IP65 rugged", "USB-C"], ["Capacity", "4TB"], false, false],
  ["Samsung 990 EVO Plus 2TB", "Samsung", "storage", 22999, 16499, 4.7, 1440, 62, ["PCIe 5.0", "7450MB/s read"], ["Interface", "NVMe M.2"], false, true],
  ["Canon EOS R7 Mirrorless", "Canon", "cameras", 154990, 134990, 4.7, 388, 5, ["32.5MP APS-C", "4K60 oversampled", "Dual card slots"], ["Sensor", "32.5MP APS-C"], true, false],
  ["Sony Alpha ZV-E10 II", "Sony", "cameras", 109990, 94990, 4.6, 512, 9, ["Creator focused", "4K 60p", "Vari-angle screen"], ["Mount", "Sony E"], false, true],
  ["65W GaN Travel Charger", "Xiaomi", "accessories", 4999, 2999, 4.4, 1620, 120, ["Tri-port", "Foldable pins"], ["Output", "65W total"], false, false],
  ["MagSafe Power Bank 10K", "Apple", "accessories", 9900, 8400, 4.3, 745, 88, ["Qi2 15W", "Pass-through charge"], ["Capacity", "10000mAh"], false, true],
];

const DESCRIPTIONS = {
  smartphones: "A flagship experience built around a brilliant display, all-day battery and a camera system that keeps up with everything you shoot.",
  laptops: "Serious performance in a portable chassis — engineered for creators, developers and anyone who needs a machine that never stutters.",
  tablets: "The sweet spot between laptop and phone: sketch, stream, take notes and work with a keyboard when you need one.",
  smartwatches: "Health tracking, workouts and notifications on your wrist, with a battery that survives the weekend.",
  headphones: "Reference-grade tuning with best-in-class noise cancellation for flights, offices and everything between.",
  earbuds: "Pocketable, weather-ready audio with adaptive noise control and instant device switching.",
  speakers: "Room-filling sound with deep controlled bass, built to move from the kitchen counter to the beach.",
  consoles: "Next-gen gaming with lightning-fast load times, ray-traced lighting and a library that keeps growing.",
  monitors: "Colour-accurate panels with high refresh rates and single-cable docking for a cleaner desk.",
  keyboards: "Precision typing feel, programmable layers and multi-device switching for real workflows.",
  mice: "Ergonomic sculpting, silent clicks and pixel-accurate tracking on almost any surface.",
  storage: "Blazing sequential speeds with rugged protection so your projects travel safely.",
  cameras: "Fast hybrid autofocus, oversampled video and pro-grade controls in a compact body.",
  accessories: "The small upgrade that makes everything else work better — built to travel.",
};

function build([name, brand, category, mrp, price, rating, reviews, stock, features, spec, featured, newArrival], i) {
  const id = slugify(`${brand}-${name}`);
  return {
    id,
    name,
    brand,
    category,
    mrp,
    price,
    rating,
    reviewsCount: reviews,
    stock,
    features,
    featured: Boolean(featured),
    newArrival: Boolean(newArrival),
    bestSeller: reviews > 900,
    flashDeal: mrp - price >= mrp * 0.18,
    warranty: category === "accessories" ? "6 months manufacturer warranty" : "1 year manufacturer warranty + 6 months on accessories",
    description: DESCRIPTIONS[category] ?? "",
    images: [0, 1, 2, 3].map((n) => productImage(id, n, brand)),
    specs: {
      Brand: brand,
      Model: name,
      [spec[0]]: spec[1],
      "In the box": "Device, USB-C cable, documentation",
      Warranty: "1 year",
      SKU: `VLT-${String(i + 1).padStart(4, "0")}`,
    },
    createdAt: Date.now() - i * 86400000,
  };
}

export const PRODUCTS = RAW.map(build);

export const REVIEWS = [
  { author: "Ananya Rao", rating: 5, title: "Exactly as described", body: "Delivery was two days early and the packaging was flawless. The upgrade is obvious in day-to-day use.", date: "2026-06-02" },
  { author: "Rahul Mehta", rating: 4, title: "Great value in this range", body: "Battery easily lasts a full working day. Would have liked a faster charger in the box.", date: "2026-05-18" },
  { author: "Sneha Kapoor", rating: 5, title: "Premium feel", body: "Build quality is a step above what I expected at this price. Support answered within minutes.", date: "2026-05-04" },
  { author: "Imran Sheikh", rating: 4, title: "Solid performer", body: "Handles everything I throw at it. Runs slightly warm under sustained load but never throttles.", date: "2026-04-27" },
];

export const TESTIMONIALS = [
  { author: "Priya Nair", role: "Product designer", rating: 5, body: "Voltra is the only store I trust for launch-day stock. Genuine units, quick replacements, zero drama." },
  { author: "Karthik Iyer", role: "Streamer", rating: 5, body: "Built my entire studio here across six orders. Every single item arrived sealed and on time." },
  { author: "Devika Menon", role: "Photographer", rating: 4, body: "The comparison specs on product pages actually helped me pick the right body for video work." },
];
