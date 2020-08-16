// In renderer process (web page).
const { ipcRenderer, remote } = require('electron');
const drawer = document.querySelector("#main");
const poke_types = [
    document.querySelector("#poke_type_1"),
    document.querySelector("#poke_type_2")
];
const poke_sprite = document.querySelector("#poke_sprite");
const type_effectiveness = document.querySelector("#type_effectiveness");
let hide_direction;
ipcRenderer.on("config", ((event, new_hide_direction) => {
    console.log(new_hide_direction);
    hide_direction = new_hide_direction;
}));

function addType(type, effectiveness) {
    let new_type = document.createElement("div");
    new_type.className = "stack";
    new_type.setAttribute("style",
        `background-image: url("type_effectiveness/${effectiveness}x.png"), url("type_effectiveness/${type}.png");`);
    type_effectiveness.appendChild(new_type);
}

function clear() {
    poke_sprite.setAttribute("src", "");

    poke_types[0].className = "hidden";
    poke_types[1].className = "hidden";

    while (type_effectiveness.firstChild) type_effectiveness.firstChild.remove();
}

let current_pokemon = 0;
ipcRenderer.on("enemy_pokemon", ((event, pokemon) => {
    console.log("Pokemon IN");
    let national_dex = pokemon.national_dex;
    if (national_dex === 0) {
        clear();
        return
    }
    if (national_dex === current_pokemon) return;
    drawer.className = hide_direction;
    setTimeout(() => {
        current_pokemon = national_dex;
        poke_sprite.setAttribute("src", `pokedex_sprites/${national_dex}.png`);

        let types = pokemon.types;
        poke_types[0].className = types[0];
        if (types[1] === "none") poke_types[1].className = "hidden";
        else poke_types[1].className = types[1];

        let effectivenesses = pokemon.effectiveness;
        while (type_effectiveness.firstChild) type_effectiveness.firstChild.remove();
        effectivenesses.forEach(([type, effectiveness]) => addType(type, effectiveness));
        type_effectiveness.setAttribute("style", `width: ${Math.ceil(effectivenesses.length / 2) * 246}px`);

        drawer.className = "center"
    }, 600);
}));

