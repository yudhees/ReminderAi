import mongoose from 'mongoose'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('close', async () => {
    await mongoose.connection.close()
  })
})
