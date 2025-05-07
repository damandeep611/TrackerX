"use client";
import { GiExtraTime } from "react-icons/gi";
import { RxActivityLog } from "react-icons/rx";
import { BiGitMerge } from "react-icons/bi";
import Image from "next/image";

export default function Solutions() {
  return (
    <div className="pt-20 ">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center">
          <span className="bg-neutral-100 p-2 px-8 my-8 rounded-full border border-neutral-300 shadow-lg shadow-gray-400">
            Solutions
          </span>
          <div className="my-6">
            <h2 className="text-3xl text-center  md:text-4xl lg:text-6xl tracking-wider">
              Easy to Track your <br />
              Skill learning progress
            </h2>
          </div>
          {/* bordred dashboard with 3 points */}
          <div className="border border-gray-200  rounded-md p-4 pt-10">
            {/* three solutions */}
            <div className="grid md:grid-cols-3 gap-8 mb-16 ">
              <div className=" flex flex-col items-start justify-center gap-6  lg:border-r border-gray-200 p-4">
                <GiExtraTime size={30} />

                <p className="">
                  Ensure you know how much time you are spending on each part of
                  your learning process.
                </p>
              </div>
              <div className=" flex flex-col items-start justify-center gap-6   lg:border-r border-gray-200 p-4">
                <RxActivityLog size={30} />
                <p>
                  Track your Weekly and Montly activity of what tasks you are
                  doing with AI assistance
                </p>
              </div>
              <div className=" flex flex-col items-start justify-center gap-6 p-4 border-t lg:border-none border-gray-200">
                <BiGitMerge size={30} />

                <p>
                  Add Resources so that you can easily come back for quick
                  checks
                </p>
              </div>
            </div>
            {/* dashboard image */}
            <div className="relative rounded-md bg-sky-400 p-4 py-10 md:p-8 ">
              <div className="border border-gray-300 rounded-3xl ">
                <Image
                  src="/skilldashboard.png"
                  alt="Skill learning tracker Dashboard"
                  width={1200}
                  height={800}
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
