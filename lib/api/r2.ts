import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 Client (S3-Compatible)
 */
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME;

/**
 * Upload a file to R2 and return the public URL
 */
export const uploadToR2 = async (file: File, path: string): Promise<string> => {
  try {
    const key = `${path}/${Date.now()}-${file.name}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: file.type,
    });

    await r2Client.send(command);
    
    // Construct public URL (assumes you have a public domain/bucket access configured)
    const publicUrl = `${import.meta.env.VITE_R2_PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error("R2 Upload Error:", error);
    throw error;
  }
};
