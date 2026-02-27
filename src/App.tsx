import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Heart,
  User,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Package,
  Truck,
  ArrowRight,
  Star,
  CheckCircle2,
  Menu,
  X,
  Zap,
  LayoutDashboard,
  DollarSign,
  IndianRupee,
  Plus,
  TrendingUp,
  Crown,
  ThumbsUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  MoreVertical,
  Upload,
  Camera,
  ArrowLeft,
  Lock,
  MessageCircle,
  FastForward,
  ShoppingCart,
  Sparkles,
  Phone,
  PhoneCall,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

export const CONDITION_LABELS: Record<string, string> = {
  A: 'Brand new',
  B: 'Like new',
  C: 'Lightly used'
};

/** URL-friendly slug (e.g. "Premium Leather Sofa" → "premium-leather-sofa") */
function slug(s: string): string {
  if (!s || typeof s !== 'string') return '';
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || '';
}

function productSlug(title: string): string {
  return slug(title) || 'product';
}

// --- Types ---
type Role = 'Buyer' | 'Seller' | 'Admin';
type View = 'Home' | 'Browse' | 'Detail' | 'Checkout' | 'Success' | 'Tracking' | 'Orders' | 'OrderDetails' | 'SellerDashboard' | 'MyListings' | 'CreateListing' | 'SellerKYC' | 'Cart' | 'Profile' | 'History' | 'Support' | 'Login';

interface UserType {
  email: string;
  name: string;
  role: Role;
}

interface Listing {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  images?: string[];
  isVerified: boolean;
  deliveryAvailable: boolean;
  condition: 'A' | 'B' | 'C';
  brand: string;
  aiDealTag: 'Great Deal' | 'Fair' | 'Premium' | 'Good Deal' | 'Luxury Pick';
  deliveryEta: string;
  city: string;
  category: string;
  subCategory?: string;
  description?: string;
  offerAmount?: number;
  offerStatus?: 'pending' | 'approved' | 'rejected';
  offerBuyerName?: string;
  offerBuyerCity?: string;
  offerBuyerPhone?: string;
}

const MOCK_LISTINGS: Listing[] = [
  {
    id: 101,
    title: 'Mid-Century Modern Sofa',
    price: 18500,
    originalPrice: 45000,
    image: `${import.meta.env.BASE_URL}blue_2_seater.png`,
    isVerified: true,
    deliveryAvailable: true,
    condition: 'A',
    brand: 'Urban Ladder',
    aiDealTag: 'Great Deal',
    deliveryEta: '3 Days',
    city: 'Lucknow',
    category: 'furniture',
    subCategory: 'Sofa'
  },
  {
    id: 102,
    title: 'Samsung 253L Double Door Refrigerator',
    price: 21000,
    originalPrice: 39000,
    image: `${import.meta.env.BASE_URL}silver_double_fridge.png`,
    isVerified: true,
    deliveryAvailable: true,
    condition: 'B',
    brand: 'Samsung',
    aiDealTag: 'Fair',
    deliveryEta: '2 Days',
    city: 'Lucknow',
    category: 'appliances',
    subCategory: 'Refrigerator'
  },
  {
    id: 202,
    title: 'IKEA 3-Seater Fabric Sofa',
    price: 12000,
    originalPrice: 28000,
    image: `${import.meta.env.BASE_URL}ikea_sofa.png`,
    isVerified: true,
    deliveryAvailable: true,
    condition: 'B',
    brand: 'IKEA',
    aiDealTag: 'Great Deal',
    deliveryEta: '4 Days',
    city: 'Lucknow',
    category: 'furniture',
    subCategory: 'Sofa'
  },
  {
    id: 204,
    title: 'Daikin 1.5 Ton Split AC',
    price: 21000,
    originalPrice: 42000,
    image: `${import.meta.env.BASE_URL}daikin_ac.png`,
    isVerified: true,
    deliveryAvailable: true,
    condition: 'B',
    brand: 'Daikin',
    aiDealTag: 'Fair',
    deliveryEta: '3 Days',
    city: 'Lucknow',
    category: 'appliances',
    subCategory: 'Split AC'
  },
  {
    id: 205,
    title: 'Sony Bravia 55 inch 4K TV',
    price: 45000,
    originalPrice: 85000,
    image: `${import.meta.env.BASE_URL}sony_tv.png`,
    isVerified: true,
    deliveryAvailable: true,
    condition: 'A',
    brand: 'Sony',
    aiDealTag: 'Premium',
    deliveryEta: '2 Days',
    city: 'Lucknow',
    category: 'electronics',
    subCategory: 'TV'
  },
  {
    id: 301,
    title: '1BHK Essential Combo',
    price: 75000,
    originalPrice: 150000,
    image: `${import.meta.env.BASE_URL}1bhk_combo.png`,
    isVerified: true,
    deliveryAvailable: true,
    condition: 'A',
    brand: 'Abhirent',
    aiDealTag: 'Premium',
    deliveryEta: '7 Days',
    city: 'Lucknow',
    category: 'combos',
    subCategory: '1BHK Combo'
  },
  {
    id: 401,
    title: 'Ergonomic Workstation Desk',
    price: 12000,
    originalPrice: 22000,
    image: `${import.meta.env.BASE_URL}workstation_desk.png`,
    isVerified: true,
    deliveryAvailable: true,
    condition: 'A',
    brand: 'Featherlite',
    aiDealTag: 'Great Deal',
    deliveryEta: '3 Days',
    city: 'Lucknow',
    category: 'office',
    subCategory: 'Single Desk'
  }
];

// --- Components ---

const Badge = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${className}`}>
    {children}
  </span>
);

const COMING_SOON_TEXT = 'We are coming soon to Lucknow! Our website is currently under development, and we are working hard to launch very soon. Thank you for your patience and support.';

const useComingSoonModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  return { isOpen, open, close };
};

const ComingSoonModal = ({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const focusable = [closeButtonRef.current, primaryButtonRef.current].filter(Boolean) as HTMLElement[];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 4;
    const rotateX = (0.5 - y) * 4;
    setTilt({ rotateX, rotateY, scale: 1.01 });
  };

  const resetTilt = () => setTilt({ rotateX: 0, rotateY: 0, scale: 1 });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-neutral-950/35 backdrop-blur-md flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="coming-soon-title"
          aria-describedby="coming-soon-description"
        >
          <motion.div
            className="relative w-full max-w-md rounded-[28px] border border-violet-100/70 bg-white/95 p-7 shadow-2xl shadow-violet-200/40"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: tilt.scale,
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY,
            }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22, mass: 0.7 }}
            style={{ transformStyle: 'preserve-3d', perspective: '1200px' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetTilt}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-xl p-2 text-neutral-500 hover:bg-violet-50 hover:text-violet-700 transition-colors"
              aria-label="Close coming soon modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-700 border border-violet-100">
              <Sparkles className="w-3.5 h-3.5" />
              Update
            </div>

            <h2 id="coming-soon-title" className="text-2xl font-bold text-neutral-900 pr-10">Coming Soon</h2>
            <p id="coming-soon-description" className="mt-3 text-neutral-600 leading-relaxed">{message}</p>

            <div className="mt-7 flex items-center justify-end gap-3">
              <button
                ref={primaryButtonRef}
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-100"
                aria-label="Acknowledge coming soon message"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Header = ({ setView, selectedCity, setSelectedCity, onBrowseAll, cartCount = 0, onSearch, searchTerm = '', user, onLogout }:
  { setView: (v: View) => void, selectedCity: string, setSelectedCity: (c: string) => void, onBrowseAll: () => void, cartCount?: number, onSearch: (term: string) => void, searchTerm?: string, user?: UserType | null, onLogout?: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Sync internal state with external searchTerm prop
  useEffect(() => {
    // If you want full control, just use searchTerm directly in input value.
    // If you just want to clear, this is fine too.
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onSearch(val);
  };

  const cityLabel = selectedCity || 'Lucknow';

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-orange-50/90 border-b border-orange-100 text-[11px] sm:text-xs text-orange-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-1.5 flex items-center justify-between">
          <p className="font-semibold tracking-wide">Lucknow launch window is now open · Limited early access</p>
          <button onClick={() => setView('Support')} className="hidden sm:inline font-bold hover:text-orange-900">Help Center</button>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/90 border-b border-orange-100/70">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-3">
          <div className="flex items-center gap-3 lg:gap-5">
            <Link to="/" className="shrink-0">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Abhirent" className="h-10 w-auto object-contain" />
            </Link>

            <nav className="hidden lg:flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-2 py-1.5">
              <button onClick={() => setView('Home')} className="px-3 py-2 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-orange-50 hover:text-orange-800 transition-colors">Home</button>
              <button onClick={onBrowseAll} className="px-3 py-2 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-orange-50 hover:text-orange-800 transition-colors">Explore</button>
              <button onClick={() => setView('CreateListing')} className="px-3 py-2 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-orange-50 hover:text-orange-800 transition-colors">Sell</button>
            </nav>

            <div className="hidden md:flex flex-1 items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-2.5 focus-within:ring-2 focus-within:ring-orange-300/40">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search sofas, beds, ACs..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
              <div className="h-4 w-px bg-neutral-200" />
              <button onClick={() => setSelectedCity('Lucknow')} className="flex items-center gap-1 text-xs font-semibold text-orange-700">
                <MapPin className="w-3.5 h-3.5" />
                {cityLabel}
              </button>
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <button onClick={() => setView('Cart')} className="relative p-2.5 rounded-xl text-neutral-600 hover:bg-orange-50 hover:text-orange-700 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-600 text-white text-[10px] rounded-full grid place-items-center">{Math.min(cartCount, 9)}</span>}
              </button>
              <button className="hidden sm:inline-flex p-2.5 rounded-xl text-neutral-600 hover:bg-orange-50 hover:text-orange-700 transition-colors">
                <Heart className="w-5 h-5" />
              </button>

              {user ? (
                <div className="relative" ref={profileRef}>
                  <button className="inline-flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-orange-50" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                  </button>
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-orange-100 bg-white shadow-xl p-2 z-50">
                        <button onClick={() => { setView('Profile'); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-orange-50">Profile</button>
                        <button onClick={() => { setView('MyListings'); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-orange-50">My Listings</button>
                        <button onClick={() => { setView('Orders'); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-orange-50">My Orders</button>
                        <button onClick={() => { setView('SellerKYC'); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-orange-50">Seller KYC</button>
                        <button onClick={() => { onLogout && onLogout(); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50">Log Out</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={() => setView('Login')} className="hidden sm:inline-flex items-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 transition-colors">Sign In</button>
              )}

              <button className="md:hidden p-2.5 rounded-xl border border-orange-100 text-neutral-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-b border-orange-100 bg-white overflow-hidden">
            <div className="px-4 py-5 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-orange-100 px-3 py-2.5">
                <Search className="w-4 h-4 text-neutral-400" />
                <input value={searchTerm} onChange={handleSearchChange} placeholder="Search in Abhirent" className="w-full bg-transparent text-sm outline-none" />
              </div>
              <button onClick={() => { onBrowseAll(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-xl bg-orange-50 text-orange-800 font-semibold">Explore Listings</button>
              <button onClick={() => { setView('CreateListing'); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-xl bg-orange-600 text-white font-semibold">Sell on Abhirent</button>
              <button onClick={() => { setView('Support'); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-xl border border-orange-100 text-neutral-700 font-semibold">Support</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Hero = ({ onBrowseCategory, onSell }: { onBrowseCategory: (c: string) => void, onSell: () => void }) => {
  return (
    <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-violet-50 rounded-full blur-3xl -z-10 opacity-60" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-fuchsia-50 rounded-full blur-3xl -z-10 opacity-60" />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-neutral-900 mb-6 leading-[1.1]">
            Buy Pre-Owned. Pay Safely.<br />
            <span className="text-violet-600">Delivered with Trust.</span>
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onBrowseCategory('furniture')}
              className="w-full sm:w-auto px-8 py-4 bg-violet-600 text-white rounded-2xl font-semibold hover:bg-violet-700 transition-all premium-shadow flex items-center justify-center gap-2 group"
            >
              Browse Furniture
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onBrowseCategory('appliances')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-neutral-900 border border-neutral-200 rounded-2xl font-semibold hover:bg-neutral-50 transition-all premium-shadow flex items-center justify-center gap-2"
            >
              Browse Appliances
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Banner = ({ onBrowseCategory }: { onBrowseCategory: (c: string) => void }) => {
  const baseUrl = import.meta.env.BASE_URL;
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,#ffedd5_0%,#fffaf6_35%,#fff_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute top-32 right-0 h-80 w-80 rounded-full bg-amber-200/45 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 pb-12 md:pb-16">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] items-center gap-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-orange-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Abhirent · Lucknow First Access
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.04] text-neutral-900 max-w-2xl">
              Rent-ready homes,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-700 to-amber-500">without premium price stress.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-neutral-600 max-w-xl leading-relaxed">
              Discover verified pre-owned furniture and appliances with secure payments, managed logistics, and local support tailored for Indian families.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button onClick={() => onBrowseCategory('furniture')} className="px-7 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2">
                Explore Furniture
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => onBrowseCategory('appliances')} className="px-7 py-3.5 rounded-2xl border border-orange-200 bg-white hover:bg-orange-50 text-orange-800 font-bold transition-colors">
                Browse Appliances
              </button>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-3 max-w-2xl">
              {[
                { icon: ShieldCheck, title: 'Verified inventory', subtitle: 'Quality checked' },
                { icon: Truck, title: 'Managed delivery', subtitle: 'Doorstep setup' },
                { icon: IndianRupee, title: 'Transparent pricing', subtitle: 'No hidden costs' },
              ].map((item) => (
                <div key={item.title} className="warm-surface rounded-2xl p-3.5">
                  <item.icon className="w-4 h-4 text-orange-700" />
                  <p className="mt-2 text-sm font-bold text-neutral-900">{item.title}</p>
                  <p className="text-xs text-neutral-500">{item.subtitle}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }} className="relative">
            <div className="rounded-[28px] border border-orange-100 bg-white p-3 shadow-[0_24px_70px_-36px_rgba(194,65,12,0.55)]">
              <img src={`${baseUrl}king_bed_new.png`} alt="Abhirent premium listing" className="h-[300px] md:h-[360px] w-full rounded-2xl object-cover" />
              <div className="mt-3 rounded-xl bg-orange-50 border border-orange-100 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Featured in Lucknow</p>
                  <p className="text-sm font-bold text-neutral-900">2BHK Essential Move-in Set</p>
                </div>
                <span className="text-sm font-extrabold text-orange-700">₹29,999/mo</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl border border-orange-200 bg-white px-4 py-3 shadow-lg hidden sm:block">
              <p className="text-[11px] uppercase tracking-wide text-neutral-500">Trust Score</p>
              <p className="text-xl font-extrabold text-orange-700">4.8/5</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Categories = ({ onBrowseCategory }: { onBrowseCategory: (c: string, m?: string, s?: string) => void }) => {
  const baseUrl = import.meta.env.BASE_URL;
  const categories = [
    { name: 'Sofas', image: `${baseUrl}beige_l_shape.png`, category: 'furniture', menuId: 'living', subCategory: 'Sofa' },
    { name: 'Beds', image: `${baseUrl}wooden_queen_bed.png`, category: 'furniture', menuId: 'bedroom', subCategory: 'Bed' },
    { name: 'Dining Tables', image: `${baseUrl}four_seater_dining.png`, category: 'furniture', menuId: 'dining', subCategory: 'Dining' },
    { name: 'Wardrobes', image: `${baseUrl}modern_wardrobe.png`, category: 'furniture', menuId: 'bedroom', subCategory: 'Wardrobe' },
    { name: 'Refrigerators', image: `${baseUrl}stainless_refrigerator.png`, category: 'appliances', menuId: 'refrigerator', subCategory: 'Refrigerator' },
    { name: 'Washing Machines', image: `${baseUrl}front_load_washer.png`, category: 'appliances', menuId: 'washing', subCategory: 'Washing' },
    { name: 'Air Conditioners', image: `${baseUrl}split_ac_unit.png`, category: 'appliances', menuId: 'ac', subCategory: 'AC' },
    { name: 'Microwaves', image: `${baseUrl}kitchen_microwave.png`, category: 'appliances', menuId: 'microwave', subCategory: 'Microwave' },
  ];

  return (
    <section className="py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Collections</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-neutral-900">Curated for urban Indian homes</h2>
            <p className="mt-2 text-neutral-600">Pick a room or appliance line and browse instantly.</p>
          </div>
          <button onClick={() => onBrowseCategory('furniture')} className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-orange-700 hover:text-orange-800">
            See all collections <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <motion.button
              key={cat.name}
              whileHover={{ y: -4 }}
              onClick={() => onBrowseCategory(cat.category, cat.menuId, cat.subCategory)}
              className="text-left rounded-3xl border border-orange-100 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-orange-200 transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={cat.image} alt={cat.name} className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">{cat.category}</p>
                <h3 className="mt-1 font-extrabold text-neutral-900">{cat.name}</h3>
                <p className="mt-1 text-xs text-neutral-500">Ready to deliver in Lucknow</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

const TrustSection = () => {
  const features = [
    {
      title: 'Abhirent Protected Payments',
      desc: 'Your money is held safely by Abhirent and only released to the seller after you confirm delivery.',
      icon: <ShieldCheck className="w-8 h-8 text-orange-700" />,
      color: 'bg-orange-50'
    },
    {
      title: 'Verified Listings',
      desc: 'Every item goes through a multi-point verification process to ensure quality and authenticity.',
      icon: <CheckCircle2 className="w-8 h-8 text-amber-600" />,
      color: 'bg-amber-50'
    },
    {
      title: 'Managed Logistics',
      desc: 'We handle the pickup, inspection, and delivery. No more awkward meetups with strangers.',
      icon: <Truck className="w-8 h-8 text-orange-700" />,
      color: 'bg-orange-50'
    }
  ];

  return (
    <section className="py-12 bg-[#fffaf4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-3">Built for trust-first renting</h2>
          <p className="text-neutral-500 max-w-xl mx-auto">Every deal follows verified listings, managed movement, and controlled payments.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-orange-100 premium-shadow hover:border-orange-200 transition-colors">
              <div className={`${f.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">{f.title}</h3>
              <p className="text-neutral-500 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      title: 'Browse Verified Items',
      desc: 'Explore thousands of pre-owned items verified by our experts.',
      icon: <Search className="w-6 h-6" />
    },
    {
      title: 'Pay Securely via Abhirent',
      desc: 'Your payment is held safely until you receive and approve the item.',
      icon: <ShieldCheck className="w-6 h-6" />
    },
    {
      title: 'Confirm & Release',
      desc: 'Once delivered, confirm the condition to release payment to the seller.',
      icon: <Truck className="w-6 h-6" />
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-neutral-900 mb-4">How Abhirent works</h2>
          <p className="text-neutral-500">Simple, secure, and managed from start to finish.</p>
        </div>

        <div className="relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-neutral-100 -translate-y-1/2 -z-10" />

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center bg-white">
                <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-200 border-4 border-white relative z-10">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    0{i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{step.title}</h3>
                <p className="text-neutral-500 text-sm max-w-[250px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const RecentlyViewedListings = ({ onListingClick, onViewHistory }: { onListingClick: (l: Listing) => void, onViewHistory: () => void }) => {
  const listings: Listing[] = [
    {
      id: 201,
      title: 'LG 7kg Front Load Washing Machine',
      price: 15000,
      originalPrice: 32000,
      image: `${import.meta.env.BASE_URL}lg_washer.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'A',
      brand: 'LG',
      aiDealTag: 'Fair',
      deliveryEta: '2 Days',
      city: 'Lucknow',
      category: 'appliances'
    },
    {
      id: 202,
      title: 'IKEA 3-Seater Fabric Sofa',
      price: 12000,
      originalPrice: 28000,
      image: `${import.meta.env.BASE_URL}ikea_sofa.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'B',
      brand: 'IKEA',
      aiDealTag: 'Great Deal',
      deliveryEta: '4 Days',
      city: 'Mumbai',
      category: 'furniture'
    },
    {
      id: 203,
      title: 'Wooden Study Desk',
      price: 4500,
      originalPrice: 12000,
      image: `${import.meta.env.BASE_URL}study_desk.png`,
      isVerified: true,
      deliveryAvailable: false,
      condition: 'A',
      brand: 'Generic',
      aiDealTag: 'Great Deal',
      deliveryEta: '1 Day',
      city: 'Pune',
      category: 'furniture'
    },
    {
      id: 204,
      title: 'Daikin 1.5 Ton Split AC',
      price: 21000,
      originalPrice: 42000,
      image: `${import.meta.env.BASE_URL}daikin_ac.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'B',
      brand: 'Daikin',
      aiDealTag: 'Fair',
      deliveryEta: '3 Days',
      city: 'Bangalore',
      category: 'appliances'
    }
  ];

  return (
    <section className="py-10 md:py-12 bg-white border-y border-orange-100/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Continue Browsing</p>
            <h2 className="mt-2 text-3xl font-extrabold text-neutral-900">Recently viewed</h2>
            <p className="text-neutral-500">Pick up from where your shortlist paused.</p>
          </div>
          <button
            onClick={onViewHistory}
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-orange-700 hover:text-orange-800"
          >
            View History <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar md:grid md:grid-cols-4 md:overflow-visible">
          {listings.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -6 }}
              onClick={() => onListingClick(item)}
              className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all group shrink-0 w-[280px] sm:w-[300px] md:w-full snap-center cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <Badge className="bg-white/95 backdrop-blur text-orange-700 border border-orange-100">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-neutral-400 hover:text-orange-700 transition-colors shadow-sm">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-neutral-900 leading-tight group-hover:text-orange-700 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </div>

                <div className="flex flex-col gap-1 mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-neutral-900">₹{item.price.toLocaleString()}</span>
                    <span className="text-sm font-medium text-neutral-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                  </div>
                  <span className="text-xs font-bold text-orange-700">Save {Math.round((1 - item.price / item.originalPrice) * 100)}%</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {(item.city && item.city.toLowerCase() !== 'lucknow') ? 'Lucknow' : (item.city || 'Lucknow')}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                    {CONDITION_LABELS[item.condition]}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturedListings = ({ onListingClick, onViewAll }: { onListingClick: (l: Listing) => void, onViewAll: () => void }) => {
  const listings: Listing[] = [
    {
      id: 101,
      title: 'Mid-Century Modern Sofa',
      price: 18500,
      originalPrice: 45000,
      image: `${import.meta.env.BASE_URL}blue_2_seater.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'A',
      brand: 'Urban Ladder',
      aiDealTag: 'Great Deal',
      deliveryEta: '3 Days',
      city: 'Mumbai',
      category: 'furniture'
    },
    {
      id: 102,
      title: 'Samsung 450L Refrigerator',
      price: 22000,
      originalPrice: 52000,
      image: `${import.meta.env.BASE_URL}samsung_fridge_new.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'B',
      brand: 'Samsung',
      aiDealTag: 'Fair',
      deliveryEta: '2 Days',
      city: 'Bangalore',
      category: 'appliances'
    },
    {
      id: 103,
      title: 'Solid Teak Dining Set (6 Seater)',
      price: 28000,
      originalPrice: 75000,
      image: `${import.meta.env.BASE_URL}six_seater_glass_dining.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'B',
      brand: 'Custom',
      aiDealTag: 'Great Deal',
      deliveryEta: '4 Days',
      city: 'Lucknow',
      category: 'furniture'
    },
    {
      id: 104,
      title: 'Queen Size Sheesham Bed',
      price: 24500,
      originalPrice: 55000,
      image: `${import.meta.env.BASE_URL}wooden_queen_bed.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'A',
      brand: 'Wakefit',
      aiDealTag: 'Great Deal',
      deliveryEta: '5 Days',
      city: 'Pune',
      category: 'furniture'
    },
    {
      id: 105,
      title: 'LG 7kg Front Load Washer',
      price: 19500,
      originalPrice: 38000,
      image: `${import.meta.env.BASE_URL}front_load_washer.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'A',
      brand: 'LG',
      aiDealTag: 'Good Deal',
      deliveryEta: '2 Days',
      city: 'Gurgaon',
      category: 'appliances'
    },
    {
      id: 106,
      title: 'Beige L-Shaped Sofa',
      price: 32000,
      originalPrice: 65000,
      image: `${import.meta.env.BASE_URL}beige_l_shape.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'B',
      brand: 'Home Centre',
      aiDealTag: 'Fair',
      deliveryEta: '4 Days',
      city: 'Mumbai',
      category: 'furniture'
    },
    {
      id: 107,
      title: 'Modern 3-Door Wardrobe',
      price: 15000,
      originalPrice: 35000,
      image: `${import.meta.env.BASE_URL}modern_wardrobe.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'A',
      brand: 'Pepperfry',
      aiDealTag: 'Great Deal',
      deliveryEta: '3 Days',
      city: 'Bangalore',
      category: 'furniture'
    },
    {
      id: 108,
      title: 'Voltas 1.5 Ton Split AC',
      price: 26500,
      originalPrice: 48000,
      image: `${import.meta.env.BASE_URL}split_ac_unit.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'A',
      brand: 'Voltas',
      aiDealTag: 'Fair',
      deliveryEta: '1 Day',
      city: 'Hyderabad',
      category: 'appliances'
    },
    {
      id: 109,
      title: 'IFB Convection Microwave',
      price: 8500,
      originalPrice: 18000,
      image: `${import.meta.env.BASE_URL}kitchen_microwave.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'B',
      brand: 'IFB',
      aiDealTag: 'Good Deal',
      deliveryEta: '2 Days',
      city: 'Pune',
      category: 'appliances'
    },
    {
      id: 110,
      title: 'Compact 4-Seater Dining',
      price: 12000,
      originalPrice: 28000,
      image: `${import.meta.env.BASE_URL}four_seater_dining.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'C',
      brand: 'Local',
      aiDealTag: 'Great Deal',
      deliveryEta: '3 Days',
      city: 'Chennai',
      category: 'furniture'
    },
    {
      id: 111,
      title: 'Whirlpool Double Door Fridge',
      price: 18000,
      originalPrice: 42000,
      image: `${import.meta.env.BASE_URL}stainless_refrigerator.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'B',
      brand: 'Whirlpool',
      aiDealTag: 'Fair',
      deliveryEta: '2 Days',
      city: 'Lucknow',
      category: 'appliances'
    },
    {
      id: 112,
      title: 'Premium King Size Bed',
      price: 35000,
      originalPrice: 85000,
      image: `${import.meta.env.BASE_URL}king_bed_new.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'A',
      brand: 'Durian',
      aiDealTag: 'Luxury Pick',
      deliveryEta: '5 Days',
      city: 'Noida',
      category: 'furniture'
    }
  ];

  return (
    <section className="py-12 md:py-14 bg-[#fff7ef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Featured</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-neutral-900">Trending picks this week</h2>
            <p className="mt-1 text-neutral-500">Hand-picked catalog with trusted quality checks.</p>
          </div>
          <button
            onClick={onViewAll}
            className="flex items-center gap-2 text-sm font-bold text-orange-700 hover:text-orange-800"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {listings.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -8 }}
              onClick={() => onListingClick(item)}
              className="bg-white rounded-3xl overflow-hidden border border-orange-100 premium-shadow group cursor-pointer hover:border-orange-200"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <Badge className="bg-white/95 backdrop-blur text-orange-700 border border-orange-100">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                  {item.aiDealTag === 'Great Deal' && (
                    <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                      <Zap className="w-3 h-3 mr-1" /> AI Deal
                    </Badge>
                  )}
                  {item.aiDealTag === 'Luxury Pick' && (
                    <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                      <Crown className="w-3 h-3 mr-1" /> Luxury
                    </Badge>
                  )}
                  {item.aiDealTag === 'Good Deal' && (
                    <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
                      <ThumbsUp className="w-3 h-3 mr-1" /> Good Value
                    </Badge>
                  )}
                </div>
                <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full text-neutral-400 hover:text-rose-500 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{CONDITION_LABELS[item.condition]}</span>
                </div>
                <h3 className="font-bold text-neutral-900 mb-3 line-clamp-1 group-hover:text-orange-700 transition-colors">{item.title}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-neutral-900">₹{item.price.toLocaleString()}</span>
                    <span className="ml-2 text-sm text-neutral-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-amber-500 text-xs font-bold">
                    <Star className="w-3 h-3 fill-current mr-1" /> 4.8
                  </div>
                </div>
                <button className="mt-4 w-full rounded-xl bg-orange-50 border border-orange-100 py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-100 transition-colors">View details</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = ({ setView, onSupportClick }: { setView: (v: View) => void, onSupportClick: (section: string) => void }) => {
  return (
    <footer className="mt-10 bg-[#1f1309] text-orange-50 pt-14 pb-7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Abhirent" className="h-10 w-auto object-contain brightness-110" />
            <p className="mt-5 text-sm text-orange-100/80 leading-relaxed max-w-sm">
              Abhirent is building India’s friendliest managed rental marketplace for quality pre-owned furniture and appliances.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-orange-800 bg-orange-900/30 px-3 py-2 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              Lucknow launch in progress
            </div>
            <div className="mt-5 flex gap-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 transition-colors grid place-items-center">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-orange-200 mb-4">Marketplace</h4>
            <ul className="space-y-3 text-sm text-orange-100/80">
              <li><button onClick={() => setView('Home')} className="hover:text-white">How it works</button></li>
              <li><button onClick={() => setView('Browse')} className="hover:text-white">Browse listings</button></li>
              <li><button onClick={() => setView('CreateListing')} className="hover:text-white">List an item</button></li>
              <li><button onClick={() => setView('Orders')} className="hover:text-white">Order tracking</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-orange-200 mb-4">Trust</h4>
            <ul className="space-y-3 text-sm text-orange-100/80">
              <li><button onClick={() => onSupportClick('FAQ')} className="hover:text-white">Abhirent Protection</button></li>
              <li><button onClick={() => onSupportClick('Terms')} className="hover:text-white">Managed logistics</button></li>
              <li><button onClick={() => onSupportClick('Privacy')} className="hover:text-white">Escrow-safe payments</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-orange-200 mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-orange-100/80">
              <li><button onClick={() => onSupportClick('FAQ')} className="hover:text-white">FAQ</button></li>
              <li><button onClick={() => onSupportClick('Contact')} className="hover:text-white">Contact us</button></li>
              <li><button onClick={() => onSupportClick('Privacy')} className="hover:text-white">Privacy policy</button></li>
              <li><button onClick={() => onSupportClick('Terms')} className="hover:text-white">Terms of service</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-orange-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-orange-100/70">© 2026 Abhirent. Built for modern Indian homes.</p>
          <Badge className="bg-white/10 text-orange-100 normal-case font-semibold">Prototype – local mode active</Badge>
        </div>
      </div>
    </footer>
  );
};

const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-8">
    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">{title}</h4>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  key?: React.Key;
}

const Checkbox = ({ label, checked, onChange }: CheckboxProps) => (
  <label
    onClick={onChange}
    className="flex items-center gap-2.5 cursor-pointer group w-full"
  >
    <div className={`w-5 h-5 rounded border shrink-0 transition-all flex items-center justify-center ${checked ? 'bg-violet-600 border-violet-600' : 'border-neutral-300 group-hover:border-violet-400'
      }`}>
      {checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
    </div>
    <span className={`text-sm ${checked ? 'text-neutral-900 font-medium' : 'text-neutral-600'}`}>{label}</span>
  </label>
);

type SortOption = 'recommended' | 'price-low' | 'newest';

const FURNITURE_MENU = [
  { id: 'all', name: 'All', subcategories: [] },
  {
    id: 'bedroom',
    name: 'Bed Room',
    subcategories: ['Beds', 'Storage Beds', 'Mattress', 'Bedside Tables', 'Dressing Tables', 'Wardrobes', 'Chest of Drawers', 'Study Tables', 'Bedroom Chairs']
  },
  {
    id: 'living',
    name: 'Living Room',
    subcategories: ['1 Seater Sofa', '2 Seater Sofa', '3 Seater Sofa', 'L Shape Sofa', 'Sofa Cum Bed', 'Recliners', 'Coffee Tables', 'TV Units',
      'Side Tables', 'Shoe Racks', 'Bookshelves', 'Display Cabinets']
  },
  {
    id: 'dining',
    name: 'Dining Room',
    subcategories: ['2 Seater Dining Set', '4 Seater Dining Set', '6 Seater Dining Set', '8 Seater Dining Set', 'Dining Chairs', 'Bar Cabinets', 'Crockery Units', 'Bar Stools']
  },
  {
    id: 'study',
    name: 'Study Room',
    subcategories: ['Study Tables', 'Office Chairs', 'Computer Tables', 'Bookshelves', 'Filing Cabinets', 'Work Desks']
  },
  {
    id: 'mattress',
    name: 'Mattress',
    subcategories: ['Single Mattress', 'Double Mattress', 'Queen Mattress', 'King Mattress', 'Memory Foam Mattress', 'Orthopedic Mattress']
  },
  {
    id: 'kids',
    name: 'Kids Furniture',
    subcategories: ['Kids Beds', 'Bunk Beds', 'Kids Study Table', 'Kids Wardrobe', 'Toy Storage', 'Kids Chairs']
  },
  {
    id: 'storage',
    name: 'Storage',
    subcategories: ['Wardrobes', 'Shoe Racks', 'Storage Cabinets', 'Chest of Drawers', 'Plastic Storage Units', 'Modular Storage']
  }
];

const APPLIANCES_MENU = [
  { id: 'all', name: 'All', subcategories: [] },
  {
    id: 'refrigerator',
    name: 'Refrigerator',
    subcategories: ['Single Door Refrigerator', 'Double Door Refrigerator', 'Side-by-Side Refrigerator', 'Mini Refrigerator', 'Convertible Refrigerator']
  },
  {
    id: 'television',
    name: 'Television',
    subcategories: ['LED TV', 'Smart TV', 'Android TV', '32 Inch TV', '43 Inch TV', '55 Inch TV', '65 Inch TV']
  },
  {
    id: 'washing',
    name: 'Washing Machine',
    subcategories: ['Top Load Washing Machine', 'Front Load Washing Machine', 'Semi Automatic Washing Machine', 'Fully Automatic Washing Machine', 'Washer Dryer Combo']
  },
  {
    id: 'purifier',
    name: 'Water Purifier',
    subcategories: ['RO Water Purifier', 'UV Water Purifier', 'RO + UV Water Purifier', 'Wall Mounted Purifier', 'Table Top Purifier']
  },
  {
    id: 'ac',
    name: 'Air Conditioner',
    subcategories: ['Split AC', 'Window AC', '1 Ton AC', '1.5 Ton AC', '2 Ton AC', 'Inverter AC']
  },
  {
    id: 'microwave',
    name: 'Microwave Oven',
    subcategories: ['Solo Microwave', 'Grill Microwave', 'Convection Microwave', 'Built-in Microwave']
  },
  {
    id: 'other',
    name: 'Other Appliances',
    subcategories: ['Induction Cooktop', 'Chimney', 'Room Heater', 'Geyser', 'Air Cooler', 'Dishwasher']
  }
];

const COMBOS_MENU = [
  { id: 'all', name: 'All', subcategories: [] },
  { id: 'bedroom', name: 'Bed Room', subcategories: ['Bedroom Set', 'Bed + Mattress', 'Wardrobe + Bed'] },
  { id: 'living', name: 'Living Room', subcategories: ['Sofa Set', 'TV Unit + Coffee Table', 'Sofa + Recliner'] },
  { id: 'dining', name: 'Dining Room', subcategories: ['Dining Set', 'Dining Table + Chairs'] },
  { id: 'study', name: 'Study Room', subcategories: ['Study Table + Chair', 'Desk + Bookshelf'] },
  { id: 'appliances', name: 'Appliances', subcategories: ['Kitchen Combo', 'Laundry Combo'] },
  { id: 'bhk', name: 'BHK Combos', subcategories: ['1BHK Combo', '2BHK Combo', '3BHK Combo'] }
];

const OFFICE_MENU = [
  { id: 'all', name: 'All', subcategories: [] },
  { id: 'workstations', name: 'Workstations', subcategories: ['Single Desk', 'Dual Desk', 'L-Shape Desk'] },
  { id: 'chairs', name: 'Office Chair', subcategories: ['Ergonomic Chair', 'Executive Chair', 'Boss Chair'] }
];

const DISCOUNT_MENU = [
  { id: 'all', name: 'All', subcategories: [] },
  { id: 'under299', name: 'Under 299', subcategories: [] },
  { id: 'under499', name: 'Under 499', subcategories: [] },
  { id: 'under849', name: 'Under 849', subcategories: [] }
];

const BrowsePage = ({ onListingClick, selectedCity, selectedCategory, onCategoryChange, initialMenuId = 'all', initialSubCategory = null, searchTerm = '' }: { onListingClick: (l: Listing) => void, selectedCity: string, selectedCategory: string | null, onCategoryChange: (c: string, m?: string, s?: string) => void, initialMenuId?: string, initialSubCategory?: string | null, searchTerm?: string }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [activeMenuId, setActiveMenuId] = useState(initialMenuId);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(initialSubCategory);
  const [filters, setFilters] = useState({
    verifiedOnly: false,
    deliveryAvailable: false,
    condition: [] as string[],
    aiDealTags: [] as string[],
    maxPrice: 100000,
    brands: [] as string[]
  });

  const activeMenu =
    selectedCategory === 'furniture' ? FURNITURE_MENU :
      selectedCategory === 'appliances' ? APPLIANCES_MENU :
        selectedCategory === 'combos' ? COMBOS_MENU :
          selectedCategory === 'office' ? OFFICE_MENU :
            selectedCategory === 'discount' ? DISCOUNT_MENU :
              [];

  useEffect(() => {
    const loadMockListings = () => {
      setLoading(true);
      try {
        // Backend disabled for now: using in-component mock response.
        // const response = await fetch(`${import.meta.env.BASE_URL}listings.json`);
        // const data = await response.json();
        const localListings = JSON.parse(localStorage.getItem('abhirent_listings') || '[]');
        setListings([...MOCK_LISTINGS, ...localListings]);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMockListings();
  }, []);

  // Reset subcategory when menu changes
  useEffect(() => {
    setSelectedSubCategory(null);
  }, [activeMenuId]);

  // Sync state with props when they change (e.g., when navigating from Home with a specific category/subcategory)
  useEffect(() => {
    setActiveMenuId(initialMenuId);
    setSelectedSubCategory(initialSubCategory);
  }, [selectedCategory, initialMenuId, initialSubCategory]);

  const listingsMatchingOtherFilters = listings.filter(l => {
    // City filter: only Lucknow is supported; treat any listing city as Lucknow
    const listingCity = (l.city && l.city.toLowerCase() !== 'lucknow') ? 'Lucknow' : (l.city || 'Lucknow');
    if (listingCity !== selectedCity) return false;

    // Search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const inTitle = l.title?.toLowerCase().includes(term);
      const inDesc = l.description?.toLowerCase().includes(term); // Description might be undefined
      const inBrand = l.brand?.toLowerCase().includes(term);
      const inCategory = l.category?.toLowerCase().includes(term);
      const inSubCategory = l.subCategory?.toLowerCase().includes(term);

      if (!inTitle && !inDesc && !inBrand && !inCategory && !inSubCategory) return false;
    }

    // Category filter
    if (selectedCategory && l.category !== selectedCategory) return false;

    // Sub-navigation filter
    if (['furniture', 'appliances', 'combos', 'office', 'discount'].includes(selectedCategory || '')) {
      if (activeMenuId !== 'all') {
        if (selectedCategory === 'discount') {
          if (activeMenuId === 'under299' && l.price >= 299) return false;
          if (activeMenuId === 'under499' && l.price >= 499) return false;
          if (activeMenuId === 'under849' && l.price >= 849) return false;
        } else {
          const currentMenu = activeMenu.find(m => m.id === activeMenuId);
          if (currentMenu) {
            if (selectedSubCategory) {
              const subMatch = slug(l.subCategory || '') === slug(selectedSubCategory) || l.subCategory?.toLowerCase().includes(selectedSubCategory.toLowerCase());
              if (!subMatch) return false;
            } else {
              if (!l.subCategory || !currentMenu.subcategories.some(sub => l.subCategory?.includes(sub))) return false;
            }
          }
        }
      }
    }

    // Sidebar filters (EXCEPT brand)
    if (filters.verifiedOnly && !l.isVerified) return false;
    if (filters.deliveryAvailable && !l.deliveryAvailable) return false;
    if (filters.condition.length > 0 && !filters.condition.includes(l.condition)) return false;
    if (filters.aiDealTags.length > 0 && !filters.aiDealTags.includes(l.aiDealTag)) return false;
    if (l.price > filters.maxPrice) return false;

    return true;
  });

  const availableBrands = Array.from(new Set(listingsMatchingOtherFilters.map(l => l.brand))).sort() as string[];

  const filteredAndSortedListings = listingsMatchingOtherFilters
    .filter(l => {
      if (filters.brands.length > 0 && !filters.brands.includes(l.brand)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.price - b.price;
      }
      if (sortBy === 'newest') {
        return b.id - a.id; // Higher ID = newer
      }
      if (sortBy === 'recommended') {
        const dealScore = { 'Great Deal': 3, 'Fair': 2, 'Premium': 1 };
        return dealScore[b.aiDealTag] - dealScore[a.aiDealTag];
      }
      return 0;
    });

  const resetFilters = () => {
    setFilters({
      verifiedOnly: false,
      deliveryAvailable: false,
      condition: [],
      aiDealTags: [],
      maxPrice: 100000,
      brands: [] // Explicitly clear brands
    });
    setActiveMenuId('all');
    setSelectedSubCategory(null);
    // If you want to clear the main category as well, uncomment the next line
    // setSelectedCategory(null); 
    setSortBy('recommended'); // Reset sort to default
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Category Sub-navigation */}
      {['furniture', 'appliances', 'combos', 'office', 'discount'].includes(selectedCategory || '') && (
        <div className="bg-white border-b border-neutral-100 sticky top-16 z-40 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center gap-8 h-14 w-max pr-8">
              {activeMenu.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => {
                    setActiveMenuId(menu.id);
                    setSelectedSubCategory(null);
                    onCategoryChange(selectedCategory!, menu.id, undefined);
                  }}
                  className={`text-sm font-bold whitespace-nowrap transition-all relative h-full flex items-center ${activeMenuId === menu.id ? 'text-violet-600' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                >
                  {menu.name}
                  {activeMenuId === menu.id && (
                    <motion.div
                      layoutId="activeMenu"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-subcategory chips */}
      {['furniture', 'appliances', 'combos', 'office'].includes(selectedCategory || '') && activeMenuId !== 'all' && (
        <div className="bg-neutral-50 border-b border-neutral-100 py-3">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setSelectedSubCategory(null);
                  onCategoryChange(selectedCategory!, activeMenuId, undefined);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedSubCategory === null
                  ? 'bg-violet-600 border-violet-600 text-white shadow-md'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-violet-200'
                  }`}
              >
                All {activeMenu.find(m => m.id === activeMenuId)?.name}
              </button>
              {activeMenu.find(m => m.id === activeMenuId)?.subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedSubCategory(sub);
                    onCategoryChange(selectedCategory!, activeMenuId, sub);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${slug(selectedSubCategory || '') === slug(sub)
                    ? 'bg-violet-600 border-violet-600 text-white shadow-md'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-violet-200'
                    }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
        {/* Mobile Filter Trigger */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(true)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-neutral-200 py-3 rounded-xl font-semibold text-neutral-900 shadow-sm"
          >
            <Menu className="w-4 h-4" /> Filters & Sorting
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Panel */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 bg-white rounded-[32px] border border-neutral-100 px-5 py-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-neutral-900">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-violet-600 hover:underline"
                >
                  Clear All
                </button>
              </div>

              <FilterSection title="Main Category">
                <div className="space-y-2">
                  <button
                    onClick={() => onCategoryChange('furniture')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'furniture'
                      ? 'bg-violet-50 text-violet-700 border border-violet-100'
                      : 'text-neutral-600 hover:bg-neutral-50 border border-transparent'
                      }`}
                  >
                    Furniture
                  </button>
                  <button
                    onClick={() => onCategoryChange('appliances')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'appliances'
                      ? 'bg-violet-50 text-violet-700 border border-violet-100'
                      : 'text-neutral-600 hover:bg-neutral-50 border border-transparent'
                      }`}
                  >
                    Appliances
                  </button>
                </div>

              </FilterSection>

              <FilterSection title="Trust & Safety">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-neutral-700">Verified Only</span>
                  <button
                    onClick={() => setFilters(f => ({ ...f, verifiedOnly: !f.verifiedOnly }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${filters.verifiedOnly ? 'bg-violet-600' : 'bg-neutral-200'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${filters.verifiedOnly ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <Checkbox
                  label="Delivery Available"
                  checked={filters.deliveryAvailable}
                  onChange={() => setFilters(f => ({ ...f, deliveryAvailable: !f.deliveryAvailable }))}
                />
              </FilterSection>

              <FilterSection title="Price Range">
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(f => ({ ...f, maxPrice: parseInt(e.target.value) }))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                  <div className="flex justify-between mt-2 text-xs font-bold text-neutral-900">
                    <span>₹0</span>
                    <span>Up to ₹{filters.maxPrice.toLocaleString()}</span>
                  </div>
                </div>
              </FilterSection>

              <FilterSection title="Condition Grade">
                {['A', 'B', 'C'].map(grade => (
                  <Checkbox
                    key={grade}
                    label={CONDITION_LABELS[grade]}
                    checked={filters.condition.includes(grade)}
                    onChange={() => {
                      const newCond = filters.condition.includes(grade)
                        ? filters.condition.filter(c => c !== grade)
                        : [...filters.condition, grade];
                      setFilters(f => ({ ...f, condition: newCond }));
                    }}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Brands">
                <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {availableBrands.map(brand => (
                    <Checkbox
                      key={brand}
                      label={brand}
                      checked={filters.brands.includes(brand)}
                      onChange={() => {
                        const newBrands = filters.brands.includes(brand)
                          ? filters.brands.filter(b => b !== brand)
                          : [...filters.brands, brand];
                        setFilters(f => ({ ...f, brands: newBrands }));
                      }}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="AI Deal Tags">
                {['Great Deal', 'Fair', 'Premium'].map(tag => (
                  <Checkbox
                    key={tag}
                    label={tag}
                    checked={filters.aiDealTags.includes(tag)}
                    onChange={() => {
                      const newTags = filters.aiDealTags.includes(tag)
                        ? filters.aiDealTags.filter(t => t !== tag)
                        : [...filters.aiDealTags, tag];
                      setFilters(f => ({ ...f, aiDealTags: newTags }));
                    }}
                  />
                ))}
              </FilterSection>
            </div>
          </aside>

          {/* Listings Grid */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-bold text-neutral-900">
                {selectedCategory ? (selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)) : 'All Items'}
                <span className="text-neutral-400 font-medium ml-2">({filteredAndSortedListings.length} items in {selectedCity})</span>
              </h2>
              <div className="flex items-center gap-3 text-sm font-medium text-neutral-600">
                <span>Sort by:</span>
                <div className="relative group">
                  <button className="flex items-center gap-1 text-neutral-900 bg-white px-3 py-1.5 rounded-lg border border-neutral-200 shadow-sm">
                    {sortBy === 'recommended' ? 'AI Recommended' : sortBy === 'price-low' ? 'Price: Low to High' : 'Newest'}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                    <button
                      onClick={() => setSortBy('recommended')}
                      className={`w-full text-left px-4 py-2 hover:bg-neutral-50 ${sortBy === 'recommended' ? 'text-violet-600 font-bold' : 'text-neutral-700'}`}
                    >
                      AI Recommended
                    </button>
                    <button
                      onClick={() => setSortBy('price-low')}
                      className={`w-full text-left px-4 py-2 hover:bg-neutral-50 ${sortBy === 'price-low' ? 'text-violet-600 font-bold' : 'text-neutral-700'}`}
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => setSortBy('newest')}
                      className={`w-full text-left px-4 py-2 hover:bg-neutral-50 ${sortBy === 'newest' ? 'text-violet-600 font-bold' : 'text-neutral-700'}`}
                    >
                      Newest
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-neutral-100" />
                ))}
              </div>
            ) : filteredAndSortedListings.length === 0 ? (
              <div className="bg-white rounded-[32px] p-12 text-center border border-neutral-100 shadow-sm">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-neutral-300" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">No verified items available in this city yet.</h3>
                <p className="text-neutral-500 mb-8">Try changing your city or category to find more items.</p>
                <button
                  onClick={resetFilters}
                  className="px-8 py-3 bg-violet-600 text-white rounded-xl font-bold shadow-lg shadow-neutral-100"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedListings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    layout
                    whileHover={{ y: -8 }}
                    onClick={() => onListingClick(listing)}
                    className="bg-white rounded-3xl overflow-hidden border border-neutral-100 premium-shadow group cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {listing.isVerified && (
                          <Badge className="bg-white/90 backdrop-blur text-violet-600 border border-violet-100">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        )}
                        <Badge className={`bg-neutral-900/80 backdrop-blur text-white border border-white/20`}>
                          {CONDITION_LABELS[listing.condition]}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className={`${listing.aiDealTag === 'Great Deal' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          listing.aiDealTag === 'Premium' ? 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' :
                            'bg-neutral-100 text-neutral-700 border-neutral-200'
                          }`}>
                          <Zap className="w-3 h-3 mr-1" /> {listing.aiDealTag}
                        </Badge>
                      </div>
                      <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full text-neutral-400 hover:text-rose-500 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-neutral-900 mb-2 line-clamp-1 group-hover:text-violet-600 transition-colors">
                        {listing.title}
                      </h3>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-extrabold text-neutral-900">₹{listing.price.toLocaleString()}</span>
                        <span className="text-sm text-neutral-400 line-through">₹{listing.originalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                          <Truck className="w-3.5 h-3.5" />
                          <span>{listing.deliveryEta}</span>
                        </div>
                        <div className="flex items-center text-amber-500 text-xs font-bold">
                          <Star className="w-3 h-3 fill-current mr-1" /> 4.9
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div >

      {/* Mobile Filters Bottom Sheet */}
      <AnimatePresence>
        {
          showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[70] max-h-[90vh] overflow-y-auto p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-neutral-900">Filters & Sorting</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 bg-neutral-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  <FilterSection title="Main Category">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => onCategoryChange('furniture')}
                        className={`py-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${selectedCategory === 'furniture'
                          ? 'bg-violet-600 border-violet-600 text-white'
                          : 'bg-neutral-50 border-neutral-100 text-neutral-600'
                          }`}
                      >
                        Furniture
                      </button>
                      <button
                        onClick={() => onCategoryChange('appliances')}
                        className={`py-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${selectedCategory === 'appliances'
                          ? 'bg-violet-600 border-violet-600 text-white'
                          : 'bg-neutral-50 border-neutral-100 text-neutral-600'
                          }`}
                      >
                        Appliances
                      </button>
                    </div>
                  </FilterSection>

                  <FilterSection title="Sort By">
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'recommended', label: 'AI Recommended' },
                        { id: 'price-low', label: 'Price: Low to High' },
                        { id: 'newest', label: 'Newest' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setSortBy(opt.id as SortOption)}
                          className={`w-full text-left px-4 py-3 rounded-xl border font-bold text-sm transition-all ${sortBy === opt.id
                            ? 'bg-violet-600 border-violet-600 text-white'
                            : 'bg-neutral-50 border-neutral-100 text-neutral-600'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </FilterSection>

                  <FilterSection title="Trust & Safety">
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <span className="font-medium text-neutral-700">Verified Only</span>
                      <button
                        onClick={() => setFilters(f => ({ ...f, verifiedOnly: !f.verifiedOnly }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${filters.verifiedOnly ? 'bg-violet-600' : 'bg-neutral-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filters.verifiedOnly ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </FilterSection>

                  <FilterSection title="Price Range">
                    <div className="px-2">
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="1000"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(f => ({ ...f, maxPrice: parseInt(e.target.value) }))}
                        className="w-full accent-violet-600 cursor-pointer"
                      />
                      <div className="flex justify-between mt-2 text-xs font-bold text-neutral-900">
                        <span>₹0</span>
                        <span>Up to ₹{filters.maxPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </FilterSection>

                  <FilterSection title="Condition Grade">
                    <div className="grid grid-cols-3 gap-3">
                      {['A', 'B', 'C'].map(grade => (
                        <button
                          key={grade}
                          onClick={() => {
                            const newCond = filters.condition.includes(grade)
                              ? filters.condition.filter(c => c !== grade)
                              : [...filters.condition, grade];
                            setFilters(f => ({ ...f, condition: newCond }));
                          }}
                          className={`py-3 rounded-xl border font-bold text-sm transition-all ${filters.condition.includes(grade)
                            ? 'bg-violet-600 border-violet-600 text-white'
                            : 'bg-white border-neutral-200 text-neutral-600'
                            }`}
                        >
                          {CONDITION_LABELS[grade]}
                        </button>
                      ))}
                    </div>
                  </FilterSection>

                  <FilterSection title="Brands">
                    <div className="flex flex-wrap gap-2">
                      {availableBrands.map(brand => (
                        <button
                          key={brand}
                          onClick={() => {
                            const newBrands = filters.brands.includes(brand)
                              ? filters.brands.filter(b => b !== brand)
                              : [...filters.brands, brand];
                            setFilters(f => ({ ...f, brands: newBrands }));
                          }}
                          className={`px-4 py-2 rounded-xl border font-bold text-xs transition-all ${filters.brands.includes(brand)
                            ? 'bg-violet-600 border-violet-600 text-white'
                            : 'bg-white border-neutral-200 text-neutral-600'
                            }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </FilterSection>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={resetFilters}
                      className="flex-1 py-4 bg-neutral-100 text-neutral-900 rounded-2xl font-bold"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-[2] py-4 bg-violet-600 text-white rounded-2xl font-bold"
                    >
                      Show {filteredAndSortedListings.length} Items
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )
        }
      </AnimatePresence >
    </div >
  );
};

const ListingDetailPage = ({ listing, onCheckout, onAddToCart, onBack }: { listing: Listing, onCheckout: (l: Listing) => void, onAddToCart: (l: Listing) => void, onBack: () => void }) => {
  // Only show real images: primary image + any extra from listing.images (no placeholders)
  const gallery =
    listing.images && listing.images.length > 0
      ? [listing.image, ...listing.images.filter((url) => url !== listing.image)]
      : [listing.image];

  const [activeImg, setActiveImg] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [listingData, setListingData] = useState<Listing>(listing);
  const [showAskAIModal, setShowAskAIModal] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const localListings = JSON.parse(localStorage.getItem('abhirent_listings') || '[]');
    const local = localListings.find((l: Listing) => l.id === listing.id);
    if (local && local.offerStatus) {
      setListingData(local);
    } else {
      setListingData(listing);
    }
  }, [listing]);

  const handleMakeOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(offerAmount) > 0) {
      const updatedListing = { ...listingData, offerAmount: Number(offerAmount), offerStatus: 'pending' as const };

      const localListings = JSON.parse(localStorage.getItem('abhirent_listings') || '[]');
      const isLocal = localListings.some((l: Listing) => l.id === listing.id);
      if (isLocal) {
        const updatedLocal = localListings.map((l: Listing) => l.id === listing.id ? updatedListing : l);
        localStorage.setItem('abhirent_listings', JSON.stringify(updatedLocal));
      } else {
        localStorage.setItem('abhirent_listings', JSON.stringify([...localListings, updatedListing]));
      }

      setListingData(updatedListing);
      setOfferSuccess(true);
      setTimeout(() => {
        setShowOfferModal(false);
        setOfferSuccess(false);
        setOfferAmount('');
      }, 2500);
    }
  };

  const categoryLabel = listing.category === 'furniture' ? 'Furniture' : listing.category === 'appliances' ? 'Appliances' : listing.category;

  const handleAskAI = async () => {
    setShowAskAIModal(true);
    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setAiError('Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file.');
      setAiLoading(false);
      return;
    }
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a trusted shopping assistant for Abhirent, India's pre-owned furniture and appliances marketplace.

Product details:
- Title: ${listing.title}
- Category: ${listing.category}
- City: Lucknow
- Condition: ${CONDITION_LABELS[listing.condition] || listing.condition}
- Price: ₹${listing.price.toLocaleString()}
- Original price: ₹${listing.originalPrice.toLocaleString()}

In 2-4 short paragraphs, explain:
1) Why this price is fair or a good deal for the Indian market, including relevance to the Lucknow market if useful.
2) Why this product benefits the buyer (practical value, quality, savings).

Mention Lucknow where it adds trust or context. Keep the tone helpful and reassuring. Write in clear English. Do not use bullet points in the middle of paragraphs.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
      });
      const text = response.text?.trim();
      if (text) setAiResponse(text);
      else setAiError('No response from AI.');
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-neutral-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 shrink-0 text-neutral-300" />
          <Link to={`/category/${listing.category}/all/all/lucknow`} className="hover:text-violet-600 transition-colors capitalize">{categoryLabel}</Link>
          <ChevronRight className="w-4 h-4 shrink-0 text-neutral-300" />
          <span className="text-neutral-900 font-medium truncate max-w-[200px] sm:max-w-xs" title={listing.title}>{listing.title}</span>
        </nav>
      </div>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pb-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-[4/3] rounded-[32px] overflow-hidden border border-neutral-100 shadow-xl"
            >
              <img
                src={gallery[activeImg]}
                alt={listing.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-violet-600' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* Abhirent Box */}
            <div className="bg-white border border-neutral-100/80 p-6 rounded-3xl shadow-sm mt-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 mb-1.5 text-lg">Abhirent Protected</h4>
                  <p className="text-[15px] text-neutral-500 leading-relaxed font-medium">
                    Your payment is securely held by Abhirent and released only after delivery confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-violet-100 text-violet-700 border border-violet-200">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified Listing
                </Badge>
                <Badge className="bg-violet-600 text-white">
                  {CONDITION_LABELS[listing.condition]}
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">{listing.title}</h1>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-extrabold text-neutral-900">₹{listing.price.toLocaleString()}</span>
                <span className="text-lg text-neutral-400 line-through">₹{listing.originalPrice.toLocaleString()}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg w-fit">
                  <Zap className="w-4 h-4" />
                  <span>AI Price Range: ₹{(listing.price * 0.95).toLocaleString()} - ₹{(listing.price * 1.05).toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAskAI}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask AI
                </button>
              </div>
            </div>

            {/* Verification Block styled like Abhirent Protected */}
            <div className="bg-white border border-neutral-100/80 p-6 rounded-3xl shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-violet-50 rounded-2xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-violet-600" />
                </div>
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-neutral-900 text-lg">Condition Verified</h4>
                    <div className="bg-violet-50 text-violet-700 text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      {CONDITION_LABELS[listing.condition]}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-700 bg-violet-50 px-2.5 py-1.5 rounded-lg w-fit mt-1 mb-5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Abhirent Assured - Quality Check ⓘ
                  </div>

                  <div className="divide-y divide-neutral-100/80 text-[15px]">
                    <div className="grid grid-cols-[1fr_1.5fr] gap-4 py-3">
                      <span className="text-neutral-500 font-medium">Purchase Year</span>
                      <span className="text-neutral-900 font-medium">2026</span>
                    </div>
                    <div className="grid grid-cols-[1fr_1.5fr] gap-4 py-3">
                      <span className="text-neutral-500 font-medium">Visual Condition</span>
                      <span className="text-neutral-900 font-medium leading-relaxed">Excellent condition with no visible signs of wear.</span>
                    </div>
                    <div className="grid grid-cols-[1fr_1.5fr] gap-4 py-3">
                      <span className="text-neutral-500 font-medium">Functional Condition</span>
                      <span className="text-neutral-900 font-medium">Fully Functional</span>
                    </div>
                    <div className="grid grid-cols-[1fr_1.5fr] gap-4 pt-3">
                      <span className="text-neutral-500 font-medium">Cracks or Stability Issues</span>
                      <span className="text-neutral-900 font-medium">No</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Tags */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-violet-50/50 text-violet-900 border border-violet-100/80 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm hover:shadow-md transition-shadow">
                <FastForward className="w-5 h-5 text-violet-700" />
                <div>
                  <div className="font-bold text-sm leading-none text-violet-900">Fast</div>
                  <div className="text-[10px] text-violet-600/80 font-medium mt-1 uppercase tracking-wide">Shipping</div>
                </div>
              </div>
              <div className="bg-violet-50/50 text-violet-900 border border-violet-100/80 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm hover:shadow-md transition-shadow">
                <Truck className="w-5 h-5 text-violet-700" />
                <div>
                  <div className="font-bold text-sm leading-none text-violet-900">Doorstep</div>
                  <div className="text-[10px] text-violet-600/80 font-medium mt-1 uppercase tracking-wide">Delivery</div>
                </div>
              </div>
              <div className="bg-violet-50/50 text-violet-900 border border-violet-100/80 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm hover:shadow-md transition-shadow">
                <Lock className="w-5 h-5 text-violet-700" />
                <div>
                  <div className="font-bold text-sm leading-none text-violet-900">Secure</div>
                  <div className="text-[10px] text-violet-600/80 font-medium mt-1 uppercase tracking-wide">Transactions</div>
                </div>
              </div>
            </div>

            {/* Product Details Action Block */}
            <div className="bg-white border border-neutral-100/80 p-6 rounded-3xl shadow-sm w-full">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => onCheckout(listingData)}
                    className="flex-1 py-3.5 bg-violet-500 text-white rounded-[16px] font-bold shadow-sm hover:bg-violet-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Package className="w-5 h-5" />
                    {listingData.offerStatus === 'approved' ? `Buy Now (₹${listingData.offerAmount?.toLocaleString()})` : 'Buy Now'}
                  </button>
                  <button
                    onClick={() => onAddToCart(listingData)}
                    className="flex-1 py-3.5 bg-white text-violet-700 border border-violet-200 rounded-[16px] font-bold shadow-sm hover:bg-violet-50 transition-all flex items-center justify-center gap-2"
                  >
                    Add to Cart
                  </button>
                </div>
                {listingData.offerStatus === 'approved' ? (
                  <div className="w-full py-3.5 bg-violet-100 text-violet-700 rounded-[16px] font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Offer Approved
                  </div>
                ) : listingData.offerStatus === 'pending' ? (
                  <div className="w-full py-3.5 bg-amber-100 text-amber-800 rounded-[16px] font-bold flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" /> Offer Pending: ₹{listingData.offerAmount?.toLocaleString()}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowOfferModal(true)}
                    className="w-full py-3.5 bg-slate-800 text-white border border-slate-700 rounded-[16px] font-bold hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2">
                    <ArrowRight className="w-5 h-5" /> Make Offer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ask AI Modal */}
      <AnimatePresence>
        {showAskAIModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => { setShowAskAIModal(false); setAiError(null); setAiResponse(null); }}
                className="absolute top-4 right-4 p-2 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">AI insight</h3>
                  <p className="text-sm text-neutral-500">Why this is a good deal for you</p>
                </div>
              </div>
              {aiLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-neutral-500 font-medium">Getting AI insight...</p>
                </div>
              )}
              {aiError && !aiLoading && (
                <div className="py-4 px-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
                  {aiError}
                </div>
              )}
              {aiResponse && !aiLoading && (
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{aiResponse}</div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => onCheckout(listing)}
          className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-100"
        >
          Buy Now – ₹{listing.price.toLocaleString()}
        </button>
      </div>

      {/* Make Offer Modal */}
      <AnimatePresence>
        {showOfferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setShowOfferModal(false)}
                className="absolute top-4 right-4 p-2 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>

              {!offerSuccess ? (
                <>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">Make an Offer</h3>
                  <p className="text-neutral-500 mb-6">Propose a new price to the seller. If approved, you can proceed with the checkout at your requested price.</p>

                  <div className="mb-6">
                    <div className="bg-neutral-50 p-4 rounded-xl flex items-center gap-4 mb-6">
                      <img src={listing.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-bold text-neutral-900">{listing.title}</h4>
                        <p className="text-sm text-neutral-500">Listed Price: ₹{listing.price.toLocaleString()}</p>
                      </div>
                    </div>

                    <form onSubmit={handleMakeOffer}>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">Your Offer Price (₹)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder="e.g. 20000"
                        className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 shadow-inner focus:outline-none font-bold text-lg mb-6"
                      />

                      <button
                        type="submit"
                        className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold shadow-lg shadow-violet-100 hover:bg-violet-700 transition-colors"
                      >
                        Send Offer to Seller
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-violet-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">Offer Sent!</h3>
                  <p className="text-neutral-500 mb-4">The seller has been notified of your ₹{Number(offerAmount).toLocaleString()} offer. We will update you if they accept.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
};

const CartPage = ({ cartItems, onCheckout, setView }: { cartItems: Listing[], onCheckout: (l: Listing) => void, setView: (v: View) => void }) => {
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <Package className="w-20 h-20 text-neutral-300 mb-6" />
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your Cart is Empty</h2>
        <p className="text-neutral-500 mb-8 max-w-sm text-center">Looks like you haven't added any items to your cart yet.</p>
        <button
          onClick={() => setView('Home')}
          className="px-8 py-4 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-100"
        >
          Browse Listings
        </button>
      </div>
    );
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Your Cart ({cartItems.length})</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-grow space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex gap-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-neutral-500 mb-2">Condition: Grade {item.condition}</p>
                    <Badge className="bg-violet-50 text-violet-700 text-xs py-0.5">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-neutral-900 text-lg">₹{item.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-neutral-900 mb-6 border-b border-neutral-100 pb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Abhirent Fee</span>
                  <span className="font-medium text-violet-600">Free</span>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4 mb-8">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-neutral-900">Total</span>
                  <span className="text-2xl font-extrabold text-neutral-900">₹{subtotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                // Checkout only the first item to maintain compatibility with single checkout flow
                onClick={() => onCheckout(cartItems[0])}
                className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-100 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = ({ listing, onComplete }: { listing: Listing, onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [addons, setAddons] = useState({
    installation: false,
    warranty: false
  });
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    pincode: '',
    house: '',
    area: ''
  });
  const [deliveryType, setDeliveryType] = useState<'normal' | 'express'>('normal');

  const addonPrices = {
    installation: 999,
    warranty: 1499,
    express: 499
  };

  const total = listing.price +
    (addons.installation ? addonPrices.installation : 0) +
    (addons.warranty ? addonPrices.warranty : 0) +
    (deliveryType === 'express' ? addonPrices.express : 0);

  const steps = ['Address', 'Delivery', 'Add-ons', 'Payment'];

  const handlePayment = () => {
    const order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      listingId: listing.id,
      title: listing.title,
      total,
      date: new Date().toISOString(),
      status: 'Abhirent Held'
    };
    const orders = JSON.parse(localStorage.getItem('abhirent_orders') || '[]');
    localStorage.setItem('abhirent_orders', JSON.stringify([...orders, order]));
    onComplete();
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 ? 'bg-violet-600 text-white' :
                  step === i + 1 ? 'bg-violet-600 text-white ring-4 ring-neutral-100' :
                    'bg-neutral-200 text-neutral-500'
                  }`}>
                  {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${step === i + 1 ? 'text-neutral-900' : 'text-neutral-400'
                  }`}>{s}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-neutral-200 rounded-full relative">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              className="absolute top-0 left-0 h-full bg-violet-600 rounded-full"
            />
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-neutral-100 shadow-xl shadow-neutral-200/50">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-neutral-900">Shipping Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-violet-500 outline-none"
                      placeholder="John Doe"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-violet-500 outline-none"
                      placeholder="+91 98765 43210"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase">House / Flat No.</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-violet-500 outline-none"
                      placeholder="Apt 402, Green Valley"
                      value={address.house}
                      onChange={(e) => setAddress({ ...address, house: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase">Area / Landmark</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-violet-500 outline-none"
                      placeholder="Near Central Park"
                      value={address.area}
                      onChange={(e) => setAddress({ ...address, area: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold mt-4"
                >
                  Continue to Delivery
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-neutral-900">Select Delivery Method</h2>
                <div className="grid gap-4">
                  {/* Express Delivery */}
                  <div
                    onClick={() => setDeliveryType('express')}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${deliveryType === 'express'
                      ? 'border-violet-600 bg-violet-50'
                      : 'border-neutral-100 hover:border-violet-200 bg-white'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${deliveryType === 'express' ? 'bg-violet-100' : 'bg-neutral-100'}`}>
                        <Zap className={`w-6 h-6 ${deliveryType === 'express' ? 'text-violet-600' : 'text-neutral-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-neutral-900">Express Delivery</h3>
                          <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Fastest</span>
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">Get it by <span className="font-bold text-neutral-900">Tomorrow, 4 PM</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">₹499</p>
                    </div>
                  </div>

                  {/* Normal Delivery */}
                  <div
                    onClick={() => setDeliveryType('normal')}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${deliveryType === 'normal'
                      ? 'border-violet-600 bg-violet-50'
                      : 'border-neutral-100 hover:border-violet-200 bg-white'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${deliveryType === 'normal' ? 'bg-violet-100' : 'bg-neutral-100'}`}>
                        <Truck className={`w-6 h-6 ${deliveryType === 'normal' ? 'text-violet-600' : 'text-neutral-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900">Standard Delivery</h3>
                        <p className="text-sm text-neutral-500 mt-1">Expected by <span className="font-bold text-neutral-900">Feb 27, Fri</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-violet-600">FREE</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 bg-neutral-100 text-neutral-600 rounded-2xl font-bold hover:bg-neutral-200 transition-all">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200">Continue</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-neutral-900">Add-ons & Protection</h2>
                <div className="space-y-4">
                  <div
                    onClick={() => setAddons({ ...addons, installation: !addons.installation })}
                    className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${addons.installation ? 'border-violet-600 bg-violet-50' : 'border-neutral-100 hover:border-violet-200'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <Package className="w-6 h-6 text-violet-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900">Professional Installation</h4>
                        <p className="text-xs text-neutral-500">Expert assembly & setup at your home</p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900">+₹{addonPrices.installation}</span>
                  </div>

                  <div
                    onClick={() => setAddons({ ...addons, warranty: !addons.warranty })}
                    className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${addons.warranty ? 'border-violet-600 bg-violet-50' : 'border-neutral-100 hover:border-violet-200'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <ShieldCheck className="w-6 h-6 text-fuchsia-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900">1-Year Extended Warranty</h4>
                        <p className="text-xs text-neutral-500">Full coverage for functional defects</p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900">+₹{addonPrices.warranty}</span>
                  </div>
                </div>

                <div className="bg-violet-600 text-white p-6 rounded-3xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium opacity-60">Live Total</span>
                    <span className="text-2xl font-extrabold">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 bg-neutral-100 text-neutral-600 rounded-2xl font-bold">Back</button>
                  <button onClick={() => setStep(4)} className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-bold">Continue</button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-neutral-900">Secure Payment</h2>
                <div className="space-y-4">
                  <div className="p-6 rounded-3xl border-2 border-violet-600 bg-violet-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-neutral-900 rounded-md flex items-center justify-center text-[10px] font-bold text-white">VISA</div>
                      <div>
                        <h4 className="font-bold text-neutral-900">Visa ending in 4242</h4>
                        <p className="text-xs text-neutral-500">Expires 12/26</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-violet-600" />
                  </div>
                  <button className="w-full py-4 border-2 border-dashed border-neutral-200 rounded-2xl text-sm font-bold text-neutral-400 hover:border-violet-200 hover:text-violet-600 transition-all">
                    + Add New Payment Method
                  </button>
                </div>

                <div className="bg-white border border-neutral-100 p-6 rounded-3xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Item Price</span>
                    <span className="font-bold text-neutral-900">₹{listing.price.toLocaleString()}</span>
                  </div>
                  {addons.installation && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Installation</span>
                      <span className="font-bold text-neutral-900">₹{addonPrices.installation}</span>
                    </div>
                  )}
                  {addons.warranty && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Warranty</span>
                      <span className="font-bold text-neutral-900">₹{addonPrices.warranty}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Delivery</span>
                    <span className="font-bold text-violet-600">FREE</span>
                  </div>
                  <div className="pt-3 border-t border-neutral-50 flex justify-between items-center">
                    <span className="font-bold text-neutral-900">Total Amount</span>
                    <span className="text-2xl font-extrabold text-neutral-900">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setStep(3)} className="flex-1 py-4 bg-neutral-100 text-neutral-600 rounded-2xl font-bold">Back</button>
                  <button
                    onClick={handlePayment}
                    className="flex-[2] py-4 bg-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all"
                  >
                    Pay ₹{total.toLocaleString()} (Held by Abhirent)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const TrackingPage = ({ orderId, onHome, onBack }: { orderId: string, onHome: () => void, onBack?: () => void }) => {
  const [currentStep, setCurrentStep] = useState(5); // Defaulting to 'Delivered' for demo
  const [isReleased, setIsReleased] = useState(false);

  // ... (rest of state logic)

  const timelineSteps = [
    { title: 'Abhirent Paid', desc: 'Payment secured by Abhirent' },
    { title: 'Pickup Scheduled', desc: 'Seller has confirmed pickup time' },
    { title: 'Item Picked Up', desc: 'Our logistics team has the item' },
    { title: 'In Transit', desc: 'Item is moving to your city hub' },
    { title: 'Out for Delivery', desc: 'Delivery partner is on the way' },
    { title: 'Delivered', desc: 'Item reached your doorstep' },
    { title: 'Delivery Confirmed', desc: 'Payment released to seller' },
  ];

  const handleConfirmDelivery = () => {
    setCurrentStep(6);
    setIsReleased(true);
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-neutral-500 hover:text-fuchsia-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </button>
        )}
        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-neutral-100 shadow-xl shadow-neutral-200/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Track Order</h1>
              <p className="text-sm text-neutral-400 font-medium">Order ID: <span className="text-neutral-900">{orderId}</span></p>
            </div>
            <Badge className={isReleased ? 'bg-violet-100 text-violet-700' : 'bg-violet-100 text-violet-700'}>
              {isReleased ? 'Abhirent Released' : 'Abhirent Hold'}
            </Badge>
          </div>

          {/* Vertical Timeline */}
          <div className="relative space-y-8">
            {/* Vertical Line */}
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-neutral-100 -z-0" />

            {timelineSteps.map((step, i) => {
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep;

              return (
                <div key={i} className="flex gap-6 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${isCompleted ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' :
                    isCurrent ? 'bg-violet-600 text-white shadow-lg shadow-violet-100 ring-4 ring-violet-50' :
                      'bg-white border-2 border-neutral-100 text-neutral-300'
                    }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div className="pt-0.5">
                    <h4 className={`font-bold transition-colors ${isCompleted ? 'text-violet-700' :
                      isCurrent ? 'text-fuchsia-900' :
                        'text-neutral-400'
                      }`}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-neutral-500 mt-1">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Area */}
          <div className="mt-12 pt-12 border-t border-neutral-50">
            {currentStep === 5 && !isReleased && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-violet-50 p-6 rounded-3xl border border-violet-100 mb-6"
              >
                <h4 className="font-bold text-violet-900 mb-2">Confirm Receipt</h4>
                <p className="text-sm text-violet-700 mb-6">
                  Please confirm if you have received the item in the described condition. This will release the payment to the seller.
                </p>
                <button
                  onClick={handleConfirmDelivery}
                  className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all"
                >
                  Confirm Delivery & Release Payment
                </button>
              </motion.div>
            )}

            {isReleased && (
              <div className="bg-violet-600 text-white p-6 rounded-3xl mb-6 text-center">
                <p className="text-sm font-medium opacity-80">Thank you for shopping with Abhirent! Your deal is complete.</p>
              </div>
            )}

            <button
              onClick={onHome}
              className="w-full py-4 bg-white text-neutral-900 border border-neutral-200 rounded-2xl font-bold hover:bg-neutral-50 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SellerDashboard = ({ onHome, setView }: { onHome: () => void, setView: (v: View) => void }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        // Backend disabled for now: using in-component mock response.
        // const response = await fetch(`${import.meta.env.BASE_URL}listings.json`);
        // const data = await response.json();
        const data = MOCK_LISTINGS;

        // Combine with local storage listings if any
        const localListings = JSON.parse(localStorage.getItem('abhirent_listings') || '[]');
        setListings([...data, ...localListings]);

        // Fetch orders
        const localOrders = JSON.parse(localStorage.getItem('abhirent_orders') || '[]');
        setOrders(localOrders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const stats = {
    total: listings.length,
    pending: listings.filter(l => !l.isVerified).length,
    verified: listings.filter(l => l.isVerified).length,
    sold: orders.length
  };

  const earnings = {
    escrow: orders.filter(o => o.status === 'Abhirent Held').reduce((acc, o) => acc + o.total, 0),
    released: orders.filter(o => o.status === 'Released').reduce((acc, o) => acc + o.total, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-fuchsia-900">Seller Dashboard</h1>
          <button
            onClick={onHome}
            className="text-sm font-medium text-fuchsia-600 hover:text-fuchsia-800 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Listings', value: stats.total, icon: <Package className="w-6 h-6 text-fuchsia-600" />, color: 'bg-fuchsia-50' },
            { label: 'Pending Verification', value: stats.pending, icon: <Clock className="w-6 h-6 text-amber-600" />, color: 'bg-amber-50' },
            { label: 'Verified Listings', value: stats.verified, icon: <CheckCircle className="w-6 h-6 text-violet-600" />, color: 'bg-violet-50' },
            { label: 'Sold Listings', value: stats.sold, icon: <TrendingUp className="w-6 h-6 text-fuchsia-600" />, color: 'bg-fuchsia-50' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setView('MyListings')}
              className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <span className="text-sm font-medium text-neutral-500">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Earnings Module */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-fuchsia-50 rounded-2xl">
                <DollarSign className="w-6 h-6 text-fuchsia-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-fuchsia-900">Held by Abhirent</h3>
                <p className="text-sm text-neutral-500">Payments held until delivery</p>
              </div>
            </div>
            <div className="text-4xl font-extrabold text-neutral-900">₹{earnings.escrow.toLocaleString()}</div>
            <div className="mt-6 flex items-center gap-2 text-sm text-amber-600 font-medium bg-amber-50 px-4 py-2 rounded-xl w-fit">
              <AlertCircle className="w-4 h-4" />
              Awaiting delivery confirmation
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-violet-50 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-fuchsia-900">Released</h3>
                <p className="text-sm text-neutral-500">Funds available in your account</p>
              </div>
            </div>
            <div className="text-4xl font-extrabold text-neutral-900">₹{earnings.released.toLocaleString()}</div>
            <div className="mt-6 flex items-center gap-2 text-sm text-violet-600 font-medium bg-violet-50 px-4 py-2 rounded-xl w-fit">
              <CheckCircle className="w-4 h-4" />
              Ready for withdrawal
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={() => setView('CreateListing')}
            className="group flex items-center gap-3 px-10 py-5 bg-violet-600 text-white rounded-3xl font-bold text-lg shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            Create New Listing
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const EditListingModal = ({ listing, onClose, onSave }: { listing: Listing, onClose: () => void, onSave: (listing: Listing) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState(() => {
    // Initialize images
    const initImages = listing.images && listing.images.length > 0
      ? [...listing.images]
      : [listing.image];

    return {
      title: listing.title,
      price: listing.price.toString(),
      originalPrice: listing.originalPrice.toString(),
      condition: listing.condition,
      description: listing.description || '',
      images: initImages.filter(Boolean), // Ensure no empty strings
    };
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      const newImagesPromises = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newImagesPromises).then(newBase64Images => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newBase64Images]
        }));
      });
    }
    // Reset inputs
    if (e.target.value) e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAIGenerate = () => {
    if (!formData.title) return;
    setIsGenerating(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        price: Math.floor(parseInt(prev.originalPrice || '20000') * 0.6).toString(),
        condition: 'A',
        description: `This meticulously maintained ${prev.title || 'item'} is practically brand new and verified for perfection. Its modern aesthetic blends seamlessly into any interior decor, offering both unparalleled style and durable functionality. Highly recommended by Gemini AI insights.`,
      }));
      setIsGenerating(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.images.length < 3) {
      alert("Please ensure at least 3 images are uploaded.");
      return;
    }

    onSave({
      ...listing,
      title: formData.title,
      price: parseInt(formData.price),
      originalPrice: parseInt(formData.originalPrice),
      condition: formData.condition as any,
      description: formData.description,
      image: formData.images[0] || listing.image, // Primary image
      images: formData.images
    });
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 bg-neutral-100 rounded-full p-2">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-between mb-6 pr-12">
          <h2 className="text-2xl font-bold text-neutral-900">Edit Listing</h2>
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={isGenerating || !formData.title}
            className="px-4 py-2 bg-gradient-to-r from-fuchsia-50 to-purple-50 text-fuchsia-700 border border-fuchsia-100 rounded-xl text-xs font-bold hover:from-fuchsia-100 hover:to-purple-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
          >
            {isGenerating ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}>
                <Sparkles className="w-3.5 h-3.5" />
              </motion.div>
            ) : <Sparkles className="w-3.5 h-3.5" />}
            {isGenerating ? 'Enhancing...' : 'Enhance with AI'}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Images Section */}
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700 block">Listing Images ({formData.images.length}/3+)</label>
                {formData.images.length < 3 && <span className="text-xs text-rose-500 font-medium">* Minimum 3 images required</span>}
             </div>
             
             <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
             />

             <div className="grid grid-cols-3 gap-3">
                {/* Upload Button */}
                <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="aspect-square rounded-xl border-2 border-dashed border-fuchsia-200 bg-fuchsia-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-fuchsia-400 hover:bg-fuchsia-50 transition-all group"
                >
                   <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-4 h-4 text-fuchsia-500" />
                   </div>
                   <p className="text-[10px] font-bold text-fuchsia-900 text-center px-1">Add Photos</p>
                </div>

                {/* Image Previews */}
                {formData.images.map((imgSrc: string, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group bg-neutral-100 border border-neutral-200">
                    <img src={imgSrc} className="w-full h-full object-cover" alt={`Listing ${idx + 1}`} referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center">
                        <span className="text-[10px] text-white font-medium">Cover</span>
                      </div>
                    )}
                  </div>
                ))}
             </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">Title</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-neutral-700">Price (₹)</label>
              <input
                type="number"
                required min="0"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-neutral-700">Original Price (₹)</label>
              <input
                type="number"
                required min="0"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500"
                value={formData.originalPrice}
                onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">Condition</label>
            <select
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500"
              value={formData.condition}
              onChange={e => setFormData({ ...formData, condition: e.target.value })}
            >
              <option value="A">{CONDITION_LABELS['A']}</option>
              <option value="B">{CONDITION_LABELS['B']}</option>
              <option value="C">{CONDITION_LABELS['C']}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">Description</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <button type="submit" className="w-full bg-violet-600 text-white rounded-xl py-3.5 font-bold mt-4 hover:bg-violet-700 transition">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
};

const StatusModal = ({ listing, onClose }: { listing: Listing, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 bg-neutral-100 rounded-full p-2">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-neutral-900 mb-8">Listing Status</h2>

        <div className="space-y-6 relative">

          <div className="flex gap-4 relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shadow-sm">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="w-0.5 h-12 bg-violet-100 my-1"></div>
            </div>
            <div className="pt-1">
              <p className="font-bold text-neutral-900">Submitted</p>
              <p className="text-xs text-neutral-500 mt-0.5">Listing created successfully.</p>
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${listing.isVerified ? 'bg-violet-100 text-violet-600' : 'bg-amber-100 text-amber-600'}`}>
                {listing.isVerified ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <div className={`w-0.5 h-12 my-1 ${listing.isVerified ? 'bg-violet-100' : 'bg-neutral-100'}`}></div>
            </div>
            <div className={`pt-1 ${listing.isVerified ? 'text-neutral-900' : 'text-amber-700'}`}>
              <p className="font-bold">Verification</p>
              <p className="text-xs opacity-80 mt-0.5">{listing.isVerified ? 'Approved and verified.' : 'Pending team review.'}</p>
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${listing.isVerified ? 'bg-violet-100 text-violet-600' : 'bg-neutral-100 text-neutral-400'}`}>
                {listing.isVerified ? <CheckCircle className="w-4 h-4" /> : <div className="w-2.5 h-2.5 bg-neutral-300 rounded-full" />}
              </div>
            </div>
            <div className={`pt-1 ${listing.isVerified ? 'text-neutral-900' : 'text-neutral-400'}`}>
              <p className="font-bold">Live Status</p>
              <p className="text-xs opacity-80 mt-0.5">{listing.isVerified ? 'Visible to buyers on platform.' : 'Waiting for verification.'}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const MyListings = ({ onHome, setView, onListingClick }: { onHome: () => void, setView: (v: View) => void, onListingClick: (listing: Listing) => void }) => {
  const [activeTab, setActiveTab] = useState<'Pending' | 'Verified' | 'Sold'>('Verified');
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [viewingStatus, setViewingStatus] = useState<Listing | null>(null);

  const handleSaveEdit = (updatedListing: Listing) => {
    // Update active list
    const updatedListings = listings.map(l => l.id === updatedListing.id ? updatedListing : l);
    setListings(updatedListings);

    // Attempt to update local storage mock copy
    const localListings = JSON.parse(localStorage.getItem('abhirent_listings') || '[]');
    const isLocal = localListings.some((l: any) => l.id === updatedListing.id);
    if (isLocal) {
      const updatedLocal = localListings.map((l: any) => l.id === updatedListing.id ? updatedListing : l);
      localStorage.setItem('abhirent_listings', JSON.stringify(updatedLocal));
    }
    setEditingListing(null);
  };

  const handleOfferAction = (listingId: number, status: 'approved' | 'rejected') => {
    const updatedListings = listings.map(l => {
      if (l.id === listingId) {
        return { ...l, offerStatus: status };
      }
      return l;
    });
    setListings(updatedListings);

    const localListings = JSON.parse(localStorage.getItem('abhirent_listings') || '[]');
    const isLocal = localListings.some((l: any) => l.id === listingId);
    if (isLocal) {
      const updatedLocal = localListings.map((l: any) =>
        l.id === listingId ? { ...l, offerStatus: status } : l
      );
      localStorage.setItem('abhirent_listings', JSON.stringify(updatedLocal));
    }
  };

  useEffect(() => {
    const loadListingsData = () => {
      try {
        const user = JSON.parse(localStorage.getItem('abhirent_user') || 'null');

        if (user && user.email === 'buyer@abhirent.com') {
          // Rahul (Buyer) has NO listings and NO sales
          setListings([]);
          setOrders([]); // Don't show purchases as sales
        } else {
          // Amit (Seller) "owns" the mocked listings for demo
          // Backend disabled for now: using in-component mock response.
          // const response = await fetch(`${import.meta.env.BASE_URL}listings.json`);
          // const data = await response.json();
          const data = MOCK_LISTINGS;
          const localListings = JSON.parse(localStorage.getItem('abhirent_listings') || '[]');
          setListings([...data, ...localListings]);

          // Only fetch orders if Seller
          const localOrders = JSON.parse(localStorage.getItem('abhirent_orders') || '[]');
          setOrders(localOrders);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadListingsData();
  }, []);

  const stats = {
    total: listings.length,
    pending: listings.filter(l => !l.isVerified).length,
    verified: listings.filter(l => l.isVerified).length,
    sold: orders.length,
    offers: listings.filter(l => l.offerStatus === 'pending').length
  };

  const earnings = {
    escrow: orders.filter(o => o.status === 'Abhirent Held').reduce((acc, o) => acc + o.total, 0),
    released: orders.filter(o => o.status === 'Released').reduce((acc, o) => acc + o.total, 0)
  };

  const filteredListings = listings.filter(l => {
    if (activeTab === 'Sold') {
      return orders.some(o => o.listingId === l.id);
    }
    if (activeTab === 'Orders' || activeTab === 'Verified') { // Wait, I need to check what logic is here? Ah, I should replace what is actually there.
      return l.isVerified && !orders.some(o => o.listingId === l.id);
    }
    if (activeTab === 'Pending') {
      return !l.isVerified && !orders.some(o => o.listingId === l.id);
    }
    return false;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-fuchsia-900 mb-2">My Listings</h1>
            <div className="flex items-center gap-3">
              <p className="text-neutral-500 text-sm">Manage and track your listed items</p>
              <Badge className={
                (localStorage.getItem('kycStatus') || 'Not Started') === 'Verified' ? 'bg-violet-100 text-violet-700' :
                  (localStorage.getItem('kycStatus') || 'Not Started') === 'Pending' ? 'bg-violet-100 text-violet-700' :
                    'bg-neutral-200 text-neutral-600'
              }>
                KYC: {localStorage.getItem('kycStatus') || 'Not Started'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('CreateListing')}
              className="px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Listing
            </button>
            <button
              onClick={onHome}
              className="text-sm font-medium text-fuchsia-600 hover:text-fuchsia-800 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {[
            { label: 'Total Listings', value: stats.total, icon: <Package className="w-6 h-6 text-fuchsia-600" />, color: 'bg-fuchsia-50' },
            { label: 'Pending Verification', value: stats.pending, icon: <Clock className="w-6 h-6 text-amber-600" />, color: 'bg-amber-50' },
            { label: 'Verified Listings', value: stats.verified, icon: <CheckCircle className="w-6 h-6 text-violet-600" />, color: 'bg-violet-50' },
            { label: 'Sold Listings', value: stats.sold, icon: <TrendingUp className="w-6 h-6 text-fuchsia-600" />, color: 'bg-fuchsia-50' },
            { label: 'Active Offers', value: stats.offers, icon: <DollarSign className="w-6 h-6 text-purple-600" />, color: 'bg-purple-50' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${stat.color}`}>
                  {stat.icon}
                </div>
                <span className="text-sm font-medium text-neutral-500">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Earnings Module */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-fuchsia-50 rounded-2xl">
                <DollarSign className="w-6 h-6 text-fuchsia-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-fuchsia-900">Held by Abhirent</h3>
                <p className="text-sm text-neutral-500">Payments held until delivery</p>
              </div>
            </div>
            <div className="text-4xl font-extrabold text-neutral-900">₹{earnings.escrow.toLocaleString()}</div>
            <div className="mt-6 flex items-center gap-2 text-sm text-amber-600 font-medium bg-amber-50 px-4 py-2 rounded-xl w-fit">
              <AlertCircle className="w-4 h-4" />
              Awaiting delivery confirmation
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-violet-50 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-fuchsia-900">Released</h3>
                <p className="text-sm text-neutral-500">Funds available in your account</p>
              </div>
            </div>
            <div className="text-4xl font-extrabold text-neutral-900">₹{earnings.released.toLocaleString()}</div>
            <div className="mt-6 flex items-center gap-2 text-sm text-violet-600 font-medium bg-violet-50 px-4 py-2 rounded-xl w-fit">
              <CheckCircle className="w-4 h-4" />
              Ready for withdrawal
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-neutral-200/50 rounded-2xl mb-8 w-fit">
          {(['Pending', 'Verified', 'Sold'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab
                ? 'bg-white text-violet-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
                }`}
            >
              {tab === 'Pending' ? 'Pending Verification' : tab}
            </button>
          ))}
        </div>

        {/* Listings List */}
        <div className="space-y-4 w-full">
          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-[32px] p-16 text-center border border-neutral-100 shadow-sm">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">No {activeTab.toLowerCase()} listings found</h3>
              <p className="text-neutral-500 max-w-xs mx-auto">Items you list will appear here once they match this status.</p>
            </div>
          ) : (
            filteredListings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-4 sm:p-6 border border-neutral-100 shadow-sm flex flex-col sm:flex-row gap-6 items-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onListingClick(listing)}
              >
                <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-grow text-center sm:text-left">
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-2">
                    <Badge className={
                      activeTab === 'Sold' ? 'bg-fuchsia-100 text-fuchsia-700' :
                        listing.isVerified ? 'bg-violet-100 text-violet-700' :
                          'bg-amber-100 text-amber-700'
                    }>
                      {activeTab === 'Sold' ? 'Sold' : (listing.isVerified ? 'Verified' : 'Pending')}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs font-medium text-neutral-400">
                      <Eye className="w-3 h-3" />
                      {Math.floor(Math.random() * 500) + 50} views
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">{listing.title}</h3>
                  <p className="text-xl font-extrabold text-fuchsia-600">₹{listing.price.toLocaleString()}</p>
                </div>

                <div className="flex flex-col gap-3 w-full sm:w-auto items-end">
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewingStatus(listing); }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-100 flex items-center justify-center gap-2"
                    >
                      View Status
                    </button>
                  </div>
                  {listing.offerStatus === 'pending' && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl w-full sm:w-80 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                        <Clock className="w-4 h-4" /> Offer Received: ₹{listing.offerAmount?.toLocaleString()}
                      </div>
                      <div className="bg-white/60 p-2.5 rounded-xl text-xs space-y-1.5 border border-amber-100">
                        <div className="font-bold text-amber-900">Buyer Details:</div>
                        <div className="flex items-center gap-1.5 text-amber-800">
                          <User className="w-3.5 h-3.5" />
                          <span className="font-medium">{listing.offerBuyerName || 'Rahul Sharma'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-800">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{listing.offerBuyerCity || 'Lucknow'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-800">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{listing.offerBuyerPhone || '+91 98*** *****'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full mt-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOfferAction(listing.id, 'approved'); }}
                          className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOfferAction(listing.id, 'rejected'); }}
                          className="flex-1 py-1.5 bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg text-sm font-bold transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}
                  {listing.offerStatus === 'approved' && (
                    <div className="w-full sm:w-auto py-2 px-4 bg-violet-100 text-violet-800 border border-violet-200 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-sm">
                      <CheckCircle2 className="w-4 h-4" /> Offer Accepted (₹{listing.offerAmount?.toLocaleString()})
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modals outside main scroll flow */}
      <AnimatePresence>
        {editingListing && (
          <EditListingModal
            listing={editingListing}
            onClose={() => setEditingListing(null)}
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingStatus && (
          <StatusModal
            listing={viewingStatus}
            onClose={() => setViewingStatus(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CreateListingPage = ({ onBack, onComplete }: { onBack: () => void, onComplete: () => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    originalPrice: '',
    category: 'furniture',
    subCategory: '',
    condition: 'A' as 'A' | 'B' | 'C',
    city: 'Lucknow',
    description: '',
    deliveryAvailable: true,
    purchaseYear: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const cities = ['Lucknow'];
  const categories = ['furniture', 'appliances'];

  const handleAIPriceSuggestion = () => {
    if (!formData.originalPrice || !formData.purchaseYear || !formData.condition) {
      alert("Please fill in Original Price, Purchase Year and Condition for accurate suggestion.");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      // Logic for price suggestion
      const original = parseInt(formData.originalPrice) || 0;
      const year = parseInt(formData.purchaseYear) || new Date().getFullYear();
      const age = new Date().getFullYear() - year;

      let conditionFactor = 0.5;
      if (formData.condition === 'A') conditionFactor = 0.7; // Brand new like
      if (formData.condition === 'B') conditionFactor = 0.5; // Like new
      if (formData.condition === 'C') conditionFactor = 0.3; // Lightly used

      const depreciation = age * 0.05; // 5% per year
      const factor = Math.max(0.1, conditionFactor - depreciation);

      const suggestedPrice = Math.round(original * factor / 100) * 100; // Round to nearest 100

      setFormData(prev => ({
        ...prev,
        price: suggestedPrice.toString(),
      }));
      setIsGenerating(false);
    }, 1500);
  };

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      const newImageUrls = newFiles.map((file: File) => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImageUrls]);
    }
    // Reset input so same file can be selected again if needed
    if (e.target.value) e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length < 3) {
      alert("Please upload at least 3 images.");
      return;
    }

    const newListing: Listing = {
      id: Date.now(),
      title: formData.title,
      price: parseInt(formData.price),
      originalPrice: parseInt(formData.originalPrice),
      image: images[0] || 'https://picsum.photos/seed/new-item/600/500', // Fallback if no image
      isVerified: false, // New listings start as unverified
      deliveryAvailable: formData.deliveryAvailable,
      condition: formData.condition,
      brand: 'Generic', // Simplified for demo
      aiDealTag: 'Fair',
      deliveryEta: '3-5 Days',
      city: formData.city,
      category: formData.category,
      subCategory: formData.subCategory
    };

    const localListings = JSON.parse(localStorage.getItem('abhirent_listings') || '[]');
    localStorage.setItem('abhirent_listings', JSON.stringify([...localListings, newListing]));

    onComplete();
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-500 hover:text-fuchsia-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-neutral-100 shadow-xl shadow-neutral-200/50">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-fuchsia-900 mb-2">Create New Listing</h1>
            <p className="text-neutral-500">Fill in the details to list your item for verification.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
  
            {/* Image Upload - Single Field */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Product Photos ({images.length}/3+)</label>
                {images.length < 3 && <span className="text-xs text-rose-500 font-medium">* Minimum 3 images required</span>}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                multiple
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                 {/* Upload Button */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-3xl border-2 border-dashed border-fuchsia-200 bg-fuchsia-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-fuchsia-400 hover:bg-fuchsia-50 transition-all group overflow-hidden relative"
                  >
                     <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-fuchsia-500" />
                     </div>
                     <p className="text-sm font-bold text-fuchsia-900">Click to Upload</p>
                     <p className="text-xs text-fuchsia-600/70 mt-1">supports multiple files</p>
                  </div>

                {/* Image Previews */}
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="aspect-video rounded-3xl bg-neutral-100 overflow-hidden relative shadow-sm group"
                  >
                    <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold text-white backdrop-blur-sm">
                      Photo {index + 1}
                    </div>
                  </div>
                ))}
            </div>
           </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Item Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. IKEA 3-Seater Leather Sofa"
                  className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                >
                  {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Original Price (₹)</label>
                <input
                  required
                  type="number"
                  value={formData.originalPrice}
                  onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="55000"
                  className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Purchase Year</label>
                <input
                  required
                  type="number"
                  value={formData.purchaseYear}
                  onChange={e => setFormData({ ...formData, purchaseYear: e.target.value })}
                  placeholder="2023"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Your Price (₹)</label>
                <input
                  required
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Enter Price"
                  className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                />
                
                {(formData.originalPrice && formData.purchaseYear) ? (
                   <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAIPriceSuggestion}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}>
                            <Sparkles className="w-3.5 h-3.5" />
                          </motion.div>
                        ) : <Sparkles className="w-3.5 h-3.5" />}
                        {isGenerating ? 'Calculating...' : 'Get AI Price Suggestion'}
                      </button>
                   </div>
                ) : (
                  <p className="text-xs text-neutral-400 pl-1">
                   Fill original price & year to enable AI suggestion
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">City</label>
                <select
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                >
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Condition</label>
                <div className="flex gap-2">
                  {(['A', 'B', 'C'] as const).map(grade => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setFormData({ ...formData, condition: grade })}
                      className={`flex-1 py-4 rounded-2xl font-bold transition-all border ${formData.condition === grade
                        ? 'bg-violet-600 border-violet-600 text-white'
                        : 'bg-neutral-50 border-neutral-100 text-neutral-500 hover:bg-neutral-100'
                        }`}
                    >
                      {CONDITION_LABELS[grade]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the item's condition, age, and any defects..."
                className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
              <div>
                <h4 className="font-bold text-neutral-900">Delivery Available</h4>
                <p className="text-xs text-neutral-500">We'll handle pickup and delivery for you</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, deliveryAvailable: !formData.deliveryAvailable })}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.deliveryAvailable ? 'bg-violet-600' : 'bg-neutral-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.deliveryAvailable ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-violet-600 text-white rounded-[24px] font-bold text-lg shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all active:scale-[0.98]"
            >
              Submit for Verification
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const SuccessPage = ({ onHome, onTrack }: { onHome: () => void, onTrack: () => void }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="relative inline-block">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="w-12 h-12 text-violet-600" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-violet-400 rounded-full -z-10"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-neutral-900">Payment Secured!</h1>
          <p className="text-neutral-500 leading-relaxed">
            Your payment is now held safely by Abhirent. We've notified the seller and our logistics team.
          </p>
        </div>

        <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 text-left space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-400 uppercase">Order Status</span>
            <Badge className="bg-violet-100 text-violet-700">Abhirent Held</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-400 uppercase">Estimated Delivery</span>
            <span className="text-sm font-bold text-neutral-900">Feb 24, 10 AM - 1 PM</span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={onTrack}
            className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold premium-shadow"
          >
            Track Order
          </button>
          <button
            onClick={onHome}
            className="w-full py-4 text-violet-600 font-bold mt-2"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const OrderDetailPage = ({ orderId, onBack, onTrack }: { orderId: string, onBack: () => void, onTrack: (id: string) => void }) => {
  // Mock getting order details. In real app, fetch by ID.
  const order = JSON.parse(localStorage.getItem('abhirent_orders') || '[]').find((o: any) => o.id === orderId) || {
    id: orderId,
    title: 'Unknown Item',
    total: 0,
    status: 'Unknown',
    listingId: 0
  };

  return (
    <div className="bg-neutral-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-500 hover:text-fuchsia-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </button>

        <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-xl shadow-neutral-200/50">
          <div className="flex justify-between items-start mb-8 pb-8 border-b border-neutral-100">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Order Details</h1>
              <p className="text-neutral-500">Order ID: <span className="font-mono text-neutral-900">{order.id}</span></p>
            </div>
            <Badge className={order.status === 'Abhirent Held' ? 'bg-violet-100 text-violet-700' : 'bg-violet-100 text-violet-700'}>
              {order.status}
            </Badge>
          </div>

          <div className="flex gap-6 mb-8">
            <div className="w-24 h-24 bg-neutral-100 rounded-2xl overflow-hidden shrink-0">
              <img
                src={`https://picsum.photos/seed/${order.listingId}/200/200`}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-1">{order.title}</h2>
              <p className="text-neutral-500 text-sm mb-4">Quantity: 1</p>
              <div className="text-2xl font-bold text-fuchsia-900">₹{order.total.toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-4 border-t border-neutral-100 pt-8">
            <h3 className="font-bold text-neutral-900">Payment Breakdown</h3>
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>₹{order.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Abhirent Protection Fee</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-neutral-900 pt-4 border-t border-dashed border-neutral-200">
              <span>Total Paid</span>
              <span>₹{order.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-neutral-100 flex justify-end">
            <button
              onClick={() => onTrack(order.id)}
              className="px-8 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = ({ onTrack, onDetails }: { onTrack: (orderId: string) => void, onDetails?: (orderId: string) => void }) => {
  const [orders, setOrders] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem('abhirent_orders') || '[]');
  });

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-900">My Orders</h1>
          <Badge className="bg-violet-600 text-white">{orders.length} Orders</Badge>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center border border-neutral-100 shadow-sm">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-neutral-300" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No orders yet</h3>
            <p className="text-neutral-500 mb-8">Looks like you haven't made any purchases yet.</p>
            <button
              className="px-8 py-3 bg-violet-600 text-white rounded-xl font-bold shadow-lg shadow-violet-100"
              onClick={() => window.location.reload()} // Simple way to go back to home if needed, but setView is better
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
              >
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-neutral-100 rounded-2xl overflow-hidden shrink-0">
                    <img
                      src={`https://picsum.photos/seed/${order.listingId}/200/200`}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">{order.title}</h3>
                    <p className="text-xs text-neutral-400 font-medium mb-2">Order ID: {order.id}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-extrabold text-neutral-900">₹{order.total.toLocaleString()}</span>
                      <Badge className={order.status === 'Abhirent Held' ? 'bg-violet-100 text-violet-700' : 'bg-violet-100 text-violet-700'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => onTrack(order.id)}
                    className="flex-1 sm:flex-none px-6 py-3 bg-violet-600 text-white rounded-xl font-bold text-sm"
                  >
                    Track Order
                  </button>
                  {onDetails && (
                    <button
                      onClick={() => onDetails(order.id)}
                      className="flex-1 sm:flex-none px-6 py-3 bg-white text-neutral-900 border border-neutral-200 rounded-xl font-bold text-sm hover:bg-neutral-50 transition-colors"
                    >
                      Details
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SellerKYCPage = ({ onBack, setView }: { onBack: () => void, setView: (v: View) => void }) => {
  const [kycStatus, setKycStatus] = useState<'Not Started' | 'Pending' | 'Verified'>(() => {
    return (localStorage.getItem('kycStatus') as any) || 'Not Started';
  });

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [bankDetails, setBankDetails] = useState({ name: '', number: '', ifsc: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setShowOtp(true);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 4) {
      setPhoneVerified(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneVerified) {
      alert("Please verify your phone number first.");
      return;
    }
    setKycStatus('Verified');
    localStorage.setItem('kycStatus', 'Verified');
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setView('MyListings');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm relative overflow-hidden">
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">KYC Verified Successfully</h3>
              <p className="text-neutral-500">Redirecting to your dashboard...</p>
            </motion.div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">Seller KYC</h1>
            <Badge className={
              kycStatus === 'Verified' ? 'bg-violet-100 text-violet-700' :
                kycStatus === 'Pending' ? 'bg-violet-100 text-violet-700' :
                  'bg-neutral-100 text-neutral-700'
            }>
              {kycStatus === 'Verified' ? 'Verified' : kycStatus === 'Pending' ? 'Pending' : 'Not Started'}
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-neutral-900 border-b pb-2">1. Phone Verification</h2>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={phoneVerified || kycStatus === 'Verified'}
                    className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:opacity-50"
                    required
                  />
                  {!phoneVerified && kycStatus !== 'Verified' && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-colors"
                    >
                      Send OTP
                    </button>
                  )}
                </div>

                {showOtp && !phoneVerified && kycStatus !== 'Verified' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-3 overflow-hidden">
                    <input
                      type="text"
                      placeholder="Enter 4-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={4}
                      className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-colors whitespace-nowrap"
                    >
                      Verify
                    </button>
                  </motion.div>
                )}
                {(phoneVerified || kycStatus === 'Verified') && (
                  <p className="text-violet-600 text-sm font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Phone Verified
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-neutral-900 border-b pb-2">2. Identity Proof Upload</h2>
              <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-8 text-center bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-not-allowed">
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-900 font-medium mb-1">Upload Aadhaar or PAN Card</p>
                <p className="text-neutral-500 text-sm mb-4">Click to browse or drag and drop</p>
                <div className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 inline-block shadow-sm">
                  (Mock Upload - For Preview Only)
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-neutral-900 border-b pb-2">3. Bank Account Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={bankDetails.name}
                    onChange={(e) => setBankDetails({ ...bankDetails, name: e.target.value })}
                    disabled={kycStatus === 'Verified'}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:opacity-50"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Account Number"
                  value={bankDetails.number}
                  onChange={(e) => setBankDetails({ ...bankDetails, number: e.target.value })}
                  disabled={kycStatus === 'Verified'}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:opacity-50"
                  required
                />
                <input
                  type="text"
                  placeholder="IFSC Code"
                  value={bankDetails.ifsc}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                  disabled={kycStatus === 'Verified'}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={(!phoneVerified && kycStatus !== 'Verified') || kycStatus === 'Verified'}
                className="w-full px-8 py-4 bg-violet-600 text-white rounded-xl font-bold text-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-100"
              >
                {kycStatus === 'Verified' ? 'KYC Already Completed' : 'Complete KYC'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Login Page ---

const LoginPage = ({ onLogin, onRegister }: { onLogin: (user: UserType) => void, onRegister?: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Buyer');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Login auth check skipped for offline mode.
    // if (email === 'buyer@abhirent.com' && password === 'buyer123') {
    //   onLogin({ name: 'Rahul Buyer', email: 'buyer@abhirent.com', role: 'Buyer' });
    // } else if (email === 'seller@abhirent.com' && password === 'seller123') {
    //   onLogin({ name: 'Amit Seller', email: 'seller@abhirent.com', role: 'Seller' });
    // } else {
    //   setError('Invalid email or password. Try buyer@abhirent.com / buyer123 or seller@abhirent.com / seller123');
    // }
    onLogin({
      name: role === 'Seller' ? 'Amit Seller' : 'Rahul Buyer',
      email: email.trim() || (role === 'Seller' ? 'seller@abhirent.com' : 'buyer@abhirent.com'),
      role
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-8 sm:p-12 w-full max-w-md border border-neutral-100 shadow-xl shadow-neutral-200/50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mb-4 text-white">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome Back</h1>
          <p className="text-neutral-500">Login to your Abhirent account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 border border-rose-100 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-violet-600 focus:ring-violet-500" />
              <span className="text-neutral-600 font-medium">Remember me</span>
            </label>
            <button type="button" className="font-bold text-violet-600 hover:text-violet-700">Forgot Password?</button>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-neutral-500">Don't have an account? <button className="font-bold text-violet-600 hover:text-violet-700">Create Account</button></p>
        </div>
        <div className="mt-6 p-4 bg-neutral-50 rounded-xl text-xs text-neutral-500 space-y-1">
          <p className="font-bold uppercase tracking-wider text-neutral-400 mb-2">Demo Credentials:</p>
          <div className="flex justify-between">
            <span>Buyer:</span> <span className="font-mono text-neutral-700">buyer@abhirent.com / buyer123</span>
          </div>
          <div className="flex justify-between">
            <span>Seller:</span> <span className="font-mono text-neutral-700">seller@abhirent.com / seller123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ onBack }: { onBack: () => void }) => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'johndoe@abhirent.com',
    phone: '',
    address: '',
    city: 'Lucknow',
    pincode: '',
    bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('abhirent_user_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('abhirent_user_profile', JSON.stringify(profile));
      setIsSaving(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-500 hover:text-violet-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-neutral-100 shadow-xl shadow-neutral-200/50">
          <div className="mb-8 flex items-center gap-6">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold text-3xl">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">My Profile</h1>
              <p className="text-neutral-500">Manage your personal information and preferences.</p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-violet-50 text-violet-700 rounded-xl flex items-center gap-2 border border-violet-100">
              <ShieldCheck className="w-5 h-5" /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Address</label>
              <textarea
                rows={3}
                required
                placeholder="Enter your full address"
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">City</label>
                <div className="relative">
                  <select
                    value={profile.city}
                    onChange={e => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {['Lucknow'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-neutral-700 uppercase tracking-wider">Pincode</label>
                <input
                  type="text"
                  required
                  placeholder="110001"
                  value={profile.pincode}
                  onChange={e => setProfile({ ...profile, pincode: e.target.value })}
                  className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold text-lg hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const HistoryPage = ({ onBack, onListingClick }: { onBack: () => void, onListingClick: (l: Listing) => void }) => {
  // Mock history data - in a real app this would come from local storage or API
  const historyListings: Listing[] = [
    {
      id: 201,
      title: 'LG 7kg Front Load Washing Machine',
      price: 15000,
      originalPrice: 32000,
      image: `${import.meta.env.BASE_URL}lg_washer.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'A',
      brand: 'LG',
      aiDealTag: 'Fair',
      deliveryEta: '2 Days',
      city: 'Lucknow',
      category: 'appliances'
    },
    {
      id: 202,
      title: 'IKEA 3-Seater Fabric Sofa',
      price: 12000,
      originalPrice: 28000,
      image: `${import.meta.env.BASE_URL}ikea_sofa.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'B',
      brand: 'IKEA',
      aiDealTag: 'Great Deal',
      deliveryEta: '4 Days',
      city: 'Mumbai',
      category: 'furniture'
    },
    {
      id: 203,
      title: 'Wooden Study Desk',
      price: 4500,
      originalPrice: 12000,
      image: `${import.meta.env.BASE_URL}study_desk.png`,
      isVerified: true,
      deliveryAvailable: false,
      condition: 'A',
      brand: 'Generic',
      aiDealTag: 'Great Deal',
      deliveryEta: '1 Day',
      city: 'Pune',
      category: 'furniture'
    },
    {
      id: 204,
      title: 'Daikin 1.5 Ton Split AC',
      price: 21000,
      originalPrice: 42000,
      image: `${import.meta.env.BASE_URL}daikin_ac.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'B',
      brand: 'Daikin',
      aiDealTag: 'Fair',
      deliveryEta: '3 Days',
      city: 'Bangalore',
      category: 'appliances'
    },
    {
      id: 205,
      title: 'Sony Bravia 55 inch 4K TV',
      price: 45000,
      originalPrice: 85000,
      image: `${import.meta.env.BASE_URL}sony_tv.png`,
      isVerified: true,
      deliveryAvailable: true,
      condition: 'A',
      brand: 'Sony',
      aiDealTag: 'Great Deal',
      deliveryEta: '2 Days',
      city: 'Lucknow',
      category: 'electronics'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-500 hover:text-violet-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-fuchsia-100 rounded-2xl text-fuchsia-600">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Browsing History</h1>
            <p className="text-neutral-500">Items you've viewed recently.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {historyListings.map((listing) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
              onClick={() => onListingClick(listing)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {listing.isVerified && (
                    <Badge className="bg-white/90 backdrop-blur text-violet-600 border border-violet-100">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-neutral-900 group-hover:text-violet-600 transition-colors line-clamp-1">{listing.title}</h3>
                    <p className="text-xs text-neutral-500">{listing.condition === 'A' ? 'Like New' : listing.condition === 'B' ? 'Good' : 'Fair'} • {listing.brand}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-neutral-900">₹{listing.price.toLocaleString()}</span>
                    <span className="text-xs text-neutral-400 line-through">₹{listing.originalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-500 pt-3 border-t border-neutral-50 mt-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {(listing.city && listing.city.toLowerCase() !== 'lucknow') ? 'Lucknow' : (listing.city || 'Lucknow')}
                  </div>
                  {listing.deliveryAvailable && (
                    <div className="flex items-center gap-1 text-violet-600">
                      <Truck className="w-3 h-3" /> Delivery in {listing.deliveryEta}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SupportPage = ({ onBack, initialSection = 'FAQ' }: { onBack: () => void, initialSection?: string }) => {
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const sections = [
    { id: 'FAQ', label: 'FAQ', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'Contact', label: 'Contact Us', icon: <PhoneCall className="w-5 h-5" /> },
    { id: 'Privacy', label: 'Privacy Policy', icon: <Lock className="w-5 h-5" /> },
    { id: 'Terms', label: 'Terms of Service', icon: <ShieldCheck className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-500 hover:text-violet-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
            <h2 className="text-xl font-bold text-neutral-900 mb-6 px-4">Support Center</h2>
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeSection === section.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                  : 'text-neutral-600 hover:bg-white hover:shadow-sm'
                  }`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-grow bg-white rounded-[32px] p-8 md:p-12 border border-neutral-100 shadow-xl shadow-neutral-200/50 min-h-[500px]">
            {activeSection === 'FAQ' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {[
                    { q: 'How does verification work?', a: 'Our team physically inspects every item listed on Abhirent to ensure quality and condition match the description.' },
                    { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, and Net Banking. All payments are held in escrow until delivery.' },
                    { q: 'Can I return an item?', a: 'Yes, you have a 48-hour inspection window after delivery. If the item doesn\'t match the description, you can return it for a full refund.' },
                    { q: 'How long does delivery take?', a: 'Verified items are typically delivered within 24-48 hours depending on your location.' }
                  ].map((faq, i) => (
                    <div key={i} className="pb-6 border-b border-neutral-100 last:border-0">
                      <h3 className="font-bold text-neutral-900 mb-2">{faq.q}</h3>
                      <p className="text-neutral-500 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'Contact' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact Us</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <Phone className="w-6 h-6 text-violet-600 mb-4" />
                    <h3 className="font-bold text-neutral-900 mb-1">Phone Support</h3>
                    <p className="text-neutral-500 text-sm mb-2">Mon-Fri, 9am - 6pm</p>
                    <p className="font-bold text-lg">+91 1800-123-4567</p>
                  </div>
                  <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <MessageCircle className="w-6 h-6 text-violet-600 mb-4" />
                    <h3 className="font-bold text-neutral-900 mb-1">Email Support</h3>
                    <p className="text-neutral-500 text-sm mb-2">Typically replies in 2 hours</p>
                    <p className="font-bold text-lg">support@abhirent.com</p>
                  </div>
                </div>

                <form className="space-y-4">
                  <h3 className="font-bold text-neutral-900">Send us a message</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Name" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" />
                    <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" />
                  </div>
                  <textarea rows={4} placeholder="How can we help?" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none resize-none"></textarea>
                  <button type="button" className="px-8 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors">Send Message</button>
                </form>
              </div>
            )}

            {activeSection === 'Privacy' && (
              <div className="prose prose-neutral max-w-none">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Privacy Policy</h2>
                <div className="space-y-4 text-neutral-500 leading-relaxed">
                  <p>At Abhirent, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal information.</p>

                  <h3 className="text-lg font-bold text-neutral-900 mt-6 mb-2">Information We Collect</h3>
                  <p>We collect information you provide directly to us, such as when you create an account, list an item regarding transaction, or contact customer support.</p>

                  <h3 className="text-lg font-bold text-neutral-900 mt-6 mb-2">How We Use Your Information</h3>
                  <p>We use the information we collect to operate, maintain, and improve our services, to process transactions, and to communicate with you.</p>

                  <h3 className="text-lg font-bold text-neutral-900 mt-6 mb-2">Data Security</h3>
                  <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access or disclosure.</p>
                </div>
              </div>
            )}

            {activeSection === 'Terms' && (
              <div className="prose prose-neutral max-w-none">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Terms of Service</h2>
                <div className="space-y-4 text-neutral-500 leading-relaxed">
                  <p>Welcome to Abhirent. By using our services, you agree to these Terms of Service. Please read them carefully.</p>

                  <h3 className="text-lg font-bold text-neutral-900 mt-6 mb-2">Acceptance of Terms</h3>
                  <p>By accessing or using our platform, you agree to be bound by these Terms and our Privacy Policy.</p>

                  <h3 className="text-lg font-bold text-neutral-900 mt-6 mb-2">User Conduct</h3>
                  <p>You agree not to misuse our services or help anyone else do so. You are responsible for all activity in connection with your account.</p>

                  <h3 className="text-lg font-bold text-neutral-900 mt-6 mb-2">Termination</h3>
                  <p>We reserve the right to suspend or terminate your access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Route wrappers (resolve params/state and render page components) ---
function ProductDetailRoute({ onCheckout, onAddToCart }: { onCheckout: (l: Listing) => void; onAddToCart: (l: Listing) => void }) {
  const { id } = useParams<{ id: string; product_name: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>((location.state as { listing?: Listing })?.listing ?? null);
  const [loading, setLoading] = useState(!listing);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (listing) {
      setLoading(false);
      return;
    }
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    let cancelled = false;
    try {
      // Backend disabled for now: using in-component mock response.
      // fetch(`${import.meta.env.BASE_URL}listings.json`)
      //   .then((r) => r.json())
      //   .then((data: Listing[]) => {
      //     if (cancelled) return;
      //     const found = data.find((l) => l.id === Number(id));
      //     if (found) setListing(found);
      //     else setNotFound(true);
      //   })
      //   .catch(() => { if (!cancelled) setNotFound(true); })
      //   .finally(() => { if (!cancelled) setLoading(false); });
      const localListings = JSON.parse(localStorage.getItem('abhirent_listings') || '[]');
      const data: Listing[] = [...MOCK_LISTINGS, ...localListings];
      const found = data.find((l) => l.id === Number(id));
      if (!cancelled) {
        if (found) setListing(found);
        else setNotFound(true);
      }
    } catch {
      if (!cancelled) setNotFound(true);
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => { cancelled = true; };
  }, [id, listing]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (notFound || !listing) return <div className="flex h-screen items-center justify-center text-neutral-500">Product not found.</div>;
  return <ListingDetailPage listing={listing} onCheckout={onCheckout} onAddToCart={onAddToCart} onBack={() => navigate(-1)} />;
}

function CheckoutRoute({ onComplete }: { onComplete: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const listing = (location.state as { listing?: Listing })?.listing;
  useEffect(() => { if (!listing) navigate('/products', { replace: true }); }, [listing, navigate]);
  if (!listing) return null;
  return <CheckoutPage listing={listing} onComplete={onComplete} />;
}

/** Path-based category browse: /category/:categoryName/:menu/:sub/:city */
function CategoryBrowseRoute({
  onListingClick,
  onCategoryChange,
  selectedCityFallback,
  defaultCity
}: {
  onListingClick: (l: Listing) => void;
  onCategoryChange: (category: string, menuId?: string, subCategory?: string) => void;
  selectedCityFallback: string;
  defaultCity: string;
}) {
  const { categoryName, menu, sub, city } = useParams<{ categoryName?: string; menu?: string; sub?: string; city?: string }>();
  const category = categoryName || null;
  const menuId = menu && menu !== 'all' ? menu : 'all';
  const subSlug = sub && sub !== 'all' ? sub : null;
  const cityDisplay = city ? city.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : (selectedCityFallback || defaultCity);
  return (
    <BrowsePage
      onListingClick={onListingClick}
      selectedCity={cityDisplay}
      selectedCategory={category}
      onCategoryChange={onCategoryChange}
      initialMenuId={menuId}
      initialSubCategory={subSlug}
      searchTerm=""
    />
  );
}

function SuccessRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = (location.state as { orderId?: string })?.orderId ?? 'ORD-UNKNOWN';
  return <SuccessPage onHome={() => navigate('/')} onTrack={() => navigate(`/tracking/${orderId}`)} />;
}

function OrderDetailRoute({ onTrack }: { onTrack: (id: string) => void }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return <OrderDetailPage orderId={id ?? ''} onBack={() => navigate('/orders')} onTrack={onTrack} />;
}

function TrackingRoute() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  return <TrackingPage orderId={orderId ?? 'ORD-UNKNOWN'} onHome={() => navigate('/')} onBack={() => navigate('/orders')} />;
}

function LoginDisabledRoute({ onBlocked }: { onBlocked: () => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    onBlocked();
    navigate('/', { replace: true });
  }, [navigate, onBlocked]);

  return null;
}

const VIEW_TO_PATH: Record<View, string> = {
  Home: '/',
  Browse: '/products',
  Detail: '/',
  Cart: '/cart',
  Checkout: '/checkout',
  Success: '/success',
  Tracking: '/tracking',
  Orders: '/orders',
  OrderDetails: '/orders',
  MyListings: '/seller',
  SellerKYC: '/seller/kyc',
  CreateListing: '/sell',
  Profile: '/profile',
  History: '/history',
  Support: '/support',
  Login: '/login',
  SellerDashboard: '/seller'
};

export default function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isOpen: isComingSoonOpen, open: openComingSoonModal, close: closeComingSoonModal } = useComingSoonModal();

  const [selectedCity, setSelectedCity] = useState('Lucknow');
  const [user, setUser] = useState<UserType | null>(null);
  const [cart, setCart] = useState<Listing[]>([]);

  const setView = (v: View) => {
    if (v === 'CreateListing' || v === 'Login') {
      openComingSoonModal();
      return;
    }
    // Authentication gate skipped for offline mode.
    // if (v === 'CreateListing' && !user) {
    //   navigate('/login');
    //   return;
    // }
    const path = VIEW_TO_PATH[v];
    if (path) navigate(path);
  };

  const handleLogin = (newUser: UserType) => {
    setUser(newUser);
    localStorage.setItem('abhirent_user', JSON.stringify(newUser));
    if (newUser.email === 'seller@abhirent.com') {
      localStorage.removeItem('abhirent_orders');
    } else if (newUser.email === 'buyer@abhirent.com') {
      const mockOrders = [
        { id: 'ORD-BUY-001', listingId: 101, title: 'LG Washer Front Load', total: 15000, status: 'Shipped' },
        { id: 'ORD-BUY-002', listingId: 202, title: 'IKEA 3-Seater Sofa', total: 12000, status: 'Abhirent Held' }
      ];
      localStorage.setItem('abhirent_orders', JSON.stringify(mockOrders));
    }
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('abhirent_user');
    navigate('/');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('abhirent_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSupportClick = (section: string) => {
    navigate(`/support?section=${encodeURIComponent(section)}`);
    window.scrollTo(0, 0);
  };

  const handleListingClick = (listing: Listing) => {
    navigate(`/product/${listing.id}/${productSlug(listing.title)}`, { state: { listing } });
    window.scrollTo(0, 0);
  };

  const handleCheckout = (listing: Listing) => {
    openComingSoonModal();
    return;
    // Authentication gate skipped for offline mode.
    // if (!user) {
    //   navigate('/login');
    //   return;
    // }
    navigate('/checkout', { state: { listing } });
    window.scrollTo(0, 0);
  };

  const handleSearch = (term: string) => {
    if (term.trim() !== '') {
      const params = new URLSearchParams(searchParams);
      params.set('search', term);
      params.set('city', selectedCity);
      navigate(`/products?${params.toString()}`);
    }
  };

  const handleAddToCart = (listing: Listing) => {
    openComingSoonModal();
    return;
    // Authentication gate skipped for offline mode.
    // if (!user) {
    //   navigate('/login');
    //   return;
    // }
    setCart((prev) => (prev.some((item) => item.id === listing.id) ? prev : [...prev, listing]));
    navigate('/cart');
    window.scrollTo(0, 0);
  };

  const handleOrderComplete = () => {
    const orders = JSON.parse(localStorage.getItem('abhirent_orders') || '[]');
    const lastOrder = orders[orders.length - 1];
    const orderId = lastOrder?.id ?? 'ORD-TEST-123';
    navigate('/success', { state: { orderId } });
    window.scrollTo(0, 0);
  };

  const handleTrackOrder = (orderId: string) => {
    navigate(`/tracking/${orderId}`);
    window.scrollTo(0, 0);
  };

  const handleOrderDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
    window.scrollTo(0, 0);
  };

  const handleBrowseCategory = (category: string, menuId?: string, subCategory?: string) => {
    const cat = slug(category) || category;
    const menu = menuId && menuId !== 'all' ? slug(menuId) : 'all';
    const sub = subCategory ? slug(subCategory) : 'all';
    const city = slug(selectedCity) || selectedCity.toLowerCase();
    navigate(`/category/${cat}/${menu}/${sub}/${city}`);
    window.scrollTo(0, 0);
  };

  const handleBrowseAll = () => {
    navigate('/products');
    window.scrollTo(0, 0);
  };

  const searchTerm = searchParams.get('search') ?? '';
  const selectedCategory = searchParams.get('category') ?? null;
  const initialMenuId = searchParams.get('menu') ?? 'all';
  const initialSubCategory = searchParams.get('sub') ?? null;
  const productsCity = searchParams.get('city') ?? selectedCity;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        setView={setView}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        onBrowseAll={handleBrowseAll}
        cartCount={cart.length}
        searchTerm={searchTerm}
        onSearch={handleSearch}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Banner onBrowseCategory={handleBrowseCategory} />
                <Categories onBrowseCategory={handleBrowseCategory} />
                <RecentlyViewedListings onListingClick={handleListingClick} onViewHistory={() => navigate('/history')} />
                <FeaturedListings onListingClick={handleListingClick} onViewAll={handleBrowseAll} />
                <HowItWorks />
                <TrustSection />
              </>
            }
          />
          <Route
            path="/category/:categoryName?/:menu?/:sub?/:city?"
            element={
              <CategoryBrowseRoute
                onListingClick={handleListingClick}
                onCategoryChange={handleBrowseCategory}
                selectedCityFallback={selectedCity}
                defaultCity={selectedCity}
              />
            }
          />
          <Route
            path="/products"
            element={
              <BrowsePage
                onListingClick={handleListingClick}
                selectedCity={productsCity}
                selectedCategory={selectedCategory}
                onCategoryChange={handleBrowseCategory}
                initialMenuId={initialMenuId}
                initialSubCategory={initialSubCategory}
                searchTerm={searchTerm}
              />
            }
          />
          <Route path="/product/:id/:product_name?" element={<ProductDetailRoute onCheckout={handleCheckout} onAddToCart={handleAddToCart} />} />
          <Route path="/cart" element={<CartPage cartItems={cart} onCheckout={handleCheckout} setView={setView} />} />
          <Route path="/checkout" element={<CheckoutRoute onComplete={handleOrderComplete} />} />
          <Route path="/login" element={<LoginDisabledRoute onBlocked={openComingSoonModal} />} />
          <Route path="/success" element={<SuccessRoute />} />
          <Route path="/orders" element={<OrdersPage onTrack={handleTrackOrder} onDetails={handleOrderDetails} />} />
          <Route path="/orders/:id" element={<OrderDetailRoute onTrack={handleTrackOrder} />} />
          <Route path="/seller" element={<MyListings onHome={() => navigate('/')} setView={setView} onListingClick={handleListingClick} />} />
          <Route path="/seller/kyc" element={<SellerKYCPage onBack={() => navigate('/seller')} setView={setView} />} />
          <Route path="/sell" element={<CreateListingPage onBack={() => navigate('/seller')} onComplete={() => navigate('/seller')} />} />
          <Route path="/profile" element={<ProfilePage onBack={() => navigate('/')} />} />
          <Route path="/history" element={<HistoryPage onBack={() => navigate('/')} onListingClick={handleListingClick} />} />
          <Route path="/support" element={<SupportPage onBack={() => navigate('/')} initialSection={searchParams.get('section') ?? 'FAQ'} />} />
          <Route path="/tracking/:orderId" element={<TrackingRoute />} />
        </Routes>
      </main>
      <Footer setView={setView} onSupportClick={handleSupportClick} />
      <ComingSoonModal
        isOpen={isComingSoonOpen}
        onClose={closeComingSoonModal}
        message={COMING_SOON_TEXT}
      />
    </div>
  );
}
