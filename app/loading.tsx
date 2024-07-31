import React from "react";

const Loading = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-2">
      <div className="w-[50px] h-[50px]">
        <img src="./images/pixel.png" alt="loading..." />
      </div>{" "}
      <span className="dots" />
      <p>{"Yup, almost there ;)"}</p>
    </div>
  );
};

export default Loading;
