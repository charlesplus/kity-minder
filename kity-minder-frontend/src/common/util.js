export const util = {
  loadComponents(app, components) {
    components.forEach(comp => {
      const compConfig = {
        controller: comp
      };
      if (comp.templateUrl) {
        compConfig.templateUrl = comp.templateUrl;
      }
      if (comp.template) {
        compConfig.template = comp.template;
      }
      if (comp.$bindings) {
        compConfig.bindings = comp.$bindings;
      }
      if (comp.transclude) {
        compConfig.transclude = true;
      }
      app.component(comp.selector, compConfig);
    });
  },
  /**
   * 监控属性变更
   * @param {*} scope
   * @param {*} property
   * @param {*} changeHandler
   */
  watch(scope, property, changeHandler) {
    let value = scope[property];
    const propertyDescriptor = Object.getOwnPropertyDescriptor(scope, property);
    const getter = propertyDescriptor && propertyDescriptor.get;
    const setter = propertyDescriptor && propertyDescriptor.set;
    Object.defineProperty(scope, property, {
      configurable: true,
      enumerable: true,
      get() {
        return getter ? getter.call(scope) : value;
      },
      set(newVal) {
        const oldVal = getter ? getter.call(scope) : value;
        // 值一样，直接return
        if (newVal === oldVal || (newVal !== newVal && oldVal !== oldVal)) {
          return;
        }
        // 把值设置回去
        if (setter) {
          setter.call(obj, newVal);
        } else {
          value = newVal;
        }
        changeHandler.call(null, newVal, oldVal);
      }
    });
  },
  getDomain() {
    let origin = window.location.origin
    let origins = origin.split(':')
    let lastSplit = origins[origins.length - 1]
    if (!Number.isNaN(lastSplit)) {
      // -1是还要去掉最后的:
      origin = origin.substring(0, origin.length - lastSplit.length - 1)
    }
    return origin
  },
};
