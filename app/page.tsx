"use client";

import { useState, useEffect } from "react";
import CurrentState from "./components/CurrentState";
import Footer from "./components/Footer";
import Intro from "./components/Intro";
import Loading from "./loading";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div
      className="container p-5 lg:p-10 lg:pb-5 flex flex-col gap-6 h-full opacity-0 animate-fadeIn"
      style={{ zIndex: 1 }}
    >
      <Intro />
      <CurrentState />
      <Footer />
      <div
        className="fixed -z-10 w-[800px] lg:w-[1250px]  -bottom-[225px] lg:-bottom-[300px] -right-[225px] lg:-right-[350px] opacity-5"
        style={{ transform: "rotate(-28.5deg)" }}
      >
        <img
          src={"./fevicon.svg"}
          alt="shashwat tripathi"
          className="w-full h-full "
        />
      </div>
    </div>
  );
}
