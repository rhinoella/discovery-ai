import { useState } from 'react'
import './App.css'
import { Upload } from './Upload'
import { Header } from './components/Header'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { CaseOverview } from './CaseOverview';

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

  const handleFilesUploaded = (fileRefs) => {
    const rawResponse = fetch('http://127.0.0.1:5000/discovery', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"data": fileRefs})
    });
  
    console.log(rawResponse);
    
    setPage(1);
  }

  const pages = [<Upload handleFilesUploaded={handleFilesUploaded}/>, <CaseOverview app={app} />];

  return (
      <div className='mt-32'>
       <Header/>
       { pages[page] }
      </div>
    )
  }

export default App
