import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Plus,
  Trash2,
  Search,
  DollarSign,
  TrendingUp,
  Check,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  BarChart3,
  Receipt,
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  Calendar,
  CreditCard,
  Pencil
} from 'lucide-react';

// --- CARGA INMEDIATA DE TAILWIND CDN (Evita parpadeos sin estilo) ---
if (typeof document !== 'undefined' && !document.getElementById('tailwind-cdn-script')) {
  const script = document.createElement('script');
  script.id = 'tailwind-cdn-script';
  script.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(script);
}

// --- UTILIDADES DE FORMATO ---
const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(amount || 0);

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// --- DATOS INICIALES DEL SISTEMA ---
const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Fernet Branca 750ml', category: 'Aperitivos', brand: 'Branca', costPrice: 7200, sellPrice: 10500, stock: 18, minStock: 8 },
  { id: 'p2', name: 'Coca-Cola 2.25L', category: 'Gaseosas', brand: 'Coca-Cola', costPrice: 1900, sellPrice: 2900, stock: 42, minStock: 15 },
  { id: 'p3', name: 'Bolsa de Hielo Rolo 4kg', category: 'Insumos', brand: 'Hielo Puro', costPrice: 700, sellPrice: 1600, stock: 25, minStock: 10 },
  { id: 'p4', name: 'Gin Bombay Sapphire 750ml', category: 'Destilados', brand: 'Bombay', costPrice: 18500, sellPrice: 26500, stock: 5, minStock: 4 },
  { id: 'p5', name: 'Agua Tónica Paso de los Toros 1.5L', category: 'Gaseosas', brand: 'Paso de los Toros', costPrice: 1200, sellPrice: 2100, stock: 30, minStock: 10 },
  { id: 'p6', name: 'Cerveza Stella Artois 730ml', category: 'Cervezas', brand: 'Stella Artois', costPrice: 1800, sellPrice: 2700, stock: 6, minStock: 12 },
];

const INITIAL_PROMOS = [
  {
    id: 'pr1',
    name: 'Combo Fernetero Clásico',
    type: 'pack',
    price: 15500,
    active: true,
    description: '1 Fernet Branca 750ml + 2 Coca-Cola 2.25L + 1 Bolsa de Hielo',
    items: [
      { productId: 'p1', quantity: 1, name: 'Fernet Branca 750ml' },
      { productId: 'p2', quantity: 2, name: 'Coca-Cola 2.25L' },
      { productId: 'p3', quantity: 1, name: 'Bolsa de Hielo 4kg' }
    ]
  },
  {
    id: 'pr2',
    name: 'Descuento Gin Tonic 10% OFF',
    type: 'discount',
    price: 27000,
    active: true,
    description: 'Pack Gin Bombay + 2 Tónicas con 10% de descuento aplicado',
    items: [
      { productId: 'p4', quantity: 1, name: 'Gin Bombay Sapphire 750ml' },
      { productId: 'p5', quantity: 2, name: 'Agua Tónica 1.5L' }
    ]
  }
];

const INITIAL_CLIENTS = [
  { id: 'cli1', name: 'Bar La Previa', phone: '+54 9 11 4522-9988', debt: 31500 },
  { id: 'cli2', name: 'Eventos Quinta Las Lilas', phone: '+54 9 11 3200-7711', debt: 0 }
];

const INITIAL_SALES = [
  {
    id: 'V-101',
    date: new Date().toISOString(),
    client: 'Cliente Casual',
    paymentMethod: 'Efectivo',
    total: 15000,
    cost: 9800,
    profit: 5200,
    items: [
      { id: 'p1', name: 'Fernet Branca 750ml', qty: 1, price: 10500, type: 'product', raw: INITIAL_PRODUCTS[0] },
      { id: 'p2', name: 'Coca-Cola 2.25L', qty: 1, price: 2900, type: 'product', raw: INITIAL_PRODUCTS[1] },
      { id: 'p3', name: 'Bolsa de Hielo Rolo 4kg', qty: 1, price: 1600, type: 'product', raw: INITIAL_PRODUCTS[2] }
    ]
  },
  {
    id: 'V-102',
    date: new Date(Date.now() - 3600000 * 3).toISOString(),
    client: 'Bar La Previa',
    paymentMethod: 'Fiado',
    total: 31500,
    cost: 21600,
    profit: 9900,
    items: [
      { id: 'p1', name: 'Fernet Branca 750ml', qty: 3, price: 10500, type: 'product', raw: INITIAL_PRODUCTS[0] }
    ]
  }
];

// --- COMPONENTE PRINCIPAL ---
export default function BusinessManagerApp() {
  const [, setIsTailwindReady] = useState(() => {
    return typeof window !== 'undefined' && !!window.tailwind;
  });

  useEffect(() => {
    const script = document.getElementById('tailwind-cdn-script');
    if (!script) return;

    const handleLoad = () => setIsTailwindReady(true);

    if (window.tailwind) {
      setIsTailwindReady(true);
    } else {
      script.addEventListener('load', handleLoad);
      return () => script.removeEventListener('load', handleLoad);
    }
  }, []);

  const [activeTab, setActiveTab] = useState('sales');

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('benga_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [promos, setPromos] = useState(() => {
    const saved = localStorage.getItem('benga_promos');
    return saved ? JSON.parse(saved) : INITIAL_PROMOS;
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('benga_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('benga_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  useEffect(() => {
    localStorage.setItem('benga_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('benga_promos', JSON.stringify(promos));
  }, [promos]);

  useEffect(() => {
    localStorage.setItem('benga_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('benga_clients', JSON.stringify(clients));
  }, [clients]);

  const [saleCart, setSaleCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState('Cliente Casual');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [saleToDeleteConfirm, setSaleToDeleteConfirm] = useState(null);
  const [saleToPayModal, setSaleToPayModal] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const metrics = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
    const totalCost = sales.reduce((acc, s) => acc + s.cost, 0);
    const netProfit = totalRevenue - totalCost;
    const totalPendingDebt = clients.reduce((acc, c) => acc + c.debt, 0);
    const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
    const stockValuation = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);

    return { totalRevenue, totalCost, netProfit, totalPendingDebt, lowStockCount, stockValuation };
  }, [sales, clients, products]);

  const categories = useMemo(() => {
    return ['Todas', ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  const availableItems = useMemo(() => {
    let items = [];

    promos.filter(p => p.active).forEach(p => {
      items.push({
        id: p.id,
        name: p.name,
        type: 'promo',
        price: p.price,
        description: p.description,
        raw: p
      });
    });

    products.forEach(p => {
      if (categoryFilter === 'Todas' || p.category === categoryFilter) {
        items.push({
          id: p.id,
          name: p.name,
          type: 'product',
          price: p.sellPrice,
          costPrice: p.costPrice,
          stock: p.stock,
          brand: p.brand,
          category: p.category,
          raw: p
        });
      }
    });

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(term));
    }

    return items;
  }, [products, promos, categoryFilter, searchTerm]);

  const addToSaleCart = (item) => {
    if (item.type === 'product' && item.stock <= 0) {
      notify('⚠️ Producto sin stock disponible');
      return;
    }

    setSaleCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setSaleCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty <= 0 ? null : { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = useMemo(() => saleCart.reduce((acc, i) => acc + i.price * i.qty, 0), [saleCart]);

  const cartCostTotal = useMemo(() => {
    return saleCart.reduce((acc, item) => {
      if (item.type === 'product') {
        return acc + item.costPrice * item.qty;
      } else if (item.type === 'promo') {
        const promoCost = item.raw.items.reduce((pAcc, comp) => {
          const prod = products.find((p) => p.id === comp.productId);
          return pAcc + (prod ? prod.costPrice * comp.quantity : 0);
        }, 0);
        return acc + promoCost * item.qty;
      }
      return acc;
    }, 0);
  }, [saleCart, products]);

  const handleRegisterSale = () => {
    if (saleCart.length === 0) return;

    if (paymentMethod === 'Fiado' && selectedClient === 'Cliente Casual') {
      notify('⚠️ Para fiar, seleccioná un cliente específico de la lista');
      return;
    }

    let updatedProducts = [...products];
    saleCart.forEach((item) => {
      if (item.type === 'product') {
        updatedProducts = updatedProducts.map((p) =>
          p.id === item.id ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p
        );
      } else if (item.type === 'promo') {
        item.raw.items.forEach((comp) => {
          updatedProducts = updatedProducts.map((p) =>
            p.id === comp.productId ? { ...p, stock: Math.max(0, p.stock - comp.quantity * item.qty) } : p
          );
        });
      }
    });

    setProducts(updatedProducts);

    if (paymentMethod === 'Fiado') {
      setClients((prevClients) =>
        prevClients.map((c) =>
          c.name === selectedClient
            ? { ...c, debt: c.debt + cartTotal }
            : c
        )
      );
    }

    const newSale = {
      id: `V-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      client: selectedClient,
      paymentMethod,
      total: cartTotal,
      cost: cartCostTotal,
      profit: cartTotal - cartCostTotal,
      items: saleCart.map((i) => ({
        id: i.id,
        name: i.name,
        qty: i.qty,
        price: i.price,
        type: i.type,
        raw: i.raw
      }))
    };

    setSales([newSale, ...sales]);
    setSaleCart([]);
    notify(
      paymentMethod === 'Fiado'
        ? `📝 Venta fiada a ${selectedClient} por ${formatCurrency(cartTotal)}`
        : `✅ Venta #${newSale.id} registrada correctamente (${newSale.items.length} productos)`
    );
  };

  const handleMarkSaleAsPaid = (saleId, newPaymentMethod) => {
    const saleToPay = sales.find((s) => s.id === saleId);
    if (!saleToPay || saleToPay.paymentMethod !== 'Fiado') return;

    setSales((prevSales) =>
      prevSales.map((s) =>
        s.id === saleId ? { ...s, paymentMethod: newPaymentMethod } : s
      )
    );

    setClients((prevClients) =>
      prevClients.map((c) =>
        c.name === saleToPay.client
          ? { ...c, debt: Math.max(0, c.debt - saleToPay.total) }
          : c
      )
    );

    setSaleToPayModal(null);
    notify(`✅ Venta #${saleToPay.id} marcada como PAGADA con ${newPaymentMethod}`);
  };

  const handleDeleteSale = (saleId) => {
    const saleToDelete = sales.find((s) => s.id === saleId);
    if (!saleToDelete) return;

    setProducts((prevProducts) => {
      let updated = [...prevProducts];

      saleToDelete.items.forEach((item) => {
        if (item.type === 'product' || !item.type) {
          updated = updated.map((p) =>
            p.id === item.id || p.name === item.name
              ? { ...p, stock: p.stock + item.qty }
              : p
          );
        } else if (item.type === 'promo') {
          const promoRef = item.raw || promos.find((pr) => pr.id === item.id);
          if (promoRef && promoRef.items) {
            promoRef.items.forEach((comp) => {
              updated = updated.map((p) =>
                p.id === comp.productId
                  ? { ...p, stock: p.stock + comp.quantity * item.qty }
                  : p
              );
            });
          }
        }
      });

      return updated;
    });

    if (saleToDelete.paymentMethod === 'Fiado') {
      setClients((prevClients) =>
        prevClients.map((c) =>
          c.name === saleToDelete.client
            ? { ...c, debt: Math.max(0, c.debt - saleToDelete.total) }
            : c
        )
      );
    }

    setSales((prevSales) => prevSales.filter((s) => s.id !== saleId));
    setSaleToDeleteConfirm(null);
    notify(`🗑️ Venta ${saleToDelete.id} eliminada.`);
  };

  const handleDeleteClient = (clientId) => {
    const clientToDelete = clients.find((c) => c.id === clientId);
    if (!clientToDelete) return;

    if (selectedClient === clientToDelete.name) {
      setSelectedClient('Cliente Casual');
    }

    setClients((prev) => prev.filter((c) => c.id !== clientId));
    notify(`🗑️ Cliente "${clientToDelete.name}" eliminado`);
  };

  const handleAdjustStock = (productId, delta) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
    );
    notify('📦 Stock actualizado');
  };

  const handleDeleteProduct = (productId) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setSaleCart((prev) => prev.filter((item) => item.id !== productId));
    notify(`🗑️ ${prod ? prod.name : 'Producto'} eliminado`);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newP = {
      id: `p-${Date.now()}`,
      name: fd.get('name'),
      brand: fd.get('brand'),
      category: fd.get('category'),
      costPrice: parseFloat(fd.get('costPrice')),
      sellPrice: parseFloat(fd.get('sellPrice')),
      stock: parseInt(fd.get('stock'), 10),
      minStock: parseInt(fd.get('minStock'), 10),
    };
    setProducts([...products, newP]);
    setShowProductModal(false);
    notify('✨ Producto añadido al catálogo');
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newCost = parseFloat(fd.get('costPrice'));
    const newSell = parseFloat(fd.get('sellPrice'));

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: fd.get('name'),
              brand: fd.get('brand'),
              category: fd.get('category'),
              costPrice: isNaN(newCost) ? p.costPrice : newCost,
              sellPrice: isNaN(newSell) ? p.sellPrice : newSell,
              minStock: parseInt(fd.get('minStock'), 10) || p.minStock
            }
          : p
      )
    );
    setEditingProduct(null);
    notify('✏️ Precios y datos actualizados');
  };

  const handleAddPromo = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newPromo = {
      id: `pr-${Date.now()}`,
      name: fd.get('name'),
      type: fd.get('type'),
      price: parseFloat(fd.get('price')),
      active: true,
      description: fd.get('description'),
      items: []
    };
    setPromos([...promos, newPromo]);
    setShowPromoModal(false);
    notify(`🎉 Promoción "${newPromo.name}" creada`);
  };

  const handleDeletePromo = (promoId) => {
    const promo = promos.find((p) => p.id === promoId);
    setPromos((prev) => prev.filter((p) => p.id !== promoId));
    setSaleCart((prev) => prev.filter((item) => item.id !== promoId));
    notify(`🗑️ Promoción eliminada`);
  };

  const handleUpdatePromo = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newPrice = parseFloat(fd.get('price'));

    setPromos((prev) =>
      prev.map((p) =>
        p.id === editingPromo.id
          ? {
              ...p,
              name: fd.get('name'),
              type: fd.get('type'),
              price: isNaN(newPrice) ? p.price : newPrice,
              description: fd.get('description')
            }
          : p
      )
    );
    setEditingPromo(null);
    notify('✏️ Promoción actualizada');
  };

  const togglePromoActive = (id) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row antialiased">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] bg-fuchsia-500 text-slate-950 px-4 py-3 rounded-2xl font-bold shadow-2xl shadow-fuchsia-500/40 flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5 stroke-[3]" />
          <span className="text-sm">{toast}</span>
        </div>
      )}

      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800/80 p-5 flex flex-col justify-between backdrop-blur-md">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-gradient-to-tr from-fuchsia-600 to-purple-500 p-2.5 rounded-2xl text-slate-950 font-bold shadow-lg shadow-fuchsia-500/25">
              <BarChart3 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-white">Benga Drinks</h1>
              <p className="text-[11px] text-fuchsia-400 font-semibold tracking-wider">GESTIÓN DE STOCK & VENTAS</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <SidebarBtn active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} icon={<Receipt />}>
              Registrar Venta
            </SidebarBtn>
            <SidebarBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />}>
              Resumen de ventas
            </SidebarBtn>
            <SidebarBtn active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package />} badge={metrics.lowStockCount > 0 ? `${metrics.lowStockCount}` : null}>
              Inventario & Stock
            </SidebarBtn>
            <SidebarBtn active={activeTab === 'promos'} onClick={() => setActiveTab('promos')} icon={<Sparkles />}>
              Promociones
            </SidebarBtn>
            <SidebarBtn active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<Users />} badge={metrics.totalPendingDebt > 0 ? 'Fiados' : null}>
              Cuentas Corrientes
            </SidebarBtn>
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950">
        {activeTab === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-5">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o promo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 transition"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      categoryFilter === cat
                        ? 'bg-fuchsia-500 text-slate-950 border-fuchsia-500 font-bold shadow-md shadow-fuchsia-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => addToSaleCart(item)}
                    className="bg-slate-900/80 border border-slate-800 hover:border-fuchsia-500/50 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          {item.type === 'promo' ? 'PROMO' : item.brand}
                        </span>
                        {item.type === 'product' && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            item.stock <= item.raw.minStock
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            Stock: {item.stock}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-xs text-slate-100 group-hover:text-fuchsia-400 transition mt-1 line-clamp-2">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                      <span className="font-mono font-bold text-sm text-fuchsia-400">
                        {formatCurrency(item.price)}
                      </span>
                      <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-fuchsia-500 group-hover:text-slate-950 flex items-center justify-center text-slate-300 transition shadow">
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-5 shadow-xl">
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="font-bold text-base text-white flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-fuchsia-400" /> Ticket de Venta
                    </h2>
                    <p className="text-[11px] text-slate-400">Todos los productos cargados se registrarán en esta sola venta</p>
                  </div>
                  {saleCart.length > 0 && (
                    <button onClick={() => setSaleCart([])} className="text-xs text-red-400 hover:underline font-medium">
                      Vaciar
                    </button>
                  )}
                </div>

                <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-1">
                  {saleCart.length === 0 ? (
                    <div className="text-center text-slate-500 py-12 space-y-2">
                      <ShoppingBag className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                      <p className="text-xs">El carrito está vacío.<br />Selecciona los productos para agrupar en esta venta.</p>
                    </div>
                  ) : (
                    saleCart.map((item) => (
                      <div key={item.id} className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex-1 pr-2">
                          <p className="font-medium text-slate-200 line-clamp-1">{item.name}</p>
                          <span className="text-fuchsia-400 font-mono text-[11px]">{formatCurrency(item.price)} c/u</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                          <button onClick={() => updateCartQty(item.id, -1)} className="text-slate-400 hover:text-white px-1 font-bold text-sm">-</button>
                          <span className="font-mono font-bold text-white px-1">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="text-slate-400 hover:text-white px-1 font-bold text-sm">+</button>
                        </div>
                        <span className="font-mono font-bold text-white ml-3 w-20 text-right">
                          {formatCurrency(item.price * item.qty)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">Cliente:</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
                  >
                    <option value="Cliente Casual">Cliente Casual / Ocasional</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {paymentMethod === 'Fiado' && selectedClient === 'Cliente Casual' && (
                    <p className="text-[11px] text-amber-400 font-medium mt-1 flex items-center gap-1">
                      ⚠️ Para fiar debés seleccionar un cliente registrado.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">Medio de Pago:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Efectivo', 'Transferencia', 'Fiado'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                          paymentMethod === m
                            ? m === 'Fiado'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                              : 'bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-400 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Total a Cobrar:</span>
                  <span className="font-mono font-bold text-2xl text-fuchsia-400">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>

                <button
                  disabled={saleCart.length === 0}
                  onClick={handleRegisterSale}
                  className={`w-full font-bold py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                    paymentMethod === 'Fiado'
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                      : 'bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 shadow-fuchsia-500/20'
                  } disabled:bg-slate-800 disabled:text-slate-600`}
                >
                  <Check className="w-5 h-5 stroke-[3]" /> Registrar Venta ({saleCart.length} ítems)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Resumen Comercial</h2>
              <p className="text-xs text-slate-400">Estado general de ingresos, ganancias e historial</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard title="Ingresos Totales" value={formatCurrency(metrics.totalRevenue)} icon={<DollarSign className="text-fuchsia-400" />} />
              <KpiCard title="Ganancia Neta Limpia" value={formatCurrency(metrics.netProfit)} icon={<TrendingUp className="text-purple-400" />} />
              <KpiCard title="Pendiente en Fiados" value={formatCurrency(metrics.totalPendingDebt)} icon={<Users className="text-amber-400" />} />
              <KpiCard title="Productos Bajo Stock" value={metrics.lowStockCount.toString()} icon={<AlertTriangle className="text-red-400" />} />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-fuchsia-400" /> Historial de Ventas Registradas
                </h3>
                <span className="text-xs text-slate-500">{sales.length} ventas</span>
              </div>

              <div className="space-y-2.5">
                {sales.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No hay ventas registradas aún.</p>
                ) : (
                  sales.map((s) => (
                    <div key={s.id} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs hover:border-slate-700 transition">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-200 text-sm">{s.client}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            s.paymentMethod === 'Fiado'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {s.paymentMethod}
                          </span>
                          <span className="text-fuchsia-400 font-mono text-[11px] font-bold bg-fuchsia-500/10 px-2 py-0.5 rounded-md border border-fuchsia-500/20">
                            {s.id}
                          </span>

                          {s.paymentMethod === 'Fiado' && (
                            <button
                              onClick={() => setSaleToPayModal(s)}
                              className="text-[11px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-xl transition flex items-center gap-1 shadow-md shadow-amber-500/20"
                              title="Marcar como pagada esta venta fiada"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Marcar Pagado
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-slate-400 font-medium mr-1">Detalle del Ticket:</span>
                          {s.items && s.items.map((it, idx) => (
                            <span key={idx} className="bg-slate-900 text-slate-200 border border-slate-800 px-2.5 py-1 rounded-xl text-[11px] font-medium flex items-center gap-1">
                              <span className="text-fuchsia-400 font-bold font-mono">{it.qty}x</span> {it.name}
                            </span>
                          ))}
                        </div>

                        <p className="text-slate-500 text-[10px] font-mono flex items-center gap-1 pt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" /> {formatDate(s.date)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 self-end md:self-center">
                        <div className="text-right font-mono">
                          <div className="font-bold text-fuchsia-400 text-base">{formatCurrency(s.total)}</div>
                          <div className="text-[10px] text-purple-400">+Ganancia: {formatCurrency(s.profit)}</div>
                        </div>

                        <button
                          onClick={() => setSaleToDeleteConfirm(s)}
                          title="Eliminar esta venta y restaurar stock"
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Inventario de Productos</h2>
                <p className="text-xs text-slate-400">Control rápido de precios, stock e ingresos</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl text-xs">
                  <span className="text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Capital en Stock (Costo)</span>
                  <span className="text-fuchsia-400 font-mono font-bold text-sm block">
                    {formatCurrency(metrics.stockValuation)}
                  </span>
                </div>

                <button
                  onClick={() => setShowProductModal(true)}
                  className="bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-500/20"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Nuevo Producto
                </button>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-4">Producto</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4 font-mono">Costo</th>
                      <th className="p-4 font-mono">P. Venta</th>
                      <th className="p-4 text-center">Stock Actual</th>
                      <th className="p-4 text-center">Ajuste Rápido</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products.map((p) => {
                      const isLowStock = p.stock <= p.minStock;
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition">
                          <td 
                            className={`p-4 font-semibold ${isLowStock ? 'text-red-400 font-bold' : 'text-slate-200'}`}
                            style={{ color: isLowStock ? '#f87171' : undefined }}
                          >
                            {p.name}
                          </td>
                          <td className="p-4 text-slate-400">{p.category}</td>
                          <td className="p-4 font-mono text-slate-300">{formatCurrency(p.costPrice)}</td>
                          <td className="p-4 font-mono text-fuchsia-400 font-bold">{formatCurrency(p.sellPrice)}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isLowStock
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {p.stock} un.
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center items-center gap-1.5">
                              <button onClick={() => handleAdjustStock(p.id, -1)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs">-</button>
                              <button onClick={() => handleAdjustStock(p.id, 1)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs">+</button>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setEditingProduct(p)}
                                title="Editar precios y producto"
                                className="p-2 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 transition"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                title="Eliminar producto"
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'promos' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Promociones & Combos</h2>
                <p className="text-xs text-slate-400">Armá packs especiales con precio promocional</p>
              </div>
              <button
                onClick={() => setShowPromoModal(true)}
                className="bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-500/20"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Crear Promo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promos.map((p) => (
                <div key={p.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        {p.type}
                      </span>
                      <h3 className="font-bold text-base text-white mt-2">{p.name}</h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingPromo(p)}
                        title="Modificar promoción"
                        className="p-2 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePromo(p.id)}
                        title="Eliminar promoción"
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => togglePromoActive(p.id)} title={p.active ? 'Desactivar promo' : 'Activar promo'}>
                        {p.active ? <ToggleRight className="w-7 h-7 text-fuchsia-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">{p.description}</p>

                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex justify-between items-center font-mono">
                    <span className="text-xs text-slate-400">Precio Promo:</span>
                    <span className="text-fuchsia-400 font-bold text-lg">{formatCurrency(p.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Cuentas Corrientes & Fiados</h2>
                <p className="text-xs text-slate-400">Seguimiento de deudas de clientes o bares</p>
              </div>
              <button
                onClick={() => setShowClientModal(true)}
                className="bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-fuchsia-500/20"
              >
                <UserPlus className="w-4 h-4" /> Registrar Cliente
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map((c) => (
                <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-base text-white">{c.name}</h3>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-sm px-3 py-1 rounded-full ${
                        c.debt > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-fuchsia-500/10 text-fuchsia-400'
                      }`}>
                        {c.debt > 0 ? `Debe: ${formatCurrency(c.debt)}` : 'Al día'}
                      </span>
                      <button
                        onClick={() => handleDeleteClient(c.id)}
                        title="Eliminar cliente"
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {c.debt > 0 && (
                    <button
                      onClick={() => {
                        setClients(prev => prev.map(cli => cli.id === c.id ? { ...cli, debt: 0 } : cli));
                        notify(`Deuda saldada para ${c.name}`);
                      }}
                      className="w-full bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 py-2.5 rounded-2xl text-xs font-bold transition"
                    >
                      Saldar Deuda Completamente
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {saleToPayModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-fuchsia-400" /> Cobrar Venta Fiada
              </h3>
              <button onClick={() => setSaleToPayModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl text-xs space-y-2 border border-slate-800/80">
              <div className="flex justify-between text-slate-300">
                <span>Venta ID:</span> <strong className="text-fuchsia-400 font-mono">{saleToPayModal.id}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Cliente:</span> <strong>{saleToPayModal.client}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Monto a Cobrar:</span> <strong className="text-fuchsia-400 font-mono text-sm">{formatCurrency(saleToPayModal.total)}</strong>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2 font-medium">
                ¿Con qué medio abonó el cliente?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleMarkSaleAsPaid(saleToPayModal.id, 'Efectivo')}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 font-bold py-3 px-2 rounded-2xl text-xs transition flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-500/10"
                >
                  <DollarSign className="w-5 h-5" />
                  Efectivo
                </button>
                <button
                  onClick={() => handleMarkSaleAsPaid(saleToPayModal.id, 'Transferencia')}
                  className="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/50 text-fuchsia-400 font-bold py-3 px-2 rounded-2xl text-xs transition flex flex-col items-center justify-center gap-1 shadow-lg shadow-fuchsia-500/10"
                >
                  <CreditCard className="w-5 h-5" />
                  Transferencia
                </button>
              </div>
            </div>

            <button
              onClick={() => setSaleToPayModal(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-2xl text-xs transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {saleToDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">¿Eliminar Venta {saleToDeleteConfirm.id}?</h3>
                <p className="text-xs text-slate-400">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl text-xs space-y-2 border border-slate-800/80">
              <div className="flex justify-between text-slate-300">
                <span>Cliente:</span> <strong>{saleToDeleteConfirm.client}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Monto Venta:</span> <strong className="text-fuchsia-400">{formatCurrency(saleToDeleteConfirm.total)}</strong>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-1">Productos de esta venta:</span>
                <ul className="space-y-1">
                  {saleToDeleteConfirm.items?.map((it, idx) => (
                    <li key={idx} className="text-slate-300 flex justify-between text-[11px]">
                      <span>• {it.qty}x {it.name}</span>
                      <span className="font-mono text-slate-400">{formatCurrency(it.price * it.qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSaleToDeleteConfirm(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-2xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteSale(saleToDeleteConfirm.id)}
                className="flex-1 bg-red-500 hover:bg-red-400 text-slate-950 font-bold py-2.5 rounded-2xl text-xs transition shadow-lg shadow-red-500/20"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Nuevo Producto</h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre del Producto:</label>
                <input required name="name" placeholder="Ej: Vodka Absolut 750ml" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Marca:</label>
                  <input required name="brand" placeholder="Absolut" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Categoría:</label>
                  <input required name="category" placeholder="Destilados" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Precio Costo ($):</label>
                  <input required type="number" step="any" name="costPrice" placeholder="10000" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Precio Venta ($):</label>
                  <input required type="number" step="any" name="sellPrice" placeholder="15000" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Stock Inicial:</label>
                  <input required type="number" name="stock" placeholder="12" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stock Mínimo Alerta:</label>
                  <input required type="number" name="minStock" placeholder="3" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
                </div>
              </div>
              <button type="submit" className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold py-3 rounded-xl transition mt-2">Guardar Producto</button>
            </form>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-fuchsia-400" /> Modificar Precios / Producto
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre del Producto:</label>
                <input required name="name" defaultValue={editingProduct.name} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Marca:</label>
                  <input required name="brand" defaultValue={editingProduct.brand} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Categoría:</label>
                  <input required name="category" defaultValue={editingProduct.category} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-fuchsia-400 font-bold block mb-1">Precio Costo ($):</label>
                  <input required type="number" step="any" name="costPrice" defaultValue={editingProduct.costPrice} className="w-full bg-slate-950 border border-fuchsia-500/50 rounded-xl p-2.5 text-white font-mono focus:border-fuchsia-400 focus:outline-none" />
                </div>
                <div>
                  <label className="text-fuchsia-400 font-bold block mb-1">Precio Venta ($):</label>
                  <input required type="number" step="any" name="sellPrice" defaultValue={editingProduct.sellPrice} className="w-full bg-slate-950 border border-fuchsia-500/50 rounded-xl p-2.5 text-white font-mono focus:border-fuchsia-400 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Stock Mínimo Alerta:</label>
                <input required type="number" name="minStock" defaultValue={editingProduct.minStock} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-fuchsia-500/20">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPromoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Nueva Promoción</h3>
              <button onClick={() => setShowPromoModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddPromo} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre de Promo:</label>
                <input required name="name" placeholder="Ej: 2x1 Cerveza Stella" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Tipo de Promo:</label>
                <select name="type" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                  <option value="pack">Pack / Combo de varios productos</option>
                  <option value="discount">Descuento especial (%)</option>
                  <option value="custom">2x1 / Regalo / Especial</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Precio Final ($):</label>
                <input required type="number" step="any" name="price" placeholder="2700" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Descripción:</label>
                <input required name="description" placeholder="Llevás 2 unidades al precio de 1" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <button type="submit" className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold py-3 rounded-xl transition mt-2">Guardar Promoción</button>
            </form>
          </div>
        </div>
      )}

      {editingPromo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-fuchsia-400" /> Modificar Promoción
              </h3>
              <button onClick={() => setEditingPromo(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdatePromo} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre de Promo:</label>
                <input required name="name" defaultValue={editingPromo.name} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Tipo de Promo:</label>
                <select name="type" defaultValue={editingPromo.type} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                  <option value="pack">Pack / Combo de varios productos</option>
                  <option value="discount">Descuento especial (%)</option>
                  <option value="custom">2x1 / Regalo / Especial</option>
                </select>
              </div>
              <div>
                <label className="text-fuchsia-400 font-bold block mb-1">Precio Final ($):</label>
                <input required type="number" step="any" name="price" defaultValue={editingPromo.price} className="w-full bg-slate-950 border border-fuchsia-500/50 rounded-xl p-2.5 text-white font-mono focus:border-fuchsia-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Descripción:</label>
                <input required name="description" defaultValue={editingPromo.description} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingPromo(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-fuchsia-500/20">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showClientModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Nuevo Cliente</h3>
              <button onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              setClients([...clients, { id: `cli-${Date.now()}`, name: fd.get('name'), phone: fd.get('phone'), debt: 0 }]);
              setShowClientModal(false);
              notify('Cliente registrado');
            }} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre / Bar:</label>
                <input required name="name" placeholder="Ej: Bar El Capitán" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Teléfono:</label>
                <input name="phone" placeholder="+54 9 11 ..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <button type="submit" className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold py-3 rounded-xl transition mt-2">Guardar Cliente</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarBtn({ active, onClick, icon, children, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
        active
          ? 'bg-fuchsia-500 text-slate-950 font-bold shadow-lg shadow-fuchsia-500/20'
          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        {React.cloneElement(icon, { className: 'w-4 h-4' })}
        <span>{children}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          active ? 'bg-slate-950 text-fuchsia-400' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function KpiCard({ title, value, icon }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex justify-between items-start shadow-xl">
      <div>
        <span className="text-xs text-slate-400 font-medium">{title}</span>
        <div className="font-mono text-xl font-bold text-slate-100 mt-1">{value}</div>
      </div>
      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 shadow">{icon}</div>
    </div>
  );
}