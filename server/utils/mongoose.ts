import mongoose from 'mongoose'

const MONGODB_URI = process.env.NUXT_MONGOOSE_URI

if (!MONGODB_URI) {
  throw new Error('Please define NUXT_MONGOOSE_URI environment variable')
}

/**
 * Global connection cache for serverless environments
 * Maintains cached connection across function invocations
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function getMongoConnection() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 2,
      minPoolSize: 1,
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default getMongoConnection
