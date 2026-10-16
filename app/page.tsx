import Link from "next/link";
import Background from "../components/Background";
import ViewportVars from "../components/ViewportVars";
import { config } from "../lib/config";

export default function LandingPage() {
  const title = config.event?.title ?? "PROJECT X";

  return (
    <div className="landing">
      <ViewportVars />
      <Background bg={config.background} />

      <div className="gate gate--landing">
        <div className="gate__card">
          <div className="gate__logo" aria-hidden="true" />
          <div className="gate__title">{title}</div>
          <div className="gate__hint">Toque para abrir o convite.</div>
          <Link className="btn btn--primary gate__btn" href="/invite">
            Abrir convite
          </Link>
        </div>
      </div>
    </div>
  );
}
