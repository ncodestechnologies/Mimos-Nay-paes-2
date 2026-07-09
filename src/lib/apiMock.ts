// Client-side API fallback simulation for static hosting environments like Vercel.
// This intercepts window.fetch and simulates all database endpoints using localStorage.

// Standard seed data matching server/db.ts
const DEFAULT_PRODUCTS = [
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

const DEFAULT_USERS = [
  {
    id: "usr-programador",
    fullName: "Programador",
    cpf: "000.000.000-00",
    birthDate: "1990-01-01",
    phone: "(11) 99999-9999",
    whatsapp: "(11) 99999-9999",
    email: "programador",
    passwordHash: "6698d3680b6514c1c48834740e3eef589b093f0411b46a30c5e03aca1c385eb2", // SHA256 of "Taijou13"
    addresses: [],
    role: "admin",
    blocked: false,
    internalNotes: "Desenvolvedor com acesso total ao sistema",
    totalSpent: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "usr-nayara",
    fullName: "Nayara",
    cpf: "123.456.789-00",
    birthDate: "1994-05-15",
    phone: "(11) 99999-8888",
    whatsapp: "(11) 99999-8888",
    email: "Nayara",
    passwordHash: "887309fc5f170821709b78c049180c23d8b930d736003c2857083f3888798767", // SHA256 of "nayara123"
    addresses: [],
    role: "admin",
    blocked: false,
    internalNotes: "Dona / Proprietária - Acesso abaixo do programador",
    totalSpent: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "usr-financeiro",
    fullName: "Financeiro",
    cpf: "222.333.444-55",
    birthDate: "1991-08-20",
    phone: "(11) 98888-7777",
    whatsapp: "(11) 98888-7777",
    email: "financeiro",
    passwordHash: "18aaf426c24faf79a69d66ab71e66d2a8e6e4d593af11863ab6f41ca04833848", // SHA256 of "financeiro123"
    addresses: [],
    role: "finance",
    blocked: false,
    internalNotes: "Responsável pelo financeiro",
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
    passwordHash: "09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9", // SHA256 of "cliente123"
    addresses: [
      {
        id: "addr-customer-1",
        cep: "04012-010",
        street: "Rua Domingos de Morais",
        number: "500",
        complement: "Apto 42",
        neighborhood: "Vila Mariana",
        city: "São Paulo",
        state: "SP"
      }
    ],
    role: "customer",
    blocked: false,
    internalNotes: "Cliente recorrente de cestas de café",
    totalSpent: 379.80,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_ORDERS = [
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

const DEFAULT_FINANCE = [
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

const DEFAULT_PRODUCTION = [
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

const DEFAULT_STOCK = [
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
    minQuantity: 5,
    unit: "un",
    history: [
      { type: "entrada", quantity: 10, date: "2026-06-18", reason: "Atacado" },
      { type: "saida", quantity: 6, date: "2026-07-01", reason: "Pedidos de cestas" }
    ]
  }
];

const DEFAULT_GALLERY = [
  {
    id: "gal-1",
    title: "Cesta de Café da Manhã Luxuosa",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop",
    description: "Uma cesta artesanal repleta de flores secas e delícias selecionadas para momentos inesquecíveis.",
    category: "Cestas",
    createdAt: new Date().toISOString()
  },
  {
    id: "gal-2",
    title: "Caneca Porcelana Rosé Gold Gravada",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
    description: "A queridinha do nosso ateliê com personalização metalizada sob medida.",
    category: "Canecas",
    createdAt: new Date().toISOString()
  },
  {
    id: "gal-3",
    title: "Caixa Cartonada Preta para Padrinhos",
    imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop",
    description: "Embalagem elegante com fechamento em fita de cetim para presentear pessoas especiais.",
    category: "Caixas",
    createdAt: new Date().toISOString()
  }
];

// LocalStorage helpers
function getStore(key: string, defaults: any) {
  const data = localStorage.getItem(`mimos_db_${key}`);
  if (!data) {
    localStorage.setItem(`mimos_db_${key}`, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaults;
  }
}

function setStore(key: string, data: any) {
  localStorage.setItem(`mimos_db_${key}`, JSON.stringify(data));
}

// Simple browser SHA-256 fallback to verify credentials
async function hashStr(message: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(message);                    
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    // Basic fallback if subtle crypto is not supported
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return String(Math.abs(hash));
  }
}

// Master interceptor setup
export async function setupFetchInterceptor() {
  const originalFetch = window.fetch;
  let useLocalMock = false;

  // Check if old mock user database is cached and clear it to align with new credentials
  try {
    const cachedUsers = localStorage.getItem("mimos_db_users");
    if (cachedUsers && (cachedUsers.includes("admin@mimosnaypaes.com.br") || !cachedUsers.includes("usr-nayara"))) {
      console.log("[Mimos API Mock] Versão antiga do mock ou usuário nayara ausente detectado. Resetando banco local.");
      localStorage.removeItem("mimos_db_users");
      localStorage.removeItem("mimos_db_products");
      localStorage.removeItem("mimos_db_orders");
      localStorage.removeItem("mimos_db_finance");
      localStorage.removeItem("mimos_db_production");
      localStorage.removeItem("mimos_db_stock");
      localStorage.removeItem("mimos_db_gallery");
    }
  } catch (e) {
    // ignore
  }

  try {
    const probe = await originalFetch("/api/products");
    const contentType = probe.headers.get("content-type");
    // If we get an error response, or static text/html fallback from Vercel, enable mock!
    if (!probe.ok || (contentType && contentType.includes("text/html"))) {
      useLocalMock = true;
      console.log("[Mimos API Mock] Backend não respondendo ou servindo HTML. Ativando banco de dados local simulado (LocalStorage)!");
    } else {
      console.log("[Mimos API Mock] Conexão com o servidor Express estabelecida com sucesso.");
    }
  } catch (err) {
    useLocalMock = true;
    console.log("[Mimos API Mock] Servidor indisponível. Ativando banco de dados local simulado (LocalStorage)!");
  }

  // Intercept window.fetch
  const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === "string" ? input : (input instanceof URL ? input.href : input.url);
    
    // Only intercept requests to /api/ and only if we are using local mockup
    if (urlStr.includes("/api/") && useLocalMock) {
      const url = new URL(urlStr, window.location.origin);
      const pathname = url.pathname;
      const method = (init?.method || "GET").toUpperCase();
      let bodyData: any = {};
      
      if (init?.body) {
        try {
          bodyData = JSON.parse(init.body as string);
        } catch (e) {
          // ignore
        }
      }

      console.log(`[Mimos Local Simulated DB] ${method} ${pathname}`, bodyData);

      // Helper to return a mock response
      const makeResponse = (data: any, status = 200) => {
        return new Response(JSON.stringify(data), {
          status,
          headers: { "Content-Type": "application/json" }
        });
      };

      // 1. PRODUCTS
      if (pathname === "/api/products") {
        const products = getStore("products", DEFAULT_PRODUCTS);
        if (method === "GET") {
          return makeResponse(products);
        }
        if (method === "POST") {
          const newProd = {
            id: bodyData.id || `prod-${Date.now()}`,
            name: bodyData.name,
            description: bodyData.description || "",
            price: Number(bodyData.price),
            productionTime: bodyData.productionTime || "2 dias úteis",
            categories: bodyData.categories || ["Presentes personalizados"],
            availability: bodyData.availability !== undefined ? bodyData.availability : true,
            stock: Number(bodyData.stock || 0),
            images: bodyData.images || ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop"],
            customizations: bodyData.customizations || [],
            observations: bodyData.observations || "",
            relatedIds: bodyData.relatedIds || []
          };
          const index = products.findIndex((p: any) => p.id === newProd.id);
          if (index !== -1) {
            products[index] = newProd;
          } else {
            products.push(newProd);
          }
          setStore("products", products);
          return makeResponse(newProd);
        }
      }

      if (pathname.startsWith("/api/products/")) {
        const id = pathname.split("/").pop();
        const products = getStore("products", DEFAULT_PRODUCTS);
        if (method === "GET") {
          const p = products.find((prod: any) => prod.id === id);
          return p ? makeResponse(p) : makeResponse({ error: "Produto não encontrado" }, 404);
        }
        if (method === "DELETE") {
          const filtered = products.filter((p: any) => p.id !== id);
          setStore("products", filtered);
          return makeResponse({ success: true });
        }
      }

      // 2. AUTH / USERS
      if (pathname === "/api/auth/login") {
        const users = getStore("users", DEFAULT_USERS);
        const { email, password } = bodyData;
        const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
          return makeResponse({ error: "Credenciais inválidas" }, 401);
        }
        if (user.blocked) {
          return makeResponse({ error: "Usuário temporariamente bloqueado. Contate o suporte." }, 403);
        }
        
        const calculatedHash = await hashStr(password);
        const isDefaultProgramador = email.toLowerCase() === "programador" && password === "Taijou13";
        const isDefaultNayara = email.toLowerCase() === "nayara" && password === "nayara123";
        const isDefaultFinanceiro = email.toLowerCase() === "financeiro" && password === "financeiro123";
        const isDefaultCustomer = email.toLowerCase() === "mariana@gmail.com" && password === "cliente123";

        const isValid = isDefaultProgramador || isDefaultNayara || isDefaultFinanceiro || isDefaultCustomer || 
                        (user.passwordHash === password) || (user.passwordHash === calculatedHash);

        if (!isValid) {
          return makeResponse({ error: "Credenciais inválidas" }, 401);
        }

        const { passwordHash, ...userResponse } = user;
        return makeResponse(userResponse);
      }

      if (pathname === "/api/auth/register") {
        const users = getStore("users", DEFAULT_USERS);
        const existing = users.find((u: any) => u.email.toLowerCase() === bodyData.email.toLowerCase());
        if (existing) {
          return makeResponse({ error: "E-mail já cadastrado" }, 400);
        }

        const passHash = await hashStr(bodyData.password || "cliente123");
        const newUser = {
          id: `usr-${Date.now()}`,
          fullName: bodyData.fullName,
          cpf: bodyData.cpf,
          rg: bodyData.rg || "",
          birthDate: bodyData.birthDate,
          phone: bodyData.phone,
          whatsapp: bodyData.whatsapp || bodyData.phone,
          email: bodyData.email,
          passwordHash: passHash,
          addresses: bodyData.address ? [ { ...bodyData.address, id: `addr-${Date.now()}` } ] : [],
          role: "customer",
          blocked: false,
          totalSpent: 0,
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        setStore("users", users);
        const { passwordHash, ...userResponse } = newUser;
        return makeResponse(userResponse);
      }

      if (pathname === "/api/users") {
        const users = getStore("users", DEFAULT_USERS);
        return makeResponse(users.map(({ passwordHash, ...u }: any) => u));
      }

      if (pathname.startsWith("/api/users/")) {
        const id = pathname.split("/").pop();
        const users = getStore("users", DEFAULT_USERS);
        const existingIndex = users.findIndex((u: any) => u.id === id);
        if (existingIndex === -1) {
          return makeResponse({ error: "Usuário não encontrado" }, 404);
        }

        users[existingIndex] = {
          ...users[existingIndex],
          ...bodyData,
          id: users[existingIndex].id // keep locked
        };

        setStore("users", users);
        const { passwordHash, ...userResponse } = users[existingIndex];
        return makeResponse(userResponse);
      }

      // 3. ORDERS
      if (pathname === "/api/orders") {
        const orders = getStore("orders", DEFAULT_ORDERS);
        const customerId = url.searchParams.get("customerId");
        if (method === "GET") {
          if (customerId) {
            return makeResponse(orders.filter((o: any) => o.customerId === customerId));
          }
          return makeResponse(orders);
        }
        if (method === "POST") {
          const newOrder = {
            id: `ped-${1000 + orders.length + 1}`,
            customerId: bodyData.customerId,
            customerName: bodyData.customerName,
            status: "Pedido recebido",
            items: bodyData.items,
            total: bodyData.total,
            discountCupom: bodyData.discountCupom || null,
            discountAmount: bodyData.discountAmount || 0,
            shippingCost: bodyData.shippingCost || 0,
            deliveryAddress: bodyData.deliveryAddress,
            observations: bodyData.observations || "",
            createdAt: new Date().toISOString(),
            timeline: [
              {
                status: "Pedido recebido",
                date: new Date().toISOString(),
                notes: "Pedido gerado no site e registrado no sistema.",
                responsible: "Sistema"
              },
              {
                status: "Pagamento pendente",
                date: new Date().toISOString(),
                notes: "Aguardando confirmação de pagamento do Pix/Boleto.",
                responsible: "Financeiro"
              }
            ]
          };

          orders.push(newOrder);
          setStore("orders", orders);

          // Update user spent
          const users = getStore("users", DEFAULT_USERS);
          const uIdx = users.findIndex((u: any) => u.id === bodyData.customerId);
          if (uIdx !== -1) {
            users[uIdx].totalSpent = (users[uIdx].totalSpent || 0) + newOrder.total;
            setStore("users", users);
          }

          // Create Production item if payment approved or direct simulation
          const production = getStore("production", DEFAULT_PRODUCTION);
          const newProdItem = {
            id: `prod-q-${Date.now()}`,
            orderId: newOrder.id,
            productName: newOrder.items[0]?.productName || "Mimo Personalizado",
            customerName: newOrder.customerName,
            status: "fila" as const,
            priority: "media" as const,
            estimatedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            responsibleUser: "Carlos Souza",
            notes: "Novo pedido registrado na fila de confecção."
          };
          production.push(newProdItem);
          setStore("production", production);

          // Add to finance entries
          const finance = getStore("finance", DEFAULT_FINANCE);
          const newFin = {
            id: `fin-${Date.now()}`,
            type: "receita" as const,
            category: "Venda Loja Online",
            amount: newOrder.total,
            date: new Date().toISOString().split("T")[0],
            description: `Venda referente ao pedido ${newOrder.id}`,
            status: "pendente" as const,
            supplierOrClient: newOrder.customerName,
            paymentMethod: "Pix"
          };
          finance.push(newFin);
          setStore("finance", finance);

          return makeResponse(newOrder);
        }
      }

      if (pathname.includes("/status")) {
        // e.g. /api/orders/ped-1002/status
        const parts = pathname.split("/");
        const idIdx = parts.indexOf("orders") + 1;
        const id = parts[idIdx];
        const orders = getStore("orders", DEFAULT_ORDERS);
        const order = orders.find((o: any) => o.id === id);

        if (!order) {
          return makeResponse({ error: "Pedido não encontrado" }, 404);
        }

        const { status, notes, responsible } = bodyData;
        order.status = status;
        order.timeline.push({
          status,
          date: new Date().toISOString(),
          notes: notes || `Alteração automática de status para ${status}.`,
          responsible: responsible || "Operador"
        });

        // Sync production status
        const production = getStore("production", DEFAULT_PRODUCTION);
        const pItem = production.find((p: any) => p.orderId === order.id);
        if (pItem) {
          if (status === "Em produção") pItem.status = "produzindo";
          if (["Aguardando envio", "Enviado", "Entregue"].includes(status)) pItem.status = "finalizado";
          setStore("production", production);
        }

        // Sync finance status
        if (status === "Pagamento aprovado") {
          const finance = getStore("finance", DEFAULT_FINANCE);
          const fin = finance.find((f: any) => f.description.includes(order.id));
          if (fin) {
            fin.status = "pago";
            setStore("finance", finance);
          }
        }

        setStore("orders", orders);
        return makeResponse(order);
      }

      if (pathname.startsWith("/api/orders/")) {
        const id = pathname.split("/").pop();
        const orders = getStore("orders", DEFAULT_ORDERS);
        const order = orders.find((o: any) => o.id === id);
        return order ? makeResponse(order) : makeResponse({ error: "Pedido não encontrado" }, 404);
      }

      // 4. FINANCE
      if (pathname === "/api/finance") {
        const finance = getStore("finance", DEFAULT_FINANCE);
        if (method === "GET") {
          return makeResponse(finance);
        }
        if (method === "POST") {
          const newFin = {
            id: bodyData.id || `fin-${Date.now()}`,
            type: bodyData.type,
            category: bodyData.category,
            amount: Number(bodyData.amount),
            date: bodyData.date,
            description: bodyData.description || "",
            status: bodyData.status || "pendente",
            supplierOrClient: bodyData.supplierOrClient || "",
            paymentMethod: bodyData.paymentMethod || "Pix"
          };
          const index = finance.findIndex((f: any) => f.id === newFin.id);
          if (index !== -1) {
            finance[index] = newFin;
          } else {
            finance.push(newFin);
          }
          setStore("finance", finance);
          return makeResponse(newFin);
        }
      }

      if (pathname.startsWith("/api/finance/")) {
        const id = pathname.split("/").pop();
        const finance = getStore("finance", DEFAULT_FINANCE);
        const filtered = finance.filter((f: any) => f.id !== id);
        setStore("finance", filtered);
        return makeResponse({ success: true });
      }

      // 5. PRODUCTION
      if (pathname === "/api/production") {
        const production = getStore("production", DEFAULT_PRODUCTION);
        return makeResponse(production);
      }

      if (pathname.startsWith("/api/production/")) {
        const id = pathname.split("/").pop();
        const production = getStore("production", DEFAULT_PRODUCTION);
        const existingIdx = production.findIndex((p: any) => p.id === id);
        if (existingIdx === -1) {
          return makeResponse({ error: "Item de produção não encontrado" }, 404);
        }
        production[existingIdx] = {
          ...production[existingIdx],
          ...bodyData,
          id: production[existingIdx].id
        };
        setStore("production", production);
        return makeResponse(production[existingIdx]);
      }

      // 6. STOCK
      if (pathname === "/api/stock") {
        const stock = getStore("stock", DEFAULT_STOCK);
        if (method === "GET") {
          return makeResponse(stock);
        }
        if (method === "POST") {
          const existingId = bodyData.id;
          let item: any;
          if (existingId) {
            const existing = stock.find((s: any) => s.id === existingId);
            if (existing) {
              const diff = bodyData.quantity - existing.quantity;
              item = {
                ...existing,
                name: bodyData.name,
                quantity: Number(bodyData.quantity),
                minQuantity: Number(bodyData.minQuantity || existing.minQuantity),
                unit: bodyData.unit
              };
              if (diff !== 0) {
                item.history.push({
                  type: diff > 0 ? "entrada" : "saida",
                  quantity: Math.abs(diff),
                  date: new Date().toISOString().split("T")[0],
                  reason: bodyData.reason || "Ajuste manual de estoque"
                });
              }
            }
          }

          if (!item) {
            item = {
              id: `stk-${Date.now()}`,
              name: bodyData.name,
              quantity: Number(bodyData.quantity),
              minQuantity: Number(bodyData.minQuantity || 0),
              unit: bodyData.unit,
              history: [
                {
                  type: "entrada",
                  quantity: Number(bodyData.quantity),
                  date: new Date().toISOString().split("T")[0],
                  reason: "Registro inicial do material"
                }
              ]
            };
          }

          const index = stock.findIndex((s: any) => s.id === item.id);
          if (index !== -1) {
            stock[index] = item;
          } else {
            stock.push(item);
          }
          setStore("stock", stock);
          return makeResponse(item);
        }
      }

      // 7. GALLERY
      if (pathname === "/api/gallery") {
        const gallery = getStore("gallery", DEFAULT_GALLERY);
        if (method === "GET") {
          return makeResponse(gallery);
        }
        if (method === "POST") {
          const item = {
            id: bodyData.id || `gal-${Date.now()}`,
            title: bodyData.title,
            imageUrl: bodyData.imageUrl,
            description: bodyData.description || "",
            category: bodyData.category || "Geral",
            createdAt: bodyData.createdAt || new Date().toISOString()
          };
          const index = gallery.findIndex((g: any) => g.id === item.id);
          if (index !== -1) {
            gallery[index] = item;
          } else {
            gallery.push(item);
          }
          setStore("gallery", gallery);
          return makeResponse(item);
        }
      }

      if (pathname.startsWith("/api/gallery/")) {
        const id = pathname.split("/").pop();
        const gallery = getStore("gallery", DEFAULT_GALLERY);
        if (method === "DELETE") {
          const originalLen = gallery.length;
          const filtered = gallery.filter((g: any) => g.id !== id);
          if (filtered.length < originalLen) {
            setStore("gallery", filtered);
            return makeResponse({ success: true });
          } else {
            return makeResponse({ error: "Item da galeria não encontrado" }, 404);
          }
        }
      }
    }

    // Call real fetch if not intercepted or if mock is turned off
    return originalFetch(input, init);
  };

  try {
    window.fetch = customFetch;
  } catch (e) {
    try {
      Object.defineProperty(window, "fetch", {
        value: customFetch,
        configurable: true,
        writable: true
      });
    } catch (err) {
      console.error("[Mimos API Mock] Erro ao redefinir window.fetch:", err);
    }
  }
}
