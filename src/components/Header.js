import Menu from "./Menu";

export default function Header() {
  return (
    <header className="pointer-events-none fixed left-0 top-20 z-[100] flex w-full items-center justify-center px-4">
      <div className="pointer-events-auto">
        <Menu />
      </div>
    </header>
  );
}