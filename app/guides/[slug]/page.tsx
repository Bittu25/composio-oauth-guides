import { notFound } from "next/navigation";
import { getGuide, getGuides } from "@/lib/guides";
import { GuideView } from "@/components/GuideView";

export function generateStaticParams() {
  return getGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const g = getGuide((await params).slug);
  return { title: g ? `${g.app} OAuth app guide` : "Guide not found", description: g?.summary };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  return <GuideView guide={g} />;
}
