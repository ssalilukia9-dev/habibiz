import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  X,
  Plus,
  MessageCircle,
  Package,
  Image as ImageIcon,
  DollarSign,
  User as UserIcon,
  Trash2,
  Video,
  Phone,
  LayoutGrid,
  ChevronLeft
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  where,
  deleteDoc,
  doc,
  getDocs,
  Timestamp
} from 'firebase/firestore';

import { handleFirestoreError, OperationType } from '../lib/utils';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  images?: string[];
  videoUrl?: string;
  contactInfo?: string;
  sellerId: string;
  sellerName: string;
  sellerPhoto?: string;
  status: 'active' | 'sold' | 'deleted';
  createdAt: Timestamp;
  rating?: number;
  condition?: 'New' | 'Like New' | 'Good' | 'Fair';
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={`${
            s <= Math.floor(rating)
              ? 'text-brand-primary fill-brand-primary'
              : 'text-slate-700'
          }`}
        />
      ))}
      <span className="text-[10px] font-black text-slate-500 ml-1.5">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function MarketView({ detailMode, searchQuery, setSearchQuery }: { detailMode?: boolean, searchQuery: string, setSearchQuery: (q: string) => void }) {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProduct, setActiveProduct] = useState<Listing | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form State
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Worship',
    imageUrl: '',
    images: ['', ''], // 2 extra images
    videoUrl: '',
    contactInfo: '',
    condition: 'New' as Listing['condition']
  });

  const categories = ['All', 'Worship', 'Books', 'Fragrance', 'Decor', 'Clothing', 'Other'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // ~800KB limit for Base64 in Firestore
      alert("Image is too large for the sanctuary's current limits. Please use a smaller heart (file size < 800KB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewListing(prev => ({ ...prev, imageUrl: base64String }));
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const q = query(
      collection(db, 'listings'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Listing[];
      setListings(docs);
      
      if (productId) {
        const found = docs.find(p => p.id === productId);
        if (found) setActiveProduct(found);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'listings');
    });

    return () => unsubscribe();
  }, [productId]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setIsSubmitting(true);
    try {
      const allImages = [newListing.imageUrl, ...newListing.images].filter(url => url.trim() !== '');
      await addDoc(collection(db, 'listings'), {
        ...newListing,
        imageUrl: allImages[0] || '',
        images: allImages,
        price: parseFloat(newListing.price),
        sellerId: auth.currentUser.uid,
        sellerName: auth.currentUser.displayName || 'Anonymous',
        sellerPhoto: auth.currentUser.photoURL,
        status: 'active',
        createdAt: serverTimestamp(),
        rating: 5.0, // Default for new items
      });
      setShowCreateModal(false);
      setImagePreview(null);
      setNewListing({ 
        title: '', 
        description: '', 
        price: '', 
        category: 'Worship', 
        imageUrl: '', 
        images: ['', ''], 
        videoUrl: '', 
        contactInfo: '',
        condition: 'New' 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'listings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessageSeller = async (listing: Listing) => {
    if (!auth.currentUser || auth.currentUser.uid === listing.sellerId) return;

    // Logic to find or create a private chat room
    try {
      const roomsRef = collection(db, 'rooms');
      const q = query(
        roomsRef, 
        where('type', '==', 'private'),
        where('participants', 'array-contains', auth.currentUser.uid)
      );
      
      const snapshot = await getDocs(q);
      let existingRoom = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(listing.sellerId);
      });

      if (!existingRoom) {
        // Create new private room
        const roomData = {
          name: `${auth.currentUser.displayName} & ${listing.sellerName}`,
          type: 'private',
          participants: [auth.currentUser.uid, listing.sellerId],
          lastMessage: `Inquiry about: ${listing.title}`,
          updatedAt: serverTimestamp()
        };
        const newRoom = await addDoc(roomsRef, roomData);
        navigate('/chat');
      } else {
        navigate('/chat');
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleDeleteListing = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteDoc(doc(db, 'listings', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `listings/${id}`);
    }
  };

  const filteredProducts = listings.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || p.sellerId === auth.currentUser?.uid;
    return matchesCategory && matchesSearch && matchesTab;
  });

  if (detailMode && activeProduct) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        className="space-y-12 pb-32"
      >
        <header className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/market')}
            className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-brand-primary hover:bg-brand-primary/10 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Market Detail</h2>
            <p className="text-slate-500 font-medium text-sm">Product exploration and secure contact</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Multimedia Section */}
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-brand-depth/40 group">
              {activeProduct.imageUrl ? (
                <img src={activeProduct.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-800">
                  <Package size={80} className="mb-4 opacity-20" />
                  <span className="text-xs font-black uppercase tracking-widest">No primary image</span>
                </div>
              )}
              <div className="absolute top-8 right-8 bg-brand-depth/80 backdrop-blur-xl px-6 py-4 rounded-3xl border border-brand-primary/30 shadow-2xl">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Asking Price</p>
                 <span className="text-3xl font-black text-brand-primary">${activeProduct.price}</span>
              </div>
            </div>

            {/* Gallery & Video */}
            <div className="grid grid-cols-4 gap-4">
              {activeProduct.images?.map((url, i) => (
                <button key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/5 hover:border-brand-primary/50 transition-all opacity-70 hover:opacity-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {activeProduct.videoUrl && (
                <a href={activeProduct.videoUrl} target="_blank" rel="noreferrer" className="aspect-square rounded-2xl bg-brand-primary/10 flex flex-col items-center justify-center text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-brand-depth transition-all group">
                   <Video size={24} className="group-hover:scale-110 transition-transform" />
                   <span className="text-[8px] font-black mt-2 uppercase">Video</span>
                </a>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">{activeProduct.category}</span>
                <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase tracking-widest">Active</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">{activeProduct.title}</h1>
              <StarRating rating={activeProduct.rating || 5.0} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                     <UserIcon className="text-brand-primary" size={24} />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Seller</p>
                     <p className="text-sm font-black text-white">{activeProduct.sellerName}</p>
                  </div>
               </div>
               <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                     <Tag className="text-brand-primary" size={24} />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Condition</p>
                     <p className="text-sm font-black text-white">{activeProduct.condition || 'New'}</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Full Description</h5>
               <p className="text-slate-400 text-lg leading-relaxed font-medium">
                  {activeProduct.description}
               </p>
            </div>

            <div className="p-8 glass-panel border-brand-primary/20 rounded-[2.5rem] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white">Contact Seller</h4>
                  <p className="text-xs text-slate-500">Reach out for inquiries or purchase</p>
                </div>
                <div className="flex gap-2">
                   <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-brand-depth transition-all"><Heart size={18} /></button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {activeProduct.sellerId !== auth.currentUser?.uid ? (
                  <>
                    <button 
                      onClick={() => handleMessageSeller(activeProduct)}
                      className="w-full bg-brand-primary text-brand-depth h-16 rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 underline decoration-brand-depth/20"
                    >
                      <MessageCircle size={24} />
                      Send In-App Message
                    </button>
                    {activeProduct.contactInfo && (
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                         <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <Phone size={18} />
                         </div>
                         <div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Public Contact</p>
                            <p className="text-sm font-bold text-white tracking-widest">{activeProduct.contactInfo}</p>
                         </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">This is your listing</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Suq Al-Mubaraki</h2>
          <p className="text-slate-500 font-medium text-sm md:text-base">The community marketplace for spiritual essentials.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Suq..."
                className="w-full md:w-64 bg-brand-sidebar/50 border border-white/5 rounded-2xl py-3 pl-11 pr-4 md:pl-12 md:pr-6 text-sm text-white focus:border-brand-primary/40 outline-none backdrop-blur-md transition-all"
              />
           </div>
           <button 
             onClick={() => setShowCreateModal(true)}
             className="bg-brand-primary text-brand-depth h-12 px-6 rounded-2xl flex items-center gap-2 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
           >
              <Plus size={18} />
              <span className="hidden sm:inline">Create Listing</span>
           </button>
        </div>
      </div>

      {/* Tabs & Categories */}
      <div className="space-y-6">
        <div className="flex gap-4 p-1 bg-white/5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-brand-primary text-brand-depth shadow-xl' : 'text-slate-500'}`}
          >
            All Items
          </button>
          <button 
            onClick={() => setActiveTab('my')}
            className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'my' ? 'bg-brand-primary text-brand-depth shadow-xl' : 'text-slate-500'}`}
          >
            My Listings
          </button>
        </div>

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
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              className="group glass-panel rounded-[2rem] border-white/5 overflow-hidden flex flex-col h-full bg-brand-sidebar/30 cursor-pointer"
              onClick={() => setActiveProduct(p)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-brand-depth/40">
                    <Package size={40} className="mb-2 opacity-20" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-brand-depth/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-brand-primary/30">
                  <span className="text-sm font-black text-brand-primary">${p.price}</span>
                </div>
                {p.sellerId === auth.currentUser?.uid && (
                  <button 
                    onClick={(e) => handleDeleteListing(p.id, e)}
                    className="absolute top-4 right-4 w-10 h-10 bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest px-2 py-1 bg-brand-primary/10 rounded-lg">{p.category}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{p.condition || 'New'}</span>
                </div>
                <h3 className="text-base font-black text-white line-clamp-1 mb-2 group-hover:text-brand-primary transition-colors">{p.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{p.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-brand-primary">
                      <UserIcon size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 capitalize">{p.sellerName.split(' ')[0]}</span>
                  </div>
                  <StarRating rating={p.rating || 5} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 px-6 glass-panel rounded-[3rem] border-white/5 bg-brand-sidebar/30 text-center">
          <div className="w-24 h-24 bg-brand-primary/10 rounded-[2.5rem] flex items-center justify-center text-brand-primary mb-8 shadow-2xl shadow-brand-primary/10">
             <ShoppingBag size={48} />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tighter">No Treasures Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed mb-8">
            {searchQuery ? `No listings match "${searchQuery}" in Suq Al-Mubaraki.` : "The market is currently quiet. Be the first to list a spiritual essential!"}
          </p>
          {activeTab === 'all' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-brand-primary text-brand-depth rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-primary/20"
            >
              Start Selling
            </button>
          )}
        </div>
      )}

      {/* Create Listing Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCreateModal(false)}
               className="absolute inset-0 bg-brand-depth/80 backdrop-blur-xl"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-brand-sidebar border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
                   <h3 className="text-xl font-black text-white">Create New Listing</h3>
                   <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
                </div>
                
                <div className="overflow-y-auto p-8 no-scrollbar">
                  <form onSubmit={handleCreateListing} className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Product Title</label>
                        <input 
                          required
                          type="text" 
                          value={newListing.title}
                          onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                          placeholder="e.g., Luxury Musalla"
                          className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-4 px-6 text-white font-medium outline-none focus:border-brand-primary/40 transition-all"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Price (USD)</label>
                          <div className="relative">
                             <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                             <input 
                               required
                               type="number" 
                               step="0.01"
                               value={newListing.price}
                               onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                               placeholder="29.99"
                               className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-medium outline-none focus:border-brand-primary/40 transition-all"
                             />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Category</label>
                          <select 
                            value={newListing.category}
                            onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                            className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-4 px-6 text-white font-medium outline-none focus:border-brand-primary/40 transition-all appearance-none"
                          >
                             {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2 col-span-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Condition</label>
                           <select 
                             value={newListing.condition}
                             onChange={(e) => setNewListing({...newListing, condition: e.target.value as any})}
                             className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-4 px-6 text-white font-medium outline-none focus:border-brand-primary/40 transition-all appearance-none"
                           >
                              {['New', 'Like New', 'Good', 'Fair'].map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Description</label>
                        <textarea 
                          required
                          rows={3}
                          value={newListing.description}
                          onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                          placeholder="Detail your item's condition and features..."
                          className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-4 px-6 text-white font-medium outline-none focus:border-brand-primary/40 transition-all resize-none"
                        />
                     </div>

                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Product Images</label>
                        
                        {/* Image Upload Area */}
                        <div className="relative group">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-full aspect-video bg-brand-depth/50 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 group-hover:border-brand-primary/40 transition-all overflow-hidden relative">
                               {imagePreview ? (
                                 <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                               ) : (
                                 <>
                                   <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-brand-primary transition-colors">
                                     <ImageIcon size={24} />
                                   </div>
                                   <div className="text-center">
                                      <p className="text-xs font-bold text-white uppercase tracking-widest">Upload Image</p>
                                      <p className="text-[8px] text-slate-500 font-medium">Max 800KB for spiritual stability</p>
                                   </div>
                                 </>
                               )}
                            </div>
                        </div>

                        <div className="relative">
                           <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                           <input 
                             type="url" 
                             value={newListing.imageUrl}
                             onChange={(e) => {
                               setNewListing({...newListing, imageUrl: e.target.value});
                               setImagePreview(e.target.value);
                             }}
                             placeholder="Or paste an Image URL..."
                             className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-medium outline-none focus:border-brand-primary/40 transition-all"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Additional Images (URLs)</label>
                        {newListing.images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input 
                              type="url" 
                              value={img}
                              onChange={(e) => {
                                const updated = [...newListing.images];
                                updated[idx] = e.target.value;
                                setNewListing({...newListing, images: updated});
                              }}
                              placeholder={`Additional Image URL ${idx + 2}...`}
                              className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-medium outline-none focus:border-brand-primary/40 transition-all"
                            />
                          </div>
                        ))}
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Video Presentation (URL)</label>
                        <div className="relative">
                           <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                           <input 
                             type="url" 
                             value={newListing.videoUrl}
                             onChange={(e) => setNewListing({...newListing, videoUrl: e.target.value})}
                             placeholder="YouTube or Video link..."
                             className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-medium outline-none focus:border-brand-primary/40 transition-all"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Seller Contact Detail</label>
                        <div className="relative">
                           <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                           <input 
                             type="text" 
                             value={newListing.contactInfo}
                             onChange={(e) => setNewListing({...newListing, contactInfo: e.target.value})}
                             placeholder="Phone or specific contact handle..."
                             className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-medium outline-none focus:border-brand-primary/40 transition-all"
                           />
                        </div>
                     </div>

                     <button 
                       disabled={isSubmitting}
                       type="submit"
                       className="w-full bg-brand-primary text-brand-depth font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                     >
                        {isSubmitting ? 'Posting...' : 'Create Listing'}
                        <ArrowRight size={20} />
                     </button>
                  </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                className="relative w-full max-w-5xl bg-brand-sidebar border border-brand-primary/20 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
              >
                 <div className="w-full md:w-1/2 h-80 md:h-auto overflow-hidden bg-brand-depth/40 relative">
                    {activeProduct.imageUrl ? (
                      <img src={activeProduct.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-700">
                         <Package size={64} className="mb-4 opacity-20" />
                      </div>
                    )}
                    <div className="absolute bottom-8 right-8 bg-brand-depth/90 backdrop-blur-xl px-6 py-4 rounded-3xl border border-brand-primary/30 shadow-2xl">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Asking Price</p>
                       <span className="text-3xl font-black text-brand-primary">${activeProduct.price}</span>
                    </div>
                 </div>
                 <div className="p-8 sm:p-12 flex-1 relative flex flex-col overflow-y-auto no-scrollbar">
                    <button 
                      onClick={() => setActiveProduct(null)}
                      className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl"
                    >
                      <X size={24} />
                    </button>
                    
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">{activeProduct.category}</span>
                          <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase tracking-widest">Active Listing</span>
                          <span className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-[8px] font-black uppercase tracking-widest border border-white/5">{activeProduct.condition || 'New'}</span>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">{activeProduct.title}</h3>
                        <StarRating rating={activeProduct.rating || 5.0} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                               <UserIcon className="text-brand-primary" size={24} />
                            </div>
                            <div>
                               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Listed by</p>
                               <p className="text-sm font-black text-white">{activeProduct.sellerName}</p>
                            </div>
                         </div>
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                               <ImageIcon className="text-brand-primary" size={24} />
                            </div>
                            <div>
                               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Condition</p>
                               <p className="text-sm font-black text-white">{activeProduct.condition || 'New'}</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h5 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Item Description</h5>
                         <p className="text-slate-400 text-base md:text-lg leading-relaxed font-medium">
                            {activeProduct.description}
                         </p>
                      </div>

                      <div className="pt-8 border-t border-white/5 flex gap-4">
                         {activeProduct.sellerId !== auth.currentUser?.uid ? (
                            <>
                              <button 
                                onClick={() => handleMessageSeller(activeProduct!)}
                                className="flex-1 bg-brand-primary text-brand-depth h-16 rounded-[1.5rem] font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                              >
                                <MessageCircle size={24} />
                                Message Seller
                              </button>
                              <button 
                                onClick={() => alert("Interest noted! The seller will be notified.")}
                                className="w-16 h-16 bg-white/5 text-white border border-white/10 rounded-[1.5rem] flex items-center justify-center hover:bg-white/10 transition-all"
                              >
                                <Heart size={24} />
                              </button>
                            </>
                         ) : (
                            <button 
                              disabled
                              className="w-full bg-white/5 text-slate-500 h-16 rounded-[1.5rem] font-black text-lg border border-white/5"
                            >
                              This is your listing
                            </button>
                         )}
                      </div>
                    </div>
                 </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

