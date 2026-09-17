// import User from "../models/User.js"
// import jwt from "jsonwebtoken"

// // Only Authenticated user can access route
// export const protect = async (req, res, next) => {
//     let token = req.headers.authorization

//     if (token && token.startsWith("Bearer")) {
//         token = token.split(" ")[1]
//     } else {
//         return res.status(401).json({
//             success: false,
//             message: "Not authorized, no token"
//         })
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET)
//         const userId = decoded.id

//         const user = await User.findById(userId)

//         if (!user) {
//             return res.json({
//                 success: false,
//                 message: "Not authorized, user not found"
//             })
//         }

//         req.user = user
//         next()
//     }
//     catch (err) {
//         return res.status(401).json({
//             success: false,
//             message: "Not authorized, token failed"
//         })
//     }
// }


import User from "../models/User.js"
import jwt from "jsonwebtoken"

export const protect = async (req, res, next) => {
    let token = req.headers.authorization

    console.log("AUTH HEADER:", token)
    console.log("JWT SECRET EXISTS:", !!process.env.JWT_SECRET)

    if (token && token.startsWith("Bearer")) {
        token = token.split(" ")[1]
    } else {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no token"
        })
    }

    try {
        console.log("TOKEN:", token)

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        console.log("DECODED:", decoded)

        const userId = decoded.id

        const user = await User.findById(userId)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, user not found"
            })
        }

        req.user = user
        next()
    }
    catch (err) {
        console.log("JWT ERROR:", err.message)

        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed"
        })
    }
}