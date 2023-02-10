import { initializeApp } from 'firebase/app';
import { getFirestore, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import * as constants from './constants.mjs';
import { Comment } from '../model/comment.mjs';

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);

const fetchAllComments = async () => {
    const Comments = [];
    const querySnapshot = await getDocs(collection(db, constants.CommentRepository));
    querySnapshot.forEach((doc) => {
        Comments.push(Comment.fromJson(doc));
    })
    return Comments;
}

const fetchCommentById = async (id) => {
    const docRef = doc(db, constants.CommentRepository, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        return Comment.fromJson(docSnap);
    } else {
        console.log("No such document!");
    }
}

const addComment = async (Comment) => {
    try {
        const docRef = await addDoc(collection(db, constants.CommentRepository), Comment.toJson())
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }

}

const deleteComment = async (id) => {
    await deleteDoc(doc(db, constants.CommentRepository, id));
}

const updateComment = async (id, new_Comment) => {
    new_Comment.id = null;
    await setDoc(doc(db, constants.CommentRepository, id), new_Comment.toJson(), { capital: true }, { merged: true });
}

export {
    fetchAllComments,
    fetchCommentById,
    addComment,
    deleteComment,
    updateComment,
};