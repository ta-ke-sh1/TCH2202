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
    orderBy,
} from "firebase/firestore";
import * as constants from "../utils/constants.mjs";

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);

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
    fetchAllDocuments,
    fetchAllMatchingDocuments,
    fetchAllMatchingDocumentsWithinRange,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
    setDocument,
};
