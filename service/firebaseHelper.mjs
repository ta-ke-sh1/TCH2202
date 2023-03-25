import { initializeApp } from "firebase/app";
import {
    getFirestore,
    addDoc,
    getDocs,
    setDoc,
    doc,
    deleteDoc,
    collection,
    updateDoc,
    getDoc,
    where,
    query,
    limit,
    orderBy,
    writeBatch,
    getCountFromServer,
} from "firebase/firestore";

import * as constants from "../utils/constants.mjs";

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);

const fetchDocumentWhereDocumentId = async (document, l, { isBefore, isAfter }) => {
    var documents = [];

    var q;

    if (isAfter && isBefore) {
        q = query(
            collection(db, document),
            where('timestamp', "<=", isBefore),
            where('timestamp', ">=", isAfter),
            orderBy('timestamp', 'desc'),
            limit(l)
        );
    }
    else if (isBefore) {
        q = query(
            collection(db, document),
            where('timestamp', "<=", isBefore),
            orderBy('timestamp', 'desc'),
            limit(l)
        );
    }
    else if (isAfter) {
        q = query(
            collection(db, document),
            where('timestamp', ">=", isAfter),
            orderBy('timestamp', 'desc'),
            limit(l)
        );
    } else {
        q = query(
            collection(db, document),
            orderBy('timestamp', 'desc'),
            limit(l)
        );
    }

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        documents.push(doc.data());
    });
    return documents;
}
// For 
const fetchAllDateNestedDocuments = async (date, document) => {
    const documents = [];
    const docRef = collection(db, "Documents/", date, document)
    const querySnapshot = await getDocs(docRef);
    querySnapshot.forEach((doc) => {
        documents.push(doc.data());
    });
    return documents;
};


const fetchAllDocuments = async (document) => {
    const documents = [];
    const querySnapshot = await getDocs(collection(db, document));
    querySnapshot.forEach((doc) => {
        documents.push(doc);
    });
    return documents;
};

const fetchAllMatchingDocumentsWithinRange = async (
    document,
    thread,
    start,
    end
) => {
    var documents = [];
    const q = query(
        collection(db, document),
        where("thread", "==", thread),
        where("post_date", ">=", start),
        where("post_date", "<=", end)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        documents.push(doc);
    });
    return documents;
};

const fetchAllMatchingDocuments = async (document, criteria, keyword) => {
    const documents = [];
    const q = query(collection(db, document), where(criteria, "==", keyword));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        documents.push(doc);
    });
    return documents;
};

const fetchAllMatchingDocumentsCount = async (document, criteria, keyword) => {
    const q = query(collection(db, document), where(criteria, "==", keyword));
    const snapshot = await getCountFromServer(q);
    if (snapshot) return snapshot.data().count;
    else return 0;
}

const fetchAllUsers = async () => {
    const documents = [];
    var alphabet = "abcdefghijklmnopqrstuvwyxyz".split("");
    for (var i = 0; i < alphabet.length; i++) {
        const querySnapshot = await getDocs(collection(db, 'User', alphabet[i], 'User'));
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            data.id = doc.id;
            documents.push(data);
        });
    }
    return documents;
}

const deleteAllUsers = async () => {
    var batch = writeBatch(db);
    var alphabet = "abcdefghijklmnopqrstuvwyxyz".split("");
    for (var i = 0; i < alphabet.length; i++) {
        const docRef = doc(db, 'User', alphabet[i]);
        batch.delete(docRef);
    }

    await batch.commit();
}

const fetchUserById = async (id) => {
    const docRef = doc(db, 'User', id[0], 'User', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap;
    }
    return null;
}

const addUser = async (id, user) => {
    try {
        const docRef = await addDoc(
            collection(db, 'User', id[0]),
            user
        );
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        return "Error";
    }
}

const setUser = async (id, user) => {
    await setDoc(doc(db, 'User', id[0], 'User', id), user);
    return {
        code: 200,
        message: "Set document with id: " + id,
    };
}

const fetchDocumentById = async (collectionRef, id) => {
    if (id != null) {
        const docRef = doc(db, collectionRef, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap;
        }
        return null;
    }

    return null;
};

const addDocument = async (collectionRef, object) => {
    try {
        const docRef = await addDoc(
            collection(db, collectionRef),
            object.toJson()
        );
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        return "Error";
    }
};

const deleteDocument = async (collectionRef, id) => {
    await deleteDoc(doc(db, collectionRef, id));
    return {
        code: 200,
        message: "Deleted document with id: " + id,
    };
};

const setDocument = async (collectionRef, id, set_object) => {
    await setDoc(doc(db, collectionRef, id), set_object);
    return {
        code: 200,
        message: "Set document with id: " + id,
    };
};

const updateDocument = async (collectionRef, id, update_object) => {
    await updateDoc(doc(db, collectionRef, id), update_object);
    return {
        code: 200,
        message: "Updated document with id: " + id,
    };
};

export {
    fetchAllDateNestedDocuments,
    fetchAllDocuments,
    fetchAllMatchingDocuments,
    fetchAllMatchingDocumentsCount,
    fetchAllMatchingDocumentsWithinRange,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
    setDocument,
    fetchDocumentWhereDocumentId,
    fetchAllUsers,
    fetchUserById,
    setUser,
    addUser,
    deleteAllUsers
};
