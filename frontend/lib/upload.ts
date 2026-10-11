import { api } from './api-client'

/**
 * Uploads a file/blob directly to Cloudinary using signed params from the backend.
 * Returns the secure URL, or null on any failure (caller can fall back to a local blob).
 */
export async function uploadToCloudinary(file: Blob): Promise<string | null> {
  try {
    const sign = await api.signUpload()
    const form = new FormData()
    form.append('file', file)
    form.append('api_key', sign.apiKey)
    form.append('timestamp', String(sign.timestamp))
    form.append('signature', sign.signature)
    form.append('folder', sign.folder)
    const res = await fetch(sign.uploadUrl, { method: 'POST', body: form })
    if (!res.ok) return null
    const data = (await res.json()) as { secure_url?: string }
    return data.secure_url ?? null
  } catch {
    return null
  }
}
