import JWT_SECRET from "./config";
const jwt = require("jsonwebtoken");

export const authMiddleware = (req,res,next) => {
    const authHeader = req.headers.Authorization;
    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(403).json({});
    }
    const token = authHeader.split('')[1];
    const tokenVerification = jwt.verify(token,JWT_SECRET);
    if(!tokenVerification){
        return res.statusCode(411);
    }
    req.userId = tokenVerification.userId;
    next();
}
