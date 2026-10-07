import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  X,
  Volume2,
  VolumeX,
  LayoutGrid,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  fetchPdfWithMultiTierClientCache,
  saveReadingProgress,
  getReadingProgress,
} from '../../utils/clientPdfStorage';

export interface BookFlipPdfReaderProps {
  pdfUrl: string;
  title?: string;
  author?: string;
  onClose?: () => void;
  allowDownload?: boolean;
}

/**
 * Synthesizes a soft, realistic paper page-turn rustle sound using Web Audio API.
 * Zero external audio files required, 0 KB bundle footprint.
 */
function playPageFlipSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const duration = 0.16; // 160ms
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const envelope = Math.sin(t * Math.PI) * Math.pow(1 - t, 0.65);
      data[i] = (Math.random() * 2 - 1) * envelope * 0.14;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1050, ctx.currentTime);
    filter.Q.setValueAtTime(1.4, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.75, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {
    // Ignore autoplay restriction or AudioContext errors
  }
}


export const BookFlipPdfReader: React.FC<BookFlipPdfReaderProps> = ({
  pdfUrl,
  title = 'Document',
  author,
  onClose,
  allowDownload = true,
}) => {
  // Document state
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showIframeFallback, setShowIframeFallback] = useState<boolean>(false);

  // View settings
  const [isDoublePage, setIsDoublePage] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);

  // 3D Flip state
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);

  // Canvas refs
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const singleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const activeRenderTasks = useRef<RenderTask[]>([]);

  // Page input jump state
  const [pageInputVal, setPageInputVal] = useState<string>('1');

  // Automatically switch to single-page mode on small screens (< 860px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 860) {
        setIsDoublePage(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync page input when currentPage changes
  useEffect(() => {
    setPageInputVal(currentPage.toString());
  }, [currentPage]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const getPdfStreamUrl = useCallback(
    (url: string): string => {
      if (!url) return '';
      if (url.startsWith('/api') || url.includes('/proxy-pdf')) return url;
      // AWS S3 and remote domains block browser canvas fetch via CORS.
      // Route through backend proxy to guarantee 100% reliable cross-origin streaming.
      if (
        url.includes('amazonaws.com') ||
        url.includes('s3.') ||
        url.includes('digitaloceanspaces.com') ||
        (url.startsWith('http') && typeof window !== 'undefined' && !url.includes(window.location.host))
      ) {
        return `${API_BASE_URL}/publications-handbooks/proxy-pdf?url=${encodeURIComponent(url)}`;
      }
      return url;
    },
    [API_BASE_URL]
  );

  // Save user reading progress (last opened page) in browser localStorage
  useEffect(() => {
    if (currentPage >= 1 && pdfUrl) {
      saveReadingProgress(pdfUrl, currentPage);
    }
  }, [currentPage, pdfUrl]);

  // Load PDF Document asynchronously with multi-tier client cache (IndexedDB + Cache API + localStorage)
  useEffect(() => {
    let isCancelled = false;
    let loadingTask: { promise: Promise<PDFDocumentProxy>; destroy: () => void } | null = null;
    setLoading(true);
    setLoadError(null);
    setShowIframeFallback(false);

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        if (pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${
            pdfjs.version || '3.11.174'
          }/pdf.worker.min.js`;
        }

        const targetUrl = getPdfStreamUrl(pdfUrl);

        let arrayBuffer: ArrayBuffer;
        try {
          const res = await fetchPdfWithMultiTierClientCache(targetUrl, { title });
          arrayBuffer = res.buffer;
        } catch (firstErr) {
          if (targetUrl === pdfUrl) {
            console.warn('Direct PDF load failed, falling back to API proxy:', firstErr);
            const proxyUrl = `${API_BASE_URL}/publications-handbooks/proxy-pdf?url=${encodeURIComponent(
              pdfUrl
            )}`;
            const res = await fetchPdfWithMultiTierClientCache(proxyUrl, { title });
            arrayBuffer = res.buffer;
          } else {
            throw firstErr;
          }
        }

        const task = pdfjs.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
        });
        loadingTask = task;

        const doc = await task.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          // Restore user's last read page from localStorage if exists
          const savedPage = getReadingProgress(pdfUrl);
          const initialPage = savedPage >= 1 && savedPage <= doc.numPages ? savedPage : 1;
          setCurrentPage(initialPage);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error('Failed to load PDF document:', err);
          const msg =
            err instanceof Error
              ? err.message
              : 'Could not load PDF document. Please check URL or network.';
          setLoadError(msg);
          setLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
      if (loadingTask) {
        try {
          loadingTask.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfUrl, getPdfStreamUrl, API_BASE_URL, title]);

  // Render a specific page onto an HTML5 canvas using offscreen rendering to prevent any white flash
  const renderPageToCanvas = useCallback(
    async (
      pageNum: number,
      canvas: HTMLCanvasElement | null,
      customScaleMultiplier: number = 1.0
    ) => {
      if (!pdfDoc || !canvas || pageNum < 1 || pageNum > pdfDoc.numPages) return;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Container sizing - maximize screen real estate to fill modal box
        const stage = stageRef.current;
        const availableWidth = stage
          ? stage.clientWidth - 24
          : window.innerWidth - 48;
        const availableHeight = stage
          ? stage.clientHeight - 24
          : window.innerHeight - 120;

        const baseViewport = page.getViewport({ scale: 1.0 });

        // Calculate fit scale that spans almost the entire container
        const targetSingleWidth = isDoublePage ? (availableWidth - 16) / 2 : availableWidth - 10;
        const targetSingleHeight = availableHeight;

        const scaleX = targetSingleWidth / baseViewport.width;
        const scaleY = targetSingleHeight / baseViewport.height;
        const fitScale = Math.min(scaleX, scaleY) * zoomScale * customScaleMultiplier;

        const viewport = page.getViewport({ scale: fitScale });
        const dpr = window.devicePixelRatio || 1;

        const targetW = Math.floor(viewport.width * dpr);
        const targetH = Math.floor(viewport.height * dpr);

        // Render to offscreen canvas first to avoid blank canvas flash
        const offscreen = document.createElement('canvas');
        offscreen.width = targetW;
        offscreen.height = targetH;
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) return;

        offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderTask = page.render({
          canvasContext: offCtx,
          viewport: viewport,
        });

        activeRenderTasks.current.push(renderTask);
        await renderTask.promise;

        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
        }

        ctx.drawImage(offscreen, 0, 0);
      } catch (err: unknown) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'name' in err &&
          (err as { name: string }).name === 'RenderingCancelledException'
        ) {
          return;
        }
        console.warn(`Render page ${pageNum} error:`, err);
      }
    },
    [pdfDoc, isDoublePage, zoomScale]
  );

  // Compute pages to display based on layout mode
  const leftPageNum = isDoublePage
    ? currentPage === 1
      ? null
      : currentPage % 2 === 0
      ? currentPage
      : currentPage - 1
    : null;

  const rightPageNum = isDoublePage
    ? currentPage === 1
      ? 1
      : currentPage % 2 === 0
      ? currentPage + 1 <= totalPages
        ? currentPage + 1
        : null
      : currentPage
    : currentPage;

  // Render pages when current page, view mode, or zoom changes
  useEffect(() => {
    if (!pdfDoc) return;

    activeRenderTasks.current.forEach(task => {
      try {
        task.cancel();
      } catch {
        // Ignore
      }
    });
    activeRenderTasks.current = [];

    if (isDoublePage) {
      if (leftPageNum && leftCanvasRef.current) {
        renderPageToCanvas(leftPageNum, leftCanvasRef.current);
      } else if (leftCanvasRef.current) {
        const ctx = leftCanvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, leftCanvasRef.current.width, leftCanvasRef.current.height);
      }

      if (rightPageNum && rightCanvasRef.current) {
        renderPageToCanvas(rightPageNum, rightCanvasRef.current);
      } else if (rightCanvasRef.current) {
        const ctx = rightCanvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, rightCanvasRef.current.width, rightCanvasRef.current.height);
      }
    } else {
      if (singleCanvasRef.current) {
        renderPageToCanvas(currentPage, singleCanvasRef.current);
      }
    }
  }, [pdfDoc, currentPage, isDoublePage, zoomScale, leftPageNum, rightPageNum, renderPageToCanvas]);

  // Re-render when container size changes
  useEffect(() => {
    const handleResize = () => {
      if (!pdfDoc) return;
      if (isDoublePage) {
        if (leftPageNum && leftCanvasRef.current) renderPageToCanvas(leftPageNum, leftCanvasRef.current);
        if (rightPageNum && rightCanvasRef.current) renderPageToCanvas(rightPageNum, rightCanvasRef.current);
      } else if (singleCanvasRef.current) {
        renderPageToCanvas(currentPage, singleCanvasRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDoc, currentPage, isDoublePage, leftPageNum, rightPageNum, renderPageToCanvas]);

  // Disabled states for navigation buttons
  const isNextDisabled =
    totalPages === 0 ||
    isFlipping ||
    (isDoublePage
      ? currentPage <= 1
        ? totalPages < 2
        : (currentPage % 2 === 0 ? currentPage : currentPage - 1) + 1 >= totalPages
      : currentPage >= totalPages);

  const isPrevDisabled =
    totalPages === 0 ||
    isFlipping ||
    currentPage <= 1;

  // Realistic 3D Page Turn with instant page sync and zero missing pages
  const triggerFlipAnimation = (dir: 'next' | 'prev', targetPage: number) => {
    if (isFlipping) return;
    setIsFlipping(true);
    setFlipDirection(dir);

    if (soundEnabled) {
      playPageFlipSound();
    }

    // Set page immediately so canvas renders target page right away without skipping
    setCurrentPage(targetPage);

    setTimeout(() => {
      setIsFlipping(false);
      setFlipDirection(null);
    }, 420);
  };

  const handleNextPage = () => {
    if (isNextDisabled) return;

    if (isDoublePage) {
      if (currentPage <= 1) {
        if (totalPages >= 2) {
          triggerFlipAnimation('next', 2);
        }
      } else {
        const currentLeft = currentPage % 2 === 0 ? currentPage : currentPage - 1;
        const nextLeft = currentLeft + 2;
        if (nextLeft <= totalPages || currentLeft + 1 < totalPages) {
          triggerFlipAnimation('next', Math.min(nextLeft, totalPages));
        }
      }
    } else {
      if (currentPage < totalPages) {
        triggerFlipAnimation('next', currentPage + 1);
      }
    }
  };

  const handlePrevPage = () => {
    if (isPrevDisabled) return;

    if (isDoublePage) {
      const currentLeft = currentPage % 2 === 0 ? currentPage : currentPage - 1;
      if (currentLeft <= 2) {
        triggerFlipAnimation('prev', 1);
      } else {
        triggerFlipAnimation('prev', currentLeft - 2);
      }
    } else {
      if (currentPage > 1) {
        triggerFlipAnimation('prev', currentPage - 1);
      }
    }
  };

  const handleFirstPage = () => {
    if (isPrevDisabled) return;
    triggerFlipAnimation('prev', 1);
  };

  const handleLastPage = () => {
    if (isNextDisabled) return;
    if (isDoublePage) {
      const lastTarget =
        totalPages <= 1 ? 1 : totalPages % 2 === 0 ? totalPages : totalPages - 1;
      triggerFlipAnimation('next', lastTarget);
    } else {
      triggerFlipAnimation('next', totalPages);
    }
  };

  const handlePageJump = (page: number) => {
    if (isFlipping) return;
    const clamped = Math.max(1, Math.min(page, totalPages));
    const target = isDoublePage
      ? clamped <= 1
        ? 1
        : clamped % 2 === 0
        ? clamped
        : clamped - 1
      : clamped;

    if (target !== currentPage) {
      const dir = target > currentPage ? 'next' : 'prev';
      triggerFlipAnimation(dir, target);
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInputVal, 10);
    if (!isNaN(p)) {
      handlePageJump(p);
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'Home') {
        e.preventDefault();
        handleFirstPage();
      } else if (e.key === 'End') {
        e.preventDefault();
        handleLastPage();
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, isDoublePage, isFlipping]);

  // Touch Swipe gestures for mobile/tablet
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -50) {
      handleNextPage();
    } else if (deltaX > 50) {
      handlePrevPage();
    }
    touchStartX.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col w-full h-full bg-[#121110] text-stone-100 select-none overflow-hidden font-sans ${
        isFullscreen ? 'fixed inset-0 z-50' : 'rounded-2xl'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── TOP HEADER / TOOLBAR (Ultra-compact 42px) ── */}
      <header className="shrink-0 px-3 sm:px-5 py-2 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 flex items-center justify-between gap-3 z-30 shadow-sm">
        {/* Left: Book title & author */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <BookOpen size={15} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-stone-100 truncate tracking-wide">
              {title}
            </h2>
            <p className="text-[11px] text-stone-400 truncate">
              {author ? `By ${author} • ` : ''}
              {isDoublePage && leftPageNum && rightPageNum
                ? `පිටු ${leftPageNum}-${rightPageNum} / ${totalPages || 1}`
                : `පිටුව ${currentPage} / ${totalPages || 1}`}
            </p>
          </div>
        </div>

        {/* Right: Quick Reader Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              soundEnabled
                ? 'text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title={soundEnabled ? 'Paper Turn Sound: ON' : 'Paper Turn Sound: MUTED'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Spread View Toggle (Two-page vs Single-page) */}
          <button
            type="button"
            onClick={() => setIsDoublePage(!isDoublePage)}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isDoublePage
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                : 'border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
            title="Toggle Book Spread / Single Page View"
          >
            <BookOpen size={13} />
            <span>{isDoublePage ? 'Two-Page Book' : 'Single Page'}</span>
          </button>

          {/* Thumbnail Grid Toggle */}
          <button
            type="button"
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              showThumbnails
                ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300'
                : 'border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title="Page Thumbnails"
          >
            <LayoutGrid size={16} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Download Original PDF */}
          {allowDownload && pdfUrl && (
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-400 hover:bg-stone-800 transition-colors cursor-pointer"
              title="Download PDF"
            >
              <Download size={16} />
            </a>
          )}

          {/* Open external */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-400 hover:bg-stone-800 transition-colors cursor-pointer"
              title="Open in new window"
            >
              <ExternalLink size={16} />
            </a>
          )}

          {/* Close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-red-900/40 transition-colors cursor-pointer ml-1"
              title="Close Reader"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN READING AREA (FILLS ENTIRE MODAL BOX) ── */}
      <main
        ref={stageRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden p-1 sm:p-2 bg-gradient-to-b from-[#181715] via-[#141312] to-[#0f0e0d]"
      >
        {/* Loading Indicator */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-stone-900/80 backdrop-blur-sm gap-3">
            <div className="w-12 h-12 rounded-full border-3 border-emerald-500/30 border-t-emerald-500 animate-spin" />
            <p className="text-xs sm:text-sm text-stone-300 font-medium flex items-center gap-2">
              <Sparkles size={15} className="text-emerald-400" />
              <span>පොත සූදානම් වෙමින් පවතී (Loading Book)...</span>
            </p>
          </div>
        )}

        {/* Error Fallback */}
        {loadError && !showIframeFallback && (
          <div className="p-8 max-w-md text-center bg-stone-800/90 rounded-2xl border border-stone-700 space-y-4">
            <FileText size={42} className="mx-auto text-amber-500" />
            <h3 className="font-bold text-sm sm:text-base text-stone-100">
              PDF එක ප්‍රදර්ශනය කළ නොහැක
            </h3>
            <p className="text-xs text-stone-400">{loadError}</p>
            {pdfUrl && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIframeFallback(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <BookOpen size={14} />
                  <span>සාමාන්‍ය Reader එකෙන් බලන්න</span>
                </button>
                <a
                  href={pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-semibold transition-all shadow-md cursor-pointer"
                >
                  <Download size={14} />
                  <span>බාගත කරන්න</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Standard Iframe Fallback Viewer */}
        {showIframeFallback && pdfUrl && (
          <div className="w-full h-full flex flex-col p-2 bg-stone-900 rounded-xl overflow-hidden">
            <iframe src={`${pdfUrl}#toolbar=1`} title={title} className="w-full h-full border-0 rounded-xl bg-white" />
          </div>
        )}

        {/* Left Side Turn Page Hotspot Button */}
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={isPrevDisabled}
          className="absolute left-2 sm:left-3 z-30 w-10 sm:w-11 h-20 rounded-xl bg-black/45 hover:bg-emerald-600/95 text-white/70 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-xl disabled:opacity-0 disabled:pointer-events-none group transform -translate-y-1/2 top-1/2 hover:scale-105 active:scale-95"
          title="Previous Page (Arrow Left)"
        >
          <ChevronLeft size={26} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Right Side Turn Page Hotspot Button */}
        <button
          type="button"
          onClick={handleNextPage}
          disabled={isNextDisabled}
          className="absolute right-2 sm:right-3 z-30 w-10 sm:w-11 h-20 rounded-xl bg-black/45 hover:bg-emerald-600/95 text-white/70 hover:text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-xl disabled:opacity-0 disabled:pointer-events-none group transform -translate-y-1/2 top-1/2 hover:scale-105 active:scale-95"
          title="Next Page (Arrow Right)"
        >
          <ChevronRight size={26} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* ── THE 3D BOOK STAGE ── */}
        {!loading && !loadError && !showIframeFallback && (
          <div
            className="relative flex items-center justify-center max-w-full max-h-full"
            style={{
              perspective: '3500px',
            }}
          >
            {isDoublePage ? (
              /* ── TWO-PAGE SPREAD VIEW ── */
              <div
                className="relative flex items-center justify-center rounded-lg bg-stone-950 p-1 sm:p-1.5 border border-stone-800 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                style={{
                  boxShadow:
                    '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 20px rgba(0,0,0,0.6)',
                }}
              >
                {/* Book Spine Center Crease & Realistic Fold Shadow */}
                <div
                  className="absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 z-20 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.08) 35%, transparent 50%, rgba(0,0,0,0.08) 65%, rgba(0,0,0,0.45) 100%)',
                  }}
                />
                <div className="absolute inset-y-0 left-1/2 w-[1.5px] bg-black/60 z-21 pointer-events-none" />

                {/* ── LEFT STATIC PAGE ── */}
                <div
                  className={`relative bg-[#fcfbfa] text-stone-900 rounded-l-md overflow-hidden flex items-center justify-center transition-all ${
                    !leftPageNum ? 'bg-gradient-to-r from-stone-900 to-stone-850 border-r border-stone-800' : ''
                  } ${isFlipping && flipDirection === 'prev' ? 'animate-page-turn-prev' : ''}`}
                  style={{
                    boxShadow: 'inset -10px 0 20px -8px rgba(0,0,0,0.25), -8px 10px 24px rgba(0,0,0,0.4)',
                    transformOrigin: 'right center',
                  }}
                >
                  {leftPageNum ? (
                    <>
                      <canvas ref={leftCanvasRef} className="block max-w-full h-auto" />
                      <span className="absolute bottom-2 left-4 text-[11px] font-medium text-stone-500/80 select-none">
                        {leftPageNum}
                      </span>
                      <div className="absolute inset-y-0 right-0 w-8 pointer-events-none bg-gradient-to-l from-black/20 to-transparent" />

                      {/* Dynamic lighting sheen during flip */}
                      {isFlipping && flipDirection === 'prev' && (
                        <div
                          className="absolute inset-0 pointer-events-none animate-sheen-sweep z-20"
                          style={{
                            background:
                              'linear-gradient(-90deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.25) 45%, rgba(0,0,0,0.1) 85%, transparent 100%)',
                          }}
                        />
                      )}

                      {/* ── INTERACTIVE TOP-LEFT CORNER PEEL / DOG-EAR (ON HOVER) ── */}
                      {!isPrevDisabled && (
                        <div
                          onClick={handlePrevPage}
                          className="group/corner-tl absolute top-0 left-0 w-16 h-16 cursor-pointer z-25 overflow-hidden"
                          title="පෙර පිටුව පෙරලන්න (Click to turn back)"
                        >
                          <div className="absolute top-0 left-0 w-0 h-0 border-t-[32px] border-r-[32px] border-t-black/35 border-r-transparent transition-all duration-300 group-hover/corner-tl:border-t-[50px] group-hover/corner-tl:border-r-[50px]" />
                          <div
                            className="absolute top-0 left-0 w-8 h-8 group-hover/corner-tl:w-12 group-hover/corner-tl:h-12 bg-gradient-to-br from-stone-100 via-stone-200 to-stone-400 shadow-md transition-all duration-300 rounded-br-sm origin-top-left transform group-hover/corner-tl:rotate-3"
                            style={{
                              clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                              boxShadow: '3px 3px 6px rgba(0,0,0,0.3)',
                            }}
                          />
                        </div>
                      )}

                      {/* ── INTERACTIVE BOTTOM-LEFT CORNER PEEL ── */}
                      {!isPrevDisabled && (
                        <div
                          onClick={handlePrevPage}
                          className="group/corner-bl absolute bottom-0 left-0 w-16 h-16 cursor-pointer z-25 overflow-hidden"
                          title="පෙර පිටුව පෙරලන්න (Click to turn back)"
                        >
                          <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[32px] border-r-[32px] border-b-black/35 border-r-transparent transition-all duration-300 group-hover/corner-bl:border-b-[50px] group-hover/corner-bl:border-r-[50px]" />
                          <div
                            className="absolute bottom-0 left-0 w-8 h-8 group-hover/corner-bl:w-12 group-hover/corner-bl:h-12 bg-gradient-to-tr from-stone-100 via-stone-200 to-stone-400 shadow-md transition-all duration-300 rounded-tr-sm origin-bottom-left transform group-hover/corner-bl:-rotate-3"
                            style={{
                              clipPath: 'polygon(0 100%, 100% 100%, 0 0)',
                              boxShadow: '3px -3px 6px rgba(0,0,0,0.3)',
                            }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-[360px] sm:w-[500px] h-[520px] sm:h-[720px] flex flex-col items-center justify-center p-8 text-center text-stone-500">
                      <BookOpen size={44} className="text-stone-700 mb-3" />
                      <p className="text-sm font-semibold text-stone-300">මුල් කවරය (Front Cover)</p>
                      <p className="text-xs text-stone-500 mt-1">ඉදිරියට යාමට දකුණු පිටුවේ කොන පෙරලන්න</p>
                    </div>
                  )}
                </div>

                {/* ── RIGHT STATIC PAGE ── */}
                <div
                  className={`relative bg-[#fcfbfa] text-stone-900 rounded-r-md overflow-hidden flex items-center justify-center transition-all ${
                    !rightPageNum ? 'bg-gradient-to-l from-stone-900 to-stone-850' : ''
                  } ${isFlipping && flipDirection === 'next' ? 'animate-page-turn-next' : ''}`}
                  style={{
                    boxShadow: 'inset 10px 0 20px -8px rgba(0,0,0,0.25), 8px 10px 24px rgba(0,0,0,0.4)',
                    transformOrigin: 'left center',
                  }}
                >
                  {rightPageNum ? (
                    <>
                      <canvas ref={rightCanvasRef} className="block max-w-full h-auto" />
                      <span className="absolute bottom-2 right-4 text-[11px] font-medium text-stone-500/80 select-none">
                        {rightPageNum}
                      </span>
                      <div className="absolute inset-y-0 left-0 w-8 pointer-events-none bg-gradient-to-r from-black/20 to-transparent" />

                      {/* Dynamic lighting sheen during flip */}
                      {isFlipping && flipDirection === 'next' && (
                        <div
                          className="absolute inset-0 pointer-events-none animate-sheen-sweep z-20"
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.25) 45%, rgba(0,0,0,0.1) 85%, transparent 100%)',
                          }}
                        />
                      )}

                      {/* ── INTERACTIVE TOP-RIGHT CORNER PEEL / DOG-EAR (ON HOVER) ── */}
                      {!isNextDisabled && (
                        <div
                          onClick={handleNextPage}
                          className="group/corner-tr absolute top-0 right-0 w-16 h-16 cursor-pointer z-25 overflow-hidden"
                          title="පිටුව පෙරලන්න (Click corner to turn page)"
                        >
                          <div className="absolute top-0 right-0 w-0 h-0 border-t-[32px] border-l-[32px] border-t-black/35 border-l-transparent transition-all duration-300 group-hover/corner-tr:border-t-[50px] group-hover/corner-tr:border-l-[50px]" />
                          <div
                            className="absolute top-0 right-0 w-8 h-8 group-hover/corner-tr:w-12 group-hover/corner-tr:h-12 bg-gradient-to-bl from-stone-100 via-stone-200 to-stone-400 shadow-md transition-all duration-300 rounded-bl-sm origin-top-right transform group-hover/corner-tr:rotate-3"
                            style={{
                              clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                              boxShadow: '-3px 3px 6px rgba(0,0,0,0.3)',
                            }}
                          />
                        </div>
                      )}

                      {/* ── INTERACTIVE BOTTOM-RIGHT CORNER PEEL ── */}
                      {!isNextDisabled && (
                        <div
                          onClick={handleNextPage}
                          className="group/corner-br absolute bottom-0 right-0 w-16 h-16 cursor-pointer z-25 overflow-hidden"
                          title="පිටුව පෙරලන්න (Click corner to turn page)"
                        >
                          <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[32px] border-l-[32px] border-b-black/35 border-l-transparent transition-all duration-300 group-hover/corner-br:border-b-[50px] group-hover/corner-br:border-l-[50px]" />
                          <div
                            className="absolute bottom-0 right-0 w-8 h-8 group-hover/corner-br:w-12 group-hover/corner-br:h-12 bg-gradient-to-tl from-stone-100 via-stone-200 to-stone-400 shadow-md transition-all duration-300 rounded-tl-sm origin-bottom-right transform group-hover/corner-br:-rotate-3"
                            style={{
                              clipPath: 'polygon(100% 100%, 0 100%, 100% 0)',
                              boxShadow: '-3px -3px 6px rgba(0,0,0,0.3)',
                            }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-[360px] sm:w-[500px] h-[520px] sm:h-[720px] flex flex-col items-center justify-center p-8 text-center text-stone-500">
                      <BookOpen size={44} className="text-stone-700 mb-3" />
                      <p className="text-sm font-semibold text-stone-300">අවසාන පිටුව (End of Book)</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── SINGLE PAGE VIEW (CLEAN MOBILE / FOCUSED VIEW) ── */
              <div
                className={`relative bg-[#fcfbfa] text-stone-900 rounded-xl overflow-hidden shadow-2xl border border-stone-800 flex items-center justify-center transition-all ${
                  isFlipping
                    ? flipDirection === 'prev'
                      ? 'animate-single-page-prev'
                      : 'animate-single-page-next'
                    : ''
                }`}
                style={{
                  boxShadow: '0 20px 45px -10px rgba(0,0,0,0.7), inset 0 0 10px rgba(0,0,0,0.05)',
                  transformOrigin: flipDirection === 'prev' ? 'right center' : 'left center',
                }}
              >
                <canvas ref={singleCanvasRef} className="block max-w-full h-auto" />
                <span className="absolute bottom-2 right-4 text-[11px] font-medium text-stone-500/80 select-none bg-white/70 px-2.5 py-0.5 rounded-full shadow-xs">
                  {currentPage} / {totalPages}
                </span>

                {/* Single Page interactive corner peel */}
                {!isNextDisabled && (
                  <div
                    onClick={handleNextPage}
                    className="group/corner-single absolute top-0 right-0 w-16 h-16 cursor-pointer z-25 overflow-hidden"
                    title="පිටුව පෙරලන්න"
                  >
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[32px] border-l-[32px] border-t-black/35 border-l-transparent transition-all duration-300 group-hover/corner-single:border-t-[50px] group-hover/corner-single:border-l-[50px]" />
                    <div
                      className="absolute top-0 right-0 w-8 h-8 group-hover/corner-single:w-12 group-hover/corner-single:h-12 bg-gradient-to-bl from-stone-100 via-stone-200 to-stone-400 shadow-md transition-all duration-300 rounded-bl-sm origin-top-right transform group-hover/corner-single:rotate-3"
                      style={{
                        clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                        boxShadow: '-3px 3px 6px rgba(0,0,0,0.3)',
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── THUMBNAIL DRAWER / FILMSTRIP ── */}
        {showThumbnails && (
          <aside className="absolute right-0 top-0 bottom-0 w-64 bg-stone-900/95 backdrop-blur-xl border-l border-stone-800 z-40 p-3 flex flex-col shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <span className="text-xs font-bold text-stone-200">පිටු නාමාවලිය (Pages)</span>
              <button
                type="button"
                onClick={() => setShowThumbnails(false)}
                className="p-1 rounded-md text-stone-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                const isCurrent =
                  isDoublePage
                    ? (currentPage === 1 && pageNum === 1) ||
                      (currentPage > 1 && (pageNum === leftPageNum || pageNum === rightPageNum))
                    : pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      handlePageJump(pageNum);
                      setShowThumbnails(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-600 text-white font-bold shadow-md'
                        : 'bg-stone-800/60 hover:bg-stone-800 text-stone-300'
                    }`}
                  >
                    <span>පිටුව (Page) {pageNum}</span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase tracking-wider bg-black/25 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        )}
      </main>

      {/* ── BOTTOM CONTROL DOCK (Compact 42px) ── */}
      <footer className="shrink-0 px-3 sm:px-6 py-2 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 flex flex-wrap items-center justify-between gap-2 z-30 shadow-lg">
        {/* Left: First / Previous & Page Number */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleFirstPage}
            disabled={isPrevDisabled}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={isPrevDisabled}
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft size={15} />
            <span className="hidden sm:inline">පෙර පිටුව</span>
          </button>

          {/* Page input box */}
          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1.5 ml-1">
            <span className="text-xs text-stone-400">පිටුව</span>
            <input
              type="number"
              min={1}
              max={totalPages || 1}
              value={pageInputVal}
              onChange={e => setPageInputVal(e.target.value)}
              className="w-12 py-0.5 px-1.5 text-center bg-stone-800 border border-stone-700 rounded-lg text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs text-stone-400">
              {isDoublePage && leftPageNum && rightPageNum
                ? `(${leftPageNum}-${rightPageNum}) / ${totalPages || 1}`
                : `/ ${totalPages || 1}`}
            </span>
          </form>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={isNextDisabled}
            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer ml-1"
            title="Next Page"
          >
            <span className="hidden sm:inline">ඊළඟ පිටුව</span>
            <ChevronRight size={15} />
          </button>
          <button
            type="button"
            onClick={handleLastPage}
            disabled={isNextDisabled}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        {/* Center: Interactive Page Slider */}
        <div className="hidden lg:flex items-center gap-3 w-48 sm:w-64">
          <input
            type="range"
            min={1}
            max={totalPages || 1}
            value={currentPage}
            onChange={e => handlePageJump(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg appearance-none"
            title={`Slide to jump pages (Current: ${
              isDoublePage && leftPageNum && rightPageNum
                ? `${leftPageNum}-${rightPageNum}`
                : currentPage
            })`}
          />
        </div>

        {/* Right: Zoom Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setZoomScale(z => Math.max(0.7, +(z - 0.15).toFixed(2)))}
            disabled={zoomScale <= 0.75}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-[11px] font-mono text-stone-300 w-11 text-center select-none">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomScale(z => Math.min(2.0, +(z + 0.15).toFixed(2)))}
            disabled={zoomScale >= 2.0}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          {zoomScale !== 1.0 && (
            <button
              type="button"
              onClick={() => setZoomScale(1.0)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-400 hover:bg-stone-800 transition-colors cursor-pointer"
              title="Reset Zoom (100%)"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </footer>

      {/* ── REALISTIC 3D CORNER BEND & PAGE TURN KEYFRAMES ── */}
      <style>{`
        @keyframes pageTurnNext {
          0% {
            transform: perspective(2200px) rotateY(0deg) skewY(0deg);
            filter: brightness(0.96);
          }
          30% {
            /* Right page lifts and curls from right corner toward center */
            transform: perspective(2200px) rotateY(-24deg) skewY(-2deg) scaleY(0.985);
            box-shadow: -16px 14px 28px rgba(0,0,0,0.5), inset 25px 0 35px rgba(0,0,0,0.3);
            filter: brightness(1.04);
          }
          65% {
            /* Paper arch across spine with curved lighting */
            transform: perspective(2200px) rotateY(-10deg) skewY(-0.8deg) scaleY(0.995);
            box-shadow: -8px 8px 18px rgba(0,0,0,0.35), inset 12px 0 20px rgba(0,0,0,0.2);
            filter: brightness(1.02);
          }
          100% {
            transform: perspective(2200px) rotateY(0deg) skewY(0deg) scale(1);
            filter: brightness(1);
          }
        }

        @keyframes pageTurnPrev {
          0% {
            transform: perspective(2200px) rotateY(0deg) skewY(0deg);
            filter: brightness(0.96);
          }
          30% {
            /* Left page lifts and curls from left corner toward right */
            transform: perspective(2200px) rotateY(24deg) skewY(2deg) scaleY(0.985);
            box-shadow: 16px 14px 28px rgba(0,0,0,0.5), inset -25px 0 35px rgba(0,0,0,0.3);
            filter: brightness(1.04);
          }
          65% {
            transform: perspective(2200px) rotateY(10deg) skewY(0.8deg) scaleY(0.995);
            box-shadow: 8px 8px 18px rgba(0,0,0,0.35), inset -12px 0 20px rgba(0,0,0,0.2);
            filter: brightness(1.02);
          }
          100% {
            transform: perspective(2200px) rotateY(0deg) skewY(0deg) scale(1);
            filter: brightness(1);
          }
        }

        @keyframes sheenSweep {
          0% {
            opacity: 0;
            transform: scaleX(0.8);
          }
          35% {
            opacity: 0.85;
            transform: scaleX(1);
          }
          100% {
            opacity: 0;
            transform: scaleX(1.1);
          }
        }

        @keyframes singlePageNext {
          0% {
            transform: perspective(2000px) rotateY(0deg) scale(1);
          }
          35% {
            transform: perspective(2000px) rotateY(-20deg) skewY(-1.8deg) scale(0.98);
            box-shadow: -15px 12px 25px rgba(0,0,0,0.5);
          }
          100% {
            transform: perspective(2000px) rotateY(0deg) scale(1);
          }
        }

        @keyframes singlePagePrev {
          0% {
            transform: perspective(2000px) rotateY(0deg) scale(1);
          }
          35% {
            transform: perspective(2000px) rotateY(20deg) skewY(1.8deg) scale(0.98);
            box-shadow: 15px 12px 25px rgba(0,0,0,0.5);
          }
          100% {
            transform: perspective(2000px) rotateY(0deg) scale(1);
          }
        }

        .animate-page-turn-next {
          animation: pageTurnNext 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .animate-page-turn-prev {
          animation: pageTurnPrev 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .animate-sheen-sweep {
          animation: sheenSweep 0.42s ease-out forwards;
        }

        .animate-single-page-next {
          animation: singlePageNext 0.4s ease-out forwards;
        }

        .animate-single-page-prev {
          animation: singlePagePrev 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BookFlipPdfReader;
