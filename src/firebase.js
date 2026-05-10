import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { getFirestore, collection, doc, addDoc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBkq1V_fyNUwcaL07MZ3IMdOUwt0mAShH0",
  authDomain: "paradise-on-earth.vercel.app",
  projectId: "paradise-on-earth-db8a3",
  storageBucket: "paradise-on-earth-db8a3.firebasestorage.app",
  messagingSenderId: "604683252633",
  appId: "1:604683252633:web:934dfc2045c454d7e79908"
};

const app = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// ── Auth — redirect on all devices (works on Safari, Chrome, all mobile) ──────
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const signInWithGoogle = () => signInWithRedirect(auth, googleProvider);
export { getRedirectResult };
export const logOut = () => signOut(auth);

// ── User profiles ─────────────────────────────────────────────────────────────
export const createUserProfile = async (uid, data) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      ...data,
      wallet: "0x" + Math.random().toString(16).slice(2, 10) + "…3f2a",
      verified: false,
      flagged: false,
      ownedNFTs: [],
      createdAt: serverTimestamp(),
    });
  }
  return (await getDoc(ref)).data();
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() });
};

// ── Posts ─────────────────────────────────────────────────────────────────────
export const createPost = async (data) => {
  return await addDoc(collection(db, "posts"), {
    ...data,
    likes: 0,
    comments: 0,
    reposts: 0,
    likedBy: [],
    pinned: false,
    blocked: false,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToPosts = (callback) => {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap => {
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(posts);
  });
};

export const likePost = async (postId, uid) => {
  const ref = doc(db, "posts", postId);
  const snap = await getDoc(ref);
  const data = snap.data();
  const liked = data.likedBy?.includes(uid);
  await updateDoc(ref, {
    likes: liked ? data.likes - 1 : data.likes + 1,
    likedBy: liked ? data.likedBy.filter(id => id !== uid) : [...(data.likedBy || []), uid],
  });
};

export const pinPost    = async (id, val) => updateDoc(doc(db, "posts", id), { pinned: val });
export const blockPost  = async (id, val) => updateDoc(doc(db, "posts", id), { blocked: val });
export const deletePost = async (id)      => deleteDoc(doc(db, "posts", id));

// ── Collections (NFT) ─────────────────────────────────────────────────────────
export const saveCollection = async (data) => {
  if (data.id && typeof data.id === "string") {
    await setDoc(doc(db, "collections", data.id), { ...data, updatedAt: serverTimestamp() });
    return data.id;
  }
  const ref = await addDoc(collection(db, "collections"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
};

export const subscribeToCollections = (callback) => {
  return onSnapshot(collection(db, "collections"), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// ── Media upload ──────────────────────────────────────────────────────────────
export const uploadMedia = async (file, path) => {
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
};

// ── Moderation ────────────────────────────────────────────────────────────────
export const flagUser   = async (uid, data) => setDoc(doc(db, "flaggedUsers", uid), data);
export const unflagUser = async (uid)       => deleteDoc(doc(db, "flaggedUsers", uid));
export const verifyUser = async (uid, val)  => updateDoc(doc(db, "users", uid), { verified: val });
