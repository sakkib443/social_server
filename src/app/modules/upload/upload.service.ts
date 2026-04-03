import { v2 as cloudinary } from 'cloudinary';
import config from '../../config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadService = {
  // Upload image to Cloudinary
  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      // Convert buffer to base64
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      cloudinary.uploader.upload(
        dataURI,
        {
          folder: 'socialvillage',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' }, // Max dimensions
            { quality: 'auto:good' }, // Auto quality
            { fetch_format: 'auto' }, // Auto format (webp if supported)
          ],
        },
        (error, result) => {
          if (error) {
            reject({ status: 500, message: 'Image upload failed: ' + error.message });
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          } else {
            reject({ status: 500, message: 'Image upload failed' });
          }
        }
      );
    });
  },

  // Delete image from Cloudinary
  async deleteImage(publicId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject({ status: 500, message: 'Image deletion failed: ' + error.message });
        } else {
          resolve(result.result === 'ok');
        }
      });
    });
  },
};
