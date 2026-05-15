'use client';

import { ReactNode, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Dot, Pause, Play } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Carousel — image/content carousel with animations
   ───────────────────────────────────────────────────────────────────────────── */

interface CarouselItem {
  id: string;
  /** Image URL or content */
  content: ReactNode;
  /** Optional caption */
  caption?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  /** Auto-play interval in ms. Default: 5000 */
  autoPlay?: number;
  /** Enable auto-play */
  autoPlayEnabled?: boolean;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show pagination dots */
  showDots?: boolean;
  /** Show caption */
  showCaption?: boolean;
  /** Animation type */
  animation?: 'slide' | 'fade' | 'zoom';
  /** Number of items to show at once */
  visibleItems?: number;
  /** Called when slide changes */
  onSlideChange?: (index: number) => void;
}

export function Carousel({
  items,
  autoPlay = 5000,
  autoPlayEnabled = true,
  showArrows = true,
  showDots = true,
  showCaption = false,
  animation = 'slide',
  visibleItems = 1,
  onSlideChange,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlayEnabled);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-play
  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;
    const timer = setInterval(nextSlide, autoPlay);
    return () => clearInterval(timer);
  }, [isPlaying, autoPlay, nextSlide, items.length]);

  // Notify on change
  useEffect(() => {
    onSlideChange?.(currentIndex);
  }, [currentIndex, onSlideChange]);

  if (items.length === 0) return null;

  const variants = {
    slide: {
      enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
      center: { x: 0, opacity: 1 },
      exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
    },
    fade: {
      enter: { opacity: 0 },
      center: { opacity: 1 },
      exit: { opacity: 0 },
    },
    zoom: {
      enter: { scale: 0.9, opacity: 0 },
      center: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      {/* Slides */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants[animation]}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%' }}
          >
            {items[currentIndex].content}
            {showCaption && items[currentIndex].caption && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '12px 16px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                color: '#fff',
                fontSize: 13,
              }}>
                {items[currentIndex].caption}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows */}
      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            style={{
              position: 'absolute',
              top: '50%',
              left: 12,
              transform: 'translateY(-50%)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            style={{
              position: 'absolute',
              top: '50%',
              right: 12,
              transform: 'translateY(-50%)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && items.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
        }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Play/Pause */}
      {autoPlay && (
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Gallery — grid of clickable images that open in carousel
   ───────────────────────────────────────────────────────────────────────────── */

interface GalleryImage {
  id: string;
  src: string;
  alt?: string;
}

interface GalleryProps {
  images: GalleryImage[];
  /** Number of columns */
  columns?: number;
  /** Called when image is clicked */
  onImageClick?: (image: GalleryImage, index: number) => void;
  /** Show lightbox on click */
  lightbox?: boolean;
}

export function Gallery({
  images,
  columns = 3,
  onImageClick,
  lightbox = true,
}: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 8,
        }}
      >
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              onImageClick?.(img, i);
              if (lightbox) setSelectedIndex(i);
            }}
            style={{
              aspectRatio: '1',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedIndex(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <img
            src={images[selectedIndex].src}
            alt={images[selectedIndex].alt}
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
          />
          <button
            onClick={() => setSelectedIndex(null)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 20,
            }}
          >
            ×
          </button>
        </motion.div>
      )}
    </>
  );
}