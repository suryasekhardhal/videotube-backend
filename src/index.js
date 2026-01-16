// require('dotenv').config({path:`./env`})

import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from 'dotenv';

dotenv.config({
    path:'./env'
})




connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server running on PORT:${process.env.PORT} `);
    })
})
.catch((err)=>{
    console.log("MONGO DB CONNECTION ERROR", err);
    
})













/*
import express from "express"

const app =express();

(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("ERROR",(error)=>{
            console.log("ERROR",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`the server listen on ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("ERROR",error);
        throw error
    }
})()
*/    