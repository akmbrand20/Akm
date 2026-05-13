import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { useLanguage } from "../../hooks/useLanguage";

export default function Footer() {
  const { whatsappNumber, instagramUrl, tiktokUrl, facebookUrl } =
    useSettings();
  const { t } = useLanguage();

  return (
    <footer className="border-t border-[#eadfc9] bg-[#c8b89d] px-6 py-10 text-[#18120b] shadow-[0_-24px_70px_rgba(200,184,157,0.16)] md:px-12">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <h2 className="text-2xl font-black">AKM</h2>
          <p className="mt-3 max-w-md text-base leading-7 text-[#3c2f20] md:text-sm md:leading-6">
            {t("footer.description")}
          </p>
        </div>

        <div>
          <h3 className="text-base font-bold uppercase tracking-[0.22em] text-[#4a3823] md:text-sm md:tracking-[0.25em]">
            {t("footer.support")}
          </h3>

          <div className="mt-4 grid gap-3 text-base font-medium text-[#241a10] md:gap-2 md:text-sm">
            <Link to="/policy/shipping" className="hover:text-black">
              {t("footer.shippingPolicy")}
            </Link>
            <Link to="/policy/returns" className="hover:text-black">
              {t("footer.returnPolicy")}
            </Link>
            <Link to="/policy/privacy" className="hover:text-black">
              {t("footer.privacyPolicy")}
            </Link>
            <Link to="/policy/terms" className="hover:text-black">
              {t("footer.terms")}
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold uppercase tracking-[0.22em] text-[#4a3823] md:text-sm md:tracking-[0.25em]">
            {t("footer.social")}
          </h3>

          <div className="mt-4 grid gap-3 text-base font-medium text-[#241a10] md:gap-2 md:text-sm">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-black"
              >
                Instagram
              </a>
            )}

            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-black"
              >
                TikTok
              </a>
            )}

            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-black"
              >
                Facebook
              </a>
            )}

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-black"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-[#4a3823]/25 pt-6 text-sm font-medium text-[#4a3823]">
        © {new Date().getFullYear()} AKM. {t("footer.rights")}
      </div>
    </footer>
  );
}
