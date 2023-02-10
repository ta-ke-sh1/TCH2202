import { initializeApp } from 'firebase/app';
import { getFirestore, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import * as constants from './constants.mjs';
import { Category } from '../model/category.mjs';

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);

const fetchAllCategories = async () => {
    const Categorys = [];
    const querySnapshot = await getDocs(collection(db, constants.CategoryRepository));
    querySnapshot.forEach((doc) => {
        Categorys.push(Category.fromJson(doc));
    })
    return Categorys;
}

const fetchCategoryById = async (id) => {
    const docRef = doc(db, constants.CategoryRepository, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        return Category.fromJson(docSnap);
    } else {
        console.log("No such document!");
    }
}

const addCategory = async (Category) => {
    try {
        const docRef = await addDoc(collection(db, constants.CategoryRepository), Category.toJson())
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }

}

const deleteCategory = async (id) => {
    await deleteDoc(doc(db, constants.CategoryRepository, id));
}

const updateCategory = async (id, new_category) => {
    new_Category.id = null;
    await setDoc(doc(db, constants.CategoryRepository, id), new_category.toJson(), { capital: true }, { merged: true });
}

export {
    fetchAllCategories,
    fetchCategoryById,
    addCategory,
    deleteCategory,
    updateCategory,
};