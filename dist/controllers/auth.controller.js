var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { serverResponse } from '../util/response.js';
import { apiMessages } from '../config/messages.js';
const maxAge = 3 * 24 * 60 * 60;
const jwtSecret = process.env.JWT_SECRET || 'xyz890';
const createToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: maxAge,
    });
};
export const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'Validation failed', errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const user = yield User.create({ email, password, role: 'admin' });
        const token = createToken(user._id);
        res.cookie('accessToken', token, {
            httpOnly: true,
            maxAge: maxAge * 1000,
        });
        // @ts-ignore
        serverResponse.sendSuccess(res, apiMessages.SUCCESSFUL, user);
    }
    catch (error) {
        next(error);
    }
});
export const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'Validation failed', errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        // @ts-ignore
        const user = yield User.login(email, password);
        const token = createToken(user._id);
        res.cookie('accessToken', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ accessToken: token, userData: user });
    }
    catch (error) {
        next(error);
    }
});
export const me = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'Validation failed', errors: errors.array() });
    }
    try {
        const token = req.cookies.accessToken || req.headers.authorization;
        const parsedToken = jwt.decode(token);
        if (parsedToken === null) {
            throw Error('User not found');
        }
        // @ts-ignore
        const user = yield User.findById(parsedToken.id, { password: 0 });
        res.status(200).json({ accessToken: token, userData: user });
    }
    catch (error) {
        next(error);
    }
});
