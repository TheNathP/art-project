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
          <div className="">

          </div>
          <h1>Art Gallery</h1>
        </section>
      </LiquidBackground>
    </main>
  )
}