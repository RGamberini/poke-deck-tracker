const fs = require('fs');
let out = {};
JSON.parse(fs.readFileSync('./tools/pokedex_in.json')).some(pokemon => {
    let poke_type = pokemon.type;
    if (poke_type.length < 2) poke_type = poke_type.concat("none");

    poke_type = poke_type.map(type => type.toLowerCase());
    out[pokemon.id] = poke_type;
    if (pokemon.id === 493) return true;
});

fs.writeFileSync('pokedex.json', JSON.stringify(out));

// let types = ['normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'];
// let effectiveness = ["4", "2", "1", ".5", ".25", "0"];
// let type_effectiveness = document.querySelector("#type_effectiveness");
// for (let i = 0; i < types.length; i++) {
//     let random_type = types[i];
//     let random_effectiveness = effectiveness[Math.floor(Math.random() * effectiveness.length)];
//     let new_type = document.createElement("div");
//     new_type.className = "stack";
//     new_type.setAttribute("style",
//         `background-image: url("type_effectiveness/${random_effectiveness}x.png"), url("type_effectiveness/${random_type}.png");`);
//     type_effectiveness.appendChild(new_type);
// }