"use client";
export default function HeroSection() {
  return (
    <section className="w-full h-screen ">
      <div className=" ">
        <div className="relative px-4 pt-20 pb-24 md:pt-32 md:pb-24 overflow-hidden">
          {/* bg pattern */}
          <div className="absolute  inset-0 bg-[#f9f9f9] bg-[radial-gradient(#d0d0d0_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-40 dark:hidden"></div>
          <StickyNote />
          {/* skillCard showcase */}
          <HeroSkillCard />
          <HeroActivityCard />

          {/* main hero section Content */}
          <div className=" relative z-0 mt-20 mb-20 container mx-auto max-w-5xl">
            <div className="text-center">
              <p className="inline-block uppercase px-4 py-1 mb-4 font-medium tracking-wide bg-white/30 dark:bg-white/10 backdrop-blur-sm rounded-full">
                Track your skill learning easily
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-6xl capitalize font-bold mb-6">
                Master Your Time. Track Your Growth
              </h1>

              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-gray-600 dark:text-gray-200">
                Organize your day, measure your progress, and build a smarter
                routine. one task at a time.
              </p>

              <div className="flex items-center justify-center gap-4">
                <button className="px-8 py-3 bg-black text-white border dark:border-gray-100 rounded-full font-medium hover:bg-gray-800 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const StickyNote = () => {
  return (
    <div className="  absolute -left-[10%] lg:left-[1%] lg:top-[10%] w-56 h-56 bg-yellow-200 shadow-xl rounded-sm p-4 transform rotate-5 z-10">
      <div className="w-4 h-4 bg-red-700 rounded-full absolute -top-2 left-1/2 transform -translate-x-1/2"></div>
      <p className=" font-stretch-95% font-serif text-lg leading-tight text-gray-600">
        Take notes to keep track of crucial details, and accomplish more tasks
        with ease.
      </p>
    </div>
  );
};

const HeroSkillCard = () => {
  return (
    <div className="absolute -right-[25%] top-[5%] lg:right-[2%] lg:top-[15%] w-64 bg-white dark:bg-black  shadow-xl rounded-xl p-4 transform rotate-3 z-10">
      <h3 className="font-medium text-lg mb-2">Skill Tracker</h3>
      <div className="flex items-start gap-3 mt-4">
        <div className="mt-1">
          <div className="w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center">
            <div className="w-1 h-3 bg-gray-800 dark:bg-white absolute transform translate-y-[-2px]"></div>
            <div className="w-1 h-4 bg-gray-800 dark:bg-white absolute transform rotate-90 translate-x-[3px]"></div>
          </div>
        </div>
        <div>
          <p className="font-medium">Today&apos;s Time spent</p>
          <p className="text-sm text-gray-500">
            Added UI components to Library
          </p>
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <span>Time</span>
            <div className="ml-2 flex items-center bg-blue-50 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
              <span>13:00 - 14:45</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroActivityCard = () => {
  return (
    <div className="absolute -right-[10%] -bottom-[5%] lg:left-[10%] lg:bottom-[5%] w-64 bg-white dark:bg-black shadow-xl rounded-xl p-4 transform -rotate-2 z-10 overflow-hidden">
      <h3 className="font-medium text-lg mb-3">Today&apos;s tasks</h3>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-sm flex items-center justify-center mr-2">
                <span className="text-white text-xs">1</span>
              </div>
              <p className="text-xs">Unreal Engine env setup</p>
            </div>
            <div className="flex">
              <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-white -mr-1"></div>
              <div className="w-3 h-3 rounded-full bg-purple-400 border-2 border-white"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 ml-7">Sep 10</p>
          <div className="ml-3 mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-sm flex items-center justify-center mr-2">
                <span className="text-white text-xs">2</span>
              </div>
              <p className="text-xs">Blueprint visual scripting</p>
            </div>
            <div className="flex">
              <div className="w-3 h-3 rounded-full bg-purple-400 border-2 border-white -mr-1"></div>
              <div className="w-3 h-3 rounded-full bg-blue-400 border-2 border-white"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 ml-7">Sep 18</p>
          <div className="ml-3 mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-red-400 rounded-full"
              style={{ width: "80%" }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-sm flex items-center justify-center mr-2">
                <span className="text-white text-xs">3</span>
              </div>
              <p className="text-xs">Level Design Fundamentals</p>
            </div>
            <div className="flex">
              <div className="w-3 h-3 rounded-full bg-purple-400 border-2 border-white -mr-1"></div>
              <div className="w-3 h-3 rounded-full bg-blue-400 border-2 border-white"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 ml-7">Sep 18</p>
          <div className="ml-3 mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-red-400 rounded-full"
              style={{ width: "20%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
