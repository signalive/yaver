import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import merge from 'lodash/merge';
import {useState, useEffect} from 'react';
import EventEmitterExtra from 'event-emitter-extra';

class Stores extends EventEmitterExtra {
  state = {};

  get(name) {
    return this.state[name];
  }

  update(name, nextState) {
    if (isEqual(this.get(name), nextState)) return;
    merge(this.state, {[name]: nextState});
    this.emit(`update_${name}`, this.state);
  }
}

export const stores = new Stores();

export function useStore(to, initial = {}) {
  /* Handle initial state */
  if (isUndefined(stores.get(to))) stores.update(to, initial);

  /* This state only stores a random value just to trigger re-rendering on-demand.
    State always comes from stores */
  const [shit, setState] = useState(Date.now()); //eslint-disable-line
  const set = nextState => stores.update(to, nextState);

  useEffect(() => {
    const updateListener = () => setState(Date.now()); // Trigger a re-render

    stores.on(`update_${to}`, updateListener);
    return () => stores.removeListener(`update_${to}`, updateListener);
  });

  return [stores.get(to), set];
}
