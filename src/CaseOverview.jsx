import { Evidence } from "./components/Evidence";

const evidenceExamples = [
    {
        name: "NameExample",
        description: "Description",
        storageLink: "test/iconmonstr-arrow-up-circle-thin-240.png"
    }
]

export const CaseOverview = () => {
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