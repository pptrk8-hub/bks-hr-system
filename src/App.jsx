import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, query, onSnapshot, 
  serverTimestamp, orderBy, where, deleteDoc, doc, updateDoc, setDoc, getDocs 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, signOut 
} from 'firebase/auth';
import { 
  Calendar, User, FileText, PieChart, 
  Save, AlertCircle, CheckCircle, Upload, Trash2, Clock,
  Lock, LogOut, ShieldCheck, Printer, Menu, X,
  Users, Award, BookOpen, Edit, Settings, Search, Bell, ChevronRight, Briefcase, Plus, Filter, Eye, Camera, BarChart2, Link as LinkIcon, File, DollarSign, Mail, HelpCircle
} from 'lucide-react';

// --- 1. CONFIGURATION & SETUP ---
const userFirebaseConfig = {
  apiKey: "AIzaSyCUWfe2PT0Eh5xrkEbzg9VaUveCfm8kcKc",
  authDomain: "banbakan-leave-app.firebaseapp.com",
  projectId: "banbakan-leave-app",
  storageBucket: "banbakan-leave-app.firebasestorage.app",
  messagingSenderId: "534178244956",
  appId: "1:534178244956:web:76db277f04c3073dcdb999",
  measurementId: "G-K39C7C08R9"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : userFirebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'banbakan-hr-system';

// --- LOGO & ASSETS MANAGEMENT ---
const DRIVE_THUMBNAIL_URL = "https://drive.google.com/thumbnail?id=1b8Ep2pW70A3Ig-4ILoosQ78Kb73hx81t&sz=w1000";
const LOGO_FALLBACK = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjIwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDAxZjViO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDAwMzM7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8IS0tIFNoaWVsZCAtLT4KICA8cGF0aCBkPSJNMTUgMzAgTCAxMDAgMTAgTCAxODUgMzAgQyAxODUgOTAgMTc1IDE1MCAxMDAgMjEwIEMgMjUgMTUwIDE1IDkwIDE1IDMwIFoiIGZpbGw9InVybCgjZ3JhZDEpIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjUiLz4KICA8IS0tIFdyZWF0aCAoU2ltcGxpZmllZCkgLS0+CiAgPHBhdGggZD0iTTUwIDkwIFEgMjAgMTQwIDcwIDE3MCIgc3Ryb2tlPSIjNGRiOGZmIiBzdHJva2Utd2lkdGg9IjUiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuOCIvPgogIDxwYXRoIGQ9Ik0xNTAgOTAgUSAxODAgMTQwIDEzMCAxNzAiIHN0cm9rZT0iIzRkYjhmZiIgc3Ryb2tlLXdpZHRoPSI1IiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjgiLz4KICA8IS0tIFRleHQgQktTLUhSIC0tPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTE1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjkwMCIgZm9udC1zaXplPSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPkJLUy1IUjwvdGV4dD4KICA8IS0tIFJpYmJvbiAtLT4KICA8cGF0aCBkPSJNMTUgMTYwIEwgMTg1IDE2MCBMIDE3NSAxOTAgTCAyNSAxOTAgWiIgZmlsbD0iIzAwYmNkNCIgc3Ryb2tlPSJkYXJrY3lhbiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iMTAwIiB5PSIxODIiIGZvbnQtZmFtaWx5PSJzYW5zLXNZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBzdHlsZT0idGV4dC1zaGFkb3c6IDFweCAxcHCAMnB4IGJsYWNrOyI+QkFOQkFLQU4gU0NIT09MPC90ZXh0Pgo8L3N2Zz4=`;
const GARUDA_URL = "https://drive.google.com/thumbnail?id=10lfNN_Qqqip6NpLtw-u16SQxVKlbfGBR&sz=w1000";

// --- 2. CONSTANTS & DATA ---
const DEFAULT_PASSWORD = '1234';
const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const THAI_MONTHS_FULL = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

// Initial Seed Data (Added new user: orasa, areeya)
const INITIAL_USERS = [
  { name: "นายพลภัทร ธีระกุล", role: 'Super Admin', position: 'ผู้อำนวยการโรงเรียน', username: 'phonlaphat', department: 'บริหาร', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวทิพวรรณ ศรีทองแก้ว", role: 'Super Admin', position: 'รองผู้อำนวยการโรงเรียน', username: 'tippawan', department: 'บริหาร', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสุมาลี บุญชู", role: 'Admin HR', position: 'ครู (เจ้าหน้าที่บุคคล)', username: 'sumalee', department: 'บุคคล', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางรอยฮัน โต๊ะดำ", role: 'User', position: 'ครู', username: 'royhan', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวจุฑาภรณ์ อุมาสะ", role: 'User', position: 'ครู', username: 'jutaporn', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวจันทนา บุตรฤทธิ์", role: 'User', position: 'ครู', username: 'jantana', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางอุษณี บุญทิพย์", role: 'User', position: 'ครู', username: 'usanee', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวกษมา ดินแดง", role: 'User', position: 'ครู', username: 'kasama', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวจิตสุภา บุญถาวร", role: 'User', position: 'ครู', username: 'jitsupa', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวนุรไลลา สาและ", role: 'User', position: 'ครู', username: 'nurlaila', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวบริมาส มะลิผล", role: 'User', position: 'ครู', username: 'barimas', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวมลิวัลย์ ชุมบุญ", role: 'User', position: 'ครู', username: 'maliwan', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางวรัญญา สารสิทธิ์", role: 'User', position: 'ครู', username: 'waranya', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวฮัซนา ดาแล่หมัน", role: 'User', position: 'ครู', username: 'husna', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวนุรอาซีกีน ยาลอ", role: 'User', position: 'ครู', username: 'nuraseekeen', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวภาอีด๊ะ อ่าวลึกน้อย", role: 'User', position: 'ครู', username: 'paeeda', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวอรษา ชาตรีวงศ์", role: 'User', position: 'ครู', username: 'orasa', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวอารียา มาลัยกุล", role: 'User', position: 'ครู', username: 'areeya', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นายอิรอน นายาว", role: 'User', position: 'ครู', username: 'iron', department: 'ทั่วไป', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นายอมรศักดิ์ สระวารี", role: 'User', position: 'นักการภารโรง', username: 'amornsak', department: 'ทั่วไป', tel: '', email: '', salary: 0, academic: 0, backPay: 0 }
];

const LEAVE_TYPES = [
  { id: 'sick', label: 'ลาป่วย', color: 'bg-red-100 text-red-700', barColor: 'bg-red-500' },
  { id: 'personal', label: 'ลากิจส่วนตัว', color: 'bg-orange-100 text-orange-700', barColor: 'bg-orange-500' },
  { id: 'half_day', label: 'ลาครึ่งวัน', color: 'bg-yellow-100 text-yellow-700', barColor: 'bg-yellow-500' },
  { id: 'maternity', label: 'ลาคลอด', color: 'bg-pink-100 text-pink-700', barColor: 'bg-pink-500' },
  { id: 'religious', label: 'ลาศาสนา', color: 'bg-purple-100 text-purple-700', barColor: 'bg-purple-500' },
  { id: 'late', label: 'มาสาย', color: 'bg-gray-100 text-gray-700', barColor: 'bg-gray-500' }
];

// --- 3. HELPER FUNCTIONS ---
const getCycleInfo = (dateObj) => {
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  if (month >= 3 && month <= 8) return { cycle: 1, year: year, label: `รอบที่ 1 (เม.ย. - ก.ย. ${year + 543})` };
  else {
    let fiscalYear = month >= 9 ? year + 1 : year;
    return { cycle: 2, year: fiscalYear, label: `รอบที่ 2 (ต.ค. - มี.ค. ${fiscalYear + 543})` };
  }
};

const calculateDays = (start, end, type) => {
  if (type === 'half_day') return 0.5;
  if (type === 'late') return 0;
  const s = new Date(start); const e = new Date(end);
  return Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1; 
};

const formatDateThai = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return `${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount || 0);
};

// --- 4. UI COMPONENTS ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20}/></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const toastClasses = `fixed top-4 right-4 ${bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in z-50`;
  
  return (
    <div className={toastClasses}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

const StatCard = ({ title, value, unit, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} bg-opacity-20 text-${color.split('-')[1]}-600`}>
      <Icon size={24} className={color.replace('bg-', 'text-').replace('-100', '-600')} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <div className="flex items-baseline gap-1">
        <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
    </div>
  </div>
);

// --- 5. MAIN MODULES ---

// Sidebar
const Sidebar = ({ user, activeTab, setActiveTab, onLogout, isOpen, toggleSidebar, customLogo }) => {
  const menus = [
    { id: 'dashboard', label: 'ภาพรวมระบบ', icon: PieChart, roles: ['Super Admin', 'Admin HR', 'User'] },
    { id: 'leaves', label: 'ระบบวันลา', icon: Calendar, roles: ['Super Admin', 'Admin HR'] },
    { id: 'salary', label: 'ระบบเงินเดือน', icon: DollarSign, roles: ['Super Admin', 'Admin HR'] },
    { id: 'report', label: 'พิมพ์รายงาน', icon: Printer, roles: ['Super Admin', 'Admin HR'] },
    { id: 'profile', label: 'โปรไฟล์ของฉัน', icon: User, roles: ['Super Admin', 'Admin HR', 'User'] },
    { id: 'training', label: 'ประวัติอบรม', icon: BookOpen, roles: ['Super Admin', 'Admin HR', 'User'] },
    { id: 'portfolio', label: 'ผลงานดีเด่น', icon: Award, roles: ['Super Admin', 'Admin HR', 'User'] },
    { id: 'users', label: 'จัดการผู้ใช้', icon: Users, roles: ['Super Admin'] },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={toggleSidebar}></div>}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <img 
            src={customLogo || DRIVE_THUMBNAIL_URL} 
            onError={(e) => { e.target.onerror = null; e.target.src = LOGO_FALLBACK; }}
            alt="BKS Logo" 
            className="w-12 h-12 object-contain drop-shadow-md bg-white rounded-full p-1" 
          />
          <div>
            <h1 className="font-bold text-lg leading-tight">BKS-HR</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Management</p>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden ml-auto text-slate-400"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {menus.filter(m => m.roles.includes(user.role)).map(menu => (
            <button
              key={menu.id}
              onClick={() => { setActiveTab(menu.id); toggleSidebar(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === menu.id ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <menu.icon size={20} className={activeTab === menu.id ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
              <span className="font-medium">{menu.label}</span>
              {activeTab === menu.id && <ChevronRight size={16} className="ml-auto opacity-50"/>}
            </button>
          ))}
        </div>
        <div className="p-4 bg-slate-950/50">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-inner">{user.name.charAt(0)}</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-white">{user.name}</p>
              {/* Added Position Display below Name */}
              <p className="text-[10px] text-slate-300 truncate">{user.position}</p>
              <p className="text-[9px] text-slate-500 truncate">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-xs font-medium text-red-400 hover:bg-red-950/30 py-2 rounded-lg transition-colors border border-transparent hover:border-red-900"><LogOut size={14} /> ลงชื่อออก</button>
        </div>
      </aside>
    </>
  );
};

// Dashboard Module
const DashboardModule = ({ user, leaves, trainings, portfolio, setActiveTab, usersData }) => {
  const leaveCount = leaves.length;
  const trainingCount = trainings.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0);
  const portfolioCount = portfolio.length;
  const staffCount = usersData.length;

  const currentCycle = getCycleInfo(new Date());
  const myLeaves = leaves.filter(l => l.staffId === user.id && l.cycle === currentCycle.cycle && l.fiscalYear === currentCycle.year);
  const myTrainings = trainings.filter(t => t.userId === user.id);
  const myPortfolios = portfolio.filter(p => p.userId === user.id);

  // --- LOGIC UPDATE: Count all except late for times, Exclude religious from days ---
  const leaveEntries = myLeaves.filter(l => l.leaveType !== 'late');
  const totalTimes = leaveEntries.length; 
  
  const totalDaysUsed = leaveEntries
    .filter(l => l.leaveType !== 'religious')
    .reduce((acc, curr) => acc + (Number(curr.daysCount) || 0), 0);

  const religiousDays = leaveEntries
    .filter(l => l.leaveType === 'religious')
    .reduce((acc, curr) => acc + (Number(curr.daysCount) || 0), 0);

  const lateCount = myLeaves.filter(l => l.leaveType === 'late').length;

  const myStats = {
    totalTimes,
    totalDaysUsed,
    religiousDays,
    lateCount,
    trainingHours: myTrainings.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0),
    portfolioCount: myPortfolios.length
  };

  const QUOTAS = { times: 6, days: 25 };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthLeaves = leaves.filter(l => {
    const d = new Date(l.startDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const leaveStats = LEAVE_TYPES.map(type => {
    const count = currentMonthLeaves.filter(l => l.leaveType === type.id).length;
    return { ...type, count };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">ระบบสารสนเทศบริหารงานบุคคล โรงเรียนบ้านบากัน</h2>

      <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
        <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center">
          <h3 className="font-bold text-indigo-900 flex items-center gap-2">
            <User size={20} /> ข้อมูลของฉัน ({currentCycle.label})
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">สิทธิ์การลาคงเหลือ</h4>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>จำนวนครั้งที่ใช้สิทธิ์</span>
                <span className={`font-bold ${myStats.totalTimes > QUOTAS.times ? 'text-red-600' : 'text-gray-700'}`}>
                  {myStats.totalTimes} / {QUOTAS.times} ครั้ง
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${myStats.totalTimes > QUOTAS.times ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((myStats.totalTimes / QUOTAS.times) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>จำนวนวันที่ใช้สิทธิ์</span>
                <span className={`font-bold ${myStats.totalDaysUsed > QUOTAS.days ? 'text-red-600' : 'text-gray-700'}`}>
                  {myStats.totalDaysUsed} / {QUOTAS.days} วัน
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${myStats.totalDaysUsed > QUOTAS.days ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min((myStats.totalDaysUsed / QUOTAS.days) * 100, 100)}%` }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">*นับรวมทุกประเภท (ยกเว้นวันลาศาสนา)</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
               <div className="bg-purple-50 p-2 rounded-lg border border-purple-100 text-center">
                  <span className="text-xs text-purple-600 block">ลาศาสนา</span>
                  <span className="font-bold text-purple-800">{myStats.religiousDays} วัน</span>
               </div>
               <div className="bg-red-50 p-2 rounded-lg border border-red-100 text-center">
                  <span className="text-xs text-red-600 block">มาสาย</span>
                  <span className="font-bold text-red-800">{myStats.lateCount} ครั้ง</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <BookOpen size={24} />
            </div>
            <h4 className="font-bold text-gray-700">การอบรมของฉัน</h4>
            <p className="text-3xl font-bold text-green-700 my-1">{myStats.trainingHours}</p>
            <span className="text-xs text-gray-500">ชั่วโมงสะสม</span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
              <Award size={24} />
            </div>
            <h4 className="font-bold text-gray-700">ผลงานของฉัน</h4>
            <p className="text-3xl font-bold text-purple-700 my-1">{myStats.portfolioCount}</p>
            <span className="text-xs text-gray-500">รายการ</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="บุคลากรทั้งหมด" value={staffCount} unit="คน" icon={Users} color="bg-indigo-100" />
        <StatCard title="วันลา (ปีนี้)" value={leaveCount} unit="วัน" icon={Calendar} color="bg-blue-100" />
        <StatCard title="อบรม (สะสม)" value={trainingCount} unit="ชม." icon={BookOpen} color="bg-green-100" />
        <StatCard title="ผลงาน (สะสม)" value={portfolioCount} unit="ชิ้น" icon={Award} color="bg-purple-100" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Briefcase size={18} className="text-blue-500"/> เมนูลัด (Quick Actions)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {user.role !== 'User' && (
              <>
                <button onClick={() => setActiveTab('leaves')} className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl flex flex-col items-center justify-center gap-2 transition border border-blue-100">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm"><Calendar size={16}/></div>
                  <span className="text-xs font-medium">วันลา</span>
                </button>
                <button onClick={() => setActiveTab('salary')} className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl flex flex-col items-center justify-center gap-2 transition border border-teal-100">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-teal-600 shadow-sm"><DollarSign size={16}/></div>
                  <span className="text-xs font-medium">เงินเดือน</span>
                </button>
                <button onClick={() => setActiveTab('report')} className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 transition border border-gray-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm"><Printer size={16}/></div>
                  <span className="text-xs font-medium">รายงาน</span>
                </button>
              </>
            )}
            <button onClick={() => setActiveTab('training')} className="p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl flex flex-col items-center justify-center gap-2 transition border border-green-100">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm"><BookOpen size={16}/></div>
              <span className="text-xs font-medium">อบรม</span>
            </button>
            <button onClick={() => setActiveTab('portfolio')} className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl flex flex-col items-center justify-center gap-2 transition border border-purple-100">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm"><Award size={16}/></div>
              <span className="text-xs font-medium">ผลงาน</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className="p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl flex flex-col items-center justify-center gap-2 transition border border-orange-100">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-sm"><User size={16}/></div>
              <span className="text-xs font-medium">โปรไฟล์</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 size={18} className="text-pink-500"/> สถิติการลา (เดือนนี้)
          </h3>
          <div className="space-y-3">
            {leaveStats.map(type => (
              <div key={type.id} className="flex items-center gap-3">
                 <div className="w-24 text-xs text-gray-500 text-right truncate">{type.label}</div>
                 <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${type.barColor}`} style={{ width: `${Math.min(type.count * 10, 100)}%` }}></div>
                 </div>
                 <div className="w-8 text-xs text-gray-700 font-bold text-right">{type.count}</div>
              </div>
            ))}
            {currentMonthLeaves.length === 0 && <p className="text-xs text-center text-gray-400 py-2">ไม่มีการลาในเดือนนี้</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Salary Module
const SalaryModule = ({ usersData, onUpdateUser, showToast }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserEdit, setCurrentUserEdit] = useState(null);
  const [formData, setFormData] = useState({ salary: 0, academic: 0, backPay: 0 });
  const filteredUsers = usersData.filter(u => u.name.includes(search));
  
  // Calculate Total Budget (Salary + Academic + BackPay)
  const totalBudget = usersData.reduce((acc, curr) => acc + (Number(curr.salary) || 0) + (Number(curr.academic) || 0) + (Number(curr.backPay) || 0), 0);
  
  const handleEdit = (user) => { 
    setCurrentUserEdit(user); 
    setFormData({ 
      salary: user.salary || 0, 
      academic: user.academic || 0,
      backPay: user.backPay || 0 // Load backPay
    }); 
    setIsModalOpen(true); 
  };
  
  const handleSave = () => { 
    onUpdateUser(currentUserEdit.id, { 
      salary: Number(formData.salary), 
      academic: Number(formData.academic),
      backPay: Number(formData.backPay) // Save backPay
    }); 
    setIsModalOpen(false); 
    showToast("อัปเดตข้อมูลเงินเดือนเรียบร้อย"); 
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-700 to-teal-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-green-100 font-medium mb-1">ยอดรวมงบประมาณรายจ่าย (เดือนนี้)</h3>
            <p className="text-4xl font-bold">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="bg-white/20 p-4 rounded-full"><DollarSign size={32} /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><DollarSign className="text-green-600"/> จัดการข้อมูลเงินเดือน</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
            <input type="text" placeholder="ค้นหาชื่อ..." className="w-full pl-10 p-2 bg-gray-50 border rounded-lg" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold">
              <tr>
                <th className="p-3">ชื่อ-สกุล</th>
                <th className="p-3">ตำแหน่ง</th>
                <th className="p-3 text-right">เงินเดือน</th>
                <th className="p-3 text-right">เงินวิทยฐานะ</th>
                {/* Added Back Pay Column */}
                <th className="p-3 text-right">ตกเบิก</th>
                <th className="p-3 text-right text-green-700">รวมรับสุทธิ</th>
                <th className="p-3 text-center">แก้ไข</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(u => {
                 const total = (Number(u.salary)||0) + (Number(u.academic)||0) + (Number(u.backPay)||0);
                 return (
                  <tr key={u.id} className="hover:bg-green-50/30">
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-gray-500">{u.position}</td>
                    <td className="p-3 text-right">{formatCurrency(u.salary)}</td>
                    <td className="p-3 text-right">{formatCurrency(u.academic)}</td>
                    <td className="p-3 text-right text-orange-600">{formatCurrency(u.backPay)}</td>
                    <td className="p-3 text-right font-bold text-green-700">{formatCurrency(total)}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleEdit(u)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-blue-50 hover:text-blue-600"><Edit size={16}/></button>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="แก้ไขข้อมูลเงินเดือน">
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded border">
            <p className="font-bold text-gray-800">{currentUserEdit?.name}</p>
            <p className="text-xs text-gray-500">{currentUserEdit?.position}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อัตราเงินเดือน (บาท)</label>
            <input type="number" className="w-full p-2 border rounded" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เงินวิทยฐานะ (บาท)</label>
            <input type="number" className="w-full p-2 border rounded" value={formData.academic} onChange={e => setFormData({...formData, academic: e.target.value})} />
          </div>
          {/* Added Back Pay Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เงินเดือนตกเบิก (บาท)</label>
            <input type="number" className="w-full p-2 border rounded" value={formData.backPay} onChange={e => setFormData({...formData, backPay: e.target.value})} />
          </div>
          <div className="pt-2 border-t flex justify-between items-center">
            <span className="text-sm font-bold">รวมทั้งสิ้น</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(Number(formData.salary) + Number(formData.academic) + Number(formData.backPay))}
            </span>
          </div>
          <button onClick={handleSave} className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">บันทึก</button>
        </div>
      </Modal>
    </div>
  );
};

// User Management Module
const UserManagement = ({ usersData, onAddUser, onUpdateUser, onResetPassword }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const openAdd = () => { setIsEditMode(false); setFormData({ name: '', username: '', password: DEFAULT_PASSWORD, role: 'User', position: 'ครู', department: '', tel: '', email: '', status: 'active' }); setIsModalOpen(true); };
  const openEdit = (user) => { setIsEditMode(true); setFormData(user); setIsModalOpen(true); };
  const handleSubmit = (e) => { e.preventDefault(); if (isEditMode) onUpdateUser(formData.id, formData); else onAddUser(formData); setIsModalOpen(false); };
  const filteredUsers = usersData.filter(u => u.name.includes(search) || u.username.includes(search));
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-blue-600"/> จัดการผู้ใช้</h2>
        <div className="flex gap-2 w-full sm:w-auto"><div className="relative flex-1 sm:w-64"><Search className="absolute left-3 top-2.5 text-gray-400" size={18}/><input type="text" placeholder="ค้นหา..." className="w-full pl-10 p-2 bg-gray-50 border rounded-lg" value={search} onChange={e => setSearch(e.target.value)} /></div><button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 whitespace-nowrap"><Plus size={18}/> เพิ่มผู้ใช้</button></div>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-700 uppercase font-bold"><tr><th className="p-3">ชื่อ-สกุล</th><th className="p-3">Username</th><th className="p-3">ตำแหน่ง/ฝ่าย</th><th className="p-3">สิทธิ์</th><th className="p-3">สถานะ</th><th className="p-3 text-center">จัดการ</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredUsers.map(u => (<tr key={u.id} className="hover:bg-blue-50/50"><td className="p-3">
            <div className="flex items-center gap-3">
               {/* Avatar Logic */}
               <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                  {u.photoURL ? (
                    <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} className="text-slate-400" />
                  )}
               </div>
               <div>
                 <div className="font-medium">{u.name}</div>
                 <div className="text-xs text-gray-400">{u.position}</div>
               </div>
            </div>
          </td><td className="p-3 text-gray-500">@{u.username}</td><td className="p-3">{u.position}<br/><span className="text-xs text-gray-400">{u.department}</span></td><td className="p-3"><span className={`px-2 py-1 rounded text-xs border ${u.role === 'Super Admin' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200'}`}>{u.role}</span></td><td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status === 'active' ? 'ใช้งาน' : 'ปิด'}</span></td><td className="p-3 flex gap-2 justify-center"><button onClick={() => onResetPassword(u)} className="p-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100" title="รีเซ็ตรหัส"><Lock size={16}/></button><button onClick={() => openEdit(u)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="แก้ไข"><Edit size={16}/></button></td></tr>))}</tbody></table></div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}><form onSubmit={handleSubmit} className="space-y-3"><div><label className="text-xs font-bold text-gray-500">ชื่อ-สกุล</label><input className="w-full p-2 border rounded" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-gray-500">Username</label><input className="w-full p-2 border rounded" required disabled={isEditMode} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} /></div>{!isEditMode && <div><label className="text-xs font-bold text-gray-500">Password</label><input className="w-full p-2 border rounded" value={DEFAULT_PASSWORD} disabled /></div>}</div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-gray-500">ตำแหน่ง</label><input className="w-full p-2 border rounded" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} /></div><div><label className="text-xs font-bold text-gray-500">กลุ่มสาระ/ฝ่าย</label><input className="w-full p-2 border rounded" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} /></div></div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-gray-500">เบอร์โทร</label><input className="w-full p-2 border rounded" value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} /></div><div><label className="text-xs font-bold text-gray-500">Email</label><input className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div></div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-gray-500">สิทธิ์ (Role)</label><select className="w-full p-2 border rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}><option value="User">User (ครูทั่วไป)</option><option value="Admin HR">Admin HR</option><option value="Super Admin">Super Admin</option></select></div><div><label className="text-xs font-bold text-gray-500">สถานะ</label><select className="w-full p-2 border rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option value="active">Active (ใช้งาน)</option><option value="disabled">Disabled (ปิด)</option></select></div></div><button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 mt-4">บันทึกข้อมูล</button></form></Modal>
    </div>
  );
};

const ProfileModule = ({ currentUser, onUpdateProfile, showToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(currentUser);
  const [preview, setPreview] = useState(currentUser.photoURL || null);
  const handleFileChange = (e) => { const file = e.target.files[0]; if (file) { if (file.size > 500000) { alert("ขนาดไฟล์ภาพต้องไม่เกิน 500KB"); return; } const reader = new FileReader(); reader.onloadend = () => { setPreview(reader.result); setFormData({ ...formData, photoURL: reader.result }); }; reader.readAsDataURL(file); } };
  const handleSave = () => { onUpdateProfile(currentUser.id, formData); setIsEditing(false); showToast("บันทึกโปรไฟล์เรียบร้อย", "success"); };
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div><div className="px-8 pb-8"><div className="relative -mt-12 mb-6 flex justify-between items-end"><div className="relative group"><div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg overflow-hidden">{preview ? (<img src={preview} alt="Profile" className="w-full h-full rounded-full object-cover" />) : (<div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><User size={48} /></div>)}</div>{isEditing && (<label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-md"><Camera size={16} /><input type="file" className="hidden" accept="image/*" onChange={handleFileChange} /></label>)}</div>{!isEditing ? (<button onClick={() => setIsEditing(true)} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"><Edit size={16} /> แก้ไขโปรไฟล์</button>) : (<div className="flex gap-2"><button onClick={() => { setIsEditing(false); setFormData(currentUser); setPreview(currentUser.photoURL); }} className="px-4 py-2 text-sm text-gray-600">ยกเลิก</button><button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">บันทึก</button></div>)}</div><div className="space-y-6"><div><h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2><p className="text-gray-500">{formData.position} • {formData.department || 'ไม่ระบุสังกัด'}</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">เบอร์โทรศัพท์</label>{isEditing ? (<input className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} placeholder="เช่น 08x-xxx-xxxx" />) : <p className="text-gray-900 font-medium">{currentUser.tel || '-'}</p>}</div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">อีเมล</label>{isEditing ? (<input className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="example@email.com" />) : <p className="text-gray-900 font-medium">{currentUser.email || '-'}</p>}</div><div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">ที่อยู่</label>{isEditing ? (<textarea className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="ที่อยู่ปัจจุบัน..." />) : <p className="text-gray-900">{currentUser.address || '-'}</p>}</div><div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">ความเชี่ยวชาญ / Bio</label>{isEditing ? (<textarea className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="แนะนำตัวสั้นๆ หรือระบุความเชี่ยวชาญ..." />) : <p className="text-gray-900">{currentUser.bio || '-'}</p>}</div></div></div></div></div>
  );
};

const ReportModule = ({ usersData, authUser }) => {
  const [activeReport, setActiveReport] = useState('leave');
  const [leaves, setLeaves] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [trainingYear, setTrainingYear] = useState(new Date().getFullYear() + 543);
  const [portfolioYear, setPortfolioYear] = useState(new Date().getFullYear() + 543);
  const [selectedPortfolioUser, setSelectedPortfolioUser] = useState(usersData[0]?.id || '');

  // FIXED: Moved sortedUsers logic to TOP of component to prevent ReferenceError
  // Sorting Logic for Reports
  const sortedUsers = useMemo(() => {
    return [...usersData].sort((a, b) => {
      const getPriority = (user) => {
        const pos = user.position || '';
        const role = user.role || '';
        if (pos.includes('ผู้อำนวยการโรงเรียน') && !pos.includes('รอง')) return 1;
        if (pos.includes('รองผู้อำนวยการ')) return 2;
        if (role === 'Admin HR' || pos.includes('บุคคล')) return 3;
        return 4;
      };
      const pA = getPriority(a);
      const pB = getPriority(b);
      if (pA !== pB) return pA - pB;
      return (a.name || '').localeCompare(b.name || '', 'th');
    });
  }, [usersData]);

  useEffect(() => { if (!authUser) return; const unsubLeaves = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'leaves')), (snap) => setLeaves(snap.docs.map(d => ({id: d.id, ...d.data()})))); const unsubTrainings = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'trainings')), (snap) => setTrainings(snap.docs.map(d => ({id: d.id, ...d.data()})))); const unsubPortfolios = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'portfolio')), (snap) => setPortfolios(snap.docs.map(d => ({id: d.id, ...d.data()})))); return () => { unsubLeaves(); unsubTrainings(); unsubPortfolios(); }; }, [authUser]);
  
  const handlePrint = () => window.print();
  const leaveReportData = useMemo(() => leaves.filter(l => { const d = new Date(l.startDate); return d.getMonth() === parseInt(reportMonth) && d.getFullYear() === parseInt(reportYear); }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)), [leaves, reportMonth, reportYear]);
  
  // This hook now works because sortedUsers is defined above
  const leaveSummaryData = useMemo(() => { const reportDateObj = new Date(reportYear, reportMonth, 1); const reportCycleInfo = getCycleInfo(reportDateObj); const cycleLeaves = leaves.filter(l => l.cycle === reportCycleInfo.cycle && l.fiscalYear === reportCycleInfo.year); const summary = sortedUsers.map(staff => { const staffLeaves = cycleLeaves.filter(l => l.staffName === staff.name); const totals = { name: staff.name, sick: 0, personal: 0, half_day: 0, maternity: 0, religious: 0, late: 0, totalDays: 0 }; staffLeaves.forEach(l => { const days = Number(l.daysCount) || 0; totals.totalDays += days; if (l.leaveType === 'sick') totals.sick += days; else if (l.leaveType === 'personal') totals.personal += days; else if (l.leaveType === 'half_day') totals.half_day += days; else if (l.leaveType === 'maternity') totals.maternity += days; else if (l.leaveType === 'religious') totals.religious += days; else if (l.leaveType === 'late') totals.late += 1; }); return totals; }); return { cycleLabel: reportCycleInfo.label, summary }; }, [leaves, reportMonth, reportYear, sortedUsers]);
  
  const trainingReportData = useMemo(() => usersData.map(u => { const userTrainings = trainings.filter(t => t.userId === u.id); const totalHours = userTrainings.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0); return { ...u, totalHours, count: userTrainings.length }; }).sort((a, b) => b.totalHours - a.totalHours), [trainings, usersData]);
  const portfolioReportData = useMemo(() => portfolios.filter(p => p.userId === selectedPortfolioUser && parseInt(p.year) === parseInt(portfolioYear)), [portfolios, selectedPortfolioUser, portfolioYear]);
  const selectedUser = usersData.find(u => u.id === selectedPortfolioUser) || {};
  const salaryTotal = usersData.reduce((acc, u) => acc + (Number(u.salary)||0) + (Number(u.academic)||0) + (Number(u.backPay)||0), 0);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:p-0 print:shadow-none print:border-none">
      <style>{`@media print { @page { size: A4; margin: 1cm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } .print-only { display: block !important; } .page-break { page-break-inside: avoid; } } .print-only { display: none; }`}</style>
      <div className="no-print mb-6 border-b pb-4"><h3 className="font-bold text-gray-700 mb-3">เลือกประเภทรายงาน</h3><div className="flex gap-2 flex-wrap"><button onClick={() => setActiveReport('leave')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeReport === 'leave' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>📄 รายงานการลา</button><button onClick={() => setActiveReport('salary')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeReport === 'salary' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>💰 สรุปรายรับ/เงินเดือน</button><button onClick={() => setActiveReport('training')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeReport === 'training' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>📊 สรุปชั่วโมงอบรม</button><button onClick={() => setActiveReport('portfolio')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeReport === 'portfolio' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>🏆 สรุปผลงานรายบุคคล</button></div></div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-lg no-print">
        {(activeReport === 'leave' || activeReport === 'salary') && (<><div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">เลือกเดือน</label><select value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="w-full p-2 border rounded">{THAI_MONTHS_FULL.map((m, i) => <option key={i} value={i}>{m}</option>)}</select></div><div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">เลือกปี พ.ศ.</label><select value={reportYear} onChange={(e) => setReportYear(e.target.value)} className="w-full p-2 border rounded">{[0,1,2].map(i => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y + 543}</option>})}</select></div></>)}
        {activeReport === 'training' && (<div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา (พ.ศ.)</label><input type="number" value={trainingYear} onChange={(e) => setTrainingYear(e.target.value)} className="w-full p-2 border rounded" /></div>)}
        {activeReport === 'portfolio' && (<><div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">เลือกบุคลากร</label><select value={selectedPortfolioUser} onChange={(e) => setSelectedPortfolioUser(e.target.value)} className="w-full p-2 border rounded">{usersData.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div><div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา (พ.ศ.)</label><input type="number" value={portfolioYear} onChange={(e) => setPortfolioYear(e.target.value)} className="w-full p-2 border rounded" /></div></>)}
        <div className="flex items-end"><button onClick={handlePrint} className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow flex items-center justify-center gap-2"><Printer size={18}/> พิมพ์ PDF</button></div>
      </div>
      <div className="w-full max-w-[210mm] mx-auto bg-white text-black p-4 min-h-[297mm]">
        {activeReport === 'leave' && (<div><div className="mb-6 relative"><img src={GARUDA_URL} alt="Garuda" className="absolute top-0 left-0" style={{ width: '1.5cm', height: 'auto' }} /><div className="text-center"><h3 className="text-2xl font-bold">บันทึกข้อความ</h3></div><div className="text-left mt-4 leading-relaxed"><p><strong>ส่วนราชการ</strong> โรงเรียนบ้านบากัน อำเภออ่าวลึก จังหวัดกระบี่</p><p><strong>ที่</strong> ................................................. <strong>วันที่</strong> {new Date().getDate()} {THAI_MONTHS_FULL[new Date().getMonth()]} {new Date().getFullYear() + 543}</p><p><strong>เรื่อง</strong> รายงานสรุปการลาของข้าราชการครูและบุคลากรทางการศึกษา ประจำเดือน {THAI_MONTHS_FULL[reportMonth]} {parseInt(reportYear) + 543}</p></div><hr className="my-4 border-black"/><p className="text-left mb-4"><strong>เรียน ผู้อำนวยการโรงเรียนบ้านบากัน</strong></p><p className="text-left indent-8 mb-4">ด้วยข้าพเจ้าได้รับมอบหมายให้รวบรวมสถิติการลาของข้าราชการครูและบุคลากรทางการศึกษา ประจำเดือน <u>{THAI_MONTHS_FULL[reportMonth]} พ.ศ. {parseInt(reportYear) + 543}</u> เพื่อนำเสนอต่อผู้บริหาร ดังรายละเอียดต่อไปนี้</p></div><div className="mb-6"><h4 className="font-bold mb-2">1. รายการลาประจำเดือน</h4><table className="w-full border-collapse border border-black text-sm"><thead><tr className="bg-gray-200"><th className="border border-black p-1 text-center w-10">ที่</th><th className="border border-black p-1 text-center w-32">ว/ด/ป ที่ลา</th><th className="border border-black p-1 text-left">ชื่อ-สกุล</th><th className="border border-black p-1 text-center w-24">ประเภท</th><th className="border border-black p-1 text-center w-16">วัน</th><th className="border border-black p-1 text-left">หมายเหตุ</th></tr></thead><tbody>{leaveReportData.length > 0 ? leaveReportData.map((row, index) => (<tr key={row.id}><td className="border border-black p-1 text-center align-top">{index + 1}</td><td className="border border-black p-1 text-center align-top">{formatDateThai(row.startDate)} {row.startDate !== row.endDate && <><br/>-{formatDateThai(row.endDate)}</>}</td><td className="border border-black p-1 align-top">{row.staffName}</td><td className="border border-black p-1 text-center align-top">{LEAVE_TYPES.find(t=>t.id === row.leaveType)?.label}</td><td className="border border-black p-1 text-center align-top">{row.daysCount}</td><td className="border border-black p-1 align-top">{row.reason || "-"}</td></tr>)) : <tr><td colSpan={6} className="border border-black p-4 text-center">-- ไม่มีรายการลาในเดือนนี้ --</td></tr>}</tbody></table></div><div className="mb-8 page-break"><div className="flex justify-between items-end mb-2"><h4 className="font-bold">2. สรุปวันลาสะสม ({leaveSummaryData.cycleLabel})</h4><span className="text-xs">* หน่วยเป็น "วัน" (มาสาย นับเป็น "ครั้ง")</span></div><table className="w-full border-collapse border border-black text-xs"><thead><tr className="bg-gray-200"><th className="border border-black p-1 text-center">ที่</th><th className="border border-black p-1 text-left w-40">ชื่อ-สกุล</th><th className="border border-black p-1 text-center">ป่วย</th><th className="border border-black p-1 text-center">กิจ</th><th className="border border-black p-1 text-center">ครึ่งวัน</th><th className="border border-black p-1 text-center">คลอด</th><th className="border border-black p-1 text-center">ศาสนา</th><th className="border border-black p-1 text-center bg-gray-100">รวมวัน</th><th className="border border-black p-1 text-center text-red-600">สาย(ครั้ง)</th></tr></thead><tbody>{leaveSummaryData.summary.map((staff, idx) => (<tr key={idx} className={staff.totalDays > 0 ? "" : "text-gray-400"}><td className="border border-black p-1 text-center">{idx + 1}</td><td className="border border-black p-1">{staff.name}</td><td className="border border-black p-1 text-center">{staff.sick || '-'}</td><td className="border border-black p-1 text-center">{staff.personal || '-'}</td><td className="border border-black p-1 text-center">{staff.half_day || '-'}</td><td className="border border-black p-1 text-center">{staff.maternity || '-'}</td><td className="border border-black p-1 text-center">{staff.religious || '-'}</td><td className="border border-black p-1 text-center font-bold bg-gray-50">{staff.totalDays || '-'}</td><td className="border border-black p-1 text-center text-red-600">{staff.late || '-'}</td></tr>))}</tbody></table></div><div className="grid grid-cols-2 gap-4 px-4 page-break"><div className="text-center pt-4"><p>ลงชื่อ ....................................................... ผู้ตรวจสอบ</p><p className="mt-2 font-bold">( นางสุมาลี บุญชู )</p><p>ฝ่ายบริหารงานบุคคล</p></div><div className="text-center pt-4"><p>ลงชื่อ ....................................................... ผู้ตรวจสอบ</p><p className="mt-2 font-bold">( นางสาวทิพวรรณ ศรีทองแก้ว )</p><p>รองผู้อำนวยการโรงเรียนบ้านบากัน</p></div></div><div className="mt-8 text-center px-4"><p className="mb-2">ทราบ / อนุญาต</p><p className="mb-6">ลงชื่อ .......................................................</p><p className="font-bold">( นายพลภัทร ธีระกุล )</p><p>ผู้อำนวยการโรงเรียนบ้านบากัน</p></div></div>)}
        {activeReport === 'salary' && (<div><div className="text-center mb-8"><h3 className="text-xl font-bold">รายงานสรุปบัญชีถือจ่ายเงินเดือนข้าราชการครูและบุคลากร</h3><h4 className="text-lg">โรงเรียนบ้านบากัน ประจำเดือน {THAI_MONTHS_FULL[reportMonth]} {parseInt(reportYear) + 543}</h4></div><table className="w-full border-collapse border border-black text-sm"><thead><tr className="bg-gray-200"><th className="border border-black p-2 text-center w-12">ที่</th><th className="border border-black p-2 text-left">ชื่อ-สกุล</th><th className="border border-black p-2 text-left">ตำแหน่ง</th><th className="border border-black p-2 text-right">เงินเดือน</th><th className="border border-black p-2 text-right">เงินวิทยฐานะ</th><th className="border border-black p-2 text-right">ตกเบิก</th><th className="border border-black p-2 text-right font-bold bg-gray-100">รวมรับสุทธิ</th><th className="border border-black p-2 text-center w-24">ลายมือชื่อ</th></tr></thead><tbody>{sortedUsers.map((user, index) => { const total = (Number(user.salary)||0) + (Number(user.academic)||0) + (Number(user.backPay)||0); return (<tr key={user.id}><td className="border border-black p-2 text-center">{index + 1}</td><td className="border border-black p-2">{user.name}</td><td className="border border-black p-2">{user.position}</td><td className="border border-black p-2 text-right">{user.salary ? formatCurrency(user.salary) : '-'}</td><td className="border border-black p-2 text-right">{user.academic ? formatCurrency(user.academic) : '-'}</td><td className="border border-black p-2 text-right">{user.backPay ? formatCurrency(user.backPay) : '-'}</td><td className="border border-black p-2 text-right font-bold bg-gray-50">{formatCurrency(total)}</td><td className="border border-black p-2"></td></tr>); })}</tbody><tfoot><tr className="bg-gray-200 font-bold"><td colSpan={3} className="border border-black p-2 text-center">รวมทั้งสิ้น</td><td className="border border-black p-2 text-right">{formatCurrency(usersData.reduce((a,b)=>a+(Number(b.salary)||0),0))}</td><td className="border border-black p-2 text-right">{formatCurrency(usersData.reduce((a,b)=>a+(Number(b.academic)||0),0))}</td><td className="border border-black p-2 text-right">{formatCurrency(usersData.reduce((a,b)=>a+(Number(b.backPay)||0),0))}</td><td className="border border-black p-2 text-right">{formatCurrency(salaryTotal)}</td><td className="border border-black p-2"></td></tr></tfoot></table>
        
        {/* Updated Signature Section with correct name and better spacing */}
        <div className="grid grid-cols-3 gap-4 px-4 mt-12 page-break">
          <div className="text-center">
            <p className="mb-8">ลงชื่อ ...........................................</p>
            <p className="font-bold mb-1">( นางรอยฮัน โต๊ะดำ )</p>
            <p>ผู้จัดทำ</p>
            <p className="text-xs text-gray-500">(เจ้าหน้าที่การเงิน)</p>
          </div>
          <div className="text-center">
            <p className="mb-8">ลงชื่อ ...........................................</p>
            <p className="font-bold mb-1">( นางสาวทิพวรรณ ศรีทองแก้ว )</p>
            <p>ผู้ตรวจสอบ</p>
            <p className="text-xs text-gray-500">(รองผู้อำนวยการโรงเรียน)</p>
          </div>
          <div className="text-center">
            <p className="mb-8">ลงชื่อ ...........................................</p>
            <p className="font-bold mb-1">( นายพลภัทร ธีระกุล )</p>
            <p>ผู้อนุมัติ</p>
            <p className="text-xs text-gray-500">(ผู้อำนวยการโรงเรียน)</p>
          </div>
        </div>
        </div>)}
        {activeReport === 'training' && (<div><div className="text-center mb-8"><h3 className="text-xl font-bold">รายงานสรุปผลการพัฒนาบุคลากร (อบรม/สัมมนา)</h3><h4 className="text-lg">โรงเรียนบ้านบากัน ประจำปีการศึกษา {trainingYear}</h4></div><table className="w-full border-collapse border border-black text-sm"><thead><tr className="bg-gray-200"><th className="border border-black p-2 text-center w-16">ลำดับ</th><th className="border border-black p-2 text-left">ชื่อ-สกุล</th><th className="border border-black p-2 text-left">ตำแหน่ง</th><th className="border border-black p-2 text-center w-24">จำนวนครั้ง</th><th className="border border-black p-2 text-center w-32">ชั่วโมงรวม</th><th className="border border-black p-2 text-center w-40">หมายเหตุ</th></tr></thead><tbody>{trainingReportData.map((row, index) => (<tr key={row.id}><td className="border border-black p-2 text-center">{index + 1}</td><td className="border border-black p-2">{row.name}</td><td className="border border-black p-2">{row.position}</td><td className="border border-black p-2 text-center">{row.count}</td><td className="border border-black p-2 text-center font-bold">{row.totalHours}</td><td className="border border-black p-2"></td></tr>))}</tbody></table><div className="mt-8 text-center px-4"><p className="mb-6">ลงชื่อ ....................................................... ผู้รับรองข้อมูล</p><p className="font-bold">( นายพลภัทร ธีระกุล )</p><p>ผู้อำนวยการโรงเรียนบ้านบากัน</p></div></div>)}
        {activeReport === 'portfolio' && (<div><div className="text-center mb-8 border-b-2 border-black pb-4"><h3 className="text-2xl font-bold mb-2">รายงานสรุปผลงานดีเด่น (Best Practice)</h3><h4 className="text-lg">ประจำปีการศึกษา {portfolioYear}</h4></div><div className="mb-6"><p className="text-lg"><strong>ชื่อ-สกุล:</strong> {selectedUser.name}</p><p className="text-lg"><strong>ตำแหน่ง:</strong> {selectedUser.position} <strong>สังกัด:</strong> {selectedUser.department || '-'}</p></div>{portfolioReportData.length > 0 ? (<table className="w-full border-collapse border border-black text-sm"><thead><tr className="bg-gray-200"><th className="border border-black p-2 text-center w-16">ลำดับ</th><th className="border border-black p-2 text-left">ชื่อผลงาน / รางวัล</th><th className="border border-black p-2 text-center w-32">ประเภท</th><th className="border border-black p-2 text-center w-40">บทบาท</th></tr></thead><tbody>{portfolioReportData.map((row, index) => (<tr key={row.id}><td className="border border-black p-2 text-center align-top">{index + 1}</td><td className="border border-black p-2 align-top"><span className="font-bold block">{row.title}</span><span className="text-xs text-gray-600">{row.description}</span></td><td className="border border-black p-2 text-center align-top">{row.type}</td><td className="border border-black p-2 text-center align-top">{row.role}</td></tr>))}</tbody></table>) : (<div className="p-10 text-center border border-black border-dashed text-gray-500">-- ไม่พบข้อมูลผลงานในปีการศึกษานี้ --</div>)}<div className="mt-12 flex justify-between px-10"><div className="text-center"><p className="mb-8">ลงชื่อ ....................................................... เจ้าของประวัติ</p><p className="font-bold">( {selectedUser.name} )</p></div><div className="text-center"><p className="mb-8">ลงชื่อ ....................................................... ผู้รับรอง</p><p className="font-bold">( นายพลภัทร ธีระกุล )</p><p>ผู้อำนวยการโรงเรียนบ้านบากัน</p></div></div></div>)}
      </div>
    </div>
  );
};

// --- MAIN APP LOGIC ---
export default function BKSHRApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [usersData, setUsersData] = useState([]);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [customLogo, setCustomLogo] = useState(null);
  
  // Forgot Password State
  const [view, setView] = useState('login'); // 'login' or 'forgot'
  const [forgotEmail, setForgotEmail] = useState('');

  // Leaves, Trainings, Portfolio data for Dashboard
  const [leaves, setLeaves] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => { const setupAuth = async () => { try { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); } else { await signInAnonymously(auth); } } catch(e) { console.error(e) } }; setupAuth(); return onAuthStateChanged(auth, (user) => user && setAuthUser(user)); }, []);
  
  useEffect(() => { 
    if (!authUser) return; 
    const initData = async () => { 
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'users')); const snapshot = await getDocs(q); 
      
      let fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (fetchedUsers.length === 0) { 
        // Initial Seed
        for (const user of INITIAL_USERS) { 
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'users'), { ...user, password: DEFAULT_PASSWORD, status: 'active', createdAt: serverTimestamp() }); 
        } 
        window.location.reload(); 
      } else { 
        // Auto-Sync: Check for missing users in INITIAL_USERS and add them
        const existingUsernames = fetchedUsers.map(u => u.username);
        let hasNewUser = false;
        
        for (const user of INITIAL_USERS) {
          if (!existingUsernames.includes(user.username)) {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'users'), { ...user, password: DEFAULT_PASSWORD, status: 'active', createdAt: serverTimestamp() });
            hasNewUser = true;
          }
        }

        if (hasNewUser) {
           // Re-fetch if new users were added
           const updatedSnap = await getDocs(q);
           setUsersData(updatedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
           setUsersData(fetchedUsers); 
        }
      } 
      
      // Subscribe to other collections for dashboard
      onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'leaves')), (snap) => setLeaves(snap.docs.map(d => d.data())));
      onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'trainings')), (snap) => setTrainings(snap.docs.map(d => d.data())));
      onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'portfolio')), (snap) => setPortfolio(snap.docs.map(d => d.data())));
      
      // Check for saved custom logo in localStorage (as a quick fix for current user)
      const savedLogo = localStorage.getItem(`bks_logo_${appId}`);
      if(savedLogo) setCustomLogo(savedLogo);

      setLoading(false); 
    }; 
    initData(); 
  }, [authUser]);

  const showToast = (message, type = 'success') => setToast({ message, type });
  
  const handleLogin = (e) => { e.preventDefault(); const user = usersData.find(u => (u.username === loginForm.user || u.name === loginForm.user) && u.password === loginForm.pass && u.status !== 'disabled'); if (user) { setCurrentUser(user); setActiveTab('dashboard'); showToast(`ยินดีต้อนรับ ${user.name}`); } else { showToast("รหัสผ่านไม่ถูกต้อง", 'error'); } };
  
  const handleForgotPassword = (e) => {
    e.preventDefault();
    const user = usersData.find(u => u.username === forgotEmail || u.email === forgotEmail);
    if (user && user.email) {
      showToast(`ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${user.email} เรียบร้อยแล้ว (จำลอง)`, 'success');
      setTimeout(() => setView('login'), 2000);
    } else if (user) {
      showToast(`ผู้ใช้ ${user.name} ยังไม่ได้ลงทะเบียนอีเมลในระบบ กรุณาติดต่อ Admin`, 'error');
    } else {
      showToast('ไม่พบข้อมูลผู้ใช้ในระบบ', 'error');
    }
  };

  const handleUpdateUser = async (uid, data) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', uid), data); showToast("บันทึกสำเร็จ"); const updatedUser = { ...currentUser, ...data }; if (currentUser.id === uid) setCurrentUser(updatedUser); setUsersData(prev => prev.map(u => u.id === uid ? { ...u, ...data } : u)); };
  const handleResetPassword = async (user) => { if(!confirm(`รีเซ็ตรหัสผ่าน ${user.name} เป็น ${DEFAULT_PASSWORD}?`)) return; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.id), { password: DEFAULT_PASSWORD }); showToast("รีเซ็ตรหัสเรียบร้อย"); };
  const handleAddUser = async (newUser) => { if(usersData.some(u => u.username === newUser.username)) return showToast("Username ซ้ำ", 'error'); const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'users'), { ...newUser, createdAt: serverTimestamp() }); setUsersData([...usersData, { id: docRef.id, ...newUser }]); showToast("เพิ่มผู้ใช้สำเร็จ"); };

  // Function to handle logo upload manually
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogo(reader.result);
        localStorage.setItem(`bks_logo_${appId}`, reader.result); // Save to local storage for persistence on this device
        showToast("อัปเดตโลโก้เรียบร้อย (เฉพาะเครื่องนี้)");
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading BKS-HR...</div>;
  if (!currentUser) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4"> 
      {toast && <Toast {...toast} onClose={() => setToast(null)} />} 
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-up relative group"> 
        <div className="text-center mb-8"> 
          <div className="relative inline-block">
            <img 
              src={customLogo || DRIVE_THUMBNAIL_URL} 
              onError={(e) => { e.target.onerror = null; e.target.src = LOGO_FALLBACK; }}
              alt="BKS Logo" 
              className="w-24 h-24 object-contain mx-auto mb-4 drop-shadow-xl" 
            />
            <label className="absolute bottom-0 right-0 bg-white shadow-md p-1 rounded-full cursor-pointer hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="เปลี่ยนโลโก้ (เฉพาะเครื่องนี้)">
              <Camera size={14} className="text-gray-600"/>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ระบบ BKS-HR</h1> 
          <p className="text-gray-500 text-sm">โรงเรียนบ้านบากัน</p> 
        </div> 
        
        {view === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4"> 
            <input className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Username" value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value})} /> 
            <input type="password" className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Password" value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})} /> 
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">เข้าสู่ระบบ</button> 
            <div className="text-center">
              <button type="button" onClick={() => setView('forgot')} className="text-sm text-blue-500 hover:underline">ลืมรหัสผ่าน?</button>
            </div>
          </form> 
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <h3 className="font-bold text-gray-700">รีเซ็ตรหัสผ่าน</h3>
              <p className="text-xs text-gray-500">กรอก Username หรือ Email เพื่อรับลิงก์</p>
            </div>
            <input className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Username หรือ Email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required /> 
            <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg">ส่งลิงก์รีเซ็ต</button> 
            <div className="text-center">
              <button type="button" onClick={() => setView('login')} className="text-sm text-gray-500 hover:text-gray-700">กลับไปหน้าเข้าสู่ระบบ</button>
            </div>
          </form>
        )}
      </div> 
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800"> {toast && <Toast {...toast} onClose={() => setToast(null)} />} <Sidebar user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setCurrentUser(null)} isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} customLogo={customLogo} /> <main className="flex-1 flex flex-col h-screen overflow-hidden"> <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0"> <div className="flex items-center gap-3"> <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><Menu size={24}/></button> <h1 className="font-bold text-lg hidden sm:block">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1> </div> <div className="flex items-center gap-3"> <span className="text-sm font-medium text-gray-600 hidden sm:block">{currentUser.name}</span> {currentUser.photoURL ? (<img src={currentUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover" />) : (<div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">{currentUser.name.charAt(0)}</div>)} </div> </header> <div className="flex-1 overflow-y-auto p-4 lg:p-8"> <div className="max-w-7xl mx-auto min-h-[calc(100vh-120px)] flex flex-col"> 
      <div className="flex-1">
        {activeTab === 'dashboard' && <DashboardModule user={currentUser} leaves={leaves} trainings={trainings} portfolio={portfolio} setActiveTab={setActiveTab} usersData={usersData} />} 
        {activeTab === 'users' && currentUser.role === 'Super Admin' && <UserManagement usersData={usersData} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onResetPassword={handleResetPassword} />} 
        {activeTab === 'leaves' && (currentUser.role === 'Super Admin' || currentUser.role === 'Admin HR') && <LeaveModule currentUser={currentUser} usersData={usersData} authUser={authUser} showToast={showToast} />} 
        {activeTab === 'salary' && (currentUser.role === 'Super Admin' || currentUser.role === 'Admin HR') && <SalaryModule usersData={usersData} onUpdateUser={handleUpdateUser} showToast={showToast} />}
        {activeTab === 'report' && (currentUser.role === 'Super Admin' || currentUser.role === 'Admin HR') && <ReportModule usersData={usersData} authUser={authUser} />}
        {activeTab === 'profile' && <ProfileModule currentUser={currentUser} onUpdateProfile={handleUpdateUser} showToast={showToast} />} 
        {activeTab === 'training' && <TrainingModule currentUser={currentUser} authUser={authUser} showToast={showToast} usersData={usersData} />} 
        {activeTab === 'portfolio' && <PortfolioModule currentUser={currentUser} authUser={authUser} showToast={showToast} />} 
      </div>
      <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">เว็บแอพ BKS-HR พัฒนาโดย นายพลภัทร ธีระกุล ผู้อำนวยการโรงเรียนบ้านบากัน</div>
    </div> </div> </main> </div>
  );
}