import React from 'react';
export default function useFocus<E extends HTMLElement>(elementRef: React.RefObject<E>): {
    grab: () => void;
    release: (options?: FocusOptions) => void;
};
