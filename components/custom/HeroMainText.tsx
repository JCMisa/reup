import React from "react";

const HeroMainText = () => {
  return (
    <div className=" w-full flex flex-col items-center justify-center overflow-hidden rounded-md">
      <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center relative z-20">
        ReUp
      </h1>
      <div className="w-[40rem] h-40 relative -mb-22">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-3 bg-gradient-to-r from-transparent via-primary to-transparent h-[5px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-3 bg-gradient-to-r from-transparent via-primary to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-3 bg-gradient-to-r from-transparent via-primary-300 dark:via-primary-700 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-3 bg-gradient-to-r from-transparent via-primary-300 dark:via-primary-700 to-transparent h-px w-1/4" />
      </div>
    </div>
  );
};

export default HeroMainText;
