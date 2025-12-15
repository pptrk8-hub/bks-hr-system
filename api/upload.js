import { v2 as cloudinary } from 'cloudinary';

// ตั้งค่า Cloudinary โดยใช้ชื่อกุญแจชุดใหม่ (BKS_...)
cloudinary.config({
  cloud_name: process.env.BKS_CLOUD_NAME,     // เปลี่ยนชื่อใหม่
  api_key: process.env.BKS_API_KEY,           // เปลี่ยนชื่อใหม่
  api_secret: process.env.BKS_API_SECRET,     // เปลี่ยนชื่อใหม่
});

export default async function handler(request, response) {
  // แก้ปัญหา CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') return response.status(200).end();

  // เช็กกุญแจ (Debugging)
  const missingKeys = [];
  if (!process.env.BKS_CLOUD_NAME) missingKeys.push('BKS_CLOUD_NAME');
  if (!process.env.BKS_API_KEY) missingKeys.push('BKS_API_KEY');
  if (!process.env.BKS_API_SECRET) missingKeys.push('BKS_API_SECRET');

  if (missingKeys.length > 0) {
      console.error("❌ MISSING KEYS:", missingKeys.join(", "));
      return response.status(500).json({ 
          error: 'Configuration Error', 
          details: `ระบบหากุญแจไม่เจอ: ${missingKeys.join(", ")}`
      });
  }

  try {
    const { data } = request.body;
    if (!data) return response.status(400).json({ error: 'No file data' });

    const uploadResponse = await cloudinary.uploader.upload(data, {
      folder: 'bks_hr_certificates',
      resource_type: "auto"
    });

    return response.status(200).json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error('Upload Failed:', error);
    return response.status(500).json({ error: error.message });
  }
}