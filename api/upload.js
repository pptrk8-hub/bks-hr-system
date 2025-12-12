// api/upload.js
// โค้ดนี้จะทำงานบน Server ของ Vercel เท่านั้น ปลอดภัยแน่นอน
import { v2 as cloudinary } from 'cloudinary';
// --- เพิ่มบรรทัดนี้เพื่อแอบดูว่ากุญแจมาไหม (ดูใน Logs) ---
console.log("DEBUG KEYS:", {
   cloud: process.env.VITE_CLOUDINARY_CLOUD_NAME ? "Yes" : "No",
   key: process.env.CLOUDINARY_API_KEY ? "Yes" : "No",
   secret: process.env.CLOUDINARY_API_SECRET ? "Yes" : "No"
});
// -----------------------------------------------------

cloudinary.config({
   // ... (โค้ดเดิม)
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(request, response) {
  // แก้ปัญหา CORS (อนุญาตให้หน้าเว็บเราคุยกับหลังบ้านได้)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { data } = request.body;
    
    // อัปโหลดขึ้น Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(data, {
      folder: 'bks_hr_teachers',
    });

    // ส่ง Link กลับไปให้หน้าเว็บ
    return response.status(200).json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error('Upload Error:', error);
    return response.status(500).json({ error: 'Upload failed' });
  }
} 