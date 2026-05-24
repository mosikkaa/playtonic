import { createClient } from "@/utils/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-gray-100 px-4 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <a href="/" className="font-semibold text-lg">
          Padel Georgia
        </a>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <a
                href="/bookings"
                className="text-sm text-gray-600 hover:text-black"
              >
                My bookings
              </a>
              <form action="/auth/signout" method="post">
                <button className="text-sm text-gray-600 hover:text-black">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <a
              href="/login"
              className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Log in
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
