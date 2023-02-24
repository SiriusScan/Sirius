import { useCallback, useEffect, useRef } from 'react';

function useIsMounted() {
  var isMounted = useRef(false);
  useEffect(function () {
    isMounted.current = true;
    return function () {
      isMounted.current = false;
    };
  }, []);
  return useCallback(function () {
    return isMounted.current;
  }, []);
}

export default useIsMounted;