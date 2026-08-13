import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface LocationMapProps {
  /** Location name to display */
  location?: string;
  /** Latitude coordinate */
  latitude?: number;
  /** Longitude coordinate */
  longitude?: number;
  /** Zoom level for the map (1-18) */
  zoom?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether the card starts expanded */
  defaultExpanded?: boolean;
}

// Convert lat/lng to tile coordinates
function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return { x, y };
}

// Get tile URL based on provider
function getTileUrl(provider: string, x: number, y: number, z: number) {
  switch (provider) {
    case "carto-light":
      return `https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/${z}/${x}/${y}.png`;
    case "carto-dark":
      return `https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/${z}/${x}/${y}.png`;
    default:
      return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }
}

// Format coordinates for display
function formatCoordinates(lat: number, lng: number) {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export function LocationMap({
  location = "Shikaripalya, Electronic City",
  latitude = 12.8360,
  longitude = 77.6572,
  zoom = 14,
  className,
  defaultExpanded = false,
}: LocationMapProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-50, 50], [8, -8]);
  const rotateY = useTransform(mouseX, [-50, 50], [-8, 8]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const coordinates = useMemo(
    () => formatCoordinates(latitude, longitude),
    [latitude, longitude],
  );

  // When expanded, render light/white map tiles ("carto-light")!
  const tileProvider = isExpanded ? "carto-light" : "carto-dark";

  // Generate tile URLs for a 3x3 grid around the center tile
  const tiles = useMemo(() => {
    const centerTile = latLngToTile(latitude, longitude, zoom);
    const tileUrls: { url: string; offsetX: number; offsetY: number }[] = [];

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        tileUrls.push({
          url: getTileUrl(
            tileProvider,
            centerTile.x + dx,
            centerTile.y + dy,
            zoom,
          ),
          offsetX: dx,
          offsetY: dy,
        });
      }
    }

    return tileUrls;
  }, [latitude, longitude, zoom, tileProvider]);

  // Preload tiles
  useEffect(() => {
    setTilesLoaded(false);
    let loadedCount = 0;
    const totalTiles = tiles.length;

    tiles.forEach((tile) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalTiles) {
          setTilesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalTiles) {
          setTilesLoaded(true);
        }
      };
      img.src = tile.url;
    });
  }, [tiles]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const handleClick = () => {
    if (isExpanded) {
      // Third click / click while expanded in white mode -> redirect to Google Maps!
      window.open(
        "https://maps.google.com/?q=Gymnation,+01,+Gollahalli+Main+Rd,+Shikaripalya,+Electronic+City,+Bengaluru,+Karnataka+560100",
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      // First click -> expand map into white color theme!
      setIsExpanded(true);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative cursor-pointer select-none mt-4 w-full max-w-[290px]", className)}
      style={{
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <motion.div
        className={cn(
          "relative overflow-hidden rounded-2xl border transition-colors duration-300 shadow-2xl max-w-full",
          isExpanded
            ? "border-orange-500/80 bg-white shadow-orange-500/20"
            : "border-slate-800 bg-slate-900"
        )}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          width: isExpanded ? 280 : 220,
          height: isExpanded ? 190 : 110,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 35,
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/20 via-transparent to-slate-950/20" />

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* White Map Tiles */}
              <div className="absolute inset-0 overflow-hidden bg-white">
                <div
                  className="absolute"
                  style={{
                    width: "768px", // 3 tiles * 256px
                    height: "768px",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {tiles.map((tile, index) => (
                    <motion.div
                      key={index}
                      className="absolute"
                      style={{
                        width: "256px",
                        height: "256px",
                        left: `${(tile.offsetX + 1) * 256}px`,
                        top: `${(tile.offsetY + 1) * 256}px`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: tilesLoaded ? 1 : 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <img
                        src={tile.url}
                        alt="Map tile"
                        width={256}
                        height={256}
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover brightness-105 contrast-105"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Map loading placeholder */}
              {!tilesLoaded && (
                <div className="absolute inset-0 animate-pulse bg-slate-100" />
              )}

              {/* Location marker */}
              <motion.div
                className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  delay: 0.2,
                }}
              >
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="drop-shadow-xl animate-bounce"
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(249, 115, 22, 0.8))",
                  }}
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                    fill="#F97316"
                  />
                  <circle cx="12" cy="9" r="2.5" className="fill-white" />
                </svg>
              </motion.div>

              {/* Light Gradient overlays for text contrast */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid pattern - only show when collapsed */}
        <motion.div
          className="absolute inset-0 opacity-[0.05]"
          animate={{ opacity: isExpanded ? 0 : 0.05 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern
                id="grid-map"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  className="stroke-orange-500"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-map)" />
          </svg>
        </motion.div>

        {/* Content */}
        <div className="relative z-20 flex h-full flex-col justify-between p-3.5">
          {/* Top section */}
          <div className="flex items-start justify-between gap-2">
            <div className="relative">
              <motion.div
                className="relative"
                animate={{
                  opacity: 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Map Icon SVG */}
                <motion.svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isExpanded ? "text-orange-600" : "text-orange-400"}
                  animate={{
                    filter: isHovered
                      ? "drop-shadow(0 0 8px rgba(249, 115, 22, 0.8))"
                      : "drop-shadow(0 0 4px rgba(249, 115, 22, 0.4))",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" x2="9" y1="3" y2="18" />
                  <line x1="15" x2="15" y1="6" y2="21" />
                </motion.svg>
              </motion.div>
            </div>
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shadow-sm shrink-0",
                isExpanded
                  ? "bg-orange-500 text-white animate-pulse"
                  : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
              )}
            >
              {isExpanded ? "Open Google Maps ↗" : "Click to Expand (White)"}
            </span>
          </div>

          {/* Bottom section */}
          <div className="space-y-0.5">
            <motion.h3
              className={cn(
                "font-bold text-xs tracking-tight transition-colors truncate",
                isExpanded ? "text-white drop-shadow-md" : "text-white"
              )}
              animate={{
                x: isHovered ? 3 : 0,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {location}
            </motion.h3>

            <AnimatePresence>
              {isExpanded && (
                <motion.p
                  className="font-mono text-slate-200 text-[10px] drop-shadow-sm font-semibold truncate"
                  initial={{ opacity: 0, y: -5, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -5, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {coordinates} • Tap again to open Maps
                </motion.p>
              )}
            </AnimatePresence>

            {/* Animated underline */}
            <motion.div
              className="h-px bg-gradient-to-r from-orange-500 via-amber-400 to-transparent"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{
                scaleX: isHovered || isExpanded ? 1 : 0.4,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LocationMap;
