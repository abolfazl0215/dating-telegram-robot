const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");
const { default: axios } = require("axios");
const { v4: uuidv4 } = require("uuid");

// پیکربندی Cloudinary
cloudinary.config({
  cloud_name: "dtakyi9mf",
  api_key: "588183267814191",
  api_secret: "pX-FbXATvi7couH36CFWn_PURf4",
  secure: true,
});

const uploadImageFromUrl = async (imageUrl, options = {}) => {
  const fileName = `${Date.now()}-${uuidv4()}`;

  // تنظیمات پیش‌فرض برای فشردگی
  const defaultOptions = {
    quality: 80, // کیفیت JPEG (1-100)
    width: 800, // حداکثر عرض
    height: 800, // حداکثر ارتفاع
    format: "jpeg", // فرمت خروجی
  };

  const config = { ...defaultOptions, ...options };

  try {
    // دانلود تصویر به صورت باینری
    // console.time("downloadImage");
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    // console.timeEnd("downloadImage");

    // فشردگی و بهینه‌سازی تصویر با Sharp
    console.time("compress");
    const compressedImageBuffer = await sharp(
      Buffer.from(response.data),
    )
      .resize({
        width: config.width,
        height: config.height,
        fit: "inside", // حفظ نسبت ابعاد
        withoutEnlargement: true, // عدم بزرگ‌نمایی تصاویر کوچک
      })
      .jpeg({
        quality: config.quality,
        progressive: true, // بارگذاری تدریجی
        mozjpeg: true, // استفاده از موتور mozjpeg برای فشردگی بهتر
      })
      .toBuffer();
    console.timeEnd("compress");

    // تبدیل buffer به base64 برای آپلود
    const base64Image = compressedImageBuffer.toString("base64");
    const dataUri = `data:image/jpeg;base64,${base64Image}`;

    // آپلود به Cloudinary با استفاده از روش upload
    // console.time("upload");
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      public_id: fileName,
      folder: "uploads", // پوشه اختیاری برای سازماندهی
      resource_type: "image",
      format: "jpg",
      quality: config.quality,
      overwrite: true,
      transformation: [
        {
          width: config.width,
          height: config.height,
          crop: "limit", // حفظ نسبت ابعاد
          quality: config.quality,
        },
      ],
    });
    // console.timeEnd("upload");

    // console.log(`تصویر فشرده شد و آپلود شد:`, {
    //   fileName,
    //   originalSize: Buffer.from(response.data).length,
    //   compressedSize: compressedImageBuffer.length,
    //   compressionRatio:
    //     Math.round(
    //       (1 -
    //         compressedImageBuffer.length /
    //           Buffer.from(response.data).length) *
    //         100,
    //     ) + "%",
    // });

    return uploadResult.secure_url;
  } catch (error) {
    console.error("خطا در آپلود تصویر از URL:", error);

    // بررسی خطای cloud_name
    if (
      error.http_code === 401 &&
      error.message?.includes("cloud_name")
    ) {
      console.error(
        "⚠️ خطا: cloud_name معتبر نیست. لطفاً از داشبورد Cloudinary > Settings > API Keys، مقدار دقیق Cloud Name را کپی کنید.",
      );
      console.error("Cloudinary Config:", {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key?.substring(0, 5) + "***",
      });
    }

    throw error;
  }
};

module.exports = {
  uploadImageFromUrl,
};
