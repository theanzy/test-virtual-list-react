import React, {
  Fragment,
  PureComponent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { getPokemons } from '../data/pokemon';

function merge(prev, incoming) {
  const startingIndex = incoming.reduce(
    (minIndex, poke) => Math.min(minIndex, poke.dexNumber),
    Infinity
  );
  if (prev.some((poke) => poke.dexNumber === startingIndex)) {
    return prev;
  }
  return [...prev, ...incoming];
}
const PageSize = 20;
export default function App() {
  const [pokemons, setPokemons] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const currentPageRef = useRef(1);
  const [nextPageLoading, setNextPageLoading] = useState(false);
  const itemCount = hasMore ? pokemons.length + 1 : pokemons.length;
  const isItemLoaded = (index) => !hasMore || index < pokemons.length;
  const RowFor = (pokemons) => (props) => {
    const { index, style } = props;
    const pokemon = pokemons[index];
    return isItemLoaded(index) ? (
      <div style={{ ...style, display: 'flex' }}>
        <div style={{ flexBasis: '10rem' }}>{pokemon.dexNumber}</div>
        <div>{pokemon.name}</div>
      </div>
    ) : (
      <div>loading</div>
    );
  };
  const loadMoreItems = async (startIndex, stopIndex) => {
    if (!nextPageLoading) {
      currentPageRef.current += 1;
      const startOffset = (currentPageRef.current - 1) * PageSize;
      const res = await getPokemons(currentPageRef.current, PageSize);
      const pokemonToSave = res.results.map((poke, i) => {
        return { ...poke, dexNumber: startOffset + i + 1 };
      });
      setPokemons((prev) => merge(prev, pokemonToSave));
    }
  };
  useEffect(() => {
    if (!hasMore) {
      return;
    }
    setNextPageLoading(true);
    getPokemons(currentPageRef.current, PageSize).then((result) => {
      console.log(result);
      const pokemons = result.results;
      if (pokemons.length === 0) {
        setHasMore(false);
        return;
      }
      const startOffset = (currentPageRef.current - 1) * PageSize;
      const pokemonToSave = pokemons.map((poke, i) => {
        return { ...poke, dexNumber: startOffset + i + 1 };
      });
      setPokemons(pokemonToSave);
      setNextPageLoading(false);
    });
  }, []);
  if (pokemons.length === 0) {
    return 'loading';
  }
  return (
    <div style={{ height: 700 }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '10%' }}>dexNumber</div>
        <div>Name</div>
      </div>
      <AutoSizer>
        {({ height, width }) => (
          <>
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={itemCount}
              loadMoreItems={loadMoreItems}
            >
              {({ onItemsRendered, ref }) => (
                <List
                  height={height}
                  itemCount={itemCount}
                  itemSize={30}
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                  width={width}
                  style={{ background: 'red', color: 'white' }}
                >
                  {RowFor(pokemons)}
                </List>
              )}
            </InfiniteLoader>
          </>
        )}
      </AutoSizer>
    </div>
  );
}
