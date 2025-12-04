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
  Users, Award, BookOpen, Edit, Settings, Search, Bell, ChevronRight, Briefcase
} from 'lucide-react';

// --- 1. CONFIGURATION & SETUP ---

// Config ของจริงสำหรับโรงเรียนบ้านบากัน
const userFirebaseConfig = {
  apiKey: "AIzaSyCUWfe2PT0Eh5xrkEbzg9VaUveCfm8kcKc",
  authDomain: "banbakan-leave-app.firebaseapp.com",
  projectId: "banbakan-leave-app",
  storageBucket: "banbakan-leave-app.firebasestorage.app",
  messagingSenderId: "534178244956",
  appId: "1:534178244956:web:76db277f04c3073dcdb999",
  measurementId: "G-K39C7C08R9"
};

// ระบบเลือก Config อัตโนมัติ (ป้องกัน Error auth-mismatch)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : userFirebaseConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sanitize App ID: ป้องกันชื่อ path ผิดพลาด
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'banbakan-hr-system';
const appId = rawAppId.replace(/\//g, '_').replace(/\./g, '-');

// --- 2. CONSTANTS & DATA ---
const DEFAULT_PASSWORD = '1234';
const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const THAI_MONTHS_FULL = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

const INITIAL_USERS = [
  { name: "นายพลภัทร ธีระกุล", role: 'Super Admin', position: 'ผู้อำนวยการโรงเรียน', username: 'phonlaphat' },
  { name: "นางสาวทิพวรรณ ศรีทองแก้ว", role: 'Super Admin', position: 'รองผู้อำนวยการโรงเรียน', username: 'tippawan' },
  { name: "นางสุมาลี บุญชู", role: 'Admin HR', position: 'ครู (เจ้าหน้าที่บุคคล)', username: 'sumalee' },
  { name: "นางรอยฮัน โต๊ะดำ", role: 'User', position: 'ครู', username: 'royhan' },
  { name: "นางสาวจุฑาภรณ์ อุมาสะ", role: 'User', position: 'ครู', username: 'jutaporn' },
  { name: "นางสาวจันทนา บุตรฤทธิ์", role: 'User', position: 'ครู', username: 'jantana' },
  { name: "นางอุษณี บุญทิพย์", role: 'User', position: 'ครู', username: 'usanee' },
  { name: "นางสาวกษมา ดินแดง", role: 'User', position: 'ครู', username: 'kasama' },
  { name: "นางสาวจิตสุภา บุญถาวร", role: 'User', position: 'ครู', username: 'jitsupa' },
  { name: "นางสาวนุรไลลา สาและ", role: 'User', position: 'ครู', username: 'nurlaila' },
  { name: "นางสาวบริมาส มะลิผล", role: 'User', position: 'ครู', username: 'barimas' },
  { name: "นางสาวมลิวัลย์ ชุมบุญ", role: 'User', position: 'ครู', username: 'maliwan' },
  { name: "นางวรัญญา สารสิทธิ์", role: 'User', position: 'ครู', username: 'waranya' },
  { name: "นางสาวฮัซนา ดาแล่หมัน", role: 'User', position: 'ครู', username: 'husna' },
  { name: "นางสาวนุรอาซีกีน ยาลอ", role: 'User', position: 'ครู', username: 'nuraseekeen' },
  { name: "นางสาวภาอีด๊ะ อ่าวลึกน้อย", role: 'User', position: 'ครู', username: 'paeeda' },
  { name: "นายอิรอน นายาว", role: 'User', position: 'ครู', username: 'iron' },
  { name: "นายอมรศักดิ์ สระวารี", role: 'User', position: 'นักการภารโรง', username: 'amornsak' }
];

const LEAVE_TYPES = [
  { id: 'sick', label: 'ลาป่วย', color: 'bg-red-100 text-red-700' },
  { id: 'personal', label: 'ลากิจส่วนตัว', color: 'bg-orange-100 text-orange-700' },
  { id: 'half_day', label: 'ลาครึ่งวัน', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'maternity', label: 'ลาคลอด', color: 'bg-pink-100 text-pink-700' },
  { id: 'religious', label: 'ลาศาสนา', color: 'bg-purple-100 text-purple-700' },
  { id: 'late', label: 'มาสาย', color: 'bg-gray-100 text-gray-700' }
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

// --- 4. UI COMPONENTS ---

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  return (
    <div className={`fixed top-4 right-4 ${bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-bounce z-50`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>{children}</div>
);

const Badge = ({ children, className = "" }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>
);

const StatCard = ({ title, value, unit, icon: Icon, color }) => (
  <Card className="flex items-center gap-4 hover:shadow-md transition-shadow">
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
  </Card>
);

// --- 5. MAIN MODULES ---

const Sidebar = ({ user, activeTab, setActiveTab, onLogout, isOpen, toggleSidebar }) => {
  const menus = [
    { id: 'dashboard', label: 'ภาพรวมระบบ', icon: PieChart, roles: ['Super Admin', 'Admin HR', 'User'] },
    { id: 'leaves', label: 'ระบบวันลา', icon: Calendar, roles: ['Super Admin', 'Admin HR'] },
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
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="font-bold text-xl">B</span>
          </div>
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === menu.id 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <menu.icon size={20} className={activeTab === menu.id ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
              <span className="font-medium">{menu.label}</span>
              {activeTab === menu.id && <ChevronRight size={16} className="ml-auto opacity-50"/>}
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-950/50">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-white">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-xs font-medium text-red-400 hover:bg-red-950/30 py-2 rounded-lg transition-colors border border-transparent hover:border-red-900">
            <LogOut size={14} /> ลงชื่อออก
          </button>
        </div>
      </aside>
    </>
  );
};

const DashboardModule = ({ user, leaves, trainings, portfolio, setActiveTab }) => {
  const leaveCount = leaves.length;
  const trainingCount = trainings.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0);
  const portfolioCount = portfolio.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="วันลาปีนี้" value={leaveCount} unit="วัน" icon={Calendar} color="bg-blue-100" />
        <StatCard title="ชั่วโมงอบรม" value={trainingCount} unit="ชม." icon={BookOpen} color="bg-green-100" />
        <StatCard title="ผลงานสะสม" value={portfolioCount} unit="รายการ" icon={Award} color="bg-purple-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-full">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Briefcase size={18} className="text-blue-500"/> เมนูลัด (Quick Actions)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {user.role !== 'User' && (
              <button onClick={() => setActiveTab('leaves')} className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl flex flex-col items-center justify-center gap-2 transition border border-blue-100">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm"><Calendar size={20}/></div>
                <span className="text-sm font-medium">บันทึกวันลา</span>
              </button>
            )}
            <button onClick={() => setActiveTab('training')} className="p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl flex flex-col items-center justify-center gap-2 transition border border-green-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm"><BookOpen size={20}/></div>
              <span className="text-sm font-medium">เพิ่มการอบรม</span>
            </button>
            <button onClick={() => setActiveTab('portfolio')} className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl flex flex-col items-center justify-center gap-2 transition border border-purple-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm"><Award size={20}/></div>
              <span className="text-sm font-medium">เพิ่มผลงาน</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className="p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 transition border border-gray-200">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm"><User size={20}/></div>
              <span className="text-sm font-medium">ดูโปรไฟล์</span>
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell size={18} className="text-orange-500"/> ประกาศ / แจ้งเตือน
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r text-sm text-yellow-800">
              <p className="font-bold">📅 แจ้งส่งเอกสารเลื่อนขั้น</p>
              <p>กรุณาส่งเอกสารภายในวันที่ 30 ของเดือนนี้</p>
            </div>
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r text-sm text-blue-800">
              <p className="font-bold">💧 แจ้งปิดระบบชั่วคราว</p>
              <p>เพื่อปรับปรุงฐานข้อมูล เวลา 24.00-02.00 น.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const LeaveModule = ({ currentUser, usersData, authUser, showToast }) => {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ staffId: '', type: 'sick', start: '', end: '', reason: '' });
  
  useEffect(() => {
    if (!authUser) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'leaves'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setLeaves(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.staffId || !form.start || !form.end) return showToast("กรุณากรอกข้อมูลให้ครบ", 'error');
    
    const staff = usersData.find(u => u.id === form.staffId);
    const cycle = getCycleInfo(new Date(form.start));
    const days = calculateDays(form.start, form.end, form.type);

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leaves'), {
      staffId: staff.id,
      staffName: staff.name,
      leaveType: form.type,
      startDate: form.start,
      endDate: form.end,
      reason: form.reason,
      daysCount: days,
      cycle: cycle.cycle,
      fiscalYear: cycle.year,
      cycleLabel: cycle.label,
      createdAt: serverTimestamp(),
      recordedBy: currentUser.name
    });
    showToast("บันทึกวันลาสำเร็จ", 'success');
    setForm({ ...form, reason: '', start: '', end: '' });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card className="xl:col-span-1 h-fit sticky top-6">
        <h3 className="font-bold mb-4 flex items-center gap-2 pb-2 border-b"><Calendar className="text-blue-600"/> บันทึกวันลา (HR)</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">เลือกบุคลากร</label>
            <select className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})}>
              <option value="">-- เลือกรายชื่อ --</option>
              {usersData.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">ประเภทการลา</label>
            <select className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              {LEAVE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-gray-500 uppercase">เริ่ม</label><input type="date" className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg" value={form.start} onChange={e => setForm({...form, start: e.target.value})} /></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase">ถึง</label><input type="date" className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg" value={form.end} onChange={e => setForm({...form, end: e.target.value})} /></div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">เหตุผล</label>
            <textarea className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg" rows={3} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="ระบุสาเหตุการลา..."></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">บันทึกข้อมูล</button>
        </form>
      </Card>

      <Card className="xl:col-span-2">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Clock className="text-gray-500"/> ประวัติการลาล่าสุด</h3>
        <div className="space-y-3">
          {leaves.map(l => {
            const typeInfo = LEAVE_TYPES.find(t=>t.id === l.leaveType) || LEAVE_TYPES[0];
            return (
              <div key={l.id} className="p-4 border border-gray-100 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 transition gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeInfo.color.split(' ')[0]}`}>
                    <FileText size={18} className={typeInfo.color.split(' ')[1]} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{l.staffName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className={`px-2 py-0.5 rounded text-xs ${typeInfo.color}`}>{typeInfo.label}</span>
                      <span>•</span>
                      <span>{l.daysCount} วัน</span>
                    </div>
                  </div>
                </div>
                <div className="text-right w-full sm:w-auto pl-12 sm:pl-0">
                  <p className="text-sm font-medium text-gray-700">{formatDateThai(l.startDate)} - {formatDateThai(l.endDate)}</p>
                  <p className="text-xs text-gray-400">{l.cycleLabel}</p>
                </div>
              </div>
            );
          })}
          {leaves.length === 0 && <p className="text-center text-gray-400 py-10">ยังไม่มีรายการลา</p>}
        </div>
      </Card>
    </div>
  );
};

const TrainingModule = ({ currentUser, authUser, showToast }) => {
  const [trainings, setTrainings] = useState([]);
  const [form, setForm] = useState({ topic: '', org: '', date: '', hours: 0 });

  useEffect(() => {
    if (!authUser) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'trainings'), where('userId', '==', currentUser.id));
    const unsub = onSnapshot(q, (snap) => setTrainings(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [currentUser, authUser]);

  const addTraining = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'trainings'), {
      ...form, userId: currentUser.id, createdAt: serverTimestamp()
    });
    showToast("บันทึกการอบรมเรียบร้อย");
    setForm({ topic: '', org: '', date: '', hours: 0 });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="h-fit">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-green-700"><BookOpen size={20}/> เพิ่มประวัติการอบรม</h3>
        <form onSubmit={addTraining} className="space-y-4">
          <input className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="หัวข้อการอบรม" required value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} />
          <input className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="หน่วยงานที่จัด" required value={form.org} onChange={e => setForm({...form, org: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            <input type="number" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="จำนวนชั่วโมง" required value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} />
          </div>
          <button className="w-full bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-600/30">บันทึกข้อมูล</button>
        </form>
      </Card>
      <div className="space-y-4">
        {trainings.map(t => (
          <Card key={t.id} className="border-l-4 border-l-green-500">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-800">{t.topic}</h4>
                <p className="text-sm text-gray-500 mt-1">{t.org}</p>
              </div>
              <Badge className="bg-green-100 text-green-700">{t.hours} ชม.</Badge>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-right">{formatDateThai(t.date)}</p>
          </Card>
        ))}
        {trainings.length === 0 && <p className="text-center text-gray-400 py-10">ยังไม่มีประวัติการอบรม</p>}
      </div>
    </div>
  );
};

const PortfolioModule = ({ currentUser, authUser, showToast }) => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', year: new Date().getFullYear() + 543, type: 'รางวัล' });

  useEffect(() => {
    if (!authUser) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'portfolio'), where('userId', '==', currentUser.id));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [currentUser, authUser]);

  const addItem = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'portfolio'), {
      ...form, userId: currentUser.id, createdAt: serverTimestamp()
    });
    showToast("บันทึกผลงานเรียบร้อย");
    setForm({ title: '', year: new Date().getFullYear() + 543, type: 'รางวัล' });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="h-fit">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-purple-700"><Award size={20}/> เพิ่มผลงานดีเด่น</h3>
        <form onSubmit={addItem} className="space-y-4">
          <input className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="ชื่อรางวัล / ผลงาน" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="ปี พ.ศ." required value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
            <select className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option>รางวัล</option><option>วิจัย</option><option>นวัตกรรม</option><option>โครงการ</option>
            </select>
          </div>
          <button className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/30">บันทึกข้อมูล</button>
        </form>
      </Card>
      <div className="space-y-4">
        {items.map(t => (
          <Card key={t.id} className="border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-800">{t.title}</h4>
                <p className="text-sm text-gray-500 mt-1">ปีการศึกษา {t.year}</p>
              </div>
              <Badge className="bg-purple-100 text-purple-700">{t.type}</Badge>
            </div>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 py-10">ยังไม่มีผลงาน</p>}
      </div>
    </div>
  );
};

const UserManagement = ({ user, usersData, onUpdateUser, onResetPassword }) => {
  const [search, setSearch] = useState('');
  const filteredUsers = usersData.filter(u => u.name.includes(search) || u.username.includes(search));

  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-blue-600"/> จัดการผู้ใช้</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ หรือ Username..." 
            className="w-full pl-10 p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase font-bold">
            <tr>
              <th className="p-4">ชื่อ-สกุล</th>
              <th className="p-4">Username</th>
              <th className="p-4">ตำแหน่ง</th>
              <th className="p-4">สิทธิ์ (Role)</th>
              <th className="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-blue-50/50 transition">
                <td className="p-4 font-medium text-gray-900">{u.name}</td>
                <td className="p-4 text-gray-500">@{u.username}</td>
                <td className="p-4">{u.position}</td>
                <td className="p-4">
                  <Badge className={u.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' : u.role === 'Admin HR' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="p-4 flex gap-2 justify-center">
                  <button onClick={() => onResetPassword(u)} className="p-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition" title="รีเซ็ตรหัสผ่าน"><Lock size={16}/></button>
                  <button onClick={() => {
                     const newRole = prompt("กำหนดสิทธิ์ใหม่ (Super Admin, Admin HR, User):", u.role);
                     if(newRole) onUpdateUser(u.id, { role: newRole });
                  }} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition" title="แก้ไขสิทธิ์"><Edit size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// --- 6. MAIN APP LOGIC ---

export default function BKSHRApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [usersData, setUsersData] = useState([]);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Initialize Auth
  useEffect(() => {
    const setupAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token);
        } else {
           await signInAnonymously(auth);
        }
      } catch(e) { console.error(e) }
    };
    setupAuth();
    return onAuthStateChanged(auth, (user) => user && setAuthUser(user));
  }, []);

  // Initialize Data (Run ONLY after Auth is Ready)
  useEffect(() => {
    if (!authUser) return; // Wait for auth
    const initData = async () => {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'users'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Auto Seed
        for (const user of INITIAL_USERS) {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'users'), {
            ...user, password: DEFAULT_PASSWORD, status: 'active', createdAt: serverTimestamp()
          });
        }
        window.location.reload(); 
      } else {
        setUsersData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      setLoading(false);
    };
    initData();
  }, [authUser]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleLogin = (e) => {
    e.preventDefault();
    const user = usersData.find(u => 
      (u.username === loginForm.user || u.name === loginForm.user) && 
      u.password === loginForm.pass &&
      u.status !== 'disabled'
    );
    if (user) {
      setCurrentUser(user);
      setActiveTab('dashboard');
      showToast(`ยินดีต้อนรับ ${user.name}`);
    } else {
      showToast("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", 'error');
    }
  };

  const handleUpdateUser = async (uid, data) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', uid), data);
    showToast("อัปเดตข้อมูลสำเร็จ");
    setUsersData(prev => prev.map(u => u.id === uid ? { ...u, ...data } : u));
  };

  const handleResetPassword = async (user) => {
    if(!confirm(`รีเซ็ตรหัสผ่านของ ${user.name} เป็น ${DEFAULT_PASSWORD}?`)) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.id), { password: DEFAULT_PASSWORD });
    showToast("รีเซ็ตรหัสผ่านเรียบร้อย");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 animate-pulse">Loading BKS-HR System...</div>;

  // Login View
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4 font-sans">
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/30 transform rotate-3">BKS</div>
            <h1 className="text-2xl font-bold text-gray-800">ระบบ BKS-HR</h1>
            <p className="text-gray-500 text-sm">เข้าสู่ระบบเพื่อจัดการข้อมูล</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Username</label>
              <input 
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="ระบุชื่อผู้ใช้"
                value={loginForm.user}
                onChange={e => setLoginForm({...loginForm, user: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
              <input 
                type="password"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="ระบุรหัสผ่าน"
                value={loginForm.pass}
                onChange={e => setLoginForm({...loginForm, pass: e.target.value})}
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 transform active:scale-95">เข้าสู่ระบบ</button>
          </form>
          <div className="mt-8 text-center">
            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">Default Pass: 1234</span>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <Sidebar 
        user={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setCurrentUser(null)} 
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between lg:hidden shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={24} className="text-slate-600"/>
            </button>
            <span className="font-bold text-lg text-slate-800">BKS-HR</span>
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">{currentUser.name.charAt(0)}</div>
        </header>

        {/* Desktop Header & Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {activeTab === 'dashboard' && 'Dashboard ภาพรวม'}
                  {activeTab === 'leaves' && 'ระบบจัดการวันลา'}
                  {activeTab === 'users' && 'จัดการผู้ใช้งาน'}
                  {activeTab === 'profile' && 'โปรไฟล์ของฉัน'}
                  {activeTab === 'training' && 'ประวัติการอบรม'}
                  {activeTab === 'portfolio' && 'ผลงานทางวิชาการ'}
                </h1>
                <p className="text-slate-500 mt-1">จัดการข้อมูลโรงเรียนบ้านบากันได้ที่นี่</p>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <span className="text-sm font-medium text-slate-600">{formatDateThai(new Date().toISOString())}</span>
              </div>
            </div>

            {/* Modules Render */}
            <div className="animate-fade-in">
              {activeTab === 'dashboard' && (
                <DashboardModule user={currentUser} leaves={[]} trainings={[]} portfolio={[]} setActiveTab={setActiveTab} />
              )}

              {activeTab === 'users' && currentUser.role === 'Super Admin' && (
                <UserManagement user={currentUser} usersData={usersData} onUpdateUser={handleUpdateUser} onResetPassword={handleResetPassword} />
              )}

              {activeTab === 'leaves' && (currentUser.role === 'Super Admin' || currentUser.role === 'Admin HR') && (
                <LeaveModule currentUser={currentUser} usersData={usersData} authUser={authUser} showToast={showToast} />
              )}

              {/* Placeholder for Training & Portfolio (Use existing components logic) */}
              {activeTab === 'training' && (
                <TrainingModule currentUser={currentUser} authUser={authUser} showToast={showToast} />
              )}
              
              {activeTab === 'portfolio' && (
                <PortfolioModule currentUser={currentUser} authUser={authUser} showToast={showToast} />
              )}

              {activeTab === 'profile' && (
                <div className="max-w-3xl mx-auto">
                  <Card className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
                    <div className="relative pt-16 px-4 text-center">
                      <div className="w-32 h-32 bg-white rounded-full mx-auto p-1 shadow-xl">
                        <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <User size={64} />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold mt-4 text-slate-800">{currentUser.name}</h2>
                      <p className="text-slate-500 font-medium">{currentUser.position}</p>
                      <Badge className="mt-2 bg-blue-100 text-blue-700">{currentUser.role}</Badge>
                    </div>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
                        <p className="font-mono text-slate-700">@{currentUser.username}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
                        <p className="text-green-600 font-medium flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Active Account</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}