import {MODULE_ID} from "./main.js";
import {getSetting} from "./settings.js";

const localeMap = {
    GRIDLESS: "SCENES.GridGridless",
    HEXEVENQ: "SCENES.GridHexEvenQ",
    HEXEVENR: "SCENES.GridHexEvenR",
    HEXODDQ: "SCENES.GridHexOddQ",
    HEXODDR: "SCENES.GridHexOddR",
    SQUARE: "SCENES.GridSquare",
};

export class QuickGridAlign extends FormApplication {
    constructor(scene) {
        super();
        this.scene = scene ?? canvas?.scene;
        this.gridType = Object.entries(CONST.GRID_TYPES).find(([, value]) => value === this.scene.grid.type)[0];
        this.gridSize = getSetting("gridSize");
    }

    static get APP_ID() {
        return "quick-grid-align-app";
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: this.APP_ID,
            template: `modules/${MODULE_ID}/templates/${this.APP_ID}.hbs`,
            popOut: true,
            resizable: false,
            minimizable: true,
            width: 400,
            title: game.i18n.localize(`${MODULE_ID}.${this.APP_ID}.title`),
        });
    }

    get title() {
        return game.i18n.localize(`${MODULE_ID}.${this.constructor.APP_ID}.title`) + ` - ${this.scene.name}`;
    }

    async getData() {
        return {
            gridType: localeMap[this.gridType],
            horizontal: Math.round(this.scene.dimensions.sceneWidth / this.scene.dimensions.size),
            vertical: Math.round(this.scene.dimensions.sceneHeight / this.scene.dimensions.size),
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html = html[0] ?? html;
    }

    async _updateObject(event, formData) {
        formData = expandObject(formData);
        const updateData = this[`_get${this.gridType}`](formData.squareCount.x, formData.squareCount.y);
        updateData.width = Math.round(updateData.width);
        updateData.height = Math.round(updateData.height);
        await this.scene.update(updateData);
    }

    _getGRIDLESS(x, y) {
        return {
            width: x * this.gridSize,
            height: y * this.gridSize,
            grid: {
                size: this.gridSize,
            },
        };
    }

    _getSQUARE(x, y) {
        return {
            width: x * this.gridSize,
            height: y * this.gridSize,
            grid: {
                size: this.gridSize,
            },
        };
    }

    _getHEXEVENQ(x, y) {
        return {
            width: this.gridSize * ((Math.sqrt(3) / 2) * x + 2 - Math.sqrt(3)),
            height: y * this.gridSize,
            grid: {
                size: this.gridSize,
            },
        };
    }

    _getHEXEVENR(x, y) {
        return {
            width: x * this.gridSize,
            height: this.gridSize * ((Math.sqrt(3) / 2) * y + 2 - Math.sqrt(3)),
            grid: {
                size: this.gridSize,
            },
        };
    }

    _getHEXODDQ(x, y) {
        return {
            width: this.gridSize * ((Math.sqrt(3) / 2) * x + 2 - Math.sqrt(3)),
            height: y * this.gridSize,
            grid: {
                size: this.gridSize,
            },
        };
    }

    _getHEXODDR(x, y) {
        return {
            width: x * this.gridSize,
            height: this.gridSize * ((Math.sqrt(3) / 2) * y + 2 - Math.sqrt(3)),
            grid: {
                size: this.gridSize,
            },
        };
    }
}
