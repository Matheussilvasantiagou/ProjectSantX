import Image from "next/image";
import type { Metadata } from "next";
import Background from "../../components/Background";
import Gallery from "../../components/Gallery";
import LocationGallery from "../../components/LocationGallery";
import MusicPlayer from "../../components/MusicPlayer";
import ScrollAnimations from "../../components/ScrollAnimations";
import SiteNav from "../../components/SiteNav";
import StickyCta from "../../components/StickyCta";
import ViewportVars from "../../components/ViewportVars";
import { buildWhatsappLink, config } from "../../lib/config";

export const metadata: Metadata = {
  title: config.event?.title ?? "Convite",
};

export default function InvitePage() {
  const ev = config.event ?? {};
  const sections = config.sections ?? {};

  const rsvpEnabled = !!ev.rsvp?.enabled;
  const rsvpCta = ev.rsvp?.ctaText ?? "Confirmar presença";
  const rsvpLink = buildWhatsappLink(ev.rsvp?.whatsappPhoneE164, ev.rsvp?.whatsappPrefill);
  const rsvpHref = rsvpEnabled && rsvpLink ? rsvpLink : "";

  const enabledSections = new Set(
    (["important", "about", "whatToBring", "rules", "gallery", "faq"] as const).filter(
      (id) => !!sections[id]?.enabled,
    ),
  );

  return (
    <div className="invite">
      <ViewportVars />
      <Background bg={config.background} />
      <MusicPlayer music={config.music} />
      <ScrollAnimations />

      <header className="topbar">
        <div className="topbar__in">
          <div className="brand">
            <div className="logo" aria-hidden="true" />
            <div className="brand__text">
              <div className="brand__title">{ev.title ?? "PROJECT X"}</div>
              <div className="brand__sub">{ev.dateText ?? "Data"}</div>
            </div>
          </div>
          <SiteNav enabledSections={enabledSections} />
        </div>
      </header>

      <main className="wrap">
        <div className="hero" id="top">
          <h1 className="hero__title">
            <span className="grad">{ev.title ?? "PROJECT X"}</span>
          </h1>
          <p className="hero__subtitle">{ev.subtitle ?? "Convite de aniversário."}</p>
        </div>

        <section className="section" id="info">
          <div className="section__hd">
            <h2 className="section__title">Informações</h2>
          </div>
          <div className="cards">
            <div className="card card--half">
              <div className="meta">
                <div className="meta__row">
                  <div className="k">Data</div>
                  <div className="v">{ev.dateText ?? "—"}</div>
                </div>
                <div className="meta__row">
                  <div className="k">Horário</div>
                  <div className="v">{ev.timeText ?? "—"}</div>
                </div>
              </div>
            </div>
            <div className="card card--half">
              <div className="meta">
                <div className="meta__row">
                  <div className="k">Local</div>
                  <div className="v">{ev.locationName ?? "—"}</div>
                </div>
                <div className="meta__row">
                  <div className="k">Endereço</div>
                  <div className="v">{ev.locationAddress ?? "—"}</div>
                </div>
              </div>
            </div>
            <LocationGallery images={ev.locationImages ?? []} />
          </div>
        </section>

        {sections.important?.enabled && (
          <section className="section" id="important">
            <div className="section__hd">
              <h2 className="section__title">{sections.important.title}</h2>
            </div>
            <div className="grid">
              <div className="panel">
                <ul className="list">
                  {(sections.important.bullets ?? []).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {sections.about?.enabled && (
          <section className="section" id="about">
            <div className="section__hd">
              <h2 className="section__title">{sections.about.title}</h2>
            </div>
            <div className="grid">
              <div className="panel">
                <div>{sections.about.text}</div>
              </div>
            </div>
          </section>
        )}

        {sections.whatToBring?.enabled && (
          <section className="section" id="whatToBring">
            <div className="section__hd">
              <h2 className="section__title">{sections.whatToBring.title}</h2>
            </div>
            <div className="grid">
              <div className="panel panel--half">
                <ul className="list">
                  {(sections.whatToBring.bullets ?? []).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {sections.rules?.enabled && (
          <section className="section" id="rules">
            <div className="section__hd">
              <h2 className="section__title">{sections.rules.title}</h2>
            </div>
            <div className="grid">
              <div className="panel">
                <ul className="list">
                  {(sections.rules.bullets ?? []).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {sections.gallery?.enabled && (
          <section className="section" id="gallery">
            <div className="section__hd">
              <h2 className="section__title">{sections.gallery.title}</h2>
            </div>
            <Gallery images={sections.gallery.images ?? []} />
          </section>
        )}

        {sections.faq?.enabled && (
          <section className="section" id="faq">
            <div className="section__hd">
              <h2 className="section__title">{sections.faq.title}</h2>
              <p className="section__hint">Perguntas rápidas, respostas diretas.</p>
            </div>
            <div className="grid">
              <div className="panel">
                <div className="faq">
                  {(sections.faq.items ?? []).map((it, i) => (
                    <details className="qa" key={i}>
                      <summary>{it.q}</summary>
                      <p>{it.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <footer className="footer">
          <div className="footer__cta">
            <a
              className="btn btn--primary"
              href={rsvpHref || "#"}
              hidden={!rsvpHref}
              target="_blank"
              rel="noreferrer"
            >
              {rsvpCta}
            </a>
            <a
              className="btn btn--app"
              href="https://apps.apple.com/br/app/santa-balb%C3%BArdia-party-games/id6751453390?l=en-GB"
              target="_blank"
              rel="noreferrer"
            >
              <Image className="btn__icon" src="/assets/logosbpng.png" alt="" width={22} height={22} aria-hidden="true" />
              Santa Balbúrdia: Party Games
            </a>
          </div>
        </footer>
      </main>

      <StickyCta href={rsvpHref} label={rsvpCta} />
    </div>
  );
}
