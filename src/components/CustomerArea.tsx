import React, { useState, useEffect } from "react";
import { User, Address, Order, Product } from "../types";
import { 
  LogIn, UserPlus, Heart, MapPin, ClipboardList, Key, Settings, 
  Plus, Trash2, CheckCircle2, Clock, Hourglass, Hammer, Gift, 
  Truck, CheckSquare, XCircle, LogOut 
} from "lucide-react";

interface CustomerAreaProps {
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  favorites: string[];
  allProducts: Product[];
  onToggleFavorite: (id: string) => void;
}

const ORDER_STEPS = [
  "Pedido recebido",
  "Pagamento pendente",
  "Pagamento aprovado",
  "Em produção",
  "Personalização",
  "Aguardando envio",
  "Enviado",
  "Saiu para entrega",
  "Entregue",
  "Cancelado"
];

const STEP_ICONS: Record<string, React.ReactNode> = {
  "Pedido recebido": <ClipboardList className="w-5 h-5 text-blue-500" />,
  "Pagamento pendente": <Hourglass className="w-5 h-5 text-amber-500 animate-pulse" />,
  "Pagamento aprovado": <CheckSquare className="w-5 h-5 text-emerald-500" />,
  "Em produção": <Hammer className="w-5 h-5 text-indigo-500" />,
  "Personalização": <Gift className="w-5 h-5 text-pink-500 animate-bounce" />,
  "Aguardando envio": <Clock className="w-5 h-5 text-yellow-500" />,
  "Enviado": <Truck className="w-5 h-5 text-blue-600" />,
  "Saiu para entrega": <Truck className="w-5 h-5 text-purple-600 animate-pulse" />,
  "Entregue": <CheckCircle2 className="w-5 h-5 text-emerald-600 font-bold" />,
  "Cancelado": <XCircle className="w-5 h-5 text-red-500" />
};

export default function CustomerArea({
  currentUser,
  onLoginSuccess,
  onLogout,
  favorites,
  allProducts,
  onToggleFavorite
}: CustomerAreaProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<"pedidos" | "favoritos" | "perfil" | "enderecos">("pedidos");

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register Form States
  const [regName, setRegName] = useState("");
  const [regCpf, setRegCpf] = useState("");
  const [regRg, setRegRg] = useState("");
  const [regBirth, setRegBirth] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regWhatsapp, setRegWhatsapp] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");

  // Register Address
  const [regCep, setRegCep] = useState("");
  const [regStreet, setRegStreet] = useState("");
  const [regNum, setRegNum] = useState("");
  const [regComp, setRegComp] = useState("");
  const [regNeigh, setRegNeigh] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regState, setRegState] = useState("SP");
  const [regRef, setRegRef] = useState("");

  // Customer State Actions
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Profile fields for Editing
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editBirth, setEditBirth] = useState("");

  // New Address State inside Profile
  const [addAddressMode, setAddAddressMode] = useState(false);
  const [newCep, setNewCep] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newNum, setNewNum] = useState("");
  const [newComp, setNewComp] = useState("");
  const [newNeigh, setNewNeigh] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("SP");
  const [newRef, setNewRef] = useState("");

  // Load customer orders
  useEffect(() => {
    if (currentUser) {
      fetch(`/api/orders?customerId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          }
        })
        .catch((err) => console.error("Error loading orders", err));

      setEditName(currentUser.fullName);
      setEditPhone(currentUser.phone);
      setEditWhatsapp(currentUser.whatsapp);
      setEditBirth(currentUser.birthDate);
    }
  }, [currentUser]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail || !loginPassword) return;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Erro ao efetuar login");
      } else {
        onLoginSuccess(data);
      }
    } catch (err) {
      setLoginError("Erro na conexão com o servidor.");
    }
  };

  // Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regName || !regCpf || !regBirth || !regPhone || !regEmail || !regPassword) {
      setRegError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const payload = {
      fullName: regName,
      cpf: regCpf,
      rg: regRg,
      birthDate: regBirth,
      phone: regPhone,
      whatsapp: regWhatsapp || regPhone,
      email: regEmail,
      password: regPassword,
      address: regCep ? {
        cep: regCep,
        street: regStreet,
        number: regNum,
        complement: regComp,
        neighborhood: regNeigh,
        city: regCity,
        state: regState,
        reference: regRef
      } : undefined
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || "Erro ao criar conta.");
      } else {
        onLoginSuccess(data);
      }
    } catch (err) {
      setRegError("Erro de comunicação com o servidor.");
    }
  };

  // Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setProfileMessage("");

    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editName,
          phone: editPhone,
          whatsapp: editWhatsapp,
          birthDate: editBirth
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMessage("Erro ao atualizar dados.");
      } else {
        onLoginSuccess(data); // Sync up
        setEditProfileMode(false);
        setProfileMessage("Perfil atualizado com sucesso!");
        setTimeout(() => setProfileMessage(""), 4000);
      }
    } catch (err) {
      setProfileMessage("Erro ao se conectar ao servidor.");
    }
  };

  // Create new address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newCep || !newStreet || !newNum) return;

    const addedAddress: Address = {
      id: `addr-${Date.now()}`,
      cep: newCep,
      street: newStreet,
      number: newNum,
      complement: newComp,
      neighborhood: newNeigh,
      city: newCity,
      state: newState,
      reference: newRef
    };

    const updatedAddresses = [...currentUser.addresses, addedAddress];

    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses })
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data);
        setAddAddressMode(false);
        setNewCep("");
        setNewStreet("");
        setNewNum("");
        setNewComp("");
        setNewNeigh("");
        setNewCity("");
        setNewState("SP");
        setNewRef("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete registered address
  const handleDeleteAddress = async (addressId: string) => {
    if (!currentUser) return;
    const filtered = currentUser.addresses.filter((a) => a.id !== addressId);

    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: filtered })
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const favoriteProducts = allProducts.filter((p) => favorites.includes(p.id));

  // If NOT LOGGED IN
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 md:py-24">
        <div className="bg-white rounded-3xl shadow-xl border border-beige-100 overflow-hidden transition-all duration-300">
          {/* Header tabs login / register */}
          <div className="flex border-b border-beige-100">
            <button
              onClick={() => { setIsRegistering(false); setLoginError(""); setRegError(""); }}
              className={`flex-1 py-4 text-center font-display text-lg font-medium transition-colors cursor-pointer ${
                !isRegistering
                  ? "bg-beige-50 text-gold-500 border-b-2 border-gold-500"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" /> Entrar
              </span>
            </button>
            <button
              onClick={() => { setIsRegistering(true); setLoginError(""); setRegError(""); }}
              className={`flex-1 py-4 text-center font-display text-lg font-medium transition-colors cursor-pointer ${
                isRegistering
                  ? "bg-beige-50 text-gold-500 border-b-2 border-gold-500"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" /> Cadastrar
              </span>
            </button>
          </div>

          <div className="p-8">
            {/* LOGIN VIEW */}
            {!isRegistering ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="font-display text-2xl text-stone-800">Seja Bem-vindo(a)</h2>
                  <p className="text-stone-500 text-sm mt-1">
                    Faça login para gerenciar seus pedidos e favoritos.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: mariana@gmail.com"
                    className="mimos-input"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-stone-700">Senha</label>
                    <button
                      type="button"
                      onClick={() => alert("Uma instrução de recuperação foi enviada para o seu e-mail cadastrado (Simulação).")}
                      className="text-xs text-gold-600 hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Sua senha secreta"
                    className="mimos-input"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="mimos-btn-primary w-full flex items-center justify-center gap-2 mt-4">
                  <LogIn className="w-4 h-4" /> Entrar na minha Conta
                </button>
                <div className="text-center text-xs text-stone-400 mt-4">
                  Credenciais de demonstração:<br />
                  Cliente: <b>mariana@gmail.com</b> / <b>cliente123</b><br />
                  Admin: <b>admin@mimosnaypaes.com.br</b> / <b>admin123</b>
                </div>
              </form>
            ) : (
              /* REGISTRATION VIEW */
              <form onSubmit={handleRegisterSubmit} className="space-y-5 max-h-[550px] overflow-y-auto pr-1">
                <div className="text-center mb-4">
                  <h2 className="font-display text-2xl text-stone-800">Criar Nova Conta</h2>
                  <p className="text-stone-500 text-sm mt-1">
                    Preencha os dados e receba mimos e novidades.
                  </p>
                </div>

                {regError && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200">
                    {regError}
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-600 border-b border-beige-100 pb-1">
                    Informações Pessoais
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mariana Medeiros"
                      className="mimos-input"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">CPF *</label>
                      <input
                        type="text"
                        required
                        placeholder="123.456.789-00"
                        className="mimos-input"
                        value={regCpf}
                        onChange={(e) => setRegCpf(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">RG (Opcional)</label>
                      <input
                        type="text"
                        placeholder="12.345.678-9"
                        className="mimos-input"
                        value={regRg}
                        onChange={(e) => setRegRg(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Nascimento *</label>
                      <input
                        type="date"
                        required
                        className="mimos-input text-sm"
                        value={regBirth}
                        onChange={(e) => setRegBirth(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">WhatsApp *</label>
                      <input
                        type="text"
                        required
                        placeholder="(11) 99999-9999"
                        className="mimos-input"
                        value={regWhatsapp}
                        onChange={(e) => setRegWhatsapp(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="mariana@gmail.com"
                      className="mimos-input"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Definir Senha *</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 dígitos"
                      className="mimos-input"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Optional initial Address details */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-600 border-b border-beige-100 pb-1">
                    Endereço de Entrega (Opcional)
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">CEP</label>
                      <input
                        type="text"
                        placeholder="01001-000"
                        className="mimos-input"
                        value={regCep}
                        onChange={(e) => setRegCep(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Logradouro / Rua</label>
                      <input
                        type="text"
                        placeholder="Rua Domingos de Morais"
                        className="mimos-input"
                        value={regStreet}
                        onChange={(e) => setRegStreet(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Número</label>
                      <input
                        type="text"
                        placeholder="500"
                        className="mimos-input"
                        value={regNum}
                        onChange={(e) => setRegNum(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Complemento</label>
                      <input
                        type="text"
                        placeholder="Apto 42, Bloco B"
                        className="mimos-input"
                        value={regComp}
                        onChange={(e) => setRegComp(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Bairro</label>
                      <input
                        type="text"
                        placeholder="Vila Mariana"
                        className="mimos-input"
                        value={regNeigh}
                        onChange={(e) => setRegNeigh(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Estado</label>
                      <input
                        type="text"
                        placeholder="SP"
                        className="mimos-input"
                        value={regState}
                        onChange={(e) => setRegState(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        placeholder="São Paulo"
                        className="mimos-input"
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Ponto de Referência</label>
                      <input
                        type="text"
                        placeholder="Próximo ao metrô"
                        className="mimos-input"
                        value={regRef}
                        onChange={(e) => setRegRef(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="mimos-btn-primary w-full flex items-center justify-center gap-2 mt-4">
                  <UserPlus className="w-4 h-4" /> Concluir Cadastro
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN CLIENT AREA
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header Profile Summary */}
      <div className="bg-gradient-to-r from-beige-100 to-rose-50 rounded-2xl p-6 md:p-8 border border-beige-200 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gold-500 to-rose-300 flex items-center justify-center text-white font-display text-2xl font-bold shadow-md">
            {currentUser.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <span className="bg-gold-100 text-gold-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {currentUser.role === "customer" ? "Cliente Mimos" : `Equipe: ${currentUser.role}`}
            </span>
            <h2 className="font-display text-2xl text-stone-800 font-semibold mt-0.5">{currentUser.fullName}</h2>
            <p className="text-stone-500 text-sm">{currentUser.email} • WhatsApp: {currentUser.whatsapp}</p>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={onLogout}
            className="px-4 py-2 text-stone-600 hover:text-stone-800 bg-white hover:bg-beige-50 rounded-lg text-sm border border-beige-200 font-medium transition flex items-center gap-1.5 justify-center flex-1 md:flex-initial cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sair da Conta
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-beige-200 mb-8 overflow-x-auto gap-2">
        <button
          onClick={() => { setActiveTab("pedidos"); setSelectedOrder(null); }}
          className={`px-5 py-3 font-display font-medium text-sm transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "pedidos"
              ? "border-gold-500 text-gold-600 font-semibold"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Histórico de Pedidos ({orders.length})
        </button>
        <button
          onClick={() => { setActiveTab("favoritos"); setSelectedOrder(null); }}
          className={`px-5 py-3 font-display font-medium text-sm transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "favoritos"
              ? "border-gold-500 text-gold-600 font-semibold"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Heart className="w-4 h-4" /> Meus Favoritos ({favorites.length})
        </button>
        <button
          onClick={() => { setActiveTab("enderecos"); setSelectedOrder(null); }}
          className={`px-5 py-3 font-display font-medium text-sm transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "enderecos"
              ? "border-gold-500 text-gold-600 font-semibold"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <MapPin className="w-4 h-4" /> Endereços ({currentUser.addresses.length})
        </button>
        <button
          onClick={() => { setActiveTab("perfil"); setSelectedOrder(null); }}
          className={`px-5 py-3 font-display font-medium text-sm transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "perfil"
              ? "border-gold-500 text-gold-600 font-semibold"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Settings className="w-4 h-4" /> Dados do Perfil
        </button>
      </div>

      {/* TAB CONTENT */}
      {profileMessage && (
        <div className="mb-6 p-3 bg-emerald-50 text-emerald-800 text-sm rounded-lg border border-emerald-200">
          {profileMessage}
        </div>
      )}

      {/* 1. ORDERS LIST */}
      {activeTab === "pedidos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`${selectedOrder ? "lg:col-span-5" : "lg:col-span-12"} space-y-4`}>
            {orders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-beige-100">
                <ClipboardList className="w-12 h-12 text-beige-300 mx-auto mb-4" />
                <h3 className="font-display text-xl text-stone-700 font-medium">Nenhum pedido feito ainda</h3>
                <p className="text-stone-500 text-sm mt-1">Navegue por nosso catálogo de mimos e monte seu primeiro presente!</p>
              </div>
            ) : (
              orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className={`bg-white p-6 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow ${
                    selectedOrder?.id === o.id ? "border-gold-400 bg-gold-50/10" : "border-beige-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-stone-400 block uppercase">Código: {o.id}</span>
                      <h4 className="font-display font-semibold text-stone-800 mt-1">
                        {o.items.length} {o.items.length === 1 ? "Mimo" : "Mimos"}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Feito em {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-stone-800 block">
                        {o.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-1.5 ${
                        o.status === "Entregue" 
                          ? "bg-emerald-50 text-emerald-700" 
                          : o.status === "Cancelado" 
                          ? "bg-red-50 text-red-700" 
                          : "bg-amber-50 text-amber-700 animate-pulse"
                      }`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ORDER DETAIL + PROGRESS VISUAL TIMELINE */}
          {selectedOrder && (
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-beige-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-beige-100 pb-4">
                <div>
                  <h3 className="font-display text-2xl text-stone-800 font-semibold">Detalhes do Pedido</h3>
                  <span className="text-xs font-mono text-stone-400 uppercase">Id: {selectedOrder.id}</span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-stone-400 hover:text-stone-700 font-bold text-sm cursor-pointer"
                >
                  Fechar Detalhes
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gold-600 uppercase tracking-wider">Produtos Adquiridos</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="bg-beige-50/50 p-3.5 rounded-lg border border-beige-100/50 flex justify-between text-sm">
                    <div>
                      <span className="font-semibold text-stone-800">{item.quantity}x {item.productName}</span>
                      {Object.entries(item.customizationValues).length > 0 && (
                        <div className="text-xs text-stone-500 space-y-0.5 mt-1">
                          {Object.entries(item.customizationValues).map(([k, v]) => (
                            <p key={k}><b>{k}:</b> {v}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-stone-800">
                      {(item.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculation Summary */}
              <div className="border-t border-beige-100 pt-3 space-y-1.5 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{(selectedOrder.total - selectedOrder.shippingCost + selectedOrder.discountAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Cupom Desconto {selectedOrder.discountCupom ? `(${selectedOrder.discountCupom})` : ""}</span>
                    <span>- {selectedOrder.discountAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxa de Frete/Entrega</span>
                  <span>{selectedOrder.shippingCost === 0 ? "Grátis" : selectedOrder.shippingCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-800 pt-1.5 border-t border-dashed border-beige-200">
                  <span>Total Geral</span>
                  <span>{selectedOrder.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="bg-gold-50/20 p-4 rounded-xl border border-gold-200/50 text-sm">
                <h4 className="font-display font-semibold text-gold-700 flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-4 h-4" /> Endereço de Entrega do Presente
                </h4>
                <p className="text-stone-700 font-medium">
                  {selectedOrder.deliveryAddress.street}, Nº {selectedOrder.deliveryAddress.number}
                  {selectedOrder.deliveryAddress.complement ? ` — ${selectedOrder.deliveryAddress.complement}` : ""}
                </p>
                <p className="text-stone-500 text-xs mt-0.5">
                  {selectedOrder.deliveryAddress.neighborhood} • {selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.state} • CEP {selectedOrder.deliveryAddress.cep}
                </p>
              </div>

              {/* Order Status Visual Progression Line */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-gold-600 uppercase tracking-wider">Acompanhamento de Produção</h4>
                
                {/* Horizontal flow line of steps */}
                <div className="relative pl-6 border-l-2 border-beige-200 space-y-6">
                  {selectedOrder.timeline.map((step, sIdx) => (
                    <div key={sIdx} className="relative">
                      {/* Left icon circle indicator */}
                      <span className="absolute -left-[37px] top-0 bg-white border border-beige-200 p-1 rounded-full z-10 flex items-center justify-center shadow-sm">
                        {STEP_ICONS[step.status] || <Gift className="w-5 h-5 text-gold-500" />}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="font-bold text-stone-800 text-sm leading-none">{step.status}</h5>
                          <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-medium">
                            {new Date(step.date).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1">{step.notes}</p>
                        <span className="text-[10px] text-stone-400 block mt-0.5">Responsável: {step.responsible}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. FAVORITES LIST */}
      {activeTab === "favoritos" && (
        <div>
          {favoriteProducts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-beige-100">
              <Heart className="w-12 h-12 text-beige-300 mx-auto mb-4" />
              <h3 className="font-display text-xl text-stone-700 font-medium">Sua lista de favoritos está vazia</h3>
              <p className="text-stone-500 text-sm mt-1">Explore os mimos do catálogo e clique no ícone de coração para salvá-los aqui!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {favoriteProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-beige-100 shadow-sm relative hover:shadow-md transition duration-300">
                  <img src={p.images[0]} alt={p.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">{p.categories[0]}</span>
                    <h4 className="font-display font-semibold text-stone-800 text-base mt-1 line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1">{p.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-base font-bold text-gold-600">
                        {p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                      <button
                        onClick={() => onToggleFavorite(p.id)}
                        className="p-1.5 text-rose-500 hover:text-stone-300 transition cursor-pointer"
                        title="Remover dos favoritos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ADDRESSES LIST */}
      {activeTab === "enderecos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* List existing */}
          {currentUser.addresses.map((addr) => (
            <div key={addr.id} className="bg-white p-5 rounded-xl border border-beige-200 flex justify-between items-start shadow-sm">
              <div className="space-y-1">
                <span className="text-[9px] bg-beige-100 text-stone-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Endereço de Entrega</span>
                <p className="text-stone-800 font-semibold mt-1">
                  {addr.street}, Nº {addr.number}
                </p>
                {addr.complement && <p className="text-stone-600 text-xs">Comp: {addr.complement}</p>}
                <p className="text-stone-500 text-xs">
                  Bairro: {addr.neighborhood} • {addr.city} - {addr.state}
                </p>
                <p className="text-stone-400 text-xs">CEP: {addr.cep}</p>
                {addr.reference && <p className="text-xs text-stone-500 italic">Ref: {addr.reference}</p>}
              </div>

              <button
                onClick={() => addr.id && handleDeleteAddress(addr.id)}
                className="p-2 text-stone-400 hover:text-red-500 rounded hover:bg-rose-50 transition cursor-pointer"
                title="Excluir endereço"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add Form */}
          {!addAddressMode ? (
            <button
              onClick={() => setAddAddressMode(true)}
              className="border-2 border-dashed border-beige-300 rounded-xl p-8 flex flex-col items-center justify-center text-stone-500 hover:text-gold-500 hover:border-gold-400 transition cursor-pointer h-full min-h-[160px]"
            >
              <Plus className="w-8 h-8 mb-2 text-beige-400" />
              <span className="font-display text-base font-semibold">Adicionar Novo Endereço</span>
            </button>
          ) : (
            <form onSubmit={handleAddAddress} className="bg-white p-5 rounded-xl border border-gold-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-beige-100 pb-2">
                <h4 className="font-display font-semibold text-stone-800">Cadastrar Novo Endereço</h4>
                <button
                  type="button"
                  onClick={() => setAddAddressMode(false)}
                  className="text-xs text-stone-400 hover:text-stone-700"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-semibold text-stone-700 mb-0.5">CEP *</label>
                  <input
                    type="text"
                    required
                    placeholder="01001-000"
                    className="mimos-input text-xs"
                    value={newCep}
                    onChange={(e) => setNewCep(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-stone-700 mb-0.5">Rua / Logradouro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Av Paulista"
                    className="mimos-input text-xs"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-700 mb-0.5">Número *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 500"
                    className="mimos-input text-xs"
                    value={newNum}
                    onChange={(e) => setNewNum(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-stone-700 mb-0.5">Complemento</label>
                  <input
                    type="text"
                    placeholder="Apto 42"
                    className="mimos-input text-xs"
                    value={newComp}
                    onChange={(e) => setNewComp(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-stone-700 mb-0.5">Bairro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Bela Vista"
                    className="mimos-input text-xs"
                    value={newNeigh}
                    onChange={(e) => setNewNeigh(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-700 mb-0.5">Estado *</label>
                  <input
                    type="text"
                    required
                    className="mimos-input text-xs"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-700 mb-0.5">Cidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: São Paulo"
                    className="mimos-input text-xs"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-700 mb-0.5">Ponto de Referência</label>
                  <input
                    type="text"
                    placeholder="Próximo ao MASP"
                    className="mimos-input text-xs"
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="mimos-btn-primary w-full py-1.5 text-xs">
                Salvar Endereço
              </button>
            </form>
          )}
        </div>
      )}

      {/* 4. PROFILE MANAGEMENT */}
      {activeTab === "perfil" && (
        <div className="bg-white p-6 rounded-2xl border border-beige-100 shadow-sm max-w-xl">
          <div className="flex justify-between items-center border-b border-beige-100 pb-3 mb-6">
            <h3 className="font-display text-xl text-stone-800 font-semibold">Editar Dados Pessoais</h3>
            {!editProfileMode && (
              <button
                onClick={() => setEditProfileMode(true)}
                className="text-xs text-gold-600 font-semibold hover:underline cursor-pointer"
              >
                Habilitar Edição
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Nome Completo</label>
              <input
                type="text"
                disabled={!editProfileMode}
                className="mimos-input disabled:bg-beige-50 disabled:text-stone-500"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">CPF (Inalterável)</label>
                <input
                  type="text"
                  disabled
                  className="mimos-input bg-beige-50 text-stone-400 cursor-not-allowed"
                  value={currentUser.cpf}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Nascimento</label>
                <input
                  type="date"
                  disabled={!editProfileMode}
                  className="mimos-input disabled:bg-beige-50 disabled:text-stone-500"
                  value={editBirth}
                  onChange={(e) => setEditBirth(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Telefone Fixo</label>
                <input
                  type="text"
                  disabled={!editProfileMode}
                  className="mimos-input disabled:bg-beige-50 disabled:text-stone-500"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">WhatsApp</label>
                <input
                  type="text"
                  disabled={!editProfileMode}
                  className="mimos-input disabled:bg-beige-50 disabled:text-stone-500"
                  value={editWhatsapp}
                  onChange={(e) => setEditWhatsapp(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">E-mail de Login (Inalterável)</label>
              <input
                type="email"
                disabled
                className="mimos-input bg-beige-50 text-stone-400 cursor-not-allowed"
                value={currentUser.email}
              />
            </div>

            {editProfileMode && (
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditProfileMode(false)}
                  className="mimos-btn-secondary flex-1 text-sm py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="mimos-btn-primary flex-1 text-sm py-2"
                >
                  Salvar Alterações
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
