import { supabase, supabaseConfigError, supabaseStorageBucket } from '@/lib/supabase'

const STORAGE_FOLDER = 'catalogo'
const STORAGE_URL_PATTERN = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/i

const createFallbackError = (message) => supabaseConfigError || new Error(message)
const bucketHelpText = () =>
  `Creá un bucket público llamado "${supabaseStorageBucket}" en Supabase Storage, o cambia VITE_SUPABASE_STORAGE_BUCKET por el nombre correcto.`

const createBucketNotFoundError = () =>
  new Error(`No se encontró el bucket "${supabaseStorageBucket}". ${bucketHelpText()}`)

const isBucketNotFoundError = (error) => {
  const message = String(error?.message || error || '').toLowerCase()
  return message.includes('bucket not found') || message.includes('no such bucket')
}

const toFriendlyStorageError = (error) => {
  if (!error) return error
  if (isBucketNotFoundError(error)) return createBucketNotFoundError()
  return error
}

const normalizeText = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const uniqueId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const resizeImageFile = async (file, { maxSide = 1400, quality = 0.84, type = 'image/webp' } = {}) => {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(file)
  })

  const image = await new Promise((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('No se pudo cargar la imagen'))
    element.src = dataUrl
  })

  const width = image.naturalWidth || image.width || 1
  const height = image.naturalHeight || image.height || 1
  const scale = Math.min(1, maxSide / Math.max(width, height))
  const targetWidth = Math.max(1, Math.round(width * scale))
  const targetHeight = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const context = canvas.getContext('2d')
  if (!context) return file

  context.drawImage(image, 0, 0, targetWidth, targetHeight)

  return await new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(file)
          return
        }

        const fileName = `${normalizeText(file.name || 'imagen') || 'imagen'}.webp`
        resolve(new File([blob], fileName, { type: blob.type || type }))
      },
      type,
      quality
    )
  })
}

export const isSupabaseStorageUrl = (url = '') => {
  const path = extractSupabaseStoragePath(url)
  return Boolean(path)
}

export const extractSupabaseStoragePath = (url = '') => {
  if (typeof url !== 'string') return null
  const match = url.match(STORAGE_URL_PATTERN)
  if (!match) return null
  const bucket = decodeURIComponent(match[1])
  if (bucket !== supabaseStorageBucket) return null
  return decodeURIComponent(match[2])
}

export async function uploadProductImage(file, { slug = 'producto', index = 0 } = {}) {
  if (!supabase) {
    return {
      ok: false,
      error: createFallbackError('Supabase no está configurado'),
    }
  }

  if (!(file instanceof File)) {
    return {
      ok: false,
      error: new Error('Archivo inválido'),
    }
  }

  const optimizedFile = await resizeImageFile(file)
  const safeSlug = normalizeText(slug) || 'producto'
  const safeName = normalizeText(file.name) || 'imagen'
  const fileExtension = (optimizedFile?.name || safeName).split('.').pop() || 'webp'
  const storagePath = `${STORAGE_FOLDER}/${safeSlug}-${Date.now()}-${index}-${uniqueId()}.${fileExtension}`

  const { error } = await supabase.storage.from(supabaseStorageBucket).upload(storagePath, optimizedFile, {
    cacheControl: '3600',
    contentType: optimizedFile.type || file.type || 'image/webp',
    upsert: false,
  })

  if (error) {
    return {
      ok: false,
      error: toFriendlyStorageError(error),
    }
  }

  const { data } = supabase.storage.from(supabaseStorageBucket).getPublicUrl(storagePath)

  return {
    ok: true,
    path: storagePath,
    url: data.publicUrl,
  }
}

export async function deleteSupabaseStorageUrls(urls = []) {
  if (!supabase) {
    return {
      ok: false,
      error: createFallbackError('Supabase no está configurado'),
    }
  }

  const paths = urls.map((url) => extractSupabaseStoragePath(url)).filter(Boolean)
  if (!paths.length) {
    return { ok: true, deleted: 0 }
  }

  const { error } = await supabase.storage.from(supabaseStorageBucket).remove(paths)
  if (error) {
    return {
      ok: false,
      error: toFriendlyStorageError(error),
    }
  }

  return {
    ok: true,
    deleted: paths.length,
  }
}
