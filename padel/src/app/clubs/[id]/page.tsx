import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function ClubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: club } = await supabase
    .from("clubs")
    .select("*, courts(*)")
    .eq("id", id)
    .single();

  if (!club) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <a
        href="/"
        className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block"
      >
        ← Back to clubs
      </a>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">{club.name}</h1>
          <p className="text-gray-500 mt-1">{club.address}</p>
          <p className="text-gray-600 mt-3">{club.description}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0 ml-6">
          {club.indoor && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
              Indoor
            </span>
          )}
          {club.outdoor && (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md">
              Outdoor
            </span>
          )}
        </div>
      </div>

      {/* Courts */}
      <h2 className="text-xl font-medium mb-4">Courts</h2>
      <div className="grid gap-4">
        {club.courts.map((court: any) => (
          <div key={court.id} className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{court.name}</h3>
                <p className="text-sm text-gray-500 mt-1 capitalize">
                  {court.type}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{court.price_per_hour} GEL</p>
                <p className="text-sm text-gray-500">per hour</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <a
                href={`/clubs/${club.id}/courts/${court.id}`}
                className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors inline-block"
              >
                See availability
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
