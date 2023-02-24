import { useRef, useEffect } from 'react';

function useRegisterModel(name, pushFieldRule, removeFieldRule, rule) {
  var refRule = useRef(rule);
  refRule.current = rule;
  useEffect(function () {
    pushFieldRule(name, refRule);
    return function () {
      removeFieldRule(name);
    };
  }, [name, pushFieldRule, removeFieldRule]);
}

export default useRegisterModel;