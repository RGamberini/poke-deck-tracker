const fs = require('fs');
const Data = {
    types: ['normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'],
    defending_types: {
        "normal": [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        "fighting": [1, 1, 2, 1, 1, 0.5, 0.5, 1, 1, 1, 1, 1, 1, 2, 1, 1, 0.5, 2],
        "flying": [1, 0.5, 1, 1, 0, 2, 0.5, 1, 1, 1, 1, 0.5, 2, 1, 2, 1, 1, 1],
        "poison": [1, 0.5, 1, 0.5, 2, 1, 0.5, 1, 1, 1, 1, 0.5, 1, 2, 1, 1, 1, 0.5],
        "ground": [1, 1, 1, 0.5, 1, 0.5, 1, 1, 1, 1, 2, 2, 0, 1, 2, 1, 1, 1],
        "rock": [0.5, 2, 0.5, 0.5, 2, 1, 1, 1, 2, 0.5, 2, 2, 1, 1, 1, 1, 1, 1],
        "bug": [1, 0.5, 2, 1, 0.5, 2, 1, 1, 1, 2, 1, 0.5, 1, 1, 1, 1, 1, 1],
        "ghost": [0, 0, 1, 0.5, 1, 1, 0.5, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
        "steel": [0.5, 2, 0.5, 0, 2, 0.5, 0.5, 1, 0.5, 2, 1, 0.5, 1, 0.5, 0.5, 0.5, 1, 0.5],
        "fire": [1, 1, 1, 1, 2, 2, 0.5, 1, 0.5, 0.5, 2, 0.5, 1, 1, 0.5, 1, 1, 0.5],
        "water": [1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 2, 2, 1, 0.5, 1, 1, 1],
        "grass": [1, 1, 2, 2, 0.5, 1, 2, 1, 1, 2, 0.5, 0.5, 0.5, 1, 2, 1, 1, 1],
        "electric": [1, 1, 0.5, 1, 2, 1, 1, 1, 0.5, 1, 1, 1, 0.5, 1, 1, 1, 1, 1],
        "psychic": [1, 0.5, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 0.5, 1, 1, 2, 1],
        "ice": [1, 2, 1, 1, 1, 2, 1, 1, 2, 2, 1, 1, 1, 1, 0.5, 1, 1, 1],
        "dragon": [1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 1, 2, 2, 1, 2],
        "dark": [1, 2, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 1, 1, 0, 1, 1, 0.5, 2],
        "fairy": [1, 0.5, 1, 2, 1, 1, 0.5, 1, 2, 1, 1, 1, 1, 1, 1, 0, 0.5, 1]
    },

    type_index: {
        "normal": 0,
        "fighting": 1,
        "flying": 2,
        "poison": 3,
        "ground": 4,
        "rock": 5,
        "bug": 6,
        "ghost": 7,
        "steel": 8,
        "fire": 9,
        "water": 10,
        "grass": 11,
        "electric": 12,
        "psychic": 13,
        "ice": 14,
        "dragon": 15,
        "dark": 16,
        "fairy": 17
    },

    getMatchup: function (attacking, defending) {
        return this.defending_types[defending][Data.type_index[attacking]];
    }
};

class Pokedex {
    constructor() {
        let raw = fs.readFileSync('pokedex.json');
        this.data = JSON.parse(raw);
    }

    getType(national_dex) {
        return this.data[national_dex.toString()];
    }

    getMatchup(attacking, defending) {
        let result = Data.getMatchup(attacking, defending[0]);
        if (defending[1] !== "none") result *= Data.getMatchup(attacking, defending[1]);
        return result;
    }

    getEffectiveness(attacking, national_dex) {
        return this.getMatchup(attacking, this.getType(national_dex));
    }

    getAllEffectiveness(national_dex) {
        let super_effective = [], not_very_effective = [];
        Data.types.forEach(type => {
            let effectiveness = this.getEffectiveness(type, national_dex);
            if (effectiveness > 1) super_effective.push([type, effectiveness]);
            else if (effectiveness < 1) not_very_effective.push([type, effectiveness]);
        });
        return super_effective.sort((a, b) => a[1] < b[1] ? 1 : -1).concat(not_very_effective.sort((a, b) => a[1] > b[1] ? 1 : -1));
    }
}
module.exports = Pokedex;
