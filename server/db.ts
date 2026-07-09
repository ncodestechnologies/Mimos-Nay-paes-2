import fs from "fs";
import path from "path";
import crypto from "crypto";

// Ensure database directory exists
const DB_DIR = path.join(process.cwd(), "database");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_FILE = path.join(DB_DIR, "db.json");

// Helper for simple password hashing
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  productionTime: string; // e.g. "3 dias úteis"
  categories: string[];
  availability: boolean;
  stock: number;
  images: string[];
  customizations: string[]; // e.g. ["Nome para gravação", "Cor da fita"]
  observations?: string;
  relatedIds: string[];
}

export interface Address {
  id: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  reference?: string;
}

export interface User {
  id: string;
  fullName: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  phone: string;
  whatsapp: string;
  email: string;
  passwordHash: string;
  addresses: Address[];
  role: "admin" | "finance" | "production" | "atendimento" | "customer";
  blocked: boolean;
  internalNotes?: string;
  avatar?: string;
  totalSpent: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  customizationValues: Record<string, string>;
  notes?: string;
}

export interface TimelineStep {
  status: string;
  date: string;
  notes: string;
  responsible: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  status:
    | "Pedido recebido"
    | "Pagamento pendente"
    | "Pagamento aprovado"
    | "Em produção"
    | "Personalização"
    | "Aguardando envio"
    | "Enviado"
    | "Saiu para entrega"
    | "Entregue"
    | "Cancelado";
  items: OrderItem[];
  total: number;
  discountCupom?: string;
  discountAmount: number;
  shippingCost: number;
  deliveryAddress: Address;
  timeline: TimelineStep[];
  observations?: string;
  createdAt: string;
}

export interface FinanceEntry {
  id: string;
  type: "receita" | "despesa" | "investimento";
  category: string;
  amount: number;
  date: string;
  description: string;
  status: "pago" | "pendente";
  supplierOrClient?: string;
  paymentMethod?: string;
}

export interface ProductionItem {
  id: string;
  orderId: string;
  productName: string;
  customerName: string;
  status: "fila" | "produzindo" | "finalizado";
  priority: "alta" | "media" | "baixa";
  estimatedDate: string;
  responsibleUser: string;
  notes?: string;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string; // e.g. "un", "m", "kg"
  history: {
    type: "entrada" | "saida";
    quantity: number;
    date: string;
    reason: string;
  }[];
}

interface DatabaseSchema {
  products: Product[];
  users: User[];
  orders: Order[];
  finance: FinanceEntry[];
  production: ProductionItem[];
  stock: StockItem[];
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Caneca Porcelana Elegance Rosé Gold",
    description: "Caneca de porcelana de alta qualidade com acabamento rosé gold metalizado e gravação personalizada de nome com escrita cursiva delicada. Perfeita para presentes corporativos ou lembranças de casamento.",
    price: 49.90,
    productionTime: "2 dias úteis",
    categories: ["Presentes personalizados", "Canecas", "Datas Comemorativas"],
    availability: true,
    stock: 35,
    images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop"],
    customizations: ["Nome para gravação (máx. 12 letras)", "Fonte da letra (Cursiva / Bastão)"],
    observations: "Acompanha caixa de presente cartonada decorativa e fita de cetim rosé.",
    relatedIds: ["prod-2", "prod-3"]
  },
  {
    id: "prod-2",
    name: "Cesta Café da Manhã Luxo Mimos",
    description: "Cesta de vime artesanal decorada com fita de cetim dourada, contendo: 1 Caneca personalizada de porcelana, mini arranjo de flores secas, pães artesanais, geleia fina, croissant, suco de uva integral e chocolates finos.",
    price: 189.90,
    productionTime: "3 dias úteis",
    categories: ["Cestas", "Aniversários", "Dia dos Namorados"],
    availability: true,
    stock: 12,
    images: ["https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop"],
    customizations: ["Texto para o cartão de felicitações", "Nome na Caneca Personalizada"],
    observations: "Entrega programada sob consulta. Manter os produtos frescos sob refrigeração até o consumo.",
    relatedIds: ["prod-1", "prod-4"]
  },
  {
    id: "prod-3",
    name: "Caixa Explosão Recheada de Amor",
    description: "Caixa cartonada surpresa que, ao abrir, abre as laterais exibindo até 4 fotos do casal/família coladas e gaveta inferior contendo 12 doces gourmet e corações decorativos em mdf. Um presente inesquecível.",
    price: 129.00,
    productionTime: "4 dias úteis",
    categories: ["Caixas Surpresa", "Caixas Explosão", "Dia dos Namorados", "Aniversários"],
    availability: true,
    stock: 15,
    images: ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop"],
    customizations: ["Envio de 4 fotos (Instruções por WhatsApp)", "Frase central para tampa"],
    observations: "Disponível nas cores Rosé, Vermelho Paixão e Preto Elegante.",
    relatedIds: ["prod-1", "prod-5"]
  },
  {
    id: "prod-4",
    name: "Tábua de Frios Premium Flores & Vinho",
    description: "Belíssima tábua de madeira pinus tratada e gravada a laser com frase personalizada. Acompanha arranjo de flores nobres (rosas), garrafa de Vinho tinto Cabernet, seleção de queijos finos, salame fatiado e uvas.",
    price: 249.90,
    productionTime: "3 dias úteis",
    categories: ["Cestas", "Casamento", "Aniversários"],
    availability: true,
    stock: 8,
    images: ["https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop"],
    customizations: ["Gravação na madeira (Nomes / Frase)", "Tipo do Vinho (Seco / Suave)"],
    observations: "Montagem artesanal feita na manhã do dia de entrega.",
    relatedIds: ["prod-2", "prod-6"]
  },
  {
    id: "prod-5",
    name: "Caneca de Chopp Vidro Jateado",
    description: "Caneca robusta de vidro jateado de 475ml, personalizada com estampa de alta definição para o dia dos pais, futebol ou frases descontraídas. Acabamento fosco elegante e térmico.",
    price: 45.00,
    productionTime: "2 dias úteis",
    categories: ["Canecas", "Presentes personalizados", "Dia dos Pais"],
    availability: true,
    stock: 20,
    images: ["https://images.unsplash.com/photo-1538947151057-dfe933d688d1?q=80&w=600&auto=format&fit=crop"],
    customizations: ["Tema da estampa (Pai / Futebol / Logo)", "Nome para personalização"],
    observations: "Pode ir ao freezer para congelar antes do consumo da bebida.",
    relatedIds: ["prod-1"]
  },
  {
    id: "prod-6",
    name: "Balão Personalizado Bubble com Flores",
    description: "Balão gigante transparente do tipo 'bubble' com confetes rosé gold, personalizado com frase em vinil adesivo, acoplado a uma caixa box elegante com mini buquê de flores naturais e Ferrero Rocher.",
    price: 139.90,
    productionTime: "2 dias úteis",
    categories: ["Presentes personalizados", "Lembranças", "Infantil", "Aniversários"],
    availability: true,
    stock: 10,
    images: ["https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop"],
    customizations: ["Frase no Balão (Ex: Feliz Aniversário, Ana!)", "Cor do balão e confetes (Rosé Gold, Azul, Dourado)"],
    observations: "A durabilidade do balão flutuando é de aproximadamente 3 a 5 dias.",
    relatedIds: ["prod-2", "prod-3"]
  },
  {
    id: "prod-7",
    name: "Box Mimos Natalino Especial",
    description: "Caixa box decorada com motivos natalinos contendo caneca natalina exclusiva, mini panetone artesanal trufado, sachês de chá gourmet, biscoitos de gengibre e cartão artesanal gravado à mão.",
    price: 99.90,
    productionTime: "2 dias úteis",
    categories: ["Natal", "Cestas", "Datas Comemorativas"],
    availability: true,
    stock: 50,
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop"],
    customizations: ["Frase do cartão de Natal", "Nome na caneca natalina"],
    observations: "Edição limitada de fim de ano.",
    relatedIds: ["prod-1", "prod-2"]
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: "usr-admin",
    fullName: "Nayara Paes",
    cpf: "123.456.789-00",
    birthDate: "1994-05-15",
    phone: "(11) 99999-8888",
    whatsapp: "(11) 99999-8888",
    email: "admin@mimosnaypaes.com.br",
    passwordHash: hashPassword("admin123"),
    addresses: [
      {
        id: "addr-1",
        cep: "01310-100",
        street: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        reference: "Próximo ao MASP"
      }
    ],
    role: "admin",
    blocked: false,
    internalNotes: "Proprietária e Administradora Principal",
    totalSpent: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "usr-finance",
    fullName: "Gabriela Silva (Financeiro)",
    cpf: "222.333.444-55",
    birthDate: "1991-08-20",
    phone: "(11) 98888-7777",
    whatsapp: "(11) 98888-7777",
    email: "financeiro@mimosnaypaes.com.br",
    passwordHash: hashPassword("financeiro123"),
    addresses: [],
    role: "finance",
    blocked: false,
    internalNotes: "Responsável pelas contas e fluxo de caixa",
    totalSpent: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "usr-prod",
    fullName: "Carlos Souza (Produção)",
    cpf: "333.444.555-66",
    birthDate: "1988-12-10",
    phone: "(11) 97777-6666",
    whatsapp: "(11) 97777-6666",
    email: "producao@mimosnaypaes.com.br",
    passwordHash: hashPassword("producao123"),
    addresses: [],
    role: "production",
    blocked: false,
    internalNotes: "Coordenador de personalização e expedição",
    totalSpent: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "usr-customer",
    fullName: "Mariana Medeiros",
    cpf: "444.555.666-77",
    birthDate: "1998-10-22",
    phone: "(11) 91111-2222",
    whatsapp: "(11) 91111-2222",
    email: "mariana@gmail.com",
    passwordHash: hashPassword("cliente123"),
    addresses: [
      {
        id: "addr-customer-1",
        cep: "04012-010",
        street: "Rua Domingos de Morais",
        number: "500",
        complement: "Apto 42",
        neighborhood: "Vila Mariana",
        city: "São Paulo",
        state: "SP",
        reference: "Metrô Ana Rosa"
      }
    ],
    role: "customer",
    blocked: false,
    internalNotes: "Cliente recorrente de cestas de café",
    totalSpent: 379.80,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: "ped-1001",
    customerId: "usr-customer",
    customerName: "Mariana Medeiros",
    status: "Entregue",
    items: [
      {
        productId: "prod-2",
        productName: "Cesta Café da Manhã Luxo Mimos",
        price: 189.90,
        quantity: 1,
        customizationValues: {
          "Texto para o cartão de felicitações": "Parabéns, mãe! Com todo meu amor, Mari.",
          "Nome na Caneca Personalizada": "Mãe Coruja"
        }
      },
      {
        productId: "prod-1",
        productName: "Caneca Porcelana Elegance Rosé Gold",
        price: 49.90,
        quantity: 1,
        customizationValues: {
          "Nome para gravação (máx. 12 letras)": "Ana Paula",
          "Fonte da letra (Cursiva / Bastão)": "Cursiva"
        }
      }
    ],
    total: 254.80,
    discountAmount: 0,
    shippingCost: 15.00,
    deliveryAddress: {
      id: "addr-customer-1",
      cep: "04012-010",
      street: "Rua Domingos de Morais",
      number: "500",
      complement: "Apto 42",
      neighborhood: "Vila Mariana",
      city: "São Paulo",
      state: "SP"
    },
    timeline: [
      { status: "Pedido recebido", date: "2026-07-01T09:00:00Z", notes: "Pedido feito pela loja online.", responsible: "Sistema" },
      { status: "Pagamento aprovado", date: "2026-07-01T09:05:00Z", notes: "Pagamento aprovado via Pix.", responsible: "Atendimento" },
      { status: "Em produção", date: "2026-07-02T10:00:00Z", notes: "Separando vime e gravando canecas.", responsible: "Carlos Souza" },
      { status: "Entregue", date: "2026-07-04T11:30:00Z", notes: "Entregue em mãos para a destinatária.", responsible: "Entregador Nay" }
    ],
    createdAt: "2026-07-01T09:00:00Z"
  },
  {
    id: "ped-1002",
    customerId: "usr-customer",
    customerName: "Mariana Medeiros",
    status: "Em produção",
    items: [
      {
        productId: "prod-3",
        productName: "Caixa Explosão Recheada de Amor",
        price: 129.00,
        quantity: 1,
        customizationValues: {
          "Envio de 4 fotos (Instruções por WhatsApp)": "Fotos enviadas pelo WhatsApp",
          "Frase central para tampa": "Te amo para sempre"
        }
      }
    ],
    total: 139.00,
    discountAmount: 10.00,
    shippingCost: 20.00,
    deliveryAddress: {
      id: "addr-customer-1",
      cep: "04012-010",
      street: "Rua Domingos de Morais",
      number: "500",
      complement: "Apto 42",
      neighborhood: "Vila Mariana",
      city: "São Paulo",
      state: "SP"
    },
    timeline: [
      { status: "Pedido recebido", date: "2026-07-07T14:30:00Z", notes: "Pedido gerado via carrinho.", responsible: "Sistema" },
      { status: "Pagamento aprovado", date: "2026-07-07T14:45:00Z", notes: "Transferência TED confirmada.", responsible: "Atendimento" },
      { status: "Em produção", date: "2026-07-08T08:00:00Z", notes: "Montagem da caixa cartonada e colagem de fotos.", responsible: "Carlos Souza" }
    ],
    createdAt: "2026-07-07T14:30:00Z"
  }
];

const DEFAULT_FINANCE: FinanceEntry[] = [
  {
    id: "fin-1",
    type: "receita",
    category: "Venda Loja Online",
    amount: 254.80,
    date: "2026-07-01",
    description: "Venda referente ao pedido ped-1001",
    status: "pago",
    supplierOrClient: "Mariana Medeiros",
    paymentMethod: "Pix"
  },
  {
    id: "fin-2",
    type: "despesa",
    category: "Insumos - Embalagens",
    amount: 320.00,
    date: "2026-07-02",
    description: "Compra de 50 caixas cartonadas premium para caixa explosão",
    status: "pago",
    supplierOrClient: "Cartonagem São Paulo Ltda",
    paymentMethod: "Boleto"
  },
  {
    id: "fin-3",
    type: "receita",
    category: "Venda Loja Online",
    amount: 139.00,
    date: "2026-07-07",
    description: "Venda referente ao pedido ped-1002",
    status: "pago",
    supplierOrClient: "Mariana Medeiros",
    paymentMethod: "TED"
  },
  {
    id: "fin-4",
    type: "despesa",
    category: "Custos Fixos - Energia",
    amount: 180.00,
    date: "2026-07-05",
    description: "Conta de luz do ateliê de produção",
    status: "pago",
    supplierOrClient: "Enel",
    paymentMethod: "Débito Automático"
  },
  {
    id: "fin-5",
    type: "investimento",
    category: "Marketing & Tráfego",
    amount: 150.00,
    date: "2026-07-04",
    description: "Impulsionamento de publicações de Dia dos Namorados no Instagram",
    status: "pago",
    supplierOrClient: "Meta Ads",
    paymentMethod: "Cartão de Crédito"
  }
];

const DEFAULT_PRODUCTION: ProductionItem[] = [
  {
    id: "prod-q-1",
    orderId: "ped-1002",
    productName: "Caixa Explosão Recheada de Amor",
    customerName: "Mariana Medeiros",
    status: "produzindo",
    priority: "alta",
    estimatedDate: "2026-07-10",
    responsibleUser: "Carlos Souza",
    notes: "Aguardando cola secar. Fotos coladas com sucesso."
  }
];

const DEFAULT_STOCK: StockItem[] = [
  {
    id: "stk-1",
    name: "Caixa Cartonada Preta Elegance",
    quantity: 12,
    minQuantity: 5,
    unit: "un",
    history: [
      { type: "entrada", quantity: 20, date: "2026-06-25", reason: "Compra fornecedor" },
      { type: "saida", quantity: 8, date: "2026-07-01", reason: "Uso em pedido" }
    ]
  },
  {
    id: "stk-2",
    name: "Caneca Porcelana Branca para Jatear",
    quantity: 45,
    minQuantity: 10,
    unit: "un",
    history: [
      { type: "entrada", quantity: 50, date: "2026-06-20", reason: "Lote inicial" },
      { type: "saida", quantity: 5, date: "2026-07-02", reason: "Gravação de testes" }
    ]
  },
  {
    id: "stk-3",
    name: "Fita de Cetim Rosé Gold (Rolo 50m)",
    quantity: 3,
    minQuantity: 1,
    unit: "un",
    history: [
      { type: "entrada", quantity: 4, date: "2026-06-15", reason: "Compra de aviamentos" },
      { type: "saida", quantity: 1, date: "2026-07-01", reason: "Gasto em laços" }
    ]
  },
  {
    id: "stk-4",
    name: "Cesta de Vime Média",
    quantity: 4,
    minQuantity: 5, // Triggers warning
    unit: "un",
    history: [
      { type: "entrada", quantity: 10, date: "2026-06-18", reason: "Atacado" },
      { type: "saida", quantity: 6, date: "2026-07-01", reason: "Pedidos de cestas" }
    ]
  }
];

class DatabaseEngine {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      products: [],
      users: [],
      orders: [],
      finance: [],
      production: [],
      stock: []
    };
    this.load();
  }

  private load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        // Ensure all collections exist
        if (!this.data.products) this.data.products = [...DEFAULT_PRODUCTS];
        if (!this.data.users) this.data.users = [...DEFAULT_USERS];
        if (!this.data.orders) this.data.orders = [...DEFAULT_ORDERS];
        if (!this.data.finance) this.data.finance = [...DEFAULT_FINANCE];
        if (!this.data.production) this.data.production = [...DEFAULT_PRODUCTION];
        if (!this.data.stock) this.data.stock = [...DEFAULT_STOCK];
      } catch (err) {
        console.error("Erro ao ler banco de dados JSON. Usando padrões.", err);
        this.resetToDefaults();
      }
    } else {
      this.resetToDefaults();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Erro ao salvar arquivo de banco de dados.", err);
    }
  }

  private resetToDefaults() {
    this.data = {
      products: [...DEFAULT_PRODUCTS],
      users: [...DEFAULT_USERS],
      orders: [...DEFAULT_ORDERS],
      finance: [...DEFAULT_FINANCE],
      production: [...DEFAULT_PRODUCTION],
      stock: [...DEFAULT_STOCK]
    };
    this.save();
  }

  // PRODUCTS API
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  saveProduct(product: Product): Product {
    const idx = this.data.products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      this.data.products[idx] = product;
    } else {
      product.id = `prod-${Date.now()}`;
      this.data.products.push(product);
    }
    this.save();
    return product;
  }

  deleteProduct(id: string): boolean {
    const originalLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    const deleted = this.data.products.length < originalLen;
    if (deleted) this.save();
    return deleted;
  }

  // USERS API
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  saveUser(user: User): User {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.data.users[idx] = user;
    } else {
      user.id = `usr-${Date.now()}`;
      this.data.users.push(user);
    }
    this.save();
    return user;
  }

  // ORDERS API
  getOrders(): Order[] {
    return this.data.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  getOrdersByCustomer(customerId: string): Order[] {
    return this.data.orders.filter(o => o.customerId === customerId);
  }

  saveOrder(order: Order): Order {
    const idx = this.data.orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      this.data.orders[idx] = order;
    } else {
      order.id = `ped-${1000 + this.data.orders.length + 1}`;
      this.data.orders.push(order);

      // Decrement stock levels for purchased products
      for (const item of order.items) {
        const prod = this.getProductById(item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          this.saveProduct(prod);

          // Find matching stock inventory item and deduct
          const matchStock = this.data.stock.find(s => s.name.toLowerCase().includes(prod.name.toLowerCase()));
          if (matchStock) {
            matchStock.quantity = Math.max(0, matchStock.quantity - item.quantity);
            matchStock.history.push({
              type: "saida",
              quantity: item.quantity,
              date: new Date().toISOString().split("T")[0],
              reason: `Venda pedido ${order.id}`
            });
          }
        }
      }

      // Add corresponding finance record as payment pending or approved
      const financeRecord: FinanceEntry = {
        id: `fin-${Date.now()}`,
        type: "receita",
        category: "Venda Loja Online",
        amount: order.total,
        date: new Date().toISOString().split("T")[0],
        description: `Venda referente ao pedido ${order.id}`,
        status: order.status === "Pagamento pendente" ? "pendente" : "pago",
        supplierOrClient: order.customerName,
        paymentMethod: "Pix"
      };
      this.saveFinance(financeRecord);

      // Add corresponding production queue item
      const prodRecord: ProductionItem = {
        id: `prod-q-${Date.now()}`,
        orderId: order.id,
        productName: order.items.map(i => `${i.quantity}x ${i.productName}`).join(", "),
        customerName: order.customerName,
        status: "fila",
        priority: "media",
        estimatedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 days from now
        responsibleUser: "Não atribuído",
        notes: `Personalizações inclusas no pedido. Observações: ${order.observations || "Nenhuma"}`
      };
      this.saveProduction(prodRecord);
    }
    this.save();
    return order;
  }

  // FINANCE API
  getFinance(): FinanceEntry[] {
    return this.data.finance;
  }

  saveFinance(entry: FinanceEntry): FinanceEntry {
    const idx = this.data.finance.findIndex(f => f.id === entry.id);
    if (idx >= 0) {
      this.data.finance[idx] = entry;
    } else {
      entry.id = `fin-${Date.now()}`;
      this.data.finance.push(entry);
    }
    this.save();
    return entry;
  }

  deleteFinance(id: string): boolean {
    const originalLen = this.data.finance.length;
    this.data.finance = this.data.finance.filter(f => f.id !== id);
    const deleted = this.data.finance.length < originalLen;
    if (deleted) this.save();
    return deleted;
  }

  // PRODUCTION API
  getProduction(): ProductionItem[] {
    return this.data.production;
  }

  saveProduction(item: ProductionItem): ProductionItem {
    const idx = this.data.production.findIndex(p => p.id === item.id);
    if (idx >= 0) {
      this.data.production[idx] = item;
    } else {
      item.id = `prod-q-${Date.now()}`;
      this.data.production.push(item);
    }
    this.save();
    return item;
  }

  // STOCK API
  getStock(): StockItem[] {
    return this.data.stock;
  }

  saveStock(item: StockItem): StockItem {
    const idx = this.data.stock.findIndex(s => s.id === item.id);
    if (idx >= 0) {
      this.data.stock[idx] = item;
    } else {
      item.id = `stk-${Date.now()}`;
      this.data.stock.push(item);
    }
    this.save();
    return item;
  }
}

export const db = new DatabaseEngine();
