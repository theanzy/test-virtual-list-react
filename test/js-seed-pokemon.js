const axios = require('axios');
const fs = require('fs');
async function getPokemons() {
  const res = await axios.get(
    `https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`
  );
  const allResp = await Promise.all(
    res.data.results.map((poke) => axios.get(poke.url))
  );
  const pokemons = allResp.map((allResp) => allResp.data);
  fs.writeFile('./pokemon.json', JSON.stringify(pokemons), (err) => {
    if (err) {
      console.error(err);
    }
  });
}

getPokemons();
