import Menu from "./Menu";

export default function Header() {
  return (
    <header
      data-gallery-floating-ui
      className="pointer-events-none fixed right-[clamp(2.75rem,4.5vw,5rem)] top-[clamp(3.75rem,8svh,6rem)] z-1500 flex w-fit justify-end"
    >
      <div className="pointer-events-auto w-fit">
        <Menu />
      </div>
    </header>
  );
}
