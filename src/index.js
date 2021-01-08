import clone from 'lodash/clone';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import isFunction from 'lodash/isFunction';
import assign from 'lodash/assign';
import {useState, useEffect} from 'react';
import EventEmitterExtra from 'event-emitter-extra';
import {isEquivalent} from './utils';

EventEmitterExtra.defaultMaxListeners = Infinity;

class Stores extends EventEmitterExtra {
  storeBank = {};

  get(name) {
    return this.storeBank[name];
  }

  set(name, nextStore) {
    this.storeBank[name] = nextStore;
  }

  update(name, nextStore) {
    let store = this.get(name);

    if (!store) {
      this.set(name, {});
      store = this.get(name);
    }

    const oldStore = clone(store);

    assign(store, nextStore);

    this.emit(`update_${name}`, {
      newStore: store,
      oldStore: oldStore
    });
  }
}

export const stores = new Stores();

/**
 * Creates a store with ethe given name and initials
 *
 * Example:
 * createStore('store-name', {foo: 'bar'})
 *
 * @param {String} to Store name
 * @param {Object} initial Initial data
 */
export function createStore(to, initial = {}) {
  if (!isUndefined(stores.get(to)))
    throw new Error(`Store ${to} was already created`);

  stores.update(to, initial);
}

/**
 * Hook for binding a store to a component
 *
 * Example:
 * const [store, setStore] = useStore('store-name')
 *
 * @param {*} to Store name
 * @param {Function} condition Effect condition control (oldStore, newStore) => Boolean
 */
export function useStore(to, condition) {
  const store = stores.get(to);

  if (isUndefined(store))
    throw new Error(`Store ${to} is not defined`);

  /* This store only holds a random value just to trigger re-rendering on-demand.
    Store always comes from stores */
  const [shit, setState] = useState(Date.now()); //eslint-disable-line
  const set = nextStore => stores.update(to, nextStore);

  useEffect(() => {
    const updateListener = ({oldStore, newStore}) => {
      if (!isFunction(condition)) {
        /* If no condition isprovided immediately trigger a re-render */
        setState(Date.now());
      } else {
        /* Trigger a re-render only if condition returns true */
        if (condition(oldStore, newStore))
          setState(Date.now());
      }
    };

    stores.on(`update_${to}`, updateListener);
    return () => stores.removeListener(`update_${to}`, updateListener);
  });

  return [store, set];
}

/**
 * A syntactic sugar for the condition function.
 *
 * Example:
 * useStore('store-name', whenChanged(['property1', 'property2']))
 *
 * @param {string[]} fields
 */
export function whenChanged(fields = []) {
  return (oldStore, newStore) => {
    return fields.some(field => {
      return !isEquivalent(get(newStore, field), get(oldStore, field));
    });
  };
};
