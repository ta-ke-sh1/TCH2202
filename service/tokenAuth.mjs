import { initializeApp } from "firebase/app";
import { getFirestore, getDoc, doc, setDoc } from "firebase/firestore";
import * as constants from "./constants.mjs";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { User } from "../model/user.mjs";

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);

import bcrypt from "bcryptjs";

function containsRole(role) {
    return function middle(req, res, next) {
        var token = req.get("Authorization");
        if (token === undefined) {
            res.status(401).send({
                success: false,
                message: "No Token Provided.",
            });
            return;
        }

        if (!token.startsWith("Bearer ")) {
            res.status(400).send({
                success: false,
                message: "Invalid token format.",
            });
            return;
        }

        try {
            var decoded = jwt.verify(
                token.substring(7, token.length),
                process.env.JWT_SECRET_ACCESS
            );
        } catch (err) {
            res.status(406).send({ success: false, message: err });
            return;
        }

        if (!decoded.role.includes(role)) {
            res.status(401).send({
                success: false,
                message: "You are unauthorized for this action!",
            });
        } else {
            var decoded = jwt.verify(
                token.substring(7, token.length),
                process.env.JWT_SECRET_ACCESS
            );
            req.decodedToken = decoded;
            next();
        }
    };
}

const register = async (document) => {
    var isExist = await isExists(document.username);
    if (isExist) {
        return {
            code: 406,
            message: "User already existed!",
        };
    }

    try {
        console.log(document);
        await setDoc(
            doc(db, constants.UserRepository, document.username),
            document.toJson()
        );
        return {
            code: 200,
            message: "Document written with ID: " + document.username,
        };
    } catch (e) {
        console.error("Error adding document: ", e);
        return {
            code: 406,
            message: "Error in adding document",
        };
    }
};

const authorize = async (username, password) => {
    var user = await isExists(username);

    if (!user) {
        return {
            code: 406,
            message: "no such document",
        };
    }

    var u = User.fromJson(user.data());
    if (!bcrypt.compareSync(password, u.password)) {
        return {
            code: 406,
            message: "Incorrect password!",
        };
    }

    var access_secret = process.env.JWT_SECRET_ACCESS;
    const accessToken = jwt.sign(
        {
            user: user.id,
            email: user.email,
            role: user.data().role,
        },
        access_secret,
        { expiresIn: "10m" }
    );

    var refresh_secret = process.env.JWT_SECRET_REFRESH;
    const refreshToken = jwt.sign(
        {
            user: user.id,
        },
        refresh_secret,
        { expiresIn: "2d" }
    );

    return {
        code: 200,
        accessToken: "Bearer " + accessToken,
        refreshToken: "Bearer " + refreshToken,
    };
};

const isExists = async (username) => {
    if (username == null) {
        return false;
    }
    const docRef = doc(db, constants.UserRepository, username);
    const querySnapshot = await getDoc(docRef);
    if (querySnapshot.data() === undefined || querySnapshot.data() === null) {
        return false;
    } else {
        return querySnapshot;
    }
};

export { authorize, register, containsRole, isExists };
