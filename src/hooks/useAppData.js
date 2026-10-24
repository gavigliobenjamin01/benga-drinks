import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';

export function useAppData() {
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [stockEntries, setStockEntries] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [webOrders, setWebOrders] = useState([]);
  const [salaryPercentage, setSalaryPercentage] = useState(50);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (s) => setProducts(s.docs.map(d => ({ ...d.data(), id: d.id }))));
    const unsubPromos = onSnapshot(collection(db, 'promos'), (s) => setPromos(s.docs.map(d => ({ ...d.data(), id: d.id }))));
    const unsubClients = onSnapshot(collection(db, 'clients'), (s) => setClients(s.docs.map(d => ({ ...d.data(), id: d.id }))));
    const unsubSales = onSnapshot(collection(db, 'sales'), (s) => {
      const list = s.docs.map(d => ({ ...d.data(), id: d.id }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSales(list);
    });
    const unsubStockEntries = onSnapshot(collection(db, 'stock_entries'), (s) => {
      const list = s.docs.map(d => ({ ...d.data(), id: d.id }));
      list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setStockEntries(list);
    });
    const unsubWithdrawals = onSnapshot(collection(db, 'withdrawals'), (s) => {
      const list = s.docs.map(d => ({ ...d.data(), id: d.id }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setWithdrawals(list);
    });
    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (s) => {
      const list = s.docs.map(d => ({ ...d.data(), id: d.id }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(list);
    });
    const unsubOrders = onSnapshot(collection(db, 'orders'), (s) => {
      const list = s.docs.map(d => ({ ...d.data(), id: d.id }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setWebOrders(list);
    });
    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (s) => {
      if (s.exists() && s.data().salaryPercentage !== undefined) {
        setSalaryPercentage(s.data().salaryPercentage);
      }
    });

    return () => {
      unsubProducts(); unsubPromos(); unsubClients(); unsubSales();
      unsubStockEntries(); unsubWithdrawals(); unsubExpenses(); unsubOrders(); unsubSettings();
    };
  }, []);

  const metrics = useMemo(() => {
    const paidSales = sales.filter((s) => s.paymentMethod !== 'Fiado');
    const totalSalesCost = paidSales.reduce((acc, s) => {
      if (s.cost !== undefined && s.cost !== null && !isNaN(Number(s.cost))) return acc + Number(s.cost);
      if (s.items && s.items.length > 0) {
        const itemsCostSum = s.items.reduce((itemAcc, item) => {
          const foundProd = products.find(p => p.id === item.id || p.name === item.name);
          const unitCost = Number(item.cost) || Number(foundProd?.costPrice) || Number(foundProd?.cost) || Number(item.raw?.costPrice) || 0;
          return itemAcc + (unitCost * Number(item.qty || 1));
        }, 0);
        if (itemsCostSum > 0) return acc + itemsCostSum;
      }
      return acc + (Number(s.total) || 0) * 0.6;
    }, 0);

    const totalEfectivoExpenses = (expenses || []).reduce((acc, ex) => ex.paymentMethod === 'Efectivo' ? acc + (Number(ex.amount) || 0) : acc, 0);
    const totalTransferenciaExpenses = (expenses || []).reduce((acc, ex) => ex.paymentMethod === 'Transferencia' ? acc + (Number(ex.amount) || 0) : acc, 0);

    const efectivoRevenue = paidSales.reduce((acc, s) => {
      if (s.paymentMethod === 'Efectivo') return acc + (s.total || 0);
      if (s.paymentMethod === 'Mixto') return acc + (Number(s.paidEfectivo) || 0);
      return acc;
    }, 0) - (stockEntries || []).reduce((acc, e) => acc + (Number(e.paidEfectivo) || 0), 0) - totalEfectivoExpenses;

    const transferenciaRevenue = paidSales.reduce((acc, s) => {
      if (s.paymentMethod === 'Transferencia') return acc + (s.total || 0);
      if (s.paymentMethod === 'Mixto') return acc + (Number(s.paidTransferencia) || 0);
      return acc;
    }, 0) - (stockEntries || []).reduce((acc, e) => acc + (Number(e.paidTransferencia) || 0), 0) - totalTransferenciaExpenses;

    const totalRevenue = efectivoRevenue + transferenciaRevenue;
    const fiadoRevenue = sales.filter((s) => s.paymentMethod === 'Fiado').reduce((acc, s) => acc + (s.total || 0), 0);
    const netProfit = totalRevenue - totalSalesCost;
    const totalPendingDebt = clients.reduce((acc, c) => acc + (Number(c.debt) || 0), 0);
    const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
    const stockValuation = products.reduce((acc, p) => acc + (Number(p.costPrice || p.cost || 0) * Number(p.stock || 0)), 0);
    const totalSalaryProfit = Math.max(0, netProfit * (salaryPercentage / 100));
    const totalWithdrawn = withdrawals.reduce((acc, w) => acc + (Number(w.amount) || 0), 0);
    const availableToWithdraw = Math.max(0, totalSalaryProfit - totalWithdrawn);

    return {
      totalRevenue, totalCost: totalSalesCost, netProfit, totalPendingDebt, lowStockCount,
      stockValuation, merchandiseExpenses: 0, rawRevenue: totalRevenue, efectivoRevenue,
      transferenciaRevenue, fiadoRevenue, totalSalaryProfit, totalWithdrawn, availableToWithdraw
    };
  }, [sales, clients, products, withdrawals, salaryPercentage, stockEntries, expenses]);

  const inventoryCategories = useMemo(() => ['Todas', ...Array.from(new Set(products.map((p) => p.category))).filter(Boolean)], [products]);

  return {
    products, setProducts, promos, setPromos, sales, setSales, clients, setClients,
    stockEntries, setStockEntries, withdrawals, setWithdrawals, expenses, setExpenses,
    webOrders, setWebOrders, salaryPercentage, setSalaryPercentage, metrics, inventoryCategories
  };
}