import { useEffect, useMemo, useState } from 'react';
import Pagination from './Pagination';
import { getPokemons } from '../data/pokemon';
let PageSize = 20;
function integrityCheck(pokemons) {
  for (let i = 1; i < pokemons.length; i++) {
    if (pokemons[i - 1].dexNumber > pokemons[i].dexNumber) {
      console.log('integrity error');
      break;
    }
  }
}
function merge(prev, incoming) {
  const startingIndex = incoming.reduce(
    (minIndex, poke) => Math.min(minIndex, poke.dexNumber),
    Infinity
  );
  console.log('merge');
  if (prev.some((poke) => poke.dexNumber === startingIndex)) {
    return prev;
  }
  // there is a larger dex number
  // ...smaller, ...incoming, ...larger...
  // - get index of the larger dex number, i
  // - smaller to i, ... incoming, ... larger
  const largerDexItem = prev.find((poke) => poke.dexNumber > startingIndex);
  if (largerDexItem) {
    const rightIndex = prev
      .map((poke) => poke.dexNumber)
      .indexOf(largerDexItem.dexNumber);
    const left = prev.slice(0, rightIndex);
    const right = prev.slice(rightIndex);
    return [...left, ...incoming, ...right];
  }
  return [...prev, ...incoming];
}
export default function PokemonPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItem, setTotalItem] = useState(null);
  const [pokemons, setPokemons] = useState([]);
  useEffect(() => {
    const newStartingDexNumber = (currentPage - 1) * PageSize + 1;
    // console.log(pokemons);
    console.log(newStartingDexNumber);
    if (pokemons.some((poke) => poke.dexNumber === newStartingDexNumber)) {
      return;
    }
    getPokemons(currentPage, PageSize).then((result) => {
      setTotalItem(result.count);
      const pokemons = result.results;
      const startOffset = (currentPage - 1) * PageSize;
      const pokemonToSave = pokemons.map((poke, i) => {
        return { ...poke, dexNumber: startOffset + i + 1 };
      });
      setPokemons((prev) => {
        const merged = merge(prev, pokemonToSave);
        return merged;
      });
    });
  }, [currentPage]);
  const localPokemons = useMemo(() => {
    integrityCheck(pokemons);
    const startingDexNumber = (currentPage - 1) * PageSize + 1;
    const startingIndex = pokemons
      .map((poke) => poke.dexNumber)
      .indexOf(startingDexNumber);
    // is last page

    const lastIndex =
      startingIndex + PageSize > pokemons.length
        ? pokemons.length
        : startingIndex + PageSize;
    return pokemons.slice(startingIndex, lastIndex);
  }, [pokemons, currentPage]);
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>NAME</th>
            <th>url</th>
          </tr>
        </thead>
        <tbody>
          {localPokemons &&
            localPokemons.map((item) => {
              return (
                <tr key={item.name}>
                  <td>{item.dexNumber}</td>
                  <td>{item.name}</td>
                  <td>{item.url}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
      {totalItem && (
        <Pagination
          className='pagination-bar'
          currentPage={currentPage}
          totalCount={totalItem}
          pageSize={PageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </>
  );
}
