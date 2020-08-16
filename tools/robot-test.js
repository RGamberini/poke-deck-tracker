const robot = require('robot-js');
let processes = robot.Process.getList();
let emulator = processes.find(process => process.getName() === "DeSmuME_0.9.11_x64.exe");
if (emulator === undefined) {
    console.error("Emulator is not started silly!");
    return
}
// List is an array
const memory = robot.Memory(emulator);
const baseOffset = 0x1456D69B0;
const poke_in_RAM = new Array(0x80);
for (let i = 0x00; i < 0x80; i++) {
    let result = memory.readInt8(baseOffset + i);
    poke_in_RAM[i] = result.toString(2).padStart(8, '0');
    console.log(`0x${i.toString(16)}: 0x${result.toString(16)}`)
}
// console.log(memory.readInt16(baseOffset));


// let search_string = generateSearchString();
// for (let i = 0x00; i < 0x80; i++) {
//     console.log(`0x${i.toString(16)}: ${poke_in_RAM[i]}, ${search_string[i]}`)
// }
// console.log(generateSearchString());
// let lower_bound = 0x1456D6900;
// let upper_bound = 0x1456d6FFF;
// let memory_address = memory.find(generateSearchString(), lower_bound, upper_bound);
// console.log(memory_address);
// memory_address = parseInt(memory_address);
// console.log(memory_address.toString(16));
// console.log(memory.readInt16(memory_address));
// var list = memory.find("04 08 ? 16 23 42");
// console.log(list);
