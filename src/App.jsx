import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const SUPABASE_URL = "https://gznxhxaznykfbkrfdova.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_J4XysmLrS8VCNK9Zr9Ilpw_fzZpxErN";
const SUPABASE_STATE_URL = `${SUPABASE_URL}/rest/v1/wks_app_state`;

async function supabaseRequest(path = "", options = {}) {
  const response = await fetch(`${SUPABASE_STATE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Supabase error ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : null;
}

const employees = ["Muammar", "Bojes", "Tohir"];
const admins = ["Andre", "Lutfi"];

const menu = [
  { id: "dashboard", icon: "▦", label: "Dashboard" },
  { id: "pembelian", icon: "↓", label: "Pembelian" },
  { id: "penjualan", icon: "↑", label: "Penjualan" },
  { id: "stok", icon: "▤", label: "Stok Barang" },
  { id: "panjar", icon: "Rp", label: "Panjar" },
  { id: "kasbon", icon: "K", label: "Kasbon" },
  { id: "operasional", icon: "O", label: "Operasional" },
  { id: "keuangan", icon: "Rp", label: "Keuangan" },
  { id: "laporan", icon: "▥", label: "Laporan" },
  { id: "master", icon: "⚙", label: "Master Data" },
];

const stock = [
  { name: "Besi Tua", weight: 0, value: 0 },
  { name: "Besi Super", weight: 0, value: 0 },
  { name: "Besi Campur", weight: 0, value: 0 },
  { name: "Besi Tipis", weight: 0, value: 0 },
  { name: "Besi Tebal", weight: 0, value: 0 },
  { name: "Besi Cor", weight: 0, value: 0 },
  { name: "Besi Beton", weight: 0, value: 0 },
  { name: "Plat Besi", weight: 0, value: 0 },
  { name: "Besi UNP / Kanal", weight: 0, value: 0 },
  { name: "Besi WF / H-Beam", weight: 0, value: 0 },

  { name: "Tembaga Kupas", weight: 0, value: 0 },
  { name: "Tembaga Bakar", weight: 0, value: 0 },
  { name: "Tembaga Serabut", weight: 0, value: 0 },
  { name: "Tembaga Campur", weight: 0, value: 0 },
  { name: "Tembaga Pipa", weight: 0, value: 0 },
  { name: "Tembaga Kuning", weight: 0, value: 0 },

  { name: "Aluminium", weight: 0, value: 0 },
  { name: "Aluminium Tebal", weight: 0, value: 0 },
  { name: "Aluminium Tipis", weight: 0, value: 0 },
  { name: "Aluminium Profil", weight: 0, value: 0 },
  { name: "Aluminium Kaleng", weight: 0, value: 0 },
  { name: "Aluminium Velg", weight: 0, value: 0 },

  { name: "Kuningan", weight: 0, value: 0 },
  { name: "Kuningan Campur", weight: 0, value: 0 },
  { name: "Kuningan Kuning", weight: 0, value: 0 },
  { name: "Kuningan Merah", weight: 0, value: 0 },
  { name: "Kuningan Kran", weight: 0, value: 0 },

  { name: "Stainless", weight: 0, value: 0 },
  { name: "Stainless 304", weight: 0, value: 0 },
  { name: "Stainless 316", weight: 0, value: 0 },
  { name: "Stainless Campur", weight: 0, value: 0 },

  { name: "Kabel", weight: 0, value: 0 },
  { name: "Aki", weight: 0, value: 0 },
  { name: "Dinamo", weight: 0, value: 0 },
  { name: "Motor Listrik", weight: 0, value: 0 },
  { name: "Radiator", weight: 0, value: 0 },
  { name: "Seng", weight: 0, value: 0 },
  { name: "Timah", weight: 0, value: 0 },
  { name: "Nikel", weight: 0, value: 0 },
];

function rebuildMaterialsFromTransactions(currentMaterials, purchases, sales) {
  const materialMap = new Map();

  // Pertahankan daftar material, tetapi hitung ulang berat & nilai dari nol.
  currentMaterials.forEach((item) => {
    materialMap.set(item.name, {
      ...item,
      weight: 0,
      value: 0,
    });
  });

  purchases.forEach((item) => {
    if (!materialMap.has(item.material)) {
      materialMap.set(item.material, {
        name: item.material,
        weight: 0,
        value: 0,
      });
    }

    const current = materialMap.get(item.material);
    materialMap.set(item.material, {
      ...current,
      weight: Number(current.weight || 0) + Number(item.weight || 0),
      value: Number(current.value || 0) + Number(item.total || 0),
    });
  });

  sales.forEach((item) => {
    if (!materialMap.has(item.material)) {
      materialMap.set(item.material, {
        name: item.material,
        weight: 0,
        value: 0,
      });
    }

    const current = materialMap.get(item.material);
    materialMap.set(item.material, {
      ...current,
      weight: Math.max(
        0,
        Number(current.weight || 0) - Number(item.weight || 0)
      ),
      value: Math.max(
        0,
        Number(current.value || 0) - Number(item.cost || 0)
      ),
    });
  });

  return Array.from(materialMap.values()).map((item) => ({
    ...item,
    weight: Math.abs(Number(item.weight || 0)) < 0.000001 ? 0 : Number(item.weight || 0),
    value: Math.abs(Number(item.value || 0)) < 0.01 ? 0 : Number(item.value || 0),
  }));
}


const expenses = [
  { name: "Pembelian", value: 85000000, icon: "↓" },
  { name: "Panjar", value: 15000000, icon: "P" },
  { name: "Kasbon", value: 5000000, icon: "K" },
  { name: "Operasional", value: 7500000, icon: "O" },
  { name: "Lain-lain", value: 1000000, icon: "L" },
];

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function loadLocal(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [currentRole, setCurrentRole] = useState(() =>
    loadLocal("wks_role_session", "")
  );
  const [currentUserName, setCurrentUserName] = useState(() =>
    loadLocal("wks_user_name_session", "")
  );
  const [selectedLoginName, setSelectedLoginName] = useState("");
  const [adminPin, setAdminPin] = useState(() =>
    loadLocal("wks_admin_pin", "1234")
  );
  const [pinInput, setPinInput] = useState("");
  const [newAdminPin, setNewAdminPin] = useState("");

  const [purchases, setPurchases] = useState(() =>
    loadLocal("wks_purchases", [])
  );

  const [materials, setMaterials] = useState(() =>
    loadLocal("wks_materials", stock)
  );

  const [sales, setSales] = useState(() =>
    loadLocal("wks_sales", [])
  );

  const [advances, setAdvances] = useState(() =>
    loadLocal("wks_advances", [])
  );
  const [debts, setDebts] = useState(() =>
    loadLocal("wks_debts", [])
  );
  const [operations, setOperations] = useState(() =>
    loadLocal("wks_operations", [])
  );

  const [cashMovements, setCashMovements] = useState(() =>
    loadLocal("wks_cash_movements", [])
  );

  const [cashType, setCashType] = useState("masuk");
  const [cashAmount, setCashAmount] = useState("");
  const [cashNote, setCashNote] = useState("");

  const [advanceName, setAdvanceName] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceNote, setAdvanceNote] = useState("");

  const [debtName, setDebtName] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtNote, setDebtNote] = useState("");

  const [operationCategory, setOperationCategory] = useState("");
  const [operationAmount, setOperationAmount] = useState("");
  const [operationNote, setOperationNote] = useState("");

  const [backupNotice, setBackupNotice] = useState("");

  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");

  const [lastPurchase, setLastPurchase] = useState(null);
  const [lastSale, setLastSale] = useState(null);

  const [supplier, setSupplier] = useState("");
  const [material, setMaterial] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const materialSelectRef = useRef(null);

  const [buyer, setBuyer] = useState("");
  const [saleMaterial, setSaleMaterial] = useState("");
  const [saleWeight, setSaleWeight] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleNotice, setSaleNotice] = useState("");
  const saleMaterialSelectRef = useRef(null);

  const [newMaterial, setNewMaterial] = useState("");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editMaterialName, setEditMaterialName] = useState("");

  // STOK OTOMATIS:
  // Setiap perubahan Pembelian/Penjualan akan menghitung ulang stok.
  // Dengan cara ini urutan Hapus tidak bisa lagi meninggalkan stok sisa.
  useEffect(() => {
    setMaterials((current) =>
      rebuildMaterialsFromTransactions(current, purchases, sales)
    );
  }, [purchases, sales]);

  const [syncStatus, setSyncStatus] = useState("Menghubungkan...");
  const syncReadyRef = useRef(false);
  const applyingRemoteRef = useRef(false);
  const lastRemoteUpdateRef = useRef("");
  const uploadTimerRef = useRef(null);

  function buildSyncSnapshot() {
    return {
      materials,
      purchases,
      sales,
      advances,
      debts,
      operations,
      cashMovements,
      version: 1,
    };
  }

  function applyRemoteSnapshot(data) {
    if (!data || typeof data !== "object") return;

    applyingRemoteRef.current = true;

    if (Array.isArray(data.materials)) setMaterials(data.materials);
    if (Array.isArray(data.purchases)) setPurchases(data.purchases);
    if (Array.isArray(data.sales)) setSales(data.sales);
    if (Array.isArray(data.advances)) setAdvances(data.advances);
    if (Array.isArray(data.debts)) setDebts(data.debts);
    if (Array.isArray(data.operations)) setOperations(data.operations);
    if (Array.isArray(data.cashMovements)) setCashMovements(data.cashMovements);

    window.setTimeout(() => {
      applyingRemoteRef.current = false;
    }, 150);
  }

  async function loadRemoteSnapshot(showStatus = true) {
    try {
      if (showStatus) setSyncStatus("Sinkronisasi...");

      const rows = await supabaseRequest(
        "?id=eq.main&select=id,data,updated_at&limit=1",
        { method: "GET" }
      );

      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0];
        const remoteTime = row.updated_at || "";

        if (
          !lastRemoteUpdateRef.current ||
          remoteTime > lastRemoteUpdateRef.current
        ) {
          applyRemoteSnapshot(row.data || {});
          lastRemoteUpdateRef.current = remoteTime;
        }

        syncReadyRef.current = true;
        setSyncStatus("Online • Sinkron");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Gagal mengambil data Supabase:", error);
      setSyncStatus("Offline • Data lokal");
      return false;
    }
  }

  async function saveRemoteSnapshot(snapshot) {
    try {
      setSyncStatus("Menyimpan online...");

      const now = new Date().toISOString();
      const result = await supabaseRequest("?on_conflict=id", {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify([
          {
            id: "main",
            data: snapshot,
            updated_at: now,
          },
        ]),
      });

      const returnedTime =
        Array.isArray(result) && result[0]?.updated_at
          ? result[0].updated_at
          : now;

      lastRemoteUpdateRef.current = returnedTime;
      syncReadyRef.current = true;
      setSyncStatus("Online • Sinkron");
      return true;
    } catch (error) {
      console.error("Gagal menyimpan data Supabase:", error);
      setSyncStatus("Offline • Data lokal");
      return false;
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function startSync() {
      const found = await loadRemoteSnapshot(true);
      if (cancelled) return;

      if (!found) {
        syncReadyRef.current = true;
        await saveRemoteSnapshot(buildSyncSnapshot());
      }
    }

    startSync();

    const poller = window.setInterval(() => {
      if (!cancelled && syncReadyRef.current && !applyingRemoteRef.current) {
        loadRemoteSnapshot(false);
      }
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(poller);
      if (uploadTimerRef.current) {
        window.clearTimeout(uploadTimerRef.current);
      }
    };
    // Initial connection only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!syncReadyRef.current || applyingRemoteRef.current) return;

    if (uploadTimerRef.current) {
      window.clearTimeout(uploadTimerRef.current);
    }

    uploadTimerRef.current = window.setTimeout(() => {
      saveRemoteSnapshot(buildSyncSnapshot());
    }, 700);

    return () => {
      if (uploadTimerRef.current) {
        window.clearTimeout(uploadTimerRef.current);
      }
    };
    // All business data that must sync between devices.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials, purchases, sales, advances, debts, operations, cashMovements]);

  useEffect(() => {
    // Backup otomatis harian di browser. Maksimal 7 snapshot terakhir.
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem("wks_last_auto_backup_date");

    if (lastDate === today) return;

    const snapshot = {
      version: 2,
      createdAt: new Date().toISOString(),
      materials,
      purchases,
      sales,
      advances,
      debts,
      operations,
      cashMovements,
    };

    try {
      const oldBackups = JSON.parse(
        localStorage.getItem("wks_auto_backups") || "[]"
      );
      const nextBackups = [
        ...(Array.isArray(oldBackups) ? oldBackups : []),
        snapshot,
      ].slice(-7);

      localStorage.setItem(
        "wks_auto_backups",
        JSON.stringify(nextBackups)
      );
      localStorage.setItem("wks_last_auto_backup_date", today);
    } catch (error) {
      console.error("Backup otomatis gagal:", error);
    }
  }, [
    materials,
    purchases,
    sales,
    advances,
    debts,
    operations,
    cashMovements,
  ]);

  useEffect(() => {
    localStorage.setItem("wks_materials", JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem("wks_role_session", JSON.stringify(currentRole));
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem("wks_user_name_session", JSON.stringify(currentUserName));
  }, [currentUserName]);

  useEffect(() => {
    localStorage.setItem("wks_admin_pin", JSON.stringify(adminPin));
  }, [adminPin]);

  useEffect(() => {
    if (currentRole === "employee" && activeMenu !== "pembelian") {
      setActiveMenu("pembelian");
    }
  }, [currentRole, activeMenu]);

  useEffect(() => {
    localStorage.setItem("wks_purchases", JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem("wks_sales", JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem("wks_advances", JSON.stringify(advances));
  }, [advances]);

  useEffect(() => {
    localStorage.setItem("wks_debts", JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem("wks_operations", JSON.stringify(operations));
  }, [operations]);

  useEffect(() => {
    localStorage.setItem("wks_cash_movements", JSON.stringify(cashMovements));
  }, [cashMovements]);

  const totalStock = useMemo(
    () =>
      materials.reduce(
        (total, item) => total + Number(item.weight || 0),
        0
      ),
    [materials]
  );

  const activeStockCount = useMemo(
    () => materials.filter((item) => Number(item.weight || 0) > 0).length,
    [materials]
  );

  const totalPurchases = useMemo(
    () =>
      purchases.reduce(
        (total, item) => total + Number(item.total || 0),
        0
      ),
    [purchases]
  );

  const totalSales = useMemo(
    () =>
      sales.reduce(
        (total, item) => total + Number(item.total || 0),
        0
      ),
    [sales]
  );

  const totalAdvances = useMemo(
    () => advances
      .filter((item) => item.status !== "Lunas")
      .reduce((total, item) => total + Number(item.remaining ?? item.amount ?? 0), 0),
    [advances]
  );

  const totalDebts = useMemo(
    () => debts
      .filter((item) => item.status !== "Lunas")
      .reduce((total, item) => total + Number(item.remaining ?? item.amount ?? 0), 0),
    [debts]
  );

  const totalOperations = useMemo(
    () => operations.reduce((total, item) => total + Number(item.amount || 0), 0),
    [operations]
  );

  const totalCashInOther = cashMovements
    .filter((item) => item.type === "masuk")
    .reduce((t, i) => t + Number(i.amount || 0), 0);

  const totalCashOutOther = cashMovements
    .filter((item) => item.type === "keluar")
    .reduce((t, i) => t + Number(i.amount || 0), 0);

  const totalCashOut = totalPurchases + totalOperations +
    advances.reduce((t, i) => t + Number(i.amount || 0), 0) +
    debts.reduce((t, i) => t + Number(i.amount || 0), 0) +
    totalCashOutOther;

  const totalCashIn = totalSales + totalCashInOther;
  const cashBalance = totalCashIn - totalCashOut;

  const currentInventoryValue = materials.reduce(
    (total, item) => total + Number(item.value || 0),
    0
  );

  // Modal barang terjual dihitung dari biaya yang disimpan pada SETIAP penjualan.
  // Jadi stok awal/demo tidak pernah dianggap sebagai barang terjual.
  const costOfGoodsSold = sales.reduce(
    (total, item) => total + Math.max(0, Number(item.cost || 0)),
    0
  );

  const grossProfit = totalSales - costOfGoodsSold;
  const netProfit = grossProfit - totalOperations - totalCashOutOther;

  function parseIdDate(value) {
    if (!value) return null;
    const parts = String(value).split("/");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  function itemInReportPeriod(item) {
    const date = parseIdDate(item.date);
    if (!date) return true;

    if (reportStartDate) {
      const start = new Date(reportStartDate + "T00:00:00");
      if (date < start) return false;
    }

    if (reportEndDate) {
      const end = new Date(reportEndDate + "T23:59:59");
      if (date > end) return false;
    }

    return true;
  }

  const reportPurchases = purchases.filter(itemInReportPeriod);
  const reportSales = sales.filter(itemInReportPeriod);
  const reportAdvances = advances.filter(itemInReportPeriod);
  const reportDebts = debts.filter(itemInReportPeriod);
  const reportOperations = operations.filter(itemInReportPeriod);
  const reportCashMovements = cashMovements.filter(itemInReportPeriod);

  const reportPurchaseTotal = reportPurchases.reduce(
    (t, i) => t + Number(i.total || 0), 0
  );
  const reportSalesTotal = reportSales.reduce(
    (t, i) => t + Number(i.total || 0), 0
  );
  const reportAdvanceTotal = reportAdvances.reduce(
    (t, i) => t + Number(i.amount || 0), 0
  );
  const reportDebtTotal = reportDebts.reduce(
    (t, i) => t + Number(i.amount || 0), 0
  );
  const reportOperationTotal = reportOperations.reduce(
    (t, i) => t + Number(i.amount || 0), 0
  );
  const reportCashInOther = reportCashMovements
    .filter((i) => i.type === "masuk")
    .reduce((t, i) => t + Number(i.amount || 0), 0);
  const reportCashOutOther = reportCashMovements
    .filter((i) => i.type === "keluar")
    .reduce((t, i) => t + Number(i.amount || 0), 0);

  const reportEstimatedCOGS = reportSales.reduce(
    (total, sale) => total + Math.max(0, Number(sale.cost || 0)),
    0
  );

  const reportGrossProfit = reportSalesTotal - reportEstimatedCOGS;
  const reportNetProfit =
    reportGrossProfit - reportOperationTotal - reportCashOutOther;
  const reportCashOut =
    reportPurchaseTotal +
    reportAdvanceTotal +
    reportDebtTotal +
    reportOperationTotal +
    reportCashOutOther;
  const reportCashIn = reportSalesTotal + reportCashInOther;
  const reportBalance = reportCashIn - reportCashOut;

  function requireAdmin(actionLabel = "melakukan tindakan ini") {
    if (currentRole !== "admin") {
      alert(`Akses ditolak. Hanya Administrator yang dapat ${actionLabel}.`);
      return false;
    }
    return true;
  }

  function loginAdmin() {
    if (!selectedLoginName || !admins.includes(selectedLoginName)) {
      alert("Pilih nama Admin terlebih dahulu.");
      return;
    }

    if (pinInput !== String(adminPin)) {
      alert("PIN Admin salah.");
      return;
    }

    setCurrentRole("admin");
    setCurrentUserName(selectedLoginName);
    setActiveMenu("dashboard");
    setPinInput("");
  }

  function loginEmployee() {
    if (!selectedLoginName || !employees.includes(selectedLoginName)) {
      alert("Pilih nama Karyawan terlebih dahulu.");
      return;
    }

    setCurrentRole("employee");
    setCurrentUserName(selectedLoginName);
    setActiveMenu("pembelian");
    setPinInput("");
  }

  function logoutRole() {
    setCurrentRole("");
    setCurrentUserName("");
    setSelectedLoginName("");
    setPinInput("");
  }

  function changeAdminPin() {
    if (!requireAdmin("mengubah PIN Admin")) return;
    const pin = newAdminPin.trim();
    if (!/^\d{4,8}$/.test(pin)) {
      alert("PIN harus 4 sampai 8 angka.");
      return;
    }
    setAdminPin(pin);
    setNewAdminPin("");
    alert("PIN Admin berhasil diubah.");
  }

  function addMaterial() {
    if (!requireAdmin("menambah Master Data")) return;
    const name = newMaterial.trim();

    if (!name) {
      alert("Nama material belum diisi.");
      return;
    }

    const sudahAda = materials.some(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );

    if (sudahAda) {
      alert("Material tersebut sudah ada.");
      return;
    }

    setMaterials((prev) => [
      ...prev,
      {
        name,
        weight: 0,
        value: 0,
      },
    ]);

    setNewMaterial("");
  }

  function startEditMaterial(item) {
    if (!requireAdmin("mengedit Master Data")) return;
    setEditingMaterial(item.name);
    setEditMaterialName(item.name);
  }

  function saveEditMaterial() {
    if (!requireAdmin("mengedit Master Data")) return;
    const name = editMaterialName.trim();

    if (!name) {
      alert("Nama material tidak boleh kosong.");
      return;
    }

    const duplicate = materials.some(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.name !== editingMaterial
    );

    if (duplicate) {
      alert("Nama material tersebut sudah ada.");
      return;
    }

    setMaterials((prev) =>
      prev.map((item) =>
        item.name === editingMaterial
          ? { ...item, name }
          : item
      )
    );

    setPurchases((prev) =>
      prev.map((item) =>
        item.material === editingMaterial
          ? { ...item, material: name }
          : item
      )
    );

    setSales((prev) =>
      prev.map((item) =>
        item.material === editingMaterial
          ? { ...item, material: name }
          : item
      )
    );

    if (material === editingMaterial) {
      setMaterial(name);
    }

    if (saleMaterial === editingMaterial) {
      setSaleMaterial(name);
    }

    setEditingMaterial(null);
    setEditMaterialName("");
  }

  function cancelEditMaterial() {
    setEditingMaterial(null);
    setEditMaterialName("");
  }

  function deleteMaterial(item) {
    if (!window.confirm(`Hapus material "${item.name}"?`)) {
      return;
    }

    setMaterials((prev) =>
      prev.filter((m) => m.name !== item.name)
    );

    if (material === item.name) {
      setMaterial("");
    }
  }

  function savePurchase() {
    if (!supplier || !material || !weight || !price) {
      alert("Mohon lengkapi semua data pembelian.");
      return;
    }

    const numericWeight = Number(weight);
    const numericPrice = Number(price);

    if (numericWeight <= 0 || numericPrice <= 0) {
      alert("Berat dan harga harus lebih dari 0.");
      return;
    }

    const newPurchase = {
      id: Date.now(),
      date: new Date().toLocaleDateString("id-ID"),
      supplier: supplier.trim(),
      operator: currentUserName || (currentRole === "admin" ? "Admin" : "Karyawan"),
      material,
      weight: numericWeight,
      price: numericPrice,
      total: numericWeight * numericPrice,
    };

    setPurchases((prev) => [...prev, newPurchase]);
    setLastPurchase(newPurchase);

    setMaterials((prev) =>
      prev.map((item) =>
        item.name === material
          ? {
              ...item,
              weight: Number(item.weight || 0) + numericWeight,
              value:
                Number(item.value || 0) + Number(newPurchase.total || 0),
            }
          : item
      )
    );

    // Supplier sengaja dipertahankan agar transaksi berikutnya lebih cepat.
    setMaterial("");
    setWeight("");
    setPrice("");

    setSaveNotice(`Tersimpan: ${material} — ${numericWeight.toLocaleString("id-ID")} KG`);
    setTimeout(() => setSaveNotice(""), 1800);
    setTimeout(() => materialSelectRef.current?.focus(), 0);
  }

  function saveSale() {
    if (!requireAdmin("mencatat penjualan")) return;
    if (!buyer || !saleMaterial || !saleWeight || !salePrice) {
      alert("Mohon lengkapi semua data penjualan.");
      return;
    }

    const numericWeight = Number(saleWeight);
    const numericPrice = Number(salePrice);

    if (numericWeight <= 0 || numericPrice <= 0) {
      alert("Berat dan harga harus lebih dari 0.");
      return;
    }

    const selectedMaterial = materials.find(
      (item) => item.name === saleMaterial
    );
    const availableStock = Number(selectedMaterial?.weight || 0);

    if (numericWeight > availableStock) {
      alert(
        `Stok ${saleMaterial} tidak cukup. Stok tersedia ${availableStock.toLocaleString("id-ID")} KG.`
      );
      return;
    }

    const selectedWeight = Number(selectedMaterial?.weight || 0);
    const selectedValue = Number(selectedMaterial?.value || 0);
    const averageCost =
      selectedWeight > 0 ? selectedValue / selectedWeight : 0;
    const saleCost = averageCost * numericWeight;

    const newSale = {
      id: Date.now(),
      date: new Date().toLocaleDateString("id-ID"),
      buyer: buyer.trim(),
      operator: currentUserName || "Admin",
      material: saleMaterial,
      weight: numericWeight,
      price: numericPrice,
      total: numericWeight * numericPrice,
      cost: saleCost,
      profit: numericWeight * numericPrice - saleCost,
    };

    setSales((prev) => [...prev, newSale]);
    setLastSale(newSale);

    setMaterials((prev) =>
      prev.map((item) => {
        if (item.name !== saleMaterial) return item;

        const oldWeight = Number(item.weight || 0);
        const oldValue = Number(item.value || 0);
        const averageCost = oldWeight > 0 ? oldValue / oldWeight : 0;
        const remainingWeight = Math.max(0, oldWeight - numericWeight);
        const remainingValue = Math.max(
          0,
          oldValue - averageCost * numericWeight
        );

        return {
          ...item,
          weight: remainingWeight,
          value: remainingValue,
        };
      })
    );

    // Pembeli sengaja dipertahankan agar transaksi berikutnya lebih cepat.
    setSaleMaterial("");
    setSaleWeight("");
    setSalePrice("");

    setSaleNotice(
      `Tersimpan: ${saleMaterial} — ${numericWeight.toLocaleString("id-ID")} KG`
    );
    setTimeout(() => setSaleNotice(""), 1800);
    setTimeout(() => saleMaterialSelectRef.current?.focus(), 0);
  }

  function saveAdvance() {
    if (!requireAdmin("mencatat panjar")) return;
    const amount = Number(advanceAmount);
    if (!advanceName.trim() || amount <= 0) {
      alert("Isi nama dan nominal panjar dengan benar.");
      return;
    }
    setAdvances((prev) => [...prev, {
      id: Date.now(),
      date: new Date().toLocaleDateString("id-ID"),
      name: advanceName.trim(),
      amount,
      remaining: amount,
      note: advanceNote.trim(),
      status: "Berjalan",
    }]);
    setAdvanceAmount("");
    setAdvanceNote("");
  }

  function settleAdvance(id) {
    if (!requireAdmin("mengubah status panjar")) return;
    if (!window.confirm("Tandai panjar ini sebagai lunas?")) return;
    setAdvances((prev) => prev.map((item) =>
      item.id === id ? { ...item, remaining: 0, status: "Lunas" } : item
    ));
  }

  function saveDebt() {
    if (!requireAdmin("mencatat kasbon")) return;
    const amount = Number(debtAmount);
    if (!debtName.trim() || amount <= 0) {
      alert("Isi nama dan nominal kasbon dengan benar.");
      return;
    }
    setDebts((prev) => [...prev, {
      id: Date.now(),
      date: new Date().toLocaleDateString("id-ID"),
      name: debtName.trim(),
      amount,
      remaining: amount,
      note: debtNote.trim(),
      status: "Belum Lunas",
    }]);
    setDebtAmount("");
    setDebtNote("");
  }

  function settleDebt(id) {
    if (!requireAdmin("mengubah status kasbon")) return;
    if (!window.confirm("Tandai kasbon ini sebagai lunas?")) return;
    setDebts((prev) => prev.map((item) =>
      item.id === id ? { ...item, remaining: 0, status: "Lunas" } : item
    ));
  }

  function saveOperation() {
    if (!requireAdmin("mencatat operasional")) return;
    const amount = Number(operationAmount);
    if (!operationCategory.trim() || amount <= 0) {
      alert("Isi kategori dan nominal operasional dengan benar.");
      return;
    }
    setOperations((prev) => [...prev, {
      id: Date.now(),
      date: new Date().toLocaleDateString("id-ID"),
      category: operationCategory.trim(),
      amount,
      note: operationNote.trim(),
    }]);
    setOperationAmount("");
    setOperationNote("");
  }

  function deleteOperation(id) {
    if (!requireAdmin("menghapus operasional")) return;
    if (!window.confirm("Hapus catatan operasional ini?")) return;
    setOperations((prev) => prev.filter((item) => item.id !== id));
  }

  function deletePurchase(id) {
    if (!requireAdmin("menghapus pembelian")) return;
    const item = purchases.find((p) => p.id === id);
    if (!item || !window.confirm("Hapus transaksi pembelian ini?")) return;

    setPurchases((prev) => prev.filter((p) => p.id !== id));
    setMaterials((prev) =>
      prev.map((m) =>
        m.name === item.material
          ? {
              ...m,
              weight: Math.max(
                0,
                Number(m.weight || 0) - Number(item.weight || 0)
              ),
              value: Math.max(
                0,
                Number(m.value || 0) - Number(item.total || 0)
              ),
            }
          : m
      )
    );
  }

  function editPurchase(id) {
    if (!requireAdmin("mengedit pembelian")) return;
    const item = purchases.find((p) => p.id === id);
    if (!item) return;

    const newSupplier = window.prompt("Supplier:", item.supplier);
    if (newSupplier === null) return;

    const newMaterial = window.prompt("Material:", item.material);
    if (newMaterial === null) return;

    if (!materials.some((m) => m.name === newMaterial.trim())) {
      alert("Nama material tidak ditemukan di Master Data.");
      return;
    }

    const newWeight = Number(window.prompt("Berat (KG):", item.weight));
    const newPrice = Number(window.prompt("Harga / KG:", item.price));

    if (!newSupplier.trim() || newWeight <= 0 || newPrice <= 0) {
      alert("Data pembelian tidak valid.");
      return;
    }

    const oldMaterial = item.material;
    const oldWeight = Number(item.weight || 0);
    const oldTotal = Number(item.total || 0);
    const targetMaterial = newMaterial.trim();
    const newTotal = newWeight * newPrice;

    setMaterials((prev) =>
      prev.map((m) => {
        let nextWeight = Number(m.weight || 0);
        let nextValue = Number(m.value || 0);

        if (m.name === oldMaterial) {
          nextWeight -= oldWeight;
          nextValue -= oldTotal;
        }

        if (m.name === targetMaterial) {
          nextWeight += newWeight;
          nextValue += newTotal;
        }

        return {
          ...m,
          weight: Math.max(0, nextWeight),
          value: Math.max(0, nextValue),
        };
      })
    );

    setPurchases((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              supplier: newSupplier.trim(),
              material: targetMaterial,
              weight: newWeight,
              price: newPrice,
              total: newWeight * newPrice,
            }
          : p
      )
    );
  }

  function deleteSale(id) {
    if (!requireAdmin("menghapus penjualan")) return;
    const item = sales.find((s) => s.id === id);
    if (!item || !window.confirm("Hapus transaksi penjualan ini?")) return;

    setSales((prev) => prev.filter((s) => s.id !== id));
    setMaterials((prev) =>
      prev.map((m) =>
        m.name === item.material
          ? {
              ...m,
              weight: Number(m.weight || 0) + Number(item.weight || 0),
              value: Number(m.value || 0) + Number(item.cost || 0),
            }
          : m
      )
    );
  }

  function editSale(id) {
    if (!requireAdmin("mengedit penjualan")) return;
    const item = sales.find((s) => s.id === id);
    if (!item) return;

    const newBuyer = window.prompt("Pembeli:", item.buyer);
    if (newBuyer === null) return;

    const newMaterial = window.prompt("Material:", item.material);
    if (newMaterial === null) return;

    const targetMaterial = newMaterial.trim();
    if (!materials.some((m) => m.name === targetMaterial)) {
      alert("Nama material tidak ditemukan di Master Data.");
      return;
    }

    const newWeight = Number(window.prompt("Berat (KG):", item.weight));
    const newPrice = Number(window.prompt("Harga Jual / KG:", item.price));

    if (!newBuyer.trim() || newWeight <= 0 || newPrice <= 0) {
      alert("Data penjualan tidak valid.");
      return;
    }

    const oldSaleWeight = Number(item.weight || 0);
    const oldSaleCost = Number(item.cost || 0);

    const targetBefore = materials.find((m) => m.name === targetMaterial);
    const restoredTargetWeight =
      Number(targetBefore?.weight || 0) +
      (targetMaterial === item.material ? oldSaleWeight : 0);
    const restoredTargetValue =
      Number(targetBefore?.value || 0) +
      (targetMaterial === item.material ? oldSaleCost : 0);

    if (newWeight > restoredTargetWeight) {
      alert(
        `Stok ${targetMaterial} tidak cukup. Maksimal ${restoredTargetWeight.toLocaleString("id-ID")} KG.`
      );
      return;
    }

    const targetAverageCost =
      restoredTargetWeight > 0
        ? restoredTargetValue / restoredTargetWeight
        : 0;
    const newCost = targetAverageCost * newWeight;
    const newTotal = newWeight * newPrice;

    setMaterials((prev) =>
      prev.map((m) => {
        let nextWeight = Number(m.weight || 0);
        let nextValue = Number(m.value || 0);

        if (m.name === item.material) {
          nextWeight += oldSaleWeight;
          nextValue += oldSaleCost;
        }

        if (m.name === targetMaterial) {
          nextWeight -= newWeight;
          nextValue -= newCost;
        }

        return {
          ...m,
          weight: Math.max(0, nextWeight),
          value: Math.max(0, nextValue),
        };
      })
    );

    setSales((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              buyer: newBuyer.trim(),
              material: targetMaterial,
              weight: newWeight,
              price: newPrice,
              total: newTotal,
              cost: newCost,
              profit: newTotal - newCost,
            }
          : s
      )
    );
  }

  function editAdvance(id) {
    if (!requireAdmin("mengedit panjar")) return;
    const item = advances.find((x) => x.id === id);
    if (!item) return;
    const name = window.prompt("Nama:", item.name);
    if (name === null) return;
    const amount = Number(window.prompt("Nominal:", item.amount));
    const note = window.prompt("Keterangan:", item.note || "");
    if (note === null) return;
    if (!name.trim() || amount <= 0) {
      alert("Data panjar tidak valid.");
      return;
    }
    setAdvances((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              name: name.trim(),
              amount,
              remaining: x.status === "Lunas" ? 0 : amount,
              note: note.trim(),
            }
          : x
      )
    );
  }

  function deleteAdvance(id) {
    if (!requireAdmin("menghapus panjar")) return;
    if (!window.confirm("Hapus catatan panjar ini?")) return;
    setAdvances((prev) => prev.filter((x) => x.id !== id));
  }

  function editDebt(id) {
    if (!requireAdmin("mengedit kasbon")) return;
    const item = debts.find((x) => x.id === id);
    if (!item) return;
    const name = window.prompt("Nama:", item.name);
    if (name === null) return;
    const amount = Number(window.prompt("Nominal:", item.amount));
    const note = window.prompt("Keterangan:", item.note || "");
    if (note === null) return;
    if (!name.trim() || amount <= 0) {
      alert("Data kasbon tidak valid.");
      return;
    }
    setDebts((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              name: name.trim(),
              amount,
              remaining: x.status === "Lunas" ? 0 : amount,
              note: note.trim(),
            }
          : x
      )
    );
  }

  function deleteDebt(id) {
    if (!requireAdmin("menghapus kasbon")) return;
    if (!window.confirm("Hapus catatan kasbon ini?")) return;
    setDebts((prev) => prev.filter((x) => x.id !== id));
  }

  function editOperation(id) {
    if (!requireAdmin("mengedit operasional")) return;
    const item = operations.find((x) => x.id === id);
    if (!item) return;
    const category = window.prompt("Kategori:", item.category);
    if (category === null) return;
    const amount = Number(window.prompt("Nominal:", item.amount));
    const note = window.prompt("Keterangan:", item.note || "");
    if (note === null) return;
    if (!category.trim() || amount <= 0) {
      alert("Data operasional tidak valid.");
      return;
    }
    setOperations((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, category: category.trim(), amount, note: note.trim() }
          : x
      )
    );
  }

  function csvCell(value) {
    const textValue = String(value ?? "").replace(/"/g, '""');
    return `"${textValue}"`;
  }

  function exportReportExcel() {
    if (!requireAdmin("mengekspor laporan")) return;
    const rows = [];

    rows.push([
      "Jenis",
      "Tanggal",
      "Nama",
      "Petugas",
      "Material/Keterangan",
      "Berat KG",
      "Harga",
      "Total",
      "Modal Barang",
      "Laba",
    ]);

    reportPurchases.forEach((item) => {
      rows.push([
        "Pembelian",
        item.date || "",
        item.supplier || "",
        item.operator || "",
        item.material || "",
        Number(item.weight || 0),
        Number(item.price || 0),
        Number(item.total || 0),
        "",
        "",
      ]);
    });

    reportSales.forEach((item) => {
      const total = Number(item.total || 0);
      const cost = Number(item.cost || 0);
      rows.push([
        "Penjualan",
        item.date || "",
        item.buyer || "",
        item.operator || "",
        item.material || "",
        Number(item.weight || 0),
        Number(item.price || 0),
        total,
        cost,
        total - cost,
      ]);
    });

    reportAdvances.forEach((item) => {
      rows.push([
        "Panjar",
        item.date || "",
        item.name || "",
        "",
        item.note || "",
        "",
        "",
        Number(item.amount || 0),
        "",
        "",
      ]);
    });

    reportDebts.forEach((item) => {
      rows.push([
        "Kasbon",
        item.date || "",
        item.name || "",
        "",
        item.note || "",
        "",
        "",
        Number(item.amount || 0),
        "",
        "",
      ]);
    });

    reportOperations.forEach((item) => {
      rows.push([
        "Operasional",
        item.date || "",
        "",
        "",
        item.note || item.description || "",
        "",
        "",
        Number(item.amount || 0),
        "",
        "",
      ]);
    });

    reportCashMovements.forEach((item) => {
      rows.push([
        item.type === "masuk" ? "Kas Masuk" : "Kas Keluar",
        item.date || "",
        "",
        "",
        item.note || "",
        "",
        "",
        Number(item.amount || 0),
        "",
        "",
      ]);
    });

    rows.push([]);
    rows.push(["RINGKASAN LAPORAN"]);
    rows.push(["Penjualan", reportSalesTotal]);
    rows.push(["Pembelian", reportPurchaseTotal]);
    rows.push(["Modal Barang Terjual", reportEstimatedCOGS]);
    rows.push(["Laba Kotor", reportGrossProfit]);
    rows.push(["Operasional", reportOperationTotal]);
    rows.push(["Pengeluaran Lain", reportCashOutOther]);
    rows.push(["Laba Bersih", reportNetProfit]);
    rows.push(["Saldo Periode", reportBalance]);

    const content = "\uFEFF" + rows
      .map((row) => row.map(csvCell).join(";"))
      .join("\r\n");

    const blob = new Blob([content], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const start = reportStartDate || "awal";
    const end = reportEndDate || "akhir";
    a.href = url;
    a.download = `LAPORAN_WKS_${start}_${end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadLatestAutoBackup() {
    if (!requireAdmin("mengunduh backup otomatis")) return;
    try {
      const backups = JSON.parse(
        localStorage.getItem("wks_auto_backups") || "[]"
      );

      if (!Array.isArray(backups) || backups.length === 0) {
        alert("Belum ada backup otomatis.");
        return;
      }

      const latest = backups[backups.length - 1];
      const blob = new Blob([JSON.stringify(latest, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = String(latest.createdAt || new Date().toISOString())
        .slice(0, 10);
      a.href = url;
      a.download = `WKS_AUTO_BACKUP_${date}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setBackupNotice("Backup otomatis terbaru berhasil di-download.");
      setTimeout(() => setBackupNotice(""), 2500);
    } catch {
      alert("Backup otomatis tidak dapat dibaca.");
    }
  }

  function backupData() {
    if (!requireAdmin("membuat backup manual")) return;
    const data = {
      version: 1,
      createdAt: new Date().toISOString(),
      materials,
      purchases,
      sales,
      advances,
      debts,
      operations,
      cashMovements,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `WKS_BACKUP_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setBackupNotice("Backup berhasil di-download.");
    setTimeout(() => setBackupNotice(""), 2500);
  }

  function restoreData(event) {
    if (!requireAdmin("melakukan restore data")) {
      event.target.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        if (
          !Array.isArray(data.materials) ||
          !Array.isArray(data.purchases) ||
          !Array.isArray(data.sales)
        ) {
          throw new Error("Format backup tidak valid");
        }

        if (
          !window.confirm(
            "Restore akan mengganti data aplikasi saat ini dengan data dari file backup. Lanjutkan?"
          )
        ) {
          event.target.value = "";
          return;
        }

        setMaterials(data.materials || []);
        setPurchases(data.purchases || []);
        setSales(data.sales || []);
        setAdvances(data.advances || []);
        setDebts(data.debts || []);
        setOperations(data.operations || []);
        setCashMovements(data.cashMovements || []);

        setBackupNotice("Restore berhasil. Data sudah dimuat.");
        setTimeout(() => setBackupNotice(""), 3000);
      } catch {
        alert("File backup tidak valid atau rusak.");
      }

      event.target.value = "";
    };

    reader.readAsText(file);
  }

  function saveCashMovement() {
    if (!requireAdmin("mencatat transaksi kas")) return;
    const amount = Number(cashAmount);

    if (amount <= 0) {
      alert("Nominal harus lebih dari 0.");
      return;
    }

    setCashMovements((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: new Date().toLocaleDateString("id-ID"),
        type: cashType,
        amount,
        note: cashNote.trim(),
      },
    ]);

    setCashAmount("");
    setCashNote("");
  }

  function deleteCashMovement(id) {
    if (!requireAdmin("menghapus transaksi kas")) return;
    if (!window.confirm("Hapus transaksi kas ini?")) return;
    setCashMovements((prev) => prev.filter((item) => item.id !== id));
  }

  function printReceipt(type, item) {
    if (!item) {
      alert("Belum ada transaksi yang dipilih untuk dicetak.");
      return;
    }

    const isPurchase = type === "purchase";
    const title = isPurchase ? "NOTA PEMBELIAN" : "NOTA PENJUALAN";
    const partyLabel = isPurchase ? "Supplier" : "Pembeli";
    const partyName = isPurchase ? item.supplier : item.buyer;

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            @page { size: 80mm auto; margin: 4mm; }
            body {
              width: 72mm;
              margin: 0 auto;
              font-family: Arial, sans-serif;
              color: #000;
              font-size: 12px;
            }
            .center { text-align: center; }
            .company { font-size: 16px; font-weight: 800; margin-top: 4px; }
            .title { font-size: 13px; font-weight: 800; margin-top: 4px; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; gap: 8px; margin: 5px 0; }
            .row span:first-child { min-width: 28mm; }
            .total { font-size: 15px; font-weight: 800; }
            .footer { margin-top: 12px; text-align: center; font-size: 10px; line-height: 1.4; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="company">PT WIDI KURNIA SEJAHTERA</div>
            <div class="title">${title}</div>
          </div>
          <div class="line"></div>
          <div class="row"><span>Tanggal</span><strong>${item.date}</strong></div>
          <div class="row"><span>${partyLabel}</span><strong>${partyName || "-"}</strong></div>
          <div class="row"><span>Petugas</span><strong>${item.operator || "-"}</strong></div>
          <div class="line"></div>
          <div class="row"><span>Material</span><strong>${item.material}</strong></div>
          <div class="row"><span>Berat</span><strong>${Number(item.weight || 0).toLocaleString("id-ID")} KG</strong></div>
          <div class="row"><span>Harga / KG</span><strong>${rupiah(item.price)}</strong></div>
          <div class="line"></div>
          <div class="row total"><span>TOTAL</span><strong>${rupiah(item.total)}</strong></div>
          <div class="line"></div>
          <div class="footer">
            Terima kasih.<br/>
            PT Widi Kurnia Sejahtera
          </div>
          <script>window.onload=()=>window.print();<\/script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup diblokir browser. Izinkan popup untuk mencetak nota.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  function printReport() {
    if (!requireAdmin("mencetak laporan")) return;
    const periodLabel =
      reportStartDate || reportEndDate
        ? `${reportStartDate || "Awal"} s/d ${reportEndDate || "Sekarang"}`
        : "Semua Data";

    const rows = [
      ["Total Penjualan", rupiah(reportSalesTotal)],
      ["Total Pembelian", rupiah(reportPurchaseTotal)],
      ["Total Panjar", rupiah(reportAdvanceTotal)],
      ["Total Kasbon", rupiah(reportDebtTotal)],
      ["Total Operasional", rupiah(reportOperationTotal)],
      ["Modal Barang Terjual", rupiah(reportEstimatedCOGS)],
      ["Kas / Modal Masuk Lain", rupiah(reportCashInOther)],
      ["Pengeluaran Lainnya", rupiah(reportCashOutOther)],
      ["Total Uang Keluar", rupiah(reportCashOut)],
      ["Laba Kotor", rupiah(reportGrossProfit)],
      ["Laba Bersih", rupiah(reportNetProfit)],
      ["Saldo Periode", rupiah(reportBalance)],
      ["Total Stok Saat Ini", `${totalStock.toLocaleString("id-ID")} KG`],
    ];

    const detailRows = [
      ...reportPurchases.map((i) => ({
        date: i.date,
        type: "Pembelian",
        name: `${i.supplier} / Petugas: ${i.operator || "-"}`,
        material: i.material,
        weight: `${Number(i.weight || 0).toLocaleString("id-ID")} KG`,
        amount: -Number(i.total || 0),
      })),
      ...reportSales.map((i) => ({
        date: i.date,
        type: "Penjualan",
        name: `${i.buyer} / Petugas: ${i.operator || "-"}`,
        material: i.material,
        weight: `${Number(i.weight || 0).toLocaleString("id-ID")} KG`,
        amount: Number(i.total || 0),
      })),
      ...reportAdvances.map((i) => ({
        date: i.date,
        type: "Panjar",
        name: i.name,
        material: i.note || "-",
        weight: "-",
        amount: -Number(i.amount || 0),
      })),
      ...reportDebts.map((i) => ({
        date: i.date,
        type: "Kasbon",
        name: i.name,
        material: i.note || "-",
        weight: "-",
        amount: -Number(i.amount || 0),
      })),
      ...reportOperations.map((i) => ({
        date: i.date,
        type: "Operasional",
        name: i.category,
        material: i.note || "-",
        weight: "-",
        amount: -Number(i.amount || 0),
      })),
      ...reportCashMovements.map((i) => ({
        date: i.date,
        type: i.type === "masuk" ? "Kas Masuk" : "Pengeluaran Lain",
        name: "Kas",
        material: i.note || "-",
        weight: "-",
        amount: i.type === "masuk" ? Number(i.amount || 0) : -Number(i.amount || 0),
      })),
    ];

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Laporan WKS</title>
          <style>
            body{font-family:Arial,sans-serif;padding:28px;color:#111}
            h1{margin:0 0 4px;font-size:24px}
            h2{margin-top:28px;font-size:18px}
            .sub{color:#555;margin-bottom:20px}
            table{width:100%;border-collapse:collapse;margin-top:10px;font-size:12px}
            th,td{border:1px solid #ddd;padding:8px;text-align:left}
            th{background:#f3f4f6}
            .summary td:first-child{font-weight:700}
            .amount{text-align:right}
            @media print{button{display:none}}
          </style>
        </head>
        <body>
          <h1>PT WIDI KURNIA SEJAHTERA</h1>
          <div class="sub">Laporan Keuangan & Transaksi — ${periodLabel}</div>

          <h2>Ringkasan</h2>
          <table class="summary">
            <tbody>
              ${rows.map(([a,b]) => `<tr><td>${a}</td><td class="amount">${b}</td></tr>`).join("")}
            </tbody>
          </table>

          <h2>Detail Transaksi</h2>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Nama</th>
                <th>Material / Keterangan</th>
                <th>Berat</th>
                <th>Nominal</th>
              </tr>
            </thead>
            <tbody>
              ${detailRows.map((r) => `
                <tr>
                  <td>${r.date}</td>
                  <td>${r.type}</td>
                  <td>${r.name || "-"}</td>
                  <td>${r.material || "-"}</td>
                  <td>${r.weight}</td>
                  <td class="amount">${rupiah(r.amount)}</td>
                </tr>`).join("") || `<tr><td colspan="6">Tidak ada transaksi pada periode ini.</td></tr>`}
            </tbody>
          </table>
          <script>window.onload=()=>window.print();<\/script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup diblokir browser. Izinkan popup untuk mencetak laporan.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  if (!currentRole) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "430px",
            background: "#fff",
            borderRadius: "18px",
            padding: "30px",
            boxShadow: "0 12px 35px rgba(15,23,42,.12)",
          }}
        >
          <div style={{textAlign:"center",marginBottom:"24px"}}>
            <div
              style={{
                width:"58px",
                height:"58px",
                borderRadius:"14px",
                background:"#2563eb",
                color:"#fff",
                display:"grid",
                placeItems:"center",
                fontSize:"28px",
                fontWeight:800,
                margin:"0 auto 12px",
              }}
            >
              W
            </div>
            <h2 style={{margin:"0 0 5px"}}>WIDI KURNIA SEJAHTERA</h2>
            <p style={{margin:0,opacity:.65}}>Pilih akses aplikasi</p>
          </div>

          <div className="form-group" style={{marginBottom:"12px"}}>
            <label>Nama Pengguna</label>
            <select
              value={selectedLoginName}
              onChange={(e)=>setSelectedLoginName(e.target.value)}
            >
              <option value="">Pilih nama</option>
              <optgroup label="ADMIN">
                {admins.map((name)=>(
                  <option key={name} value={name}>{name}</option>
                ))}
              </optgroup>
              <optgroup label="KARYAWAN">
                {employees.map((name)=>(
                  <option key={name} value={name}>{name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {admins.includes(selectedLoginName) && (
            <div className="form-group" style={{marginBottom:"12px"}}>
              <label>PIN Admin</label>
              <input
                type="password"
                inputMode="numeric"
                placeholder="Masukkan PIN Admin"
                value={pinInput}
                onChange={(e)=>setPinInput(e.target.value)}
                onKeyDown={(e)=>{
                  if (e.key === "Enter") loginAdmin();
                }}
              />
            </div>
          )}

          {admins.includes(selectedLoginName) ? (
            <button
              type="button"
              className="primary-button"
              onClick={loginAdmin}
              style={{width:"100%",marginBottom:"10px"}}
            >
              Masuk sebagai Admin
            </button>
          ) : (
            <button
              type="button"
              onClick={loginEmployee}
              style={{
                width:"100%",
                padding:"12px",
                borderRadius:"10px",
                border:"1px solid #d9e2ef",
                background:"#fff",
                fontWeight:700,
                cursor:"pointer",
              }}
            >
              Masuk sebagai Karyawan
            </button>
          )}

          <div style={{marginTop:"14px",fontSize:"12px",opacity:.6,textAlign:"center"}}>
            Administrator menggunakan PIN. Karyawan hanya dapat membuka menu Pembelian.
          </div>
        </div>
      </div>
    );
  }

  const visibleMenu =
    currentRole === "employee"
      ? menu.filter((item) => item.id === "pembelian")
      : menu;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.setAttribute("name", "viewport");
      document.head.appendChild(viewport);
    }
    viewport.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover"
    );
  }, []);

  return (
    <div className="app">
      <style>{`
        .mobile-menu-button,
        .mobile-menu-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          html, body, #root {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            overflow-x: hidden !important;
          }

          body {
            margin: 0 !important;
          }

          .app {
            display: block !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
          }

          .sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: 260px !important;
            max-width: 84vw !important;
            height: 100dvh !important;
            z-index: 1200 !important;
            transform: translateX(-105%);
            transition: transform .22s ease;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            box-sizing: border-box !important;
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }

          .sidebar nav {
            overflow: visible !important;
          }

          .sidebar-bottom {
            margin-top: 18px !important;
            padding-bottom: 24px !important;
          }

          .mobile-menu-button {
            display: flex !important;
            position: fixed !important;
            top: calc(12px + env(safe-area-inset-top)) !important;
            left: 12px !important;
            z-index: 1300 !important;
            width: 42px !important;
            height: 42px !important;
            border: 0 !important;
            border-radius: 10px !important;
            align-items: center !important;
            justify-content: center !important;
            background: #111827 !important;
            color: #fff !important;
            font-size: 24px !important;
            line-height: 1 !important;
            box-shadow: 0 4px 14px rgba(0,0,0,.18) !important;
          }

          .mobile-menu-overlay {
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            z-index: 1100 !important;
            background: rgba(15, 23, 42, .42) !important;
          }

          .main {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            margin-left: 0 !important;
            overflow-x: hidden !important;
          }

          .topbar {
            width: 100% !important;
            box-sizing: border-box !important;
            padding: calc(12px + env(safe-area-inset-top)) 14px 12px 64px !important;
            min-height: 68px !important;
            gap: 8px !important;
            align-items: center !important;
          }

          .topbar > div:first-child .breadcrumb {
            display: none !important;
          }

          .topbar h1 {
            margin: 0 !important;
            font-size: 18px !important;
            line-height: 1.2 !important;
          }

          .topbar-right {
            gap: 6px !important;
            margin-left: auto !important;
            min-width: 0 !important;
          }

          .date-box {
            display: none !important;
          }

          .user-box {
            min-width: 0 !important;
            gap: 5px !important;
          }

          .user-box .avatar {
            display: none !important;
          }

          .user-box strong {
            font-size: 11px !important;
            max-width: 105px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }

          .user-box small {
            font-size: 9px !important;
          }

          .content,
          .menu-page {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            padding: 16px !important;
          }

          .page-header {
            margin-bottom: 14px !important;
          }

          .page-header .breadcrumb {
            font-size: 11px !important;
          }

          .page-header h2 {
            font-size: 22px !important;
            line-height: 1.2 !important;
          }

          .page-header p {
            font-size: 13px !important;
          }

          .cards {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
            width: 100% !important;
          }

          .card {
            min-width: 0 !important;
            width: auto !important;
            box-sizing: border-box !important;
            padding: 14px !important;
            border-radius: 14px !important;
          }

          .card-top {
            gap: 6px !important;
            align-items: flex-start !important;
          }

          .card-top > span:first-child {
            min-width: 0 !important;
            font-size: 11px !important;
            line-height: 1.25 !important;
          }

          .card-icon {
            flex: 0 0 auto !important;
            width: 34px !important;
            height: 34px !important;
            font-size: 11px !important;
          }

          .card h3 {
            margin-top: 12px !important;
            font-size: 17px !important;
            line-height: 1.25 !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .card p {
            font-size: 10px !important;
            line-height: 1.35 !important;
          }

          .page-card,
          .purchase-form,
          .purchase-history {
            width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }

          .menu-page [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }

          .menu-page .cards {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .purchase-form input,
          .purchase-form select,
          .purchase-form textarea,
          .form-group input,
          .form-group select,
          .form-group textarea {
            width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            font-size: 16px !important;
          }

          .purchase-total {
            gap: 8px !important;
            flex-wrap: wrap !important;
          }

          .primary-button,
          .secondary-button,
          .delete-button {
            max-width: 100% !important;
          }

          .table-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }

          .table-wrapper table {
            min-width: 700px !important;
          }

          .section-title {
            gap: 8px !important;
            align-items: flex-start !important;
          }

          .material-item {
            gap: 10px !important;
          }
        }

        @media (max-width: 360px) {
          .cards,
          .menu-page .cards {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setMobileMenuOpen((open) => !open)}
        aria-label="Buka menu"
      >
        {mobileMenuOpen ? "×" : "☰"}
      </button>

      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-logo">W</div>
          <div>
            <div className="brand-title">WIDI KURNIA</div>
            <div className="brand-subtitle">SEJAHTERA</div>
          </div>
        </div>

        <div className="menu-title">MENU UTAMA</div>

        <nav>
          {visibleMenu.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${
                activeMenu === item.id ? "active" : ""
              }`}
              onClick={() => {
                setActiveMenu(item.id);
                setMobileMenuOpen(false);
              }}
            >
              <span className="menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="company-status">
            <span className="status-dot"></span>
            Sistem aktif
          </div>
          <div style={{fontSize:"12px",marginTop:"8px",opacity:.8}}>
            {currentUserName} — {currentRole === "admin" ? "Administrator" : "Karyawan"}
          </div>
          <button
            type="button"
            onClick={logoutRole}
            style={{
              marginTop:"10px",
              width:"100%",
              padding:"8px 10px",
              borderRadius:"8px",
              border:"1px solid rgba(255,255,255,.28)",
              background:"rgba(255,255,255,.14)",
              color:"#fff",
              cursor:"pointer",
              fontWeight:700,
            }}
          >
            Keluar / Ganti Pengguna
          </button>

          {currentRole === "admin" && (
            <button
              type="button"
              onClick={() => loadRemoteSnapshot(true)}
              style={{
                marginTop:"10px",
                width:"100%",
                padding:"8px 10px",
                borderRadius:"8px",
                border:"1px solid rgba(255,255,255,.15)",
                background:"transparent",
                color:"#fff",
                cursor:"pointer",
              }}
            >
              Sinkronkan Sekarang
            </button>
          )}
          <div className="version" style={{marginTop:"8px"}}>WKS Management System v2.6</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              Beranda /{" "}
              {activeMenu === "dashboard"
                ? "Dashboard"
                : menu.find((m) => m.id === activeMenu)?.label}
            </div>
            <h1>
              {activeMenu === "dashboard"
                ? "Dashboard"
                : menu.find((m) => m.id === activeMenu)?.label}
            </h1>
          </div>

          <div className="topbar-right">
            <div className="date-box">
              <span>📅</span>
              <span>{new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</span>
            </div>

            <div className="user-box">
              <div className="avatar">A</div>
              <div>
                <strong>{currentUserName || (currentRole === "admin" ? "Administrator" : "Karyawan")}</strong>
                <small>{currentRole === "admin" ? "Admin" : "Karyawan Pembelian"}</small>
                <small
                  style={{
                    marginTop: "3px",
                    color: syncStatus.startsWith("Online") ? "#15803d" : "#b45309",
                    fontWeight: 700,
                  }}
                >
                  {syncStatus}
                </small>
              </div>
            </div>
          </div>
        </header>

        {activeMenu === "dashboard" && (
          <section className="content">
            <div className="page-header">
              <div>
                <div className="breadcrumb">Beranda / Dashboard</div>
                <h2>Dashboard</h2>
                <p>Ringkasan utama PT Widi Kurnia Sejahtera.</p>
              </div>
            </div>

            <div className="cards" style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:"18px",marginBottom:"22px"}}>
              <div className="card blue"><div className="card-top"><span>Saldo Kas</span><span className="card-icon">Rp</span></div><h3>{rupiah(cashBalance)}</h3><p>Kas masuk dikurangi seluruh uang keluar</p></div>
              <div className="card green"><div className="card-top"><span>Total Penjualan</span><span className="card-icon">↑</span></div><h3>{rupiah(totalSales)}</h3><p>{sales.length} transaksi penjualan</p></div>
              <div className="card orange"><div className="card-top"><span>Total Pembelian</span><span className="card-icon">↓</span></div><h3>{rupiah(totalPurchases)}</h3><p>{purchases.length} transaksi pembelian</p></div>
              <div className="card green"><div className="card-top"><span>Laba Bersih</span><span className="card-icon">Rp</span></div><h3>{rupiah(netProfit)}</h3><p>Setelah modal barang dan biaya usaha</p></div>

              <div className="card blue"><div className="card-top"><span>Modal Barang Terjual</span><span className="card-icon">Rp</span></div><h3>{rupiah(costOfGoodsSold)}</h3><p>Modal barang yang sudah terjual</p></div>
              <div className="card purple"><div className="card-top"><span>Total Stok</span><span className="card-icon">KG</span></div><h3>{totalStock.toLocaleString("id-ID")} KG</h3><p>{activeStockCount} jenis material aktif</p></div>
              <div className="card blue"><div className="card-top"><span>Uang Panjar</span><span className="card-icon">P</span></div><h3>{rupiah(advances.reduce((t,i)=>t+Number(i.amount||0),0))}</h3><p>Total panjar tercatat</p></div>
              <div className="card orange"><div className="card-top"><span>Uang Kasbon</span><span className="card-icon">K</span></div><h3>{rupiah(debts.reduce((t,i)=>t+Number(i.amount||0),0))}</h3><p>Total kasbon tercatat</p></div>

              <div className="card orange"><div className="card-top"><span>Operasional</span><span className="card-icon">O</span></div><h3>{rupiah(totalOperations)}</h3><p>Total biaya operasional</p></div>
              <div className="card green"><div className="card-top"><span>Modal / Kas Masuk</span><span className="card-icon">+</span></div><h3>{rupiah(totalCashInOther)}</h3><p>Kas masuk selain penjualan</p></div>
              <div className="card orange"><div className="card-top"><span>Pengeluaran Lainnya</span><span className="card-icon">-</span></div><h3>{rupiah(totalCashOutOther)}</h3><p>Pengeluaran di luar operasional</p></div>
              <div className="card blue"><div className="card-top"><span>Total Uang Keluar</span><span className="card-icon">↓</span></div><h3>{rupiah(totalCashOut)}</h3><p>Seluruh uang keluar tercatat</p></div>
            </div>

            <div className="page-card">
              <div className="section-title"><h3>Stok Material Saat Ini</h3><span>{activeStockCount} jenis aktif</span></div>
              <div className="material-list">
                {materials.filter((item)=>Number(item.weight||0)>0).map((item)=>(
                  <div className="material-item" key={item.name}>
                    <strong>{item.name}</strong>
                    <span>{Number(item.weight||0).toLocaleString("id-ID")} KG</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeMenu !== "dashboard" && (
          <section className="content menu-page">
            {activeMenu === "pembelian" ? (
              <>
                <div className="page-header">
                  <div>
                    <div className="breadcrumb">Beranda / Pembelian</div>
                    <h2>Pembelian Barang</h2>
                    <p>Catat pembelian material dari supplier.</p>
                  </div>
                </div>

                {currentRole === "employee" && (
                  <div
                    style={{
                      marginBottom:"16px",
                      padding:"12px 14px",
                      borderRadius:"10px",
                      background:"#eff6ff",
                      border:"1px solid #bfdbfe",
                      fontWeight:700,
                    }}
                  >
                    Akses Karyawan: hanya input Pembelian dan cetak nota. Edit/Hapus transaksi serta menu keuangan hanya untuk Administrator.
                  </div>
                )}

                <form
                  className="purchase-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    savePurchase();
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.3fr 1.3fr 0.8fr 0.9fr",
                      gap: "14px",
                      alignItems: "end",
                    }}
                  >
                  <div className="form-group">
                    <label>Supplier</label>
                    <input
                      type="text"
                      placeholder="Nama supplier"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Jenis Material</label>
                    <select
                      ref={materialSelectRef}
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                    >
                      <option value="">Pilih material</option>
                      {materials.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                    <div className="form-group">
                      <label>Berat (KG)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Harga / KG</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  {saveNotice && (
                    <div
                      style={{
                        marginBottom: "12px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "#ecfdf3",
                        fontWeight: 700,
                      }}
                    >
                      ✓ {saveNotice}
                    </div>
                  )}

                  <div className="purchase-total">
                    <span>Total Pembelian</span>
                    <strong>
                      {rupiah(
                        (Number(weight) || 0) * (Number(price) || 0)
                      )}
                    </strong>
                  </div>

                  <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                    <button
                      type="submit"
                      className="primary-button"
                    >
                      Simpan Pembelian — Enter
                    </button>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => printReceipt("purchase", lastPurchase)}
                      disabled={!lastPurchase}
                    >
                      Cetak Nota Terakhir
                    </button>
                  </div>

                  <div style={{ marginTop: "8px", fontSize: "13px", opacity: 0.65 }}>
                    Supplier tetap tersimpan setelah transaksi agar input berikutnya lebih cepat.
                  </div>
                </form>

                <div className="purchase-history">
                  <div className="section-title">
                    <h3>Riwayat Pembelian</h3>
                    <span>{purchases.length} transaksi</span>
                  </div>

                  {purchases.length === 0 ? (
                    <div className="empty-history">
                      Belum ada transaksi pembelian.
                    </div>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Tanggal</th>
                            <th>Supplier</th>
                            <th>Petugas</th>
                            <th>Material</th>
                            <th>Berat</th>
                            <th>Harga/KG</th>
                            <th>Total</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>

                        <tbody>
                          {purchases
                            .slice()
                            .reverse()
                            .map((item) => (
                              <tr key={item.id}>
                                <td>{item.date}</td>
                                <td>{item.supplier}</td>
                                <td>{item.operator || "-"}</td>
                                <td>{item.material}</td>
                                <td>
                                  {Number(item.weight).toLocaleString("id-ID")} KG
                                </td>
                                <td>{rupiah(item.price)}</td>
                                <td>{rupiah(item.total)}</td>
                                <td>
                                  <button type="button" onClick={() => printReceipt("purchase", item)}>Cetak</button>
                                  {currentRole === "admin" && (
                                    <>
                                      {" "}
                                      <button type="button" onClick={() => editPurchase(item.id)}>Edit</button>{" "}
                                      <button type="button" className="delete-button" onClick={() => deletePurchase(item.id)}>Hapus</button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : activeMenu === "penjualan" ? (
              <>
                <div className="page-header">
                  <div>
                    <div className="breadcrumb">Beranda / Penjualan</div>
                    <h2>Penjualan Barang</h2>
                    <p>Catat barang keluar. Stok otomatis berkurang saat transaksi disimpan.</p>
                  </div>
                </div>

                <form
                  className="purchase-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveSale();
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.3fr 1.3fr 0.8fr 0.9fr",
                      gap: "14px",
                      alignItems: "end",
                    }}
                  >
                    <div className="form-group">
                      <label>Pembeli</label>
                      <input
                        type="text"
                        placeholder="Nama pembeli"
                        value={buyer}
                        onChange={(e) => setBuyer(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Jenis Material</label>
                      <select
                        ref={saleMaterialSelectRef}
                        value={saleMaterial}
                        onChange={(e) => setSaleMaterial(e.target.value)}
                      >
                        <option value="">Pilih material</option>
                        {materials
                          .filter((item) => Number(item.weight || 0) > 0)
                          .map((item) => (
                            <option key={item.name} value={item.name}>
                              {item.name} — {Number(item.weight || 0).toLocaleString("id-ID")} KG
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Berat (KG)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={saleWeight}
                        onChange={(e) => setSaleWeight(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Harga Jual / KG</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                      />
                    </div>
                  </div>

                  {saleMaterial && (
                    <div style={{ marginTop: "10px", fontSize: "13px", fontWeight: 700 }}>
                      Stok tersedia:{" "}
                      {Number(
                        materials.find((item) => item.name === saleMaterial)?.weight || 0
                      ).toLocaleString("id-ID")}{" "}
                      KG
                    </div>
                  )}

                  {saleNotice && (
                    <div
                      style={{
                        marginBottom: "12px",
                        marginTop: "12px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "#ecfdf3",
                        fontWeight: 700,
                      }}
                    >
                      ✓ {saleNotice}
                    </div>
                  )}

                  <div className="purchase-total">
                    <span>Total Penjualan</span>
                    <strong>
                      {rupiah(
                        (Number(saleWeight) || 0) * (Number(salePrice) || 0)
                      )}
                    </strong>
                  </div>

                  <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                    <button type="submit" className="primary-button">
                      Simpan Penjualan — Enter
                    </button>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => printReceipt("sale", lastSale)}
                      disabled={!lastSale}
                    >
                      Cetak Nota Terakhir
                    </button>
                  </div>

                  <div style={{ marginTop: "8px", fontSize: "13px", opacity: 0.65 }}>
                    Pembeli tetap tersimpan setelah transaksi agar input berikutnya lebih cepat.
                  </div>
                </form>

                <div className="purchase-history">
                  <div className="section-title">
                    <h3>Riwayat Penjualan</h3>
                    <span>{sales.length} transaksi</span>
                  </div>

                  {sales.length === 0 ? (
                    <div className="empty-history">
                      Belum ada transaksi penjualan.
                    </div>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Tanggal</th>
                            <th>Pembeli</th>
                            <th>Petugas</th>
                            <th>Material</th>
                            <th>Berat</th>
                            <th>Harga/KG</th>
                            <th>Total</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>

                        <tbody>
                          {sales
                            .slice()
                            .reverse()
                            .map((item) => (
                              <tr key={item.id}>
                                <td>{item.date}</td>
                                <td>{item.buyer}</td>
                                <td>{item.operator || "-"}</td>
                                <td>{item.material}</td>
                                <td>
                                  {Number(item.weight).toLocaleString("id-ID")} KG
                                </td>
                                <td>{rupiah(item.price)}</td>
                                <td>{rupiah(item.total)}</td>
                                <td>
                                  <button type="button" onClick={() => printReceipt("sale", item)}>Cetak</button>{" "}
                                  <button type="button" onClick={() => editSale(item.id)}>Edit</button>{" "}
                                  <button type="button" className="delete-button" onClick={() => deleteSale(item.id)}>Hapus</button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : activeMenu === "stok" ? (
              <>
                <div className="page-header">
                  <div>
                    <div className="breadcrumb">Beranda / Stok Barang</div>
                    <h2>Stok Barang</h2>
                    <p>Jumlah stok material. Hanya tonase/berat yang ditampilkan.</p>
                  </div>
                </div>

                <div className="page-card">
                  <div className="section-title">
                    <h3>Daftar Stok</h3>
                    <span>{materials.length} material</span>
                  </div>

                  <div className="material-list">
                    {materials.map((item, index) => (
                      <div className="material-item" key={item.name}>
                        <strong>
                          {index + 1}. {item.name}
                        </strong>

                        <span>
                          {Number(item.weight || 0).toLocaleString("id-ID")} KG
                        </span>

                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : activeMenu === "panjar" ? (
              <>
                <div className="page-header">
                  <div>
                    <div className="breadcrumb">Beranda / Panjar</div>
                    <h2>Panjar</h2>
                    <p>Catat dan pantau panjar yang masih berjalan.</p>
                  </div>
                </div>
                <form className="purchase-form" onSubmit={(e) => { e.preventDefault(); saveAdvance(); }}>
                  <div style={{display:"grid",gridTemplateColumns:"1.2fr 0.9fr 1.5fr",gap:"14px",alignItems:"end"}}>
                    <div className="form-group"><label>Nama</label><input value={advanceName} onChange={(e)=>setAdvanceName(e.target.value)} placeholder="Nama penerima / supplier" /></div>
                    <div className="form-group"><label>Nominal</label><input type="number" value={advanceAmount} onChange={(e)=>setAdvanceAmount(e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>Keterangan</label><input value={advanceNote} onChange={(e)=>setAdvanceNote(e.target.value)} placeholder="Keterangan panjar" /></div>
                  </div>
                  <div className="purchase-total"><span>Total Panjar Berjalan</span><strong>{rupiah(totalAdvances)}</strong></div>
                  <button className="primary-button" type="submit">Simpan Panjar — Enter</button>
                </form>
                <div className="purchase-history">
                  <div className="section-title"><h3>Riwayat Panjar</h3><span>{advances.length} catatan</span></div>
                  {advances.length === 0 ? <div className="empty-history">Belum ada panjar.</div> :
                  <div className="table-wrapper"><table><thead><tr><th>Tanggal</th><th>Nama</th><th>Nominal</th><th>Sisa</th><th>Keterangan</th><th>Status</th><th>Aksi</th></tr></thead>
                  <tbody>{advances.slice().reverse().map((item)=><tr key={item.id}><td>{item.date}</td><td>{item.name}</td><td>{rupiah(item.amount)}</td><td>{rupiah(item.remaining ?? item.amount)}</td><td>{item.note || "-"}</td><td>{item.status}</td><td>
                        <button type="button" onClick={()=>editAdvance(item.id)}>Edit</button>{" "}
                        {item.status !== "Lunas" && <button type="button" onClick={()=>settleAdvance(item.id)}>Lunas</button>}{" "}
                        <button type="button" className="delete-button" onClick={()=>deleteAdvance(item.id)}>Hapus</button>
                      </td></tr>)}</tbody></table></div>}
                </div>
              </>
            ) : activeMenu === "kasbon" ? (
              <>
                <div className="page-header"><div><div className="breadcrumb">Beranda / Kasbon</div><h2>Kasbon</h2><p>Catat kasbon dan status pelunasannya.</p></div></div>
                <form className="purchase-form" onSubmit={(e)=>{e.preventDefault();saveDebt();}}>
                  <div style={{display:"grid",gridTemplateColumns:"1.2fr 0.9fr 1.5fr",gap:"14px",alignItems:"end"}}>
                    <div className="form-group"><label>Nama</label><input value={debtName} onChange={(e)=>setDebtName(e.target.value)} placeholder="Nama karyawan / penerima" /></div>
                    <div className="form-group"><label>Nominal</label><input type="number" value={debtAmount} onChange={(e)=>setDebtAmount(e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>Keterangan</label><input value={debtNote} onChange={(e)=>setDebtNote(e.target.value)} placeholder="Keterangan kasbon" /></div>
                  </div>
                  <div className="purchase-total"><span>Total Kasbon Belum Lunas</span><strong>{rupiah(totalDebts)}</strong></div>
                  <button className="primary-button" type="submit">Simpan Kasbon — Enter</button>
                </form>
                <div className="purchase-history">
                  <div className="section-title"><h3>Riwayat Kasbon</h3><span>{debts.length} catatan</span></div>
                  {debts.length === 0 ? <div className="empty-history">Belum ada kasbon.</div> :
                  <div className="table-wrapper"><table><thead><tr><th>Tanggal</th><th>Nama</th><th>Nominal</th><th>Sisa</th><th>Keterangan</th><th>Status</th><th>Aksi</th></tr></thead>
                  <tbody>{debts.slice().reverse().map((item)=><tr key={item.id}><td>{item.date}</td><td>{item.name}</td><td>{rupiah(item.amount)}</td><td>{rupiah(item.remaining ?? item.amount)}</td><td>{item.note || "-"}</td><td>{item.status}</td><td>
                        <button type="button" onClick={()=>editDebt(item.id)}>Edit</button>{" "}
                        {item.status !== "Lunas" && <button type="button" onClick={()=>settleDebt(item.id)}>Lunas</button>}{" "}
                        <button type="button" className="delete-button" onClick={()=>deleteDebt(item.id)}>Hapus</button>
                      </td></tr>)}</tbody></table></div>}
                </div>
              </>
            ) : activeMenu === "operasional" ? (
              <>
                <div className="page-header"><div><div className="breadcrumb">Beranda / Operasional</div><h2>Operasional</h2><p>Catat seluruh biaya operasional perusahaan.</p></div></div>
                <form className="purchase-form" onSubmit={(e)=>{e.preventDefault();saveOperation();}}>
                  <div style={{display:"grid",gridTemplateColumns:"1.2fr 0.9fr 1.5fr",gap:"14px",alignItems:"end"}}>
                    <div className="form-group"><label>Kategori</label><input value={operationCategory} onChange={(e)=>setOperationCategory(e.target.value)} placeholder="Solar, makan, transport, dll." /></div>
                    <div className="form-group"><label>Nominal</label><input type="number" value={operationAmount} onChange={(e)=>setOperationAmount(e.target.value)} placeholder="0" /></div>
                    <div className="form-group"><label>Keterangan</label><input value={operationNote} onChange={(e)=>setOperationNote(e.target.value)} placeholder="Keterangan" /></div>
                  </div>
                  <div className="purchase-total"><span>Total Operasional</span><strong>{rupiah(totalOperations)}</strong></div>
                  <button className="primary-button" type="submit">Simpan Operasional — Enter</button>
                </form>
                <div className="purchase-history">
                  <div className="section-title"><h3>Riwayat Operasional</h3><span>{operations.length} transaksi</span></div>
                  {operations.length === 0 ? <div className="empty-history">Belum ada biaya operasional.</div> :
                  <div className="table-wrapper"><table><thead><tr><th>Tanggal</th><th>Kategori</th><th>Keterangan</th><th>Nominal</th><th>Aksi</th></tr></thead>
                  <tbody>{operations.slice().reverse().map((item)=><tr key={item.id}><td>{item.date}</td><td>{item.category}</td><td>{item.note || "-"}</td><td>{rupiah(item.amount)}</td><td>
                    <button type="button" onClick={()=>editOperation(item.id)}>Edit</button>{" "}
                    <button type="button" className="delete-button" onClick={()=>deleteOperation(item.id)}>Hapus</button>
                  </td></tr>)}</tbody></table></div>}
                </div>
              </>
            ) : activeMenu === "keuangan" ? (
              <>
                <div className="page-header"><div><div className="breadcrumb">Beranda / Keuangan</div><h2>Keuangan</h2><p>Ringkasan otomatis dari seluruh transaksi.</p></div></div>
                <div
                  className="cards"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: "18px",
                  }}
                >
                  <div className="card green">
                    <div className="card-top"><span>Uang Masuk / Penjualan</span><span className="card-icon">↑</span></div>
                    <h3>{rupiah(totalSales)}</h3>
                    <p>Total uang masuk dari penjualan</p>
                  </div>

                  <div className="card orange">
                    <div className="card-top"><span>Uang Pembelian</span><span className="card-icon">↓</span></div>
                    <h3>{rupiah(totalPurchases)}</h3>
                    <p>Total pembelian material</p>
                  </div>

                  <div className="card blue">
                    <div className="card-top"><span>Uang Panjar</span><span className="card-icon">P</span></div>
                    <h3>{rupiah(advances.reduce((t, i) => t + Number(i.amount || 0), 0))}</h3>
                    <p>Panjar yang pernah dikeluarkan</p>
                  </div>

                  <div className="card orange">
                    <div className="card-top"><span>Uang Kasbon</span><span className="card-icon">K</span></div>
                    <h3>{rupiah(debts.reduce((t, i) => t + Number(i.amount || 0), 0))}</h3>
                    <p>Total kasbon yang dikeluarkan</p>
                  </div>

                  <div className="card orange">
                    <div className="card-top"><span>Uang Operasional</span><span className="card-icon">O</span></div>
                    <h3>{rupiah(totalOperations)}</h3>
                    <p>Solar, makan, transport dan lainnya</p>
                  </div>

                  <div className="card green">
                    <div className="card-top"><span>Modal / Kas Masuk Lain</span><span className="card-icon">+</span></div>
                    <h3>{rupiah(totalCashInOther)}</h3>
                    <p>Modal awal dan kas masuk selain penjualan</p>
                  </div>

                  <div className="card orange">
                    <div className="card-top"><span>Pengeluaran Lainnya</span><span className="card-icon">-</span></div>
                    <h3>{rupiah(totalCashOutOther)}</h3>
                    <p>Pengeluaran di luar pembelian dan operasional</p>
                  </div>

                  <div className="card blue">
                    <div className="card-top"><span>Total Uang Keluar</span><span className="card-icon">↓</span></div>
                    <h3>{rupiah(totalCashOut)}</h3>
                    <p>Semua pengeluaran tercatat</p>
                  </div>

                  <div className="card blue">
                    <div className="card-top"><span>Modal Barang Terjual</span><span className="card-icon">Rp</span></div>
                    <h3>{rupiah(costOfGoodsSold)}</h3>
                    <p>Modal dihitung hanya dari barang yang benar-benar terjual</p>
                  </div>

                  <div className="card green">
                    <div className="card-top"><span>Laba Kotor</span><span className="card-icon">Rp</span></div>
                    <h3>{rupiah(grossProfit)}</h3>
                    <p>Penjualan dikurangi modal barang yang benar-benar terjual</p>
                  </div>

                  <div className="card green">
                    <div className="card-top"><span>Laba Bersih</span><span className="card-icon">Rp</span></div>
                    <h3>{rupiah(netProfit)}</h3>
                    <p>Laba kotor dikurangi operasional dan pengeluaran lainnya</p>
                  </div>

                  <div className="card blue">
                    <div className="card-top"><span>Saldo Kas</span><span className="card-icon">Rp</span></div>
                    <h3>{rupiah(cashBalance)}</h3>
                    <p>Uang masuk dikurangi seluruh uang keluar</p>
                  </div>

                  <div className="card purple">
                    <div className="card-top"><span>Total Stok</span><span className="card-icon">KG</span></div>
                    <h3>{totalStock.toLocaleString("id-ID")} KG</h3>
                    <p>{activeStockCount} jenis material aktif</p>
                  </div>
                </div>

                <div className="page-card" style={{marginTop:"20px"}}>
                  <div className="section-title">
                    <h3>Kas / Modal & Transaksi Lainnya</h3>
                    <span>{cashMovements.length} transaksi</span>
                  </div>

                  <form
                    className="purchase-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveCashMovement();
                    }}
                  >
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.6fr",gap:"14px",alignItems:"end"}}>
                      <div className="form-group">
                        <label>Jenis</label>
                        <select value={cashType} onChange={(e)=>setCashType(e.target.value)}>
                          <option value="masuk">Modal / Kas Masuk</option>
                          <option value="keluar">Pengeluaran Lainnya</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Nominal</label>
                        <input type="number" value={cashAmount} onChange={(e)=>setCashAmount(e.target.value)} placeholder="0" />
                      </div>

                      <div className="form-group">
                        <label>Keterangan</label>
                        <input value={cashNote} onChange={(e)=>setCashNote(e.target.value)} placeholder="Contoh: Modal awal kas" />
                      </div>
                    </div>

                    <button type="submit" className="primary-button">
                      Simpan Transaksi Kas — Enter
                    </button>
                  </form>

                  {cashMovements.length > 0 && (
                    <div className="table-wrapper" style={{marginTop:"18px"}}>
                      <table>
                        <thead>
                          <tr>
                            <th>Tanggal</th>
                            <th>Jenis</th>
                            <th>Keterangan</th>
                            <th>Nominal</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cashMovements.slice().reverse().map((item)=>(
                            <tr key={item.id}>
                              <td>{item.date}</td>
                              <td>{item.type === "masuk" ? "Kas Masuk" : "Pengeluaran Lainnya"}</td>
                              <td>{item.note || "-"}</td>
                              <td>{rupiah(item.amount)}</td>
                              <td>
                                <button type="button" className="delete-button" onClick={()=>deleteCashMovement(item.id)}>
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : activeMenu === "laporan" ? (
              <>
                <div className="page-header">
                  <div>
                    <div className="breadcrumb">Beranda / Laporan</div>
                    <h2>Laporan</h2>
                    <p>Filter laporan berdasarkan tanggal, lihat laba, export Excel, dan simpan PDF.</p>
                  </div>
                </div>

                <div className="page-card" style={{marginBottom:"18px"}}>
                  <div className="section-title">
                    <h3>Periode Laporan</h3>
                    <span>Pilih tanggal atau kosongkan untuk semua data</span>
                  </div>

                  <div style={{
                    display:"grid",
                    gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
                    gap:"12px",
                    alignItems:"end",
                    marginBottom:"18px"
                  }}>
                    <div className="form-group">
                      <label>Dari Tanggal</label>
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e)=>setReportStartDate(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Sampai Tanggal</label>
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e)=>setReportEndDate(e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={()=>{
                        setReportStartDate("");
                        setReportEndDate("");
                      }}
                    >
                      Semua Data
                    </button>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={exportReportExcel}
                    >
                      Export Excel
                    </button>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={printReport}
                    >
                      Cetak / Simpan PDF
                    </button>
                  </div>

                  <div
                    className="cards"
                    style={{
                      display:"grid",
                      gridTemplateColumns:"repeat(4,minmax(0,1fr))",
                      gap:"14px",
                      marginBottom:"18px"
                    }}
                  >
                    <div className="card green">
                      <div className="card-top"><span>Penjualan</span><span className="card-icon">↑</span></div>
                      <h3>{rupiah(reportSalesTotal)}</h3>
                      <p>{reportSales.length} transaksi</p>
                    </div>

                    <div className="card orange">
                      <div className="card-top"><span>Pembelian</span><span className="card-icon">↓</span></div>
                      <h3>{rupiah(reportPurchaseTotal)}</h3>
                      <p>{reportPurchases.length} transaksi</p>
                    </div>

                    <div className="card blue">
                      <div className="card-top"><span>Panjar</span><span className="card-icon">P</span></div>
                      <h3>{rupiah(reportAdvanceTotal)}</h3>
                      <p>{reportAdvances.length} catatan</p>
                    </div>

                    <div className="card orange">
                      <div className="card-top"><span>Kasbon</span><span className="card-icon">K</span></div>
                      <h3>{rupiah(reportDebtTotal)}</h3>
                      <p>{reportDebts.length} catatan</p>
                    </div>

                    <div className="card green">
                      <div className="card-top"><span>Kas Masuk Lain</span><span className="card-icon">+</span></div>
                      <h3>{rupiah(reportCashInOther)}</h3>
                      <p>Modal / kas masuk lainnya</p>
                    </div>

                    <div className="card orange">
                      <div className="card-top"><span>Pengeluaran Lain</span><span className="card-icon">-</span></div>
                      <h3>{rupiah(reportCashOutOther)}</h3>
                      <p>Pengeluaran lainnya</p>
                    </div>

                    <div className="card orange">
                      <div className="card-top"><span>Operasional</span><span className="card-icon">O</span></div>
                      <h3>{rupiah(reportOperationTotal)}</h3>
                      <p>{reportOperations.length} transaksi</p>
                    </div>

                    <div className="card blue">
                      <div className="card-top"><span>Modal Barang Terjual</span><span className="card-icon">Rp</span></div>
                      <h3>{rupiah(reportEstimatedCOGS)}</h3>
                      <p>Perkiraan modal barang yang terjual pada periode ini</p>
                    </div>

                    <div className="card green">
                      <div className="card-top"><span>Laba Kotor</span><span className="card-icon">Rp</span></div>
                      <h3>{rupiah(reportGrossProfit)}</h3>
                      <p>Penjualan dikurangi modal barang yang terjual</p>
                    </div>

                    <div className="card green">
                      <div className="card-top"><span>Laba Bersih</span><span className="card-icon">Rp</span></div>
                      <h3>{rupiah(reportNetProfit)}</h3>
                      <p>Laba kotor dikurangi operasional dan pengeluaran lainnya</p>
                    </div>

                    <div className="card blue">
                      <div className="card-top"><span>Saldo Periode</span><span className="card-icon">Rp</span></div>
                      <h3>{rupiah(reportBalance)}</h3>
                      <p>Masuk dikurangi seluruh pengeluaran</p>
                    </div>
                  </div>

                  <div className="section-title">
                    <h3>Rincian Transaksi Periode</h3>
                    <span>
                      {reportPurchases.length +
                        reportSales.length +
                        reportAdvances.length +
                        reportDebts.length +
                        reportOperations.length +
                        reportCashMovements.length} transaksi/catatan
                    </span>
                  </div>

                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Jenis</th>
                          <th>Nama</th>
                          <th>Material / Keterangan</th>
                          <th>Berat</th>
                          <th>Nominal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ...reportPurchases.map((i)=>({
                            id:`p-${i.id}`, date:i.date, type:"Pembelian",
                            name:`${i.supplier} / Petugas: ${i.operator || "-"}`, detail:i.material,
                            weight:`${Number(i.weight||0).toLocaleString("id-ID")} KG`,
                            amount:-Number(i.total||0)
                          })),
                          ...reportSales.map((i)=>({
                            id:`s-${i.id}`, date:i.date, type:"Penjualan",
                            name:`${i.buyer} / Petugas: ${i.operator || "-"}`, detail:i.material,
                            weight:`${Number(i.weight||0).toLocaleString("id-ID")} KG`,
                            amount:Number(i.total||0)
                          })),
                          ...reportAdvances.map((i)=>({
                            id:`a-${i.id}`, date:i.date, type:"Panjar",
                            name:i.name, detail:i.note||"-", weight:"-",
                            amount:-Number(i.amount||0)
                          })),
                          ...reportDebts.map((i)=>({
                            id:`d-${i.id}`, date:i.date, type:"Kasbon",
                            name:i.name, detail:i.note||"-", weight:"-",
                            amount:-Number(i.amount||0)
                          })),
                          ...reportOperations.map((i)=>({
                            id:`o-${i.id}`, date:i.date, type:"Operasional",
                            name:i.category, detail:i.note||"-", weight:"-",
                            amount:-Number(i.amount||0)
                          })),
                          ...reportCashMovements.map((i)=>({
                            id:`c-${i.id}`, date:i.date,
                            type:i.type === "masuk" ? "Kas Masuk" : "Pengeluaran Lain",
                            name:"Kas", detail:i.note||"-", weight:"-",
                            amount:i.type === "masuk" ? Number(i.amount||0) : -Number(i.amount||0)
                          })),
                        ].map((item)=>(
                          <tr key={item.id}>
                            <td>{item.date}</td>
                            <td>{item.type}</td>
                            <td>{item.name || "-"}</td>
                            <td>{item.detail || "-"}</td>
                            <td>{item.weight}</td>
                            <td>{rupiah(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="page-card">
                  <div className="section-title">
                    <h3>Backup & Restore Data</h3>
                    <span>Keamanan data</span>
                  </div>

                  <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"18px"}}>
                    <button type="button" className="primary-button" onClick={backupData}>
                      Download Backup
                    </button>

                    <button type="button" className="primary-button" onClick={downloadLatestAutoBackup}>
                      Download Backup Otomatis
                    </button>

                    <label className="primary-button" style={{cursor:"pointer",display:"inline-flex",alignItems:"center"}}>
                      Restore Backup
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={restoreData}
                        style={{display:"none"}}
                      />
                    </label>
                  </div>

                  {backupNotice && (
                    <div style={{marginBottom:"16px",padding:"10px 14px",borderRadius:"10px",background:"#ecfdf3",fontWeight:700}}>
                      ✓ {backupNotice}
                    </div>
                  )}

                  <div style={{fontSize:"13px",opacity:.7}}>
                    Backup menyimpan seluruh data usaha. Sistem juga membuat backup otomatis harian di browser dan menyimpan maksimal 7 backup terakhir. Data utama tetap tersinkron ke Supabase.
                  </div>
                </div>
              </>
            ) : activeMenu === "master" ? (
              <>
                <div className="page-header">
                  <div>
                    <div className="breadcrumb">Beranda / Master Data</div>
                    <h2>Master Data</h2>
                    <p>Kelola jenis material perusahaan.</p>
                  </div>
                </div>

                <div className="page-card" style={{marginBottom:"18px"}}>
                  <div className="section-title">
                    <h3>Keamanan Admin</h3>
                    <span>PIN akses administrator</span>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"12px",alignItems:"end"}}>
                    <div className="form-group">
                      <label>PIN Admin Baru</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        placeholder="4–8 angka"
                        value={newAdminPin}
                        onChange={(e)=>setNewAdminPin(e.target.value)}
                        onKeyDown={(e)=>{
                          if (e.key === "Enter") changeAdminPin();
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={changeAdminPin}
                    >
                      Ubah PIN
                    </button>
                  </div>

                  <div style={{fontSize:"12px",opacity:.6,marginTop:"10px"}}>
                    Karyawan tidak dapat membuka Dashboard, Penjualan, Stok, Keuangan, Laporan, atau Master Data.
                  </div>
                </div>

                <div className="page-card">
                  <div className="page-header">
                    <div>
                      <h3>Jenis Material</h3>
                      <p>Daftar material yang digunakan dalam transaksi.</p>
                    </div>

                    <span>{materials.length} material</span>
                  </div>

                  <div className="material-add-form">
                    <input
                      type="text"
                      placeholder="Nama material baru"
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addMaterial();
                        }
                      }}
                    />

                    <button
                      type="button"
                      className="primary-button"
                      onClick={addMaterial}
                    >
                      + Tambah Material
                    </button>
                  </div>

                  <div className="material-list">
                    {materials.map((item, index) => (
                      <div className="material-item" key={item.name}>
                        {editingMaterial === item.name ? (
                          <>
                            <input
                              type="text"
                              value={editMaterialName}
                              onChange={(e) =>
                                setEditMaterialName(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  saveEditMaterial();
                                }
                              }}
                            />

                            <button
                              type="button"
                              onClick={saveEditMaterial}
                            >
                              Simpan
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditMaterial}
                            >
                              Batal
                            </button>
                          </>
                        ) : (
                          <>
                            <strong>
                              {index + 1}. {item.name}
                            </strong>

                            <button
                              type="button"
                              onClick={() => startEditMaterial(item)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() => deleteMaterial(item)}
                            >
                              Hapus
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="page-card">
                <div className="page-header">
                  <div>
                    <div className="breadcrumb">
                      Beranda / {menu.find((m) => m.id === activeMenu)?.label}
                    </div>
                    <h2>
                      {menu.find((m) => m.id === activeMenu)?.label}
                    </h2>
                    <p>
                      Kelola data dan aktivitas perusahaan pada menu ini.
                    </p>
                  </div>
                </div>

                <div className="page-empty">
                  <div className="page-empty-icon">
                    {menu.find((m) => m.id === activeMenu)?.icon}
                  </div>

                  <h3>
                    {menu.find((m) => m.id === activeMenu)?.label}
                  </h3>

                  <p>Halaman ini siap digunakan.</p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
