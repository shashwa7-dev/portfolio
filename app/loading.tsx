import Brand from "@/components/Brand";
import { Loader } from "feather-icons-react";
import React from "react";

const Loading = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-2">
      <div className="w-[100px] h-[100px] relative rounded-xl">
        <img src="./images/offcod8.webp" alt="loading..." />
        <Loader className="animate-spin absolute bottom-2 right-1 w-4 h-4" />
      </div>{" "}
      <p>{"Yup, almost there ;)"}</p>
      <Brand />
    </div>
  );
};

export default Loading;
