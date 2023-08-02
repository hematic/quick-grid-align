import {initConfig} from "./config.js";
import {registerSettings} from "./settings.js";
import {QuickGridAlign} from "./app.js";

export const MODULE_ID = "quick-grid-align";

Hooks.on("init", () => {
    initConfig();
    registerSettings();
});