import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {},
    username: {},
    password: {},
    name: {},
    musics: [{}],
});

userSchema.pre('save', async function() {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 5);
    }
});

const User = mongoose.model('User', userSchema);

export default User;