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
import { User } from '../models/index.js';
import io from '../socket.js';
import bcrypt from 'bcrypt';
export const createNewUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(422)
            .json({ message: 'Validation failed', errors: errors.array() });
    }
    const { email } = req.body;
    try {
        const existingUser = yield User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: `User already exists with this id ${email}` });
        }
        const defaultPassword = 'Test123123'; // TODO. generate and send by email
        const salt = yield bcrypt.genSalt();
        const password = yield bcrypt.hash(defaultPassword, salt);
        const newUser = new User(Object.assign(Object.assign({}, req.body), { password }));
        const user = yield newUser.save();
        if (user) {
            io.getIO().emit('invalidate', { qk: ['users'] });
            return res
                .status(201)
                .json({ message: 'User created successfully', data: user });
        }
    }
    catch (err) {
        if (!res.headersSent) {
            return next(err);
        }
    }
});
export const editUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    const { userId } = req.params;
    try {
        const updatedUser = yield User.findByIdAndUpdate(userId, {
            $set: Object.assign({}, req.body),
        }, { new: true });
        return res
            .status(200)
            .json({ message: 'User was updated', data: updatedUser });
    }
    catch (err) {
        return next(err);
    }
});
export const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    const page = Number(req.query.page);
    const perPage = Number(req.query.perPage) || 5;
    const skip = (page - 1) * perPage;
    // Search params
    const active = req.query.active;
    const query = {};
    if (active) {
        query.active = active;
    }
    try {
        const totalItems = yield User.find(query).countDocuments();
        const users = yield User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage);
        return res.status(200).json({
            message: 'Success',
            data: users,
            total: totalItems,
            hasNextPage: perPage * page < totalItems,
            hasPreviousPage: page > 1,
            currentPage: page || 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalItems / perPage),
            perPage: perPage,
        });
    }
    catch (err) {
        return next(err);
    }
});
export const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    const userId = req.params.userId;
    try {
        const user = yield User.findById(userId, { password: 0 });
        return res.status(200).json({ data: user });
    }
    catch (err) {
        return next(err);
    }
});
export const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    const userId = req.params.userId;
    try {
        yield User.deleteOne({ _id: userId });
        io.getIO().emit('invalidate', { qk: ['users'] });
        res.status(200).json({ message: 'Successfully deleted' });
    }
    catch (err) {
        return next(err);
    }
});
