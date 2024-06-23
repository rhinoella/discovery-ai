import { useEffect, useState } from "react"
import { Evidence } from "./Evidence"
import { doc } from "@firebase/firestore";

/*
interface exhibit = {
    name: string,
    description: string,
    evidences: [],
}
*/

export const Exhibit = ({ exhibit, app }) => {
    const [evidences, setEvidences] = useState([]);

    const db = getFirestore(app);


    useEffect(() => {
        let parsedEvidences = [];

        exhibit.evidences.forEach(async (ev) => {
            const docRef = doc(db, "case", ev);
            const docSnap = await getDoc(docRef);

            parsedEvidences.push({
                name: docSnap.name,
                description: docSnap.description
            })
        });

        setEvidences(parsedEvidences)
    })

    const evidenceList = evidences.map((ev, index) => {
        return (<Evidence key={index} name={ev.name} description={ev.description} storageLink={ev.storageLink}/>)
    })

    return (
        <div>
        <div><h2 className="text-slate-700 text-lg font-medium pb-2 pl-8">{exhibit.name}</h2></div>
        <p className="pl-8 pb-4 text-gray-700">{exhibit.description}</p>
        <div className="p-14 border rounded-lg flex flex-row gap-4 flex-wrap">
            {evidenceList}
        </div>
        </div>
    )
}