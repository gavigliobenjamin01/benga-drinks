import React, { useState, useMemo, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { formatCurrency, formatDate, formatPromoDescription } from './utils';

// IMPORTACIÓN DE COMPONENTES MODULARIZADOS
import Sidebar from './components/Sidebar';
import SalesTab from './components/SalesTab';
import DashboardTab from './components/DashboardTab';
import InventoryTab from './components/InventoryTab';
import PromosTab from './components/PromosTab';
import StockEntryTab from './components/StockEntryTab';
import ClientsTab from './components/ClientsTab';

// ÍCONOS PARA MODALES Y NOTIFICACIONES
import {
  Check,
  X,
  HandCoins,
  Wallet,
  CreditCard,
  RotateCcw,
  Pencil,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('sales');
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [stockEntries, setStockEntries] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  // ESTADOS DE CAJAS Y RETIRO DE PLATA
  const [showBoxesModal, setShowBoxesModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [salaryPercentage, setSalaryPercentage] = useState(50);
  const [withdrawInput, setWithdrawInput] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');

  // ESTADOS DE INGRESO DE MERCADERÍA
  const [entryCart, setEntryCart] = useState([]);
  const [entrySearchTerm, setEntrySearchTerm] = useState('');
  const [entryTotalCostInput, setEntryTotalCostInput] = useState('');

  // ESTADOS PARA MODALES Y FILTROS DE INVENTARIO
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('Todas');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [saleToDeleteConfirm, setSaleToDeleteConfirm] = useState(null);
  const [saleToPayModal, setSaleToPayModal] = useState(null);
  const [toast, setToast] = useState(null);

  // ESTADOS PARA CONSTRUCCIÓN DE PROMOS
  const [promoItems, setPromoItems] = useState([]);
  const [promoDescription, setPromoDescription] = useState('');
  const [selectedProdForPromo, setSelectedProdForPromo] = useState('');

  // --- CONEXIÓN A FIRESTORE EN TIEMPO REAL ---
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map((d) => ({ ...d.data(), id: d.id })));
    });

    const unsubPromos = onSnapshot(collection(db, 'promos'), (snapshot) => {
      setPromos(snapshot.docs.map((d) => ({ ...d.data(), id: d.id })));
    });

    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      setClients(snapshot.docs.map((d) => ({ ...d.data(), id: d.id })));
    });

    const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSales(list);
    });

    const unsubStockEntries = onSnapshot(collection(db, 'stock_entries'), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setStockEntries(list);
    });

    const unsubWithdrawals = onSnapshot(collection(db, 'withdrawals'), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setWithdrawals(list);
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.salaryPercentage !== undefined) {
          setSalaryPercentage(data.salaryPercentage);
        }
      }
    });

    return () => {
      unsubProducts();
      unsubPromos();
      unsubClients();
      unsubSales();
      unsubStockEntries();
      unsubWithdrawals();
      unsubSettings();
    };
  }, []);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSalaryPercentageChange = async (newVal) => {
    setSalaryPercentage(newVal);
    await setDoc(doc(db, 'settings', 'config'), { salaryPercentage: newVal }, { merge: true });
  };

  // --- CÁLCULO DE MÉTRICAS GLOBALES ---
  const metrics = useMemo(() => {
    const rawRevenue = sales.reduce((acc, s) => acc + s.total, 0);
    const totalSalesCost = sales.reduce((acc, s) => acc + s.cost, 0);
    const merchandiseExpenses = stockEntries.reduce((acc, e) => acc + (e.totalCost || 0), 0);

    const totalRevenue = rawRevenue - merchandiseExpenses;
    const netProfit = rawRevenue - totalSalesCost - merchandiseExpenses;
    const totalPendingDebt = clients.reduce((acc, c) => acc + c.debt, 0);
    const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
    const stockValuation = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);

    const totalSalaryProfit = Math.max(0, netProfit * (salaryPercentage / 100));
    const totalWithdrawn = withdrawals.reduce((acc, w) => acc + (w.amount || 0), 0);
    const availableToWithdraw = Math.max(0, totalSalaryProfit - totalWithdrawn);

    return {
      totalRevenue,
      totalCost: totalSalesCost,
      netProfit,
      totalPendingDebt,
      lowStockCount,
      stockValuation,
      merchandiseExpenses,
      rawRevenue,
      totalSalaryProfit,
      totalWithdrawn,
      availableToWithdraw
    };
  }, [sales, clients, products, stockEntries, withdrawals, salaryPercentage]);

  const inventoryCategories = useMemo(() => {
    const prodCats = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
    return ['Todas', ...prodCats];
  }, [products]);

  const sortedAndFilteredInventory = useMemo(() => {
    let list = products;
    if (inventoryCategoryFilter !== 'Todas') {
      list = list.filter((p) => p.category === inventoryCategoryFilter);
    }
    return [...list].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' })
    );
  }, [products, inventoryCategoryFilter]);

  // --- FUNCIONES Y ACCIONES DEL SISTEMA ---
  const handleRegisterSale = async ({
    saleCart,
    selectedClient,
    paymentMethod,
    address,
    cartTotal,
    cartCostTotal,
    clearCart
  }) => {
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
        item.raw.items?.forEach((comp) => {
          updatedProducts = updatedProducts.map((p) =>
            p.id === comp.productId ? { ...p, stock: Math.max(0, p.stock - comp.quantity * item.qty) } : p
          );
        });
      }
    });

    updatedProducts.forEach((p) => {
      updateDoc(doc(db, 'products', p.id), { stock: p.stock });
    });

    if (paymentMethod === 'Fiado') {
      const clientObj = clients.find((c) => c.name === selectedClient);
      if (clientObj) {
        updateDoc(doc(db, 'clients', clientObj.id), { debt: clientObj.debt + cartTotal });
      }
    }

    const newSale = {
      id: `V-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      client: selectedClient,
      paymentMethod,
      address: address.trim() || '',
      total: cartTotal,
      cost: cartCostTotal,
      profit: cartTotal - cartCostTotal,
      items: saleCart.map((i) => ({
        id: i.id,
        name: i.name,
        qty: i.qty,
        price: i.effectivePrice || i.price, // Usa el precio efectivo abonado (con o sin descuento de combo)
        isDiscountApplied: i.isDiscountApplied || false,
        type: i.type,
        raw: i.raw
      }))
    };

    await setDoc(doc(db, 'sales', newSale.id), newSale);
    clearCart();
    notify(
      paymentMethod === 'Fiado'
        ? `📝 Venta fiada a ${selectedClient} por ${formatCurrency(cartTotal)}`
        : `✅ Venta #${newSale.id} registrada correctamente (${newSale.items.length} productos)`
    );
  };

  const handleMarkSaleAsPaid = async (saleId, newPaymentMethod) => {
    const saleToPay = sales.find((s) => s.id === saleId);
    if (!saleToPay || saleToPay.paymentMethod !== 'Fiado') return;

    await updateDoc(doc(db, 'sales', saleId), { paymentMethod: newPaymentMethod });

    const clientObj = clients.find((c) => c.name === saleToPay.client);
    if (clientObj) {
      await updateDoc(doc(db, 'clients', clientObj.id), {
        debt: Math.max(0, clientObj.debt - saleToPay.total)
      });
    }

    setSaleToPayModal(null);
    notify(`✅ Venta #${saleToPay.id} marcada como PAGADA con ${newPaymentMethod}`);
  };

  const handleDeleteSale = async (saleId) => {
    const saleToDelete = sales.find((s) => s.id === saleId);
    if (!saleToDelete) return;

    let updatedProducts = [...products];
    saleToDelete.items.forEach((item) => {
      if (item.type === 'product' || !item.type) {
        updatedProducts = updatedProducts.map((p) =>
          p.id === item.id || p.name === item.name
            ? { ...p, stock: p.stock + item.qty }
            : p
        );
      } else if (item.type === 'promo') {
        const promoRef = item.raw || promos.find((pr) => pr.id === item.id);
        if (promoRef && promoRef.items) {
          promoRef.items.forEach((comp) => {
            updatedProducts = updatedProducts.map((p) =>
              p.id === comp.productId
                ? { ...p, stock: p.stock + comp.quantity * item.qty }
                : p
            );
          });
        }
      }
    });

    updatedProducts.forEach((p) => {
      updateDoc(doc(db, 'products', p.id), { stock: p.stock });
    });

    if (saleToDelete.paymentMethod === 'Fiado') {
      const clientObj = clients.find((c) => c.name === saleToDelete.client);
      if (clientObj) {
        updateDoc(doc(db, 'clients', clientObj.id), {
          debt: Math.max(0, clientObj.debt - saleToDelete.total)
        });
      }
    }

    await deleteDoc(doc(db, 'sales', saleId));
    setSaleToDeleteConfirm(null);
    notify(`🗑️ Venta ${saleToDelete.id} eliminada.`);
  };

  const handleDeleteClient = async (clientId) => {
    const clientToDelete = clients.find((c) => c.id === clientId);
    if (!clientToDelete) return;

    await deleteDoc(doc(db, 'clients', clientId));
    notify(`🗑️ Cliente "${clientToDelete.name}" eliminado`);
  };

  const handleAdjustStock = async (productId, delta) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);

    await updateDoc(doc(db, 'products', productId), { stock: newStock });
    notify('📦 Stock actualizado');
  };

  const handleDeleteProduct = async (productId) => {
    const prod = products.find((p) => p.id === productId);
    await deleteDoc(doc(db, 'products', productId));
    notify(`🗑️ ${prod ? prod.name : 'Producto'} eliminado`);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newP = {
      id: `p-${Date.now()}`,
      name: fd.get('name'),
      brand: fd.get('brand'),
      category: fd.get('category'),
      costPrice: parseFloat(fd.get('costPrice')),
      sellPrice: parseFloat(fd.get('sellPrice')),
      comboPrice: parseFloat(fd.get('comboPrice')) || 0, // Nuevo campo
      stock: parseInt(fd.get('stock'), 10),
      minStock: parseInt(fd.get('minStock'), 10),
    };

    await setDoc(doc(db, 'products', newP.id), newP);
    setShowProductModal(false);
    notify('✨ Producto añadido al catálogo');
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newCost = parseFloat(fd.get('costPrice'));
    const newSell = parseFloat(fd.get('sellPrice'));
    const newCombo = parseFloat(fd.get('comboPrice'));

    const updatedData = {
      name: fd.get('name'),
      brand: fd.get('brand'),
      category: fd.get('category'),
      costPrice: isNaN(newCost) ? editingProduct.costPrice : newCost,
      sellPrice: isNaN(newSell) ? editingProduct.sellPrice : newSell,
      comboPrice: isNaN(newCombo) ? (editingProduct.comboPrice || 0) : newCombo, // Nuevo campo
      minStock: parseInt(fd.get('minStock'), 10) || editingProduct.minStock
    };

    await updateDoc(doc(db, 'products', editingProduct.id), updatedData);
    setEditingProduct(null);
    notify('✏️ Precios y datos actualizados');
  };

  const handleUpdatePromoItems = (newItems) => {
    setPromoItems(newItems);
    setPromoDescription(formatPromoDescription(newItems, products));
  };

  const handleAddProductToPromo = (productId) => {
    if (!productId) return;
    const existingIndex = promoItems.findIndex((i) => i.productId === productId);
    let updated;
    if (existingIndex >= 0) {
      updated = promoItems.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updated = [...promoItems, { productId, quantity: 1 }];
    }
    handleUpdatePromoItems(updated);
  };

  const handleUpdatePromoItemQty = (productId, delta) => {
    const updated = promoItems
      .map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          return newQty <= 0 ? null : { ...item, quantity: newQty };
        }
        return item;
      })
      .filter(Boolean);
    handleUpdatePromoItems(updated);
  };

  const handleRemoveProductFromPromo = (productId) => {
    const updated = promoItems.filter((item) => item.productId !== productId);
    handleUpdatePromoItems(updated);
  };

  const openCreatePromoModal = () => {
    setPromoItems([]);
    setPromoDescription('');
    setSelectedProdForPromo('');
    setShowPromoModal(true);
  };

  const openEditPromoModal = (promo) => {
    setEditingPromo(promo);
    const initialItems = promo.items || [];
    setPromoItems(initialItems);
    setPromoDescription(promo.description || formatPromoDescription(initialItems, products));
    setSelectedProdForPromo('');
  };

  const handleAddPromo = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newPromo = {
      id: `pr-${Date.now()}`,
      name: fd.get('name'),
      type: fd.get('type'),
      price: parseFloat(fd.get('price')),
      active: true,
      description: promoDescription || fd.get('description') || '',
      items: promoItems
    };

    await setDoc(doc(db, 'promos', newPromo.id), newPromo);
    setShowPromoModal(false);
    setPromoItems([]);
    setPromoDescription('');
    notify(`🎉 Promoción "${newPromo.name}" creada`);
  };

  const handleDeletePromo = async (promoId) => {
    await deleteDoc(doc(db, 'promos', promoId));
    notify(`🗑️ Promoción eliminada`);
  };

  const handleUpdatePromo = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newPrice = parseFloat(fd.get('price'));

    const updatedData = {
      name: fd.get('name'),
      type: fd.get('type'),
      price: isNaN(newPrice) ? editingPromo.price : newPrice,
      description: promoDescription || fd.get('description') || '',
      items: promoItems
    };

    await updateDoc(doc(db, 'promos', editingPromo.id), updatedData);
    setEditingPromo(null);
    setPromoItems([]);
    setPromoDescription('');
    notify('✏️ Promoción actualizada');
  };

  const togglePromoActive = async (id) => {
    const promo = promos.find((p) => p.id === id);
    if (!promo) return;
    await updateDoc(doc(db, 'promos', id), { active: !promo.active });
  };

  const addToEntryCart = (product) => {
    setEntryCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateEntryQty = (id, delta) => {
    setEntryCart((prev) =>
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

  const handleRegisterStockEntry = async () => {
    if (entryCart.length === 0) return;
    const costVal = parseFloat(entryTotalCostInput) || 0;

    for (const item of entryCart) {
      const currentProd = products.find((p) => p.id === item.id);
      if (currentProd) {
        const newStock = currentProd.stock + item.qty;
        await updateDoc(doc(db, 'products', item.id), { stock: newStock });
      }
    }

    const newEntry = {
      id: `ING-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      totalCost: costVal,
      items: entryCart.map((i) => ({
        id: i.id,
        name: i.name,
        qty: i.qty
      }))
    };

    await setDoc(doc(db, 'stock_entries', newEntry.id), newEntry);

    setEntryCart([]);
    setEntryTotalCostInput('');
    notify(`📦 Ingreso de mercadería registrado (${formatCurrency(costVal)}) y stock actualizado`);
  };

  const handleRegisterWithdrawal = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawInput) || 0;

    if (amount <= 0) {
      notify('⚠️ Ingresá un monto válido a retirar.');
      return;
    }

    if (amount > metrics.availableToWithdraw) {
      notify(`⛔ No podés retirar más de tu ganancia disponible (${formatCurrency(metrics.availableToWithdraw)})`);
      return;
    }

    const newWithdrawal = {
      id: `RET-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      amount,
      note: withdrawNote || 'Retiro de sueldo personal'
    };

    await setDoc(doc(db, 'withdrawals', newWithdrawal.id), newWithdrawal);

    setWithdrawInput('');
    setWithdrawNote('');
    setShowWithdrawModal(false);
    notify(`💸 Retiraste ${formatCurrency(amount)} de tu ganancia personal`);
  };

  const handleDeleteWithdrawal = async (withdrawId) => {
    await deleteDoc(doc(db, 'withdrawals', withdrawId));
    notify('🗑️ Retiro devuelto al saldo disponible');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row antialiased">
      {/* NOTIFICACIÓN TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] bg-fuchsia-500 text-slate-950 px-4 py-3 rounded-2xl font-bold shadow-2xl shadow-fuchsia-500/40 flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5 stroke-[3]" />
          <span className="text-sm">{toast}</span>
        </div>
      )}

      {/* MENÚ LATERAL */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} metrics={metrics} />

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950">
        {activeTab === 'sales' && (
          <SalesTab
            products={products}
            promos={promos}
            clients={clients}
            onRegisterSale={handleRegisterSale}
            notify={notify}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardTab
            sales={sales}
            metrics={metrics}
            promos={promos}
            products={products}
            setShowWithdrawModal={setShowWithdrawModal}
            setShowBoxesModal={setShowBoxesModal}
            setSaleToPayModal={setSaleToPayModal}
            setSaleToDeleteConfirm={setSaleToDeleteConfirm}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            inventoryCategories={inventoryCategories}
            inventoryCategoryFilter={inventoryCategoryFilter}
            setInventoryCategoryFilter={setInventoryCategoryFilter}
            sortedAndFilteredInventory={sortedAndFilteredInventory}
            metrics={metrics}
            setShowWithdrawModal={setShowWithdrawModal}
            setShowProductModal={setShowProductModal}
            handleAdjustStock={handleAdjustStock}
            setEditingProduct={setEditingProduct}
            handleDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'promos' && (
          <PromosTab
            promos={promos}
            openCreatePromoModal={openCreatePromoModal}
            openEditPromoModal={openEditPromoModal}
            handleDeletePromo={handleDeletePromo}
            togglePromoActive={togglePromoActive}
          />
        )}

        {activeTab === 'stock_entry' && (
          <StockEntryTab
            products={products}
            entrySearchTerm={entrySearchTerm}
            setEntrySearchTerm={setEntrySearchTerm}
            entryCart={entryCart}
            addToEntryCart={addToEntryCart}
            updateEntryQty={updateEntryQty}
            setEntryCart={setEntryCart}
            entryTotalCostInput={entryTotalCostInput}
            setEntryTotalCostInput={setEntryTotalCostInput}
            handleRegisterStockEntry={handleRegisterStockEntry}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsTab
            clients={clients}
            setShowClientModal={setShowClientModal}
            handleDeleteClient={handleDeleteClient}
            notify={notify}
          />
        )}
      </main>

      {/* --- MODALES GLOBALES --- */}

      {/* MODAL RETIRO DE PLATA */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <HandCoins className="w-5 h-5 text-emerald-400" /> Retiro de Plata (Sueldo Personal)
                </h3>
                <p className="text-[11px] text-slate-400">Solo podés retirar la plata que te corresponde como ganancia</p>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Tu Sueldo Asignado ({salaryPercentage}% de Ganancia):</span>
                <strong className="font-mono text-fuchsia-400">{formatCurrency(metrics.totalSalaryProfit)}</strong>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Total Ya Retirado:</span>
                <strong className="font-mono text-amber-400">-{formatCurrency(metrics.totalWithdrawn)}</strong>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase">Disponible para Retirar:</span>
                <span className="font-mono font-bold text-xl text-emerald-400">{formatCurrency(metrics.availableToWithdraw)}</span>
              </div>
            </div>

            <form onSubmit={handleRegisterWithdrawal} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-bold">Monto a retirar ($):</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-emerald-400 font-bold">$</span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder={`Máximo ${metrics.availableToWithdraw}...`}
                    value={withdrawInput}
                    onChange={(e) => setWithdrawInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {parseFloat(withdrawInput) > metrics.availableToWithdraw && (
                  <p className="text-[11px] text-red-400 font-bold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> No podés retirar más de lo que te corresponde.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">Motivo / Nota (opcional):</label>
                <input
                  type="text"
                  placeholder="Ej: Sueldo semana, gastos personales..."
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={!withdrawInput || parseFloat(withdrawInput) <= 0 || parseFloat(withdrawInput) > metrics.availableToWithdraw}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-500/20 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 stroke-[3]" /> Registrar Retiro de Plata
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 block uppercase">Historial de Retiros Realizados</span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {withdrawals.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-3">No registraste retiros todavía.</p>
                ) : (
                  withdrawals.map((w) => (
                    <div key={w.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400">{formatCurrency(w.amount)}</span>
                          <span className="text-[10px] text-slate-400">{w.note}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono block">{formatDate(w.date)}</span>
                      </div>
                      <button onClick={() => handleDeleteWithdrawal(w.id)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LAS 3 CAJAS */}
      {showBoxesModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-fuchsia-400" /> Sistema de las 3 Cajas
                </h3>
                <p className="text-[11px] text-slate-400">Control de fondos para no descapitalizar tu negocio</p>
              </div>
              <button onClick={() => setShowBoxesModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Caja 1: Costo de Reposición (Plata del Negocio)
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">NO SE TOCA</span>
              </div>
              <div className="font-mono text-2xl font-bold text-white">{formatCurrency(metrics.totalCost)}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Es la suma exacta de lo que te costó comprar los productos vendidos. Esta plata es sagrada y no se toca, va directo a reponer stock.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" /> Caja 2: Ganancia Neta Limpia
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Rendimiento Real</span>
              </div>
              <div className="font-mono text-2xl font-bold text-emerald-400">{formatCurrency(metrics.netProfit)}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Es la diferencia directa entre lo cobrado y los costos de ventas.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-fuchsia-500/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-fuchsia-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <PieChart className="w-4 h-4" /> Caja 3: Tu Sueldo vs. Fondo de Crecimiento
                </span>
                <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 font-bold px-2 py-0.5 rounded-full border border-fuchsia-500/30">Distribución</span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Tu Sueldo: <strong className="text-fuchsia-400 font-mono">{salaryPercentage}%</strong></span>
                  <span>Fondo Crecimiento: <strong className="text-purple-400 font-mono">{100 - salaryPercentage}%</strong></span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={salaryPercentage}
                  onChange={(e) => handleSalaryPercentageChange(Number(e.target.value))}
                  className="w-full accent-fuchsia-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div className="bg-slate-900 p-3 rounded-xl border border-fuchsia-500/20 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tu Sueldo / Retiro</span>
                  <span className="font-mono font-bold text-lg text-fuchsia-400 block mt-0.5">{formatCurrency(metrics.totalSalaryProfit)}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-purple-500/20 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reinversión</span>
                  <span className="font-mono font-bold text-lg text-purple-400 block mt-0.5">{formatCurrency(metrics.netProfit * ((100 - salaryPercentage) / 100))}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setShowBoxesModal(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-2xl text-xs transition">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL COBRAR VENTA FIADA */}
      {saleToPayModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-fuchsia-400" /> Cobrar Venta Fiada
              </h3>
              <button onClick={() => setSaleToPayModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
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
              <label className="text-xs text-slate-400 block mb-2 font-medium">¿Con qué medio abonó?</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleMarkSaleAsPaid(saleToPayModal.id, 'Efectivo')} className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 font-bold py-3 px-2 rounded-2xl text-xs transition flex flex-col items-center justify-center gap-1">
                  Efectivo
                </button>
                <button onClick={() => handleMarkSaleAsPaid(saleToPayModal.id, 'Transferencia')} className="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/50 text-fuchsia-400 font-bold py-3 px-2 rounded-2xl text-xs transition flex flex-col items-center justify-center gap-1">
                  Transferencia
                </button>
              </div>
            </div>

            <button onClick={() => setSaleToPayModal(null)} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-2xl text-xs transition">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR VENTA */}
      {saleToDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">¿Eliminar Venta {saleToDeleteConfirm.id}?</h3>
                <p className="text-xs text-slate-400">Esta acción restaura el stock asignado.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setSaleToDeleteConfirm(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-2xl text-xs transition">
                Cancelar
              </button>
              <button onClick={() => handleDeleteSale(saleToDeleteConfirm.id)} className="flex-1 bg-red-500 hover:bg-red-400 text-slate-950 font-bold py-2.5 rounded-2xl text-xs transition shadow-lg shadow-red-500/20">
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO PRODUCTO */}
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
                <input required name="name" placeholder="Ej: Bolsa de Hielo 4kg" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Marca:</label>
                  <input required name="brand" placeholder="Ej: Rolito / Benga" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Categoría:</label>
                  <input required name="category" placeholder="Ej: Hielo / Hielos / Agregados" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Precio Costo ($):</label>
                  <input required type="number" step="any" name="costPrice" placeholder="1000" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Precio Venta ($):</label>
                  <input required type="number" step="any" name="sellPrice" placeholder="2500" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
                </div>
                <div>
                  <label className="text-amber-400 font-bold block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Precio Combo ($):
                  </label>
                  <input type="number" step="any" name="comboPrice" placeholder="2000" className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-2.5 text-amber-400 font-mono font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Stock Inicial:</label>
                  <input required type="number" name="stock" placeholder="50" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stock Mínimo Alerta:</label>
                  <input required type="number" name="minStock" placeholder="5" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
                </div>
              </div>
              <button type="submit" className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold py-3 rounded-xl transition mt-2">Guardar Producto</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PRODUCTO */}
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
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-fuchsia-400 font-bold block mb-1">P. Costo ($):</label>
                  <input required type="number" step="any" name="costPrice" defaultValue={editingProduct.costPrice} className="w-full bg-slate-950 border border-fuchsia-500/50 rounded-xl p-2.5 text-white font-mono" />
                </div>
                <div>
                  <label className="text-fuchsia-400 font-bold block mb-1">P. Venta ($):</label>
                  <input required type="number" step="any" name="sellPrice" defaultValue={editingProduct.sellPrice} className="w-full bg-slate-950 border border-fuchsia-500/50 rounded-xl p-2.5 text-white font-mono" />
                </div>
                <div>
                  <label className="text-amber-400 font-bold block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> P. Combo ($):
                  </label>
                  <input type="number" step="any" name="comboPrice" defaultValue={editingProduct.comboPrice || ''} placeholder="Ej: 2000" className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-2.5 text-amber-400 font-mono font-bold" />
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

      {/* MODAL CREAR PROMO */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Nueva Promoción</h3>
              <button onClick={() => setShowPromoModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddPromo} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre de Promo:</label>
                <input required name="name" placeholder="Ej: Combo Fernet + Coca" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Tipo de Promo:</label>
                <select name="type" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                  <option value="pack">Pack / Combo de varios productos</option>
                  <option value="discount">Descuento especial (%)</option>
                  <option value="custom">2x1 / Regalo / Especial</option>
                </select>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-fuchsia-400 font-bold block">Agregar productos del Inventario:</label>
                <div className="flex gap-2">
                  <select
                    value={selectedProdForPromo}
                    onChange={(e) => setSelectedProdForPromo(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-xs"
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddProductToPromo(selectedProdForPromo);
                      setSelectedProdForPromo('');
                    }}
                    className="bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Agregar
                  </button>
                </div>

                {promoItems.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Productos incluidos:</span>
                    {promoItems.map((item) => {
                      const prod = products.find((p) => p.id === item.productId);
                      return (
                        <div key={item.productId} className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-xl text-slate-200">
                          <span className="font-medium truncate pr-2">{prod ? prod.name : 'Producto'}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                              <button type="button" onClick={() => handleUpdatePromoItemQty(item.productId, -1)} className="text-slate-400 hover:text-white font-bold">-</button>
                              <span className="font-mono text-white px-1">{item.quantity}</span>
                              <button type="button" onClick={() => handleUpdatePromoItemQty(item.productId, 1)} className="text-slate-400 hover:text-white font-bold">+</button>
                            </div>
                            <button type="button" onClick={() => handleRemoveProductFromPromo(item.productId)} className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Precio Final ($):</label>
                <input required type="number" step="any" name="price" placeholder="2700" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Descripción:</label>
                <input
                  required
                  name="description"
                  value={promoDescription}
                  onChange={(e) => setPromoDescription(e.target.value)}
                  placeholder="Ej: Fernet, Coca, Hielo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <button type="submit" className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold py-3 rounded-xl transition mt-2">Guardar Promoción</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PROMO */}
      {editingPromo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
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

              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-fuchsia-400 font-bold block">Agregar productos del Inventario:</label>
                <div className="flex gap-2">
                  <select
                    value={selectedProdForPromo}
                    onChange={(e) => setSelectedProdForPromo(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-xs"
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddProductToPromo(selectedProdForPromo);
                      setSelectedProdForPromo('');
                    }}
                    className="bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Agregar
                  </button>
                </div>

                {promoItems.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Productos incluidos:</span>
                    {promoItems.map((item) => {
                      const prod = products.find((p) => p.id === item.productId);
                      return (
                        <div key={item.productId} className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-xl text-slate-200">
                          <span className="font-medium truncate pr-2">{prod ? prod.name : 'Producto'}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                              <button type="button" onClick={() => handleUpdatePromoItemQty(item.productId, -1)} className="text-slate-400 hover:text-white font-bold">-</button>
                              <span className="font-mono text-white px-1">{item.quantity}</span>
                              <button type="button" onClick={() => handleUpdatePromoItemQty(item.productId, 1)} className="text-slate-400 hover:text-white font-bold">+</button>
                            </div>
                            <button type="button" onClick={() => handleRemoveProductFromPromo(item.productId)} className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-fuchsia-400 font-bold block mb-1">Precio Final ($):</label>
                <input required type="number" step="any" name="price" defaultValue={editingPromo.price} className="w-full bg-slate-950 border border-fuchsia-500/50 rounded-xl p-2.5 text-white font-mono" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Descripción:</label>
                <input
                  required
                  name="description"
                  value={promoDescription}
                  onChange={(e) => setPromoDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
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

      {/* MODAL CREAR CLIENTE */}
      {showClientModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Nuevo Cliente</h3>
              <button onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const newClient = { id: `cli-${Date.now()}`, name: fd.get('name'), phone: fd.get('phone'), debt: 0 };
              await setDoc(doc(db, 'clients', newClient.id), newClient);
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