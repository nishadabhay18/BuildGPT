// import Chat from "../models/Chat"
// import User from "../models/User"
// import imagekit from "../config/imageKit.js"
// import axios from 'axios'
// import openai from "../config/openai.js"



// // Text based AI Chat Message controller
// export const textMessageController = async (req, res) => {
//     try {
//         const userId = req.user._id
        
//         // check credits
//         if (req.user.credits < 1) {
//             return res.json({
//                 success: true,
//                 message: "You dont have enough credist to use this feature"
//             })
//         }

//         const { chatId, prompt } = req.body

//         const chat = await Chat.findOne({
//             userId,
//             _id: chatId
//         })
//         chat.messages.push({
//             role: "user",
//             content: prompt,
//             timestamp: Date.now(),
//             isImage: false
//         })

//         // using ai
//         const { choices } = await openai.chat.completions.create({
//             model: "gemini-3.8-flash",
//             messages: [
//                 {
//                     role: "user",
//                     content: prompt,
//                 },
//             ],
//         });

//         const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false }
//         res.json({
//             success: true,
//             reply
//         })

//         chat.messages.push(reply)
//         await chat.save()

//         await User.updateOne(
//             { _id: userId },
//             { $inc: { credits: -1 } }
//         )
//     }
//     catch (err) {
//         return res.json({
//             success: false,
//             message: err.message
//         })
//     }
// }


// // Image generation message controller
// export const imageMessageController = async (req, res) => {
//     try {
//         const userId = req.user._id
//         // check credits
//         if (req.user.credits < 2) {
//             return res.json({
//                 success: true,
//                 message: "You dont have enough credist to use this feature"
//             })
//         }
//         const { prompt, chatId, isPublished } = req.body
//         // find chat
//         const chat = await Chat.findOne({
//             userId, _id: chatId
//         })

//         // push user message
//         chat.messages.push({
//             role: "user",
//             content: prompt,
//             timestamp: Date.now(),
//             isImage: false
//         })

//         // encode the prompt
//         const encodedPrompt = encodeURIComponent(prompt)

//         // construct imagekit ai generation url
//         const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`

//         // trigger generation by fetching from imagekit
//         const aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer" })

//         // convert to base64
//         const base64Iamge = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`

//         // upload to imagekit media library
//         const uploadResponse = await imagekit.upload({
//             file: base64Image,
//             fileName: `${Date.now()}.png`,
//             folder: "buildgpt",
//         })

//         const reply = { role: 'assistant', content: uploadResponse.url, timestamp: Date.now(), isImage: true, isPublished }
//         res.json({
//             success: true,
//             reply
//         })

//         chat.messages.push(reply)
//         await chat.save()

//         await User.updateOne({ _id: userId }, { $inc: { credits: -2 } })

//     }
//     catch (err) {
//         return res.json({
//             success: false,
//             message: err.message
//         })
//     }
// }



import Chat from "../models/Chat.js"
import User from "../models/User.js"
import imagekit from "../config/imageKit.js"
import axios from "axios"
import openai from "../config/openai.js"


// Text based AI Chat Message controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id

        // check credits
        if (req.user.credits < 1) {
            return res.json({
                success: false,
                message: "You dont have enough credits to use this feature"
            })
        }

        const { chatId, prompt } = req.body

        const chat = await Chat.findOne({
            userId,
            _id: chatId
        })

        if (!chat) {
            return res.json({
                success: false,
                message: "Chat not found"
            })
        }

        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        })

        // using ai
        const { choices } = await openai.chat.completions.create({
            model: "gemini-3.8-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        })

        const reply = {
            ...choices[0].message,
            timestamp: Date.now(),
            isImage: false
        }

        chat.messages.push(reply)
        await chat.save()

        await User.updateOne(
            { _id: userId },
            { $inc: { credits: -1 } }
        )

        res.json({
            success: true,
            reply
        })
    }
    catch (err) {
        return res.json({
            success: false,
            message: err.message
        })
    }
}


// Image generation message controller
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id

        // check credits
        if (req.user.credits < 2) {
            return res.json({
                success: false,
                message: "You dont have enough credits to use this feature"
            })
        }

        const { prompt, chatId, isPublished } = req.body

        // find chat
        const chat = await Chat.findOne({
            userId,
            _id: chatId
        })

        if (!chat) {
            return res.json({
                success: false,
                message: "Chat not found"
            })
        }

        // push user message
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        })

        // encode the prompt
        const encodedPrompt = encodeURIComponent(prompt)

        // construct imagekit ai generation url
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`

        // trigger generation by fetching from imagekit
        const aiImageResponse = await axios.get(generatedImageUrl, {
            responseType: "arraybuffer"
        })

        // convert to base64
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`

        // upload to imagekit media library
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "buildgpt",
        })

        const reply = {
            role: "assistant",
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        }

        chat.messages.push(reply)
        await chat.save()

        await User.updateOne(
            { _id: userId },
            { $inc: { credits: -2 } }
        )

        res.json({
            success: true,
            reply
        })
    }
    catch (err) {
        return res.json({
            success: false,
            message: err.message
        })
    }
}
