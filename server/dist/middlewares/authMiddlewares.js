import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }
    const userToken = authHeader.split(" ")[1];
    if (!userToken) {
        return res.status(400).json({ message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
        if (typeof decoded === "string") {
            return res.status(403).json({ message: "Invalid token payload" });
        }
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({ message: "Token is not valid" });
    }
}
//# sourceMappingURL=authMiddlewares.js.map