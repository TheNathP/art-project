import Link from "next/link";

export default function Nav() {
    return (
        <nav className="flex items-center justify-center gap-4 bg-amber-700">
            <Link href="/">Home</Link>
            <Link href="/gallery">Gallery</Link>
        </nav>
    )
}