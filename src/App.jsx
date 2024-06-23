import { useState } from 'react'
import './App.css'
import { Upload } from './Upload'
import { Header } from './components/Header'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { CaseOverview } from './CaseOverview';
import { Loading } from './Loading';
import { collection, getDocs, getFirestore, query } from '@firebase/firestore';

function App() {
  const [page, setPage] = useState(0);

  const firebaseConfig = {
    apiKey: "AIzaSyArwh6KL3piK85hOWkT7RvYK4iSkUAl8K8",
    authDomain: "discovery-ai-8a80a.firebaseapp.com",
    projectId: "discovery-ai-8a80a",
    storageBucket: "discovery-ai-8a80a.appspot.com",
    messagingSenderId: 650258991035,
    appId: "1:650258991035:web:24f32a3404d7016573669e",
    measurementId: "G-SK408QB8Y2"
  };

  // Initialize Firebase

  const app = initializeApp(firebaseConfig);

  const analytics = getAnalytics(app);

  const handleFilesUploaded = async (fileRefs) => {
    setPage(1);

    const rawResponse = await fetch('http://127.0.0.1:5000/discovery', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"data": fileRefs})
    });
  
    console.log(rawResponse);

    const db = getFirestore(app);

    const q = query(collection(db, "exhibits"));
    const snapshot = await getDocs(q);
    
    let parsedExhibits = [];
    snapshot.forEach((snap) => {       
        const data = snap.data();
        const exhibit = {
            name: snap.id,
            summary: data.summary,
            evidences: data.data
        }

        parsedExhibits.push(exhibit)
    })
    setPage(2);
  }

  const pages = [<Upload handleFilesUploaded={handleFilesUploaded}/>, <Loading />, <CaseOverview app={app} />];

  return (
      <div className='mt-32'>
       <Header/>
       { pages[page] }
      </div>
    )
  }

export default App
