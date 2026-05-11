import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-[#f7f2ea]">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
          404
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Page not found</h1>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full bg-[#f7f2ea] px-7 py-3 text-black"
        >
          Back Home
        </Link>
      </div>
    </main>
  );
}