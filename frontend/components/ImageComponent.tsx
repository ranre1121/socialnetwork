import Image from "next/image";
import { useEffect, useState } from "react";
import publicPlaceholder from "@/public/images/profile-placeholder.png";

const ImageComponent = ({ src, size }: { src?: string; size: number }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    console.log("src:", src);
    console.log("size:", size);
  }, [src, size]);

  const imgSrc = src || publicPlaceholder;

  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      {!imageLoaded && (
        <div
          className="rounded-full bg-gray-300 dark:bg-gray-600"
          style={{ width: size, height: size }}
        />
      )}

      <Image
        src={imgSrc}
        alt="avatar"
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: "50%" }}
        onLoadingComplete={() => setImageLoaded(true)}
        className={` ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        unoptimized
      />
    </div>
  );
};

export default ImageComponent;
