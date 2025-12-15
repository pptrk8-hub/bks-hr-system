import { v2 as cloudinary } from 'cloudinary';

// 🧨 Hardcode: ใส่รหัสตรงๆ เพื่อตัดปัญหาเรื่อง Environment Variables (ใช้เพื่อเทสเท่านั้น)
cloudinary.config({
  cloud_name: 'dksqclesb',
  api_key: '164256515377321',
  api_secret: 'v0DN2fdL46F4nZHvMw7R2fJ1obg'
});

export default async function handler(request, response) {
  // แก้ปัญหา CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') return response.status(200).end();

  try {
    const { data } = request.body;
    if (!data) return response.status(400).json({ error: 'No file data provided' });

    // สั่งอัปโหลด
    const uploadResponse = await cloudinary.uploader.upload(data, {
      folder: 'bks_hr_certificates',
      resource_type: "auto"
    });

    return response.status(200).json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error('❌ Upload Failed:', error);
    return response.status(500).json({ 
        error: error.message || 'Unknown Upload Error',
        details: error // ส่งรายละเอียดกลับมาดูถ้าพังอีก
    });
  }
}