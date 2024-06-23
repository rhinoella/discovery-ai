import { getMetadata, getStorage, ref } from "@firebase/storage"
import audio from "../assets/audio.png";
import file from "../assets/file.png";
import image from "../assets/image.png";
import video from "../assets/video.png";
import { useEffect, useState } from "react";


export const Evidence = ({
    name,
    description,
    storageLink
}) => {
    const [icon, setIcon] = useState(file);
    const storage = getStorage();
    const objectRef = ref(storage, storageLink);

    useEffect(() => {
        getMetadata(objectRef).then((metadata) => {
            console.log(metadata)
            if (metadata.contentType === "image/png") {
                setIcon(image);
            }
            else if (metadata.contentType === "application/pdf")
            {
                setIcon(file);
            }
            else if (metadata.contentType === "audio/mpeg3") {
                setIcon(audio);
            }
            else if (metadata.contentType === "video/mp4") {
                setIcon(video);
            }
        });
    }, [icon, setIcon])

    return(<div className="bg-slate-100 p-8 rounded-lg w-80 flex flex-row gap-8">
        <div className="my-auto">
            <img src={icon} width={60}></img>
        </div>
        <div>
        <h3 className="font-medium text-slate-700">{name}</h3>
        <a>{storageLink}</a>
        <p>{description}</p>
        </div>
    </div>)
}