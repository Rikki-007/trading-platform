"use client";

import { Compass, Phone, Mail, MapPin } from "lucide-react";
import { CONTACT_INFO } from "@/lib/contact/info";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-hairline bg-void/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-mist">
              <Compass className="h-4 w-4 text-gold/70" strokeWidth={1.75} />
              <span className="font-display text-xs tracking-[0.14em] text-mist">
                LODESTAR MERIDIAN EXCHANGE
              </span>
            </div>
            <p className="mt-2 text-xs text-mist-dim">Chart your own course.</p>
            <a href="/get-started" className="mt-3 inline-block text-xs text-cyan hover:underline">
              Join the community →
            </a>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-mist-dim">Contact</p>
            <ul className="mt-2 space-y-1.5 text-xs text-mist">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-mist-dim" strokeWidth={1.75} />
                <a href={`tel:${CONTACT_INFO.supportPhone.replace(/[^+\d]/g, "")}`} className="hover:text-porcelain">
                  {CONTACT_INFO.supportPhone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-mist-dim" strokeWidth={1.75} />
                <a href={`mailto:${CONTACT_INFO.supportEmail}`} className="hover:text-porcelain">
                  {CONTACT_INFO.supportEmail}
                </a>
              </li>
              <li className="text-mist-dim">{CONTACT_INFO.hours}</li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-mist-dim">Office</p>
            <div className="mt-2 flex items-start gap-2 text-xs text-mist">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mist-dim" strokeWidth={1.75} />
              <span>
                {CONTACT_INFO.office.line1}
                <br />
                {CONTACT_INFO.office.line2}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 border-t border-hairline pt-6 text-xs text-mist-dim">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          Simulated market data — no real funds are traded on this platform.
        </div>
      </div>
    </footer>
  );
}
