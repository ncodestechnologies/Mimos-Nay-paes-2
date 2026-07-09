import React, { useState, useEffect } from "react";
import { Product, CartItem, User, Order } from "./types";
import AboutUs from "./components/AboutUs";
import Contact from "./components/Contact";
import CustomerArea from "./components/CustomerArea";
import DashboardAdmin from "./components/DashboardAdmin";
import Gallery from "./components/Gallery";
import { 
  ShoppingBag, Heart, Phone, Mail, Instagram, MapPin, Search, 
  Menu, X, Sparkles, Plus, Minus, Trash2, ChevronRight, Gift, 
  Clock, Award, HelpCircle, CheckCircle2, User as UserIcon, LogOut
} from "lucide-react";

export default function App() {
  // Navigation Routing State
  const [activeRoute, setActiveRoute] = useState<"home" | "produtos" | "sobre" | "contato" | "cliente" | "admin" | "galeria">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("mimos_user");
    return saved ? JSON.parse(saved) : null;
  });

  // E-commerce states
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customizationAnswers, setCustomizationAnswers] = useState<Record<string, string>>({});
  const [productQty, setProductQty] = useState(1);
  const [productNotes, setProductNotes] = useState("");

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("mimos_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("mimos_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Search & Catalog Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [priceRange, setPriceRange] = useState<number>(300);

  // Interface view triggers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Checkout form states
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  // Load products
  const fetchProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      })
      .catch((err) => console.error("Error loading products", err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("mimos_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("mimos_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Login handler
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("mimos_user", JSON.stringify(user));
    showToast(`Bem-vindo(a) de volta, ${user.fullName.split(" ")[0]}!`);
    
    // Automatically select first address if available for checkout convenience
    if (user.addresses && user.addresses.length > 0) {
      setSelectedAddressId(user.addresses[0].id || "");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("mimos_user");
    showToast("Você saiu da sua conta.");
    if (activeRoute === "admin") {
      setActiveRoute("home");
    }
  };

  // Add Item to cart
  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // Validate that all customizations have values
    for (const option of selectedProduct.customizations) {
      if (!customizationAnswers[option]) {
        alert(`Por favor, preencha a personalização: "${option}"`);
        return;
      }
    }

    const newItem: CartItem = {
      product: selectedProduct,
      quantity: productQty,
      customizations: { ...customizationAnswers },
      notes: productNotes
    };

    setCart([...cart, newItem]);
    setSelectedProduct(null);
    setCustomizationAnswers({});
    setProductQty(1);
    setProductNotes("");
    showToast(`${selectedProduct.name} adicionado ao carrinho!`);
  };

  const handleRemoveFromCart = (index: number) => {
    const updated = cart.filter((_, idx) => idx !== index);
    setCart(updated);
  };

  const handleToggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter((id) => id !== productId));
      showToast("Removido dos favoritos.");
    } else {
      setFavorites([...favorites, productId]);
      showToast("Adicionado aos favoritos!");
    }
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = couponApplied ? cartSubtotal * 0.1 : 0; // 10% coupon
  const shippingCost = cart.length > 0 ? 15.00 : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  // Submit Order Checkout
  const handleCheckoutSubmit = async () => {
    if (!currentUser) {
      alert("Por favor, faça login ou cadastre-se para concluir seu pedido.");
      setActiveRoute("cliente");
      setIsCartOpen(false);
      return;
    }

    if (!selectedAddressId) {
      alert("Por favor, selecione ou cadastre um endereço de entrega.");
      setActiveRoute("cliente");
      setIsCartOpen(false);
      return;
    }

    const activeAddress = currentUser.addresses.find((a) => a.id === selectedAddressId);
    if (!activeAddress) return;

    setIsCheckingOut(true);

    const payload = {
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        customizationValues: item.customizations,
        notes: item.notes
      })),
      total: cartTotal,
      discountCupom: couponApplied ? coupon : undefined,
      discountAmount,
      shippingCost,
      deliveryAddress: activeAddress,
      observations: checkoutNotes
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setCart([]);
        setOrderSuccessId(data.id);
        setCheckoutNotes("");
        setCouponApplied(false);
        setCoupon("");
      } else {
        alert(data.error || "Erro ao concluir pedido");
      }
    } catch (err) {
      alert("Erro ao conectar ao servidor de pedidos.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleApplyCoupon = () => {
    if (coupon.toLowerCase() === "mimos10") {
      setCouponApplied(true);
      showToast("Cupom MIMOS10 aplicado! 10% de desconto garantido.");
    } else {
      alert("Cupom inválido. Tente 'MIMOS10'");
    }
  };

  const filteredCatalog = allProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "todos" || p.categories.includes(selectedCategory);
    const matchesPrice = p.price <= priceRange;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const featuredProducts = allProducts.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-beige-50/30 text-stone-700 font-sans antialiased">
      
      {/* GLOBAL TOAST ALERTS */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-stone-900 to-stone-800 text-white px-5 py-3 rounded-xl shadow-2xl border border-stone-800 z-50 flex items-center gap-2 animate-bounce">
          <Sparkles className="text-gold-400 w-4 h-4 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* UPPER GREETING & BRAND TAGLINE BAR */}
      <div className="bg-gradient-to-r from-rose-100/50 via-beige-100 to-rose-100/30 py-2 border-b border-beige-200">
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
          <span>Ateliê Mimos Nay Paes • Presentes com Afeto</span>
        </div>
      </div>

      {/* HEADER LOGO & NAV */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-beige-100 z-40 mimos-glow">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          
          {/* Elegant Logo */}
          <button 
            onClick={() => { setActiveRoute("home"); }} 
            className="flex flex-col text-left group cursor-pointer focus:outline-none"
          >
            <span className="font-display text-2.5xl md:text-3xl text-stone-800 tracking-tight leading-none group-hover:text-gold-500 transition-colors font-semibold">
              Mimos <span className="font-sans font-light text-rose-400 text-2xl">Nay Paes</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-gold-500 font-bold mt-1">Presentes Personalizados & Cestas</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setActiveRoute("home")}
              className={`hover:text-gold-500 transition-colors cursor-pointer ${activeRoute === "home" ? "text-gold-500 font-semibold" : "text-stone-600"}`}
            >
              Início
            </button>
            <button
              onClick={() => setActiveRoute("produtos")}
              className={`hover:text-gold-500 transition-colors cursor-pointer ${activeRoute === "produtos" ? "text-gold-500 font-semibold" : "text-stone-600"}`}
            >
              Catálogo de Presentes
            </button>
            <button
              onClick={() => setActiveRoute("sobre")}
              className={`hover:text-gold-500 transition-colors cursor-pointer ${activeRoute === "sobre" ? "text-gold-500 font-semibold" : "text-stone-600"}`}
            >
              Quem Somos
            </button>
            <button
              onClick={() => setActiveRoute("galeria")}
              className={`hover:text-gold-500 transition-colors cursor-pointer ${activeRoute === "galeria" ? "text-gold-500 font-semibold" : "text-stone-600"}`}
            >
              Galeria de Inspirações
            </button>
            <button
              onClick={() => setActiveRoute("contato")}
              className={`hover:text-gold-500 transition-colors cursor-pointer ${activeRoute === "contato" ? "text-gold-500 font-semibold" : "text-stone-600"}`}
            >
              Fale Conosco
            </button>
            <button
              onClick={() => setActiveRoute("cliente")}
              className={`hover:text-gold-500 transition-colors cursor-pointer flex items-center gap-1 ${activeRoute === "cliente" ? "text-gold-500 font-semibold" : "text-stone-600"}`}
            >
              <UserIcon className="w-4 h-4 text-gold-500" />
              {currentUser ? "Minha Área" : "Entrar / Cadastro"}
            </button>

            {/* Admin Link always visible, gating login if not staff */}
            <button
              onClick={() => setActiveRoute("admin")}
              className={`px-3 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
                activeRoute === "admin" ? "bg-gold-500 text-stone-900 font-bold" : ""
              }`}
            >
              Painel Admin 🔑
            </button>
          </nav>

          {/* Header Action Icons */}
          <div className="flex items-center gap-4">
            {/* Instagram Link */}
            <a
              href="https://instagram.com/mimosnaypaes"
              target="_blank"
              referrerPolicy="no-referrer"
              className="p-2 hover:bg-beige-50 rounded-full transition text-rose-500 hover:text-rose-600 cursor-pointer flex items-center gap-1.5"
              title="Siga no Instagram"
            >
              <Instagram className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-semibold">@mimosnaypaes</span>
            </a>

            {/* Favorites Indicator icon */}
            <button
              onClick={() => { setActiveRoute("cliente"); }}
              className="relative p-2 hover:bg-beige-50 rounded-full transition text-stone-600 cursor-pointer"
              title="Favoritos"
            >
              <Heart className="w-5 h-5 text-rose-400" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Icon button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-gradient-to-tr from-gold-500 to-gold-400 text-white rounded-full transition shadow-md hover:shadow-lg hover:scale-105 cursor-pointer"
              title="Meu Carrinho"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-stone-900 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-white">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-beige-50 rounded-full text-stone-700 lg:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-beige-100 bg-white p-6 space-y-4 shadow-xl">
            <button
              onClick={() => { setActiveRoute("home"); setMobileMenuOpen(false); }}
              className="block w-full text-left text-sm font-semibold text-stone-700 py-1"
            >
              Início
            </button>
            <button
              onClick={() => { setActiveRoute("produtos"); setMobileMenuOpen(false); }}
              className="block w-full text-left text-sm font-semibold text-stone-700 py-1"
            >
              Catálogo de Presentes
            </button>
            <button
              onClick={() => { setActiveRoute("sobre"); setMobileMenuOpen(false); }}
              className="block w-full text-left text-sm font-semibold text-stone-700 py-1"
            >
              Quem Somos
            </button>
            <button
              onClick={() => { setActiveRoute("galeria"); setMobileMenuOpen(false); }}
              className="block w-full text-left text-sm font-semibold text-stone-700 py-1"
            >
              Galeria de Inspirações
            </button>
            <button
              onClick={() => { setActiveRoute("contato"); setMobileMenuOpen(false); }}
              className="block w-full text-left text-sm font-semibold text-stone-700 py-1"
            >
              Fale Conosco
            </button>
            <button
              onClick={() => { setActiveRoute("cliente"); setMobileMenuOpen(false); }}
              className="block w-full text-left text-sm font-semibold text-stone-700 py-1"
            >
              Área do Cliente
            </button>
            <button
              onClick={() => { setActiveRoute("admin"); setMobileMenuOpen(false); }}
              className={`block w-full text-left text-sm font-semibold p-2 rounded text-center ${
                activeRoute === "admin" ? "bg-gold-500 text-stone-900 font-bold" : "bg-stone-800 text-white hover:bg-stone-700"
              }`}
            >
              Painel Admin 🔑
            </button>
          </div>
        )}
      </header>

      {/* MAIN LAYOUT GATEWAY ROUTING */}
      <main className="flex-grow">
        
        {/* 1. HOME VIEW */}
        {activeRoute === "home" && (
          <div>
            {/* Elegant Hero Slider Banner */}
            <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-tr from-beige-100 via-rose-50 to-gold-50">
              <div className="absolute top-10 right-10 w-72 h-72 bg-rose-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-72 h-72 bg-gold-200/20 rounded-full blur-3xl"></div>
              
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-700 text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Ateliê Mimos Nay Paes
                  </span>
                  <h1 className="font-display text-4.5xl md:text-6xl text-stone-800 leading-tight tracking-tight">
                    Presentes Únicos <br />
                    <span className="font-light italic text-rose-500">Feitos à Mão</span> para Encantar
                  </h1>
                  <p className="text-stone-600 font-sans leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Cestas de café da manhã luxuosas, canecas com gravações exclusivas, caixas surpresa e mimos personalizados com design sofisticado e acabamento premium.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button
                      onClick={() => setActiveRoute("produtos")}
                      className="mimos-btn-primary"
                    >
                      Ver Catálogo Completo
                    </button>
                    <a
                      href="https://wa.me/5511999998888?text=Olá!%20Gostaria%20de%20solicitar%20um%20mimo%20personalizado%20sob%20encomenda."
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="mimos-btn-rose flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> Encomendar por WhatsApp
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-6 relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-gold-200 to-rose-200 rounded-3xl blur-2xl opacity-40"></div>
                  <img
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop"
                    alt="Cesta Personalizada"
                    className="relative rounded-3xl shadow-2xl w-full max-h-[450px] object-cover border border-white/50"
                  />
                </div>
              </div>
            </section>

            {/* Quick Categories list */}
            <section className="py-12 max-w-7xl mx-auto px-4 text-center">
              <h2 className="font-display text-2xl md:text-3xl text-stone-800 mb-8">Navegue por Categorias</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 justify-start md:justify-center">
                {[
                  { name: "todos", label: "Ver Tudo", icon: <Gift className="w-4 h-4" /> },
                  { name: "Presentes personalizados", label: "Personalizados", icon: <Sparkles className="w-4 h-4" /> },
                  { name: "Cestas", label: "Cestas de Luxo", icon: <Gift className="w-4 h-4" /> },
                  { name: "Canecas", label: "Canecas Gravadas", icon: <Gift className="w-4 h-4" /> },
                  { name: "Caixas Surpresa", label: "Caixas Surpresa", icon: <Heart className="w-4 h-4" /> },
                  { name: "Lembranças", label: "Lembrancinhas", icon: <Sparkles className="w-4 h-4" /> }
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => { setSelectedCategory(cat.name); setActiveRoute("produtos"); }}
                    className="px-5 py-3 bg-white border border-beige-200 text-stone-700 hover:border-gold-400 hover:text-gold-600 rounded-xl font-medium transition cursor-pointer flex items-center gap-2 shadow-sm whitespace-nowrap shrink-0"
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Products highlights */}
            <section className="py-12 bg-white/50 border-y border-beige-100">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <span className="text-xs font-bold text-gold-600 uppercase tracking-wider block">Estilo & Sofisticação</span>
                    <h2 className="font-display text-3xl text-stone-800 mt-1">Destaques do Ateliê</h2>
                  </div>
                  <button
                    onClick={() => setActiveRoute("produtos")}
                    className="text-sm font-semibold text-gold-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Ver todo o Catálogo <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredProducts.map((p) => (
                    <div 
                      key={p.id} 
                      className="bg-white rounded-2xl overflow-hidden border border-beige-100 shadow-sm relative group hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Favorite button toggle */}
                        <button
                          onClick={() => handleToggleFavorite(p.id)}
                          className="absolute top-4 right-4 p-2 bg-white/85 hover:bg-white rounded-full shadow-md z-10 transition text-rose-400 cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(p.id) ? "fill-current" : ""}`} />
                        </button>

                        <div className="overflow-hidden h-64 relative">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="p-6 space-y-2">
                          <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">{p.categories[0]}</span>
                          <h4 className="font-display font-semibold text-stone-800 text-lg line-clamp-1">{p.name}</h4>
                          <p className="text-xs text-stone-500 line-clamp-2">{p.description}</p>
                        </div>
                      </div>

                      <div className="p-6 pt-0 flex justify-between items-center border-t border-beige-50 mt-4">
                        <span className="text-lg font-bold text-stone-800">
                          {p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                        <button
                          onClick={() => { setSelectedProduct(p); }}
                          className="px-4 py-1.5 bg-gradient-to-r from-gold-500 to-gold-400 text-white text-xs font-semibold rounded-lg shadow hover:shadow-md transition cursor-pointer"
                        >
                          Personalizar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Brand benefits */}
            <section className="py-16 max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl text-stone-800">Diferenciais Mimos Nay Paes</h2>
                <p className="text-stone-500 text-sm mt-1 max-w-lg mx-auto">Tudo é planejado meticulosamente para surpreender com beleza e carinho.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-beige-100 text-center shadow-sm">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-rose-500 w-6 h-6" />
                  </div>
                  <h4 className="font-display text-lg font-semibold text-stone-800 mb-2">Design Exclusivo</h4>
                  <p className="text-stone-600 text-sm">Criamos composições visuais equilibradas com flores delicadas, papéis nobres e gravação a laser premium.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-beige-100 text-center shadow-sm">
                  <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="text-gold-500 w-6 h-6" />
                  </div>
                  <h4 className="font-display text-lg font-semibold text-stone-800 mb-2">Pontualidade Garantida</h4>
                  <p className="text-stone-600 text-sm">Entregas programadas feitas por carros climatizados para assegurar que seus chocolates e arranjos cheguem frescos.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-beige-100 text-center shadow-sm">
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="text-stone-700 w-6 h-6" />
                  </div>
                  <h4 className="font-display text-lg font-semibold text-stone-800 mb-2">Acabamento Fino</h4>
                  <p className="text-stone-600 text-sm">Cada laço de cetim, etiqueta, carimbo e caixa cartonada passa por triagem minuciosa de qualidade.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 2. CATALOGUE VIEW */}
        {activeRoute === "produtos" && (
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="border-b border-beige-200 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="font-display text-4xl text-stone-800 tracking-tight">Catálogo de Presentes</h1>
                <p className="text-stone-500 text-sm mt-1">Selecione, customize e personalize o mimo ideal para quem você ama.</p>
              </div>

              {/* Dynamic counters */}
              <span className="text-xs bg-gold-100 text-gold-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {filteredCatalog.length} presentes disponíveis
              </span>
            </div>

            {/* Catalog Search, Filter sidebar and Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* FILTERS SIDEBAR */}
              <div className="lg:col-span-3 bg-white border border-beige-200 rounded-2xl p-6 space-y-6 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Pesquisa Direta</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-stone-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar mimo..."
                      className="mimos-input pl-10 text-xs py-2"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Categorias</label>
                  <div className="space-y-1">
                    {[
                      { name: "todos", label: "Todos os Mimos" },
                      { name: "Presentes personalizados", label: "Personalizados" },
                      { name: "Canecas", label: "Canecas Decorativas" },
                      { name: "Cestas", label: "Cestas Luxuosas" },
                      { name: "Caixas Surpresa", label: "Caixas Surpresa" },
                      { name: "Lembranças", label: "Lembrancinhas" },
                      { name: "Natal", label: "Coleção de Natal" }
                    ].map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                          selectedCategory === cat.name ? "bg-gold-50 text-gold-600 font-bold" : "text-stone-600 hover:bg-beige-50"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Preço Máximo</label>
                    <span className="text-xs font-bold text-stone-700">Até R$ {priceRange}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    step="5"
                    className="w-full accent-gold-500 cursor-pointer"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-semibold">
                    <span>R$ 20</span>
                    <span>R$ 300</span>
                  </div>
                </div>
              </div>

              {/* PRODUCTS CATALOG GRID */}
              <div className="lg:col-span-9">
                {filteredCatalog.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-2xl border border-beige-100">
                    <Search className="w-12 h-12 text-beige-300 mx-auto mb-4" />
                    <h3 className="font-display text-xl text-stone-700 font-medium">Nenhum presente localizado</h3>
                    <p className="text-stone-500 text-xs mt-1">Tente mudar os filtros de preço ou digite outro termo de busca.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredCatalog.map((p) => (
                      <div 
                        key={p.id} 
                        className="bg-white rounded-2xl overflow-hidden border border-beige-100 shadow-sm relative group hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          {/* Favorite toggle */}
                          <button
                            onClick={() => handleToggleFavorite(p.id)}
                            className="absolute top-4 right-4 p-2 bg-white/85 hover:bg-white rounded-full shadow-md z-10 transition text-rose-400 cursor-pointer"
                          >
                            <Heart className={`w-4 h-4 ${favorites.includes(p.id) ? "fill-current" : ""}`} />
                          </button>

                          <div className="overflow-hidden h-48 relative">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          <div className="p-4 space-y-1">
                            <span className="text-[9px] font-bold text-gold-600 uppercase tracking-widest">{p.categories[0]}</span>
                            <h4 className="font-display font-semibold text-stone-800 text-sm line-clamp-1">{p.name}</h4>
                            <p className="text-[11px] text-stone-500 line-clamp-2">{p.description}</p>
                          </div>
                        </div>

                        <div className="p-4 pt-0 flex justify-between items-center border-t border-beige-50 mt-3">
                          <span className="text-sm font-bold text-stone-800">
                            {p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                          <button
                            onClick={() => { setSelectedProduct(p); }}
                            className="px-3 py-1.5 bg-gradient-to-r from-gold-500 to-gold-400 text-white text-[11px] font-bold rounded-lg shadow hover:shadow-md transition cursor-pointer"
                          >
                            Personalizar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. ABOUT US VIEW */}
        {activeRoute === "sobre" && <AboutUs />}

        {/* 4. CONTACT VIEW */}
        {activeRoute === "contato" && <Contact />}

        {/* 4.5 GALLERY VIEW */}
        {activeRoute === "galeria" && <Gallery />}

        {/* 5. CUSTOMER AREA VIEW */}
        {activeRoute === "cliente" && (
          <CustomerArea
            currentUser={currentUser}
            onLoginSuccess={handleLogin}
            onLogout={handleLogout}
            favorites={favorites}
            allProducts={allProducts}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* 6. ADMIN DASHBOARD VIEW */}
        {activeRoute === "admin" && (
          <DashboardAdmin
            currentUser={currentUser}
            allProducts={allProducts}
            onRefreshProducts={fetchProducts}
            onLoginSuccess={handleLogin}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800 font-sans">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1: Info */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl text-white tracking-tight">
              Mimos <span className="font-sans font-light text-rose-300 text-xl">Nay Paes</span>
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Ateliê de presentes finos e cestas de café de alto padrão. Unindo bom gosto, carinho e materiais selecionados em mimos inesquecíveis.
            </p>
            <div className="flex gap-3 text-stone-400">
              <a href="https://instagram.com/mimosnaypaes" target="_blank" referrerPolicy="no-referrer" className="hover:text-gold-400 transition">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Navegação</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><button onClick={() => setActiveRoute("home")} className="hover:text-white transition cursor-pointer">Início</button></li>
              <li><button onClick={() => setActiveRoute("produtos")} className="hover:text-white transition cursor-pointer">Catálogo Completo</button></li>
              <li><button onClick={() => setActiveRoute("sobre")} className="hover:text-white transition cursor-pointer">Quem Somos</button></li>
              <li><button onClick={() => setActiveRoute("galeria")} className="hover:text-white transition cursor-pointer">Galeria de Inspirações</button></li>
              <li><button onClick={() => setActiveRoute("contato")} className="hover:text-white transition cursor-pointer">Fale Conosco</button></li>
              <li><button onClick={() => setActiveRoute("cliente")} className="hover:text-white transition cursor-pointer">Acessar Minha Conta</button></li>
              <li><button onClick={() => setActiveRoute("admin")} className="hover:text-white transition cursor-pointer">Painel Administrativo 🔑</button></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Atendimento</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gold-400 shrink-0" /> contato@mimosnaypaes.com.br</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gold-400 shrink-0" /> Avenida Paulista, 1000 — SP</li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Mimos em seu E-mail</h4>
            <p className="text-xs text-stone-400 leading-relaxed">Assine para receber descontos especiais e cronogramas de datas comemorativas.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Inscrição efetuada com sucesso!"); }} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Seu e-mail..."
                className="bg-stone-800 border border-stone-700 px-3 py-1.5 rounded text-xs text-white focus:outline-none focus:border-gold-500 w-full"
              />
              <button type="submit" className="px-3 bg-gold-500 hover:bg-gold-600 text-stone-900 rounded font-bold text-xs transition cursor-pointer">
                OK
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-stone-800 pt-6 text-center text-xs text-stone-500 flex flex-col sm:flex-row justify-between gap-4">
          <p>© 2026 Mimos Nay Paes. Todos os direitos reservados. CNPJ: 12.345.678/0001-90.</p>
          <div className="flex justify-center gap-4 text-stone-500">
            <span>Desenvolvido com Amor</span>
          </div>
        </div>
      </footer>


      {/* DYNAMIC PRODUCT CUSTOMIZATION DETAIL POPUP/MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden border border-beige-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
            
            {/* Left side Image column */}
            <div className="md:w-1/2 h-48 md:h-auto relative">
              <img
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 text-[9px] bg-white text-stone-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Produção: {selectedProduct.productionTime}
              </span>
            </div>

            {/* Right side options customized form */}
            <div className="p-6 md:w-1/2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] bg-gold-100 text-gold-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{selectedProduct.categories[0]}</span>
                  <button
                    onClick={() => { setSelectedProduct(null); setCustomizationAnswers({}); }}
                    className="p-1 hover:bg-beige-100 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <h3 className="font-display text-2xl text-stone-800 font-semibold mb-1">{selectedProduct.name}</h3>
                <p className="text-xs text-stone-500 leading-relaxed mb-4">{selectedProduct.description}</p>
                
                <span className="text-xl font-bold text-stone-800 block mb-6">
                  {selectedProduct.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>

                {/* DYNAMIC CUSTOMIZATION OPTIONS */}
                {selectedProduct.customizations.length > 0 && (
                  <div className="space-y-4 border-t border-beige-100 pt-4 mb-6">
                    <h4 className="text-[11px] font-bold text-gold-600 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Opções de Personalização
                    </h4>
                    
                    {selectedProduct.customizations.map((option) => (
                      <div key={option}>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">{option} *</label>
                        {option.toLowerCase().includes("fonte") || option.toLowerCase().includes("cor") || option.toLowerCase().includes("tipo") ? (
                          <select
                            required
                            className="mimos-input text-xs"
                            value={customizationAnswers[option] || ""}
                            onChange={(e) => setCustomizationAnswers({ ...customizationAnswers, [option]: e.target.value })}
                          >
                            <option value="">Selecione uma opção...</option>
                            {option.toLowerCase().includes("fonte") ? (
                              <>
                                <option value="Cursiva Delicada">Cursiva Delicada</option>
                                <option value="Bastão Moderna">Bastão Moderna</option>
                              </>
                            ) : option.toLowerCase().includes("cor") ? (
                              <>
                                <option value="Rosé Gold Luxo">Rosé Gold Luxo</option>
                                <option value="Dourado Suave">Dourado Suave</option>
                                <option value="Vermelho Paixão">Vermelho Paixão</option>
                              </>
                            ) : (
                              <>
                                <option value="Padrão do Ateliê">Padrão do Ateliê</option>
                                <option value="Opção Especial 1">Opção Especial 1</option>
                              </>
                            )}
                          </select>
                        ) : (
                          <input
                            type="text"
                            required
                            placeholder="Digite o texto personalizado aqui..."
                            className="mimos-input text-xs"
                            value={customizationAnswers[option] || ""}
                            onChange={(e) => setCustomizationAnswers({ ...customizationAnswers, [option]: e.target.value })}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantity and client scratch notes */}
                <div className="space-y-4 border-t border-beige-100 pt-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Deseja adicionar alguma observação?</label>
                    <input
                      type="text"
                      placeholder="Ex: Embrulhar para presente corporativo..."
                      className="mimos-input text-xs"
                      value={productNotes}
                      onChange={(e) => setProductNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700">Quantidade</span>
                    <div className="flex items-center border border-beige-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setProductQty(Math.max(1, productQty - 1))}
                        className="px-2.5 py-1 bg-beige-50 hover:bg-beige-100 transition cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5 text-stone-600" />
                      </button>
                      <span className="px-4 py-1 text-xs font-bold text-stone-800">{productQty}</span>
                      <button
                        onClick={() => setProductQty(productQty + 1)}
                        className="px-2.5 py-1 bg-beige-50 hover:bg-beige-100 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-stone-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="mimos-btn-primary w-full text-xs font-bold py-2 flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" /> Adicionar ao Carrinho de Mimos
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MEU CARRINHO DRAWER / SIDEBAR */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white max-w-md w-full h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-beige-100 pb-4 mb-6">
                <h3 className="font-display text-2xl text-stone-800 font-semibold flex items-center gap-1.5">
                  <ShoppingBag className="text-gold-500 w-5 h-5" /> Meu Carrinho
                </h3>
                <button
                  onClick={() => { setIsCartOpen(false); setOrderSuccessId(null); }}
                  className="p-1 hover:bg-beige-100 text-stone-400 hover:text-stone-700 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SUCCESS VIEW AFTER PLACE ORDER */}
              {orderSuccessId ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="font-display text-xl font-bold text-stone-800">Pedido Realizado com Sucesso!</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Sua solicitação de presentes foi encaminhada. O código identificador é: <b className="font-mono text-xs text-gold-600 block mt-1 uppercase bg-gold-100/30 px-2 py-1 rounded inline-block">{orderSuccessId}</b>
                  </p>
                  <p className="text-xs text-stone-500">
                    Você pode acompanhar todas as etapas de produção e entrega do seu mimo acessando a **Área do Cliente** -&gt; **Histórico de Pedidos**!
                  </p>
                  <button
                    onClick={() => { setIsCartOpen(false); setOrderSuccessId(null); setActiveRoute("cliente"); }}
                    className="mimos-btn-primary py-2 text-xs w-full mt-4"
                  >
                    Ir para Rastreamento Visual
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <ShoppingBag className="w-12 h-12 text-beige-300 mx-auto" />
                  <h4 className="font-display text-lg text-stone-600 font-medium">Seu carrinho está vazio</h4>
                  <p className="text-xs text-stone-500">Adicione presentes do nosso catálogo para prosseguir.</p>
                </div>
              ) : (
                /* SHOPPING ITEMS LIST */
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="bg-beige-50/50 p-4 rounded-xl border border-beige-100/50 relative flex gap-4 text-xs">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" />
                      
                      <div className="space-y-1 flex-grow">
                        <h5 className="font-bold text-stone-800 text-sm leading-tight">{item.product.name}</h5>
                        <p className="text-[10px] text-stone-400 font-medium">Qtd: {item.quantity} • {(item.product.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} / un</p>
                        
                        {Object.entries(item.customizations).length > 0 && (
                          <div className="text-[10px] text-stone-500 bg-white p-1.5 rounded border border-beige-100 mt-1 space-y-0.5">
                            {Object.entries(item.customizations).map(([k, v]) => (
                              <p key={k}><b>{k}:</b> {v}</p>
                            ))}
                          </div>
                        )}
                        {item.notes && <p className="text-[10px] text-stone-500 italic"><b>Nota:</b> {item.notes}</p>}
                      </div>

                      <button
                        onClick={() => handleRemoveFromCart(idx)}
                        className="p-1 text-stone-400 hover:text-red-500 transition self-start cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* PROMO COUPON CODE */}
                  <div className="pt-4 border-t border-beige-100 space-y-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Cupom de Desconto</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: MIMOS10"
                        className="mimos-input text-xs py-1"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        disabled={couponApplied}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponApplied}
                        className="px-3 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-200 text-white font-bold text-xs rounded transition cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                    {couponApplied && <span className="text-[10px] text-emerald-600 font-bold block">✓ Cupom MIMOS10 ativado (10% de desconto)</span>}
                  </div>

                  {/* DELIVERY DESTINATION IF LOGGED IN */}
                  <div className="pt-4 border-t border-beige-100 space-y-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Endereço de Entrega do Mimo</label>
                    
                    {!currentUser ? (
                      <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100 text-center text-xs">
                        <p className="text-stone-600 mb-2">Faça login para cadastrar e selecionar o endereço.</p>
                        <button
                          onClick={() => { setIsCartOpen(false); setActiveRoute("cliente"); }}
                          className="mimos-btn-secondary text-[10px] py-1 inline-block"
                        >
                          Ir para Login / Cadastro
                        </button>
                      </div>
                    ) : currentUser.addresses.length === 0 ? (
                      <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100 text-center text-xs">
                        <p className="text-stone-600 mb-2">Nenhum endereço de entrega cadastrado.</p>
                        <button
                          onClick={() => { setIsCartOpen(false); setActiveRoute("cliente"); }}
                          className="mimos-btn-secondary text-[10px] py-1 inline-block"
                        >
                          Cadastrar Endereço
                        </button>
                      </div>
                    ) : (
                      <select
                        className="mimos-input text-xs"
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                      >
                        <option value="">Selecione um local...</option>
                        {currentUser.addresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.street}, Nº {a.number} - {a.city} ({a.cep})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Checkout specific notes */}
                  <div className="space-y-1 mt-2">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">Observações adicionais para a entrega</label>
                    <input
                      type="text"
                      className="mimos-input text-xs py-1.5"
                      placeholder="Ex: Entregar na recepção, ligar ao chegar..."
                      value={checkoutNotes}
                      onChange={(e) => setCheckoutNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Calculations and Action Button */}
            {!orderSuccessId && cart.length > 0 && (
              <div className="border-t border-beige-100 pt-4 space-y-3">
                <div className="text-xs space-y-1.5 text-stone-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{cartSubtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-rose-600 font-medium">
                      <span>Desconto Especial (10%)</span>
                      <span>- {discountAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Frete / Transporte Especial</span>
                    <span>{shippingCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-stone-800 pt-2 border-t border-dashed border-beige-200">
                    <span>Total Geral</span>
                    <span>{cartTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutSubmit}
                  disabled={isCheckingOut}
                  className="mimos-btn-primary w-full text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 disabled:bg-stone-300"
                >
                  {isCheckingOut ? "Processando..." : "Concluir Encomenda dos Mimos"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
