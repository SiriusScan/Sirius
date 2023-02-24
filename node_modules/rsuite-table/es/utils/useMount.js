import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

var useMount = function useMount(effect) {
  useIsomorphicLayoutEffect(effect, []);
};

export default useMount;