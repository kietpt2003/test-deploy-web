import React from "react";

const posters = [
  "https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/864dab11-e709-4088-ad18-fcc0d6d5fe46.jpg",
  "https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/6ec8c125-8272-4a65-b847-ab6bdf1b2644.jpg",
];

const PosterBanner1 = () => {
  return (
    <div className="flex justify-center w-auto h-[300px] mx-auto overflow-hidden rounded-lg shadow-lg">
      {posters.map((poster, index) => (
        <img
          key={index}
          src={poster}
          alt={`Poster ${index + 1}`}
          className="w-auto h-full object-contain"
        />
      ))}
    </div>
  );
};

export default PosterBanner1;