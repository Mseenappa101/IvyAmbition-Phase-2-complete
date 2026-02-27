import { EssayEditorClient } from "@/components/essays/EssayEditorClient";

export default async function EssayEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EssayEditorClient essayId={id} />;
}
