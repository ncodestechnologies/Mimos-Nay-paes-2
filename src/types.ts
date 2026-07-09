export interface Address {
  id?: string;
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
  addresses: Address[];
  role: "admin" | "finance" | "production" | "atendimento" | "customer";
  blocked: boolean;
  internalNotes?: string;
  avatar?: string;
  totalSpent: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  productionTime: string;
  categories: string[];
  availability: boolean;
  stock: number;
  images: string[];
  customizations: string[];
  observations?: string;
  relatedIds: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  customizations: Record<string, string>;
  notes?: string;
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
  unit: string;
  history: {
    type: "entrada" | "saida";
    quantity: number;
    date: string;
    reason: string;
  }[];
}
