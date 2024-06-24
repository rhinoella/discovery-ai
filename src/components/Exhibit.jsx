import { useEffect, useState } from "react"
import { Evidence } from "./Evidence"
import { doc, getFirestore, getDoc } from "@firebase/firestore";

/*
interface exhibit = {
    name: string,
    description: string,
    evidences: [],
}
*/

export const Exhibit = ({ name, description, evidences, app }) => {
    const [evidenceParsed, setEvidenceParsed] = useState([]);

    const db = getFirestore(app);

    useEffect(() => {
        const getEvidences = async () => {
            let parsedEvidences = [];
            let i = 0;

            for (let evidence of evidences) {
                i = i + 1;
                console.log(evidence)
                const docRef = doc(db, "case", evidence);
                const docSnap = await getDoc(docRef);
                const docData = docSnap.data();
                console.log(docData)
                parsedEvidences.push(<Evidence key={i} name={docData.name} description={docData.description} type={docData.type}/>)
            }
            setEvidenceParsed(parsedEvidences);

        }

        getEvidences();
    }, []);

    return (
        <div>
        <div><h2 className="text-slate-700 text-lg font-medium pb-2 pl-8">Exhibit {name}</h2></div>
        <p className="pl-8 pb-4 text-gray-700">{description}</p>
        <div className="p-14 border rounded-lg flex flex-row gap-4 flex-wrap">
            {evidenceParsed}
        </div>
        </div>
    )
}