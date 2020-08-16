const { app, BrowserWindow, screen } = require('electron');
const {Memory, MemoryError} = require('./memory');
const robot = require('robot-js');

const Pokedex = require('./pokedex');
const pokedex = new Pokedex();
const memory = new Memory();
const AUTOHIDE = true;
const windows = {
    TOP: {
        hide_direction: "top",
        getX: function (screenWidth) {
            return 15;
        },
        getY: function (screenHeight) {
            return 15;
        },
        ready: false
    },

    BOTTOM: {
        hide_direction: "bottom",
        getX: function (screenWidth) {
            return 15;
        },

        getY: function (screenHeight) {
            return screenHeight - 154 - 15;
        },
        ready: false
    }
};

function start() {
    try {
        memory.attach();
        memory.query();
    } catch (e) {}

    if (memory.ready()) {
        windows.TOP = createWindow(windows.TOP);
        windows.BOTTOM = createWindow(windows.BOTTOM);

        main();
    }
    else setTimeout(start, 1000);
}

function createWindow (config) {
    // Create the browser window.
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const win = new BrowserWindow({
        width: width - 30,
        height: 154,
        x: config.getX(width),
        y: config.getY(height),
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true
        },
        backgroundColor: '#000000'
    });

    win.setAlwaysOnTop(true, 'screen-saver');
    win.setMenuBarVisibility(false);

    // and load the index.html of the app.
    win.loadFile('index.html');

    // Open the DevTools.
    // win.webContents.openDevTools();
    win.webContents.on('did-finish-load', ()=> {
        win.on("closed", () => app.quit());
        win.webContents.send("config", config.hide_direction);
        win.ready = true;
    });
    return win;
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

function sendPokemon(national_dex, window) {
    window.webContents.send("enemy_pokemon", {
        "national_dex": national_dex,
        "types": pokedex.getType(national_dex),
        "effectiveness": pokedex.getAllEffectiveness(national_dex)
    });
}

function main() {
    function poll() {
        try {
            let pokemon = memory.query();
            if (pokemon.length > 1) {
                sendPokemon(pokemon[1], windows.TOP);
                sendPokemon(pokemon[0], windows.BOTTOM);
            } else sendPokemon(pokemon[0], windows.TOP);
        } catch (exception) {
            console.log(`${exception.name}: ${exception.message}`);
            if (exception.name === "TypeError")
                if (exception.message === "Cannot read property '0' of undefined")
                    memory.clearOffset();
                else app.quit();
        }
        if (AUTOHIDE)
            for (let window in windows) autoHide(windows[window]);
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