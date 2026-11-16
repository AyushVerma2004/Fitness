
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  setDoc,
  doc,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWCLISIOyr4nHjJ2URuqD84EWAyHXBgDM",
  authDomain: "your-fitness-buddy-login.firebaseapp.com",
  projectId: "your-fitness-buddy-login",
  storageBucket: "your-fitness-buddy-login.firebasestorage.app",
  messagingSenderId: "530314127734",
  appId: "1:530314127734:web:09c1cae200b4b030d77257",
  measurementId: "G-S5CNQJ1F77"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

// SIGNUP
window.signup = async function () {
  const name = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !mobile || !password) {
    alert("Please fill all fields!");
    return;
  }

  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(doc(db, "users", result.user.uid), {
      name,
      email,
      mobile,
      authType: "email",
      createdAt: new Date()
    });

    alert("Account created successfully!");
    window.location.href = "login.html";

  } catch (error) {
    console.error("Signup error:", error);
    alert("Signup failed: " + error.message);
  }
};

// LOGIN
window.login = async function (event) {
  event?.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    alert("Login successful!");
    window.location.href = "homepage.html";

  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed: " + error.message);
  }
};

// GOOGLE LOGIN
window.googleLogin = async function () {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      googleAuth: true,
      lastLogin: new Date()
    }, { merge: true });

    alert("Welcome " + user.displayName + "!");
    window.location.href = "homepage.html";

  } catch (error) {
    console.error("Google login error:", error);
    alert("Google login failed: " + error.message);
  }
};

// LOGOUT
window.logout = async function () {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert(error.message);
  }
};

// AUTH OBSERVER
onAuthStateChanged(auth, user => {
  console.log(user ? "Logged in: " + user.email : "Logged out");
});

// FIRESTORE FUNCTIONS
export async function saveWorkout(uid, workout) {
  const ref = await addDoc(
    collection(db, "users", uid, "workouts"),
    workout
  );
  return ref.id;
}

export async function saveGoal(uid, goal) {
  const ref = await addDoc(
    collection(db, "users", uid, "goals"),
    goal
  );
  return ref.id;
}

export async function getWorkouts(uid) {
  const snapshot = await getDocs(
    collection(db, "users", uid, "workouts")
  );
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getGoals(uid) {
  const snapshot = await getDocs(
    collection(db, "users", uid, "goals")
  );
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
