import Image from "next/image";

export default function LocationGallery({ images }: { images: string[] }) {
  const list = images.filter(Boolean);
  if (!list.length) return null;

  return (
    <div className="card" data-location-card>
      <div className="section__hd" style={{ marginBottom: 10 }}>
        <h3 className="section__title" style={{ fontSize: 14 }}>
          Local
        </h3>
        <p className="section__hint">Janga, Paulista/PE</p>
      </div>
      <div className="locallery">
        {list.map((src) => (
          <a key={src} className="locallery__img" href={src} target="_blank" rel="noreferrer">
            <Image
              src={src}
              alt="Foto do local"
              fill
              loading="lazy"
              sizes="(max-width: 560px) 50vw, 33vw"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
