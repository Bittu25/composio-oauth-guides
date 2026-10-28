import { getGuides } from "@/lib/guides";
import { Generate } from "@/components/Generate";
import { Library } from "@/components/Library";
import { Recent } from "@/components/Recent";

export default function Home() {
  const guides = getGuides();
  const cards = guides.map(({ slug, app, summary, difficulty, time, review, composio }) => ({ slug, app, summary, difficulty, time, review, composio }));
  return (
    <>
      <section className="hero">
        <h1>Get your OAuth app approved without the guesswork</h1>
        <p>
          Before your agent&apos;s users can connect an app, you may need your own OAuth app registered and approved by the provider.
          Look up an app to see how hard it is, how long it takes, what can block approval, and which steps an agent can do for you.
        </p>
        <Generate known={guides.map((g) => ({ slug: g.slug, app: g.app, toolkit: g.composio.toolkit }))} />
      </section>
      <Recent />
      <section id="library">
        <h2>Library</h2>
        <p className="muted">{guides.length} curated guides, each checked against official provider docs. Sorted easiest first.</p>
        <Library guides={cards} />
      </section>
    </>
  );
}
