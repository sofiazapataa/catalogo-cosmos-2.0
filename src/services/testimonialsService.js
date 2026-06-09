import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export async function getTestimonials({ onlyActive = false } = {}) {
  const ref = collection(db, "testimonials");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return onlyActive ? all.filter((t) => t.active !== false) : all;
}

export async function saveTestimonial({ id, ...data }) {
  if (id) {
    await updateDoc(doc(db, "testimonials", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return id;
  }
  const ref = await addDoc(collection(db, "testimonials"), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteTestimonial(id) {
  await deleteDoc(doc(db, "testimonials", id));
}

export async function toggleTestimonial(id, active) {
  await updateDoc(doc(db, "testimonials", id), {
    active,
    updatedAt: serverTimestamp(),
  });
}
