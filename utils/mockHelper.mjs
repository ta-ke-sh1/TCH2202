import { Idea } from "../model/idea.mjs";
import { getRndInteger } from "./utils.mjs";
import { uniqueNamesGenerator, names } from "unique-names-generator";
import * as Constants from "./constants.mjs";
import { initializeApp } from "firebase/app";
import {
    writeBatch,
    doc,
    getFirestore,
    collection,
    addDoc,
} from "firebase/firestore";
import { fetchAllDocuments, setDocument } from "../service/firebaseHelper.mjs";
import bcrypt from "bcryptjs";
import { User } from "../model/user.mjs";
import { Comment } from "../model/comment.mjs";
import { Reaction } from "../model/react.mjs";

const app = initializeApp(Constants.firebaseConfig);
const db = getFirestore(app);

const ideaCollectionRef = Constants.IdeaRepository;
const userCollectionRef = Constants.UserRepository;

const loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vulputate libero in finibus laoreet. Suspendisse dignissim ultricies tortor in iaculis. Nam in nunc tellus. Vivamus vitae congue elit, vel auctor nunc. In dui risus, sodales non gravida in, ultrices sit amet mi. Ut eget quam dictum, mollis turpis eget, venenatis lectus. Aliquam auctor lectus velit, ut finibus mi pellentesque vitae. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.";

async function addMockUsers() {
    const roles = {
        1: "1D17R3ozi5G8Ih12H4CV",
        2: "HrBpfqyOOPVomC6FuyPM",
        3: "TnKVhc7Euaskx4W9n3sW",
        4: "ZbxTmrJKbT16HOSYPbN2",
        5: "s4sXB2J5q6Zx1f4qIIwB",
    };

    const users = [];
    for (let i = 0; i < 20; i++) {
        var name =
            uniqueNamesGenerator({
                dictionaries: [names],
            }) +
            uniqueNamesGenerator({
                dictionaries: [names],
            });
        var user = new User(
            roles[getRndInteger(1, 5)],
            name.toLowerCase(),
            bcrypt.hashSync("123456", 10),
            name,
            getRndInteger(1990, 2004) +
            "/" +
            getRndInteger(1, 12) +
            "/" +
            getRndInteger(1, 30),
            ["Staff"],
            "+840" + getRndInteger(30, 99) + getRndInteger(100000, 999999),
            "Activated",
            "/avatar/" + name.replace(" ", "").toLowerCase(),
            name.replace(" ", "") + "@gmail.com"
        );
        users.push(user);
    }

    var batch = writeBatch(db);

    users.forEach((user) => {
        const docRef = doc(db, userCollectionRef, user.username);
        console.log(user.toJson());
        batch.set(docRef, user.toJson());
    });

    await batch.commit();
}

async function addMockIdeas(number) {
    const categories = {
        1: "Teaching Quality",
        2: "Scheduling",
        3: "Equipment",
        4: "Human Resources",
        5: "Funding",
    };

    const threads = {
        1: "a4Rht41692uAFZ3vG8Ow",
        2: "iXm24LpgFaLbrawknfoU",
        3: "kz2B0joetInmYBeFynch",
        4: "pd03HIB3PRNO02Y3NrgO",
    };

    const users = {
        1: "pepievelyn",
        2: "pollysindee",
        3: "andriettefiann",
        4: "jocelinlolita",
        5: "alixevey",
        6: "bertiemyrtice",
        7: "concordiajoyan",
        8: "ivettanestassia",
        9: "danyaleoline",
        10: "rozaliedrucy",
    };

    for (let i = 0; i < number; i++) {
        var idea = new Idea(
            users[getRndInteger(1, 10)],
            "admin",
            "2023/3/" + getRndInteger(10, 15),
            "2023/3/" + getRndInteger(15, 20),
            "[" + categories[getRndInteger(1, 5)] + "]",
            "Lorem Ipsum Sit Dolor",
            loremIpsum,
            "",
            threads[getRndInteger(1, 4)],
            0,
            "Approved",
            false
        );
        await addDoc(collection(db, ideaCollectionRef), idea.toJson());
    }
}

async function addMockComments(number) {
    var ideas = await fetchAllDocuments("Idea");
    var users = await fetchAllDocuments("User");
    for (var i = 0; i < number; i++) {
        var comment = new Comment(
            ideas[getRndInteger(0, ideas.length - 1)].id,
            users[getRndInteger(0, users.length - 1)].id,
            "Lorem ipsum sit dolor",
            "2023/3/2",
            0
        );
        await addDoc(collection(db, "Comment"), comment.toJson());
    }
}

async function addMockReaction(number) {
    var ideas = await fetchAllDocuments("Idea");
    var comments = await fetchAllDocuments("Comment");
    var users = await fetchAllDocuments("User");

    for (var i = 0; i < number; i++) {
        var ideaOrCommnent = getRndInteger(0, 1) === 1;
        var userId = users[getRndInteger(0, users.length - 1)].id;
        var documentId = ideaOrCommnent
            ? ideas[getRndInteger(0, ideas.length - 1)].id
            : comments[getRndInteger(0, comments.length - 1)].id;
        var reaction = new Reaction(
            ideaOrCommnent ? -1 : 1,
            userId,
            documentId
        );
        await setDocument(
            "Reaction",
            userId + "-" + documentId,
            reaction.toJson()
        );
    }
}

async function clearDocument(collection) {
    var documents = await fetchAllDocuments(collection);
    documents = documents.filter((x) => {
        return x.id !== "admin";
    });

    var batch = writeBatch(db);
    documents.forEach((user) => {
        const docRef = doc(db, collection, user.id);
        batch.delete(docRef);
    });

    await batch.commit();
}

export {
    addMockIdeas,
    addMockUsers,
    addMockComments,
    addMockReaction,
    clearDocument,
};
