"use client";

/** Previous / next buttons that scroll a card track by one card. */
export function ScrollerNav({ trackId, prev, next }: { trackId: string; prev: string; next: string }) {
  const scroll = (dir: number) => {
    const track = document.getElementById(trackId);
    if (!track) return;
    const card = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    track.scrollBy({ left: step * dir, behavior: "smooth" });
  };
  return (
    <div className="scroller__nav">
      <button type="button" className="link-u" aria-controls={trackId} onClick={() => scroll(-1)}>
        {prev}
      </button>
      <button type="button" className="link-u" aria-controls={trackId} onClick={() => scroll(1)}>
        {next}
      </button>
    </div>
  );
}
