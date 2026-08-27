import React, { useState, useEffect, useRef } from 'react';
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
  Edit3,
  Video,
  Phone,
  LayoutGrid,
  ChevronLeft,
  Mic,
  Truck,
  Shield,
  ShieldCheck,
  Check,
  CheckCircle2,
  Info,
  Sparkles,
  Coins,
  CreditCard,
  MessageSquare,
  MapPin,
  HelpCircle,
  ExternalLink,
  Flame,
  ArrowLeft,
  Download,
  FileText,
  FileCheck,
  FolderArchive,
  Music,
  Share2,
  Flag,
  AlertTriangle,
  AlertCircle,
  ZoomIn
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import CoinShopModal, { getStoredCoins, deductStoredCoins } from './CoinShopModal';
import { STARTER_MARKET_LISTINGS } from '../data/marketData';
import { shareService } from '../services/shareService';
import { ActivityLoggerService } from '../services/activityLoggerService';
import { MediaLightboxModal, LightboxMediaItem } from './MediaLightboxModal';
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
  updateDoc,
  increment
} from 'firebase/firestore';

import { handleFirestoreError, OperationType } from '../lib/utils';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  coinPrice?: number;
  pricingMode?: 'both' | 'coins' | 'cash';
  category: string;
  imageUrl: string;
  images?: string[];
  videoUrl?: string;
  contactInfo?: string;
  whatsappNumber?: string;
  cityLocation?: string;
  isNegotiable?: boolean;
  halalCertified?: boolean;
  sellerId: string;
  sellerName: string;
  sellerPhoto?: string;
  status: 'active' | 'sold' | 'deleted' | 'hidden';
  isVisible?: boolean;
  createdAt: Timestamp | any;
  rating?: number;
  condition?: 'New' | 'Like New' | 'Good' | 'Fair';
  brand?: string;
  specifications?: string;
  shippingEstimate?: string;
  features?: string[];
  isDigital?: boolean;
  downloadUrl?: string;
  downloadFormat?: string; // 'PDF' | 'MP3' | 'ZIP' | 'EPUB' | 'XLSX' | 'IMAGE'
  downloadFileName?: string;
  downloadSize?: string;
  downloadCount?: number;
  isFlagged?: boolean;
  flagReason?: string;
  flaggedBy?: string;
  flaggedAt?: string;
  reviews?: {
    id: string;
    reviewerName: string;
    reviewerPhoto?: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
}

interface MarketViewProps {
  detailMode?: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentUser?: any;
  currentHasanat?: number;
  onHasanatDeducted?: (amount: number) => void;
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
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-700'
          }`}
        />
      ))}
      <span className="text-[10px] font-black text-slate-500 ml-1.5">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function MarketView({ 
  detailMode, 
  searchQuery, 
  setSearchQuery,
  currentUser,
  currentHasanat = 0,
  onHasanatDeducted
}: MarketViewProps) {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'digital'>('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProduct, setActiveProduct] = useState<Listing | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 🖼️ Universal Media Lightbox Expansion State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxMediaItems, setLightboxMediaItems] = useState<LightboxMediaItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openProductGalleryLightbox = (product: Listing, startIdx: number = 0) => {
    const allPhotos = [product.imageUrl, ...(product.images || [])].filter(u => u && u.trim() !== '');
    const items: LightboxMediaItem[] = allPhotos.map((url, idx) => ({
      url,
      title: `${product.title} (Photo ${idx + 1}/${allPhotos.length})`,
      caption: `${product.description} • Price: ${product.price || (product.coinPrice ? product.coinPrice + ' Coins' : 'Free')}`,
      author: `${product.sellerName || 'Verified Suq Merchant'} • ${product.cityLocation || 'Sanctuary Marketplace'}`
    }));
    setLightboxMediaItems(items.length > 0 ? items : [{ url: product.imageUrl, title: product.title, caption: product.description }]);
    setLightboxIndex(Math.min(startIdx, Math.max(0, items.length - 1)));
    setIsLightboxOpen(true);
  };

  // Form State
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    brand: '',
    pricingMode: 'both' as 'both' | 'coins' | 'cash',
    price: '',
    coinPrice: '',
    category: 'Worship',
    imageUrl: '',
    images: ['', '', ''], // 3 additional images
    videoUrl: '',
    contactInfo: '',
    whatsappNumber: '',
    cityLocation: '',
    isNegotiable: true,
    condition: 'New' as Listing['condition'],
    specifications: '',
    shippingEstimate: 'Standard Shipping (3-5 business days)',
    features: ['', '', ''],
    // Digital Download Fields
    isDigital: false,
    downloadUrl: '',
    downloadFormat: 'PDF',
    downloadFileName: '',
    downloadSize: ''
  });

  // State for interactive gallery, product detail tabs, and review form
  const [actionImageIndex, setActionImageIndex] = useState(0);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isCoinShopOpen, setIsCoinShopOpen] = useState(false);
  const [userCoins, setUserCoins] = useState<number>(getStoredCoins());
  const [purchaseSuccessToast, setPurchaseSuccessToast] = useState<string | null>(null);
  const [unlockedDownloads, setUnlockedDownloads] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('sanctuary_unlocked_downloads') || '{}');
    } catch {
      return {};
    }
  });

  const activeUser = currentUser || auth.currentUser;
  const isAdmin = currentUser?.email === 'admin@habibisanctuary.com' || 
                  currentUser?.email === 'ssalilukia9@gmail.com' ||
                  currentUser?.role === 'admin' || 
                  currentUser?.role === 'superadmin' || 
                  (typeof localStorage !== 'undefined' && localStorage.getItem('sanctuary_admin_mode') === 'true') ||
                  (typeof localStorage !== 'undefined' && localStorage.getItem('sanctuary_admin_logged_in') === 'true');

  const [flaggingListing, setFlaggingListing] = useState<Listing | null>(null);
  const [flagReasonText, setFlagReasonText] = useState<string>('Inappropriate content or non-halal item');
  const [isFlagSubmitting, setIsFlagSubmitting] = useState<boolean>(false);

  // Edit Product State
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductForm, setEditProductForm] = useState<{
    title: string;
    description: string;
    price: number;
    coinPrice: number;
    category: string;
    brand: string;
    condition: string;
    cityLocation: string;
    halalCertified: boolean;
    isDigital: boolean;
    downloadUrl: string;
    downloadFormat: string;
  }>({
    title: '',
    description: '',
    price: 0,
    coinPrice: 0,
    category: 'Worship',
    brand: '',
    condition: 'New',
    cityLocation: '',
    halalCertified: true,
    isDigital: false,
    downloadUrl: '',
    downloadFormat: 'PDF'
  });

  const handleOpenEditListing = (product: Listing, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingListing(product);
    setEditProductForm({
      title: product.title || '',
      description: product.description || '',
      price: product.price || 0,
      coinPrice: product.coinPrice || Math.round((product.price || 0) * 100),
      category: product.category || 'Worship',
      brand: product.brand || '',
      condition: product.condition || 'New',
      cityLocation: product.cityLocation || '',
      halalCertified: product.halalCertified !== false,
      isDigital: !!product.isDigital,
      downloadUrl: product.downloadUrl || '',
      downloadFormat: product.downloadFormat || 'PDF'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveListingEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    const numPrice = Number(editProductForm.price) || 0;
    const numCoins = Number(editProductForm.coinPrice) || Math.round(numPrice * 100);

    const updatedData: Partial<Listing> = {
      title: editProductForm.title.trim(),
      description: editProductForm.description.trim(),
      price: numPrice,
      coinPrice: numCoins,
      category: editProductForm.category,
      brand: editProductForm.brand.trim(),
      condition: editProductForm.condition as any,
      cityLocation: editProductForm.cityLocation.trim(),
      halalCertified: editProductForm.halalCertified,
      isDigital: editProductForm.isDigital,
      downloadUrl: editProductForm.downloadUrl.trim(),
      downloadFormat: editProductForm.downloadFormat
    };

    try {
      // 1. Update local state
      setListings(prev => prev.map(p => p.id === editingListing.id ? { ...p, ...updatedData } : p));
      if (activeProduct?.id === editingListing.id) {
        setActiveProduct(prev => prev ? { ...prev, ...updatedData } : null);
      }

      const localKey = 'sanctuary_local_market_listings';
      const stored = localStorage.getItem(localKey);
      if (stored) {
        const parsed = JSON.parse(stored).map((p: any) => p.id === editingListing.id ? { ...p, ...updatedData } : p);
        localStorage.setItem(localKey, JSON.stringify(parsed));
      }

      // 2. Update Firestore
      if (activeUser && !activeUser.uid?.startsWith('local_') && !activeUser.uid?.startsWith('rest_')) {
        try {
          await updateDoc(doc(db, 'listings', editingListing.id), {
            ...updatedData,
            updatedAt: serverTimestamp(),
            lastEditedBy: activeUser?.displayName || activeUser?.email || 'Admin/Seller'
          });
        } catch (e) {
          console.warn("Firestore updateDoc fallback:", e);
        }
      }

      // 3. Log to Firestore /activity_logs
      await ActivityLoggerService.logProductEdit({
        id: editingListing.id,
        title: editProductForm.title,
        price: numPrice,
        coinPrice: numCoins,
        category: editProductForm.category
      }, isAdmin ? (currentUser?.displayName || 'Admin') : (currentUser?.displayName || 'Seller'));

      setPurchaseSuccessToast(`✓ Updated listing "${editProductForm.title}"`);
      setTimeout(() => setPurchaseSuccessToast(null), 3500);
      setIsEditModalOpen(false);
      setEditingListing(null);
    } catch (err) {
      console.warn("Error editing listing:", err);
      setIsEditModalOpen(false);
      setEditingListing(null);
    }
  };

  const handleShareListing = (product: Listing, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    shareService.open({
      title: `${product.title} • Suq Al-Mubaraki`,
      badge: product.category,
      text: `${product.title} - ${product.pricingMode === 'coins' ? `${(product.coinPrice || 100).toLocaleString()} Noor Coins` : `$${product.price}`}\n${product.description}`,
      source: `Listed by ${product.sellerName}`,
      author: 'Suq Al-Mubaraki',
      category: product.category,
      imageUrl: product.imageUrl,
      url: `${window.location.origin}/market`
    });
  };

  const handleOpenFlagModal = (product: Listing, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFlaggingListing(product);
    setFlagReasonText('Inappropriate content or non-halal item');
  };

  const handleSubmitFlag = async () => {
    if (!flaggingListing) return;
    setIsFlagSubmitting(true);
    try {
      const updatedListings = listings.map(p => {
        if (p.id === flaggingListing.id) {
          return {
            ...p,
            isFlagged: true,
            flagReason: flagReasonText,
            flaggedBy: activeUser?.displayName || activeUser?.email || 'Community Member',
            flaggedAt: new Date().toISOString()
          };
        }
        return p;
      });
      setListings(updatedListings);
      const localKey = 'sanctuary_local_market_listings';
      localStorage.setItem(localKey, JSON.stringify(updatedListings));

      if (activeUser && !activeUser.uid?.startsWith('local_') && !activeUser.uid?.startsWith('rest_')) {
        await updateDoc(doc(db, 'listings', flaggingListing.id), {
          isFlagged: true,
          flagReason: flagReasonText,
          flaggedBy: activeUser?.displayName || activeUser?.email || 'Community Member',
          flaggedAt: serverTimestamp()
        });
      }

      setPurchaseSuccessToast('🚩 Listing flagged and reported for admin review.');
      setTimeout(() => setPurchaseSuccessToast(null), 4000);
      setFlaggingListing(null);
    } catch (err) {
      console.warn('Flagging error:', err);
      setFlaggingListing(null);
    } finally {
      setIsFlagSubmitting(false);
    }
  };

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

  useEffect(() => {
    const handleSync = (e: any) => {
      if (e.detail?.coins !== undefined) {
        setUserCoins(e.detail.coins);
      }
    };
    const handleMarketSync = () => {
      const localKey = 'sanctuary_local_market_listings';
      const deletedKey = 'sanctuary_deleted_market_ids';
      let deletedIds = new Set<string>();
      try {
        const storedDeleted = localStorage.getItem(deletedKey);
        if (storedDeleted) deletedIds = new Set(JSON.parse(storedDeleted));
      } catch (e) {}

      const stored = localStorage.getItem(localKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setListings(parsed.filter((p: Listing) => !deletedIds.has(p.id)));
          }
        } catch (e) {}
      }
    };

    window.addEventListener('sanctuary_coins_updated', handleSync);
    window.addEventListener('sanctuary_market_updated', handleMarketSync);
    window.addEventListener('sanctuary_listing_deleted', handleMarketSync);
    window.addEventListener('storage', handleMarketSync);

    return () => {
      window.removeEventListener('sanctuary_coins_updated', handleSync);
      window.removeEventListener('sanctuary_market_updated', handleMarketSync);
      window.removeEventListener('sanctuary_listing_deleted', handleMarketSync);
      window.removeEventListener('storage', handleMarketSync);
    };
  }, []);

  // Helper for generating WhatsApp Direct Chat link
  const getWhatsAppUrl = (phone?: string, title?: string, price?: number, coinPrice?: number, pricingMode?: string) => {
    if (!phone || !phone.trim()) return null;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) return null;
    
    let priceSnippet = '';
    if (pricingMode === 'coins') {
      priceSnippet = `${(coinPrice || 100).toLocaleString()} Noor Coins`;
    } else if (pricingMode === 'cash') {
      priceSnippet = `$${price || 0} USD`;
    } else {
      priceSnippet = `$${price || 0} USD / ${(coinPrice || Math.round((price || 0) * 100)).toLocaleString()} Noor Coins`;
    }

    const message = `As-salamu alaykum! I saw your listing "${title || 'item'}" on Habibi Sanctuary Suq (${priceSnippet}) and would like to purchase/ask questions. Is it currently available?`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Instant purchase / unlock with Noor Coins (Unlocks cards and digital resources immediately without blocking alert/confirm)
  const handleBuyWithCoins = (product: Listing, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const coinCost = product.coinPrice || (product.price > 0 ? Math.round(product.price * 100) : 100);
    const currentBalance = getStoredCoins();
    
    if (currentBalance < coinCost && coinCost > 0) {
      setPurchaseSuccessToast(`⚠️ Insufficient Noor Coins: You need ${coinCost.toLocaleString()} Coins (current balance: ${currentBalance.toLocaleString()}). Opening Coin Shop to exchange Hasanat...`);
      setIsCoinShopOpen(true);
      return;
    }

    const ok = coinCost === 0 ? true : deductStoredCoins(coinCost, activeUser);
    if (ok) {
      const updatedBalance = getStoredCoins();
      setUserCoins(updatedBalance);
      
      // Credit seller if seller exists and is another user
      if (product.sellerId && product.sellerId !== activeUser?.uid && !product.sellerId.startsWith('mock_')) {
        try {
          const sellerRef = doc(db, 'users', product.sellerId);
          updateDoc(sellerRef, { coins: increment(coinCost) }).catch(err => console.warn("Seller coin credit:", err));
        } catch (err) {
          // ignore
        }
      }

      // Unlock card and download
      const updated = { ...unlockedDownloads, [product.id]: true };
      setUnlockedDownloads(updated);
      localStorage.setItem('sanctuary_unlocked_downloads', JSON.stringify(updated));

      if (product.isDigital) {
        setPurchaseSuccessToast(`🎉 Card Unlocked! Deducted ${coinCost.toLocaleString()} Noor Coins (New Balance: ${updatedBalance.toLocaleString()}). "${product.downloadFileName || product.title}" is now unlocked for instant download!`);
      } else {
        setPurchaseSuccessToast(`🎉 Card Unlocked! Deducted ${coinCost.toLocaleString()} Noor Coins (New Balance: ${updatedBalance.toLocaleString()}) for "${product.title}". You now have full access to this card & seller priority!`);
      }

      // Also auto-trigger file download if digital
      if (product.isDigital && product.downloadUrl) {
        setTimeout(() => {
          try {
            const link = document.createElement('a');
            link.href = product.downloadUrl!;
            link.download = product.downloadFileName || `${product.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${(product.downloadFormat || 'pdf').toLowerCase()}`;
            link.target = '_blank';
            link.rel = 'noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (e) {
            console.warn("Direct download trigger:", e);
          }
        }, 600);
      }

      setTimeout(() => setPurchaseSuccessToast(null), 6000);
    }
  };

  // Handle direct file download trigger
  const handleTriggerDownload = (product: Listing, e?: React.MouseEvent) => {
    e?.stopPropagation();

    // Check if free or owner or unlocked
    const isOwner = product.sellerId === activeUser?.uid;
    const isFree = (product.price === 0 && (product.coinPrice === 0 || !product.coinPrice));
    const isUnlocked = unlockedDownloads[product.id] || isOwner || isFree;

    if (!isUnlocked) {
      handleBuyWithCoins(product, e);
      return;
    }

    // Trigger file download
    const targetUrl = product.downloadUrl || 'https://archive.org/download/Quran-Tajweed-604-Pages/Tajweed-Quran.pdf';
    const fileName = product.downloadFileName || `${product.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${(product.downloadFormat || 'pdf').toLowerCase()}`;

    // Create anchor link and trigger download
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Increase download counter locally
    setPurchaseSuccessToast(`📥 Downloading "${fileName}" (${product.downloadFormat || 'Digital Resource'}). Alhamdulillah!`);
    setTimeout(() => setPurchaseSuccessToast(null), 5000);
  };

  // Reset indices and tabs when product changes
  useEffect(() => {
    setActionImageIndex(0);
    setActiveDetailTab('details');
  }, [activeProduct?.id]);

  const categories = ['All', 'Worship', 'Books', 'Fragrance', 'Decor', 'Clothing', 'Instruments', 'Other'];

  // Handle upload for any slot index (0 = main cover, 1 = image 2, etc.)
  const handleImageUploadForSlot = (e: React.ChangeEvent<HTMLInputElement>, slotIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
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

  useEffect(() => {
    // Load local storage first or merge with STARTER_MARKET_LISTINGS
    const localKey = 'sanctuary_local_market_listings';
    const deletedKey = 'sanctuary_deleted_market_ids';
    
    // Get deleted IDs
    let deletedIds = new Set<string>();
    try {
      const storedDeleted = localStorage.getItem(deletedKey);
      if (storedDeleted) {
        const parsedDeleted = JSON.parse(storedDeleted);
        if (Array.isArray(parsedDeleted)) {
          deletedIds = new Set(parsedDeleted);
        }
      }
    } catch (e) {}

    const stored = localStorage.getItem(localKey);
    let initialListings: Listing[] = (STARTER_MARKET_LISTINGS as Listing[]).filter(s => !deletedIds.has(s.id));
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge user-created local items on top of starter listings
          const starterIds = new Set(STARTER_MARKET_LISTINGS.map(s => s.id));
          const customLocal = parsed.filter((p: Listing) => !starterIds.has(p.id) && !deletedIds.has(p.id));
          initialListings = [...customLocal, ...(STARTER_MARKET_LISTINGS as Listing[]).filter(s => !deletedIds.has(s.id))];
        }
      } catch (e) {}
    } else {
      localStorage.setItem(localKey, JSON.stringify(initialListings));
    }

    setListings(initialListings);
    if (productId) {
      const found = initialListings.find(p => p.id === productId);
      if (found) setActiveProduct(found);
    }

    if (!activeUser || activeUser.uid?.startsWith('local_') || activeUser.uid?.startsWith('rest_')) {
      return;
    }

    const q = query(collection(db, 'listings'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Reload deleted IDs
      let currentDeleted = new Set<string>();
      try {
        const storedDel = localStorage.getItem(deletedKey);
        if (storedDel) currentDeleted = new Set(JSON.parse(storedDel));
      } catch (e) {}

      if (!snapshot.empty) {
        const docs = snapshot.docs
          .map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
          .filter((d: any) => !currentDeleted.has(d.id)) as Listing[];
        
        // Sort by newest first
        docs.sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        // Merge starter items if not present and not deleted
        const firestoreIds = new Set(docs.map(d => d.id));
        const merged = [
          ...docs,
          ...(STARTER_MARKET_LISTINGS as Listing[]).filter(s => !firestoreIds.has(s.id) && !currentDeleted.has(s.id))
        ];
        setListings(merged);
        localStorage.setItem(localKey, JSON.stringify(merged));
        if (productId) {
          const found = merged.find(p => p.id === productId);
          if (found) setActiveProduct(found);
        }
      }
    }, (error) => {
      // Non-fatal fallback
      console.warn("Using local marketplace listings fallback:", error);
    });

    return () => unsubscribe();
  }, [productId, activeUser]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    
    const allImages = [newListing.imageUrl, ...newListing.images].filter(url => url && url.trim() !== '');
    
    // Digital items only require 1 preview image; physical items require 2 images
    if (!newListing.isDigital && allImages.length < 2) {
      alert("⚠️ Listing Standard: To protect buyers and ensure authenticity (Amazon & Suq Al-Mubaraki guidelines), you are required to provide at least 2 different pictures of physical products. Please upload or paste at least 1 more image.");
      return;
    } else if (newListing.isDigital && allImages.length < 1) {
      alert("Please provide at least 1 cover/preview image for your downloadable digital resource.");
      return;
    }

    const numericPrice = parseFloat(newListing.price) || 0;
    const numericCoins = parseInt(newListing.coinPrice, 10) || Math.round(numericPrice * 100);

    if (newListing.pricingMode === 'cash' && numericPrice < 0) {
      alert("Please enter a valid USD Cash Price for this item.");
      return;
    }
    if (newListing.pricingMode === 'coins' && numericCoins < 0) {
      alert("Please enter a valid Noor Coin Price for this item.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        title: newListing.title.trim(),
        description: newListing.description.trim(),
        brand: newListing.brand.trim() || (newListing.isDigital ? 'Digital Sanctuary' : 'Generic/Unbranded'),
        price: numericPrice,
        coinPrice: numericCoins,
        pricingMode: newListing.pricingMode,
        category: newListing.category,
        imageUrl: allImages[0] || '',
        images: allImages,
        videoUrl: newListing.videoUrl?.trim() || '',
        contactInfo: newListing.contactInfo?.trim() || '',
        whatsappNumber: newListing.whatsappNumber?.trim() || '',
        cityLocation: newListing.cityLocation?.trim() || (newListing.isDigital ? 'Instant Digital Download' : 'Sanctuary Global Ummah'),
        isNegotiable: newListing.isNegotiable,
        condition: newListing.condition,
        specifications: newListing.specifications?.trim() || (newListing.isDigital ? `${newListing.downloadFormat} Format • Instant Download` : ''),
        shippingEstimate: newListing.isDigital ? 'Instant Digital Download (0s)' : (newListing.shippingEstimate || 'Standard Shipping (3-5 business days)'),
        features: newListing.features.filter(f => f && f.trim() !== ''),
        isDigital: newListing.isDigital,
        downloadUrl: newListing.downloadUrl.trim(),
        downloadFormat: newListing.downloadFormat,
        downloadFileName: newListing.downloadFileName.trim() || `${newListing.title.replace(/[^a-z0-9]/gi, '_')}.${newListing.downloadFormat.toLowerCase()}`,
        downloadSize: newListing.downloadSize.trim() || 'Direct Download',
        downloadCount: 0,
        sellerId: activeUser.uid,
        sellerName: activeUser.displayName || 'Anonymous Merchant',
        sellerPhoto: activeUser.photoURL || '',
        status: 'active',
        createdAt: serverTimestamp(),
        rating: 5.0,
        reviews: []
      };

      if (!activeUser.uid?.startsWith('local_') && !activeUser.uid?.startsWith('rest_')) {
        await addDoc(collection(db, 'listings'), payload);
      }
      
      // Save locally as well for instant UI response
      const localKey = 'sanctuary_local_market_listings';
      const stored = localStorage.getItem(localKey);
      const list = stored ? JSON.parse(stored) : [];
      const newLocalItem = {
        ...payload,
        id: 'item_' + Date.now(),
        createdAt: new Date().toISOString()
      };
      const updated = [newLocalItem, ...list];
      localStorage.setItem(localKey, JSON.stringify(updated));
      setListings(updated);

      setShowCreateModal(false);
      setImagePreview(null);
      setNewListing({ 
        title: '', 
        description: '', 
        brand: '',
        pricingMode: 'both',
        price: '', 
        coinPrice: '',
        category: 'Worship', 
        imageUrl: '', 
        images: ['', '', ''], 
        videoUrl: '', 
        contactInfo: '',
        whatsappNumber: '',
        cityLocation: '',
        isNegotiable: true,
        condition: 'New',
        specifications: '',
        shippingEstimate: 'Standard Shipping (3-5 business days)',
        features: ['', '', ''],
        isDigital: false,
        downloadUrl: '',
        downloadFormat: 'PDF',
        downloadFileName: '',
        downloadSize: ''
      });
      setPurchaseSuccessToast(newListing.isDigital ? '📥 Alhamdulillah! Your downloadable digital resource is now live in the marketplace.' : '✨ Alhamdulillah! Your listing has been published to Suq Al-Mubaraki.');
      setTimeout(() => setPurchaseSuccessToast(null), 4500);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'listings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessageSeller = async (listing: Listing) => {
    if (!activeUser || activeUser.uid === listing.sellerId) return;

    try {
      if (!activeUser.uid?.startsWith('local_') && !activeUser.uid?.startsWith('rest_')) {
        const roomsRef = collection(db, 'rooms');
        const q = query(
          roomsRef, 
          where('type', '==', 'private'),
          where('participants', 'array-contains', activeUser.uid)
        );
        
        const snapshot = await getDocs(q);
        const existingRoom = snapshot.docs.find(docSnap => {
          const data = docSnap.data();
          return data.participants?.includes(listing.sellerId);
        });

        if (!existingRoom) {
          await addDoc(roomsRef, {
            name: `${activeUser.displayName || 'Buyer'} & ${listing.sellerName}`,
            type: 'business',
            isBusiness: true,
            participants: [activeUser.uid, listing.sellerId],
            participantNames: {
              [activeUser.uid]: activeUser.displayName || 'Buyer',
              [listing.sellerId]: listing.sellerName
            },
            lastMessage: `Trade inquiry: "${listing.title}"`,
            updatedAt: serverTimestamp()
          });
        }
      }
      navigate('/chat');
    } catch (error) {
      console.error("Error starting chat:", error);
      navigate('/chat');
    }
  };

  const handleDeleteListing = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const itemToDelete = listings.find(p => p.id === id) || activeProduct;
    const itemTitle = itemToDelete?.title || 'Market Item';
    const isOwner = itemToDelete?.sellerId === activeUser?.uid;

    if (!confirm(`Are you certain you want to permanently remove "${itemTitle}" from Suq Al-Mubaraki?`)) return;
    
    try {
      // 1. Mark as permanently deleted so it NEVER respawns
      const deletedKey = 'sanctuary_deleted_market_ids';
      try {
        const storedDeleted = localStorage.getItem(deletedKey);
        const parsed = storedDeleted ? JSON.parse(storedDeleted) : [];
        if (!parsed.includes(id)) {
          parsed.push(id);
          localStorage.setItem(deletedKey, JSON.stringify(parsed));
        }
      } catch (e) {}

      // 2. Remove from active state & local storage
      setListings(prev => prev.filter(p => p.id !== id));
      if (activeProduct?.id === id) {
        setActiveProduct(null);
        navigate('/market');
      }

      const localKey = 'sanctuary_local_market_listings';
      const stored = localStorage.getItem(localKey);
      if (stored) {
        const parsed = JSON.parse(stored).filter((p: any) => p.id !== id);
        localStorage.setItem(localKey, JSON.stringify(parsed));
      }

      // 3. Delete from Firestore collection
      try {
        await deleteDoc(doc(db, 'listings', id));
      } catch (e) {
        console.warn("Firestore listing delete fallback:", e);
      }

      // 4. Log administrative / seller action to Firestore activity_logs
      await ActivityLoggerService.logProductDeletion({
        id,
        title: itemTitle,
        sellerName: itemToDelete?.sellerName
      }, isAdmin ? (currentUser?.displayName || 'Admin') : (currentUser?.displayName || 'Seller'));
      
      setPurchaseSuccessToast('🗑️ Listing permanently deleted from Suq Al-Mubaraki.');
      setTimeout(() => setPurchaseSuccessToast(null), 3500);
    } catch (error) {
      console.warn("Error deleting listing:", error);
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser || !activeProduct) return;
    if (!reviewComment.trim()) {
      alert("Please enter a review comment!");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newReview = {
        id: Math.random().toString(36).substring(2, 11),
        reviewerName: activeUser.displayName || 'Verified Buyer',
        reviewerPhoto: activeUser.photoURL || '',
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: new Date().toISOString()
      };

      const originalReviews = activeProduct.reviews || [];
      const updatedReviews = [newReview, ...originalReviews];
      const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

      const updatedProduct = {
        ...activeProduct,
        reviews: updatedReviews,
        rating: avgRating
      };
      setActiveProduct(updatedProduct);
      setReviewComment('');
      setReviewRating(5);

      if (!activeUser.uid?.startsWith('local_') && !activeUser.uid?.startsWith('rest_')) {
        await updateDoc(doc(db, 'listings', activeProduct.id), {
          reviews: updatedReviews,
          rating: avgRating
        });
      }
    } catch (error) {
      console.error("Error posting review: ", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredProducts = listings.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
                         p.title?.toLowerCase().includes(q) || 
                         p.description?.toLowerCase().includes(q) ||
                         p.category?.toLowerCase().includes(q) ||
                         p.cityLocation?.toLowerCase().includes(q) ||
                         p.brand?.toLowerCase().includes(q) ||
                         (p.downloadFormat && p.downloadFormat.toLowerCase().includes(q));
    
    let matchesTab = true;
    if (activeTab === 'my') {
      matchesTab = p.sellerId === activeUser?.uid;
    } else if (activeTab === 'digital') {
      matchesTab = !!p.isDigital;
    }

    return matchesCategory && matchesSearch && matchesTab;
  });

  // Render Product Detail Mode
  if (detailMode && activeProduct) {
    const allProductPhotos = [activeProduct.imageUrl, ...(activeProduct.images || [])].filter(url => url && url.trim() !== '');
    const currentMainPhoto = allProductPhotos[actionImageIndex] || activeProduct.imageUrl || '';
    const productReviews = activeProduct.reviews || [];
    const isOwner = activeProduct.sellerId === activeUser?.uid;
    const isFree = (activeProduct.price === 0 && (activeProduct.coinPrice === 0 || !activeProduct.coinPrice));
    const isUnlocked = unlockedDownloads[activeProduct.id] || isOwner || isFree;
    
    const bulletHighlights = (activeProduct.features && activeProduct.features.length > 0)
      ? activeProduct.features
      : [
          activeProduct.isDigital 
            ? `Instant digital delivery: Verified authentic ${activeProduct.downloadFormat || 'PDF'} format.`
            : `Premium spiritual craft, designed to elevate worship and tranquility.`,
          `High-fidelity condition check: Verified ${activeProduct.condition || 'New'} halal item.`,
          `Community Trust: WhatsApp Direct & Noor Coin escrow guarantee.`
        ];

    const waUrl = getWhatsAppUrl(
      activeProduct.whatsappNumber || activeProduct.contactInfo,
      activeProduct.title,
      activeProduct.price,
      activeProduct.coinPrice,
      activeProduct.pricingMode
    );

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        className="space-y-8 pb-32"
      >
        {/* Top Detail Navigation with Back Button */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/market')}
              className="w-11 h-11 bg-white/5 hover:bg-white/15 border border-white/10 rounded-2xl flex items-center justify-center text-amber-400 hover:text-white transition-all cursor-pointer group"
              title="Return to Marketplace"
            >
              <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Suq Al-Mubaraki</span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-medium">{activeProduct.category}</span>
                {activeProduct.isDigital && (
                  <>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[9px] font-black uppercase tracking-wider border border-cyan-500/30 flex items-center gap-1">
                      <Download size={10} /> Digital Download ({activeProduct.downloadFormat || 'PDF'})
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{activeProduct.title}</h2>
            </div>
          </div>

          {/* Quick Action: Edit & Delete if Owner/Admin, or Coin Shop */}
          <div className="flex items-center gap-2.5">
            {(isOwner || isAdmin) && (
              <>
                <button
                  onClick={(e) => handleOpenEditListing(activeProduct, e)}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  title="Edit product details in Firestore"
                >
                  <Edit3 size={14} />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                <button
                  onClick={(e) => handleDeleteListing(activeProduct.id, e)}
                  className="px-3.5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-red-500/10"
                  title="Permanently remove item from Firestore"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">{isAdmin && !isOwner ? 'Admin Delete' : 'Delete Listing'}</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsCoinShopOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <Coins size={14} />
              <span className="font-mono">{userCoins.toLocaleString()} Coins</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Multimedia Gallery Section (Left Panel) - lg:col-span-6 */}
          <div className="lg:col-span-6 space-y-6">
            <div 
              onClick={() => openProductGalleryLightbox(activeProduct, actionImageIndex)}
              className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-brand-depth/40 group cursor-pointer"
              title="Click to expand full high-res photo gallery"
            >
              {currentMainPhoto ? (
                <img src={currentMainPhoto} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-700">
                  <Package size={80} className="mb-4 opacity-20" />
                  <span className="text-xs font-black uppercase tracking-widest">No pictures available</span>
                </div>
              )}

              {/* Hover Expansion Notice Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold backdrop-blur-[2px] pointer-events-none">
                <ZoomIn size={18} className="text-amber-400" />
                <span>Tap to Expand & Zoom Photos</span>
              </div>

              {/* Pricing Mode Badge */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                {activeProduct.isDigital && (
                  <span className="px-3 py-1 rounded-xl bg-cyan-500/90 text-black text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Download size={12} /> Instant Download
                  </span>
                )}

                {isFree ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/90 text-black text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                    🎁 Free Resource
                  </span>
                ) : activeProduct.pricingMode === 'coins' ? (
                  <span className="px-3 py-1 rounded-xl bg-amber-500/90 text-black text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Coins size={12} /> Noor Coins Only
                  </span>
                ) : activeProduct.pricingMode === 'cash' ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/90 text-black text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <DollarSign size={12} /> Real Cash Only
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                    🪙 Coins + 💵 Cash
                  </span>
                )}

                {activeProduct.isNegotiable && (
                  <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-amber-300 text-[9px] font-black uppercase tracking-wider border border-amber-500/30">
                    🤝 Negotiable
                  </span>
                )}
              </div>

              {/* Image Counter Badge */}
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-xl px-3.5 py-1.5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-300">
                 Photo {actionImageIndex + 1} of {allProductPhotos.length}
              </div>
            </div>

            {/* Gallery Thumbnail Swapping Controls */}
            {allProductPhotos.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {allProductPhotos.map((url, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActionImageIndex(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border transition-all cursor-pointer ${actionImageIndex === i ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 bg-amber-500/10' : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {activeProduct.videoUrl && (
                  <a href={activeProduct.videoUrl} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-2xl bg-amber-500/10 flex flex-col items-center justify-center text-amber-400 border border-amber-500/30 hover:bg-amber-400 hover:text-black transition-all group">
                     <Video size={20} className="group-hover:scale-110 transition-transform" />
                     <span className="text-[8px] font-black mt-1 uppercase">Watch Video</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Details & Shopping Sidebar (Right Panel) - lg:col-span-6 */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">{activeProduct.category}</span>
                {activeProduct.isDigital && (
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] font-black uppercase tracking-widest border border-cyan-500/20 flex items-center gap-1">
                    <Download size={10} /> Format: {activeProduct.downloadFormat || 'PDF'}
                  </span>
                )}
                {activeProduct.brand && (
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[9px] font-black uppercase tracking-widest border border-white/5">Brand: {activeProduct.brand}</span>
                )}
                {activeProduct.cityLocation && (
                  <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300 text-[9px] font-bold tracking-wider border border-white/10 flex items-center gap-1">
                    <MapPin size={10} className="text-amber-400" /> {activeProduct.cityLocation}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Verified Halal</span>
              </div>
              
              <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">{activeProduct.title}</h1>
              
              <div className="flex items-center gap-3">
                <StarRating rating={activeProduct.rating || 5.0} />
                <span className="text-xs text-slate-500 font-bold">| {productReviews.length} Community Reviews</span>
                {activeProduct.downloadCount !== undefined && activeProduct.downloadCount > 0 && (
                  <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
                    <Download size={12} /> {activeProduct.downloadCount} Downloads
                  </span>
                )}
              </div>
            </div>

            {/* Price Box Panel */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {isFree ? 'Free Community Resource' : activeProduct.pricingMode === 'coins' ? 'Noor Coins Price' : activeProduct.pricingMode === 'cash' ? 'Real Cash Price' : 'Accepted Payments'}
                  </p>
                  
                  <div className="flex flex-wrap items-baseline gap-3">
                    {isFree ? (
                      <span className="text-3xl md:text-4xl font-black text-emerald-400 font-mono">
                        $0.00 <span className="text-xs text-emerald-300 uppercase tracking-widest font-sans ml-2">100% Free / Waqf</span>
                      </span>
                    ) : (
                      <>
                        {activeProduct.pricingMode !== 'coins' && (
                          <span className="text-3xl md:text-4xl font-black text-emerald-400 font-mono">
                            ${activeProduct.price.toFixed(2)} <span className="text-xs text-slate-400">USD</span>
                          </span>
                        )}

                        {activeProduct.pricingMode !== 'cash' && (
                          <span className="text-2xl md:text-3xl font-black text-amber-400 font-mono flex items-center gap-1.5">
                            <Coins size={22} className="text-amber-400" />
                            {(activeProduct.coinPrice || Math.round(activeProduct.price * 100)).toLocaleString()} <span className="text-xs text-amber-300/80">Coins</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCoinShopOpen(true)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer flex items-center gap-1"
                  >
                    <Coins size={13} />
                    <span>Get Coins ({userCoins.toLocaleString()})</span>
                  </button>
                </div>
              </div>

              {/* Delivery & Assurance */}
              <div className="space-y-2 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  {activeProduct.isDigital ? (
                    <>
                      <Download size={14} className="text-cyan-400 shrink-0" />
                      <p>Delivery: <span className="text-cyan-400 font-bold">Instant 1-Click Digital Download ({activeProduct.downloadSize || 'Direct File'})</span></p>
                    </>
                  ) : (
                    <>
                      <Truck size={14} className="text-amber-400 shrink-0" />
                      <p>Delivery: <span className="text-white font-bold">{activeProduct.shippingEstimate || 'Standard Shipping (3-5 business days)'}</span></p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <p>Guaranteed: <span className="text-emerald-400 font-bold">Suq Al-Mubaraki Halal Trade Shield</span></p>
                </div>
              </div>

              {/* Action Buttons: Digital Instant Download, WhatsApp & Noor Coins & In-App Chat */}
              <div className="space-y-3 pt-2">
                
                {/* 📥 INSTANT DOWNLOAD BUTTON (If Digital Item) */}
                {activeProduct.isDigital && (
                  <button
                    onClick={(e) => handleTriggerDownload(activeProduct, e)}
                    className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-cyan-500/25 ring-2 ring-cyan-400/50'
                        : 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-amber-500/20'
                    }`}
                  >
                    <Download size={20} className="animate-bounce" />
                    <span>
                      {isUnlocked
                        ? `Download File Now (${activeProduct.downloadFormat || 'PDF'} • ${activeProduct.downloadSize || 'Direct'})`
                        : `Unlock & Download with ${(activeProduct.coinPrice || 0).toLocaleString()} Coins`}
                    </span>
                  </button>
                )}

                {!isOwner ? (
                  <>
                    {/* WhatsApp 1-Tap Contact Button */}
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-13 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                      >
                        <Phone size={18} />
                        <span>Chat & Order on WhatsApp</span>
                        <ExternalLink size={14} />
                      </a>
                    )}

                    {/* Instant Buy with Noor Coins (if physical item or locked digital) */}
                    {(!activeProduct.isDigital || !isUnlocked) && !isFree && activeProduct.pricingMode !== 'cash' && (
                      <button 
                        onClick={() => handleBuyWithCoins(activeProduct)}
                        className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black h-13 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                      >
                        <Coins size={18} />
                        <span>Instant Buy with {(activeProduct.coinPrice || Math.round(activeProduct.price * 100)).toLocaleString()} Noor Coins</span>
                      </button>
                    )}

                    {/* In-App Sanctuary Chat */}
                    <button 
                      onClick={() => handleMessageSeller(activeProduct)}
                      className="w-full bg-white/10 hover:bg-white/20 text-white h-12 rounded-2xl font-bold text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                    >
                      <MessageCircle size={16} className="text-amber-400" />
                      <span>Send Direct Message to Seller</span>
                    </button>

                    {/* Quick Action Grid: Share & Report */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={(e) => handleShareListing(activeProduct, e)}
                        className="w-full py-3 px-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                        title="Share this product across platforms"
                      >
                        <Share2 size={14} />
                        <span>Share Item</span>
                      </button>

                      <button
                        onClick={(e) => handleOpenFlagModal(activeProduct, e)}
                        className="w-full py-3 px-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                        title="Flag or report this product"
                      >
                        <Flag size={14} />
                        <span>Report / Flag</span>
                      </button>
                    </div>

                    {/* Admin Moderation Action for non-owner Admins (Delete only flagged items) */}
                    {isAdmin && (
                      activeProduct.isFlagged ? (
                        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-center justify-between gap-3 shadow-lg shadow-rose-950/30">
                          <div className="flex items-center gap-2 text-rose-300 text-xs">
                            <AlertTriangle size={15} className="shrink-0 text-rose-400" />
                            <div>
                              <p className="font-bold text-white">Item Flagged for Review</p>
                              <p className="text-[10px] text-rose-300/80 line-clamp-1">{activeProduct.flagReason || 'Reported by community'}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteListing(activeProduct.id, e)}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-600/30 shrink-0"
                          >
                            <Trash2 size={13} />
                            <span>Delete Flagged</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-amber-300 text-xs">
                            <Shield size={15} className="shrink-0 text-amber-400" />
                            <div>
                              <p className="font-bold text-white">Admin Policy</p>
                              <p className="text-[10px] text-slate-400">Only flagged items can be deleted</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleOpenFlagModal(activeProduct, e)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0"
                            title="Flag this item to enable admin deletion"
                          >
                            <Flag size={12} />
                            <span>Flag to Audit</span>
                          </button>
                        </div>
                      )
                    )}
                  </>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                    <p className="text-xs font-black text-amber-300 uppercase tracking-widest">Your Active Listing</p>
                    <p className="text-[11px] text-slate-400">Buyers can download your digital resources, contact via WhatsApp, or pay using Noor coins.</p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        onClick={(e) => handleShareListing(activeProduct, e)}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Share2 size={13} />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteListing(activeProduct.id, e)}
                        className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <Trash2 size={13} />
                        <span>Delete Listing</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Spec Tabs Section */}
            <div className="space-y-4">
              <div className="flex border-b border-white/10">
                {(['details', 'specs', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveDetailTab(tab)}
                    className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      activeDetailTab === tab 
                        ? 'border-amber-400 text-amber-400 bg-amber-400/5' 
                        : 'border-transparent text-slate-500 hover:text-white'
                    }`}
                  >
                    {tab === 'details' ? 'About Item' : tab === 'specs' ? 'Specifications' : `Reviews (${productReviews.length})`}
                  </button>
                ))}
              </div>

              <div className="min-h-32 text-xs">
                {activeDetailTab === 'details' && (
                  <div className="space-y-4">
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">
                      {activeProduct.description}
                    </p>
                    
                    <div className="space-y-2 pt-3 border-t border-white/5">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Highlights:</h4>
                      <ul className="space-y-2">
                        {bulletHighlights.map((hl, index) => (
                          <li key={index} className="flex gap-2.5 text-xs text-slate-300">
                            <Sparkles size={13} className="text-amber-400 shrink-0 mt-0.5" />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'specs' && (
                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40">
                    <table className="w-full text-left text-xs text-slate-400">
                      <tbody>
                        <tr className="border-b border-white/5">
                          <td className="px-5 py-3 font-black text-slate-400 uppercase tracking-wider w-1/3 border-r border-white/5 bg-white/5">Type</td>
                          <td className="px-5 py-3 text-white font-bold">
                            {activeProduct.isDigital ? `Digital Downloadable Resource (${activeProduct.downloadFormat || 'PDF'})` : 'Physical Product'}
                          </td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="px-5 py-3 font-black text-slate-400 uppercase tracking-wider border-r border-white/5 bg-white/5">Brand / Publisher</td>
                          <td className="px-5 py-3 text-white font-bold">{activeProduct.brand || 'Generic/Unbranded'}</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="px-5 py-3 font-black text-slate-400 uppercase tracking-wider border-r border-white/5 bg-white/5">Condition</td>
                          <td className="px-5 py-3 text-white font-bold">{activeProduct.condition || 'New'}</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="px-5 py-3 font-black text-slate-400 uppercase tracking-wider border-r border-white/5 bg-white/5">Accepted Payment</td>
                          <td className="px-5 py-3 text-amber-400 font-bold uppercase">
                            {isFree ? '100% Free Resource' : activeProduct.pricingMode === 'coins' ? 'Noor Coins Only' : activeProduct.pricingMode === 'cash' ? 'USD Cash Only' : 'Both Coins & Cash'}
                          </td>
                        </tr>
                        {activeProduct.whatsappNumber && (
                          <tr className="border-b border-white/5">
                            <td className="px-5 py-3 font-black text-slate-400 uppercase tracking-wider border-r border-white/5 bg-white/5">WhatsApp</td>
                            <td className="px-5 py-3 text-emerald-400 font-mono font-bold">{activeProduct.whatsappNumber}</td>
                          </tr>
                        )}
                        <tr className="border-b border-white/5">
                          <td className="px-5 py-3 font-black text-slate-400 uppercase tracking-wider border-r border-white/5 bg-white/5">Delivery Timeline</td>
                          <td className="px-5 py-3 text-white font-bold">{activeProduct.shippingEstimate || 'Instant Digital Download'}</td>
                        </tr>
                        <tr>
                          <td className="px-5 py-3 font-black text-slate-400 uppercase tracking-wider border-r border-white/5 bg-white/5">Specifications</td>
                          <td className="px-5 py-3 text-white font-medium">{activeProduct.specifications || 'Standard spiritual essentials'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeDetailTab === 'reviews' && (
                  <div className="space-y-5">
                    {/* Review Form */}
                    <form onSubmit={handlePostReview} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-amber-400" />
                          Rate this item:
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewRating(s)}
                              className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                size={16}
                                className={s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <input
                        required
                        type="text"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Write a community review (e.g. 'MashaAllah, excellent quality and fast delivery!')..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-amber-400/40 outline-none placeholder-slate-600"
                      />

                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-4 py-2 bg-amber-400 text-black rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-amber-300 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingReview ? 'Posting...' : 'Post Review'}
                      </button>
                    </form>

                    {/* Customer Review List */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                      {productReviews.length > 0 ? (
                        productReviews.map((rev) => (
                          <div key={rev.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black text-white">{rev.reviewerName}</p>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star 
                                    key={s} 
                                    size={10} 
                                    className={s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{rev.comment}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-xs text-slate-500 py-6 uppercase tracking-widest font-bold">
                          No reviews yet. Be the first to share your experience!
                        </p>
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

  // Main Marketplace Feed View
  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight italic">Suq Al-Mubaraki</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
              Halal Trade Hub
            </span>
          </div>
          <p className="text-slate-400 font-medium text-xs md:text-sm mt-1">
            Community marketplace for prayer essentials, downloadable digital Islamic resources, books, and Halal trade.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Hasanat Exchange / Noor Coin Shop Button */}
          <button
            onClick={() => setIsCoinShopOpen(true)}
            className="h-12 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Noor Coin Shop & Hasanat Exchange"
          >
            <Coins size={16} />
            <span>Noor Coin Shop</span>
            <span className="px-2 py-0.5 rounded-lg bg-black/25 text-black font-mono text-[11px] font-black">
              {userCoins.toLocaleString()}
            </span>
          </button>

          {/* Create Listing Button */}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-black h-12 px-5 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-400/20 cursor-pointer"
          >
            <Plus size={18} />
            <span>Post Listing</span>
          </button>
        </div>
      </div>

      {/* Quick Hasanat -> Coins Conversion Ribbon */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/60 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <Flame size={16} className="text-emerald-400 shrink-0" />
          <span>
            Have Hasanat from reading Quran? You have <strong className="text-emerald-400 font-mono">{currentHasanat.toLocaleString()} Hasanat</strong> ready to exchange!
          </span>
        </div>
        <button
          onClick={() => setIsCoinShopOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
        >
          <Sparkles size={13} />
          <span>Convert Hasanat to Coins</span>
        </button>
      </div>

      {/* Prominent Search Bar & Category Filter */}
      <div className="p-4 md:p-6 rounded-[2rem] bg-brand-sidebar/40 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, downloadable PDFs, Tajweed mushaf, fragrance, city, brand..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-20 text-sm text-white focus:border-amber-400/60 outline-none backdrop-blur-md transition-all placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                title="Clear Search"
              >
                <X size={15} />
              </button>
            )}
            <button 
              onClick={toggleListening}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all cursor-pointer ${isListening ? 'text-amber-400 bg-amber-400/20 animate-pulse' : 'text-slate-400 hover:text-white'}`}
              title="Voice Search"
            >
              <Mic size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/10 w-full sm:w-auto justify-center">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'all' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                All Items
              </button>
              <button 
                onClick={() => setActiveTab('digital')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'digital' ? 'bg-cyan-400 text-black shadow-md' : 'text-slate-400 hover:text-cyan-300'}`}
              >
                <Download size={13} />
                <span>Downloadable</span>
              </button>
              <button 
                onClick={() => setActiveTab('my')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'my' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                My Listings
              </button>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === cat 
                ? 'bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-400/20 scale-105 font-black' 
                : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/15 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Displaying <strong className="text-white font-mono">{filteredProducts.length}</strong> items in Suq Al-Mubaraki</span>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-amber-400 hover:underline text-[11px] font-bold cursor-pointer"
            >
              Clear filter "{searchQuery}"
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const isOwner = p.sellerId === activeUser?.uid;
            const isFree = (p.price === 0 && (p.coinPrice === 0 || !p.coinPrice));
            const isUnlocked = unlockedDownloads[p.id] || isOwner || isFree;
            const waUrl = getWhatsAppUrl(
              p.whatsappNumber || p.contactInfo,
              p.title,
              p.price,
              p.coinPrice,
              p.pricingMode
            );

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                className="group glass-panel rounded-[2rem] border-white/10 overflow-hidden flex flex-col h-full bg-slate-900/60 cursor-pointer shadow-xl relative"
                onClick={() => navigate(`/market/${p.id}`)}
              >
                {/* Image Cover */}
                <div className="relative aspect-[4/3] overflow-hidden bg-black/50">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700">
                      <Package size={40} className="mb-2 opacity-20" />
                    </div>
                  )}

                  {/* Quick Expand Button on hover */}
                  {p.imageUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductGalleryLightbox(p, 0);
                      }}
                      className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-black/70 hover:bg-black text-white opacity-0 group-hover:opacity-100 transition-all border border-white/20 hover:scale-110 shadow-lg cursor-pointer"
                      title="Quick Expand Photo"
                    >
                      <ZoomIn size={14} className="text-amber-300" />
                    </button>
                  )}

                  {/* Digital Item Badge Top Left */}
                  {p.isDigital && (
                    <div className="absolute top-3.5 left-3.5 bg-cyan-500/90 text-black px-2.5 py-1 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Download size={11} /> {p.downloadFormat || 'PDF'}
                    </div>
                  )}

                  {/* Pricing Badge Top Left (offset if digital) */}
                  <div className={`absolute ${p.isDigital ? 'bottom-3.5 left-3.5' : 'top-3.5 left-3.5'} bg-black/85 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-white/10 flex items-center gap-2 shadow-lg`}>
                    {isFree ? (
                      <span className="text-xs font-black text-emerald-400 font-mono">
                        Free Resource
                      </span>
                    ) : p.pricingMode === 'coins' ? (
                      <span className="text-xs font-black text-amber-400 font-mono flex items-center gap-1">
                        <Coins size={13} />
                        {(p.coinPrice || 100).toLocaleString()} Coins
                      </span>
                    ) : p.pricingMode === 'cash' ? (
                      <span className="text-xs font-black text-emerald-400 font-mono">
                        ${p.price.toFixed(2)}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="font-black text-emerald-400">${p.price}</span>
                        <span className="text-slate-500 text-[10px]">/</span>
                        <span className="font-bold text-amber-400 flex items-center gap-0.5">
                          <Coins size={11} />
                          {(p.coinPrice || Math.round(p.price * 100)).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Top Right Action Tags */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Share Button */}
                    <button 
                      type="button"
                      onClick={(e) => handleShareListing(p, e)}
                      className="w-8 h-8 bg-black/70 backdrop-blur-xl hover:bg-amber-400 hover:text-black text-white rounded-xl flex items-center justify-center transition-all shadow-lg cursor-pointer border border-white/10"
                      title="Share this listing"
                    >
                      <Share2 size={13} />
                    </button>

                    {/* Flag / Report Button */}
                    <button 
                      type="button"
                      onClick={(e) => handleOpenFlagModal(p, e)}
                      className={`w-8 h-8 backdrop-blur-xl rounded-xl flex items-center justify-center transition-all shadow-lg cursor-pointer border ${
                        p.isFlagged 
                          ? 'bg-rose-600 text-white border-rose-400' 
                          : 'bg-black/70 hover:bg-rose-500 hover:text-white text-slate-300 border-white/10'
                      }`}
                      title={p.isFlagged ? `Flagged: ${p.flagReason || 'Under Review'}` : 'Flag or report item'}
                    >
                      <Flag size={13} />
                    </button>

                    {/* Edit & Delete listing buttons for Owner or Admin */}
                    {(isOwner || isAdmin) && (
                      <>
                        <button 
                          type="button"
                          onClick={(e) => handleOpenEditListing(p, e)}
                          className="w-8 h-8 bg-amber-500/85 backdrop-blur-xl hover:bg-amber-400 text-black font-black rounded-xl flex items-center justify-center transition-all shadow-lg cursor-pointer"
                          title={isAdmin && !isOwner ? "Admin: Edit listing details" : "Edit listing"}
                        >
                          <Edit3 size={13} />
                        </button>

                        <button 
                          type="button"
                          onClick={(e) => handleDeleteListing(p.id, e)}
                          className="w-8 h-8 bg-red-600/85 backdrop-blur-xl hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-all shadow-lg cursor-pointer"
                          title={isAdmin && !isOwner ? "Admin: Delete item from Firestore" : "Delete this listing"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Flagged Status Banner on Card */}
                  {p.isFlagged && (
                    <div className="absolute bottom-3.5 right-3.5 bg-rose-600/95 text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md border border-rose-400/40">
                      <AlertTriangle size={10} /> Flagged
                    </div>
                  )}
                </div>
                
                {/* Content Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest px-2 py-0.5 bg-amber-400/10 rounded-md">
                        {p.category}
                      </span>
                      {p.isDigital ? (
                        <span className="text-[8px] font-black text-cyan-300 uppercase bg-cyan-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Download size={9} /> Instant Download
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold text-slate-400 uppercase">
                          {p.condition || 'New'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {p.title}
                    </h3>
                    
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* 1-Click Card Unlock / Download Trigger on Card */}
                  <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                    {p.isDigital ? (
                      <button
                        onClick={(e) => handleTriggerDownload(p, e)}
                        className={`w-full py-2 px-3 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                          isUnlocked
                            ? 'bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/40'
                            : 'bg-amber-400 hover:bg-amber-300 text-black'
                        }`}
                      >
                        <Download size={13} />
                        <span>{isUnlocked ? 'Download File 📥' : `Unlock Card (${(p.coinPrice || (p.price > 0 ? Math.round(p.price * 100) : 100)).toLocaleString()} Coins)`}</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => isUnlocked ? navigate(`/market/${p.id}`) : handleBuyWithCoins(p, e)}
                        className={`w-full py-2 px-3 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                          isUnlocked
                            ? 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40'
                            : 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-black shadow-amber-500/20'
                        }`}
                      >
                        {isUnlocked ? <CheckCircle2 size={13} /> : <Coins size={13} />}
                        <span>{isUnlocked ? 'Card Unlocked ✓ (View Details)' : `Unlock Card (${(p.coinPrice || (p.price > 0 ? Math.round(p.price * 100) : 100)).toLocaleString()} Coins)`}</span>
                      </button>
                    )}
                  </div>

                  {/* Direct Contact Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-amber-400 shrink-0">
                        <UserIcon size={12} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 truncate">
                        {p.sellerName.split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                      {waUrl && !p.isDigital && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                          title="Message on WhatsApp"
                        >
                          <Phone size={11} />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <StarRating rating={p.rating || 5} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-28 px-6 glass-panel rounded-[3rem] border-white/10 bg-slate-950/40 text-center">
          <div className="w-20 h-20 bg-amber-400/10 rounded-[2rem] flex items-center justify-center text-amber-400 mb-6 shadow-2xl">
             <ShoppingBag size={40} />
          </div>
          <h3 className="text-xl font-black text-white mb-2 uppercase italic">No Listings Found</h3>
          <p className="text-slate-400 max-w-sm mx-auto text-xs font-medium leading-relaxed mb-6">
            {searchQuery ? `No listings match "${searchQuery}" in Suq Al-Mubaraki.` : "The marketplace is quiet. Be the first to list a spiritual essential or downloadable digital resource!"}
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3.5 bg-amber-400 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-amber-400/20 cursor-pointer"
          >
            Create First Listing
          </button>
        </div>
      )}

      {/* Create Listing Modal (Supports Physical Products & Downloadable Digital Items) */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCreateModal(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-xl"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-xl bg-slate-950 border border-amber-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
             >
                {/* Modal Header */}
                <div className="p-6 md:p-7 border-b border-white/10 flex items-center justify-between bg-black/40 shrink-0">
                   <div>
                     <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Suq Al-Mubaraki Trade</span>
                     <h3 className="text-lg md:text-xl font-black text-white">Create New Listing</h3>
                   </div>
                   <button 
                     onClick={() => setShowCreateModal(false)} 
                     className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                   >
                     <X size={18}/>
                   </button>
                </div>
                
                {/* Modal Form Content */}
                <div className="overflow-y-auto p-6 md:p-8 no-scrollbar space-y-6">
                  <form onSubmit={handleCreateListing} className="space-y-6">
                     
                     {/* Item Type: Physical or Downloadable Digital */}
                     <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3">
                        <label className="text-[10px] font-black text-cyan-300 uppercase tracking-widest block">
                          Listing Type *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setNewListing(prev => ({ ...prev, isDigital: false }))}
                            className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                              !newListing.isDigital
                                ? 'bg-amber-400 text-black border-amber-400 font-black shadow-md'
                                : 'bg-black/50 text-slate-400 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <Package size={18} className="mx-auto mb-1" />
                            <p className="text-xs font-black">Physical Product</p>
                            <p className="text-[9px] opacity-75 mt-0.5">Rug, Attar, Tasbih, Clothing</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setNewListing(prev => ({ ...prev, isDigital: true }))}
                            className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                              newListing.isDigital
                                ? 'bg-cyan-400 text-black border-cyan-400 font-black shadow-md'
                                : 'bg-black/50 text-slate-400 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <Download size={18} className="mx-auto mb-1" />
                            <p className="text-xs font-black">Digital Download</p>
                            <p className="text-[9px] opacity-75 mt-0.5">PDF Mushaf, Audio, eBooks, Art</p>
                          </button>
                        </div>

                        {/* Digital Fields Configuration */}
                        {newListing.isDigital && (
                          <div className="pt-3 border-t border-cyan-500/20 space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider">
                                Download File URL / Cloud Resource Link *
                              </label>
                              <input
                                required={newListing.isDigital}
                                type="url"
                                value={newListing.downloadUrl || ''}
                                onChange={(e) => setNewListing(prev => ({ ...prev, downloadUrl: e.target.value }))}
                                placeholder="https://example.com/files/tajweed-mushaf.pdf"
                                className="w-full bg-black/60 border border-cyan-500/30 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">File Format</label>
                                <select
                                  value={newListing.downloadFormat || 'PDF'}
                                  onChange={(e) => setNewListing(prev => ({ ...prev, downloadFormat: e.target.value }))}
                                  className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-cyan-400"
                                >
                                  {['PDF', 'MP3', 'ZIP', 'EPUB', 'XLSX', 'IMAGE', 'OTHER'].map(fmt => (
                                    <option key={fmt} value={fmt}>{fmt}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">File Size (e.g. 24 MB)</label>
                                <input
                                  type="text"
                                  value={newListing.downloadSize || ''}
                                  onChange={(e) => setNewListing(prev => ({ ...prev, downloadSize: e.target.value }))}
                                  placeholder="e.g. 15.4 MB"
                                  className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-cyan-400"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                     </div>

                     {/* Title */}
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Product Title *</label>
                        <input 
                          required
                          type="text" 
                          value={newListing.title || ''}
                          onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                          placeholder={newListing.isDigital ? "e.g. The Noble Quran Tajweed PDF (Full 604 Pages)" : "e.g. Handcrafted Velvet Prayer Rug (Musalla)"}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl py-3.5 px-4 text-xs text-white font-medium outline-none focus:border-amber-400/50 transition-all"
                        />
                     </div>

                     {/* Payment & Pricing Flexibility Choice */}
                     <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                        <label className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
                          Accepted Payment Method *
                        </label>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'both', label: '🪙 + 💵 Both', desc: 'Accept Coins or Cash' },
                            { id: 'coins', label: '🪙 Coins Only', desc: 'Noor Coins Only' },
                            { id: 'cash', label: '💵 Cash Only', desc: 'USD Dollars Only' }
                          ].map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setNewListing(prev => ({ ...prev, pricingMode: opt.id as any }))}
                              className={`p-3 rounded-xl text-center border transition-all cursor-pointer ${
                                newListing.pricingMode === opt.id
                                  ? 'bg-amber-400 text-black border-amber-400 font-black shadow-md'
                                  : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/20'
                              }`}
                            >
                              <p className="text-xs font-black">{opt.label}</p>
                              <p className="text-[9px] opacity-75 mt-0.5">{opt.desc}</p>
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {newListing.pricingMode !== 'coins' && (
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">USD Cash Price ($) [Set 0 for Free]</label>
                              <div className="relative">
                                 <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                 <input 
                                   type="number" 
                                   step="0.01"
                                   value={newListing.price ?? ''}
                                   onChange={(e) => {
                                     const p = e.target.value;
                                     setNewListing(prev => ({
                                       ...prev,
                                       price: p,
                                       coinPrice: prev.coinPrice ? prev.coinPrice : (parseFloat(p) ? (Math.round(parseFloat(p) * 100)).toString() : '0')
                                     }));
                                   }}
                                   placeholder="0.00"
                                   className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-8 pr-3 text-xs text-white font-mono outline-none focus:border-amber-400/50"
                                 />
                              </div>
                            </div>
                          )}

                          {newListing.pricingMode !== 'cash' && (
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Noor Coin Price (🪙)</label>
                              <div className="relative">
                                 <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={14} />
                                 <input 
                                   type="number" 
                                   step="1"
                                   value={newListing.coinPrice ?? ''}
                                   onChange={(e) => setNewListing(prev => ({ ...prev, coinPrice: e.target.value }))}
                                   placeholder="0"
                                   className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-8 pr-3 text-xs text-white font-mono outline-none focus:border-amber-400/50"
                                 />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Open to negotiation checkbox */}
                        <label className="flex items-center gap-2 pt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!newListing.isNegotiable}
                            onChange={(e) => setNewListing(prev => ({ ...prev, isNegotiable: e.target.checked }))}
                            className="rounded accent-amber-400"
                          />
                          <span className="text-xs text-slate-300 font-medium">🤝 Price is negotiable (open to counter offers / barter)</span>
                        </label>
                     </div>

                     {/* WhatsApp Contact & Direct Number */}
                     <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Phone size={13} />
                          WhatsApp Direct Contact Number
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Buyers will be able to click a 1-tap WhatsApp button to instantly message and inquire from you.
                        </p>
                        <input 
                          type="tel"
                          value={newListing.whatsappNumber || ''}
                          onChange={(e) => setNewListing({...newListing, whatsappNumber: e.target.value})}
                          placeholder="e.g., +1 234 567 8900 or +256 708515639 (with country code)"
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs text-white font-mono outline-none focus:border-emerald-500/50"
                        />
                     </div>

                     {/* Category & Condition & Location */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                          <select 
                            value={newListing.category || 'Worship'}
                            onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-3 text-xs text-white outline-none focus:border-amber-400/50"
                          >
                             {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Condition</label>
                           <select 
                             value={newListing.condition || 'New'}
                             onChange={(e) => setNewListing({...newListing, condition: e.target.value as any})}
                             className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-3 text-xs text-white outline-none focus:border-amber-400/50"
                           >
                              {['New', 'Like New', 'Good', 'Fair'].map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">City / Region</label>
                           <input 
                             type="text" 
                             value={newListing.cityLocation || ''}
                             onChange={(e) => setNewListing({...newListing, cityLocation: e.target.value})}
                             placeholder={newListing.isDigital ? "Instant Digital Download" : "e.g. Dubai, UAE or Global"}
                             className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-3 text-xs text-white outline-none focus:border-amber-400/50"
                           />
                        </div>
                     </div>

                     {/* Description */}
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Product Description *</label>
                        <textarea 
                          required
                          rows={3}
                          value={newListing.description || ''}
                          onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                          placeholder="Detail your item's features, material, download specifications, and spiritual craft..."
                          className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-amber-400/50 resize-none"
                        />
                     </div>

                     {/* Product Images */}
                     <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                            {newListing.isDigital ? 'Product Preview Cover Image *' : 'Product Images (Minimum 2 Pictures Required) *'}
                          </label>
                          <span className="text-[9px] text-amber-400 font-bold">Verified Trade Standard</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[0, 1, 2, 3].map((idx) => {
                            const isMain = idx === 0;
                            const currentVal = isMain ? newListing.imageUrl : newListing.images[idx - 1];
                            const label = isMain ? 'Cover Photo' : `Photo ${idx + 1}`;
                            
                            return (
                              <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-2.5 space-y-2 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                  <span className="text-[8px] font-black uppercase text-amber-400 tracking-wider">{label}</span>
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
                                      className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                                      title="Remove"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
                                
                                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-slate-900 flex flex-col items-center justify-center">
                                  {currentVal ? (
                                    <img src={currentVal} alt="Preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-center p-1">
                                      <ImageIcon size={14} className="text-slate-600 mx-auto mb-0.5" />
                                      <span className="text-[8px] text-slate-500 font-bold">Add Photo</span>
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
                                  className="w-full bg-black/60 border border-white/10 rounded-lg py-1 px-1.5 text-[8px] text-white outline-none focus:border-amber-400/50"
                                />
                              </div>
                            );
                          })}
                        </div>
                     </div>

                     {/* Submit Button */}
                     <button 
                       disabled={isSubmitting}
                       type="submit"
                       className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-wider text-xs cursor-pointer"
                     >
                        {isSubmitting ? 'Publishing to Suq...' : (newListing.isDigital ? 'Publish Digital Download Item' : 'Publish Listing to Suq Al-Mubaraki')}
                        <ArrowRight size={16} />
                     </button>
                  </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Confirmed / Notification Toast */}
      <AnimatePresence>
        {purchaseSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[250] bg-emerald-500 text-slate-950 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-3 border-2 border-emerald-300"
          >
            <Sparkles size={18} />
            <span>{purchaseSuccessToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Listing Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingListing && (
          <div className="fixed inset-0 z-[125] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-slate-950 border border-amber-500/40 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40 shrink-0">
                <div>
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Suq Al-Mubaraki Management</span>
                  <h3 className="text-lg md:text-xl font-black text-white">Edit Marketplace Listing</h3>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X size={18}/>
                </button>
              </div>

              {/* Modal Form */}
              <div className="overflow-y-auto p-6 md:p-8 no-scrollbar space-y-6">
                <form onSubmit={handleSaveListingEdit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Product Title *</label>
                    <input 
                      type="text" 
                      required
                      value={editProductForm.title || ''}
                      onChange={(e) => setEditProductForm({...editProductForm, title: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-amber-400/60 font-bold"
                    />
                  </div>

                  {/* Pricing Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-1">Cash Price ($ USD)</label>
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={editProductForm.price ?? 0}
                        onChange={(e) => setEditProductForm({...editProductForm, price: parseFloat(e.target.value) || 0})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-emerald-400/60 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest px-1">Noor Coins Price</label>
                      <input 
                        type="number" 
                        min="0"
                        step="1"
                        value={editProductForm.coinPrice ?? 0}
                        onChange={(e) => setEditProductForm({...editProductForm, coinPrice: parseInt(e.target.value, 10) || 0})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-amber-400/60 font-mono"
                      />
                    </div>
                  </div>

                  {/* Category & Condition & City */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                      <select 
                        value={editProductForm.category || 'Worship'}
                        onChange={(e) => setEditProductForm({...editProductForm, category: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-3 text-xs text-white outline-none focus:border-amber-400/50"
                      >
                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Condition</label>
                      <select 
                        value={editProductForm.condition || 'New'}
                        onChange={(e) => setEditProductForm({...editProductForm, condition: e.target.value as any})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-3 text-xs text-white outline-none focus:border-amber-400/50"
                      >
                        {['New', 'Like New', 'Good', 'Fair'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">City / Region</label>
                      <input 
                        type="text" 
                        value={editProductForm.cityLocation || ''}
                        onChange={(e) => setEditProductForm({...editProductForm, cityLocation: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-3 text-xs text-white outline-none focus:border-amber-400/50"
                      />
                    </div>
                  </div>

                  {/* Halal Certified Checkbox */}
                  <label className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editProductForm.halalCertified}
                      onChange={(e) => setEditProductForm(prev => ({ ...prev, halalCertified: e.target.checked }))}
                      className="rounded accent-emerald-400"
                    />
                    <span className="text-xs text-emerald-300 font-bold">✓ Halal Certified & Ethically Sourced Standard</span>
                  </label>

                  {/* Digital download fields if digital */}
                  {editProductForm.isDigital && (
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider">
                          Download URL *
                        </label>
                        <input
                          type="url"
                          value={editProductForm.downloadUrl || ''}
                          onChange={(e) => setEditProductForm(prev => ({ ...prev, downloadUrl: e.target.value }))}
                          className="w-full bg-black/60 border border-cyan-500/30 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description *</label>
                    <textarea 
                      required
                      rows={3}
                      value={editProductForm.description || ''}
                      onChange={(e) => setEditProductForm({...editProductForm, description: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-amber-400/50 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button 
                      type="button" 
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-400/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report / Flag Listing Modal */}
      <AnimatePresence>
        {flaggingListing && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-rose-400">
                  <div className="p-2 rounded-xl bg-rose-500/20">
                    <Flag size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Report Listing</h3>
                    <p className="text-[11px] text-slate-400">Submit for admin review and moderation</p>
                  </div>
                </div>
                <button
                  onClick={() => setFlaggingListing(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <p className="text-xs font-bold text-white line-clamp-1">{flaggingListing.title}</p>
                <p className="text-[10px] text-slate-400">Seller: {flaggingListing.sellerName} &bull; Category: {flaggingListing.category}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Reason for Reporting:</label>
                <select
                  value={flagReasonText}
                  onChange={(e) => setFlagReasonText(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-rose-400"
                >
                  <option value="Non-Halal / Forbidden Content">Non-Halal / Forbidden Item</option>
                  <option value="Fraud / Scam / Misleading Information">Fraud / Scam / Misleading Information</option>
                  <option value="Inappropriate Images or Description">Inappropriate Images or Description</option>
                  <option value="Counterfeit / Unauthorized Product">Counterfeit / Unauthorized Product</option>
                  <option value="Defective / Broken Download File">Defective / Broken Download File</option>
                  <option value="Other Policy Violation">Other Policy Violation</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFlaggingListing(null)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isFlagSubmitting}
                  onClick={handleSubmitFlag}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
                >
                  <Flag size={14} />
                  <span>{isFlagSubmitting ? 'Submitting...' : 'Submit Flag'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coin Shop Modal */}
      <CoinShopModal
        isOpen={isCoinShopOpen}
        onClose={() => setIsCoinShopOpen(false)}
        currentUser={activeUser}
        currentHasanat={currentHasanat}
        onHasanatDeducted={onHasanatDeducted}
        onCoinsPurchased={() => {
          setUserCoins(getStoredCoins());
        }}
      />

      {/* Universal Media Lightbox Expansion Modal */}
      <MediaLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        media={lightboxMediaItems}
        initialIndex={lightboxIndex}
      />
    </div>
  );
}
