import LiquidBackground from "@/components/LiquidBackground";
import SmoothAnchorLink from "@/components/SmoothAnchorLink";
import TicketingConfigurator from "@/components/TicketingConfigurator";

export const metadata = {
  title: "Tickets | Art Gallery",
  description:
    "Plan your visit, choose your tickets, and create your museum experience.",
};

export default function TicketingPage() {
  return (
    <main className="min-h-svh bg-white text-black">
      <LiquidBackground
        height="100svh"
        primaryColors={["#C7E7FF", "#C7E7FF", "#C7E7FF"]}
        secondaryColors={["#C7E7FF", "#C7E7FF", "#C7E7FF"]}
        hoverSize={1.5}
        autoAnimation={false}
      >
        <section className="relative flex h-full w-full items-center overflow-hidden px-[clamp(2rem,7.5vw,6rem)] py-[clamp(4rem,10svh,7rem)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[92svh] w-[95svw] -translate-x-1/2 -translate-y-1/2 border-2 border-black"
          />

          <div className="relative z-30 w-full max-w-[min(78rem,82vw)]">
            <p className="mb-5 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-black/60">
              Museum open — 10:00 AM / 7:00 PM
            </p>

            <h1 className="text-[clamp(4.3rem,11vw,9rem)] font-bold uppercase leading-[0.78] tracking-[-0.035em] text-black">
              Tickets
            </h1>

            <p className="mt-[clamp(2rem,4vw,3.5rem)] max-w-xl text-sm leading-relaxed text-black/70 sm:text-base">
              Create a visit at your own pace and discover masterpieces from
              around the world, all in one place.
            </p>

            <SmoothAnchorLink
              href="#tickets"
              className="group relative mt-7 inline-flex w-fit items-center gap-7 rounded-xs border border-black bg-white px-6 py-4 text-sm font-medium uppercase tracking-[0.12em] text-black transition-[background-color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-black after:transition-[border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:after:rounded-sm focus-visible:rounded-md focus-visible:bg-[var(--main-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:after:rounded-sm"
            >
              Plan my visit
              <span
                aria-hidden="true"
                className="text-lg leading-none transition-transform duration-300 group-hover:translate-y-1 group-focus-visible:translate-y-1"
              >
                ↓
              </span>
            </SmoothAnchorLink>
          </div>
        </section>
      </LiquidBackground>

      <TicketingConfigurator />
    </main>
  );
}
