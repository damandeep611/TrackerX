"use client"
import React from "react";
import ShowcaseTaskCards from "./cards/showcase-taskcards";
import AnalyticsBento from "./cards/analytics-bento";
import SeparateDashboard from "./cards/separate-dashboard";
import RealTimeUpdates from "./cards/real-time-updates";
import Image from "next/image";
import featuredemoimage from "../../../../public/landing/laptopisometric.png"
import { motion } from "framer-motion";

export default function FeatureGrid() {
  return (
    <section className="mt-24">
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center ">
        <div className="text-center max-w-xl space-y-6 pb-12">
          <h2 className="text-6xl font-semibold">
            Smarter Features <br /> Seamless Workflows
          </h2>
          <p className="text-lg">
            BuildxSkill goes beyond basic project tracking with intelligent
            systems that adapt to how your team works and your projects flow
            effortlessly.
          </p>
        </div>
        {/* Grid boxes */}
        <div className=" relative mt-16 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="absolute -top-44 -z-10">
            <Image src={featuredemoimage} alt="just a feature image" width={300} height={300}/>
          </motion.div>
          {/* upper grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] ">
            {/* timeline box */}
           <SeparateDashboard/>
            {/* auto box */}
           <ShowcaseTaskCards/>
          </div>
          {/* bottom grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* team box */}
           <AnalyticsBento/>
            {/* task box */}
            <RealTimeUpdates/>
          </div>
        </div>
      </div>
    </section>
  );
}
