'use server';

import crypto from 'node:crypto';
import { deleteSession, verifySession } from '@/lib/auth';
import { slugify } from '@/lib/slugify';
import { redirect } from 'next/navigation';

// Admin Server Actions
// Handles admin logout and Cloudinary upload parameter generation (signed or unsigned)

export async function logoutAction() {
  await deleteSession();
  redirect('/admin/login');
}

/**
 * Returns Cloudinary upload configuration parameters for authenticated admin users.
 * Supports both unsigned and crypto-signed uploads depending on available environment variables.
 */
export async function getCloudinaryUploadParamsAction(subfolder = 'general') {
  const { isAuth } = await verifySession();
  if (!isAuth) {
    return { error: 'Неавторизований доступ. Будь ласка, увійдіть знову.' };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !uploadPreset) {
    return {
      error: 'Не налаштовано CLOUDINARY_CLOUD_NAME або CLOUDINARY_UPLOAD_PRESET у .env',
    };
  }

  // Resolve target Cloudinary folder based on subfolder category
  const cleanSubfolder = slugify(subfolder) || 'general';
  let fullFolder = `events/${cleanSubfolder}`;
  if (cleanSubfolder === 'team' || cleanSubfolder.startsWith('team-')) {
    fullFolder = 'team';
  } else if (cleanSubfolder === 'sections' || cleanSubfolder.startsWith('section')) {
    fullFolder = 'sections';
  }

  // Generate cryptographic signature (Signed Upload) if API key & secret are present
  if (apiKey && apiSecret) {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = {
      asset_folder: fullFolder,
      folder: fullFolder,
      timestamp,
      upload_preset: uploadPreset,
    };

    const stringToSign =
      Object.keys(paramsToSign)
        .sort()
        .map((key) => `${key}=${paramsToSign[key]}`)
        .join('&') + apiSecret;

    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    return {
      cloudName,
      uploadPreset,
      folder: fullFolder,
      apiKey,
      timestamp,
      signature,
    };
  }

  return {
    cloudName,
    uploadPreset,
    folder: fullFolder,
  };
}