const {Memory, MemoryError} = require('../memory');
let memory = new Memory();
let search_string = memory.search_string.split(" ");

class StatefulRNG {
    constructor(chk) {
        this.seed = chk;
        this.last = chk;
    }

    rand() {
        let result = (Math.imul(0x41C64E6D, this.last) + 0x6073) >>> 0;
        this.last = result;
        return result;
    }
}
function hex(num, pad) {
    if (pad) return num.toString(16).toUpperCase().padStart(pad, '0');
    return num.toString(16).toUpperCase();
}

function cHex(num, pad) {
    let result = hex(num, pad);
    return result.match(/.{1,2}/g).reverse().join(" ");
}

function pass(num, search) {
    return search === '?' ? true : hex(num, 2) === search;
}
function debugOffset(address) {
    let result = true;
    for (let i = 0; i < 0x80; i+=1) {
        let read = memory.memory.readInt8(address + i);
        let search = search_string[i].toUpperCase();
        if (read < 0)
            read += 0x100;
        console.log(`0x${hex(i, 2)}: 0x${hex(read, 2)}==${search} ${pass(read, search)}`);
        result &= pass(read, search);
    }
    console.log(`Offset ${hex(address)} ${result ? 'has passed' : 'has failed'}`);
}

function readSave(address) {
    let raw = Buffer.alloc(0x88);
    let bufferIn = [0x91, 0xF3, 0x9F, 0x2B, 0x00, 0x00, 0x3D, 0x2D, 0xB5, 0x89, 0x58, 0xDF, 0xAB, 0x0A, 0xA9, 0x0D, 0x71, 0x02, 0xC1, 0x13, 0x12, 0x0B, 0xF2, 0xEF, 0x38, 0xFD, 0xDA, 0xDD, 0x8B, 0x99, 0x71, 0x7E, 0x03, 0x90, 0xBC, 0xEE, 0x4D, 0xB5, 0x4D, 0x05, 0xD3, 0xA1, 0xF2, 0x43, 0xB5, 0x8E, 0x58, 0x65, 0x12, 0x25, 0x47, 0xFF, 0x0C, 0x6F, 0x57, 0xB9, 0x81, 0x53, 0x7D, 0x80, 0xB7, 0xEA, 0x44, 0xE1, 0xB5, 0xF2, 0x95, 0xA3, 0x27, 0xEE, 0xBF, 0x60, 0x63, 0x6D, 0xA6, 0x43, 0xB7, 0xDE, 0x0B, 0x66, 0xC8, 0xD3, 0xC1, 0x4B, 0x51, 0x32, 0x2F, 0x92, 0x5B, 0x77, 0x68, 0x11, 0xD2, 0x88, 0x01, 0x26, 0x59, 0x86, 0x2B, 0x22, 0x1E, 0xCC, 0xC4, 0x84, 0x5F, 0x4C, 0xD6, 0x31, 0x89, 0x88, 0x95, 0x96, 0xA4, 0x54, 0x42, 0x17, 0x26, 0x47, 0xDC, 0x21, 0xB7, 0x71, 0x70, 0x33, 0x49, 0x61, 0x0D, 0x29, 0xF8, 0x33, 0xEC, 0xF9, 0x12, 0x94, 0x13, 0xEB];
    for (let i = 0; i < 0x88; i++) {
        // raw[i] = memory.readUnsignedInt8(address + i);
        raw[i] = bufferIn[i];
    }
    let chk = raw.readUInt16LE(0x06);
    // console.log('0x' + hex(chk, 2) + ", " + chk);

    // console.log("PRNG RESULT: ");
    let rng = new StatefulRNG(chk);
    // let result = rng.rand();
    // console.log(`${cHex(result)} : ${result}`);
    //
    // console.log("PRNG RESULT AFTER >> 0x10");
    // result = (result >> 0x10) >>> 0;
    // console.log(`${cHex(result)} : ${result}`);
    //
    // console.log("ENCRYPTED BYTES: ");
    // let encrypted = raw.readUInt16LE(0x08);
    // console.log(`${cHex(encrypted)} : ${encrypted}`);
    //
    // console.log("UNENCRYPTED BYTES: ");
    // let unencrypted = (encrypted ^ (result)) >>> 0;
    // console.log(`${cHex(unencrypted)} : ${unencrypted}`);

    for (let i = 0x08; i < 0x88; i += 2) {
        let encrypted = raw.readUInt16LE(i);
        let unencrypted = (encrypted ^ (rng.rand() >>> 0x10));
        if (unencrypted === 395)
            console.log("Emporean Start " + unencrypted);
        // console.log(`0x${hex(i, 2)}: 0x${hex(unencrypted, 4)}`);
        // console.log(cHex(encrypted, 4));
        // console.log(cHex(unencrypted, 4));
    }
}
// console.log(SEARCH_STRING);
memory.attach();
readSave(0x14568F4CC);
// console.log(cHex(0x2048, 4));
// debugOffset(0x14568F4CC);
// debugOffset(0x1456D0E04);
// debugOffset(0x1456D6A38);