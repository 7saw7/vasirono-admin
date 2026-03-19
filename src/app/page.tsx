import React from "react";
import HistoriaSection from "src/components/HistoriaSection/page";
import MomentosSection from "src/components/MomentosSection/page";
import CartaSection from "src/components/CartaSection/page";
import SorpresaSection from "src/components/SorpresaSection/page";
const Home: React.FC = () => {

  return (
    <>

        <HistoriaSection />
        <MomentosSection />
        <CartaSection />
        <SorpresaSection />
    </>
  );
};

export default Home;
