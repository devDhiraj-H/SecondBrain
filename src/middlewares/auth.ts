import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

dotenv.config();
const JWT_PASSWORD = process.env.JWT_PASSWORD ?? "";


export const auther = (req : Request, res : Response, next : NextFunction) =>{
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header as string, JWT_PASSWORD);

    console.log(decoded);

    if(typeof decoded !== "string"){
        req.userId = (decoded.id);
        next();
    }else{
        res.status(403).json({
            message : "you are not logged in"
        })
    }
}