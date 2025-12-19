import React, { useState } from 'react';
import { Camera, Save, Edit2, Trash2, Printer, Plus, Link as LinkIcon, Facebook, Youtube } from 'lucide-react';

export default function App() {
  // --- 1. State สำหรับข้อมูลโปรไฟล์ (เพิ่มวันเกิด, โซเชียล) ---
  const [profile, setProfile] = useState({
    name: 'เมกาทีด๊ะ อ่าวลึกน้อย',
    position: 'ครูจ้างชั่วคราว• ศิลปะและงานอาชีพ',
    phone: '',
    email: '',
    status: '',
    bio: '',
    birthDate: '',      // เพิ่มใหม่: วันเกิด
    facebook: '',       // เพิ่มใหม่: Facebook
    website: '',        // เพิ่มใหม่: Youtube/Web
    photoURL: 'https://via.placeholder.com/150' // รูปโปรไฟล์ตั้งต้น
  });

  // --- 2. State สำหรับผลงาน (Portfolio) ---
  const [portfolios, setPortfolios] = useState([]);
  const [newPortfolio, setNewPortfolio] = useState({ title: '', description: '', photoURL: '' });
  const [editIndex, setEditIndex] = useState(-1); // เอาไว้เช็คว่ากำลังแก้ไขงานชิ้นไหน (-1 คือเพิ่มใหม่)
  
  // สถานะการโหลด
  const [isUploading, setIsUploading] = useState(false);

  // --- ฟังก์ชันอัปโหลดรูป (ยิงไปที่ API หลังบ้านเฮีย) ---
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
            if (response.ok) {
              resolve(data.url);
            } else {
              reject(data.error);
            }
          } catch (error) {
            reject(error);
          } finally {
            setIsUploading(false);
          }
        };
      });
    } catch (error) {
      setIsUploading(false);
      alert("เกิดข้อผิดพลาดในการเตรียมไฟล์");
      return null;
    }
  };

  // --- Handlers จัดการ Input ต่างๆ ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadToCloudinary(file);
        if (url) setProfile(prev => ({ ...prev, photoURL: url }));
      } catch (error) {
        alert('อัปโหลดรูปโปรไฟล์ไม่สำเร็จ: ' + error);
      }
    }
  };

  // --- Handlers จัดการ Portfolio (เพิ่ม/แก้ไข/ลบ) ---
  const handlePortfolioChange = (e) => {
    const { name, value } = e.target;
    setNewPortfolio(prev => ({ ...prev, [name]: value }));
  };

  const handlePortfolioImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadToCloudinary(file);
        if (url) setNewPortfolio(prev => ({ ...prev, photoURL: url }));
      } catch (error) {
        alert('อัปโหลดรูปผลงานไม่สำเร็จ: ' + error);
      }
    }
  };

  const savePortfolio = () => {
    if (!newPortfolio.title) return alert('กรุณาใส่ชื่อผลงาน');

    if (editIndex >= 0) {
      // โหมดแก้ไข: อัปเดตตัวเดิม
      const updatedPortfolios = [...portfolios];
      updatedPortfolios[editIndex] = newPortfolio;
      setPortfolios(updatedPortfolios);
      setEditIndex(-1); // กลับสู่โหมดปกติ
    } else {
      // โหมดเพิ่มใหม่
      setPortfolios([...portfolios, newPortfolio]);
    }
    // ล้างฟอร์ม
    setNewPortfolio({ title: '', description: '', photoURL: '' });
  };

  const startEditPortfolio = (index) => {
    setNewPortfolio(portfolios[index]); // ดึงข้อมูลเก่ามาใส่ฟอร์ม
    setEditIndex(index); // ระบุว่ากำลังแก้ตัวที่เท่าไหร่
    // เลื่อนหน้าจอไปหาฟอร์ม (UX)
    document.getElementById('portfolio-form').scrollIntoView({ behavior: 'smooth' });
  };

  const deletePortfolio = (index) => {
    if (confirm('ต้องการลบผลงานนี้ใช่หรือไม่?')) {
      const updated = portfolios.filter((_, i) => i !== index);
      setPortfolios(updated);
      if (editIndex === index) { // ถ้าลบตัวที่กำลังแก้อยู่ ให้ล้างฟอร์มด้วย
        setEditIndex(-1);
        setNewPortfolio({ title: '', description: '', photoURL: '' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-10" id="printable-area">
      {/* --- CSS สำหรับการพิมพ์ (ซ่อนปุ่มเมื่อกด Print) --- */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: white; }
          .shadow-lg { box-shadow: none !important; }
        }
      `}</style>

      {/* --- ส่วนหัว (Header) สีธงโรงเรียน: กรมท่า-เหลือง --- */}
      <div className="h-48 w-full bg-gradient-to-r from-[#000080] via-[#1e3a8a] to-[#FFD700] relative print:h-32">
        <div className="absolute -bottom-16 left-8 md:left-16 flex items-end">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <label className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700 transition no-print">
              <Camera size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageChange} />
            </label>
          </div>
          <div className="mb-4 ml-4 text-white drop-shadow-md hidden md:block print:block print:text-black print:mb-0">
             <h1 className="text-3xl font-bold">{profile.name}</h1>
             <p className="text-yellow-200 print:text-gray-600">{profile.position}</p>
          </div>
        </div>
        
        {/* --- ปุ่มพิมพ์รายงาน (ขวาบน) --- */}
        <div className="absolute top-4 right-4 no-print">
            <button 
                onClick={() => window.print()} 
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/50 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition"
            >
                <Printer size={20} /> พิมพ์รายงาน
            </button>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-20 md:mt-24 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* --- คอลัมน์ซ้าย: ข้อมูลส่วนตัว --- */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-[#000080] mb-4 border-b pb-2">ข้อมูลส่วนตัว</h2>
            
            {/* ฟอร์มข้อมูลส่วนตัว */}
            <div className="space-y-3 text-sm">
                <div>
                    <label className="block text-gray-500 mb-1">ชื่อ-สกุล</label>
                    <input name="name" value={profile.name} onChange={handleProfileChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-gray-500 mb-1">ตำแหน่ง</label>
                    <input name="position" value={profile.position} onChange={handleProfileChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                
                {/* --- ใหม่: วันเดือนปีเกิด --- */}
                <div>
                    <label className="block text-gray-500 mb-1">วัน/เดือน/ปี เกิด</label>
                    <input type="date" name="birthDate" value={profile.birthDate} onChange={handleProfileChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                    <label className="block text-gray-500 mb-1">เบอร์โทรศัพท์</label>
                    <input name="phone" value={profile.phone} onChange={handleProfileChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="08x-xxx-xxxx" />
                </div>
                <div>
                    <label className="block text-gray-500 mb-1">อีเมล</label>
                    <input name="email" value={profile.email} onChange={handleProfileChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                {/* --- ใหม่: โซเชียลมีเดีย --- */}
                <div className="pt-2 border-t mt-2">
                    <label className="block text-gray-500 mb-1 flex items-center gap-1"><Facebook size={14}/> Facebook Link</label>
                    <input name="facebook" value={profile.facebook} onChange={handleProfileChange} className="w-full border rounded p-2 bg-blue-50 text-blue-800" placeholder="https://facebook.com/..." />
                </div>
                <div>
                    <label className="block text-gray-500 mb-1 flex items-center gap-1"><Youtube size={14}/> Youtube / Website</label>
                    <input name="website" value={profile.website} onChange={handleProfileChange} className="w-full border rounded p-2 bg-red-50 text-red-800" placeholder="https://youtube.com/..." />
                </div>
            </div>
          </div>
        </div>

        {/* --- คอลัมน์ขวา: ผลงาน (Portfolio) --- */}
        <div className="md:col-span-2 space-y-6">
          
          {/* ส่วนกรอกข้อมูลผลงาน (ซ่อนตอน Print) */}
          <div id="portfolio-form" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 no-print">
            <h2 className="text-xl font-bold text-[#000080] mb-4 flex items-center gap-2">
                {editIndex >= 0 ? <Edit2 size={24}/> : <Plus size={24}/>} 
                {editIndex >= 0 ? 'แก้ไขผลงาน' : 'เพิ่มผลงานใหม่'}
            </h2>
            <div className="grid gap-4">
                <input 
                    name="title" 
                    value={newPortfolio.title} 
                    onChange={handlePortfolioChange} 
                    placeholder="ชื่อผลงาน / กิจกรรม..." 
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-yellow-400 outline-none text-lg font-medium"
                />
                <textarea 
                    name="description" 
                    value={newPortfolio.description} 
                    onChange={handlePortfolioChange} 
                    placeholder="รายละเอียดของงาน..." 
                    rows="3"
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                ></textarea>
                
                {/* --- ใหม่: อัปโหลดรูปผลงาน --- */}
                <div className="flex items-center gap-4">
                    <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded cursor-pointer border flex items-center gap-2 transition">
                        <Camera size={18} /> 
                        {isUploading ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพประกอบ'}
                        <input type="file" className="hidden" accept="image/*" onChange={handlePortfolioImageChange} disabled={isUploading} />
                    </label>
                    {newPortfolio.photoURL && (
                        <span className="text-green-600 text-sm flex items-center gap-1">✓ มีรูปภาพแล้ว</span>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                     {editIndex >= 0 && (
                        <button onClick={() => {setEditIndex(-1); setNewPortfolio({title:'', description:'', photoURL:''})}} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">ยกเลิก</button>
                     )}
                     <button 
                        onClick={savePortfolio} 
                        disabled={isUploading}
                        className={`px-6 py-2 rounded-lg text-white font-bold shadow-md flex items-center gap-2 ${editIndex >= 0 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#000080] hover:bg-blue-900'}`}
                     >
                        <Save size={18} /> {editIndex >= 0 ? 'บันทึกการแก้ไข' : 'บันทึกผลงาน'}
                     </button>
                </div>
            </div>
          </div>

          {/* รายการผลงาน (แสดงผล) */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 border-l-4 border-yellow-400 pl-3">แฟ้มสะสมผลงาน ({portfolios.length})</h3>
            
            {portfolios.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed text-gray-400">ยังไม่มีข้อมูลผลงาน</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {portfolios.map((work, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">
                            {/* --- ใหม่: แสดงรูปผลงาน --- */}
                            {work.photoURL && (
                                <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-gray-100">
                                    <img src={work.photoURL} alt={work.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-lg text-[#000080] mb-2">{work.title}</h4>
                                    <p className="text-gray-600 whitespace-pre-wrap">{work.description}</p>
                                </div>
                                
                                {/* ปุ่มจัดการ (ซ่อนตอน Print) */}
                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t no-print">
                                    <button 
                                        onClick={() => startEditPortfolio(index)}
                                        className="text-yellow-600 hover:bg-yellow-50 px-3 py-1 rounded text-sm flex items-center gap-1"
                                    >
                                        <Edit2 size={14}/> แก้ไข
                                    </button>
                                    <button 
                                        onClick={() => deletePortfolio(index)}
                                        className="text-red-500 hover:bg-red-50 px-3 py-1 rounded text-sm flex items-center gap-1"
                                    >
                                        <Trash2 size={14}/> ลบ
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center mt-12 text-gray-400 text-sm py-4 no-print">
         © 2025 BKS HR System - โรงเรียนบ้านบากัน
      </div>
    </div>
  );
}