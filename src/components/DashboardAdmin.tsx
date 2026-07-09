import React, { useState, useEffect } from "react";
import { User, Product, Order, FinanceEntry, ProductionItem, StockItem, GalleryItem } from "../types";
import { 
  BarChart3, Box, Users, Wallet, ClipboardList, Hammer, Settings, Plus, 
  Search, ShieldAlert, Eye, Edit, Trash2, CheckCircle2, AlertTriangle, 
  TrendingUp, Download, ArrowUpRight, ArrowDownRight, PackageCheck, Ban, Check,
  Lock, Key, Mail, EyeOff, ShieldCheck, LogOut, Image as ImageIcon, X
} from "lucide-react";

interface DashboardAdminProps {
  currentUser: User | null;
  allProducts: Product[];
  onRefreshProducts: () => void;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

type AdminRole = "admin" | "finance" | "production" | "atendimento";

export default function DashboardAdmin({ currentUser, allProducts, onRefreshProducts, onLoginSuccess, onLogout }: DashboardAdminProps) {
  // Admin Login States
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Simulating active session role bypass for demonstration/testing ease
  const [activeRole, setActiveRole] = useState<AdminRole>("admin");
  const [currentTab, setCurrentTab] = useState<"visao-geral" | "produtos" | "clientes" | "financeiro" | "producao" | "estoque" | "relatorios" | "galeria">("visao-geral");

  // Core collections synced from server
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [finance, setFinance] = useState<FinanceEntry[]>([]);
  const [production, setProduction] = useState<ProductionItem[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  // Search/Filters
  const [productSearch, setProductSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [financeTypeFilter, setFinanceTypeFilter] = useState<"todos" | "receita" | "despesa" | "investimento">("todos");
  const [gallerySearch, setGallerySearch] = useState("");

  // Action states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingStock, setEditingStock] = useState<Partial<StockItem> | null>(null);
  const [showStockForm, setShowStockForm] = useState(false);
  const [editingFinance, setEditingFinance] = useState<Partial<FinanceEntry> | null>(null);
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);

  // Gallery Form States
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryItem> | null>(null);
  const [galTitle, setGalTitle] = useState("");
  const [galImageUrl, setGalImageUrl] = useState("");
  const [galDescription, setGalDescription] = useState("");
  const [galCategory, setGalCategory] = useState("Cestas");

  // Sync role to current user role initially
  useEffect(() => {
    if (currentUser && currentUser.role !== "customer") {
      setActiveRole(currentUser.role as AdminRole);
    }
  }, [currentUser]);

  // Load Admin Data
  const loadAdminData = () => {
    // 1. Orders
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => Array.isArray(data) && setOrders(data))
      .catch(err => console.error(err));

    // 2. Users
    fetch("/api/users")
      .then(res => res.json())
      .then(data => Array.isArray(data) && setUsers(data))
      .catch(err => console.error(err));

    // 3. Finance
    fetch("/api/finance")
      .then(res => res.json())
      .then(data => Array.isArray(data) && setFinance(data))
      .catch(err => console.error(err));

    // 4. Production
    fetch("/api/production")
      .then(res => res.json())
      .then(data => Array.isArray(data) && setProduction(data))
      .catch(err => console.error(err));

    // 5. Stock
    fetch("/api/stock")
      .then(res => res.json())
      .then(data => Array.isArray(data) && setStock(data))
      .catch(err => console.error(err));

    // 6. Gallery
    fetch("/api/gallery")
      .then(res => res.json())
      .then(data => Array.isArray(data) && setGalleryItems(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== "customer") {
      loadAdminData();
    }
  }, [currentUser]);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Erro ao efetuar login administrativo.");
      } else if (data.role === "customer") {
        setLoginError("Acesso recusado. Esta conta não possui privilégios de equipe administrativa.");
      } else {
        onLoginSuccess(data);
      }
    } catch (err) {
      setLoginError("Erro na conexão com o servidor.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickAdminLogin = async (email: string, pass: string) => {
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Erro ao efetuar login administrativo.");
      } else if (data.role === "customer") {
        setLoginError("Acesso recusado. Esta conta não possui privilégios de equipe administrativa.");
      } else {
        onLoginSuccess(data);
      }
    } catch (err) {
      setLoginError("Erro na conexão com o servidor.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galTitle || !galImageUrl) {
      alert("Título e URL da imagem são obrigatórios");
      return;
    }
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingGallery?.id || "",
          title: galTitle,
          imageUrl: galImageUrl,
          description: galDescription,
          category: galCategory
        })
      });
      if (res.ok) {
        const saved = await res.json();
        setGalleryItems(prev => {
          const idx = prev.findIndex(g => g.id === saved.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = saved;
            return copy;
          } else {
            return [...prev, saved];
          }
        });
        setShowGalleryForm(false);
        setEditingGallery(null);
        setGalTitle("");
        setGalImageUrl("");
        setGalDescription("");
        setGalCategory("Cestas");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm("Deseja realmente remover esta imagem da galeria?")) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setGalleryItems(prev => prev.filter(g => g.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditGallery = (item: GalleryItem) => {
    setEditingGallery(item);
    setGalTitle(item.title);
    setGalImageUrl(item.imageUrl);
    setGalDescription(item.description || "");
    setGalCategory(item.category || "Cestas");
    setShowGalleryForm(true);
  };

  const startNewGallery = () => {
    setEditingGallery(null);
    setGalTitle("");
    setGalImageUrl("");
    setGalDescription("");
    setGalCategory("Cestas");
    setShowGalleryForm(true);
  };

  // Render Login Gate for non-staff
  if (!currentUser || currentUser.role === "customer") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-beige-50/10 py-12">
        <div className="bg-white border border-beige-200 rounded-3xl p-8 max-w-md w-full shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-2 text-gold-400">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-display text-2.5xl text-stone-800 tracking-tight font-semibold">
              Mimos <span className="font-sans font-light text-rose-500 text-2xl">Nay Paes</span>
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-gold-600 font-bold">Painel Administrativo Restrito</p>
          </div>

          <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Esta é uma área restrita reservada exclusivamente para a administração geral, equipe financeira, produção do ateliê e atendimento ao cliente.
            </span>
          </div>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-stone-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  placeholder="admin@mimosnaypaes.com.br"
                  className="mimos-input pl-10 py-2.5 text-xs"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-stone-400 w-4 h-4" />
                <input
                  type={showAdminPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="mimos-input pl-10 pr-10 py-2.5 text-xs"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="mimos-btn-primary w-full flex items-center justify-center gap-2 py-3 text-xs font-bold shadow-md hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              <Key className="w-4 h-4 text-gold-200" />
              {isLoggingIn ? "Efetuando autenticação..." : "Entrar no Painel 🔑"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // PERMISSION ASSESSOR
  const hasAccess = (allowed: AdminRole[]) => {
    return allowed.includes(activeRole);
  };

  // 1. Visão Geral Calculations
  const totalRevenue = finance.filter(f => f.type === "receita" && f.status === "pago").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = finance.filter(f => f.type === "despesa" && f.status === "pago").reduce((acc, curr) => acc + curr.amount, 0);
  const totalInvestments = finance.filter(f => f.type === "investimento").reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRevenue - totalExpenses - totalInvestments;
  const marginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const ordersCountToday = orders.filter(o => {
    const d = new Date(o.createdAt);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;
  const productionCount = production.filter(p => p.status === "produzindo").length;
  const deliveredCount = orders.filter(o => o.status === "Entregue").length;

  // PRODUCT ACTION SUBMISSION
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || editingProduct.price === undefined) return;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingProduct,
          categories: typeof editingProduct.categories === "string" 
            ? (editingProduct.categories as string).split(",").map(c => c.trim()) 
            : editingProduct.categories || ["Presentes personalizados"],
          images: editingProduct.images?.length ? editingProduct.images : ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop"],
          customizations: typeof editingProduct.customizations === "string"
            ? (editingProduct.customizations as string).split(",").map(c => c.trim())
            : editingProduct.customizations || []
        })
      });
      if (res.ok) {
        onRefreshProducts();
        setShowProductForm(false);
        setEditingProduct(null);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente remover este produto do catálogo?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefreshProducts();
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CLIENT ACTION (Block/Note update)
  const handleClientUpdate = async (client: User, updates: Partial<User>) => {
    try {
      const res = await fetch(`/api/users/${client.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        loadAdminData();
        setSelectedClient(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // FINANCE ACTION SUBMISSION
  const handleFinanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFinance?.type || !editingFinance.category || editingFinance.amount === undefined || !editingFinance.date) return;

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFinance)
      });
      if (res.ok) {
        setShowFinanceForm(false);
        setEditingFinance(null);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinanceDelete = async (id: string) => {
    if (!window.confirm("Deseja excluir este registro financeiro?")) return;
    try {
      const res = await fetch(`/api/finance/${id}`, { method: "DELETE" });
      if (res.ok) loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // PRODUCTION UPDATE STATUS
  const handleProductionStatusUpdate = async (item: ProductionItem, nextStatus: "fila" | "produzindo" | "finalizado") => {
    try {
      const res = await fetch(`/api/production/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        // Also update the master order timeline
        const mappedStatus: Record<string, string> = {
          "produzindo": "Em produção",
          "finalizado": "Aguardando envio"
        };
        if (mappedStatus[nextStatus]) {
          await fetch(`/api/orders/${item.orderId}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: mappedStatus[nextStatus],
              notes: nextStatus === "produzindo" ? "Fila de produção iniciada." : "Mimo concluído e pronto para envio.",
              responsible: item.responsibleUser || "Oficina"
            })
          });
        }
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // STOCK INVENTORY SUBMISSION
  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock?.name || editingStock.quantity === undefined) return;

    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStock)
      });
      if (res.ok) {
        setShowStockForm(false);
        setEditingStock(null);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // EXPORT FILE ACTION
  const exportToCSV = (title: string, dataArray: any[]) => {
    if (dataArray.length === 0) return;
    const headers = Object.keys(dataArray[0]).join(",");
    const rows = dataArray.map(obj => {
      return Object.values(obj).map(v => {
        let str = String(v);
        if (typeof v === "object") str = JSON.stringify(v);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "_")}_mimos.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.categories.some(c => c.toLowerCase().includes(productSearch.toLowerCase())));
  const filteredClients = users.filter(u => u.role === "customer" && (u.fullName.toLowerCase().includes(clientSearch.toLowerCase()) || u.cpf.includes(clientSearch)));
  const filteredFinance = finance.filter(f => financeTypeFilter === "todos" ? true : f.type === financeTypeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Role Switcher Demo Bar */}
      <div className="bg-stone-800 text-white p-4 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
        <div>
          <span className="text-xs bg-gold-400 text-stone-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Painel Multidepartamental</span>
          <h2 className="font-sans font-semibold text-sm mt-1">Ambiente de Demonstração: Simule Perfis para Testar as Permissões</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["admin", "finance", "production", "atendimento"] as AdminRole[]).map((role) => (
            <button
              key={role}
              onClick={() => { setActiveRole(role); }}
              className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition ${
                activeRole === role 
                  ? "bg-gold-400 text-stone-900 shadow" 
                  : "bg-stone-700 hover:bg-stone-600 text-stone-300"
              }`}
            >
              {role.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-3 bg-white border border-beige-200 rounded-2xl p-4 shadow-sm space-y-1.5">
          {currentUser && (
            <div className="bg-gradient-to-r from-rose-50/50 to-beige-50/40 p-3 rounded-xl mb-4 border border-beige-100 flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-gold-400 text-xs font-bold shrink-0">
                {currentUser.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-stone-800 truncate">{currentUser.fullName}</p>
                <p className="text-[10px] text-stone-500 uppercase font-mono font-bold tracking-wider">{activeRole}</p>
              </div>
            </div>
          )}

          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest px-3 mb-3">Departamentos</h3>

          <button
            onClick={() => setCurrentTab("visao-geral")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
              currentTab === "visao-geral" ? "bg-gold-50 text-gold-600 font-semibold" : "text-stone-600 hover:bg-beige-50"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Visão Geral (Métricas)
          </button>

          <button
            onClick={() => setCurrentTab("produtos")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
              currentTab === "produtos" ? "bg-gold-50 text-gold-600 font-semibold" : "text-stone-600 hover:bg-beige-50"
            }`}
          >
            <Box className="w-4 h-4" /> Gestão de Catálogo
          </button>

          <button
            onClick={() => setCurrentTab("clientes")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
              currentTab === "clientes" ? "bg-gold-50 text-gold-600 font-semibold" : "text-stone-600 hover:bg-beige-50"
            }`}
          >
            <Users className="w-4 h-4" /> Gestão de Clientes
          </button>

          <button
            onClick={() => setCurrentTab("financeiro")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
              currentTab === "financeiro" ? "bg-gold-50 text-gold-600 font-semibold" : "text-stone-600 hover:bg-beige-50"
            }`}
          >
            <Wallet className="w-4 h-4" /> Controle Financeiro
          </button>

          <button
            onClick={() => setCurrentTab("producao")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
              currentTab === "producao" ? "bg-gold-50 text-gold-600 font-semibold" : "text-stone-600 hover:bg-beige-50"
            }`}
          >
            <Hammer className="w-4 h-4" /> Fila de Produção
          </button>

          <button
            onClick={() => setCurrentTab("estoque")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
              currentTab === "estoque" ? "bg-gold-50 text-gold-600 font-semibold" : "text-stone-600 hover:bg-beige-50"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Controle de Estoque
          </button>

          <button
            onClick={() => setCurrentTab("relatorios")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
              currentTab === "relatorios" ? "bg-gold-50 text-gold-600 font-semibold" : "text-stone-600 hover:bg-beige-50"
            }`}
          >
            <Download className="w-4 h-4" /> Central de Relatórios
          </button>

          <button
            onClick={() => setCurrentTab("galeria")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
              currentTab === "galeria" ? "bg-gold-50 text-gold-600 font-semibold" : "text-stone-600 hover:bg-beige-50"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Galeria de Fotos
          </button>

          <div className="border-t border-beige-100 my-2 pt-2">
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition flex items-center gap-3 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" /> Sair do Painel
            </button>
          </div>
        </div>

        {/* WORKPLACE VIEW */}
        <div className="lg:col-span-9 bg-white border border-beige-100 rounded-3xl p-6 md:p-8 shadow-sm">
          
          {/* TAB 1: VISÃO GERAL */}
          {currentTab === "visao-geral" && hasAccess(["admin", "finance", "atendimento"]) && (
            <div className="space-y-8">
              <div className="border-b border-beige-100 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="font-display text-2xl text-stone-800 font-semibold">Métricas Globais</h3>
                  <p className="text-stone-500 text-xs">Visão consolidada do dia de hoje: {new Date().toLocaleDateString("pt-BR")}</p>
                </div>
                <TrendingUp className="text-gold-500 w-6 h-6 shrink-0" />
              </div>

              {/* Counter Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-beige-50 p-6 rounded-2xl border border-beige-200">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">Faturamento Consolidado</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-display font-bold text-stone-800">
                      {totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1.5">
                    <ArrowUpRight className="w-3 h-3" /> Receitas pagas registradas
                  </p>
                </div>

                <div className="bg-beige-50 p-6 rounded-2xl border border-beige-200">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">Controle Operacional</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-display font-bold text-stone-800">{productionCount}</span>
                    <span className="text-xs text-stone-500">mimos em produção</span>
                  </div>
                  <p className="text-[10px] text-indigo-600 font-semibold mt-1.5">
                    Separando materiais e embalando
                  </p>
                </div>

                <div className="bg-beige-50 p-6 rounded-2xl border border-beige-200 col-span-1 sm:col-span-2 lg:col-span-1">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">Pedidos do Dia de Hoje</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-display font-bold text-stone-800">{ordersCountToday}</span>
                    <span className="text-xs text-stone-500">novos pedidos</span>
                  </div>
                  <p className="text-[10px] text-amber-600 font-semibold mt-1.5">
                    Aguardando conferência do financeiro
                  </p>
                </div>
              </div>

              {/* Finance Balance Details */}
              {hasAccess(["admin", "finance"]) && (
                <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-6 md:p-8 border border-stone-800 shadow-md">
                  <h4 className="font-display text-xl mb-4 text-gold-300">Lucro Líquido Estimado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div>
                      <span className="text-xs text-stone-400 uppercase tracking-widest">Saldo Caixa</span>
                      <p className="text-3xl font-bold font-display mt-1 text-gold-400">
                        {netProfit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                    <div className="text-sm text-stone-300 space-y-1.5 border-t border-stone-700 md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                      <div className="flex justify-between">
                        <span>Faturamento Total:</span>
                        <span className="font-semibold text-white">+{totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Despesas Pagas:</span>
                        <span className="font-semibold text-rose-300">-{totalExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Investimentos Realizados:</span>
                        <span className="font-semibold text-amber-200">-{totalInvestments.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                      </div>
                    </div>
                    <div className="text-center md:text-right border-t border-stone-700 md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                      <span className="text-xs text-stone-400 uppercase">Margem de Lucro</span>
                      <p className="text-4xl font-semibold font-display mt-1 text-emerald-400">{marginPercentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom CSS Bar Chart rendering income trend */}
              <div className="space-y-4">
                <h4 className="font-display text-lg text-stone-800 font-semibold">Fluxo de Caixa Mensal (Demonstração)</h4>
                <div className="bg-beige-50 p-6 rounded-2xl border border-beige-100 flex flex-col justify-end h-64">
                  <div className="flex items-end justify-between gap-4 h-full">
                    {/* Jan */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-rose-200 rounded-t" style={{ height: "40px" }}></div>
                      <div className="w-full bg-gold-400 rounded-t" style={{ height: "90px" }}></div>
                      <span className="text-[10px] text-stone-500 font-semibold">Jan</span>
                    </div>
                    {/* Fev */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-rose-200 rounded-t" style={{ height: "50px" }}></div>
                      <div className="w-full bg-gold-400 rounded-t" style={{ height: "110px" }}></div>
                      <span className="text-[10px] text-stone-500 font-semibold">Fev</span>
                    </div>
                    {/* Mar */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-rose-200 rounded-t" style={{ height: "30px" }}></div>
                      <div className="w-full bg-gold-400 rounded-t" style={{ height: "130px" }}></div>
                      <span className="text-[10px] text-stone-500 font-semibold">Mar</span>
                    </div>
                    {/* Abr */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-rose-200 rounded-t" style={{ height: "80px" }}></div>
                      <div className="w-full bg-gold-400 rounded-t" style={{ height: "100px" }}></div>
                      <span className="text-[10px] text-stone-500 font-semibold">Abr</span>
                    </div>
                    {/* Mai */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-rose-200 rounded-t" style={{ height: "60px" }}></div>
                      <div className="w-full bg-gold-400 rounded-t" style={{ height: "160px" }}></div>
                      <span className="text-[10px] text-stone-500 font-semibold">Mai</span>
                    </div>
                    {/* Jun */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-rose-200 rounded-t" style={{ height: "70px" }}></div>
                      <div className="w-full bg-gold-400 rounded-t" style={{ height: "180px" }}></div>
                      <span className="text-[10px] text-stone-500 font-semibold">Jun</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4 border-t border-beige-200 pt-3 text-[10px] text-stone-400">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-gold-400 rounded-sm"></span> Receitas</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-200 rounded-sm"></span> Despesas</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CRUD */}
          {currentTab === "produtos" && hasAccess(["admin", "atendimento"]) && (
            <div className="space-y-6">
              <div className="border-b border-beige-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display text-2xl text-stone-800 font-semibold">Controle do Catálogo de Mimos</h3>
                  <p className="text-stone-500 text-xs">Cadastre, edite e acompanhe os preços dos presentes personalizados.</p>
                </div>
                <button
                  onClick={() => { setEditingProduct({}); setShowProductForm(true); }}
                  className="mimos-btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5 justify-center w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" /> Novo Mimo
                </button>
              </div>

              {/* SEARCH FILTER BAR */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-stone-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou categoria..."
                  className="mimos-input pl-10 py-2 text-sm"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              {/* PRODUCT FORM MODAL OVERLAY */}
              {showProductForm && editingProduct && (
                <div className="bg-beige-50/70 p-6 rounded-2xl border border-gold-200 space-y-4">
                  <h4 className="font-display text-lg text-stone-800 font-semibold border-b border-beige-200 pb-2">
                    {editingProduct.id ? "Alterar Detalhes do Produto" : "Novo Mimo no Catálogo"}
                  </h4>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Nome do Mimo *</label>
                        <input
                          type="text"
                          required
                          className="mimos-input text-xs"
                          placeholder="Ex: Caneca Porcelana Elegance"
                          value={editingProduct.name || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Preço Venda (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          className="mimos-input text-xs"
                          placeholder="Ex: 49.90"
                          value={editingProduct.price || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Descrição Comercial</label>
                      <textarea
                        rows={3}
                        className="mimos-input text-xs"
                        placeholder="Detalhes para o cliente visualizar no catálogo..."
                        value={editingProduct.description || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Tempo de Produção *</label>
                        <input
                          type="text"
                          required
                          className="mimos-input text-xs"
                          placeholder="Ex: 2 dias úteis"
                          value={editingProduct.productionTime || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, productionTime: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Estoque Inicial *</label>
                        <input
                          type="number"
                          required
                          className="mimos-input text-xs"
                          placeholder="Ex: 10"
                          value={editingProduct.stock || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Disponível no Site</label>
                        <select
                          className="mimos-input text-xs"
                          value={editingProduct.availability === false ? "false" : "true"}
                          onChange={(e) => setEditingProduct({ ...editingProduct, availability: e.target.value === "true" })}
                        >
                          <option value="true">Disponível</option>
                          <option value="false">Indisponível (Pausar)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Categorias (Separadas por vírgula)</label>
                        <input
                          type="text"
                          className="mimos-input text-xs"
                          placeholder="Ex: Presentes personalizados, Canecas"
                          value={Array.isArray(editingProduct.categories) ? editingProduct.categories.join(", ") : editingProduct.categories || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, categories: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Personalizações (Separadas por vírgula)</label>
                        <input
                          type="text"
                          className="mimos-input text-xs"
                          placeholder="Ex: Nome gravado, Cor do laço"
                          value={Array.isArray(editingProduct.customizations) ? editingProduct.customizations.join(", ") : editingProduct.customizations || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, customizations: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">URL da Imagem</label>
                      <input
                        type="text"
                        className="mimos-input text-xs"
                        placeholder="Ex: https://images.unsplash.com/..."
                        value={editingProduct.images?.[0] || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                      />
                    </div>

                    <div className="flex gap-4 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                        className="mimos-btn-secondary text-xs py-1.5"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="mimos-btn-primary text-xs py-1.5"
                      >
                        Salvar Produto
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* PRODUCTS LIST TABLE */}
              <div className="overflow-x-auto rounded-xl border border-beige-100">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-beige-50 text-stone-700 font-sans text-xs">
                    <tr>
                      <th className="p-3">Mimo</th>
                      <th className="p-3">Categorias</th>
                      <th className="p-3">Preço</th>
                      <th className="p-3">Prazo</th>
                      <th className="p-3">Estoque</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige-100 text-stone-600">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-beige-50/50">
                        <td className="p-3 flex items-center gap-2">
                          <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="font-semibold text-stone-800 text-xs block truncate max-w-[150px]">{p.name}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded font-medium">
                            {p.categories[0]}
                          </span>
                        </td>
                        <td className="p-3 text-xs font-bold text-stone-800">
                          {p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="p-3 text-xs">{p.productionTime}</td>
                        <td className="p-3">
                          <span className={`text-xs font-bold ${p.stock <= 5 ? "text-rose-500 animate-pulse" : "text-stone-700"}`}>
                            {p.stock} un
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.availability ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-400"}`}>
                            {p.availability ? "Ativo" : "Pausado"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                              className="p-1 text-stone-500 hover:text-gold-500 transition cursor-pointer"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleProductDelete(p.id)}
                              className="p-1 text-stone-400 hover:text-red-500 transition cursor-pointer"
                              title="Deletar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CLIENTS DIRECTORY */}
          {currentTab === "clientes" && hasAccess(["admin", "atendimento"]) && (
            <div className="space-y-6">
              <div className="border-b border-beige-100 pb-4">
                <h3 className="font-display text-2xl text-stone-800 font-semibold">Diretório de Clientes</h3>
                <p className="text-stone-500 text-xs">Consulte informações de CPF, endereços cadastrados, total investido no site e notas de acompanhamento.</p>
              </div>

              {/* Search clients bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-stone-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome de cliente ou CPF..."
                  className="mimos-input pl-10 py-2 text-sm"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
              </div>

              {/* CLIENT DETAILS / ACTIONS PANEL */}
              {selectedClient && (
                <div className="bg-beige-50 p-6 rounded-2xl border border-beige-200 space-y-4 text-sm">
                  <div className="flex justify-between items-center border-b border-beige-300 pb-2">
                    <h4 className="font-display font-semibold text-stone-800">Notas & Gestão: {selectedClient.fullName}</h4>
                    <button onClick={() => setSelectedClient(null)} className="text-xs text-stone-400 hover:text-stone-700">Fechar</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <p><b>CPF:</b> {selectedClient.cpf}</p>
                    <p><b>RG:</b> {selectedClient.rg || "Não preenchido"}</p>
                    <p><b>Aniversário:</b> {selectedClient.birthDate}</p>
                    <p><b>Telefone:</b> {selectedClient.phone}</p>
                    <p><b>E-mail:</b> {selectedClient.email}</p>
                    <p><b>Cadastrado em:</b> {new Date(selectedClient.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Notas Internas de Atendimento (Exclusivo Equipe)</label>
                    <textarea
                      rows={3}
                      className="mimos-input text-xs"
                      placeholder="Anote detalhes de preferência de fitas, restrições, etc..."
                      value={selectedClient.internalNotes || ""}
                      onChange={(e) => setSelectedClient({ ...selectedClient, internalNotes: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="flex gap-4 justify-between items-center pt-2">
                    <button
                      onClick={() => handleClientUpdate(selectedClient, { blocked: !selectedClient.blocked, internalNotes: selectedClient.internalNotes })}
                      className={`px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                        selectedClient.blocked ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" /> {selectedClient.blocked ? "Desbloquear Cliente" : "Bloquear Cliente"}
                    </button>

                    <button
                      onClick={() => handleClientUpdate(selectedClient, { internalNotes: selectedClient.internalNotes })}
                      className="mimos-btn-primary py-1.5 text-xs px-4"
                    >
                      Salvar Observações
                    </button>
                  </div>
                </div>
              )}

              {/* CLIENTS LIST TABLE */}
              <div className="overflow-x-auto rounded-xl border border-beige-100">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-beige-50 text-stone-700 font-sans text-xs">
                    <tr>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">WhatsApp / Telefone</th>
                      <th className="p-3">Gasto Total</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Notas Internas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige-100 text-stone-600">
                    {filteredClients.map((c) => (
                      <tr key={c.id} className="hover:bg-beige-50/50">
                        <td className="p-3">
                          <span className="font-semibold text-stone-800 text-xs block">{c.fullName}</span>
                          <span className="text-[10px] text-stone-400 block">{c.email}</span>
                        </td>
                        <td className="p-3 text-xs">{c.whatsapp}</td>
                        <td className="p-3 text-xs font-bold text-stone-800">
                          {c.totalSpent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.blocked ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                            {c.blocked ? "Bloqueado" : "Regular"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedClient(c)}
                            className="text-xs text-gold-600 font-semibold hover:underline flex items-center gap-1 justify-end ml-auto cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Detalhar / Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL CRUD */}
          {currentTab === "financeiro" && hasAccess(["admin", "finance"]) && (
            <div className="space-y-6">
              <div className="border-b border-beige-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display text-2xl text-stone-800 font-semibold">Controle Financeiro & Fluxo Caixa</h3>
                  <p className="text-stone-500 text-xs">Gerencie lançamentos de receitas, despesas fixas/variáveis e custos de produção.</p>
                </div>
                <button
                  onClick={() => { setEditingFinance({ date: new Date().toISOString().split("T")[0], status: "pendente", type: "despesa" }); setShowFinanceForm(true); }}
                  className="mimos-btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5 justify-center w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" /> Novo Lançamento
                </button>
              </div>

              {/* Finance filters */}
              <div className="flex gap-2 border-b border-beige-100 pb-2">
                {(["todos", "receita", "despesa", "investimento"] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFinanceTypeFilter(type)}
                    className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition ${
                      financeTypeFilter === type ? "bg-gold-500 text-white" : "bg-beige-50 text-stone-600 hover:bg-beige-100"
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* FINANCE ENTRY FORM */}
              {showFinanceForm && editingFinance && (
                <div className="bg-beige-50 p-6 rounded-2xl border border-gold-200 space-y-4">
                  <h4 className="font-display text-lg text-stone-800 font-semibold">Novo Lançamento</h4>
                  <form onSubmit={handleFinanceSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Tipo *</label>
                        <select
                          className="mimos-input text-xs"
                          value={editingFinance.type || "despesa"}
                          onChange={(e) => setEditingFinance({ ...editingFinance, type: e.target.value as any })}
                        >
                          <option value="receita">Receita (Entrada)</option>
                          <option value="despesa">Despesa (Saída)</option>
                          <option value="investimento">Investimento</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Categoria *</label>
                        <input
                          type="text"
                          required
                          className="mimos-input text-xs"
                          placeholder="Ex: Aluguel, Insumos Canecas, Venda"
                          value={editingFinance.category || ""}
                          onChange={(e) => setEditingFinance({ ...editingFinance, category: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Valor (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          className="mimos-input text-xs"
                          value={editingFinance.amount || ""}
                          onChange={(e) => setEditingFinance({ ...editingFinance, amount: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Data Competência *</label>
                        <input
                          type="date"
                          required
                          className="mimos-input text-xs"
                          value={editingFinance.date || ""}
                          onChange={(e) => setEditingFinance({ ...editingFinance, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Situação *</label>
                        <select
                          className="mimos-input text-xs"
                          value={editingFinance.status || "pendente"}
                          onChange={(e) => setEditingFinance({ ...editingFinance, status: e.target.value as any })}
                        >
                          <option value="pago">Pago / Recebido</option>
                          <option value="pendente">Pendente (Contas pagar/receber)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Fornecedor / Cliente</label>
                        <input
                          type="text"
                          className="mimos-input text-xs"
                          placeholder="Ex: Cartonagem SP"
                          value={editingFinance.supplierOrClient || ""}
                          onChange={(e) => setEditingFinance({ ...editingFinance, supplierOrClient: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Descrição</label>
                      <input
                        type="text"
                        className="mimos-input text-xs"
                        placeholder="Ex: Boleto n 12345"
                        value={editingFinance.description || ""}
                        onChange={(e) => setEditingFinance({ ...editingFinance, description: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-4 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => { setShowFinanceForm(false); setEditingFinance(null); }}
                        className="mimos-btn-secondary text-xs py-1.5"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="mimos-btn-primary text-xs py-1.5"
                      >
                        Registrar Lançamento
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* FINANCE ENTRIES TABLE */}
              <div className="overflow-x-auto rounded-xl border border-beige-100">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-beige-50 text-stone-700 font-sans text-xs">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Parceiro</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige-100 text-stone-600">
                    {filteredFinance.map((f) => (
                      <tr key={f.id} className="hover:bg-beige-50/50">
                        <td className="p-3 text-xs">{new Date(f.date).toLocaleDateString("pt-BR")}</td>
                        <td className="p-3 text-xs">
                          <span className="font-semibold text-stone-800">{f.category}</span>
                          <span className="text-[10px] text-stone-400 block truncate max-w-[140px]">{f.description}</span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            f.type === "receita" ? "bg-emerald-50 text-emerald-700" : f.type === "despesa" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {f.type}
                          </span>
                        </td>
                        <td className="p-3 text-xs font-bold text-stone-800">
                          {f.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="p-3 text-xs">{f.supplierOrClient || "—"}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${f.status === "pago" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700 animate-pulse"}`}>
                            {f.status === "pago" ? "Liquidado" : "Pendente"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleFinanceDelete(f.id)}
                            className="p-1 text-stone-400 hover:text-red-500 transition cursor-pointer"
                            title="Remover lançamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PRODUCTION QUEUE */}
          {currentTab === "producao" && hasAccess(["admin", "production"]) && (
            <div className="space-y-6">
              <div className="border-b border-beige-100 pb-4">
                <h3 className="font-display text-2xl text-stone-800 font-semibold">Fila e Controle de Produção</h3>
                <p className="text-stone-500 text-xs">Gerencie os mimos artesanais encomendados que estão na bancada de gravação ou personalização.</p>
              </div>

              {/* QUEUE TIMELINE GRID */}
              <div className="space-y-4">
                {production.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-2xl border border-beige-100">
                    <Hammer className="w-12 h-12 text-beige-300 mx-auto mb-4" />
                    <h4 className="font-display text-lg text-stone-700 font-medium">Bancada de produção vazia</h4>
                    <p className="text-stone-500 text-sm mt-1">Nenhum pedido personalizado aguardando confecção.</p>
                  </div>
                ) : (
                  production.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-xl border border-beige-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-stone-400 uppercase">Pedido: {item.orderId}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            item.priority === "alta" ? "bg-red-50 text-red-700 animate-pulse" : item.priority === "media" ? "bg-amber-50 text-amber-700" : "bg-stone-50 text-stone-600"
                          }`}>
                            Prioridade: {item.priority}
                          </span>
                        </div>
                        <h4 className="font-display font-semibold text-stone-800 text-base">{item.productName}</h4>
                        <p className="text-xs text-stone-500">Destinatário do presente: <b>{item.customerName}</b></p>
                        <p className="text-xs text-stone-400">Previsão Entrega: {new Date(item.estimatedDate).toLocaleDateString("pt-BR")}</p>
                        {item.notes && <p className="text-xs text-stone-600 italic bg-beige-50 p-2 rounded mt-1.5">{item.notes}</p>}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto text-right">
                        <div>
                          <span className="text-xs text-stone-400 block mb-1">Mudar Bancada</span>
                          <div className="flex gap-2">
                            {item.status !== "fila" && (
                              <button
                                onClick={() => handleProductionStatusUpdate(item, "fila")}
                                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs transition cursor-pointer"
                              >
                                Fila
                              </button>
                            )}
                            {item.status !== "produzindo" && (
                              <button
                                onClick={() => handleProductionStatusUpdate(item, "produzindo")}
                                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded text-xs transition cursor-pointer"
                              >
                                Produzir
                              </button>
                            )}
                            {item.status !== "finalizado" && (
                              <button
                                onClick={() => handleProductionStatusUpdate(item, "finalizado")}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Concluir
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: STOCK CONTROL */}
          {currentTab === "estoque" && hasAccess(["admin", "production"]) && (
            <div className="space-y-6">
              <div className="border-b border-beige-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display text-2xl text-stone-800 font-semibold">Controle de Estoque & Matéria-Prima</h3>
                  <p className="text-stone-500 text-xs">Monitore os rolos de fitas, vimes, canecas lisas e embalagens de cartonagem.</p>
                </div>
                <button
                  onClick={() => { setEditingStock({ quantity: 0, minQuantity: 5, unit: "un" }); setShowStockForm(true); }}
                  className="mimos-btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5 justify-center w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" /> Novo Item Estoque
                </button>
              </div>

              {/* STOCK REGISTER FORM */}
              {showStockForm && editingStock && (
                <div className="bg-beige-50 p-6 rounded-2xl border border-gold-200 space-y-4">
                  <h4 className="font-display text-lg text-stone-800 font-semibold">Registrar Nova Matéria-Prima</h4>
                  <form onSubmit={handleStockSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Nome Material *</label>
                        <input
                          type="text"
                          required
                          className="mimos-input text-xs"
                          placeholder="Ex: Caneca Branca Sem Estampa"
                          value={editingStock.name || ""}
                          onChange={(e) => setEditingStock({ ...editingStock, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Quantidade *</label>
                        <input
                          type="number"
                          required
                          className="mimos-input text-xs"
                          placeholder="Ex: 50"
                          value={editingStock.quantity || ""}
                          onChange={(e) => setEditingStock({ ...editingStock, quantity: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Unidade *</label>
                        <input
                          type="text"
                          required
                          className="mimos-input text-xs"
                          placeholder="Ex: un, rolo, m"
                          value={editingStock.unit || "un"}
                          onChange={(e) => setEditingStock({ ...editingStock, unit: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Quantidade Mínima (Alerta de Baixa) *</label>
                        <input
                          type="number"
                          required
                          className="mimos-input text-xs"
                          placeholder="Ex: 5"
                          value={editingStock.minQuantity || ""}
                          onChange={(e) => setEditingStock({ ...editingStock, minQuantity: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Motivo do lançamento (opcional)</label>
                        <input
                          type="text"
                          className="mimos-input text-xs"
                          placeholder="Ex: Compra lote novo"
                          value={(editingStock as any).reason || ""}
                          onChange={(e) => setEditingStock({ ...editingStock, reason: e.target.value } as any)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => { setShowStockForm(false); setEditingStock(null); }}
                        className="mimos-btn-secondary text-xs py-1.5"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="mimos-btn-primary text-xs py-1.5"
                      >
                        Registrar no Estoque
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ACTIVE ALERTS FOR LOW STOCK */}
              <div className="space-y-3">
                {stock.filter(item => item.quantity <= item.minQuantity).map(item => (
                  <div key={item.id} className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 flex items-center gap-3">
                    <AlertTriangle className="text-rose-500 animate-pulse shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">Aviso de Baixa no Estoque</p>
                      <p className="text-xs">O material <b>{item.name}</b> está com apenas {item.quantity} {item.unit} restantes (mínimo de {item.minQuantity} {item.unit}). Providencie novos pedidos de compra.</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* STOCK LIST TABLE */}
              <div className="overflow-x-auto rounded-xl border border-beige-100">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-beige-50 text-stone-700 font-sans text-xs">
                    <tr>
                      <th className="p-3">Material</th>
                      <th className="p-3">Saldo Atual</th>
                      <th className="p-3">Qtd Mínima</th>
                      <th className="p-3">Unidade</th>
                      <th className="p-3 text-right">Editar Ficha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige-100 text-stone-600">
                    {stock.map((item) => (
                      <tr key={item.id} className="hover:bg-beige-50/50">
                        <td className="p-3 font-semibold text-stone-800 text-xs">{item.name}</td>
                        <td className="p-3 text-xs">
                          <span className={`font-bold ${item.quantity <= item.minQuantity ? "text-rose-600" : "text-stone-800"}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="p-3 text-xs">{item.minQuantity}</td>
                        <td className="p-3 text-xs font-medium uppercase">{item.unit}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => { setEditingStock(item); setShowStockForm(true); }}
                            className="text-xs text-gold-600 hover:underline flex items-center justify-end ml-auto gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Ajustar Saldo
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: REPORT CENTER */}
          {currentTab === "relatorios" && hasAccess(["admin", "finance", "production"]) && (
            <div className="space-y-8">
              <div className="border-b border-beige-100 pb-4">
                <h3 className="font-display text-2xl text-stone-800 font-semibold">Central de Relatórios Administrativos</h3>
                <p className="text-stone-500 text-xs">Exporte de forma limpa planilhas estruturadas das tabelas de dados em formato de arquivos CSV compatíveis com Excel.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-beige-50/50 p-6 rounded-2xl border border-beige-200 hover:shadow transition flex flex-col justify-between">
                  <div>
                    <h4 className="font-display text-lg text-stone-800 font-semibold mb-2">Relatório de Clientes</h4>
                    <p className="text-stone-500 text-xs leading-relaxed mb-4">Exporta a ficha de todos os clientes cadastrados com endereços, e-mails de login, datas de registro e somatório de investimentos em compras.</p>
                  </div>
                  <button
                    onClick={() => exportToCSV("Clientes_Mimos", users)}
                    className="mimos-btn-secondary py-1.5 text-xs w-full flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Exportar CSV
                  </button>
                </div>

                <div className="bg-beige-50/50 p-6 rounded-2xl border border-beige-200 hover:shadow transition flex flex-col justify-between">
                  <div>
                    <h4 className="font-display text-lg text-stone-800 font-semibold mb-2">Relatório de Caixa</h4>
                    <p className="text-stone-500 text-xs leading-relaxed mb-4">Planilha detalhada com todos os lançamentos financeiros: despesas de fornecedores, compras de aviamentos, fluxo de receitas e investimentos em publicidade.</p>
                  </div>
                  <button
                    onClick={() => exportToCSV("Financeiro_Mimos", finance)}
                    className="mimos-btn-secondary py-1.5 text-xs w-full flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Exportar CSV
                  </button>
                </div>

                <div className="bg-beige-50/50 p-6 rounded-2xl border border-beige-200 hover:shadow transition flex flex-col justify-between">
                  <div>
                    <h4 className="font-display text-lg text-stone-800 font-semibold mb-2">Fila de Produção</h4>
                    <p className="text-stone-500 text-xs leading-relaxed mb-4">Exporta o cronograma e atribuição da fila de montagem dos mimos com as prioridades e estimativas de entrega.</p>
                  </div>
                  <button
                    onClick={() => exportToCSV("Producao_Mimos", production)}
                    className="mimos-btn-secondary py-1.5 text-xs w-full flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Exportar CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: GALLERY MANAGER */}
          {currentTab === "galeria" && hasAccess(["admin", "atendimento"]) && (
            <div className="space-y-8">
              <div className="border-b border-beige-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl text-stone-800 font-semibold">Gestão da Galeria</h3>
                  <p className="text-stone-500 text-xs">Adicione fotos de encomendas reais concluídas para inspirar novos clientes na galeria pública do site.</p>
                </div>
                <button
                  onClick={startNewGallery}
                  className="mimos-btn-primary py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Nova Inspiração
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Pesquisar por título ou descrição..."
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-beige-200 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white text-stone-800"
                />
              </div>

              {/* Gallery List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {galleryItems
                  .filter(item => 
                    item.title.toLowerCase().includes(gallerySearch.toLowerCase()) ||
                    (item.description && item.description.toLowerCase().includes(gallerySearch.toLowerCase()))
                  )
                  .map((item) => (
                    <div key={item.id} className="border border-beige-200 rounded-2xl overflow-hidden bg-beige-50/25 flex flex-col justify-between">
                      <div>
                        {/* Image preview */}
                        <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden border-b border-beige-100">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 left-3 px-2 py-0.5 bg-stone-900/80 text-gold-400 text-[9px] font-bold uppercase tracking-wider rounded-full">
                            {item.category || "Geral"}
                          </span>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-stone-800 text-sm line-clamp-1">{item.title}</h4>
                          <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                            {item.description || "Nenhuma descrição informada."}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action footer */}
                      <div className="p-4 bg-white border-t border-beige-100 flex items-center justify-between">
                        <span className="text-[10px] text-stone-400">
                          {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditGallery(item)}
                            className="p-1.5 text-stone-600 hover:bg-beige-50 hover:text-stone-800 rounded-lg transition cursor-pointer"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGallery(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {galleryItems.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-white border border-dashed border-beige-300 rounded-2xl">
                    <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <h4 className="font-medium text-stone-600">Nenhum item cadastrado</h4>
                    <p className="text-stone-400 text-xs mt-1">Clique em "Nova Inspiração" acima para inaugurar a galeria.</p>
                  </div>
                )}
              </div>

              {/* Modal form for creating/editing gallery entries */}
              {showGalleryForm && (
                <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-beige-100 space-y-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-beige-100">
                      <h3 className="font-display text-xl text-stone-800 font-bold">
                        {editingGallery ? "Editar Inspiração" : "Nova Inspiração para Galeria"}
                      </h3>
                      <button
                        onClick={() => setShowGalleryForm(false)}
                        className="p-1.5 hover:bg-stone-100 rounded-full text-stone-500 transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveGallery} className="space-y-4">
                      {/* Title */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-600 block">Título do Mimo</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Cesta Premium Café Imperial"
                          value={galTitle}
                          onChange={(e) => setGalTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-beige-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 bg-white text-stone-800"
                        />
                      </div>

                      {/* Image URL */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-600 block">URL da Imagem</label>
                        <input
                          type="url"
                          required
                          placeholder="https://images.unsplash.com/..."
                          value={galImageUrl}
                          onChange={(e) => setGalImageUrl(e.target.value)}
                          className="w-full px-3 py-2 border border-beige-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 bg-white text-stone-800"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-[10px] text-stone-400 block w-full">Imagens recomendadas Unsplash (clique para usar de exemplo):</span>
                          <button
                            type="button"
                            onClick={() => setGalImageUrl("https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop")}
                            className="px-2 py-0.5 bg-beige-100 text-stone-600 hover:bg-beige-200 rounded text-[9px] cursor-pointer"
                          >
                            Cesta de Café
                          </button>
                          <button
                            type="button"
                            onClick={() => setGalImageUrl("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop")}
                            className="px-2 py-0.5 bg-beige-100 text-stone-600 hover:bg-beige-200 rounded text-[9px] cursor-pointer"
                          >
                            Caneca Rosé
                          </button>
                          <button
                            type="button"
                            onClick={() => setGalImageUrl("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop")}
                            className="px-2 py-0.5 bg-beige-100 text-stone-600 hover:bg-beige-200 rounded text-[9px] cursor-pointer"
                          >
                            Caixa Surpresa
                          </button>
                        </div>
                      </div>

                      {/* Category selection */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-600 block">Categoria</label>
                        <select
                          value={galCategory}
                          onChange={(e) => setGalCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-beige-200 rounded-xl text-sm focus:outline-none bg-white text-stone-800 cursor-pointer"
                        >
                          <option value="Cestas">Cestas</option>
                          <option value="Canecas">Canecas</option>
                          <option value="Caixas">Caixas</option>
                          <option value="Datas Comemorativas">Datas Comemorativas</option>
                          <option value="Balões">Balões</option>
                          <option value="Geral">Geral</option>
                        </select>
                      </div>

                      {/* Description */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-600 block">Descrição / Detalhes</label>
                        <textarea
                          placeholder="Conte detalhes sobre a personalização, fita, cores, balão..."
                          value={galDescription}
                          onChange={(e) => setGalDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-beige-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 bg-white text-stone-800"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-beige-100">
                        <button
                          type="button"
                          onClick={() => setShowGalleryForm(false)}
                          className="px-4 py-2 border border-beige-200 rounded-xl text-xs text-stone-600 hover:bg-beige-50 transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-850 hover:to-stone-750 text-gold-400 font-semibold rounded-xl text-xs shadow transition cursor-pointer"
                        >
                          {editingGallery ? "Salvar Alterações" : "Adicionar à Galeria"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fallback for unauthorized roles */}
          {!hasAccess(["admin", "finance", "production", "atendimento"]) && (
            <div className="p-8 text-center text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3" />
              <h4 className="font-display text-lg font-bold">Acesso Restrito</h4>
              <p className="text-sm">Seu perfil atual de acesso não possui permissão para visualizar este departamento de controle.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
