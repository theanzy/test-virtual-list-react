import React, { useEffect, useRef, useState } from 'react';
import { getPokemons } from '../data/pokemon';
import { Column, Table } from 'react-virtualized';

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
export default function ThirdPartyTable() {
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
  console.log(pokemons);
  return (
    <div style={{ height: 700 }}>
      <Table
        width={300}
        height={300}
        headerHeight={20}
        rowHeight={30}
        rowCount={itemCount}
        rowGetter={({ index }) =>
          pokemons[index] != null ? pokemons[index] : ''
        }
      >
        <Column label='Dex Number' dataKey='dexNumber' width={100} />
        <Column width={200} label='Name' dataKey='name' />
        <Column label='url' dataKey='url' />
      </Table>
    </div>
  );
}
