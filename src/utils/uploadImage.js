import { storage } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadImage(file) {
  if (!file) return null;

  const fileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `products/${fileName}`);

  await uploadBytes(storageRef, file);

  const url = await getDownloadURL(storageRef);

  return url;
}