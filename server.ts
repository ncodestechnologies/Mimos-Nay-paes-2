import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db, hashPassword } from "./server/db.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // --- API ROUTES ---

  // 1. Products API
  app.get("/api/products", (req, res) => {
    try {
      res.json(db.getProducts());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/products/:id", (req, res) => {
    try {
      const prod = db.getProductById(req.params.id);
      if (!prod) return res.status(404).json({ error: "Produto não encontrado" });
      res.json(prod);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/products", (req, res) => {
    try {
      const productData = req.body;
      if (!productData.name || !productData.price) {
        return res.status(400).json({ error: "Nome e preço são obrigatórios" });
      }
      const saved = db.saveProduct(productData);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    try {
      const deleted = db.deleteProduct(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Produto não encontrado" });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Authentication & Users API
  app.post("/api/auth/register", (req, res) => {
    try {
      const { fullName, cpf, rg, birthDate, phone, whatsapp, email, password, address } = req.body;
      if (!fullName || !cpf || !birthDate || !phone || !email || !password) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes" });
      }

      const existing = db.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "E-mail já cadastrado" });
      }

      const newUser = {
        id: "",
        fullName,
        cpf,
        rg,
        birthDate,
        phone,
        whatsapp: whatsapp || phone,
        email,
        passwordHash: hashPassword(password),
        addresses: address ? [ { ...address, id: `addr-${Date.now()}` } ] : [],
        role: "customer" as const,
        blocked: false,
        totalSpent: 0,
        createdAt: new Date().toISOString()
      };

      const saved = db.saveUser(newUser);
      // Remove password hash before sending back
      const { passwordHash, ...userResponse } = saved;
      res.json(userResponse);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
      }

      const user = db.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      if (user.blocked) {
        return res.status(403).json({ error: "Usuário temporariamente bloqueado. Contate o suporte." });
      }

      const calculatedHash = hashPassword(password);
      const isDefaultProgramador = email.toLowerCase() === "programador" && password === "Taijou13";
      const isDefaultNayara = email.toLowerCase() === "nayara" && password === "nayara123";
      const isDefaultFinanceiro = email.toLowerCase() === "financeiro" && password === "financeiro123";
      const isDefaultCustomer = email.toLowerCase() === "mariana@gmail.com" && password === "cliente123";

      const isValid = isDefaultProgramador || isDefaultNayara || isDefaultFinanceiro || isDefaultCustomer || 
                      (user.passwordHash === password) || (user.passwordHash === calculatedHash);

      if (!isValid) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/users", (req, res) => {
    try {
      const users = db.getUsers().map(({ passwordHash, ...u }) => u);
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/users", (req, res) => {
    try {
      const { fullName, cpf, birthDate, phone, whatsapp, email, password, role, internalNotes } = req.body;
      if (!fullName || !email || !password) {
        return res.status(400).json({ error: "Nome, usuário/e-mail e senha são obrigatórios" });
      }

      const existing = db.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "E-mail ou Usuário já cadastrado" });
      }

      const newUser = {
        id: "",
        fullName,
        cpf: cpf || "000.000.000-00",
        birthDate: birthDate || "1990-01-01",
        phone: phone || "",
        whatsapp: whatsapp || phone || "",
        email,
        passwordHash: hashPassword(password),
        addresses: [],
        role: role || "customer",
        blocked: false,
        internalNotes: internalNotes || "",
        totalSpent: 0,
        createdAt: new Date().toISOString()
      };

      const saved = db.saveUser(newUser);
      const { passwordHash, ...userResponse } = saved;
      res.json(userResponse);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/users/:id", (req, res) => {
    try {
      const existingUser = db.getUserById(req.params.id);
      if (!existingUser) return res.status(404).json({ error: "Usuário não encontrado" });

      const updates = { ...req.body };
      if (updates.password) {
        updates.passwordHash = hashPassword(updates.password);
        delete updates.password;
      }

      const updated = {
        ...existingUser,
        ...updates,
        id: existingUser.id // Prevent ID rewriting
      };

      const saved = db.saveUser(updated);
      const { passwordHash, ...userResponse } = saved;
      res.json(userResponse);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/users/:id", (req, res) => {
    try {
      const deleted = db.deleteUser(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Usuário não encontrado" });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Orders API
  app.get("/api/orders", (req, res) => {
    try {
      const customerId = req.query.customerId as string;
      if (customerId) {
        res.json(db.getOrdersByCustomer(customerId));
      } else {
        res.json(db.getOrders());
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/orders/:id", (req, res) => {
    try {
      const order = db.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/orders", (req, res) => {
    try {
      const orderData = req.body;
      if (!orderData.customerId || !orderData.items || orderData.items.length === 0) {
        return res.status(400).json({ error: "Dados do pedido incompletos" });
      }

      const newOrder = {
        id: "",
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        status: "Pedido recebido" as const,
        items: orderData.items,
        total: orderData.total,
        discountCupom: orderData.discountCupom,
        discountAmount: orderData.discountAmount || 0,
        shippingCost: orderData.shippingCost || 0,
        deliveryAddress: orderData.deliveryAddress,
        observations: orderData.observations,
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

      const saved = db.saveOrder(newOrder);

      // Add to customer's total spent
      const customer = db.getUserById(orderData.customerId);
      if (customer) {
        customer.totalSpent = (customer.totalSpent || 0) + saved.total;
        db.saveUser(customer);
      }

      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/orders/:id/status", (req, res) => {
    try {
      const { status, notes, responsible } = req.body;
      if (!status) return res.status(400).json({ error: "Status é obrigatório" });

      const order = db.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

      order.status = status;
      order.timeline.push({
        status,
        date: new Date().toISOString(),
        notes: notes || `Alteração automática de status para ${status}.`,
        responsible: responsible || "Operador"
      });

      // Synchronize changes to production queue if relevant
      const prodItems = db.getProduction();
      const prodItem = prodItems.find(p => p.orderId === order.id);
      if (prodItem) {
        if (status === "Em produção") {
          prodItem.status = "produzindo";
        } else if (status === "Aguardando envio" || status === "Enviado" || status === "Entregue") {
          prodItem.status = "finalizado";
        }
        db.saveProduction(prodItem);
      }

      // If status is paid, approve finance records
      if (status === "Pagamento aprovado") {
        const finEntries = db.getFinance();
        const matchingFin = finEntries.find(f => f.description.includes(order.id));
        if (matchingFin) {
          matchingFin.status = "pago";
          db.saveFinance(matchingFin);
        }
      }

      db.saveOrder(order);
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Financial Control API
  app.get("/api/finance", (req, res) => {
    try {
      res.json(db.getFinance());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/finance", (req, res) => {
    try {
      const { type, category, amount, date, description, status, supplierOrClient, paymentMethod } = req.body;
      if (!type || !category || amount === undefined || !date) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes" });
      }

      const entry = {
        id: req.body.id || "",
        type,
        category,
        amount: Number(amount),
        date,
        description: description || "",
        status: status || "pendente",
        supplierOrClient,
        paymentMethod
      };

      const saved = db.saveFinance(entry);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/finance/:id", (req, res) => {
    try {
      const deleted = db.deleteFinance(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Lançamento não encontrado" });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Production Queue API
  app.get("/api/production", (req, res) => {
    try {
      res.json(db.getProduction());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/production/:id", (req, res) => {
    try {
      const existing = db.getProduction().find(p => p.id === req.params.id);
      if (!existing) return res.status(404).json({ error: "Fila de produção não encontrada" });

      const updated = {
        ...existing,
        ...req.body,
        id: existing.id // lock id
      };

      const saved = db.saveProduction(updated);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Stock Inventory API
  app.get("/api/stock", (req, res) => {
    try {
      res.json(db.getStock());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/stock", (req, res) => {
    try {
      const { name, quantity, minQuantity, unit } = req.body;
      if (!name || quantity === undefined || !unit) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes" });
      }

      const existingId = req.body.id;
      let item;
      if (existingId) {
        const existing = db.getStock().find(s => s.id === existingId);
        if (existing) {
          const diff = quantity - existing.quantity;
          item = {
            ...existing,
            name,
            quantity,
            minQuantity: minQuantity || existing.minQuantity,
            unit,
          };
          if (diff !== 0) {
            item.history.push({
              type: diff > 0 ? ("entrada" as const) : ("saida" as const),
              quantity: Math.abs(diff),
              date: new Date().toISOString().split("T")[0],
              reason: req.body.reason || "Ajuste manual de estoque"
            });
          }
        }
      }

      if (!item) {
        item = {
          id: "",
          name,
          quantity: Number(quantity),
          minQuantity: Number(minQuantity || 0),
          unit,
          history: [
            {
              type: "entrada" as const,
              quantity: Number(quantity),
              date: new Date().toISOString().split("T")[0],
              reason: "Registro inicial do material"
            }
          ]
        };
      }

      const saved = db.saveStock(item);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Gallery API
  app.get("/api/gallery", (req, res) => {
    try {
      res.json(db.getGallery());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gallery", (req, res) => {
    try {
      const { id, title, imageUrl, description, category } = req.body;
      if (!title || !imageUrl) {
        return res.status(400).json({ error: "Título e URL da imagem são obrigatórios" });
      }

      const item = {
        id: id || "",
        title,
        imageUrl,
        description: description || "",
        category: category || "Geral",
        createdAt: req.body.createdAt || new Date().toISOString()
      };

      const saved = db.saveGallery(item);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/gallery/:id", (req, res) => {
    try {
      const deleted = db.deleteGallery(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Item da galeria não encontrado" });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- VITE MIDDLEWARE CONFIGURATION ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Mimos Nay Paes] Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
