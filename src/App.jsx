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

// Initial Seed Data
const INITIAL_USERS = [
  { name: "นายพลภัทร ธีระกุล", role: 'Super Admin', position: 'ผู้อำนวยการโรงเรียน', username: 'phonlaphat', department: 'บริหาร', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสาวทิพวรรณ ศรีทองแก้ว", role: 'Super Admin', position: 'รองผู้อำนวยการโรงเรียน', username: 'tippawan', department: 'บริหาร', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสุมาลี บุญชู", role: 'Admin HR', position: 'ครู (เจ้าหน้าที่บุคคล)', username: 'sumalee', department: 'บุคคล', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางรอยฮัน โต๊ะดำ", role: 'User', position: 'ครู', username: 'royhan', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสาวจุฑาภรณ์ อุมาสะ", role: 'User', position: 'ครู', username: 'jutaporn', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสาวจันทนา บุตรฤทธิ์", role: 'User', position: 'ครู', username: 'jantana', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางอุษณี บุญทิพย์", role: 'User', position: 'ครู', username: 'usanee', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสาวกษมา ดินแดง", role: 'User', position: 'ครู', username: 'kasama', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสาวจิตสุภา บุญถาวร", role: 'User', position: 'ครู', username: 'jitsupa', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสาวนุรไลลา สาและ", role: 'User', position: 'ครู', username: 'nurlaila', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสาวบริมาส มะลิผล", role: 'User', position: 'ครู', username: 'barimas', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสาวมลิวัลย์ ชุมบุญ", role: 'User', position: 'ครู', username: 'maliwan', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางวรัญญา สารสิทธิ์", role: 'User', position: 'ครู', username: 'waranya', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสาวฮัซนา ดาแล่หมัน", role: 'User', position: 'ครู', username: 'husna', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสาวนุรอาซีกีน ยาลอ", role: 'User', position: 'ครู', username: 'nuraseekeen', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสาวภาอีด๊ะ อ่าวลึกน้อย", role: 'User', position: 'ครู', username: 'paeeda', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นางสาวอรษา ชาตรีวงศ์", role: 'User', position: 'ครู', username: 'orasa', department: 'วิชาการ', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นายอิรอน นายาว", role: 'User', position: 'ครู', username: 'iron', department: 'ทั่วไป', tel: '', email: '', salary: 0, academic: 0 },
  { name: "นายอมรศักดิ์ สระวารี", role: 'User', position: 'นักการภารโรง', username: 'amornsak', department: 'ทั่วไป', tel: '', email: '', salary: 0, academic: 0 }
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
  return (
    <div className={`fixed top-4 right-4 ${bg} text-white px-6 py-3 rounded-lg shadow-