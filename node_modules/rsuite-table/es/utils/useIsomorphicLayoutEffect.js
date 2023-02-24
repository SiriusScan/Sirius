import { useEffect, useLayoutEffect } from 'react';
import canUseDOM from 'dom-lib/canUseDOM';
var useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;
export default useIsomorphicLayoutEffect;