import { SchemaModel } from 'schema-typed';
import { useRef, useCallback } from 'react';

function useSchemaModel(formModel) {
  var subRulesRef = useRef([]);
  var pushFieldRule = useCallback(function (name, fieldRule) {
    subRulesRef.current.push({
      name: name,
      fieldRule: fieldRule
    });
  }, []);
  var removeFieldRule = useCallback(function (name) {
    var index = subRulesRef.current.findIndex(function (v) {
      return v.name === name;
    });
    subRulesRef.current.splice(index, 1);
  }, []);
  var getCombinedModel = useCallback(function () {
    var realSubRules = subRulesRef.current.filter(function (v) {
      return Boolean(v.fieldRule.current);
    });
    return SchemaModel.combine(formModel, SchemaModel(realSubRules.map(function (_ref) {
      var _ref2;

      var name = _ref.name,
          fieldRule = _ref.fieldRule;
      return _ref2 = {}, _ref2[name] = fieldRule.current, _ref2;
    }).reduce(function (a, b) {
      return Object.assign(a, b);
    }, {})));
  }, [formModel]);
  return {
    getCombinedModel: getCombinedModel,
    pushFieldRule: pushFieldRule,
    removeFieldRule: removeFieldRule
  };
}

export default useSchemaModel;