import jwt from 'jsonwebtoken';
const jwtSecret = process.env.JWT_SECRET || 'xyz890';
export const requireAuth = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization;
    if (token) {
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if (err) {
                res.status(403).json({ message: 'Not logged in' });
            }
            else {
                console.log({ decodedToken });
                next();
            }
        });
        return;
    }
    res.status(403).json({ message: 'Not logged in' });
};
