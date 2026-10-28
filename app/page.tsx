import { getGuides } from "@/lib/guides";
import { Generate } from "@/components/Generate";
import { Library } from "@/components/Library";
import { Recent } from "@/components/Recent";

export default function Home() {
  const guides = getGuides();
  const cards = guides.map(({ slug, app, website, summary, difficulty, time, review, composio }) => ({ slug, app, website, summary, difficulty, time, review, composio }));
  const claims = guides.flatMap((g) => g.claims);
  const sourced = claims.filter((c) => c.status === "source").length;
  const sources = new Set(guides.flatMap((g) => g.sources.map((s) => s.url))).size;
  const regimes = new Set(guides.map((g) => g.review.level)).size;

  return (
    <>
      <section className="hero">
        <div className="eyebrow">For agent builders on Composio</div>
        <h1>
          Get your OAuth app <span className="accent">approved</span>, without the guesswork
        </h1>
        <p className="hero-sub">
          Before your users can connect an app, you may need your own OAuth app approved by the provider. See how hard it is, how long it
          takes, what blocks approval, and which steps an agent can do for you.
        </p>
        <Generate known={guides.map((g) => ({ slug: g.slug, app: g.app, toolkit: g.composio.toolkit }))} />
        <dl className="hero-stats">
          <div><dt>Curated guides</dt><dd>{guides.length}</dd></div>
          <div><dt>Review regimes covered</dt><dd>{regimes}</dd></div>
          <div><dt>Claims backed by a source</dt><dd>{sourced}/{claims.length}</dd></div>
          <div><dt>Official pages cited</dt><dd>{sources}</dd></div>
        </dl>
      </section>

      <section className="how">
        <div><span className="how-n">1</span><strong>Look up an app</strong><p>Pick one from the library or type any app name or website.</p></div>
        <div><span className="how-n">2</span><strong>Know the real cost</strong><p>Hands-on time, approval wait and what works before approval.</p></div>
        <div><span className="how-n">3</span><strong>Split the work</strong><p>Every step is marked Agent, You or Provider, with sources behind each claim.</p></div>
      </section>

      <Recent />

      <section id="library" className="library">
        <div className="section-head">
          <h2>Library</h2>
          <p className="muted">Checked against official provider docs on 28 Oct 2026. Sorted easiest first.</p>
        </div>
        <Library guides={cards} />
      </section>
    </>
  );
}
