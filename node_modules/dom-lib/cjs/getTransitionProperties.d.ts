declare function getTransitionProperties(): {
    end?: undefined;
    backfaceVisibility?: undefined;
    transform?: undefined;
    property?: undefined;
    timing?: undefined;
    delay?: undefined;
    duration?: undefined;
} | {
    end: any;
    backfaceVisibility: string;
    transform: string;
    property: string;
    timing: string;
    delay: string;
    duration: string;
};
export default getTransitionProperties;
