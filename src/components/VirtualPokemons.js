import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getPokemons } from '../data/pokemon';
import VirtualScroller from './VirtualScrolling/VirtualScroller';

const rowTemplate = (item) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '1.5rem',
      }}
      key={item.name}
    >
      <div>{item.dexNumber}</div>
      <div>{item.name}</div>
      <div>{item.url}</div>
    </div>
  );
};
const PageSize = 20;

function merge(prev, incoming) {
  const startingIndex = incoming.reduce(
    (minIndex, poke) => Math.min(minIndex, poke.dexNumber),
    Infinity
  );
  if (prev.some((poke) => poke.dexNumber === startingIndex)) {
    return prev;
  }
  console.log('merge');
  return [...prev, ...incoming];
}

export default function VirtualPokemons() {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pokemons, setPokemons] = useState([]);

  const SETTINGS = useMemo(
    () => ({
      minIndex: 0,
      maxIndex: pokemons.length,
      startIndex: 0,
      itemHeight: 20,
      amount: 10,
      tolerance: 2,
    }),
    [pokemons]
  );

  console.log(pokemons);

  const getData = (start, end) => {
    return pokemons.slice(start, end);
  };

  useEffect(() => {
    if (!hasMore) {
      return;
    }
    getPokemons(currentPage, PageSize).then((result) => {
      console.log(result);
      const pokemons = result.results;
      if (pokemons.length === 0) {
        setHasMore(false);
        return;
      }
      const startOffset = (currentPage - 1) * PageSize;

      const pokemonToSave = pokemons.map((poke, i) => {
        return { ...poke, dexNumber: startOffset + i + 1 };
      });
      console.log('to merge');
      setPokemons((prev) => merge(prev, pokemonToSave));
    });
  }, [hasMore, currentPage]);
  const handleScrollEnd = () => {
    console.log('handheScorll end');
    setCurrentPage((prev) => prev + 1);
  };
  return (
    <div>
      {pokemons.length > 0 && (
        <VirtualScroller
          settings={SETTINGS}
          get={getData}
          rowTemplate={rowTemplate}
          onScrollEnd={handleScrollEnd}
        />
      )}
    </div>
  );
}
