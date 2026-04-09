// server/controllers/webhooks.js
import { Webhook } from "svix"
import User from "../models/User.js"

const getPrimaryEmail = (emailAddresses = []) => {
    if (!Array.isArray(emailAddresses) || emailAddresses.length === 0) {
        return ''
    }

    return emailAddresses[0]?.email_address || ''
}

const getDisplayName = (data, email) => {
    const fullName = `${data?.first_name || ''} ${data?.last_name || ''}`.trim()

    if (fullName) {
        return fullName
    }

    if (data?.username) {
        return data.username
    }

    return email || 'User'
}

//API controller function to manage clerk user with database
export const clerkWebhooks = async (req, res) => {
    try {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

        if (!webhookSecret) {
            return res.status(500).json({ success: false, message: 'Missing Clerk webhook secret' })
        }

        const svixId = req.headers['svix-id']
        const svixTimestamp = req.headers['svix-timestamp']
        const svixSignature = req.headers['svix-signature']

        if (!svixId || !svixTimestamp || !svixSignature) {
            return res.status(400).json({ success: false, message: 'Missing Svix headers' })
        }

        // Clerk sends the payload as raw bytes for signature verification.
        const payload = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body)

        // Create a svix instance with the clerk webhook secret.
        const webhook = new Webhook(webhookSecret)

        webhook.verify(payload, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature
        })

        //Getting data from the request body
        const { data, type } = JSON.parse(payload)
        const email = getPrimaryEmail(data?.email_addresses)
        const name = getDisplayName(data, email)

        //Switch case to handle different webhook events
        switch (type) {
            case 'user.created': {
                await User.findOneAndUpdate(
                    { clerkId: data.id },
                    {
                        clerkId: data.id,
                        email,
                        name,
                        image: data?.image_url || 'https://ui-avatars.com/api/?name=User',
                        resume: ''
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                )

                return res.status(200).json({ success: true })
            }

            case 'user.updated': {
                await User.findOneAndUpdate(
                    { clerkId: data.id },
                    {
                        clerkId: data.id,
                        email,
                        name,
                        image: data?.image_url || 'https://ui-avatars.com/api/?name=User'
                    },
                    { new: true }
                )

                return res.status(200).json({ success: true })
            }

            case 'user.deleted': {
                await User.deleteOne({ clerkId: data.id })
                return res.status(200).json({ success: true })
            }

            default:
                return res.status(200).json({ success: true, message: 'Event ignored' })
        }
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({ success: false, message: 'Webhooks Error' })
    }
}