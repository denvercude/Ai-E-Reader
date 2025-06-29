import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const protect = async (req, res, next) => {
    let token;

    // start by checking if the req has an authorization header and 'Bearer', which
    // is the typical format for sending JWTs
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try{
            // extract the JWT token from the header, splitting on the space and
            // taking the second part
            token = req.headers.authorization.split(' ')[1];

            // veryify and decode the token using JWT_SECRET from .env
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // find the user in our database using the user id extracted from the
            // decoded JWT token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        }catch (error) {
            return res.status(401).json({ success: false, message: 'Not authorized, token failed'});
        }
    }

    if(!token) {
        return res.status(401).json({success: false, message: 'Not authorized, no token'});
    }
};