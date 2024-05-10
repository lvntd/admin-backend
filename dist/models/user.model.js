var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2,
    },
    lastName: {
        type: String,
        required: true,
        minLength: 2,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        required: true,
    },
    phoneNumber: { type: String, minLength: 9 },
    birthday: Date,
    joinDate: Date,
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    about: { type: String, maxLength: 500 },
    active: {
        type: Boolean,
        required: true,
    },
}, { timestamps: true });
userSchema.statics.login = function (email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const user = yield this.findOne({ email });
        if (user) {
            // @ts-ignore
            const auth = yield bcrypt.compare(password, user.password);
            console.log({ auth });
            if (auth) {
                return user;
            }
            throw new Error('Incorrect password');
        }
        throw new Error('This email does not exist');
    });
};
export const User = model('User', userSchema);
