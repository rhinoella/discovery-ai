import logo from "../assets/discoveryai.jpeg"

export const Header = () => {
    return (
        <header className="flex flex-row gap-4 justify-start w-full text-xl font-medium border-b pt-8 px-12 pb-4 text-slate-600 fixed top-0 left-0 bg-white pl-24">
            <img width={50} src={logo}></img>
            <h1>Discovery AI</h1>
        </header>
    )
}