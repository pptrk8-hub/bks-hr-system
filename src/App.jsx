import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, query, onSnapshot, 
  serverTimestamp, orderBy, where, deleteDoc, doc, updateDoc, setDoc, getDocs 
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from 'firebase/auth';
import { 
  Calendar, User, FileText, PieChart, 
  Save, AlertCircle, CheckCircle, Upload, Trash2, Clock,
  Lock, LogOut, ShieldCheck, Printer, Menu, X,
  Users, Award, BookOpen, Edit, Settings, Search, Bell, ChevronRight, Briefcase, Plus, Filter, Eye, Camera, BarChart2, Link as LinkIcon, File, DollarSign, Mail, HelpCircle, Database
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

// Use global config if available, otherwise use hardcoded (Safe fallback)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : userFirebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'banbakan-hr-system';

// --- LOGO & ASSETS ---
const DRIVE_THUMBNAIL_URL = "https://drive.google.com/thumbnail?id=1b8Ep2pW70A3Ig-4ILoosQ78Kb73hx81t&sz=w1000";
const LOGO_FALLBACK = "https://via.placeholder.com/150/000033/ffffff?text=BKS+HR"; // Use simple fallback to avoid huge base64 string in code
const GARUDA_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Garuda_Emblem_of_Thailand.svg/1200px-Garuda_Emblem_of_Thailand.svg.png";

// --- 2. CONSTANTS & DATA ---
const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const THAI_MONTHS_FULL = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

// Initial Seed Data (ข้อมูลตั้งต้น)
const INITIAL_USERS = [
  { name: "นายพลภัทร ธีระกุล", role: 'Super Admin', position: 'ผู้อำนวยการโรงเรียน', username: 'phonlaphat', department: 'บริหาร', tel: '', email: 'phonlaphat@bks.ac.th', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวทิพวรรณ ศรีทองแก้ว", role: 'Super Admin', position: 'รองผู้อำนวยการโรงเรียน', username: 'tippawan', department: 'บริหาร', tel: '', email: 'tippawan@bks.ac.th', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสุมาลี บุญชู", role: 'Admin HR', position: 'ครู (เจ้าหน้าที่บุคคล)', username: 'sumalee', department: 'บุคคล', tel: '', email: 'sumalee@bks.ac.th', salary: 0, academic: 0, backPay: 0 },
  { name: "นางรอยฮัน โต๊ะดำ", role: 'User', position: 'ครู', username: 'royhan', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวจุฑาภรณ์ อุมาสะ", role: 'User', position: 'ครู', username: 'jutaporn', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
  { name: "นางสาวจันทนา บุตรฤทธิ์", role: 'User', position: 'ครู', username: 'jantana', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0, backPay: 0 },
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
// Fix Timezone Issue: strip time component to avoid shifting dates
const getLocalISOString = (dateStr) => {
    if (!dateStr) return "";
    return dateStr; // Assuming input from date picker is already YYYY-MM-DD
};

const getCycleInfo = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return { cycle: 1, year: new Date().getFullYear(), label: '-' };
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  if (month >= 3 && month <= 8) return { cycle: 1, year: year, label: `รอบที่ 1 (เม.ย. - ก.ย. ${year + 543})` };
  else {
    let fiscalYear = month >= 9 ? year + 1 : year;
    return { cycle: 2, year: fiscalYear, label: `รอบที่ 2 (ต.ค. - มี.ค. ${fiscalYear + 543})` };
  }
};

const calculateDays = (start, end, type) => {
  if (!start || !end) return 0;
  if (type === 'half_day') return 0.5;
  if (type === 'late') return 0;
  
  // Reset time to noon to avoid timezone shift
  const s = new Date(start); s.setHours(12,0,0,0);
  const e = new Date(end); e.setHours(12,0,0,0);
  
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0; 
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1; 
};

const formatDateThai = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-"; 
  return `${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`;
};

const formatCurrency = (amount) => {
  if (isNaN(amount)) return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(0);
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount || 0);
};

// --- 4. UI COMPONENTS (Modal, Toast, StatCard) ---
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
  return (
    <div className={`fixed top-4 right-4 ${bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-bounce`}>
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

// Sidebar Component
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
            </button>
          ))}
        </div>
        <div className="p-4 bg-slate-950/50">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-inner">{user.name.charAt(0)}</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-white">{user.name}</p>
              <p className="text-[10px] text-slate-300 truncate">{user.position}</p>
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
  const currentCycle = getCycleInfo(new Date());
  const myLeaves = leaves.filter(l => l.staffId === user.id && l.cycle === currentCycle.cycle && l.fiscalYear === currentCycle.year);
  
  // Logic Fix: Count all except late for times, Exclude religious from days
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
    totalTimes, totalDaysUsed, religiousDays, lateCount,
    trainingHours: trainings.filter(t => t.userId === user.id).reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0),
    portfolioCount: portfolio.filter(p => p.userId === user.id).length
  };

  const QUOTAS = { times: 6, days: 25 };
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthLeaves = leaves.filter(l => {
    if (!l.startDate) return false;
    const d = new Date(l.startDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const leaveStats = LEAVE_TYPES.map(type => ({
    ...type, count: currentMonthLeaves.filter(l => l.leaveType === type.id).length
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">ระบบสารสนเทศบริหารงานบุคคล โรงเรียนบ้านบากัน</h2>
      {/* My Stats Section */}
      <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
        <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center">
          <h3 className="font-bold text-indigo-900 flex items-center gap-2"><User size={20} /> ข้อมูลของฉัน ({currentCycle.label})</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
               <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">สิทธิ์การลาคงเหลือ</h4>
               <div>
                 <div className="flex justify-between text-sm mb-1"><span>จำนวนครั้งที่ใช้</span><span className={`font-bold ${myStats.totalTimes > QUOTAS.times ? 'text-red-600' : 'text-gray-700'}`}>{myStats.totalTimes} / {QUOTAS.times} ครั้ง</span></div>
                 <div className="w-full bg-gray-100 rounded-full h-2"><div className={`h-2 rounded-full transition-all ${myStats.totalTimes > QUOTAS.times ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((myStats.totalTimes / QUOTAS.times) * 100, 100)}%` }}></div></div>
               </div>
               <div>
                 <div className="flex justify-between text-sm mb-1"><span>จำนวนวันที่ใช้</span><span className={`font-bold ${myStats.totalDaysUsed > QUOTAS.days ? 'text-red-600' : 'text-gray-700'}`}>{myStats.totalDaysUsed} / {QUOTAS.days} วัน</span></div>
                 <div className="w-full bg-gray-100 rounded-full h-2"><div className={`h-2 rounded-full transition-all ${myStats.totalDaysUsed > QUOTAS.days ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${Math.min((myStats.totalDaysUsed / QUOTAS.days) * 100, 100)}%` }}></div></div>
               </div>
               <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-purple-50 p-2 rounded-lg border border-purple-100 text-center"><span className="text-xs text-purple-600 block">ลาศาสนา</span><span className="font-bold text-purple-800">{myStats.religiousDays} วัน</span></div>
                  <div className="bg-red-50 p-2 rounded-lg border border-red-100 text-center"><span className="text-xs text-red-600 block">มาสาย</span><span className="font-bold text-red-800">{myStats.lateCount} ครั้ง</span></div>
               </div>
            </div>
            {/* Other Stats */}
            <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-xl border border-green-100">
               <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2"><BookOpen size={24} /></div>
               <h4 className="font-bold text-gray-700">การอบรมสะสม</h4>
               <p className="text-3xl font-bold text-green-700 my-1">{myStats.trainingHours}</p>
               <span className="text-xs text-gray-500">ชั่วโมง</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-xl border border-purple-100">
               <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2"><Award size={24} /></div>
               <h4 className="font-bold text-gray-700">ผลงานสะสม</h4>
               <p className="text-3xl font-bold text-purple-700 my-1">{myStats.portfolioCount}</p>
               <span className="text-xs text-gray-500">รายการ</span>
            </div>
        </div>
      </div>
      
      {/* School Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="บุคลากรทั้งหมด" value={usersData.length} unit="คน" icon={Users} color="bg-indigo-100" />
        <StatCard title="วันลา (ปีนี้)" value={leaves.length} unit="วัน" icon={Calendar} color="bg-blue-100" />
        <StatCard title="อบรม (สะสม)" value={trainings.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0)} unit="ชม." icon={BookOpen} color="bg-green-100" />
        <StatCard title="ผลงาน (สะสม)" value={portfolio.length} unit="ชิ้น" icon={Award} color="bg-purple-100" />
      </div>

      {/* Quick Actions & Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Briefcase size={18} className="text-blue-500"/> เมนูลัด</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
             {user.role !== 'User' && (
               <>
                 <button onClick={() => setActiveTab('leaves')} className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl flex flex-col items-center gap-2 border border-blue-100"><Calendar size={16}/><span className="text-xs font-medium">วันลา</span></button>
                 <button onClick={() => setActiveTab('salary')} className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl flex flex-col items-center gap-2 border border-teal-100"><DollarSign size={16}/><span className="text-xs font-medium">เงินเดือน</span></button>
                 <button onClick={() => setActiveTab('report')} className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl flex flex-col items-center gap-2 border border-gray-200"><Printer size={16}/><span className="text-xs font-medium">รายงาน</span></button>
               </>
             )}
             <button onClick={() => setActiveTab('training')} className="p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl flex flex-col items-center gap-2 border border-green-100"><BookOpen size={16}/><span className="text-xs font-medium">อบรม</span></button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
           <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart2 size={18} className="text-pink-500"/> สถิติการลา (เดือนนี้)</h3>
           <div className="space-y-3">
             {leaveStats.map(type => (
               <div key={type.id} className="flex items-center gap-3">
                 <div className="w-24 text-xs text-gray-500 text-right truncate">{type.label}</div>
                 <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${type.barColor}`} style={{ width: `${Math.min(type.count * 10, 100)}%` }}></div></div>
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
  const totalBudget = usersData.reduce((acc, curr) => acc + (Number(curr.salary) || 0) + (Number(curr.academic) || 0) + (Number(curr.backPay) || 0), 0);
  
  const handleEdit = (user) => { 
    setCurrentUserEdit(user); 
    setFormData({ salary: user.salary || 0, academic: user.academic || 0, backPay: user.backPay || 0 }); 
    setIsModalOpen(true); 
  };
  
  const handleSave = () => { 
    onUpdateUser(currentUserEdit.id, { salary: Number(formData.salary), academic: Number(formData.academic), backPay: Number(formData.backPay) }); 
    setIsModalOpen(false); 
    showToast("อัปเดตข้อมูลเงินเดือนเรียบร้อย", 'success'); 
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-700 to-teal-600 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
        <div><h3 className="text-green-100 font-medium mb-1">ยอดรวมงบประมาณจ่าย (เดือนนี้)</h3><p className="text-4xl font-bold">{formatCurrency(totalBudget)}</p></div>
        <div className="bg-white/20 p-4 rounded-full"><DollarSign size={32} /></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><DollarSign className="text-green-600"/> จัดการข้อมูลเงินเดือน</h2>
          <div className="relative w-64"><Search className="absolute left-3 top-2.5 text-gray-400" size={18}/><input type="text" placeholder="ค้นหาชื่อ..." className="w-full pl-10 p-2 bg-gray-50 border rounded-lg" value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold"><tr><th className="p-3">ชื่อ-สกุล</th><th className="p-3">ตำแหน่ง</th><th className="p-3 text-right">เงินเดือน</th><th className="p-3 text-right">วิทยฐานะ</th><th className="p-3 text-right">ตกเบิก</th><th className="p-3 text-right text-green-700">สุทธิ</th><th className="p-3 text-center">แก้ไข</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(u => {
                 const total = (Number(u.salary)||0) + (Number(u.academic)||0) + (Number(u.backPay)||0);
                 return (
                  <tr key={u.id} className="hover:bg-green-50/30">
                    <td className="p-3 font-medium">{u.name}</td><td className="p-3 text-gray-500">{u.position}</td>
                    <td className="p-3 text-right">{formatCurrency(u.salary)}</td><td className="p-3 text-right">{formatCurrency(u.academic)}</td><td className="p-3 text-right text-orange-600">{formatCurrency(u.backPay)}</td>
                    <td className="p-3 text-right font-bold text-green-700">{formatCurrency(total)}</td>
                    <td className="p-3 text-center"><button onClick={() => handleEdit(u)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-blue-50 hover:text-blue-600"><Edit size={16}/></button></td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="แก้ไขข้อมูลเงินเดือน">
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded border"><p className="font-bold text-gray-800">{currentUserEdit?.name}</p><p className="text-xs text-gray-500">{currentUserEdit?.position}</p></div>
          <div><label className="block text-sm font-medium mb-1">เงินเดือน</label><input type="number" className="w-full p-2 border rounded" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">วิทยฐานะ</label><input type="number" className="w-full p-2 border rounded" value={formData.academic} onChange={e => setFormData({...formData, academic: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">ตกเบิก</label><input type="number" className="w-full p-2 border rounded" value={formData.backPay} onChange={e => setFormData({...formData, backPay: e.target.value})} /></div>
          <div className="pt-2 border-t flex justify-between items-center"><span className="text-sm font-bold">รวมทั้งสิ้น</span><span className="text-lg font-bold text-green-600">{formatCurrency(Number(formData.salary) + Number(formData.academic) + Number(formData.backPay))}</span></div>
          <button onClick={handleSave} className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">บันทึก</button>
        </div>
      </Modal>
    </div>
  );
};

// User Management Module
const UserManagement = ({ usersData, onAddUser, onUpdateUser, showToast }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  
  const openAdd = () => { 
    setIsEditMode(false); 
    // In this specific version, we simulate password for UI but don't store plain text
    setFormData({ name: '', username: '', role: 'User', position: 'ครู', department: '', tel: '', email: '', status: 'active' }); 
    setIsModalOpen(true); 
  };
  
  const openEdit = (user) => { setIsEditMode(true); setFormData(user); setIsModalOpen(true); };
  
  const handleSubmit = (e) => { 
    e.preventDefault(); 
    if (isEditMode) {
        onUpdateUser(formData.id, formData);
        showToast("แก้ไขผู้ใช้สำเร็จ", "success");
    } else {
        onAddUser(formData);
        showToast("เพิ่มผู้ใช้สำเร็จ (รหัสผ่านเริ่มต้น: 1234)", "success");
    }
    setIsModalOpen(false); 
  };

  const filteredUsers = usersData.filter(u => u.name.includes(search) || u.username?.includes(search));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-blue-600"/> จัดการผู้ใช้</h2>
        <div className="flex gap-2"><div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={18}/><input type="text" placeholder="ค้นหา..." className="pl-10 p-2 bg-gray-50 border rounded-lg" value={search} onChange={e => setSearch(e.target.value)} /></div><button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"><Plus size={18}/> เพิ่มผู้ใช้</button></div>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 uppercase font-bold"><tr><th className="p-3">ชื่อ-สกุล</th><th className="p-3">Username</th><th className="p-3">ตำแหน่ง</th><th className="p-3">สิทธิ์</th><th className="p-3">จัดการ</th></tr></thead>
        <tbody>
          {filteredUsers.map(u => (
            <tr key={u.id} className="hover:bg-blue-50/50">
              <td className="p-3 flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{u.name?.charAt(0)}</div>{u.name}</td>
              <td className="p-3 text-gray-500">{u.username || '-'}</td>
              <td className="p-3">{u.position}</td>
              <td className="p-3"><span className={`px-2 py-1 rounded text-xs border ${u.role === 'Super Admin' ? 'bg-purple-50 text-purple-700' : 'bg-gray-50'}`}>{u.role}</span></td>
              <td className="p-3"><button onClick={() => openEdit(u)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit size={16}/></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}>
        <form onSubmit={handleSubmit} className="space-y-3">
            <div><label className="text-xs font-bold text-gray-500">ชื่อ-สกุล</label><input className="w-full p-2 border rounded" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-500">Username</label><input className="w-full p-2 border rounded" required disabled={isEditMode} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-500">ตำแหน่ง</label><input className="w-full p-2 border rounded" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-500">สิทธิ์</label><select className="w-full p-2 border rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}><option value="User">User</option><option value="Admin HR">Admin HR</option><option value="Super Admin">Super Admin</option></select></div>
            <button className="w-full bg-blue-600 text-white py-2 rounded font-bold mt-4">บันทึก</button>
        </form>
      </Modal>
    </div>
  );
};

// Profile Module
const ProfileModule = ({ currentUser, onUpdateProfile, showToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(currentUser);
  const [preview, setPreview] = useState(currentUser.photoURL || null);
  
  const handleFileChange = (e) => { 
    const file = e.target.files[0]; 
    if (file) { 
        if (file.size > 500000) { alert("ขนาดไฟล์ภาพต้องไม่เกิน 500KB"); return; }
        const reader = new FileReader(); 
        reader.onloadend = () => { setPreview(reader.result); setFormData({ ...formData, photoURL: reader.result }); }; 
        reader.readAsDataURL(file); 
    } 
  };
  
  const handleSave = () => { onUpdateProfile(currentUser.id, formData); setIsEditing(false); showToast("บันทึกโปรไฟล์เรียบร้อย", "success"); };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8">
            <div className="relative -mt-12 mb-6 flex justify-between items-end">
                <div className="relative group">
                    <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg overflow-hidden">
                        {preview ? <img src={preview} alt="Profile" className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><User size={48} /></div>}
                    </div>
                    {isEditing && <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-md"><Camera size={16} /><input type="file" className="hidden" accept="image/*" onChange={handleFileChange} /></label>}
                </div>
                {!isEditing ? <button onClick={() => setIsEditing(true)} className="bg-white border text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">แก้ไขโปรไฟล์</button> : <div className="flex gap-2"><button onClick={() => { setIsEditing(false); setFormData(currentUser); setPreview(currentUser.photoURL); }} className="px-4 py-2 text-sm text-gray-600">ยกเลิก</button><button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">บันทึก</button></div>}
            </div>
            <div className="space-y-6">
                <div><h2 className="text-2xl font-bold">{formData.name}</h2><p className="text-gray-500">{formData.position} • {formData.department || 'ไม่ระบุสังกัด'}</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                    <div><label className="text-xs font-bold text-gray-500">เบอร์โทรศัพท์</label>{isEditing ? <input className="w-full p-2 border rounded" value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} /> : <p>{currentUser.tel || '-'}</p>}</div>
                    <div><label className="text-xs font-bold text-gray-500">อีเมล</label>{isEditing ? <input className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /> : <p>{currentUser.email || '-'}</p>}</div>
                </div>
            </div>
        </div>
    </div>
  );
};

// Leave Module
const LeaveModule = ({ currentUser, usersData, authUser, showToast }) => {
  const [leaves, setLeaves] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [selectedUserFilter, setSelectedUserFilter] = useState('');
  const [form, setForm] = useState({ staffId: '', type: 'sick', start: '', end: '', reason: '', evidenceImage: null, daysCount: 0 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { 
      if (!authUser) return; 
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'leaves'), orderBy('createdAt', 'desc')); 
      const unsub = onSnapshot(q, (snap) => setLeaves(snap.docs.map(d => ({id: d.id, ...d.data()})))); 
      return () => unsub(); 
  }, [authUser]);
  
  // Logic Fix: Calculate days safely
  useEffect(() => {
    if (form.start && form.end && !isEditMode) {
       setForm(prev => ({...prev, daysCount: calculateDays(form.start, form.end, form.type)}));
    }
  }, [form.start, form.end, form.type]);

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    if(!form.staffId || !form.start || !form.end) return showToast("กรุณากรอกข้อมูล", 'error'); 
    
    const staff = usersData.find(u => u.id === form.staffId); 
    const cycle = getCycleInfo(new Date(form.start)); 
    const leaveData = { 
      staffId: staff.id, staffName: staff.name, leaveType: form.type, 
      startDate: getLocalISOString(form.start), endDate: getLocalISOString(form.end), 
      reason: form.reason, daysCount: Number(form.daysCount), cycle: cycle.cycle, 
      fiscalYear: cycle.year, cycleLabel: cycle.label, recordedBy: currentUser.name 
    };

    if (isEditMode && editingId) {
       await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leaves', editingId), leaveData);
       showToast("แก้ไขข้อมูลเรียบร้อย", 'success');
    } else {
       await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leaves'), { ...leaveData, createdAt: serverTimestamp() }); 
       showToast("บันทึกวันลาสำเร็จ", 'success'); 
    }
    setViewMode('list'); setIsEditMode(false); setForm({ staffId: '', type: 'sick', start: '', end: '', reason: '', evidenceImage: null, daysCount: 0 });
  };
  
  const handleDelete = async (id) => { if(confirm("ลบรายการนี้?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leaves', id)); };

  const filteredLeaves = selectedUserFilter ? leaves.filter(l => l.staffId === selectedUserFilter) : leaves;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Calendar className="text-blue-600"/> จัดการวันลา</h2>
          <button onClick={() => { setViewMode(viewMode === 'list' ? 'form' : 'list'); setIsEditMode(false); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">{viewMode === 'list' ? '+ บันทึกวันลา' : 'ดูประวัติ'}</button>
      </div>
      {viewMode === 'form' ? (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
           <div><label>เลือกบุคลากร</label><select className="w-full p-2 border rounded" value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})}><option value="">-- เลือก --</option>{usersData.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
           <div><label>ประเภท</label><select className="w-full p-2 border rounded" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>{LEAVE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
           <div className="grid grid-cols-2 gap-4"><div><label>เริ่ม</label><input type="date" className="w-full p-2 border rounded" value={form.start} onChange={e => setForm({...form, start: e.target.value})} /></div><div><label>ถึง</label><input type="date" className="w-full p-2 border rounded" value={form.end} onChange={e => setForm({...form, end: e.target.value})} /></div></div>
           <div><label className="flex justify-between"><span>จำนวนวัน</span>{currentUser.role === 'Super Admin' && <span className="text-xs text-orange-500">*แก้ไขได้เฉพาะ Admin</span>}</label><input type="number" step="0.5" className="w-full p-2 border rounded bg-gray-50" value={form.daysCount} onChange={e => setForm({...form, daysCount: e.target.value})} readOnly={currentUser.role !== 'Super Admin'} /></div>
           <button className="w-full bg-blue-600 text-white py-2 rounded font-bold">{isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}</button>
        </form>
      ) : (
        <div>
            <div className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg mb-4"><Filter size={16}/><select className="bg-transparent w-full text-sm" value={selectedUserFilter} onChange={e => setSelectedUserFilter(e.target.value)}><option value="">ดูทั้งหมด</option>{usersData.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50"><tr><th className="p-3">ชื่อ</th><th className="p-3">ประเภท</th><th className="p-3">วันที่</th><th className="p-3">จำนวน</th>{currentUser.role === 'Super Admin' && <th className="p-3">จัดการ</th>}</tr></thead>
                <tbody>{filteredLeaves.map(l => (<tr key={l.id} className="border-b"><td className="p-3">{l.staffName}</td><td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${LEAVE_TYPES.find(t=>t.id===l.leaveType)?.color}`}>{LEAVE_TYPES.find(t=>t.id===l.leaveType)?.label}</span></td><td className="p-3 text-gray-500">{formatDateThai(l.startDate)} - {formatDateThai(l.endDate)}</td><td className="p-3">{l.daysCount} วัน</td>{currentUser.role === 'Super Admin' && <td className="p-3 flex gap-2"><button onClick={() => { setForm({staffId: l.staffId, type: l.leaveType, start: l.startDate, end: l.endDate, reason: l.reason, daysCount: l.daysCount}); setEditingId(l.id); setIsEditMode(true); setViewMode('form'); }}><Edit size={16}/></button><button onClick={() => handleDelete(l.id)} className="text-red-600"><Trash2 size={16}/></button></td>}</tr>))}</tbody>
            </table>
        </div>
      )}
    </div>
  );
};

// Training & Portfolio Modules (Simplified for brevity, assuming standard CRUD logic)
const TrainingModule = ({ currentUser, authUser, showToast, usersData }) => {
    const [trainings, setTrainings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ topic: '', org: '', startDate: '', endDate: '', hours: 0, type: 'On-site' });
    
    useEffect(() => { if (!authUser) return; const unsub = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'trainings')), (snap) => setTrainings(snap.docs.map(d => ({id: d.id, ...d.data()})))); return () => unsub(); }, [authUser]);
    
    const addTraining = async (e) => { e.preventDefault(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'trainings'), { ...form, userId: currentUser.id, userName: currentUser.name, createdAt: serverTimestamp() }); showToast("บันทึกแล้ว"); setIsModalOpen(false); };
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="text-green-600"/> ประวัติการอบรม</h2><button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">+ เพิ่มรายการ</button></div>
            <div className="space-y-3">{trainings.filter(t => t.userId === currentUser.id).map(t => (<div key={t.id} className="p-4 border border-green-100 bg-green-50/30 rounded-xl flex justify-between"><div><h4 className="font-bold">{t.topic}</h4><p className="text-sm">{t.org}</p></div><span className="font-bold text-green-700">{t.hours} ชม.</span></div>))}</div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="เพิ่มการอบรม"><form onSubmit={addTraining} className="space-y-3"><div><label>หลักสูตร</label><input className="w-full p-2 border rounded" required onChange={e=>setForm({...form, topic: e.target.value})} /></div><div><label>หน่วยงาน</label><input className="w-full p-2 border rounded" required onChange={e=>setForm({...form, org: e.target.value})} /></div><div className="flex gap-2"><input type="number" className="w-full p-2 border rounded" placeholder="ชั่วโมง" required onChange={e=>setForm({...form, hours: e.target.value})} /></div><button className="w-full bg-green-600 text-white py-2 rounded">บันทึก</button></form></Modal>
        </div>
    );
};

const PortfolioModule = ({ currentUser, authUser, showToast }) => {
    const [items, setItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', year: new Date().getFullYear() + 543, type: 'รางวัล', role: 'เจ้าของผลงาน' });
    
    useEffect(() => { if (!authUser) return; const unsub = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'portfolio')), (snap) => setItems(snap.docs.map(d => ({id: d.id, ...d.data()})).filter(i => i.userId === currentUser.id))); return () => unsub(); }, [authUser]);
    
    const addItem = async (e) => { e.preventDefault(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'portfolio'), { ...form, userId: currentUser.id, createdAt: serverTimestamp() }); showToast("บันทึกแล้ว"); setIsModalOpen(false); };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2"><Award className="text-purple-600"/> แฟ้มผลงาน</h2><button onClick={() => setIsModalOpen(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">+ เพิ่มผลงาน</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{items.map(t => (<div key={t.id} className="p-4 border border-purple-100 bg-purple-50/30 rounded-xl"><h4 className="font-bold">{t.title}</h4><p className="text-xs text-gray-500">{t.role} ({t.year})</p></div>))}</div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="เพิ่มผลงาน"><form onSubmit={addItem} className="space-y-3"><div><label>ชื่อผลงาน</label><input className="w-full p-2 border rounded" required onChange={e=>setForm({...form, title: e.target.value})} /></div><div className="flex gap-2"><input className="w-full p-2 border rounded" placeholder="ปี พ.ศ." required onChange={e=>setForm({...form, year: e.target.value})} /></div><button className="w-full bg-purple-600 text-white py-2 rounded">บันทึก</button></form></Modal>
        </div>
    );
};

// Report Module
const ReportModule = ({ usersData, authUser }) => {
  const [activeReport, setActiveReport] = useState('leave');
  const [leaves, setLeaves] = useState([]);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  useEffect(() => { 
      if (!authUser) return; 
      const unsub = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'leaves')), (snap) => setLeaves(snap.docs.map(d => ({id: d.id, ...d.data()})))); 
      return () => unsub(); 
  }, [authUser]);

  // FIX: sortedUsers Moved inside useMemo or ensure usersData is ready
  const sortedUsers = useMemo(() => {
    return [...usersData].sort((a, b) => {
      const getPriority = (user) => {
        const pos = user.position || '';
        if (pos.includes('ผู้อำนวยการโรงเรียน') && !pos.includes('รอง')) return 1;
        if (pos.includes('รองผู้อำนวยการ')) return 2;
        if (user.role === 'Admin HR' || pos.includes('บุคคล')) return 3;
        return 4;
      };
      return getPriority(a) - getPriority(b);
    });
  }, [usersData]);

  const leaveSummaryData = useMemo(() => {
    const reportDateObj = new Date(reportYear, reportMonth, 1);
    const reportCycleInfo = getCycleInfo(reportDateObj);
    const cycleLeaves = leaves.filter(l => l.cycle === reportCycleInfo.cycle && l.fiscalYear === reportCycleInfo.year);
    
    const summary = sortedUsers.map(staff => {
      const staffLeaves = cycleLeaves.filter(l => l.staffName === staff.name);
      const totals = { name: staff.name, sick: 0, personal: 0, half_day: 0, maternity: 0, religious: 0, late: 0, totalDays: 0, totalTimes: 0 };
      staffLeaves.forEach(l => {
         const days = Number(l.daysCount) || 0;
         totals.totalDays += (l.leaveType !== 'religious' && l.leaveType !== 'late') ? days : 0;
         if (['sick', 'personal', 'religious'].includes(l.leaveType)) totals.totalTimes += 1;
         if (l.leaveType === 'sick') totals.sick += days;
         else if (l.leaveType === 'personal') totals.personal += days;
         else if (l.leaveType === 'late') totals.late += 1;
         // Add other types as needed
      });
      return totals;
    });
    return { cycleLabel: reportCycleInfo.label, summary };
  }, [leaves, reportMonth, reportYear, sortedUsers]);

  const handlePrint = () => window.print();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:shadow-none print:border-none">
       <div className="no-print mb-6 border-b pb-4"><h3 className="font-bold text-gray-700 mb-3">พิมพ์รายงาน</h3><div className="flex gap-2"><button onClick={() => setActiveReport('leave')} className={`px-4 py-2 rounded-lg ${activeReport==='leave'?'bg-blue-600 text-white':'bg-gray-100'}`}>รายงานการลา</button><button onClick={() => setActiveReport('salary')} className={`px-4 py-2 rounded-lg ${activeReport==='salary'?'bg-teal-600 text-white':'bg-gray-100'}`}>บัญชีถือจ่าย</button><button onClick={handlePrint} className="ml-auto bg-blue-900 text-white px-4 py-2 rounded-lg flex gap-2"><Printer size={16}/> พิมพ์</button></div></div>
       
       <div className="print-section max-w-[210mm] mx-auto min-h-[297mm] bg-white text-black p-4">
          {activeReport === 'leave' && (
             <div>
                <div className="text-center mb-6"><img src={GARUDA_URL} className="w-16 mx-auto mb-2" /><h3 className="font-bold text-xl">บันทึกข้อความ</h3><p>เรื่อง รายงานสรุปการลา ({leaveSummaryData.cycleLabel})</p></div>
                <table className="w-full border-collapse border border-black text-xs">
                   <thead><tr className="bg-gray-200"><th className="border border-black p-1">ชื่อ-สกุล</th><th className="border border-black p-1">ป่วย</th><th className="border border-black p-1">กิจ</th><th className="border border-black p-1">รวมวัน</th><th className="border border-black p-1 text-red-600">สาย(ครั้ง)</th></tr></thead>
                   <tbody>{leaveSummaryData.summary.map((s,i) => (<tr key={i}><td className="border border-black p-1">{s.name}</td><td className="border border-black p-1 text-center">{s.sick}</td><td className="border border-black p-1 text-center">{s.personal}</td><td className="border border-black p-1 text-center font-bold bg-gray-50">{s.totalDays}</td><td className="border border-black p-1 text-center text-red-600">{s.late}</td></tr>))}</tbody>
                </table>
             </div>
          )}
          {activeReport === 'salary' && (
             <div>
                 <div className="text-center mb-6"><h3 className="font-bold text-xl">บัญชีถือจ่ายเงินเดือน</h3><p>โรงเรียนบ้านบากัน</p></div>
                 <table className="w-full border-collapse border border-black text-xs">
                   <thead><tr className="bg-gray-200"><th className="border border-black p-1">ชื่อ-สกุล</th><th className="border border-black p-1 text-right">เงินเดือน</th><th className="border border-black p-1 text-right">วิทยฐานะ</th><th className="border border-black p-1 text-right">ตกเบิก</th><th className="border border-black p-1 text-right bg-gray-100">รวมรับสุทธิ</th></tr></thead>
                   <tbody>{sortedUsers.map(u => (<tr key={u.id}><td className="border border-black p-1">{u.name}</td><td className="border border-black p-1 text-right">{formatCurrency(u.salary)}</td><td className="border border-black p-1 text-right">{formatCurrency(u.academic)}</td><td className="border border-black p-1 text-right">{formatCurrency(u.backPay)}</td><td className="border border-black p-1 text-right font-bold bg-gray-50">{formatCurrency((Number(u.salary)||0)+(Number(u.academic)||0)+(Number(u.backPay)||0))}</td></tr>))}</tbody>
                 </table>
             </div>
          )}
       </div>
    </div>
  );
};

// --- 6. MAIN APP COMPONENT ---
const App = () => {
  const [authUser, setAuthUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [leaves, setLeaves] = useState([]);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 1. Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        // Fetch user profile from Firestore based on username mapping or email
        // For simplicity in this demo, we match by email if available, or just fetch all users and find match
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch All Users Data
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsersData(users);
      
      // If logged in, find current user details
      if (authUser && users.length > 0) {
        // Logic: Try to match by email first
        const found = users.find(u => u.email === authUser.email) || users.find(u => u.username === authUser.email?.split('@')[0]);
        setCurrentUser(found || null);
      }
    });
    return () => unsubscribe();
  }, [authUser]);

  // 3. Fetch Leaves for Dashboard (Global)
  useEffect(() => {
      if(!authUser) return;
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'leaves'));
      const unsub = onSnapshot(q, (snap) => setLeaves(snap.docs.map(d => ({id: d.id, ...d.data()})))); 
      return () => unsub();
  }, [authUser]);

  // Helper: Show Toast
  const showToast = (message, type = 'success') => { setToast({ message, type }); };
  const closeToast = () => setToast(null);

  // Helper: Seed Data
  const seedData = async () => {
    if(!confirm("ต้องการติดตั้งข้อมูลตัวอย่างหรือไม่? (ทำครั้งแรกเท่านั้น)")) return;
    try {
        for (const user of INITIAL_USERS) {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'users'), { ...user, status: 'active' });
        }
        showToast("ติดตั้งข้อมูลสำเร็จ! กรุณาล็อกอิน", "success");
    } catch (e) {
        console.error(e);
        showToast("เกิดข้อผิดพลาดในการติดตั้ง", "error");
    }
  };

  // Actions
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      setLoginError("เข้าสู่ระบบไม่สำเร็จ: ตรวจสอบ Email/Password");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  const handleAddUser = async (newUser) => {
      // NOTE: Client-side cannot create other Auth users easily. 
      // We just create Firestore record here. In real app, use Cloud Functions.
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'users'), newUser);
  };

  const handleUpdateUser = async (id, data) => {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), data);
  };

  const handleUpdateProfile = async (id, data) => {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), data);
      setCurrentUser(prev => ({ ...prev, ...data }));
  };

  // --- RENDER ---

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-100"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  // LOGIN SCREEN
  if (!authUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-blue-900 p-8 text-center text-white">
             <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center p-2"><img src={LOGO_FALLBACK} className="w-full" /></div>
             <h1 className="text-2xl font-bold">Banbakan School</h1>
             <p className="text-blue-200">HR Information System</p>
          </div>
          <div className="p-8">
             <form onSubmit={handleLogin} className="space-y-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="admin@bks.ac.th" required /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="••••••" required /></div>
                {loginError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded flex items-center gap-2"><AlertCircle size={16}/> {loginError}</div>}
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">เข้าสู่ระบบ</button>
             </form>
             <div className="mt-6 pt-6 border-t text-center">
                 <button onClick={seedData} className="text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 mx-auto"><Database size={12}/> ติดตั้งข้อมูลตัวอย่าง (สำหรับเริ่มระบบใหม่)</button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN APP LAYOUT
  if (!currentUser) return <div className="h-screen flex flex-col items-center justify-center gap-4"><p>ไม่พบข้อมูลผู้ใช้ในระบบ HR กรุณาติดต่อ Admin</p><button onClick={handleLogout} className="text-red-600 underline">ออกจากระบบ</button></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white h-16 border-b flex items-center justify-between px-4 shrink-0">
           <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2"><Menu /></button>
           <span className="font-bold">BKS-HR</span>
           <div className="w-8"></div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
           <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && <DashboardModule user={currentUser} leaves={leaves} trainings={[]} portfolio={[]} setActiveTab={setActiveTab} usersData={usersData} />}
              {activeTab === 'leaves' && <LeaveModule currentUser={currentUser} usersData={usersData} authUser={authUser} showToast={showToast} />}
              {activeTab === 'salary' && <SalaryModule usersData={usersData} onUpdateUser={handleUpdateUser} showToast={showToast} />}
              {activeTab === 'users' && <UserManagement usersData={usersData} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} showToast={showToast} />}
              {activeTab === 'profile' && <ProfileModule currentUser={currentUser} onUpdateProfile={handleUpdateProfile} showToast={showToast} />}
              {activeTab === 'training' && <TrainingModule currentUser={currentUser} authUser={authUser} showToast={showToast} usersData={usersData} />}
              {activeTab === 'portfolio' && <PortfolioModule currentUser={currentUser} authUser={authUser} showToast={showToast} />}
              {activeTab === 'report' && <ReportModule usersData={usersData} authUser={authUser} />}
           </div>
        </div>
      </main>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      {/* CSS for print/animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        @media print { 
           .no-print { display: none !important; } 
           .print-section { display: block !important; width: 100%; }
           body { background: white; }
           .page-break { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default App;