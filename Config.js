import firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyCLNd8s4eAVgPx_k-eAUNhSUN9VhWbJSSo",
  authDomain: "wily-1c96b.firebaseapp.com",
  projectId: "wily-1c96b",
  storageBucket: "wily-1c96b.appspot.com",
  messagingSenderId: "62371017131",
  appId: "1:62371017131:web:068fea5016d281c54122ee"
};

  firebase.initializeApp(firebaseConfig)
  const db = firebase.firestore()
  
  export default db;







  