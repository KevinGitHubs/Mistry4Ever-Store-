const firebaseConfig = {
  apiKey: "AIzaSyAnCn7O7Nm3Z9CZ30U2BHhEg6N1bt7zGp4",
  authDomain: "blockblastchaos.firebaseapp.com",
  projectId: "blockblastchaos",
  storageBucket: "blockblastchaos.firebasestorage.app",
  messagingSenderId: "320876032362",
  appId: "1:320876032362:web:6e99c88866ed5fa0eb3513",
  measurementId: "G-YBGC2NB6ML"
};

firebase.initializeApp(firebaseConfig);
export const db = firebase.database();

export const roomRef = (code) => db.ref('rooms/' + code);