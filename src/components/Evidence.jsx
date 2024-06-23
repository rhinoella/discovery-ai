import { getMetadata, getStorage, ref } from "@firebase/storage"
import audio from "../assets/audio.png";
import file from "../assets/file.png";
import image from "../assets/image.png";
import video from "../assets/video.png";
import { useEffect, useState } from "react";


export const Evidence = ({
    name,
    description,
    type
}) => {
    const [icon, setIcon] = useState(file);

    useEffect(() => {              
        if (type === "image") {
            setIcon(image);
        }
        else if (type === "pdf")
        {
            setIcon(file);
        }
        else if (type === "audio") {
            setIcon(audio);
        }
        else if (type === "video") {
            setIcon(video);
        }
    }, []);

    return(<div className="bg-slate-100 p-8 rounded-lg w-80 flex flex-row gap-8">
        <div className="my-auto">
            <img src={icon} width={60}></img>
        </div>
        <div>
        <h3 className="font-medium text-slate-700">{name}</h3>
        <p>{type}</p>
        <p>{description}</p>
        </div>
    </div>)
}