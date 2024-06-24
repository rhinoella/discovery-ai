import { useEffect, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import lawyer from "./assets/lawyer.jpeg"

const fileTypes = ["JPG", "PNG", "MP3", "MP4", "PDF"];

export const Upload = ({ handleFilesUploaded }) => {
    const [ files, setFiles ] = useState([]);
    const storage = getStorage();

    const handleChange = (files) => {
        setFiles(files);
        let fileRefs = [];

        for (let file of files) {
            const fileRef = ref(storage, `${file.name}`);
            uploadBytes(fileRef, file).then((snapshot) => {
                console.log(snapshot);
              });
            fileRefs.push(fileRef.fullPath);
        }
        
        setTimeout(() => {
            handleFilesUploaded(fileRefs);
        }, fileRefs.length*1000)
    };

    return (<div className="flex-col max-w-[500px] mx-auto pt-20">
    <img src={lawyer}></img>
    <h2 className="font-semibold text-3xl">Discovery AI</h2>
    <p className="text-slate-600">Empowering SMBs to Manage Legal Disputes</p>
    <div className="flex flex-col w-min mx-auto my-12 gap-20 bg-gray-100 pt-8 pb-14 px-14 rounded-xl">
    <div className="flex flex-row gap-4 text-slate-800 underline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16 16h-3v5h-2v-5h-3l4-4 4 4zm3.479-5.908c-.212-3.951-3.473-7.092-7.479-7.092s-7.267 3.141-7.479 7.092c-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h3.5v-2h-3.5c-1.93 0-3.5-1.57-3.5-3.5 0-2.797 2.479-3.833 4.433-3.72-.167-4.218 2.208-6.78 5.567-6.78 3.453 0 5.891 2.797 5.567 6.78 1.745-.046 4.433.751 4.433 3.72 0 1.93-1.57 3.5-3.5 3.5h-3.5v2h3.5c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408z"/></svg>
    <h3>Upload case files</h3></div>
    <FileUploader handleChange={handleChange} 
    id="fileUploader"
    name="file" types={fileTypes} 
    label="Drag files here"
    multiple={true}
    />
</div>
</div>
)
}