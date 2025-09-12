import React, { useEffect, useState } from "react";
import Hero from "../components/home/Hero.jsx";
import CategoryChips from "../components/home/CategoryChips.jsx";
import TrendingGrid from "../components/home/TrendingGrid.jsx";
import FeaturedVideo from "../components/home/FeaturedVideo.jsx";
import ValueProps from "../components/home/ValueProps.jsx";
import Testimonials from "../components/home/Testimonials.jsx";
import Newsletter from "../components/home/Newsletter.jsx";

export default function HomePageUser() {
  const [loadingVideo, setLoadingVideo] = useState(true);

  useEffect(() => {
    // Only keep the video loading simulation
    const t2 = setTimeout(() => setLoadingVideo(false), 900);
    return () => {
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="space-y-14">
      <Hero />
      <section className="space-y-6" aria-labelledby="quick-cats-title">
        <h2
          id="quick-cats-title"
          className="text-base font-semibold tracking-tight text-emerald-950"
        >
          Chọn nhanh
        </h2>
        <CategoryChips />
      </section>
      <TrendingGrid />
      <FeaturedVideo loading={loadingVideo} />
      <ValueProps />
      <Testimonials />
      <Newsletter />
    </div>
  );
}
