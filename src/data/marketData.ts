export interface SampleListing {
  id: string;
  title: string;
  description: string;
  brand: string;
  price: number;
  coinPrice: number;
  pricingMode: 'both' | 'coins' | 'cash';
  category: string;
  imageUrl: string;
  images: string[];
  videoUrl?: string;
  contactInfo: string;
  whatsappNumber: string;
  cityLocation: string;
  isNegotiable: boolean;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  specifications: string;
  shippingEstimate: string;
  features: string[];
  sellerId: string;
  sellerName: string;
  sellerPhoto?: string;
  status: 'active' | 'sold' | 'deleted';
  createdAt: string;
  rating: number;
  isDigital?: boolean;
  downloadUrl?: string;
  downloadFormat?: string; // 'PDF' | 'MP3' | 'ZIP' | 'EPUB' | 'XLSX' | 'IMAGE'
  downloadFileName?: string;
  downloadSize?: string;
  downloadCount?: number;
  reviews: {
    id: string;
    reviewerName: string;
    reviewerPhoto?: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
}

export const STARTER_MARKET_LISTINGS: SampleListing[] = [
  {
    id: 'digital_mushaf_tajweed_pdf',
    title: 'The Noble Quran Tajweed Edition (Complete 604-Page High-Res PDF)',
    description: 'High-resolution color-coded Tajweed Mushaf in Arabic with clear rule indicators for Ghunnah, Ikhfa, Idgham, and Qalqalah. Optimized for tablets, e-readers, and phones with pristine zoom fidelity.',
    brand: 'Sanctuary Press',
    price: 0,
    coinPrice: 0,
    pricingMode: 'both',
    category: 'Books',
    imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80'
    ],
    contactInfo: '+971501234567',
    whatsappNumber: '+971501234567',
    cityLocation: 'Medina / Global Digital',
    isNegotiable: false,
    condition: 'New',
    specifications: 'PDF Format • 604 Pages • Color-coded Tajweed Rules • Instant Download',
    shippingEstimate: 'Instant Digital Download (0s)',
    features: [
      'Authentic Uthmani script based on King Fahd Complex printing standard',
      'High-contrast crisp vector typography for all screens',
      'Color-coded Tajweed color guide legend included on every page'
    ],
    sellerId: 'sanctuary_foundation',
    sellerName: 'Sanctuary Waqf Foundation',
    sellerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    rating: 5.0,
    isDigital: true,
    downloadUrl: 'https://archive.org/download/Quran-Tajweed-604-Pages/Tajweed-Quran.pdf',
    downloadFormat: 'PDF',
    downloadFileName: 'Quran-Tajweed-ColorCoded-Complete.pdf',
    downloadSize: '46.8 MB',
    downloadCount: 412,
    reviews: [
      {
        id: 'rev_1',
        reviewerName: 'Tariq Al-Mansoor',
        rating: 5,
        comment: 'SubhanAllah, the PDF quality is crystal clear! Perfect on iPad during taraweeh.',
        createdAt: '2026-08-15T10:00:00Z'
      }
    ]
  },
  {
    id: 'digital_asma_ul_husna_art_pack',
    title: '99 Names of Allah 4K Vector Art Pack & Printable Posters',
    description: 'Complete high-definition suite of all 99 Names of Allah rendered in Thuluth, Diwani, and Modern Kufic calligraphy styles. Includes 4K UHD desktop and phone wallpapers plus print-ready 300 DPI vector poster files.',
    brand: 'Qalam Studios',
    price: 4.99,
    coinPrice: 500,
    pricingMode: 'both',
    category: 'Decor',
    imageUrl: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80'
    ],
    contactInfo: '+447911123456',
    whatsappNumber: '+447911123456',
    cityLocation: 'London / Global Download',
    isNegotiable: true,
    condition: 'New',
    specifications: 'ZIP Bundle • 99 Wallpapers (4K UHD) • 3 Printable Vector PDF Posters (A1/A2/A3)',
    shippingEstimate: 'Instant Digital Download',
    features: [
      'Ultra high resolution 3840x2160 pixels wallpapers for phone and desktop',
      'Hand-mastered geometric and floral arabesque framing',
      'Includes meaning and transliteration guide in English and Arabic'
    ],
    sellerId: 'qalam_studios',
    sellerName: 'Qalam Calligraphy Studios',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    rating: 4.9,
    isDigital: true,
    downloadUrl: 'https://example.com/assets/asma-ul-husna-4k-pack.zip',
    downloadFormat: 'ZIP',
    downloadFileName: 'Asma-ul-Husna-4K-Art-Pack.zip',
    downloadSize: '118 MB',
    downloadCount: 289,
    reviews: [
      {
        id: 'rev_2',
        reviewerName: 'Farah Siddiqui',
        rating: 5,
        comment: 'Stunning artistic work. Printed and framed in my living room.',
        createdAt: '2026-08-16T14:20:00Z'
      }
    ]
  },
  {
    id: 'digital_hisn_muslim_audio_bundle',
    title: 'Hisn al-Muslim (Fortress of the Muslim) Audio & Pocket eBook Bundle',
    description: 'The authentic collection of morning, evening, sleep, travel, and distress supplications. Includes both a printable bilingual pocket booklet (Arabic + English + Transliteration) and high quality MP3 vocal audio recordings.',
    brand: 'Dar Al-Dhikr',
    price: 2.99,
    coinPrice: 300,
    pricingMode: 'both',
    category: 'Books',
    imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80'
    ],
    contactInfo: '+966509876543',
    whatsappNumber: '+966509876543',
    cityLocation: 'Riyadh / Instant Delivery',
    isNegotiable: false,
    condition: 'New',
    specifications: 'PDF + MP3 Bundle • 120 Pages • 45 Audio Clips with Tajweed',
    shippingEstimate: 'Instant Digital Download',
    features: [
      '100% verified authentic Hadith references from Bukhari, Muslim, Abu Dawud, and Tirmidhi',
      'Vocal recitation audio for perfect pronunciation and memorization',
      'Pocket phone view mode and printable 2-up booklet layout'
    ],
    sellerId: 'dar_aldhikr',
    sellerName: 'Dar Al-Dhikr Publishing',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    rating: 5.0,
    isDigital: true,
    downloadUrl: 'https://archive.org/download/FortressOfTheMuslim/Fortress-Of-The-Muslim-Audio-eBook.zip',
    downloadFormat: 'ZIP',
    downloadFileName: 'Hisn-Al-Muslim-Audio-Bundle.zip',
    downloadSize: '64.2 MB',
    downloadCount: 520,
    reviews: []
  },
  {
    id: 'physical_velvet_prayer_mat',
    title: 'Orthopedic Memory Foam Velvet Prayer Mat (Kaba Motif)',
    description: 'Thick 25mm high-density orthopedic memory foam prayer rug with ultra-soft embossed Ottoman velvet fabric. Provides optimal pressure relief for knees and joints during Sujood and prolonged prayer.',
    brand: 'Al-Rawdah Comfort',
    price: 38.00,
    coinPrice: 3800,
    pricingMode: 'both',
    category: 'Worship',
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80'
    ],
    contactInfo: '+971505551234',
    whatsappNumber: '+971505551234',
    cityLocation: 'Dubai, UAE',
    isNegotiable: true,
    condition: 'New',
    specifications: 'Size: 120cm x 80cm • Thickness: 25mm Memory Foam • Anti-slip rubber base',
    shippingEstimate: 'Express Courier (2-4 business days)',
    features: [
      'Ergonomic joint protection certified for seniors and long Tahajjud sessions',
      'Non-slip grip backing prevents movement on marble and wood floors',
      'Washable zippered velvet cover with gold metallic fringe'
    ],
    sellerId: 'rawdah_comfort',
    sellerName: 'Al-Rawdah Essentials',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    rating: 4.9,
    isDigital: false,
    reviews: []
  },
  {
    id: 'physical_royal_cambodian_oudh',
    title: 'Pure Royal Cambodian Oudh Oil (Dehn Al Oudh 1/2 Tola)',
    description: 'Distilled from aged wild Aquilaria agarwood trees in Cambodia. Rich, balsamic, woody aroma with sweet honeyed undertones. 100% pure alcohol-free attar oil with 24+ hour longevity.',
    brand: 'Sultani Perfumery',
    price: 49.99,
    coinPrice: 5000,
    pricingMode: 'both',
    category: 'Fragrance',
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80'
    ],
    contactInfo: '+966551234890',
    whatsappNumber: '+966551234890',
    cityLocation: 'Makkah, Saudi Arabia',
    isNegotiable: true,
    condition: 'New',
    specifications: 'Quantity: 6ml (1/2 Tola) • Handcrafted Crystal Decanter Bottle • 100% Pure Attar',
    shippingEstimate: 'Worldwide Air Express (3-5 days)',
    features: [
      'Aged for 12 years in oak barrels for deep smokey sweet profile',
      'Zero alcohol, zero synthetic chemicals or fillers',
      'Ideal for Jummah prayers, Eid gatherings, and spiritual focus'
    ],
    sellerId: 'sultani_perfumes',
    sellerName: 'Sultani Royal Scents',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    rating: 5.0,
    isDigital: false,
    reviews: []
  }
];
