import { db } from "./firebaseConfig";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";

// إضافة مادة جديدة
export const addCourse = async (userId, courseName) => {
  try {
    const docRef = await addDoc(collection(db, "courses"), {
      userId: userId,
      title: courseName,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding course:", error);
    throw error;
  }
};

// جلب مواد الطالب
export const getUserCourses = async (userId) => {
  const q = query(collection(db, "courses"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};