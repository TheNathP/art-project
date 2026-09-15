import LiquidBackground from "./components/LiquidBackground"

export default function Page() {
  return (
    <main>
      <LiquidBackground
        height="100svh"
        primaryColors={["#C7E7FF", "#C7E7FF", "#C7E7FF"]}
        secondaryColors={["#C7E7FF", "#C7E7FF", "#C7E7FF"]}
        hoverSize={1.5}
        autoAnimation={false}
      >
        <section>
          <div className="w-[95svw] h-[92svh] border-2 border-black rounded-xs absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="w-full h-screen flex items-center px-24">
            <h1 className="text-9xl font-bold uppercase">The art <br/> project</h1>
          </div>
        </section>
      </LiquidBackground>
    </main>
  )
}