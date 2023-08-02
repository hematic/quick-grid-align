import {MODULE_ID} from "./main.js";
import {getSetting} from "./settings.js";

const f = Math.sqrt(3) / 2;

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
            closeOnSubmit: false,
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
        const canvasContainer = html.querySelector(".quick-grid-align-canvas-container");
        this.createCanvasPreview(canvasContainer);
    }

    async createCanvasPreview(canvasContainer) {

        const dotPositions = {
            start: {
                x: 0,
                y: 0,
            },
            end: {
                x: 0,
                y: 0,
            },
        }

        const measurements = [];

        const src = this.scene.background.src;
        const img = new Image();
        img.src = src;
        await new Promise((resolve) => {
            img.onload = resolve;
        });
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");

        function redrawCanvas() {
            console.log("redraw");
            const randomX = Math.random() * (img.width - canvas.width);
            const randomY = Math.random() * (img.height - canvas.height);
            ctx.drawImage(img, randomX, randomY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        }

        canvasContainer.appendChild(canvas);
        redrawCanvas();

        const dotStart = document.createElement("div");
        dotStart.classList.add("quick-grid-align-canvas-dot", "start");
        canvasContainer.appendChild(dotStart);
        const dotEnd = document.createElement("div");
        dotEnd.classList.add("quick-grid-align-canvas-dot", "end");
        canvasContainer.appendChild(dotEnd);

        canvas.addEventListener("mousedown", (event) => {
            const rect = canvasContainer.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            dotStart.style.display = "block";
            dotStart.style.left = `${x-5}px`;
            dotStart.style.top = `${y - 5}px`;
            dotPositions.start.x = x;
            dotPositions.start.y = y;
        });

        canvas.addEventListener("mouseup", (event) => {
            const rect = canvasContainer.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            dotEnd.style.display = "block";
            dotEnd.style.left = `${x-5}px`;
            dotEnd.style.top = `${y - 5}px`;
            dotPositions.end.x = x;
            dotPositions.end.y = y;

            const startEndDist = Math.sqrt(Math.pow(dotPositions.start.x - dotPositions.end.x, 2) + Math.pow(dotPositions.start.y - dotPositions.end.y, 2));
            measurements.push(startEndDist);
            const avg = Math.round(measurements.reduce((a, b) => a + b, 0) / measurements.length);
            redrawCanvas();
            this.element[0].querySelector(`h3.form-header`).innerHTML = `<i class="fa-duotone fa-ruler-triangle"></i> ${game.i18n.localize("quick-grid-align.quick-grid-align-app.dragAlign")} | ${game.i18n.localize("quick-grid-align.quick-grid-align-app.measurementsTaken")} - ${measurements.length}`
            dotEnd.style.display = "none";
            dotStart.style.display = "none";
            this.setSquaresFromCellRadius(avg, img.width, img.height);
        });
    }

    setSquaresFromCellRadius(cellSide, imgWidth, imgHeight) {
        const isHex = this.gridType.includes("HEX");
        const cellCount = {
            x: 1,
            y: 1,
        };
        if (isHex) {
            const R = cellSide;
            const S = R;
            const ALPHA = S * f;
            const overlap = S * 0.5;
            const ALPHA_2 = ALPHA * 2;

            const isRow = this.gridType.includes("R");
            if (isRow) {
                cellCount.x = imgWidth / ALPHA_2;
                cellCount.y = (imgHeight + overlap) / (S*2 - overlap);
            } else {
                cellCount.x = (imgWidth - overlap) / (S*2 - overlap);
                cellCount.y = imgHeight / ALPHA_2;
            }

        } else {
            const squareSide = cellSide;
            cellCount.x = Math.round(imgWidth / squareSide);
            cellCount.y = Math.round(imgHeight / squareSide);
        }

        //round to the closest multiple of 0.5
        cellCount.x = Math.round(cellCount.x * 2) / 2;
        cellCount.y = Math.round(cellCount.y * 2) / 2;

        this.element[0].querySelector(`input[name="squareCount.x"]`).value = cellCount.x;
        this.element[0].querySelector(`input[name="squareCount.y"]`).value = cellCount.y;
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
            width: this.gridSize * (f * x + 2 - 2*f),
            height: y * this.gridSize,
            grid: {
                size: this.gridSize,
            },
        };
    }

    _getHEXEVENR(x, y) {
        return {
            width: x * this.gridSize,
            height: this.gridSize * (f * y + 2 - 2*f),
            grid: {
                size: this.gridSize,
            },
        };
    }

    _getHEXODDQ(x, y) {
        return {
            width: this.gridSize * (f * x + 2 - 2*f),
            height: y * this.gridSize,
            grid: {
                size: this.gridSize,
            },
        };
    }

    _getHEXODDR(x, y) {
        return {
            width: x * this.gridSize,
            height: this.gridSize * (f * y + 2 - 2*f),
            grid: {
                size: this.gridSize,
            },
        };
    }
}
