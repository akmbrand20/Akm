import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

export default function Footer() {
  const { phone, whatsappNumber, instagramUrl, tiktokUrl, facebookUrl } =
    useSettings();

  return (
    <footer className="border-t border-white/10 bg-[#050505] px-6 py-10 text-[#f7f2ea] md:px-12">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <h2 className="text-2xl font-black">AKM</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
            Comfort you can feel. Clean everyday essentials designed for easy
            styling and premium movement.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#c8b89d]">
            Support
          </h3>

          <div className="mt-4 grid gap-2 text-sm text-zinc-300">
            <Link to="/policy/shipping" className="hover:text-white">
              Shipping Policy
            </Link>
            <Link to="/policy/returns" className="hover:text-white">
              Return & Exchange Policy
            </Link>
            <Link to="/policy/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/policy/terms" className="hover:text-white">
              Terms & Conditions
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#c8b89d]">
            Social
          </h3>

          <div className="mt-4 grid gap-2 text-sm text-zinc-300">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                Instagram
              </a>
            )}

            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                TikTok
              </a>
            )}

            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                Facebook
              </a>
            )}

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-sm text-zinc-500">
        © {new Date().getFullYear()} AKM. All rights reserved.
      </div>
    </footer>
  );
}