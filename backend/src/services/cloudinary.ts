import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const FOLDER = 'trailmap'

/**
 * Produces signed params for a direct browser → Cloudinary upload.
 * The secret never leaves the server; the client uploads with the signature.
 */
export function signUpload() {
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = { timestamp, folder: FOLDER }
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string,
  )
  return {
    signature,
    timestamp,
    folder: FOLDER,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
  }
}
