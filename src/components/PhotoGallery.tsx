import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface GalleryProps {
  title: string;
  coverImage?: string;
  images: string[];
}

export function PhotoGallery({ title, coverImage: customCover, images }: GalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const coverImage = customCover || images[0];

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Cover Card */}
      <div className="flex flex-col items-center w-full group">
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-[85%] sm:w-full max-w-[280px] sm:max-w-none aspect-[4/5] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-romantic-text/10 mb-4 sm:mb-5 cursor-pointer bg-white"
        >
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Subtle overlay for hover effect */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
        </button>
        <h3 className="font-serif text-xl sm:text-2xl italic text-romantic-text text-center px-2">
          {title}
        </h3>
      </div>

      {/* Full-screen Lightbox Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md overflow-y-auto"
          >
            <div className="min-h-screen py-12 px-4 flex flex-col items-center w-full">
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="fixed top-4 right-4 md:top-6 md:right-6 text-white/80 hover:text-white bg-white/10 p-3 rounded-full backdrop-blur-md transition-colors z-[110]"
              >
                <X size={28} />
              </button>

              <motion.h3 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-serif text-2xl md:text-4xl italic text-white mb-8 md:mb-12 mt-4 md:mt-8 text-center px-4"
              >
                {title}
              </motion.h3>

              {/* Photos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12 w-full max-w-6xl pb-24 px-4">
                {images.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="polaroid mx-auto w-full max-w-sm"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${title} - ${idx}`}
                      className="w-full aspect-square object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

