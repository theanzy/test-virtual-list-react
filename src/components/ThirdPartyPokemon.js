import React, { useEffect, useState } from 'react';
import { getPokemons } from '../data/pokemon';
import Spinner from './Roller/Spinner';
import Skeleton from './Skeleton/Skeleton';
import InfinityScroller from './InfinityScroller/InfinityScroller';
function merge(prev, incoming) {
  const startingIndex = incoming.reduce(
    (minIndex, poke) => Math.min(minIndex, poke.dexNumber),
    Infinity
  );
  console.log(prev, incoming);
  if (
    prev.some((prevPoke) =>
      incoming.some((poke) => poke.name === prevPoke.name)
    )
  ) {
    return prev;
  }
  if (prev.some((poke) => poke.dexNumber === startingIndex)) {
    return prev;
  }
  return [...prev, ...incoming];
}
const PageSize = 20;

export default function PokemonListWindow() {
  const [pokemons, setPokemons] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
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
          <div
            key={extension.column}
            style={{
              width: extension.width,
              display: 'flex',
              justifyContent: extension.align ?? 'flex-start',
            }}
          >
            {pokemon[extension.column]}
          </div>
        ))}
        <div style={{ padding: '5px' }}></div>
      </div>
    ) : (
      <div
        style={{
          ...style,
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
      >
        <Skeleton height={12} />
        <Skeleton height={12} />
      </div>
    );
  };
  const loadMoreItems = async (startIndex, stopIndex) => {
    if (!nextPageLoading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  useEffect(() => {
    setNextPageLoading(true);
    getPokemons(currentPage, PageSize).then((result) => {
      if (result.results.length === 0) {
        setHasMore(false);
        return;
      }
      const pokemons = result.results;
      const startOffset = (currentPage - 1) * PageSize;
      const pokemonToSave = pokemons.map((poke, i) => {
        return { ...poke, dexNumber: startOffset + i + 1 };
      });
      setPokemons((prev) => merge(prev, pokemonToSave));
      setNextPageLoading(false);
    });
  }, [currentPage]);

  const columnExtensions = [
    {
      column: 'dexNumber',
      label: 'Dex Number',
      width: '10%',
    },
    {
      column: 'name',
      label: 'Name',
      width: '10%',
    },
    {
      column: 'url',
      label: 'Link',
      width: '85%',
      align: 'flex-end',
    },
  ];
  return (
    <div
      style={{
        height: 700,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontWeight: 'bold',
        }}
      >
        {columnExtensions.map((extension) => (
          <div
            key={extension.column}
            style={{
              width: extension.width,
              display: 'flex',
              justifyContent: extension.align ?? 'flex-start',
            }}
          >
            {extension.label}
          </div>
        ))}
        <div style={{ padding: '10px' }}></div>
      </div>
      {pokemons.length === 0 && (
        <div
          style={{
            display: 'flex',
            paddingTop: '5px',
            paddingBottom: '5px',
            justifyContent: 'center',
          }}
        >
          <Spinner />
        </div>
      )}
      <InfinityScroller
        itemCount={itemCount}
        itemSize={50}
        isItemLoaded={isItemLoaded}
        rowTemplate={RowFor(pokemons, columnExtensions)}
        loadMoreItems={loadMoreItems}
      />
    </div>
  );
}
