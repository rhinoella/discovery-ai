import { Evidence } from "./Evidence"

export const Exhibit = ({ exhibit }) => {
    const evidences = exhibit.evidences.map((ev, index) => {
        return (<Evidence key={index} name={ev.name} description={ev.description} storageLink={ev.storageLink}/>)
    })

    return (
        <div>
        <div><h2 className="text-slate-700 text-lg font-medium pb-2 pl-8">{exhibit.name}</h2></div>
        <p className="pl-8 pb-4 text-gray-700">{exhibit.description}</p>
        <div className="p-14 border rounded-lg flex flex-row gap-4 flex-wrap">
            {evidences}
        </div>
        </div>
    )
}