import { useRef } from 'react';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

var useUpdateLayoutEffect = function useUpdateLayoutEffect(effect, deps) {
  var isMounting = useRef(true);
  useIsomorphicLayoutEffect(function () {
    if (isMounting.current) {
      isMounting.current = false;
      return;
    }

    effect(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useUpdateLayoutEffect;