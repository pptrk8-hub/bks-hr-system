import React, { useState } from 'react';
import { Camera, Save, Edit2, Trash2, Printer, Plus, Facebook, Youtube, LogIn, User, FileText, LogOut, Menu, X } from 'lucide-react';

// --- ส่วนประกอบ: เมนูด้านข้าง (Sidebar) ---
const Sidebar = ({ activeMenu, setActiveMenu, onLogout, isOpen, setIsOpen }) => (
  <>
    {/* Overlay สำหรับมือถือ */}
    {isOpen && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden block"
        onClick={() => setIsOpen(false)}
      ></div>
    )}
    
    <div className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#0a192f] text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col shadow-xl no-print`}>
      <div className="p-6 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">B</div>
          <div>
            <h1 className="font-bold text-lg tracking-wide">BKS-HR</h1>
            <p className="text-xs text-gray-400">ระบบบริหารบุคคล</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        <button 
          onClick={() => { setActiveMenu('profile'); setIsOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeMenu === 'profile' ? 'bg-blue-600 text-white shadow-md translate-x-1' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <User size={20} /> โปรไฟล์ของฉัน
        </button>
        <button 
          onClick={() => { setActiveMenu('portfolio'); setIsOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeMenu === 'portfolio' ? 'bg-blue-600 text-white shadow-md translate-x-1' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <FileText size={20} /> แฟ้มสะสมผลงาน
        </button>
      </nav>

      <div className="p-4 border-t border-gray-700 bg-[#050e1c]">
        <button onClick={onLogout} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 px-4 py-3 rounded-lg transition">
          <LogOut size={18} /> ออกจากระบบ
        </button>
      </div>
    </div>
  </>
);

// --- ส่วนประกอบหลัก: App ---
export default function App() {
  // --- State จัดการระบบ ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // --- State ข้อมูลโปรไฟล์ (เพิ่มวันเกิด, โซเชียล) ---
  const [profile, setProfile] = useState({
    name: 'เมกาทีด๊ะ อ่าวลึกน้อย',
    position: 'ครูจ้างชั่วคราว• ศิลปะและงานอาชีพ',
    phone: '',
    email: '',
    status: '',
    birthDate: '',      // ใหม่: วันเกิด
    facebook: '',       // ใหม่: Facebook
    website: '',        // ใหม่: Youtube/Web
    photoURL: 'https://via.placeholder.com/150'
  });

  // --- State ผลงาน (Portfolio) ---
  const [portfolios, setPortfolios] = useState([]);
  const [newPortfolio, setNewPortfolio] = useState({ title: '', description: '', photoURL: '' });
  const [editIndex, setEditIndex] = useState(-1);
  const [isUploading, setIsUploading] = useState(false);

  // --- ฟังก์ชันอัปโหลด (API) ---
  const uploadToCloudinary = async (file) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const response = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: reader.result }),
            });
            const data = await response.json();
            if (response.ok) resolve(data.url);
            else reject(data.error || 'Upload failed');
          } catch (error) { reject(error); } 
          finally { setIsUploading(false); }
        };
      });
    } catch (error) { setIsUploading(false); return null; }
  };

  // --- Handlers ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username && loginData.password) setIsLoggedIn(true);
    else alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
  };

  const savePortfolio = () => {
    if (!newPortfolio.title) return alert('กรุณาใส่ชื่อผลงาน');
    const updated = [...portfolios];
    if (editIndex >= 0) updated[editIndex] = newPortfolio;
    else updated.push(newPortfolio);
    setPortfolios(updated);
    setEditIndex(-1);
    setNewPortfolio({ title: '', description: '', photoURL: '' });
    alert(editIndex >= 0 ? "แก้ไขสำเร็จ!" : "เพิ่มผลงานสำเร็จ!");
  };

  // ----------------------------------------------------------------------
  // 🔴 1. หน้า Login (แสดงเมื่อยังไม่ล็อกอิน)
  // ----------------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-[#000080] to-[#FFD700] rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg border-4 border-white">
              B
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">ยินดีต้อนรับ</h2>
            <p className="text-gray-500">ระบบบริหารบุคคล โรงเรียนบ้านบากัน</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อผู้ใช้งาน</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#000080] focus:border-transparent outline-none transition"
                placeholder="ระบุชื่อผู้ใช้งาน..."
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">รหัสผ่าน</label>
              <input 
                type="password" 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#000080] focus:border-transparent outline-none transition"
                placeholder="ระบุรหัสผ่าน..."
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full bg-[#000080] hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center gap-2 transform hover:scale-[1.02]">
              <LogIn size={20} /> เข้าสู่ระบบ
            </button>
          </form>
          <div className="mt-8 text-center text-xs text-gray-400">
            © 2025 BKS HR System • Version 2.0
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // 🔵 2. ระบบหลัก (แสดงเมื่อล็อกอินแล้ว)
  // ----------------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans" id="printable-area">
      {/* Sidebar เมนู */}
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        onLogout={() => setIsLoggedIn(false)} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* เนื้อหาหลัก */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* CSS สำหรับ Print */}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background-color: white; }
            .shadow-lg, .shadow-xl { box-shadow: none !important; }
            .border { border: 1px solid #ddd !important; }
          }
        `}</style>

        {/* --- Header (สีธงโรงเรียน) --- */}
        <div className="h-48 w-full bg-gradient-to-r from-[#000080] via-[#1e3a8a] to-[#FFD700] relative shadow-md print:h-32 print:bg-none print:border-b-2 print:border-black">
            {/* ปุ่มเปิดเมนู (มือถือ) */}
            <div className="absolute top-4 left-4 md:hidden no-print z-10">
               <button onClick={() => setIsSidebarOpen(true)} className="text-white bg-black/20 p-2 rounded-lg hover:bg-black/30 backdrop-blur-sm"><Menu size={24}/></button>
            </div>

            {/* ปุ่ม Print (ขวาบน) */}
            <div className="absolute top-4 right-4 no-print">
                <button 
                    onClick={() => window.print()} 
                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/50 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition shadow-sm"
                >
                    <Printer size={20} /> พิมพ์รายงาน
                </button>
            </div>

            {/* ส่วนรูปโปรไฟล์และชื่อ */}
            <div className="absolute -bottom-16 left-6 md:left-12 flex items-end">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white overflow-hidden shadow-xl">
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <label className="absolute bottom-2 right-2 bg-gray-800 text-white p-2.5 rounded-full cursor-pointer hover:bg-gray-700 transition shadow-lg no-print hover:scale-110">
                  <Camera size={18} />
                  <input type="file" className="hidden" accept="image/*" onChange={async(e) => {
                      const url = await uploadToCloudinary(e.target.files[0]);
                      if(url) setProfile(p => ({...p, photoURL: url}));
                  }} />
                </label>
              </div>
              <div className="mb-4 ml-4 md:ml-6 text-white drop-shadow-md hidden md:block print:block print:text-black print:mb-0">
                 <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
                 <p className="text-yellow-200 font-medium print:text-gray-600">{profile.position}</p>
              </div>
            </div>
        </div>

        {/* --- พื้นที่เนื้อหา --- */}
        <div className="container mx-auto px-4 mt-20 md:mt-24 md:px-8 pb-10 max-w-6xl">
            
            {/* 📄 เมนู 1: โปรไฟล์ */}
            {activeMenu === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up">
                 
                 {/* คอลัมน์ซ้าย: ฟอร์มข้อมูล */}
                 <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <h2 className="text-xl font-bold text-[#000080] mb-4 border-b pb-2 flex items-center gap-2">
                        <User size={20}/> ข้อมูลส่วนตัว
                      </h2>
                      <div className="space-y-4 text-sm">
                          <div><label className="text-gray-500 block mb-1 font-medium">ชื่อ-สกุล</label><input value={profile.name} onChange={(e)=>setProfile({...profile, name: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none border transition"/></div>
                          <div><label className="text-gray-500 block mb-1 font-medium">ตำแหน่ง</label><input value={profile.position} onChange={(e)=>setProfile({...profile, position: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none border transition"/></div>
                          
                          {/* วันเกิด (ใหม่) */}
                          <div><label className="text-gray-500 block mb-1 font-medium">วัน/เดือน/ปี เกิด</label><input type="date" value={profile.birthDate} onChange={(e)=>setProfile({...profile, birthDate: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none border transition"/></div>
                          
                          <div><label className="text-gray-500 block mb-1 font-medium">เบอร์โทรศัพท์</label><input value={profile.phone} onChange={(e)=>setProfile({...profile, phone: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none border transition"/></div>
                          <div><label className="text-gray-500 block mb-1 font-medium">อีเมล</label><input value={profile.email} onChange={(e)=>setProfile({...profile, email: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none border transition"/></div>
                          
                          {/* โซเชียล (ใหม่) */}
                          <div className="pt-3 border-t mt-2 space-y-3">
                              <div>
                                <label className="text-blue-600 block mb-1 font-medium flex items-center gap-1"><Facebook size={16}/> Facebook</label>
                                <input value={profile.facebook} onChange={(e)=>setProfile({...profile, facebook: e.target.value})} className="w-full border-blue-200 rounded-lg p-2.5 bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none border transition" placeholder="ลิ้งค์ Facebook..."/>
                              </div>
                              <div>
                                <label className="text-red-600 block mb-1 font-medium flex items-center gap-1"><Youtube size={16}/> Youtube / Web</label>
                                <input value={profile.website} onChange={(e)=>setProfile({...profile, website: e.target.value})} className="w-full border-red-200 rounded-lg p-2.5 bg-red-50 focus:ring-2 focus:ring-red-500 outline-none border transition" placeholder="ลิ้งค์ Youtube..."/>
                              </div>
                          </div>
                      </div>
                    </div>
                 </div>

                 {/* คอลัมน์ขวา: สรุปผลงาน */}
                 <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
                       <div className="flex justify-between items-center mb-4 border-b pb-2">
                          <h2 className="text-xl font-bold text-[#000080] flex items-center gap-2">
                            <FileText size={20}/> ผลงานล่าสุด
                          </h2>
                          <button onClick={() => setActiveMenu('portfolio')} className="text-sm text-blue-600 hover:underline no-print">ดูทั้งหมด / แก้ไข</button>
                       </div>
                       
                       {portfolios.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                            <FileText size={48} className="mb-2 opacity-20"/>
                            <p>ยังไม่มีข้อมูลผลงาน</p>
                            <button onClick={() => setActiveMenu('portfolio')} className="mt-2 text-blue-500 font-medium hover:underline no-print">เพิ่มผลงานแรกเลย!</button>
                         </div>
                       ) : (
                         <div className="space-y-4">
                           {portfolios.slice(0, 3).map((work, idx) => (
                             <div key={idx} className="flex gap-4 border-b pb-4 last:border-0 hover:bg-gray-50 p-2 rounded transition">
                               {work.photoURL ? (
                                 <img src={work.photoURL} className="w-24 h-24 object-cover rounded-lg bg-gray-200 border" />
                               ) : (
                                 <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border"><Camera size={20}/></div>
                               )}
                               <div>
                                 <h4 className="font-bold text-[#000080] text-lg">{work.title}</h4>
                                 <p className="text-sm text-gray-600 line-clamp-2 mt-1">{work.description}</p>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                 </div>
              </div>
            )}

            {/* 🗂️ เมนู 2: จัดการผลงาน (Portfolio) */}
            {activeMenu === 'portfolio' && (
              <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
                  {/* หัวข้อ */}
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold text-gray-800">จัดการแฟ้มสะสมผลงาน</h2>
                     <span className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">{portfolios.length} รายการ</span>
                  </div>

                  {/* ฟอร์มเพิ่ม/แก้ไข */}
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 no-print relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${editIndex >= 0 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        {editIndex >= 0 ? <><Edit2 size={20} className="text-orange-500"/> แก้ไขผลงาน</> : <><Plus size={20} className="text-green-600"/> เพิ่มผลงานใหม่</>}
                    </h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อผลงาน / กิจกรรม</label>
                            <input name="title" value={newPortfolio.title} onChange={(e)=>setNewPortfolio({...newPortfolio, title: e.target.value})} placeholder="เช่น ได้รับรางวัลชนะเลิศ..." className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none border transition"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">รายละเอียด</label>
                            <textarea name="description" value={newPortfolio.description} onChange={(e)=>setNewPortfolio({...newPortfolio, description: e.target.value})} placeholder="อธิบายรายละเอียดผลงาน..." rows="3" className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none border transition"></textarea>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                <label className={`px-4 py-2 rounded-lg cursor-pointer border flex items-center gap-2 transition ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                                    <Camera size={18} /> {isUploading ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพประกอบ'}
                                    <input type="file" className="hidden" accept="image/*" onChange={async(e) => {
                                        const url = await uploadToCloudinary(e.target.files[0]);
                                        if(url) setNewPortfolio(p => ({...p, photoURL: url}));
                                    }} disabled={isUploading} />
                                </label>
                                {newPortfolio.photoURL && (
                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200 text-sm">
                                        <img src={newPortfolio.photoURL} className="w-6 h-6 rounded-full object-cover"/>
                                        <span>อัปโหลดแล้ว</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-2 w-full md:w-auto">
                                {editIndex >= 0 && (
                                    <button onClick={() => {setEditIndex(-1); setNewPortfolio({title:'', description:'', photoURL:''})}} className="flex-1 md:flex-none px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">ยกเลิก</button>
                                )}
                                <button onClick={savePortfolio} disabled={isUploading} className={`flex-1 md:flex-none px-6 py-2 text-white rounded-lg shadow-md flex items-center justify-center gap-2 transition transform active:scale-95 ${editIndex >= 0 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#000080] hover:bg-blue-900'}`}>
                                    <Save size={18} /> {editIndex >= 0 ? 'บันทึกการแก้ไข' : 'บันทึกผลงาน'}
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* รายการผลงาน Grid */}
                  <div className="grid grid-cols-1 gap-6">
                    {portfolios.map((work, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row relative group hover:shadow-md transition">
                            {work.photoURL && (
                                <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0 bg-gray-100 relative">
                                    <img src={work.photoURL} alt={work.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col justify-center">
                                <h4 className="font-bold text-xl text-[#000080] mb-2">{work.title}</h4>
                                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{work.description}</p>
                            </div>
                            
                            {/* ปุ่มจัดการ (ซ่อนตอน Print) */}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition duration-200 no-print">
                                <button 
                                    onClick={() => {setNewPortfolio(work); setEditIndex(index); window.scrollTo({top:0, behavior:'smooth'})}} 
                                    className="bg-white text-yellow-600 hover:text-yellow-700 p-2 rounded-lg shadow border border-gray-100 hover:bg-yellow-50" title="แก้ไข"
                                >
                                    <Edit2 size={16}/>
                                </button>
                                <button 
                                    onClick={() => {if(confirm('ยืนยันการลบ?')) setPortfolios(portfolios.filter((_,i)=>i!==index))}} 
                                    className="bg-white text-red-500 hover:text-red-700 p-2 rounded-lg shadow border border-gray-100 hover:bg-red-50" title="ลบ"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                  </div>
              </div>
            )}

        </div>
      </div>
    </div>
  );
}