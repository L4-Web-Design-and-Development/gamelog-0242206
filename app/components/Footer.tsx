import { Link } from "@remix-run/react";
import siteLogo from "~/assets/svg/gamelog-logo.svg";
import facebookIcon from "~/assets/svg/facebook.svg";
import instagramIcon from "~/assets/svg/instagram.svg";
import twitterIcon from "~/assets/svg/twitter.svg";

export default function Footer() {
  return (
    <footer className="bg-[#071212] text-gray-400 text-sm rounded-b-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start py-8 px-6">
        {/* Left: Logo and Social Icons */}
        <div className="flex flex-col items-start gap-4 mb-8 md:mb-0">
          <Link to="/">
            <img src={siteLogo} alt="GameLog Logo" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Facebook">
              <img src={facebookIcon} alt="Facebook" className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram">
              <img src={instagramIcon} alt="Instagram" className="h-5 w-5" />
            </a>
            <a href="#" aria-label="X">
              <img src={twitterIcon} alt="X" className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Right: Columns */}
        <div className="flex flex-row gap-16">
          {/* Site Column */}
          <div>
            <div className="font-semibold text-white mb-2">Site</div>
            <ul className="space-y-1">
              <li><Link to="/games">Games</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          {/* Support Column */}
          <div>
            <div className="font-semibold text-white mb-2">Support</div>
            <ul className="space-y-1">
              <li><Link to="/legal">Legal</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          {/* Follow Us Column */}
          <div>
            <div className="font-semibold text-white mb-2">Follow Us</div>
            <ul className="space-y-1">
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Instagram</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
