// ===============================
// FIREBASE CONFIG (VERSI 8 ONLY)
// ===============================
var firebaseConfig = {
  apiKey: "AIzaSyC866gRdEF69PAgYwVrusaKCztBU4ctMgM",
  authDomain: "media-pembelajaran-ipa-d71c4.firebaseapp.com",
  databaseURL: "https://media-pembelajaran-ipa-d71c4-default-rtdb.firebaseio.com",
  projectId: "media-pembelajaran-ipa-d71c4",
  storageBucket: "media-pembelajaran-ipa-d71c4.appspot.com",
  messagingSenderId: "945881513693",
  appId: "1:945881513693:web:2f097c211becbf1b78e534"
};

// INIT FIREBASE
firebase.initializeApp(firebaseConfig);

// GLOBAL INSTANCE
var auth = firebase.auth();
var db   = firebase.database();
