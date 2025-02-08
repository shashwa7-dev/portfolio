import React from "react";
import SpotifyLastListen from "./SpotifyLastListen";

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
        <p>{name}</p>
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
      <p className="text-lg font-medium border-b text-secondary-foreground">
        {"Activity"}
      </p>
      <div className="grid gap-1">
        <p className="italic">Currently Reading</p>
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
        <p className="italic">Last listen</p>
        <SpotifyLastListen />
      </div>
    </div>
  );
};

export default Activity;
