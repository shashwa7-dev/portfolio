import React from "react";
import SpotifyLastListen from "./SpotifyLastListen";
import Link from "next/link";
import { SVGS } from "./SVGS";

const Book = ({
  name,
  author,
  cover,
  progress,
}: {
  name: string;
  author: string;
  cover: string;
  progress: number;
}) => {
  return (
    <div className="w-[150px] h-[200px] relative rounded-lg overflow-hidden border">
      <div className="book_info w-full bg-card absolute bottom-1 right-0 p-1 text-xs">
        <p className="font-sans">{name}</p>
        <p className="text-secondary-foreground italic">{author}</p>
      </div>
      <img src={cover} alt={name} className="w-full h-full object-cover" />
      <div className="bg-muted w-full p-[2px] absolute bottom-0 left-0">
        <div
          className={`bg-muted-foreground p-[2px] absolute bottom-0 left-0`}
          style={{ width: `${Math.abs((progress / 100) * 100)}%` }}
        />
      </div>
    </div>
  );
};
const Activity = () => {
  return (
    <div className="text-sm grid gap-3">
      <p className="text-lg font-medium text-secondary-foreground font-sans border-b">
        {"Activity"}
      </p>
      <div className="grid gap-1">
        <p className="italic font-sans text-muted-foreground">Blogs</p>
        <Link href={"/blogs"}>
          <div className="flex border w-fit bg-card p-1 gap-1 rounded-md border-b-4 items-center pr-2">
            <img src={"/images/icon_blogpost.svg"} className="w-4 h-4" />
            <button className="hover:underline">Checkout blogs</button>
            <SVGS.Link className="w-[10px] h-[10px]" />
          </div>
        </Link>
      </div>
      <div className="grid gap-1">
        <p className="italic font-sans text-muted-foreground">
          Currently Reading
        </p>
        <div className="flex flex-wrap gap-2">
          <Book
            name={"Build A LLM"}
            cover="/books/book_build_LLM.JPG"
            author="Sebestian Raschka"
            progress={15}
          />
          <Book
            name={"Advanced React"}
            cover="/books/book_advnc_react.JPG"
            author="Nadia Makarevich"
            progress={35}
          />
          <Book
            name={"Can't Hurt Me"}
            cover="/books/book_cant_hurt_me.jpg"
            author="David Goggins"
            progress={17}
          />
        </div>
      </div>

      <div className="grid gap-1">
        <p className="italic font-sans text-muted-foreground">Last listen</p>
        <SpotifyLastListen />
      </div>
    </div>
  );
};

export default Activity;
