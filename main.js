const { app, BrowserWindow, screen } = require('electron');
const {Memory, MemoryError} = require('./memory');
const robot = require('robot-js');

const Pokedex = require('./pokedex');
const pokedex = new Pokedex();
const memory = new Memory();
const AUTOHIDE = true;
function start() {
    try {
        memory.attach();
        memory.query();
    } catch (e) {}

    if (memory.ready())
        createWindow();
    else setTimeout(start, 1000);
}

function createWindow (config) {
    // Create the browser window.
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const win = new BrowserWindow({
        width: width,
        height: height,
        x: 0,
        y: 0,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true
        },
        transparent: true
    });

    win.setAlwaysOnTop(true, 'screen-saver');
    win.setIgnoreMouseEvents(true, {forward: true});
    win.setMenuBarVisibility(false);

    // and load the index.html of the app.
    win.loadFile('index.html');

    // Open the DevTools.
    // win.webContents.openDevTools();
    win.webContents.on('did-finish-load', ()=> {
        win.on("closed", () => app.quit());
        win.ready = true;
        main(win);
    });
}

function autoHide(window) {
    let active_window = robot.Window.getActive().getProcess().getName();
    if (active_window === "electron.exe" || active_window === "DeSmuME_0.9.11_x64.exe") {
        window.setAlwaysOnTop(true, 'screen-saver');
        window.show();
    }
    else {
        window.setAlwaysOnTop(false);
        window.hide();
    }
}

function getPokemon(pokemon) {
    let national_dex = pokemon.national_dex;
    return {
        "national_dex": national_dex,
        "types": pokedex.getType(national_dex),
        "effectiveness": pokedex.getAllEffectiveness(national_dex),
        "stats": pokemon.stats
    };
}

function main(win) {
    function poll() {
        try {
            let {player_pokemon, enemy_pokemon} = memory.query();
            win.webContents.send("enemy_pokemon", enemy_pokemon.map(getPokemon));
        } catch (exception) {
            console.log(`${exception.name}: ${exception.message}`);
            if (exception.name === "TypeError")
                if (exception.message === "Cannot read property '0' of undefined") {
                    memory.clearOffset();
                }
                else throw exception
        }
        if (AUTOHIDE)
            autoHide(win);
    }
    setInterval(poll, 1000);
}

app.whenReady().then(start);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});