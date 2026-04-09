// server/server.js
import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node"
import { clerkWebhooks } from './controllers/webhooks.js'
import connectCloudinary from './config/cloudinary.js'
import userRoutes from './routes/userRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import { clerkMiddleware } from '@clerk/express'

//Initialize express
const app = express()
//connect to DB and services
await connectDB()
await connectCloudinary()

// Webhook route must receive raw body for Svix signature verification
app.post('/webhooks', express.raw({ type: '*/*' }), clerkWebhooks)

// Clerk needs CLERK_SECRET_KEY in .env for Bearer token verification (user auth)
if (!process.env.CLERK_SECRET_KEY) {
  console.warn("⚠️ CLERK_SECRET_KEY is not set — user (Clerk) auth will fail. Add it from Clerk Dashboard → API Keys.")
}

//Middlewares
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'token'],
}))
app.use(clerkMiddleware({ signInUrl: false }))
app.use(express.json())

//Routes
app.get('/', (req, res) => res.send("API working"))
app.use('/api/user', userRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/company', companyRoutes)
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error")
})

//Port
const PORT = process.env.PORT || 5000

Sentry.setupExpressErrorHandler(app)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})