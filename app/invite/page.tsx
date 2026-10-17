import type { Metadata } from "next";
import Background from "../../components/Background";
import MusicPlayer from "../../components/MusicPlayer";
import ViewportVars from "../../components/ViewportVars";
import { config } from "../../lib/config";

export const metadata: Metadata = {
  title: config.event?.title ?? "Convite",
};

export default function InvitePage() {
  return (
    <div className="invite">
      <ViewportVars />
      <Background bg={config.background} />
      <MusicPlayer music={config.music} />
    </div>
  );
}
