const robot = require('robot-js');
// const {generateSearchString} = require('./tools/tools');

function generateSearchString(addresses) {
    let search_string = new Array(0x80).fill('?');

    addresses.forEach(address => {
        let [range, value] = address;
        for (let i = range[0]; i <= range[1]; i++) {
            search_string[i] = value.toString(16).padStart(2, '0');
        }
    });
    return search_string.join(" ");
}

function hexFormat(address) {
    return `0x${address.toString(16).toUpperCase()}`;
}
class MemoryError extends Error {
    constructor(message) {
        super(message);
        this.name = "MemoryError"
    }
}

class Memory {
    static OPPONENT = {
        LOWER_BOUND: 0x1456D6800,
        UPPER_BOUND: 0x1456d6FFF,
        addresses: [
            [[0x22, 0x23], 0],
            [[0x28, 0x28], 0],
            [[0x2A, 0x2B], 0],
            [[0x4E, 0x4F], 0],
            [[0x52, 0x61], 0],
            [[0x62, 0x63], 0xFF],
            [[0x7f, 0x7f], 0x04]
        ]
    };

    static ALL = {
        LOWER_BOUND: 0x1456D6800,
        UPPER_BOUND: 0x1456d6FFF,
        addresses: [
            [[0x26, 0x26], 0],
            [[0x28, 0x28], 0],
            [[0x2A, 0x2B], 0],
            [[0x4E, 0x4F], 0],
            [[0x52, 0x53], 0],
            [[0x62, 0x63], 0xFF]
    ]};

    constructor() {
        this.emulator = undefined;
        this.memory = undefined;
        this.profile = Memory.ALL;
        this.search_string = generateSearchString(this.profile.addresses);
        this.base_offsets = [];
    }

    clearOffset() {
        this.base_offsets = [];
    }

    readUnsignedInt8(address) {
        let result = this.memory.readInt8(address);
        return result < 0 ? result + Math.pow(2,8): result;
    }

    readUnsignedInt16(address) {
        let result = this.memory.readInt16(address);
        return result < 0 ? result + Math.pow(2, 16): result;
    }

    getPokemon(address) {
        let pokemon = {
            national_dex: this.readUnsignedInt16(address),
            stats: {
                "attack": this.readUnsignedInt16(address + 0x02),
                "defense": this.readUnsignedInt16(address + 0x04),
                "speed": this.readUnsignedInt16(address + 0x06),
                "sp_attack": this.readUnsignedInt16(address + 0x08),
                "sp_defense": this.readUnsignedInt16(address + 0x0A),
                "hp": this.readUnsignedInt16(address + 0x4C)
            },
            player_owned: this.readUnsignedInt16(address + 0x54) !== 0
        };
        return pokemon;
    }

    checkOffset(address) {
        console.debug(`Memory: Checking ${hexFormat(address)}`);
        let national_dex = this.readUnsignedInt16(address);

        if (national_dex > 0 && national_dex <= 493) {
            console.debug(`Memory: Check successful found base offset ${hexFormat(address)}. National Dex #${national_dex} is inside range 0 < n <= 493`);
            return true;
        } else console.debug(`Memory: Check failed for base offset ${hexFormat(address)}. National Dex #${national_dex} is outside range 0 < n <= 493`);
        return false;
    }

    ready() {
        return this.emulator !== undefined && this.memory !== undefined && this.base_offsets.length !== 0;
    }

    attach() {
        let processes = robot.Process.getList();
        this.emulator = processes.find(process => process.getName() === "DeSmuME_0.9.11_x64.exe");
        if (this.emulator === undefined)
            throw new MemoryError("Emulator is not started silly!");
        this.memory = robot.Memory(this.emulator);
        console.debug("Memory: Attached to emulator.")
    }

    query() {
        if (this.emulator === undefined) throw new MemoryError("Not attached to emulator.");
        if (this.base_offsets.length === 0) {
            console.debug("Memory: No known base offsets, looking...");
            let addresses = this.memory.find(this.search_string, this.profile.LOWER_BOUND, this.profile.UPPER_BOUND);
            console.debug(`Memory: Found ${addresses.length} address(es): ${addresses.map(address => hexFormat(parseInt(address)))}`);

            for (let address of addresses) {
                address = parseInt(address);

                if (this.checkOffset(address))
                    this.base_offsets.push(address);
            }
            if (this.base_offsets.length === 0) throw new MemoryError("Memory: Can't read memory no base offset found.");
        }

        let result = {
            player_pokemon: [],
            enemy_pokemon: []
        };

        this.base_offsets.forEach(address => {
            let pokemon = this.getPokemon(address);
            if (pokemon.player_owned) result.player_pokemon.push(pokemon);
            else result.enemy_pokemon.push(this.getPokemon(address));
        });
        return result;
    }
}

module.exports = {Memory, MemoryError};