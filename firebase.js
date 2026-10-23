
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDXTI2vm7wLHv6__iBnY0WwSuhG_hRB5QE",
    authDomain: "faceburguerjr-7948a.firebaseapp.com",
    projectId: "faceburguerjr-7948a",
    storageBucket: "faceburguerjr-7948a.firebasestorage.app",
    messagingSenderId: "582205169512",
    appId: "1:582205169512:web:038dab2dcfe6993b52c0dd",
    measurementId: "G-YE00XXBMFK"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
