import React, { useState, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { formatCurrency, formatPromoDescription } from './utils';

// HOOK PERSONALIZADO
import { useAppData } from './hooks/useAppData';

// COMPONENTES DE ESTRUCTURA Y PESTAÑAS
import Sidebar from './components/Sidebar';
import SalesTab from './components/SalesTab';
import DashboardTab from './components/DashboardTab';
import InventoryTab from './components/InventoryTab';
import PromosTab from './components/PromosTab';
import StockEntryTab from './components/StockEntryTab';
import ClientsTab from './components/ClientsTab';

// MODALES COMPONENTIZADOS
import WebOrdersModal from './components/modals/WebOrdersModal';
import WithdrawModal from './components/modals/WithdrawModal';
import BoxesModal from './components/modals/BoxesModal';
import SaleToPayModal from './components/modals/SaleToPayModal';
import ConfirmDeleteSaleModal from './components/modals/ConfirmDeleteSaleModal';
import ProductModal from './components/modals/ProductModal';
import PromoModal from './components/modals/PromoModal';
import ClientModal from './components/modals/ClientModal';

// ÍCONOS
import { Check, Bell } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('sales');

  // DATOS Y MÉTRICAS CENTRALIZADAS
  const {
    products, promos, sales, clients, stockEntries, withdrawals, expenses,
    webOrders, salaryPercentage, setSalaryPercentage, metrics, inventoryCategories
  } = useAppData();

  // ESTADOS LOCALES DE NAVEGACIÓN Y MODALES
  const [showWebOrdersModal, setShowWebOrdersModal] = useState(false);
  const [prefilledOrder, setPrefilledOrder] = useState(null);
  const [showBoxesModal, setShowBoxesModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawInput, setWithdrawInput] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');

  // INGRESO MERCADERÍA
  const [entryCart, setEntryCart] = useState([]);
  const [entrySearchTerm, setEntrySearchTerm] = useState('');
  const [entryEfectivoInput, setEntryEfectivoInput] = useState('');
  const [entryTransferenciaInput, setEntryTransferenciaInput] = useState('');

  // CAMPOS FORMULARIO PRODUCTO
  const [prodCostInput, setProdCostInput] = useState('');
  const [prodSellInput, setProdSellInput] = useState('');
  const [prodComboInput, setProdComboInput] = useState('');

  // CAMPOS FORMULARIO PROMO
  const [promoPriceInput, setPromoPriceInput] = useState('');
  const [promoItems, setPromoItems] = useState([]);
  const [promoDescription, setPromoDescription] = useState('');
  const [selectedProdForPromo, setSelectedProdForPromo] = useState('');

  // FILTROS, TECLAS Y ESTADOS DE MODAL
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('Todas');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [saleToDeleteConfirm, setSaleToDeleteConfirm] = useState(null);
  const [saleToPayModal, setSaleToPayModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [modalKeyCounter, setModalKeyCounter] = useState(0);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const sortedAndFilteredInventory = useMemo(() => {
    let list = products || [];
    if (inventoryCategoryFilter !== 'Todas') {
      list = list.filter((p) => p.category === inventoryCategoryFilter);
    }
    return [...list].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' })
    );
  }, [products, inventoryCategoryFilter]);

  // RESET Y APERTURA DE MODALES
  const resetProductInputs = () => {
    setProdCostInput('');
    setProdSellInput('');
    setProdComboInput('');
    setEditingProduct(null);
    setShowProductModal(false);
    setModalKeyCounter((prev) => prev + 1);
  };

  const resetPromoInputs = () => {
    setPromoPriceInput('');
    setPromoItems([]);
    setPromoDescription('');
    setSelectedProdForPromo('');
    setEditingPromo(null);
    setShowPromoModal(false);
    setModalKeyCounter((prev) => prev + 1);
  };

  const openCreateProductModal = () => {
    resetProductInputs();
    setShowProductModal(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProdCostInput((prod.costPrice ?? prod.cost)?.toString() ?? '');
    setProdSellInput((prod.sellPrice ?? prod.price)?.toString() ?? '');
    setProdComboInput(prod.comboPrice?.toString() ?? '');
    setShowProductModal(true);
  };

  const openCreatePromoModal = () => {
    resetPromoInputs();
    setShowPromoModal(true);
  };

  const openEditPromoModal = (promo) => {
    setEditingPromo(promo);
    const initialItems = promo.items || [];
    setPromoItems(initialItems);
    setPromoPriceInput(promo.price?.toString() || '');
    setPromoDescription(promo.description || formatPromoDescription(initialItems, products, promo.price));
    setSelectedProdForPromo('');
    setShowPromoModal(true);
  };

  // HANDLERS FIRESTORE
  const handleSalaryPercentageChange = async (newVal) => {
    setSalaryPercentage(newVal);
    await setDoc(doc(db, 'settings', 'config'), { salaryPercentage: newVal }, { merge: true });
  };

  const handleAcceptWebOrder = async (order) => {
    setPrefilledOrder(order);
    setActiveTab('sales');
    setShowWebOrdersModal(false);
    await deleteDoc(doc(db, 'orders', order.id));
    notify(`✨ Pedido de ${order.clientName || 'Cliente'} importado a la caja`);
  };

  const handleRejectWebOrder = async (orderId) => {
    await deleteDoc(doc(db, 'orders', orderId));
    notify('🗑️ Pedido cancelado');
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await addDoc(collection(db, 'expenses'), expenseData);
      notify('💸 Gasto registrado correctamente');
    } catch (err) {
      notify('⚠️ Error al registrar el gasto');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
      notify('🗑️ Gasto eliminado');
    } catch (err) {
      notify('⚠️ Error al eliminar el gasto');
    }
  };

  const applySuggestedMargin = (multiplier) => {
    const cost = parseFloat(prodCostInput) || 0;
    if (cost <= 0) return;
    setProdSellInput(Math.round(cost * multiplier).toString());
  };

  const handleRegisterSale = async ({
    saleCart, selectedClient, paymentMethod, paidEfectivo: customEfectivo = 0,
    paidTransferencia: customTransferencia = 0, address, shippingFee = 0,
    driverExtra = 0, cartTotal, cartCostTotal, clearCart
  }) => {
    if (saleCart.length === 0) return;
    if (paymentMethod === 'Fiado' && selectedClient === 'Cliente Casual') {
      notify('⚠️ Para fiar, seleccioná un cliente específico de la lista');
      return;
    }

    const updatedStocks = {};
    saleCart.forEach((item) => {
      if (item.type === 'product' || !item.type) {
        const p = products.find((prod) => prod.id === item.id);
        if (p) {
          const currentStock = updatedStocks[p.id] !== undefined ? updatedStocks[p.id] : p.stock;
          updatedStocks[p.id] = Math.max(0, currentStock - item.qty);
        }
      } else if (item.type === 'promo') {
        item.raw?.items?.forEach((comp) => {
          const p = products.find((prod) => prod.id === comp.productId);
          if (p) {
            const currentStock = updatedStocks[p.id] !== undefined ? updatedStocks[p.id] : p.stock;
            updatedStocks[p.id] = Math.max(0, currentStock - (comp.quantity * item.qty));
          }
        });
      }
    });

    for (const [prodId, newStock] of Object.entries(updatedStocks)) {
      await updateDoc(doc(db, 'products', prodId), { stock: newStock });
    }

    if (paymentMethod === 'Fiado') {
      const clientObj = clients.find((c) => c.name === selectedClient);
      if (clientObj) {
        const currentDebt = Number(clientObj.debt) || 0;
        await updateDoc(doc(db, 'clients', clientObj.id), { debt: currentDebt + cartTotal });
      }
    }

    let paidEfectivo = paymentMethod === 'Efectivo' ? cartTotal : paymentMethod === 'Mixto' ? customEfectivo : 0;
    let paidTransferencia = paymentMethod === 'Transferencia' ? cartTotal : paymentMethod === 'Mixto' ? customTransferencia : 0;

    const productsRevenue = cartTotal - shippingFee;
    const netProfit = productsRevenue - cartCostTotal - driverExtra;

    const newSale = {
      id: `V-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      client: selectedClient,
      paymentMethod, paidEfectivo, paidTransferencia,
      address: address.trim() || '',
      shippingFee, driverExtra,
      driverTotal: shippingFee + driverExtra,
      total: cartTotal, cost: cartCostTotal, profit: netProfit,
      items: saleCart.map((i) => ({
        id: i.id, name: i.name, qty: i.qty, price: i.effectivePrice || i.price,
        isDiscountApplied: i.isDiscountApplied || false, type: i.type, raw: i.raw
      }))
    };

    await setDoc(doc(db, 'sales', newSale.id), newSale);
    clearCart();
    setPrefilledOrder(null);
    notify(paymentMethod === 'Fiado' ? `📝 Venta fiada a ${selectedClient} por ${formatCurrency(cartTotal)}` : `✅ Venta #${newSale.id} registrada correctamente`);
  };

  const handleMarkSaleAsPaid = async (saleId, newPaymentMethod) => {
    const saleToPay = sales.find((s) => s.id === saleId);
    if (!saleToPay || saleToPay.paymentMethod !== 'Fiado') return;

    await updateDoc(doc(db, 'sales', saleId), {
      paymentMethod: newPaymentMethod,
      paidEfectivo: newPaymentMethod === 'Efectivo' ? saleToPay.total : 0,
      paidTransferencia: newPaymentMethod === 'Transferencia' ? saleToPay.total : 0
    });

    const clientObj = clients.find((c) => c.name === saleToPay.client);
    if (clientObj) {
      const currentDebt = Number(clientObj.debt) || 0;
      await updateDoc(doc(db, 'clients', clientObj.id), { debt: Math.max(0, currentDebt - saleToPay.total) });
    }

    setSaleToPayModal(null);
    notify(`✅ Venta #${saleToPay.id} marcada como PAGADA con ${newPaymentMethod}`);
  };

  const handleDeleteSale = async (saleId) => {
    const saleToDelete = sales.find((s) => s.id === saleId);
    if (!saleToDelete) return;

    const restoredStocks = {};
    saleToDelete.items.forEach((item) => {
      if (item.type === 'product' || !item.type) {
        const p = products.find((prod) => prod.id === item.id || prod.name === item.name);
        if (p) {
          const currentStock = restoredStocks[p.id] !== undefined ? restoredStocks[p.id] : p.stock;
          restoredStocks[p.id] = currentStock + item.qty;
        }
      } else if (item.type === 'promo') {
        const promoRef = item.raw || promos.find((pr) => pr.id === item.id);
        if (promoRef && promoRef.items) {
          promoRef.items.forEach((comp) => {
            const p = products.find((prod) => prod.id === comp.productId);
            if (p) {
              const currentStock = restoredStocks[p.id] !== undefined ? restoredStocks[p.id] : p.stock;
              restoredStocks[p.id] = currentStock + (comp.quantity * item.qty);
            }
          });
        }
      }
    });

    for (const [prodId, newStock] of Object.entries(restoredStocks)) {
      await updateDoc(doc(db, 'products', prodId), { stock: newStock });
    }

    if (saleToDelete.paymentMethod === 'Fiado') {
      const clientObj = clients.find((c) => c.name === saleToDelete.client);
      if (clientObj) {
        const currentDebt = Number(clientObj.debt) || 0;
        await updateDoc(doc(db, 'clients', clientObj.id), { debt: Math.max(0, currentDebt - saleToDelete.total) });
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
    await updateDoc(doc(db, 'products', productId), { stock: Math.max(0, prod.stock + delta) });
    notify('📦 Stock actualizado');
  };

  const handleDeleteProduct = async (productId) => {
    const prod = products.find((p) => p.id === productId);
    await deleteDoc(doc(db, 'products', productId));
    notify(`🗑️ ${prod ? prod.name : 'Producto'} eliminado`);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsedCost = parseFloat(prodCostInput);
    const parsedSell = parseFloat(prodSellInput);
    const parsedCombo = parseFloat(prodComboInput);

    try {
      if (editingProduct) {
        const parsedMinStock = parseInt(fd.get('minStock'), 10);
        await updateDoc(doc(db, 'products', editingProduct.id), {
          name: fd.get('name') || editingProduct.name,
          brand: fd.get('brand') || editingProduct.brand,
          category: fd.get('category') || editingProduct.category,
          imageUrl: fd.get('imageUrl') ?? editingProduct.imageUrl ?? '',
          costPrice: !isNaN(parsedCost) ? parsedCost : (editingProduct.costPrice ?? 0),
          sellPrice: !isNaN(parsedSell) ? parsedSell : (editingProduct.sellPrice ?? 0),
          comboPrice: !isNaN(parsedCombo) ? parsedCombo : (editingProduct.comboPrice ?? 0),
          minStock: !isNaN(parsedMinStock) ? parsedMinStock : (editingProduct.minStock ?? 5)
        });
        notify('✏️ Precios y datos actualizados');
      } else {
        const newP = {
          id: `p-${Date.now()}`,
          name: fd.get('name'),
          brand: fd.get('brand'),
          category: fd.get('category'),
          imageUrl: fd.get('imageUrl') || '',
          costPrice: !isNaN(parsedCost) ? parsedCost : 0,
          sellPrice: !isNaN(parsedSell) ? parsedSell : 0,
          comboPrice: !isNaN(parsedCombo) ? parsedCombo : 0,
          stock: parseInt(fd.get('stock'), 10) || 0,
          minStock: parseInt(fd.get('minStock'), 10) || 5,
        };
        await setDoc(doc(db, 'products', newP.id), newP);
        notify('✨ Producto añadido al catálogo');
      }
    } catch (err) {
      notify('⚠️ Error al guardar el producto');
    } finally {
      resetProductInputs();
    }
  };

  const handleUpdatePromoItems = (newItems, currentPrice = promoPriceInput) => {
    setPromoItems(newItems);
    setPromoDescription(formatPromoDescription(newItems, products, currentPrice));
  };

  const handleAddProductToPromo = (productId) => {
    if (!productId) return;
    const existingIndex = promoItems.findIndex((i) => i.productId === productId);
    const updated = existingIndex >= 0
      ? promoItems.map((item, idx) => idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item)
      : [...promoItems, { productId, quantity: 1 }];
    handleUpdatePromoItems(updated);
  };

  const handleUpdatePromoItemQty = (productId, delta) => {
    const updated = promoItems
      .map((item) => item.productId === productId ? (item.quantity + delta <= 0 ? null : { ...item, quantity: item.quantity + delta }) : item)
      .filter(Boolean);
    handleUpdatePromoItems(updated);
  };

  const handleRemoveProductFromPromo = (productId) => {
    handleUpdatePromoItems(promoItems.filter((item) => item.productId !== productId));
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsedPrice = parseFloat(promoPriceInput);

    try {
      if (editingPromo) {
        await updateDoc(doc(db, 'promos', editingPromo.id), {
          name: fd.get('name') || editingPromo.name,
          type: fd.get('type') || editingPromo.type,
          imageUrl: fd.get('imageUrl') ?? editingPromo.imageUrl ?? '',
          price: !isNaN(parsedPrice) ? parsedPrice : editingPromo.price,
          description: promoDescription || fd.get('description') || '',
          items: promoItems
        });
        notify('✏️ Promoción actualizada');
      } else {
        const newPromo = {
          id: `pr-${Date.now()}`,
          name: fd.get('name'),
          type: fd.get('type'),
          imageUrl: fd.get('imageUrl') || '',
          price: !isNaN(parsedPrice) ? parsedPrice : 0,
          active: true,
          description: promoDescription || fd.get('description') || '',
          items: promoItems
        };
        await setDoc(doc(db, 'promos', newPromo.id), newPromo);
        notify(`🎉 Promoción "${newPromo.name}" creada`);
      }
    } catch (err) {
      notify('⚠️ Error al guardar la promoción');
    } finally {
      resetPromoInputs();
    }
  };

  const handleDeletePromo = async (promoId) => {
    await deleteDoc(doc(db, 'promos', promoId));
    notify('🗑️ Promoción eliminada');
  };

  const togglePromoActive = async (id) => {
    const promo = promos.find((p) => p.id === id);
    if (promo) await updateDoc(doc(db, 'promos', id), { active: !promo.active });
  };

  const addToEntryCart = (product) => {
    setEntryCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      return existing
        ? prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
        : [...prev, { ...product, qty: 1 }];
    });
  };

  const updateEntryQty = (id, delta) => {
    setEntryCart((prev) =>
      prev.map((item) => item.id === id ? (item.qty + delta <= 0 ? null : { ...item, qty: item.qty + delta }) : item).filter(Boolean)
    );
  };

  const handleRegisterStockEntry = async (extraData = {}) => {
    if (entryCart.length === 0) return;
    const efct = parseFloat(entryEfectivoInput) || 0;
    const transf = parseFloat(entryTransferenciaInput) || 0;
    const totalCost = efct + transf;
    if (totalCost <= 0) return;

    const paymentSource = extraData?.paymentSource || 'caja';
    const montoCaja = extraData?.montoCaja !== undefined ? extraData.montoCaja : totalCost;

    try {
      const lastIngNum = parseInt(localStorage.getItem('benga_last_ing_num') || '8163', 10);
      const nextIngNum = lastIngNum + 1;
      localStorage.setItem('benga_last_ing_num', nextIngNum.toString());
      const entryId = `ING-${nextIngNum}`;

      await addDoc(collection(db, 'stock_entries'), {
        entryId, date: new Date().toISOString(),
        items: entryCart.map((i) => ({ id: i.id, name: i.name, qty: i.qty })),
        paidEfectivo: efct, paidTransferencia: transf, totalCost, paymentSource, montoCajaDescontado: montoCaja
      });

      for (const item of entryCart) {
        const currentProd = products.find((p) => p.id === item.id);
        const currentStock = currentProd ? Number(currentProd.stock || 0) : 0;
        await updateDoc(doc(db, 'products', item.id), { stock: currentStock + Number(item.qty) });
      }

      if (montoCaja > 0) {
        await addDoc(collection(db, 'movimientos_caja'), {
          tipo: 'egreso', concepto: `Ingreso Stock #${entryId} (${paymentSource === 'mixto' ? 'Pago Mixto' : 'Plata Negocio'})`,
          monto: montoCaja, fecha: new Date().toISOString()
        });
      }

      setEntryCart([]);
      setEntryEfectivoInput('');
      setEntryTransferenciaInput('');
      notify('✨ Ingreso de mercadería y stock registrados correctamente');
    } catch (err) {
      notify('⚠️ Error al guardar en la base de datos');
    }
  };

  const handleDeleteStockEntry = async (entryId) => {
    const entryToDelete = stockEntries.find((e) => e.id === entryId);
    if (!entryToDelete) return;

    for (const item of entryToDelete.items || []) {
      const currentProd = products.find((p) => p.id === item.id);
      if (currentProd) {
        await updateDoc(doc(db, 'products', item.id), { stock: Math.max(0, currentProd.stock - item.qty) });
      }
    }

    await deleteDoc(doc(db, 'stock_entries', entryId));
    notify('🗑️ Ingreso de mercadería eliminado y stock descontado');
  };

  const handleRegisterWithdrawal = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawInput) || 0;
    if (amount <= 0) return notify('⚠️ Ingresá un monto válido a retirar.');
    if (amount > metrics.availableToWithdraw) return notify(`⛔ No podés retirar más de tu ganancia disponible (${formatCurrency(metrics.availableToWithdraw)})`);

    const newWithdrawal = {
      id: `RET-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      amount, note: withdrawNote || 'Retiro de sueldo personal'
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

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const newClient = {
        id: `cli-${Date.now()}`,
        name: fd.get('name'),
        phone: fd.get('phone') || '',
        debt: 0
      };
      await setDoc(doc(db, 'clients', newClient.id), newClient);
      notify('Cliente registrado');
    } catch (err) {
      notify('⚠️ Error al registrar cliente');
    } finally {
      setShowClientModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row antialiased relative">
      {webOrders.length > 0 && (
        <button
          onClick={() => setShowWebOrdersModal(true)}
          className="fixed bottom-6 right-6 z-[90] bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold px-5 py-3.5 rounded-full shadow-2xl shadow-fuchsia-500/50 flex items-center gap-3 animate-bounce border-2 border-white"
        >
          <Bell className="w-6 h-6 fill-slate-950" />
          <span className="text-sm">¡Tenés {webOrders.length} pedido(s) web!</span>
        </button>
      )}

      {toast && (
        <div className="fixed top-5 right-5 z-[100] bg-fuchsia-500 text-slate-950 px-4 py-3 rounded-2xl font-bold shadow-2xl shadow-fuchsia-500/40 flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5 stroke-[3]" />
          <span className="text-sm">{toast}</span>
        </div>
      )}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} metrics={metrics} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950">
        {activeTab === 'sales' && (
          <SalesTab products={products} promos={promos} clients={clients} onRegisterSale={handleRegisterSale} notify={notify} prefilledOrder={prefilledOrder} />
        )}
        {activeTab === 'dashboard' && (
          <DashboardTab
            sales={sales} metrics={metrics} promos={promos} products={products}
            setShowWithdrawModal={setShowWithdrawModal} setShowBoxesModal={setShowBoxesModal}
            setSaleToPayModal={setSaleToPayModal} setSaleToDeleteConfirm={setSaleToDeleteConfirm}
            onReopenSale={(sale) => {
              setPrefilledOrder({
                items: sale.items, clientName: sale.client, paymentMethod: sale.paymentMethod,
                address: sale.address, paidEfectivo: sale.paidEfectivo, paidTransferencia: sale.paidTransferencia,
              });
              handleDeleteSale(sale.id);
              setActiveTab('sales');
              notify('✏️ Venta reabierta. Podés modificarla y volver a registrarla.');
            }}
          />
        )}
        {activeTab === 'inventory' && (
          <InventoryTab
            inventoryCategories={inventoryCategories} inventoryCategoryFilter={inventoryCategoryFilter}
            setInventoryCategoryFilter={setInventoryCategoryFilter} sortedAndFilteredInventory={sortedAndFilteredInventory}
            metrics={metrics} setShowWithdrawModal={setShowWithdrawModal}
            setShowProductModal={openCreateProductModal}
            handleAdjustStock={handleAdjustStock}
            setEditingProduct={openEditProductModal}
            handleDeleteProduct={handleDeleteProduct}
          />
        )}
        {activeTab === 'promos' && (
          <PromosTab
            promos={promos} products={products}
            openCreatePromoModal={openCreatePromoModal}
            openEditPromoModal={openEditPromoModal}
            handleDeletePromo={handleDeletePromo} togglePromoActive={togglePromoActive}
          />
        )}
        {activeTab === 'stock_entry' && (
          <StockEntryTab
            products={products} stockEntries={stockEntries} entrySearchTerm={entrySearchTerm}
            setEntrySearchTerm={setEntrySearchTerm} entryCart={entryCart} addToEntryCart={addToEntryCart}
            updateEntryQty={updateEntryQty} setEntryCart={setEntryCart} entryEfectivoInput={entryEfectivoInput}
            setEntryEfectivoInput={setEntryEfectivoInput} entryTransferenciaInput={entryTransferenciaInput}
            setEntryTransferenciaInput={setEntryTransferenciaInput} handleRegisterStockEntry={handleRegisterStockEntry}
            handleDeleteStockEntry={handleDeleteStockEntry} expenses={expenses} onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
        {activeTab === 'clients' && (
          <ClientsTab clients={clients} setShowClientModal={setShowClientModal} handleDeleteClient={handleDeleteClient} notify={notify} />
        )}
      </main>

      {/* RENDERIZADO DE MODALES */}
      <WebOrdersModal isOpen={showWebOrdersModal} onClose={() => setShowWebOrdersModal(false)} webOrders={webOrders} onAccept={handleAcceptWebOrder} onReject={handleRejectWebOrder} />
      <WithdrawModal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} metrics={metrics} salaryPercentage={salaryPercentage} withdrawInput={withdrawInput} setWithdrawInput={setWithdrawInput} withdrawNote={withdrawNote} setWithdrawNote={setWithdrawNote} withdrawals={withdrawals} onSubmit={handleRegisterWithdrawal} onDelete={handleDeleteWithdrawal} />
      <BoxesModal isOpen={showBoxesModal} onClose={() => setShowBoxesModal(false)} metrics={metrics} salaryPercentage={salaryPercentage} onSalaryPercentageChange={handleSalaryPercentageChange} />
      <SaleToPayModal saleToPayModal={saleToPayModal} onClose={() => setSaleToPayModal(null)} onMarkAsPaid={handleMarkSaleAsPaid} />
      <ConfirmDeleteSaleModal saleToDeleteConfirm={saleToDeleteConfirm} onClose={() => setSaleToDeleteConfirm(null)} onDelete={handleDeleteSale} />
      
      <ProductModal
        key={`prod-modal-${editingProduct ? editingProduct.id : 'new'}-${modalKeyCounter}`}
        isOpen={showProductModal}
        editingProduct={editingProduct}
        onClose={resetProductInputs}
        onSubmit={handleProductSubmit}
        prodCostInput={prodCostInput}
        setProdCostInput={setProdCostInput}
        prodSellInput={prodSellInput}
        setProdSellInput={setProdSellInput}
        prodComboInput={prodComboInput}
        setProdComboInput={setProdComboInput}
        applySuggestedMargin={applySuggestedMargin}
      />
      
      <PromoModal
        key={`promo-modal-${editingPromo ? editingPromo.id : 'new'}-${modalKeyCounter}`}
        isOpen={showPromoModal}
        editingPromo={editingPromo}
        onClose={resetPromoInputs}
        onSubmit={handlePromoSubmit}
        products={products}
        promoItems={promoItems}
        promoPriceInput={promoPriceInput}
        setPromoPriceInput={setPromoPriceInput}
        promoDescription={promoDescription}
        setPromoDescription={setPromoDescription}
        selectedProdForPromo={selectedProdForPromo}
        setSelectedProdForPromo={setSelectedProdForPromo}
        onAddProductToPromo={handleAddProductToPromo}
        onUpdatePromoItemQty={handleUpdatePromoItemQty}
        onRemoveProductFromPromo={handleRemoveProductFromPromo}
      />
      
      <ClientModal isOpen={showClientModal} onClose={() => setShowClientModal(false)} onSubmit={handleClientSubmit} />
    </div>
  );
}