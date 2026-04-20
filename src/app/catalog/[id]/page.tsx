import { fetchWorkshopById } from '@/controllers/catalogController';
import { WorkshopDetails } from '@/views/catalog/WorkshopDetails';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (!params.id || params.id === 'undefined') {
    return { title: 'Workshop Not Found' };
  }
  const workshop = await fetchWorkshopById(params.id);
  if (!workshop) return { title: 'Workshop Not Found' };
  return {
    title: `${workshop.title} | Vismaya Camp 2026`,
    description: workshop.description,
  };
}

export default async function WorkshopPage({ params }: { params: { id: string } }) {
  if (!params.id || params.id === 'undefined') {
    notFound();
  }
  
  const workshop = await fetchWorkshopById(params.id);
  
  if (!workshop) {
    notFound();
  }

  return <WorkshopDetails workshopId={params.id} />;
}
