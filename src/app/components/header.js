import Menu from "./Menu";

export default function Header() {
    return (
        <div className="flex items-center justify-center w-full fixed top-20 left-0 z-50">
            <Menu/>
        </div>
    )
}