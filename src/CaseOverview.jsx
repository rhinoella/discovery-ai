import { collection, getDocs, getFirestore, query } from "@firebase/firestore";
import { Chat } from "./components/Chat";
import { Exhibit } from "./components/Exhibit";
import { useEffect, useState } from "react";

const exhibits = [{
    name : "Exhibit A",
    description: "Evidence that shows x",
    evidences : [{
        name: "NameExample",
        description: "Description",
        storageLink: "test/iconmonstr-arrow-up-circle-thin-240.png"
    },
    {
        name: "NameExample",
        description: "Description",
        storageLink: "test/iconmonstr-arrow-up-circle-thin-240.png"
    },
    {
        name: "NameExample",
        description: "Description",
        storageLink: "test/iconmonstr-arrow-up-circle-thin-240.png"
    }],
},
{
    name : "Exhibit B",
    evidences : [{
        name: "NameExample",
        description: "Description",
        storageLink: "test/iconmonstr-arrow-up-circle-thin-240.png"
    },
    {
        name: "NameExample",
        description: "Description",
        storageLink: "test/iconmonstr-arrow-up-circle-thin-240.png"
    },
    {
        name: "NameExample",
        description: "Description",
        storageLink: "test/iconmonstr-arrow-up-circle-thin-240.png"
    }],
}]

export const CaseOverview = ({app}) => {
    const [exhibits, setExhibits] = useState([]);

    const db = getFirestore(app);

    useEffect(() => {
        const getDocData = async () => {
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

            setExhibits(parsedExhibits)
        }

        getDocData();
    });

    const exhibitMap = exhibits.map((exhibit, id) => {
        return <Exhibit key={id} exhibit={exhibit}/>
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
            <Chat />
            <div>
            <div className="border-b mb-10"><h2 className="text-slate-800 font-medium pb-2 text-xl">Evidence Overview</h2></div>
            <div className="flex flex-col gap-10">
            {exhibitMap}
            </div>
            </div>
        </div>
    );
}