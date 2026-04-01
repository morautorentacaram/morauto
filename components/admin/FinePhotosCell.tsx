"use client"

import { useState } from "react"
import Image from "next/image"
import { Images, X, ChevronLeft, ChevronRight } from "lucide-react"

export default function FinePhotosCell({ photos }: { photos: string[] }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  if (!photos.length) {
    return <span className="text-zinc-600 text-xs">—</span>
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setIndex(0); setOpen(true) }}
        className="flex items-center gap-1.5 text-zinc-400 hover:text-[#d4a017] transition-colors"
      >
        <div className="relative w-8 h-8 rounded overflow-hidden border border-zinc-700">
          <Image src={photos[0]} alt="foto" fill className="object-cover" unoptimized />
        </div>
        {photos.length > 1 && (
          <span className="flex items-center gap-0.5 text-xs">
            <Images size={12} />
            {photos.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-zinc-300"
            >
              <X size={24} />
            </button>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900">
              <Image src={photos[index]} alt={`foto ${index + 1}`} fill className="object-contain" unoptimized />
            </div>

            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white rounded-full p-2 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setIndex((i) => (i + 1) % photos.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white rounded-full p-2 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>

                <div className="flex gap-2 mt-3 justify-center">
                  {photos.map((url, i) => (
                    <button key={url} onClick={() => setIndex(i)} className={`relative w-12 h-8 rounded overflow-hidden border-2 transition-colors ${i === index ? "border-[#d4a017]" : "border-zinc-700 hover:border-zinc-500"}`}>
                      <Image src={url} alt="" fill className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>

                <p className="text-zinc-500 text-xs text-center mt-2">{index + 1} / {photos.length}</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
