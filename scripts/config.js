import {MODULE_ID} from "./main.js";
import { QuickGridAlign } from "./app.js";

export function initConfig() {
    Hooks.on("renderSceneConfig", (app, html) => {
        const quickGridButton = document.createElement("button");
        quickGridButton.class = MODULE_ID;
        quickGridButton.dataset.tooltip = game.i18n.localize(`${MODULE_ID}.tooltip`);
        quickGridButton.innerHTML = `<i class="fa-duotone fa-grid"></i>`;
        quickGridButton.addEventListener("click", () => {
            new QuickGridAlign(app.object).render(true);
        });
        html[0].querySelector(".grid-config").insertAdjacentElement("afterend", quickGridButton);
    });
}