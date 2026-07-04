import { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  Mic,
  Truck,
  ShieldCheck,
  Check,
  CheckCircle2,
  Info,
  Sparkles
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
  Timestamp,
  updateDoc
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
  brand?: string;
  specifications?: string;
  shippingEstimate?: string;
  features?: string[];
  reviews?: {
    id: string;
    reviewerName: string;
    reviewerPhoto?: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [setSearchQuery]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Form State
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    brand: '',
    price: '',
    category: 'Worship',
    imageUrl: '',
    images: ['', '', ''], // 3 additional images (bringing total potential pics to 4)
    videoUrl: '',
    contactInfo: '',
    condition: 'New' as Listing['condition'],
    specifications: '',
    shippingEstimate: 'Standard Shipping (3-5 business days)',
    features: ['', '', ''] // Three bullet point highlights
  });

  // State for interactive gallery, product detail tabs, and review form
  const [actionImageIndex, setActionImageIndex] = useState(0);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Reset indices and tabs when product changes
  useEffect(() => {
    setActionImageIndex(0);
    setActiveDetailTab('details');
  }, [activeProduct?.id]);

  const categories = ['All', 'Worship', 'Books', 'Fragrance', 'Decor', 'Clothing', 'Other'];

  // Handle upload for any slot index (0 = main cover, 1 = image 2, etc.)
  const handleImageUploadForSlot = (e: React.ChangeEvent<HTMLInputElement>, slotIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // ~800KB Firestore limit
      alert("Image is too large. Please upload an image under 800KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (slotIdx === 0) {
        setNewListing(prev => ({ ...prev, imageUrl: base64String }));
        setImagePreview(base64String);
      } else {
        const updated = [...newListing.images];
        updated[slotIdx - 1] = base64String;
        setNewListing(prev => ({ ...prev, images: updated }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUploadForSlot(e, 0);
  };

  useEffect(() => {
    if (!auth.currentUser || auth.currentUser.uid.startsWith('local_')) return;
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
    
    const allImages = [newListing.imageUrl, ...newListing.images].filter(url => url.trim() !== '');
    
    // Enforce interactive multi-image requirement for seller validation (Jumia / Amazon standards)
    if (allImages.length < 2) {
      alert("⚠️ Listing Standards Required: To protect buyers and ensure authenticity (similar to Jumia and Amazon standards), you are required to provide at least 2 different pictures of your product relative to its condition. Please upload or paste at least 1 more image.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'listings'), {
        title: newListing.title,
        description: newListing.description,
        brand: newListing.brand || 'Generic/Unbranded',
        price: parseFloat(newListing.price),
        category: newListing.category,
        imageUrl: allImages[0] || '',
        images: allImages,
        videoUrl: newListing.videoUrl || '',
        contactInfo: newListing.contactInfo || '',
        condition: newListing.condition,
        specifications: newListing.specifications || '',
        shippingEstimate: newListing.shippingEstimate || 'Standard Shipping (3-5 business days)',
        features: newListing.features.filter(f => f.trim() !== ''),
        sellerId: auth.currentUser.uid,
        sellerName: auth.currentUser.displayName || 'Anonymous',
        sellerPhoto: auth.currentUser.photoURL,
        status: 'active',
        createdAt: serverTimestamp(),
        rating: 5.0, // Default rating for new items
        reviews: [] // Default empty review container
      });
      setShowCreateModal(false);
      setImagePreview(null);
      setNewListing({ 
        title: '', 
        description: '', 
        brand: '',
        price: '', 
        category: 'Worship', 
        imageUrl: '', 
        images: ['', '', ''], 
        videoUrl: '', 
        contactInfo: '',
        condition: 'New',
        specifications: '',
        shippingEstimate: 'Standard Shipping (3-5 business days)',
        features: ['', '', '']
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

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !activeProduct) return;
    if (!reviewComment.trim()) {
      alert("Please enter a clear comment for your Jumia/Amazon-style review!");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newReview = {
        id: Math.random().toString(36).substring(2, 11),
        reviewerName: auth.currentUser.displayName || 'Authorized Buyer',
        reviewerPhoto: auth.currentUser.photoURL || '',
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toISOString()
      };

      const originalReviews = activeProduct.reviews || [];
      const updatedReviews = [newReview, ...originalReviews];
      const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

      // Update state immediately for rapid reactivity
      const updatedProduct = {
        ...activeProduct,
        reviews: updatedReviews,
        rating: avgRating
      };
      setActiveProduct(updatedProduct);
      setReviewComment('');
      setReviewRating(5);

      // Commit update to Firebase
      await updateDoc(doc(db, 'listings', activeProduct.id), {
        reviews: updatedReviews,
        rating: avgRating
      });
    } catch (error) {
      console.error("Error posting feedback: ", error);
      alert("Could not persist review inside the bazaar. Please make sure your database is connected.");
    } finally {
      setIsSubmittingReview(false);
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
    const allProductPhotos = [activeProduct.imageUrl, ...(activeProduct.images || [])].filter(url => url && url.trim() !== '');
    const currentMainPhoto = allProductPhotos[actionImageIndex] || activeProduct.imageUrl || '';
    const productReviews = activeProduct.reviews || [];
    
    // Auto-generate standard bullet points if not specified
    const bulletHighlights = (activeProduct.features && activeProduct.features.length > 0)
      ? activeProduct.features
      : [
          `Premium spiritual craft, customized to enhance worship mindfulness & comfort.`,
          `High-fidelity condition check: Verified ${activeProduct.condition || 'New'} item.`,
          `Includes free direct community secure-communications & Buyer Trust protection.`
        ];

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
            <p className="text-slate-500 font-medium text-sm">Amazon & Jumia Standards Premium Catalog Experience</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Multimedia Gallery Section (Left Panel) - lg:col-span-6 */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-brand-depth/40 group">
              {currentMainPhoto ? (
                <img src={currentMainPhoto} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-800">
                  <Package size={80} className="mb-4 opacity-20" />
                  <span className="text-xs font-black uppercase tracking-widest">No pictures available</span>
                </div>
              )}
              {/* Image Counter Badge */}
              <div className="absolute bottom-6 left-6 bg-brand-depth/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300">
                 Image {actionImageIndex + 1} of {allProductPhotos.length}
              </div>
            </div>

            {/* Gallery Thumbnail Swapping Controls */}
            {allProductPhotos.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {allProductPhotos.map((url, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActionImageIndex(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border transition-all ${actionImageIndex === i ? 'border-brand-primary h-[84px] w-[84px] shadow-lg shadow-brand-primary/20 scale-105 bg-brand-primary/10' : 'border-white/5 hover:border-white/20 opacity-70 hover:opacity-100'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {activeProduct.videoUrl && (
                  <a href={activeProduct.videoUrl} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-2xl bg-brand-primary/10 flex flex-col items-center justify-center text-brand-primary border border-brand-primary/20 hover:bg-brand-primary hover:text-brand-depth transition-all group">
                     <Video size={20} className="group-hover:scale-110 transition-transform" />
                     <span className="text-[8px] font-black mt-1 uppercase">Watch Video</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Details & Shopping Cart Sidebar Center Component (Right Panel) - lg:col-span-6 */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase tracking-widest border border-brand-primary/20">{activeProduct.category}</span>
                {activeProduct.brand && (
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[8px] font-black uppercase tracking-widest border border-white/5">Brand: {activeProduct.brand}</span>
                )}
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/15">Active</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">{activeProduct.title}</h1>
              
              <div className="flex items-center gap-3">
                <StarRating rating={activeProduct.rating || 5.0} />
                <span className="text-xs text-slate-500 font-bold">| {productReviews.length} Amazon Customer Reviews</span>
              </div>
            </div>

            {/* Price Box Panel & Delivery Estimates */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-brand-sidebar/40 p-6 rounded-3xl border border-white/5">
              <div className="md:col-span-7 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Selling Price</p>
                  <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-black text-brand-primary">${activeProduct.price}</span>
                     <span className="text-xs font-black text-slate-500 line-through">${(activeProduct.price * 1.25).toFixed(2)}</span>
                     <span className="text-[10px] text-brand-primary font-black uppercase tracking-wide bg-brand-primary/10 px-2 py-0.5 rounded">20% OFF</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-brand-primary" />
                    <p>Standard delivery timeline: <span className="text-white font-bold">{activeProduct.shippingEstimate || 'Standard Shipping (3-5 business days)'}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <p>Guarantee: <span className="text-emerald-500 font-bold">Suq Al-Mubaraki Certified Secure Purchase</span></p>
                  </div>
                </div>
              </div>

              {/* Action Controls Sidebar Box */}
              <div className="md:col-span-5 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 space-y-4">
                <p className="text-xs text-slate-500 font-bold">Seller Status: <span className="text-emerald-500">In Stock</span></p>
                {activeProduct.sellerId !== auth.currentUser?.uid ? (
                  <>
                    <button 
                      onClick={() => handleMessageSeller(activeProduct)}
                      className="w-full bg-brand-primary text-brand-depth h-12 rounded-xl font-black text-xs shadow-xl shadow-brand-primary/15 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 underline decoration-brand-depth/20"
                    >
                      <MessageCircle size={16} />
                      Order Now (Message)
                    </button>
                    {activeProduct.contactInfo && (
                      <p className="text-[10px] text-center text-slate-400 font-mono tracking-wider">Contact No: {activeProduct.contactInfo}</p>
                    )}
                  </>
                ) : (
                  <div className="text-center p-3 border border-dashed border-white/10 rounded-xl bg-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">You listed this</p>
                  </div>
                )}
              </div>
            </div>

            {/* E-Commerce Advanced Spec Tabs Section */}
            <div className="space-y-6">
              {/* Tab Header Buttons */}
              <div className="flex border-b border-white/10">
                {(['details', 'specs', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveDetailTab(tab)}
                    className={`px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeDetailTab === tab ? 'border-brand-primary text-brand-primary bg-brand-primary/5' : 'border-transparent text-slate-500 hover:text-white'}`}
                  >
                    {tab === 'details' ? 'About this item' : tab === 'specs' ? 'Product Specifications' : `Reviews (${productReviews.length})`}
                  </button>
                ))}
              </div>

              {/* Tab Panels */}
              <div className="min-h-40">
                {activeDetailTab === 'details' && (
                  <div className="space-y-6">
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">
                      {activeProduct.description}
                    </p>
                    
                    {/* Bullet Highlights Checklist */}
                    <div className="space-y-2 pt-4 border-t border-white/5">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">About this item:</h4>
                      <ul className="space-y-2">
                        {bulletHighlights.map((hl, index) => (
                          <li key={index} className="flex gap-3 text-xs text-slate-400">
                            <Sparkles size={14} className="text-brand-primary shrink-0 mt-0.5" />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'specs' && (
                  <div className="border border-white/5 rounded-2xl overflow-hidden bg-brand-depth/25">
                    <table className="w-full text-left text-xs text-slate-400">
                      <tbody>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 font-black text-slate-500 uppercase tracking-wider w-1/3 border-r border-white/5 bg-white/5">Brand</td>
                          <td className="px-6 py-3 text-white font-bold">{activeProduct.brand || 'Generic/Unbranded'}</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 font-black text-slate-500 uppercase tracking-wider border-r border-white/5 bg-white/5">Condition</td>
                          <td className="px-6 py-3 text-white font-bold">{activeProduct.condition || 'New'}</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 font-black text-slate-500 uppercase tracking-wider border-r border-white/5 bg-white/5">Category</td>
                          <td className="px-6 py-3 text-white font-bold">{activeProduct.category}</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 font-black text-slate-500 uppercase tracking-wider border-r border-white/5 bg-white/5">Shipping Timeline</td>
                          <td className="px-6 py-3 text-white font-bold">{activeProduct.shippingEstimate || 'Ships in 3-5 business days'}</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 font-black text-slate-500 uppercase tracking-wider border-r border-white/5 bg-white/5">Item Specifications</td>
                          <td className="px-6 py-3 text-white font-medium">{activeProduct.specifications || 'Standard spiritual dimensions'}</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 font-black text-slate-500 uppercase tracking-wider border-r border-white/5 bg-white/5">Catalog Code</td>
                          <td className="px-6 py-3 text-slate-500 font-mono text-[10px] uppercase tracking-widest">{activeProduct.id.substring(0, 10)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeDetailTab === 'reviews' && (
                  <div className="space-y-6">
                    {/* Submit Review Subform Component inside tab */}
                    {auth.currentUser && (
                      <form onSubmit={handlePostReview} className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-brand-primary" />
                          Share your buyer feedback
                        </h4>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Your rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setReviewRating(s)}
                                className="text-brand-primary hover:scale-110 transition-transform"
                              >
                                <Star
                                  size={16}
                                  className={s <= reviewRating ? 'fill-brand-primary text-brand-primary' : 'text-slate-600'}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="relative">
                          <textarea
                            required
                            rows={2}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="How is this item? E.g., 'Amazing quality and fast delivery! Perfect for daily prayer rituals.'"
                            className="w-full bg-brand-depth/50 border border-white/10 rounded-xl p-4 text-xs text-white focus:border-brand-primary/40 outline-none resize-none placeholder-slate-600"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="px-5 py-2.5 bg-brand-primary text-brand-depth rounded-lg text-[10px] font-black uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50"
                        >
                          {isSubmittingReview ? 'Posting...' : 'Post Customer Review'}
                        </button>
                      </form>
                    )}

                    {/* Customer Review List Rendering */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 no-scrollbar pb-10">
                      {productReviews.length > 0 ? (
                        productReviews.map((rev) => (
                          <div key={rev.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs font-black text-brand-primary">
                                  {rev.reviewerName ? rev.reviewerName[0].toUpperCase() : 'B'}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-white">{rev.reviewerName}</p>
                                  <p className="text-[8px] text-slate-500 font-medium uppercase">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star 
                                    key={s} 
                                    size={10} 
                                    className={s <= rev.rating ? 'fill-brand-primary text-brand-primary' : 'text-slate-700'} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{rev.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No buyer comments yet</p>
                          <p className="text-[10px] text-slate-600 font-medium mt-1">Order this treasure and share your experience with other believers.</p>
                        </div>
                      )}
                    </div>
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
                className="w-full md:w-64 bg-brand-sidebar/50 border border-white/5 rounded-2xl py-3 pl-11 pr-12 md:pl-12 md:pr-12 text-sm text-white focus:border-brand-primary/40 outline-none backdrop-blur-md transition-all"
              />
              <button 
                onClick={toggleListening}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all ${isListening ? 'text-brand-primary bg-brand-primary/10 animate-pulse' : 'text-slate-500 hover:text-white'}`}
                title="Voice Search"
              >
                <Mic size={16} />
              </button>
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

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Brand Name</label>
                          <input 
                            type="text" 
                            value={newListing.brand}
                            onChange={(e) => setNewListing({...newListing, brand: e.target.value})}
                            placeholder="e.g., Al-Mubaraki Crafts"
                            className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-3.5 px-4 text-xs text-white font-medium outline-none focus:border-brand-primary/40 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Shipping Estimate</label>
                           <select 
                             value={newListing.shippingEstimate}
                             onChange={(e) => setNewListing({...newListing, shippingEstimate: e.target.value})}
                             className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-3.5 px-4 text-xs text-white font-medium outline-none focus:border-brand-primary/40 transition-all appearance-none"
                           >
                              {['Standard Shipping (3-5 business days)', 'Express Shipping (1-2 business days)', 'Free Economy Shipping (5-7 business days)', 'Same Day Courier (Local only)'].map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Detailed Specifications</label>
                        <input 
                          type="text" 
                          value={newListing.specifications}
                          onChange={(e) => setNewListing({...newListing, specifications: e.target.value})}
                          placeholder="e.g., Size: 110x70cm, Weight: 1.2kg, Material: Organic Velvet"
                          className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-3.5 px-4 text-xs text-white font-medium outline-none focus:border-brand-primary/40 transition-all"
                        />
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Bullet Features (Amazon-style highlights)</label>
                        {[0, 1, 2].map((idx) => (
                          <div key={idx} className="relative flex items-center">
                            <span className="absolute left-4 text-brand-primary font-black text-[10px]">#{idx + 1}</span>
                            <input 
                              type="text" 
                              value={newListing.features[idx] || ''}
                              onChange={(e) => {
                                const updated = [...newListing.features];
                                updated[idx] = e.target.value;
                                setNewListing({...newListing, features: updated});
                              }}
                              placeholder={`Highlight feature ${idx + 1}...`}
                              className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-xs text-white font-medium outline-none focus:border-brand-primary/40 transition-all"
                            />
                          </div>
                        ))}
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                          Product Images (Upload or paste URLs - Min 2 required)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {[0, 1, 2, 3].map((idx) => {
                            const isMain = idx === 0;
                            const currentVal = isMain ? newListing.imageUrl : newListing.images[idx - 1];
                            const label = isMain ? 'Main Cover' : `Image ${idx + 1}`;
                            
                            return (
                              <div key={idx} className="bg-brand-depth/40 border border-white/5 rounded-2xl p-3 space-y-2 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black uppercase text-brand-primary tracking-widest">{label}</span>
                                  {currentVal && (
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        if (isMain) {
                                          setNewListing(prev => ({ ...prev, imageUrl: '' }));
                                          setImagePreview(null);
                                        } else {
                                          const updated = [...newListing.images];
                                          updated[idx - 1] = '';
                                          setNewListing(prev => ({ ...prev, images: updated }));
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-400 p-1"
                                      title="Remove"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                                
                                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-brand-sidebar flex flex-col items-center justify-center">
                                  {currentVal ? (
                                    <img src={currentVal} alt="Preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-center p-2">
                                      <ImageIcon size={16} className="text-slate-600 mx-auto mb-1" />
                                      <span className="text-[8px] text-slate-500 font-bold">No Image</span>
                                    </div>
                                  )}
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleImageUploadForSlot(e, idx)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    title="Choose File"
                                  />
                                </div>
                                
                                <input 
                                  type="url"
                                  value={currentVal || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (isMain) {
                                      setNewListing(prev => ({ ...prev, imageUrl: val }));
                                      setImagePreview(val);
                                    } else {
                                      const updated = [...newListing.images];
                                      updated[idx - 1] = val;
                                      setNewListing(prev => ({ ...prev, images: updated }));
                                    }
                                  }}
                                  placeholder="Or paste URL..."
                                  className="w-full bg-brand-depth/80 border border-white/10 rounded-lg py-1 px-2 text-[9px] text-white outline-none focus:border-brand-primary/40 transition-all font-medium"
                                />
                              </div>
                            );
                          })}
                        </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
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
                className="relative w-full max-w-5xl bg-brand-sidebar border border-brand-primary/20 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh]"
              >
                  {/* Left Side: Dynamic Image Gallery */}
                  <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-brand-depth/25 relative border-b md:border-b-0 md:border-r border-white/5">
                     <button 
                       onClick={() => setActiveProduct(null)}
                       className="absolute top-6 left-6 md:hidden z-20 text-slate-500 hover:text-white transition-colors p-2 bg-brand-depth/80 backdrop-blur-md rounded-xl"
                     >
                       <X size={20} />
                     </button>

                     {/* Selected Main Photo Display */}
                     <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden relative border border-white/5 bg-brand-depth/50 shrink-0">
                        {(() => {
                          const photos = [activeProduct.imageUrl, ...(activeProduct.images || [])].filter(u => u && u.trim() !== '');
                          const currentPhoto = photos[actionImageIndex] || activeProduct.imageUrl || '';
                          return currentPhoto ? (
                            <img src={currentPhoto} alt={activeProduct.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700">
                               <Package size={48} className="opacity-20" />
                            </div>
                          );
                        })()}
                        {/* Asking Price Tag Badge inside gallery */}
                        <div className="absolute top-4 right-4 bg-brand-depth/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-brand-primary/30 shadow-2xl">
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Price</p>
                           <span className="text-xl font-black text-brand-primary">${activeProduct.price}</span>
                        </div>
                     </div>

                     {/* Thumbnail Swapper Row */}
                     {(() => {
                       const photos = [activeProduct.imageUrl, ...(activeProduct.images || [])].filter(u => u && u.trim() !== '');
                       return photos.length > 0 ? (
                         <div className="flex flex-wrap gap-2 mt-4 shrink-0">
                           {photos.map((u, i) => (
                             <button
                               key={i}
                               onClick={() => setActionImageIndex(i)}
                               className={`w-14 h-14 rounded-xl overflow-hidden border transition-all ${actionImageIndex === i ? 'border-brand-primary scale-105 shadow-md shadow-brand-primary/10' : 'border-white/5 opacity-75 hover:opacity-100'}`}
                             >
                               <img src={u} alt="" className="w-full h-full object-cover" />
                             </button>
                           ))}
                           {activeProduct.videoUrl && (
                             <a 
                               href={activeProduct.videoUrl} 
                               target="_blank" 
                               rel="noreferrer" 
                               className="w-14 h-14 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex flex-col items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-brand-depth transition-all"
                             >
                               <Video size={14} />
                             </a>
                           )}
                         </div>
                       ) : null;
                     })()}

                     {/* Support Service Guarantee Footer (Amazon standard) */}
                     <div className="hidden md:flex items-center gap-2 mt-6 p-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] text-slate-400 font-bold">
                        <ShieldCheck size={16} className="text-brand-primary shrink-0" />
                        <div>
                           <p className="text-white">Suq Al-Mubaraki Pledge</p>
                           <p className="font-normal text-[9px]">2-Step buyer refund or secure direct mediation support.</p>
                        </div>
                     </div>
                  </div>

                  {/* Right Side: Tabbed Description Details Panel */}
                  <div className="p-6 md:p-8 flex-1 relative flex flex-col overflow-y-auto no-scrollbar max-h-[50vh] md:max-h-none">
                     <button 
                       onClick={() => setActiveProduct(null)}
                       className="hidden md:block absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl z-20"
                     >
                       <X size={24} />
                     </button>
                     
                     <div className="space-y-6">
                       <div>
                         <div className="flex flex-wrap items-center gap-2 mb-3">
                           <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest px-2.5 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">{activeProduct.category}</span>
                           {activeProduct.brand && (
                             <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-2.5 py-1 bg-slate-800 border border-white/5 rounded-lg">Brand: {activeProduct.brand}</span>
                           )}
                           <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Trust Checked</span>
                         </div>
                         
                         <h3 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight mb-3">{activeProduct.title}</h3>
                         
                         <div className="flex items-center gap-2">
                           <StarRating rating={activeProduct.rating || 5.0} />
                           <span className="text-[10px] text-slate-500 font-bold">| {activeProduct.reviews?.length || 0} reviews</span>
                         </div>
                       </div>

                       {/* Interactive Navigation Tabs inside Modal */}
                       <div className="flex border-b border-white/5">
                         {(['details', 'specs', 'reviews'] as const).map((tab) => (
                           <button
                             key={tab}
                             onClick={() => setActiveDetailTab(tab)}
                             className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all ${activeDetailTab === tab ? 'border-brand-primary text-brand-primary bg-brand-primary/5' : 'border-transparent text-slate-500 hover:text-white'}`}
                           >
                             {tab === 'details' ? 'About Item' : tab === 'specs' ? 'Specifications' : `Reviews (${activeProduct.reviews?.length || 0})`}
                           </button>
                         ))}
                       </div>

                       {/* Tab Area content details */}
                       <div className="min-h-32 text-xs">
                         {activeDetailTab === 'details' && (
                           <div className="space-y-4">
                             <p className="text-slate-300 leading-relaxed font-medium">
                               {activeProduct.description}
                             </p>
                             
                             <div className="space-y-1.5 pt-3 border-t border-white/5">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Item Bullet Features:</p>
                               <ul className="space-y-1.5">
                                 {((activeProduct.features && activeProduct.features.length > 0) ? activeProduct.features : [
                                   `High quality material selection, optimized for your worship rituals`,
                                   `Meets authentic design standards of Al-Farooq partner bazaar`,
                                   `Full buyer safety warranty via community active chats`
                                 ]).map((hl, offset) => (
                                   <li key={offset} className="flex gap-2 text-slate-400">
                                     <Sparkles size={11} className="text-brand-primary shrink-0 mt-0.5" />
                                     <span>{hl}</span>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           </div>
                         )}

                         {activeDetailTab === 'specs' && (
                           <div className="border border-white/5 rounded-xl overflow-hidden bg-brand-depth/20">
                             <table className="w-full text-left text-[11px] text-slate-400">
                               <tbody>
                                 <tr className="border-b border-white/5 bg-white/5">
                                   <td className="px-4 py-2 font-black text-slate-500 uppercase tracking-wider w-1/3 border-r border-white/5">Brand</td>
                                   <td className="px-4 py-2 text-white font-bold">{activeProduct.brand || 'Generic/Unbranded'}</td>
                                 </tr>
                                 <tr className="border-b border-white/5">
                                   <td className="px-4 py-2 font-black text-slate-500 uppercase tracking-wider border-r border-white/5 bg-white/5">Condition</td>
                                   <td className="px-4 py-2 text-white font-bold">{activeProduct.condition || 'New'}</td>
                                 </tr>
                                 <tr className="border-b border-white/5">
                                   <td className="px-4 py-2 font-black text-slate-500 uppercase tracking-wider border-r border-white/5 bg-white/5">Delivery est</td>
                                   <td className="px-4 py-2 text-white font-bold">{activeProduct.shippingEstimate || 'Ships in 3-5 business days'}</td>
                                 </tr>
                                 <tr>
                                   <td className="px-4 py-2 font-black text-slate-500 uppercase tracking-wider border-r border-white/5 bg-white/5">Core Dimensions</td>
                                   <td className="px-4 py-2 text-white font-medium">{activeProduct.specifications || 'Standard Catalog Unit'}</td>
                                 </tr>
                               </tbody>
                             </table>
                           </div>
                         )}

                         {activeDetailTab === 'reviews' && (
                           <div className="space-y-4">
                             {/* Mini reviews adder */}
                             {auth.currentUser && (
                               <form onSubmit={handlePostReview} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                                 <div className="flex items-center justify-between">
                                   <span className="text-[9px] font-black text-white uppercase tracking-wider">Leave listing score :</span>
                                   <div className="flex gap-0.5">
                                     {[1, 2, 3, 4, 5].map((s) => (
                                       <button
                                         key={s}
                                         type="button"
                                         onClick={() => setReviewRating(s)}
                                         className="text-brand-primary text-xs"
                                       >
                                         <Star size={12} className={s <= reviewRating ? 'fill-brand-primary text-brand-primary' : 'text-slate-600'} />
                                       </button>
                                     ))}
                                   </div>
                                 </div>
                                 <input
                                   required
                                   type="text"
                                   value={reviewComment}
                                   onChange={(e) => setReviewComment(e.target.value)}
                                   placeholder="Review this product..."
                                   className="w-full bg-brand-depth/40 border border-white/10 rounded-lg p-2 text-[11px] text-white focus:border-brand-primary/40 outline-none"
                                 />
                                 <button
                                   type="submit"
                                   disabled={isSubmittingReview}
                                   className="px-3 py-1.5 bg-brand-primary text-brand-depth font-black rounded text-[9px] uppercase tracking-wider"
                                 >
                                   Post Review
                                 </button>
                               </form>
                             )}

                             {/* Feed list */}
                             <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2 no-scrollbar">
                               {activeProduct.reviews && activeProduct.reviews.length > 0 ? (
                                 activeProduct.reviews.map((rev) => (
                                   <div key={rev.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                                     <div className="flex items-center justify-between">
                                        <p className="font-bold text-white text-[11px]">{rev.reviewerName}</p>
                                        <div className="flex">
                                          {[1,2,3,4,5].map((s) => (
                                            <Star key={s} size={8} className={s <= rev.rating ? 'fill-brand-primary text-brand-primary' : 'text-slate-700'} />
                                          ))}
                                        </div>
                                     </div>
                                     <p className="text-slate-400 text-[10px] leading-relaxed">{rev.comment}</p>
                                   </div>
                                 ))
                               ) : (
                                 <p className="text-center text-[10px] text-slate-600 py-4 font-bold uppercase tracking-widest">No buyer comments registered</p>
                               )}
                             </div>
                           </div>
                         )}
                       </div>

                       {/* Action Buying Controls */}
                       <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                          {activeProduct.sellerId !== auth.currentUser?.uid ? (
                             <>
                               <button 
                                 onClick={() => {
                                   setActiveProduct(null);
                                   handleMessageSeller(activeProduct);
                                 }}
                                 className="flex-1 bg-brand-primary text-brand-depth h-12 rounded-xl font-black text-xs shadow-lg shadow-brand-primary/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                               >
                                 <MessageCircle size={16} />
                                 Contact Seller
                               </button>
                               {activeProduct.contactInfo && (
                                 <div className="px-4 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs text-white select-all font-mono tracking-wider">
                                    Call: {activeProduct.contactInfo}
                                 </div>
                               )}
                             </>
                          ) : (
                             <button 
                               disabled
                               className="w-full bg-white/5 text-slate-500 h-12 rounded-xl font-black text-xs border border-white/5"
                             >
                               Your Listing Account
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

