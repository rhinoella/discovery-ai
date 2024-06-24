import { useState } from "react";

export const Chat = () => {
    const [value, setValue] = useState('');
    const [response, setResponse] = useState('');

    const handleSubmit = () => {

    }

    const handleKeyPress = async (event) => {
        if (event.key === 'Enter') {
          setValue('');
          
          const gptResponse = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            body: JSON.stringify({
                message: value
            })
          });

          const responseData = await response.json()
          console.log(responseData);

          setResponse(responseData);
          handleSubmit(value);
        }
    };

    return (
    <div className="flex flex-col gap-4 mx-20 h-36 justify-between">
        <div id="response" className="ml-10 pl-4 border-l-4 border-slate-500">
        <p>
            {response}
        </p>
        </div>
        <input 
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyPress}
            className="bg-gray-100 rounded-full px-8 py-6 w-1/2 self-end" type="text" placeholder="ask me anything...">
        </input>
    </div>
    );
}