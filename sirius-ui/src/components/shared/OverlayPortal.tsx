/**
 * OverlayPortal — renders a hand-built drawer, sheet or modal into <body>.
 *
 * Page content sits in Layout's `relative z-20` stacking context, so a
 * `fixed z-overlay` panel rendered inside a page can never rise above the
 * header (z-header): the account avatar covers its top-right corner and
 * close button. Portaled, the panel joins the root context and z-overlay
 * puts it above the header. Prefer the lib/ui Dialog, which already portals.
 *
 *   <OverlayPortal>
 *     <div className="fixed inset-0 z-overlay bg-black/60" onClick={close} />
 *     <aside className="fixed inset-y-0 right-0 z-overlay w-full max-w-lg ...">...</aside>
 *   </OverlayPortal>
 */

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function OverlayPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

export default OverlayPortal;
