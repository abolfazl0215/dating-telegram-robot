const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { default: axios } = require("axios");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const uploadImageFromUrl = async (imageUrl, options = {}) => {
  const fileName = `${Date.now()}-${uuidv4()}.jpg`;

  // تنظیمات پیش‌فرض برای فشردگی
  const defaultOptions = {
    quality: 80, // کیفیت JPEG (1-100)
    width: 800, // حداکثر عرض
    height: 800, // حداکثر ارتفاع
    format: "jpeg", // فرمت خروجی
  };

  const config = { ...defaultOptions, ...options };

  const client = new S3Client({
    region: "default",
    endpoint: process.env.LIARA_ENDPOINT,
    credentials: {
      accessKeyId: process.env.LIARA_ACCESS_KEY,
      secretAccessKey: process.env.LIARA_SECRET_KEY,
    },
  });

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

    const params = {
      Body: compressedImageBuffer,
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: fileName,
      ContentType: "image/jpeg",
    };

    // console.time("upload");
    await client.send(new PutObjectCommand(params));
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

    return `https://pouns-storage.storage.c2.liara.space/${fileName}`;
  } catch (error) {
    console.error("خطا در آپلود تصویر از URL:", error);
    throw error;
  }
};

module.exports = {
  uploadImageFromUrl,
};
