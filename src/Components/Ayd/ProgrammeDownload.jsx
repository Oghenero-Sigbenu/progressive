"use client";

import {
  DocumentTextIcon,
  DownloadIcon,
  ExternalLinkIcon,
} from "@heroicons/react/solid";
import Reveal from "../Common/Reveal";
import { aydProgramme } from "../../helpers/data";

const ProgrammeDownload = () => {
  const { title, description, file, fileName, meta } = aydProgramme;

  const details = [
    meta?.type,
    meta?.pages ? `${meta.pages} pages` : null,
    meta?.size,
  ].filter(Boolean);

  return (
    // scroll-mt clears the sticky site header when linked to via /AYD#programme
    <section
      id="programme"
      className="ayd-light relative w-full scroll-mt-24 bg-[#f7f5ef] pt-4 px-6 md:scroll-mt-28 md:px-16 pb-6 md:pb-10"
    >
      <Reveal className="mx-auto w-full max-w-4xl">
        <div className="relative">
          {/* Card gradient border — matches the registration card treatment */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/50 via-primary/15 to-green/40 opacity-80 blur-[2px]" />
          <div className="relative rounded-3xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-card-premium">
            <div className="flex flex-col items-center gap-7 px-6 py-9 text-center md:flex-row md:items-center md:gap-9 md:px-10 md:py-10 md:text-left">
              {/* Document mark */}
              <div className="relative shrink-0">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-2xl bg-primary/25 blur-xl"
                />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-b from-primary/35 to-primary/5 ring-1 ring-primary/40">
                  <DocumentTextIcon className="h-12 w-12 text-primary-shade" />
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
                  {title}
                </h2>
                <p className="mt-2 text-sm md:text-base leading-relaxed text-zinc-600">
                  {description}
                </p>

                {/* File details up front — a 13MB download shouldn't be a surprise */}
                {details.length > 0 && (
                  <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500 md:justify-start">
                    {details.map((detail, i) => (
                      <li key={detail} className="flex items-center gap-2">
                        {i > 0 && (
                          <span
                            aria-hidden
                            className="h-1 w-1 rounded-full bg-zinc-400"
                          />
                        )}
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row md:justify-start">
                  <a
                    href={file}
                    download={fileName}
                    className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-green px-7 text-sm font-semibold text-white shadow-lg shadow-green/30 transition-colors hover:bg-green-shade sm:flex-initial"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    Download PDF
                  </a>
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-black/15 bg-white/70 px-7 text-sm font-semibold text-zinc-700 transition-colors hover:border-primary/50 hover:text-primary-shade sm:flex-initial"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                    View in browser
                  </a>
                </div>

                <p className="mt-4 text-xs text-zinc-500">
                  On mobile data? &ldquo;View in browser&rdquo; opens the
                  programme without saving the full file to your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default ProgrammeDownload;
