import { v2 as cloudinary } from 'cloudinary';

// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(request, response) {
  // 1. แก้ปัญหา CORS (ให้หน้าเว็บคุยกับหลังบ้านได้)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // 2. เช็กว่ากุญแจมาครบไหม? (ถ้าไม่ครบ จะแจ้ง Error ชัดๆ)
  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("❌ ERROR: Missing Cloudinary Keys in Vercel Environment Variables");
      return response.status(500).json({ 
          error: 'Server Configuration Error: Missing API Keys',
          debug: {
              hasCloudName: !!process.env.VITE_CLOUDINARY_CLOUD_NAME,
              hasApiKey: !!process.env.CLOUDINARY_API_KEY,
              hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
          }
      });
  }

  // 3. เริ่มอัปโหลด
  try {
    const { data } = request.body;
    
    if (!data) {
        return response.status(400).json({ error: 'No file data provided' });
    }

    // อัปโหลดขึ้น Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(data, {
      folder: 'bks_hr_certificates', // ตั้งชื่อโฟลเดอร์เก็บเกียรติบัตร
      resource_type: "auto" // รับได้ทั้งรูปและ PDF
    });

    return response.status(200).json({ url: uploadResponse.secure_url });
    
  } catch (error) {
    console.error('❌ Upload Failed:', error);
    return response.status(500).json({ error: error.message || 'Something went wrong during upload' });
  }
}