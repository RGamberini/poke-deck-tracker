// In renderer process (web page).
const { ipcRenderer, remote } = require('electron');

class Drawer {
    constructor(main, hide_direction) {
        this.main = document.querySelector(main);
        this.poke_types = Array.from(this.main.querySelectorAll(".poke_type"));
        this.poke_sprite = this.main.querySelector(".poke_sprite");
        this.type_effectiveness = this.main.querySelector(".type_effectiveness");
        this.hide_direction = hide_direction;
        this.current_pokemon = 0;
    }

    overSprite(clientX, clientY) {
        return (
            clientX > this.poke_sprite.x &&
            clientX < this.poke_sprite.x + this.poke_sprite.width &&
            clientY > this.poke_sprite.y &&
            clientY < this.poke_sprite.y + this.poke_sprite.height
        );
    }

    addType(type, effectiveness) {
        let new_type = document.createElement("div");
        new_type.className = "stack";
        new_type.setAttribute("style",
            `background-image: url("type_effectiveness/${effectiveness}x.png"), url("type_effectiveness/${type}.png");`);
        this.type_effectiveness.appendChild(new_type);
    }

    clear() {
        this.poke_sprite.setAttribute("src", "");
        this.current_pokemon = {};

        this.poke_types[0].className = "hidden";
        this.poke_types[1].className = "hidden";

        while (this.type_effectiveness.firstChild) this.type_effectiveness.firstChild.remove();
    }

    showPokemon(pokemon) {
        let national_dex = pokemon.national_dex;
        if (national_dex === 0) {
            this.clear();
            return
        }

        if (national_dex === this.current_pokemon.national_dex) return;
        this.main.className = this.hide_direction;
        setTimeout(() => {
            this.current_pokemon = pokemon;
            this.poke_sprite.setAttribute("src", `pokedex_sprites/${national_dex}.png`);

            let types = pokemon.types;
            this.poke_types[0].className = types[0];
            if (types[1] === "none") this.poke_types[1].className = "hidden";
            else this.poke_types[1].className = types[1];

            let effectivenesses = pokemon.effectiveness;
            while (this.type_effectiveness.firstChild) this.type_effectiveness.firstChild.remove();
            effectivenesses.forEach(([type, effectiveness]) => this.addType(type, effectiveness));
            this.type_effectiveness.setAttribute("style", `width: ${Math.ceil(effectivenesses.length / 2) * 246}px`);

            this.main.className = "center"
        }, 600);
    }
}

class Stats {
    STAT_NAMES = ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"];
    constructor() {
        this.main = document.querySelector("#container");

        this.stats = {};
        let stat_values = this.main.querySelector("#stat_values");
        this.STAT_NAMES.forEach(name => this.stats[name] = stat_values.querySelector("." + name));

        this.showing = false;
    }

    show(drawer) {
        let sprite = drawer.poke_sprite;
        let current_pokemon = drawer.current_pokemon;
        console.log(current_pokemon.stats);
        this.STAT_NAMES.forEach(name => this.stats[name].textContent = current_pokemon.stats[name]);

        this.main.style.left = sprite.x + 'px';
        switch (drawer.hide_direction) {
            case "top":
                this.main.style.top = sprite.y + this.main.clientHeight + (sprite.clientHeight / 2) - 1 + 'px';
                break;
            case "bottom":
                this.main.style.top = sprite.y - this.main.clientHeight - (sprite.clientHeight / 2) - 1 + 'px';
                break;
        }
        this.main.className = "opaque";
    }

    hide() {
        this.main.className = "invisible";
    }
}
let top_drawer = new Drawer("#top_drawer", "top");
let bottom_drawer = new Drawer("#bottom_drawer", "bottom");

let stats = new Stats();

document.querySelector("body").addEventListener('mousemove', (mouse_event) => {
    if (top_drawer.overSprite(mouse_event.clientX, mouse_event.clientY)) stats.show(top_drawer);
    else if (bottom_drawer.overSprite(mouse_event.clientX, mouse_event.clientY)) stats.show(bottom_drawer);
    else stats.hide();
});
ipcRenderer.on("enemy_pokemon", ((event, pokemon) => {
    if (pokemon.length > 1) {
        top_drawer.showPokemon(pokemon[1]);
        bottom_drawer.showPokemon(pokemon[0]);
    } else top_drawer.showPokemon(pokemon[0])
}));

