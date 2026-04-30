import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  Star, 
  ArrowRight, 
  Tag, 
  Filter,
  ShoppingCart,
  Heart,
  X
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  rating: number;
  image: string;
  desc: string;
  isNew?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Luxury Velvet Prayer Mat",
    category: "Worship",
    price: "$45.00",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&q=80&w=400",
    desc: "Plush, double-layered velvet for maximum comfort during long prayers. Features intricate floral borders.",
    isNew: true
  },
  {
    id: 2,
    name: "The Sealed Nectar (Biography)",
    category: "Books",
    price: "$28.00",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
    desc: "A comprehensive biography of the Prophet Muhammad (PBUH), award-winning and meticulously researched."
  },
  {
    id: 3,
    name: "Aoud Royal Perfume Oil",
    category: "Fragrance",
    price: "$75.00",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400",
    desc: "Authentic Cambodian Oudh blend with notes of saffron and sandalwood. Long-lasting oil-based fragrance."
  },
  {
    id: 4,
    name: "Engraved Bamboo Tasbih",
    category: "Worship",
    price: "$15.00",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1609599006353-e629339e0da9?auto=format&fit=crop&q=80&w=400",
    desc: "Handcrafted 33-bead tasbih with sustainable bamboo. Lightweight and smooth for dhikr."
  },
  {
    id: 5,
    name: "Modern Arabic Calligraphy Art",
    category: "Decor",
    price: "$120.00",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=400",
    desc: "Canvas print featuring a minimalist interpretation of Surah Al-Fatiha in gold silk thread."
  },
  {
    id: 6,
    name: "Hajj & Umrah Essentials Kit",
    category: "Travel",
    price: "$35.00",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1564765793442-9907c6f0590c?auto=format&fit=crop&q=80&w=400",
    desc: "Unscented soaps, Ihram belt, and a travel prayer mat in a compact waterproof bag."
  }
];

export default function MarketView() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const categories = ['All', 'Worship', 'Books', 'Fragrance', 'Decor', 'Travel'];

  const filteredProducts = selectedCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Suq Al-Mubaraki</h2>
          <p className="text-slate-500 font-medium">Curated Islamic lifestyle and spiritual essentials.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search Suq..."
                className="bg-brand-sidebar/50 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:border-brand-primary/40 outline-none w-64 backdrop-blur-md transition-all"
              />
           </div>
           <button className="relative w-12 h-12 glass-panel rounded-2xl flex items-center justify-center text-brand-primary hover:bg-brand-primary/10 transition-all">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-primary text-brand-depth text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  {cartCount}
                </span>
              )}
           </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat 
              ? 'bg-brand-primary text-brand-depth border-brand-primary shadow-xl shadow-brand-primary/20 scale-105' 
              : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Banner */}
      <div className="relative h-64 rounded-[3rem] overflow-hidden group">
         <img 
           src="https://images.unsplash.com/photo-1512418490979-92798ccc1340?auto=format&fit=crop&q=80&w=1200" 
           alt="Banner" 
           className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-brand-depth via-brand-depth/40 to-transparent" />
         <div className="absolute inset-y-0 left-12 flex flex-col justify-center">
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4">Ramadan Essentials</span>
            <h3 className="text-4xl font-black text-white mb-6 leading-tight">Prepare Your Heart <br/> & Home</h3>
            <button className="bg-brand-primary text-brand-depth w-fit px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-brand-secondary transition-all shadow-xl shadow-brand-primary/20">
               Browse Collection <ArrowRight size={18} />
            </button>
         </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group glass-panel rounded-[2.5rem] border-white/5 overflow-hidden hover:border-brand-primary/20 transition-all shadow-2xl"
          >
            <div className="relative h-72 overflow-hidden">
               <img 
                 src={product.image} 
                 alt={product.name}
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
               />
               <button className="absolute top-6 right-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-red-400 transition-colors">
                  <Heart size={18} />
               </button>
               {product.isNew && (
                 <div className="absolute top-6 left-6 bg-brand-primary text-brand-depth text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                   New Arrival
                 </div>
               )}
            </div>
            <div className="p-8">
               <div className="flex items-center gap-2 mb-3">
                  <Star className="text-brand-primary fill-brand-primary" size={14} />
                  <span className="text-xs font-bold text-slate-300">{product.rating} Rating</span>
               </div>
               <h4 className="text-xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors cursor-pointer" onClick={() => setActiveProduct(product)}>{product.name}</h4>
               <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">
                  {product.desc}
               </p>
               <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white">{product.price}</span>
                  <button 
                    onClick={() => setCartCount(c => c + 1)}
                    className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-brand-depth transition-all border border-brand-primary/20"
                  >
                    <ShoppingBag size={20} />
                  </button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {activeProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveProduct(null)}
              className="absolute inset-0 bg-brand-depth/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-brand-sidebar border border-brand-primary/20 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
               <div className="w-full md:w-1/2 h-80 md:h-auto overflow-hidden">
                  <img src={activeProduct.image} alt="" className="w-full h-full object-cover" />
               </div>
               <div className="p-10 flex-1 relative">
                  <button 
                    onClick={() => setActiveProduct(null)}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4">{activeProduct.category}</p>
                  <h3 className="text-4xl font-black text-white mb-6 leading-tight">{activeProduct.name}</h3>
                  <div className="flex items-center gap-4 mb-8">
                     <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={16} className={`${i <= activeProduct.rating ? 'text-brand-primary fill-brand-primary' : 'text-slate-700'}`} />
                        ))}
                     </div>
                     <span className="text-slate-500 text-sm font-bold">128 Reviews</span>
                  </div>
                  <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                     {activeProduct.desc}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                     <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Price</p>
                        <span className="text-4xl font-black text-white">{activeProduct.price}</span>
                     </div>
                     <button 
                       onClick={() => {
                         setCartCount(c => c + 1);
                         setActiveProduct(null);
                       }}
                       className="bg-brand-primary text-brand-depth px-10 py-5 rounded-3xl font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                     >
                       Add to Cart
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
