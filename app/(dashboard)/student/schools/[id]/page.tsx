import { SchoolDetailClient } from "@/components/schools/SchoolDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SchoolDetailPage({ params }: Props) {
  const { id } = await params;
  return <SchoolDetailClient schoolId={id} />;
}
