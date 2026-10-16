import Image from "next/image";

export default function Gallery({ images }: { images: string[] }) {
  if (!images.length) return null;
  return (
    <div className="gallery" data-gallery>
      {images.map((src) => (
        <a key={src} className="gimg" href={src} target="_blank" rel="noreferrer">
          <Image
            src={src}
            alt="Foto da festa"
            fill
            loading="lazy"
            sizes="(max-width: 560px) 100vw, 50vw"
          />
        </a>
      ))}
    </div>
  );
}
