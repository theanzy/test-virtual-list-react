export const getPokemons = async (currentPage, pageSize) => {
  return await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${
      (currentPage - 1) * pageSize
    }`
  ).then((res) => res.json());
};
