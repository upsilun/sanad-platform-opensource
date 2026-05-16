import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const signUpStudent = async (email, password, name, disability) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // تخزين بيانات الطالب في Firestore لربطها بكل محادثات الذكاء لاحقاً
  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    disabilityType: disability,
    createdAt: new Date(),
  });

  return user;
};