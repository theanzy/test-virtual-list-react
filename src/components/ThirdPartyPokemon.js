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
  console.log(startingIndex);
  if (prev.some((poke) => poke.dexNumber === startingIndex)) {
    return prev;
  }
  return [...prev, ...incoming];
}
const PageSize = 20;
export default function PokemonListWindow() {
  const [pokemons, setPokemons] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const currentPageRef = useRef(1);
  const [nextPageLoading, setNextPageLoading] = useState(false);
  const itemCount = hasMore ? pokemons.length + 1 : pokemons.length;
  const isItemLoaded = (index) => !hasMore || index < pokemons.length;
  const RowFor = (pokemons, columnExtensions) => (props) => {
    const { index, style } = props;
    const pokemon = pokemons[index];
    return isItemLoaded(index) ? (
      <div
        style={{
          ...style,
          display: 'flex',
          borderBottom: '1px solid #eee',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        {columnExtensions.map((extension) => (
          <div key={extension.column} style={{ width: extension.width }}>
            {pokemon[extension.column]}
          </div>
        ))}
      </div>
    ) : (
      <div>loading</div>
    );
  };
  const loadMoreItems = async (startIndex, stopIndex) => {
    console.log('load more', startIndex, stopIndex, currentPageRef.current);
    if (!nextPageLoading) {
      currentPageRef.current += 1;
      const startOffset = (currentPageRef.current - 1) * PageSize;
      setNextPageLoading(true);
      const res = await getPokemons(currentPageRef.current, PageSize);
      setNextPageLoading(false);
      if (res.results.length === 0) {
        setHasMore(false);
        return;
      }
      const pokemonToSave = res.results.map((poke, i) => {
        return { ...poke, dexNumber: startOffset + i + 1 };
      });
      setPokemons((prev) => merge(prev, pokemonToSave));
    }
  };
  useEffect(() => {
    if (pokemons.length > 0) {
      return;
    }
    setNextPageLoading(true);
    getPokemons(currentPageRef.current, PageSize).then((result) => {
      console.log(result);
      const pokemons = result.results;
      const startOffset = (currentPageRef.current - 1) * PageSize;
      const pokemonToSave = pokemons.map((poke, i) => {
        return { ...poke, dexNumber: startOffset + i + 1 };
      });
      setPokemons((prev) => merge(prev, pokemonToSave));
      setNextPageLoading(false);
    });
  }, []);
  if (pokemons.length === 0) {
    return 'loading';
  }
  const columnExtensions = [
    {
      column: 'dexNumber',
      label: 'Dex Number',
      width: '5%',
    },
    {
      column: 'name',
      label: 'Name',
      width: '10%',
    },
    {
      column: 'url',
      label: 'Link',
      width: '75%',
    },
  ];
  return (
    <div style={{ height: 700 }}>
      <div style={{ display: 'flex' }}>
        {columnExtensions.map((col) => (
          <div key={col.column} style={{ width: col.width }}>
            {col.label}
          </div>
        ))}
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
                >
                  {RowFor(pokemons, columnExtensions)}
                </List>
              )}
            </InfiniteLoader>
          </>
        )}
      </AutoSizer>
    </div>
  );
}
