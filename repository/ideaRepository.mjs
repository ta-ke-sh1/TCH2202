import { initializeApp } from 'firebase/app';
import { getFirestore, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import * as constants from './constants.mjs';
import { Idea } from '../model/idea.mjs';

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);

const fetchAllIdeas = async () => {
    const ideas = [];
    const querySnapshot = await getDocs(collection(db, constants.IdeaRepository));
    querySnapshot.forEach((doc) => {
        ideas.push(Idea.fromJson(doc));
    })
    return ideas;
}

const fetchIdeaById = async (id) => {
    const docRef = doc(db, constants.IdeaRepository, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        return Idea.fromJson(docSnap);
    } else {
        console.log("No such document!");
    }
}

const addIdea = async (idea) => {
    try {
        const docRef = await addDoc(collection(db, constants.IdeaRepository), idea.toJson())
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }

}

const deleteIdea = async (id) => {
    await deleteDoc(doc(db, constants.IdeaRepository, id));
}

const updateIdea = async (id, new_idea) => {
    new_idea.id = null;
    await setDoc(doc(db, constants.IdeaRepository, id), new_idea.toJson(), { capital: true }, { merged: true });
}

export {
    fetchAllIdeas,
    fetchIdeaById,
    addIdea,
    deleteIdea,
    updateIdea,
};