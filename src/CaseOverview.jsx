import { Evidence } from "./components/Evidence";
import {useState, useEffect} from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";


const evidenceExamples = [
    {
        name: "NameExample",
        description: "Description",
        storageLink: "test/iconmonstr-arrow-up-circle-thin-240.png"
    }
]

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

export const CaseOverview = () => {
    const [evidenceFiles, setEvidenceFiles] = useState([]);

    useEffect(() => {



    }, [setEvidenceFiles]);

    const evidences = evidenceExamples.map((ev, id) => {
        return <Evidence key={id} name={ev.name} description={ev.description} storageLink={ev.storageLink} />
    });

    return (
        <div className="mx-10 mt-16 flex flex-col gap-10">
            <div>
            <h2 className="text-lg font-semibold">Case: Non-Payments of Goods Dispute Resolution</h2>
            <div className="w-full border-b border-b-slate-600 mb-6"></div>
            <p>Description: This case involves a small bike buisiness that is having an issue with a payment agreement that was not upheld.</p>
            </div>
            <div className="flex flex-row gap-12 rounded-lg border p-8">
                <div>
                    <h3 className="underline">Value estimation</h3>
                    <p>$500</p>
                </div>
                <div>
                    <h3 className="underline">Time estimation</h3>
                    <p>20 hrs</p>
                </div>
            </div>
            <div>
            <div><h2 className="text-slate-800 font-medium pb-2">Evidence Overview</h2></div>
            <div className="p-12 border rounded-lg">
                {evidences}
            </div>
            </div>
        </div>
    );
}