"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowsExpandIcon,
  PhotographIcon,
  XIcon,
} from "@heroicons/react/solid";
import Reveal from "../Common/Reveal";
import { aydGallery } from "../../helpers/data";

const AydGallery = () => {
  const [active, setActive] = useState(null);
  const [failed, setFailed] = useState({});
  const triggersRef = useRef([]);

  const isOpen = active !== null;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  const close = (index) => {
    setActive(null);
    // Send focus back to the tile that opened the lightbox.
    triggersRef.current[index]?.focus();
  };

  if (!aydGallery?.length) return null;

  return (
    <section className="ayd-light relative w-full bg-[#f7f5ef] px-6 md:px-10 py-6 md:py-10">
      <Reveal className="mx-auto w-full max-w-5xl">
        <div className="mb-9 text-center md:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3.5 py-1 text-[11px] uppercase tracking-[0.22em] text-primary-shade backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" />
            Event Highlights
          </div>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Archdiocesan Youth Day 2026
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm md:text-base text-zinc-600">
            Tap an image to view it full size.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {aydGallery.map((image, index) => (
            <Reveal key={image.src} delay={index * 0.1}>
              <motion.button
                type="button"
                ref={(el) => {
                  triggersRef.current[index] = el;
                }}
                onClick={() => setActive(index)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                aria-label={`View ${image.alt} full size`}
                className="group relative block w-full text-left"
              >
                <div
                  aria-hidden
                  className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/50 via-primary/15 to-green/40 opacity-70 blur-[2px] transition-opacity group-hover:opacity-100"
                />
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-card-premium">
                  {/* Fixed ratio keeps both tiles equal height and reserves
                      space so nothing shifts as the images load. */}
                  <div className="relative aspect-[4/5] w-full bg-[#efece2]">
                    {failed[image.src] ? (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
                        <PhotographIcon className="h-10 w-10 text-primary/50" />
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Image coming soon
                        </p>
                      </div>
                    ) : (
                      <>
                        <img
                          src={image.src}
                          alt={image.alt}
                          loading="lazy"
                          decoding="async"
                          onError={() =>
                            setFailed((prev) => ({
                              ...prev,
                              [image.src]: true,
                            }))
                          }
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                        <div
                          aria-hidden
                          className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70"
                        />
                        <span
                          aria-hidden
                          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        >
                          <ArrowsExpandIcon className="h-4 w-4" />
                        </span>
                      </>
                    )}
                  </div>

                  {image.caption && (
                    <div className="px-5 py-4">
                      <p className="text-sm font-semibold text-zinc-800">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </div>
              </motion.button>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="ayd-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={aydGallery[active].alt}
            onClick={() => close(active)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm md:p-10"
          >
            <button
              type="button"
              autoFocus
              onClick={() => close(active)}
              aria-label="Close image"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-8 md:top-8"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <motion.img
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              src={aydGallery[active].src}
              alt={aydGallery[active].alt}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AydGallery;
