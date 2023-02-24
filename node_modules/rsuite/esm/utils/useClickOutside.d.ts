export interface UseClickOutsideOptions {
    enabled?: boolean;
    isOutside: (event: MouseEvent) => boolean;
    handle: (event: MouseEvent) => void;
}
export default function useClickOutside({ enabled, isOutside, handle }: UseClickOutsideOptions): void;
