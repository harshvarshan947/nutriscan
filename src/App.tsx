import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BottomNavbar, NavTab } from './components/layout/BottomNavbar';
import { DisclaimerModal } from './components/layout/DisclaimerModal';
import { CameraScanner } from './components/scanner/CameraScanner';
import { HomeDashboard } from './components/home/HomeDashboard';
import { ProductDetailsPage } from './components/product/ProductDetailsPage';
import { ProductNotFoundView } from './components/product/ProductNotFoundView';
import { DailyIntakeDashboard } from './components/tracking/DailyIntakeDashboard';
import { HistoryView } from './components/history/HistoryView';
import { FavoritesView } from './components/favorites/FavoritesView';
import { ProfileView } from './components/profile/ProfileView';
import { ProductSearchView } from './components/search/ProductSearchView';
import { ProductDetails } from './types/product';
import { UserProfile } from './types/profile';
import { productService } from './services/productService';
import { storageService, DEFAULT_USER_PROFILE } from './services/storageService';
import { useOfflineStatus } from './hooks/useOfflineStatus';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeProduct, setActiveProduct] = useState<ProductDetails | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const isOnline = useOfflineStatus();

  const refreshFavoritesCount = async () => {
    const favs = await storageService.getFavorites();
    setFavoritesCount(favs.length);
  };

  // Load user profile & favorites count on initial mount
  useEffect(() => {
    const initAppData = async () => {
      const profile = await storageService.getUserProfile();
      setUserProfile(profile);
      setDarkMode(profile.darkMode);

      await refreshFavoritesCount();

      // Check URL query params for shared barcode link
      const params = new URLSearchParams(window.location.search);
      const urlBarcode = params.get('barcode');
      if (urlBarcode) {
        handleBarcodeDetected(urlBarcode);
      }
    };
    initAppData();
  }, []);

  // Sync activeProduct with URL ?barcode=...
  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeProduct) {
      url.searchParams.set('barcode', activeProduct.barcode);
      window.history.pushState(null, '', url.toString());
    } else {
      if (url.searchParams.has('barcode')) {
        url.searchParams.delete('barcode');
        window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
      }
    }
  }, [activeProduct]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const b = params.get('barcode');
      if (!b) {
        setActiveProduct(null);
        setNotFoundBarcode(null);
      } else {
        handleBarcodeDetected(b);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync dark mode class with root html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    const updated = { ...userProfile, darkMode: newMode };
    setUserProfile(updated);
    await storageService.saveUserProfile(updated);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    if (!barcode.trim()) return;
    setIsLoadingProduct(true);
    setNotFoundBarcode(null);

    try {
      const product = await productService.getProduct(barcode.trim());
      if (product) {
        setActiveProduct(product);
        setNotFoundBarcode(null);
      } else {
        setNotFoundBarcode(barcode.trim());
        setActiveProduct(null);
      }
    } catch (e) {
      console.error('Error fetching product', e);
      setNotFoundBarcode(barcode.trim());
      setActiveProduct(null);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setActiveProduct(null);
    setNotFoundBarcode(null);
  };

  const handleSelectProduct = async (barcode: string) => {
    await handleBarcodeDetected(barcode);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Sticky Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        isOnline={isOnline}
      />

      {/* Main Screen Content View */}
      <main className="flex-1 w-full flex flex-col">
        {/* If a product was found and is currently being inspected */}
        {activeProduct ? (
          <ProductDetailsPage
            product={activeProduct}
            userProfile={userProfile}
            onBack={() => setActiveProduct(null)}
            onSelectProduct={handleSelectProduct}
            onFavoritesUpdated={refreshFavoritesCount}
          />
        ) : notFoundBarcode ? (
          /* Product Not Found View */
          <ProductNotFoundView
            barcode={notFoundBarcode}
            onRetry={() => {
              setNotFoundBarcode(null);
              setActiveTab('scan');
            }}
            onOpenSearch={() => {
              setNotFoundBarcode(null);
              setIsSearchOpen(true);
            }}
            onOpenManualEntry={() => {
              setNotFoundBarcode(null);
              setIsSearchOpen(true);
            }}
            onSelectProduct={handleSelectProduct}
            onBack={() => setNotFoundBarcode(null)}
          />
        ) : (
          /* Tab Screen Routing */
          <>
            {activeTab === 'home' && (
              <HomeDashboard
                userProfile={userProfile}
                onOpenScanner={() => setActiveTab('scan')}
                onOpenSearch={() => setIsSearchOpen(true)}
                onSelectProduct={handleSelectProduct}
                onNavigateToIntake={() => setActiveTab('tracking')}
                onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
              />
            )}

            {activeTab === 'scan' && (
              <CameraScanner
                onBarcodeDetected={handleBarcodeDetected}
                isLoading={isLoadingProduct}
                soundEnabled={userProfile.soundEnabled}
                hapticsEnabled={userProfile.hapticsEnabled}
                onOpenManualSearch={() => setIsSearchOpen(true)}
              />
            )}

            {activeTab === 'tracking' && (
              <DailyIntakeDashboard
                userProfile={userProfile}
                onOpenScanner={() => setActiveTab('scan')}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                onSelectProduct={handleSelectProduct}
                onOpenScanner={() => setActiveTab('scan')}
              />
            )}

            {activeTab === 'favorites' && (
              <FavoritesView
                onSelectProduct={handleSelectProduct}
                onOpenScanner={() => setActiveTab('scan')}
                onFavoritesUpdated={refreshFavoritesCount}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                userProfile={userProfile}
                onUpdateProfile={(updated) => setUserProfile(updated)}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Mobile Bottom Navigation */}
      <BottomNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        favoritesCount={favoritesCount}
      />

      {/* Medical & Safety Disclaimer Modal */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      {/* Global Product Search & Manual Input Drawer/Modal */}
      <ProductSearchView
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
      />
    </div>
  );
}

export default App;
