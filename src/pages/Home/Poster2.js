import React from "react";

const posters = [
  "https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/23ee5815-461d-4554-a6ac-4a0544f81487.jpg",
];

const PosterBanner = () => {
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

export default PosterBanner;