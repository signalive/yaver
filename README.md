# ya>er

Yaver is a micro store implementation for React Function Components.

## Example
```javascript
import {createStore, useStore} from '../lib/yaver';

createStore('main', {foo: 'bar', counter: 0, counter2: 0});

const SubPage = React.memo(() => {
  console.log('SubPage Render');

  // const [store, setStore] = useStore('main');
  const [store, setStore] = useStore('main', (oldStore, newStore) => {
    return oldStore.counter !== newStore.counter;
  });

  const updateStore = useCallback(() => {
    setStore({counter: store.counter + 1})
  });

  return (
    <div style={{background: 'black', color: 'white'}}>
      SubPage {store.counter} - {store.counter2}
      <div onClick={updateStore}></div>
    </div>
  )
})


const HomePage = () => {
  console.log('HomePage Render');

  const [store, setStore] = useStore('main');

  const incrementCounter = useCallback(() => {
    setStore({counter: store.counter + 1})
  });

  const incrementCounter2 = useCallback(() => {
    setStore({counter2: store.counter2 + 1})
  });

  return (
    <div>
      <div>Counter: {store.counter} - {store.counter2}</div>
      <div onClick={incrementCounter}>counter++</div>
      <div onClick={incrementCounter2}>counter2++</div>
      <SubPage/>
    </div>
  );
};
```

