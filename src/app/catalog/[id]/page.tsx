import { fetchWorkshopById } from '@/controllers/catalogController';
import { WorkshopDetails } from '@/views/catalog/WorkshopDetails';
import { notFound } from 'next/navigation';

type WorkshopPageParams = {
  id: string;
};

type WorkshopPageSearchParams = {
  camperId?: string;
};

export async function generateMetadata({ params }: { params: Promise<WorkshopPageParams> }) {
  const { id } = await params;

  if (!id || id === 'undefined') {
    return { title: 'Workshop Not Found' };
  }

  const workshop = await fetchWorkshopById(id);
  if (!workshop) return { title: 'Workshop Not Found' };

  return {
    title: `${workshop.title} | Vismaya Camp 2026`,
    description: workshop.description,
  };
}

export default async function WorkshopPage({ params, searchParams }: { params: Promise<WorkshopPageParams>; searchParams: Promise<WorkshopPageSearchParams> }) {
  const { id } = await params;
  const { camperId } = await searchParams;

  if (!id || id === 'undefined') {
    notFound();
  }

  const workshop = await fetchWorkshopById(id);
  
  if (!workshop) {
    notFound();
  }

  return <WorkshopDetails workshopId={id} selectedCamperId={camperId} />;
}
