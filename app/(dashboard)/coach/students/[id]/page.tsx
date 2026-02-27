import { CoachStudentDetailClient } from "@/components/coach/CoachStudentDetailClient";

export default async function CoachStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CoachStudentDetailClient studentId={id} />;
}
