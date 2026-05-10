import { initializeApp } from "firebase/app";
import {
  getAuth, GoogleAuthProvider,
  signInWithRedirect, signInWithPopup,
  getRedirectResult, signOut, onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore, collection, doc,
  addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, limit, serverTimestamp,
  increment, arrayUnion, arrayRemove
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ── Config ────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyBkq1V_fyNUwcaL07MZ3IMdOUwt0mAShH0",
  authDomain:        "paradise-on-earth-db8a3.firebaseapp.com",
  projectId:         "paradise-on-earth-db8a3",
  storageBucket:     "paradise-on-earth-db8a3.firebasestorage.app",
  messagingSenderId: "604683252633",
  appId:             "1:604683252633:web:934dfc2045c454d7e79908",
};

const app = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// ── Auth — popup first, redirect fallback for mobile Safari ──────────────────
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const signInWithGoogle = async () => {
  try {
    // Try popup first — works on desktop and most mobile browsers
    return await signInWithPopup(auth, provider);
  } catch(e) {
    // If popup blocked (common on iOS Safari) — use redirect
    if (e.code === "auth/popup-blocked" || e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") {
      return signInWithRedirect(auth, provider);
    }
    throw e;
  }
};
export const getGoogleRedirect = () => getRedirectResult(auth);
export const listenAuth        = (cb) => onAuthStateChanged(auth, cb);
export const logOut            = () => signOut(auth);

// ── User profiles ─────────────────────────────────────────────────────────────
export const createUserProfile = async (uid, data) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const wallet = "0x" + uid.slice(0, 8).toUpperCase() + "…POE";
    await setDoc(ref, {
      name:     data.name     || "Anonymous",
      email:    data.email    || "",
      photoURL: data.photoURL || null,
      wallet,
      verified:  false,
      flagged:   false,
      ownedNFTs: [],
      profile: {
        displayName: data.name || "Anonymous",
        username:    "",
        bio:         "",
        avatar:      data.photoURL
          ? { type: "photo", value: data.photoURL }
          : { type: "symbol", value: "◆" },
        zodiac:      null,
        coverColor:  "#12100a",
        banner:      null,
      },
      createdAt: serverTimestamp(),
    });
  }
  return (await getDoc(ref)).data();
};

export const getUserProfile    = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
};
export const updateUserProfile = (uid, data) =>
  updateDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() });

// ── Posts ─────────────────────────────────────────────────────────────────────
export const createPost = (data) =>
  addDoc(collection(db, "posts"), {
    ...data,
    likes:    0,
    likedBy:  [],
    comments: 0,
    reposts:  0,
    pinned:   false,
    blocked:  false,
    createdAt: serverTimestamp(),
  });

export const subscribeToPosts = (cb) =>
  onSnapshot(
    query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100)),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );

// One-shot fetch for polling fallback
export const fetchPostsOnce = async () => {
  const snap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const likePost = async (postId, uid) => {
  const ref  = doc(db, "posts", postId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const liked = snap.data().likedBy?.includes(uid);
  await updateDoc(ref, {
    likes:   increment(liked ? -1 : 1),
    likedBy: liked ? arrayRemove(uid) : arrayUnion(uid),
  });
};

export const setPinned  = (id, val) => updateDoc(doc(db, "posts", id), { pinned:  val });
export const setBlocked = (id, val) => updateDoc(doc(db, "posts", id), { blocked: val });
export const deletePost = (id)      => deleteDoc(doc(db, "posts", id));

// ── Notifications ─────────────────────────────────────────────────────────────
export const createNotification = (toUid, data) =>
  addDoc(collection(db, "notifications", toUid, "items"), {
    ...data,
    read:      false,
    createdAt: serverTimestamp(),
  });

export const subscribeToNotifications = (uid, cb) =>
  onSnapshot(
    query(collection(db, "notifications", uid, "items"), orderBy("createdAt", "desc")),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );

export const markNotifRead = (uid, nid) =>
  updateDoc(doc(db, "notifications", uid, "items", nid), { read: true });

// ── Collections (NFT) ─────────────────────────────────────────────────────────
export const subscribeToCollections = (cb) =>
  onSnapshot(collection(db, "collections"),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );

export const saveCollection = async (data) => {
  if (data.id && typeof data.id === "string") {
    await setDoc(doc(db, "collections", data.id), { ...data, updatedAt: serverTimestamp() });
    return data.id;
  }
  const r = await addDoc(collection(db, "collections"), { ...data, createdAt: serverTimestamp() });
  return r.id;
};

// ── Media upload ──────────────────────────────────────────────────────────────
export const uploadMedia = async (file, path) => {
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return getDownloadURL(r);
};

// ── Moderation ────────────────────────────────────────────────────────────────
export const flagUser   = (uid, data) => setDoc(doc(db, "flaggedUsers", uid), data);
export const unflagUser = (uid)       => deleteDoc(doc(db, "flaggedUsers", uid));
export const verifyUser = (uid, val)  => updateDoc(doc(db, "users", uid), { verified: val });

// ── LocalStorage helpers (offline persistence) ────────────────────────────────
const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v)   => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
export const storage_ls = LS;
