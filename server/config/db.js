import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        // mongoose.connection.on('connected', () => console.log('Database connected'))
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Database connected successfully')
    }
    catch (err) {
        console.log('Error while connecting with DB', err)
    }
}

export default connectDB 