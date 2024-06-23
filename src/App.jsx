import { useState } from 'react'
import './App.css'
import { Upload } from './Upload'
import { Header } from './components/Header'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { CaseOverview } from './CaseOverview';

function App() {
  const [page, setPage] = useState(1);

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID
  };

  // Initialize Firebase

  const app = initializeApp(firebaseConfig);

  const analytics = getAnalytics(app);

  const handleFilesUploaded = (fileRefs) => {
    const rawResponse = fetch('http://localhost:5000/discovery', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"data": fileRefs})
    });
    const content = rawResponse.json();
  
    console.log(content);
    
    setPage(1);
  }

  const pages = [<Upload handleFilesUploaded={handleFilesUploaded}/>, <CaseOverview />];

  return (
      <div className='mt-32'>
       <Header/>
       { pages[page] }
      </div>
    )
  }

export default App
