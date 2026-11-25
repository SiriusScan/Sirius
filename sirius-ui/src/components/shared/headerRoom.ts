/**
 * headerRoom.ts — lets the app Header know whether the page's own top bar
 * keeps room for the scan pill beside the avatar.
 *
 * PageHeader reserves that room (it reads --sirius-header-reserve), so it
 * registers itself here. Hand-built page headers only keep the avatar's
 * width (pr-14) clear; on those pages, and in the workspace frame, the Header
 * shows the scan indicator as a badge on the avatar instead of the pill, so
 * it never covers a page's own actions.
 */

import { useEffect, useSyncExternalStore } from "react";

/**
 * CSS variable on <html>: the width a page's top bar keeps clear at its right
 * for the account cluster (avatar, plus the scan pill while it shows).
 * Header publishes it; PageHeader reads it. 3.5rem (pr-14) is the avatar alone.
 */
export const HEADER_RESERVE_VAR = "--sirius-header-reserve";

let registered = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const hasRoom = () => registered > 0;
const hasRoomOnServer = () => false;

/** Called by PageHeader: this page keeps room for the pill. */
export function useReserveHeaderRoom() {
  useEffect(() => {
    registered += 1;
    emit();
    return () => {
      registered -= 1;
      emit();
    };
  }, []);
}

/** True while a mounted page header keeps room for the pill. */
export function useHeaderHasRoom(): boolean {
  return useSyncExternalStore(subscribe, hasRoom, hasRoomOnServer);
}
