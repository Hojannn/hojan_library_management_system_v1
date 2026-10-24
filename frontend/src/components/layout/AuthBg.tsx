
import { useEffect, useState } from "react";

const images = [
  "/images/img1.webp",
  "/images/img2.webp",
  "/images/img3.webp",
  "/images/img4.webp",
  "/images/img5.webp"
];

export default function AuthBackground() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 bg-cover bg-center
            transition-opacity duration-1000 ease-in-out
            ${active === index ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundImage: `url("${image}")` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
