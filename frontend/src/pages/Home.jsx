import React from 'react';
import Carousel from '../components/Carousel';
import AboutSection from '../components/AboutSection';
import FeaturesSection from '../components/FeaturesSection';

function Home() {
  return (
    <div className=" flex flex-col bg-gradient-dark">
      <Carousel />
      <AboutSection />
      <FeaturesSection />
    </div>
  );
}

export default Home;