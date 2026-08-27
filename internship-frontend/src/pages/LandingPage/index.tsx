import Navbar from "./Navbar";
import IntroSequence from "./IntroSequence";
import HowItWorks from "./HowItWorks";
import CallToAction from "./CallToAction";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <main id="main">
        <IntroSequence />
        <HowItWorks />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
