import { createClient } from '@/utils/supabase/server'

export default async function Home() {
    const supabase = await createClient()

    const { data: clubs } = await supabase
        .from('clubs')
        .select('*, courts(*)')

    return (
        <main className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-semibold mb-2">Find a padel court</h1>
            <p className="text-gray-500 mb-8">Book courts across Tbilisi</p>

            <div className="grid gap-4">
                {clubs?.map((club) => (
                    <div
                        key={club.id}
                        className="border border-gray-200 rounded-xl p-5 hover:border-gray-400 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-medium">{club.name}</h2>
                                <p className="text-gray-500 text-sm mt-1">{club.address}</p>
                                <p className="text-gray-600 text-sm mt-2">{club.description}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 ml-4">
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

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                From{' '}
                                <span className="font-medium text-gray-900">
                  {Math.min(...club.courts.map((c: any) => c.price_per_hour))} GEL
                </span>{' '}
                                / hour
                            </p>

                            <a
                            href={`/clubs/${club.id}`}
                            className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                            View courts
                        </a>                    </div>

                    </div>))}
            </div>
        </main>
    )
}