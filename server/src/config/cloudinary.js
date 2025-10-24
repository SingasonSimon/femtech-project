import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';

// Initialize Cloudinary configuration
let cloudinaryConfigured = false;

const configureCloudinary = () => {
    if (!cloudinaryConfigured) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        cloudinaryConfigured = true;
    }
};

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Configure multer
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Helper function to upload to Cloudinary
export const uploadToCloudinary = async (file, folder = 'femtech') => {
    try {
        // Ensure Cloudinary is configured before uploading
        configureCloudinary();

        const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            {
                folder: folder,
                resource_type: 'auto',
                transformation: [
                    { width: 1200, height: 630, crop: 'limit', quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            }
        );
        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

// Helper function to delete image from Cloudinary
export const deleteImage = async (publicId) => {
    try {
        // Ensure Cloudinary is configured before deleting
        configureCloudinary();

        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};

// Helper function to get image URL from public ID
export const getImageUrl = (publicId, options = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        ...options
    });
};

export default cloudinary;
