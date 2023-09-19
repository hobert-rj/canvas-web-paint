class paintDataItem {
    editable = true;
    context = '';
    image = '';

    constructor(context, editable) {
        if (context !== undefined) {
            this.context = context;
        }
        if (editable !== undefined) {
            this.editable = editable;
        }
    }
}

class Subscription {
    constructor(listeners) {
        this.listeners = listeners;
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    unsubscribe(listener) {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }
}

class EventEmitter {
    data

    constructor() {
        this.listeners = [];
        this.subscription = new Subscription(this.listeners);
    }

    emit(data, detectChange = true) {
        if (data !== undefined && this.data !== data || !detectChange) {
            this.data = data;
            this.listeners.forEach((listener) => {
                listener(data);
            });
        }
    }
}

const paintBrushRange = document.querySelector('#paintSizeRange');
const paintSizeVal = document.querySelector('#paintSizeVal');
const paintContainer = document.querySelector('#paintContainer');
const paintAdd = document.querySelector('#paintAdd');
const paintCanvas = document.querySelector('#paintDraw');
const paintColorInput = document.querySelector('#paintColorInput');
const paintResetBtn = document.querySelector('#paintReset');
const paintSaveBtn = document.querySelector('#paintSave');
const paintBtn = document.querySelector('#paintBtn');
const paintToolBar = document.querySelector('#paintToolBar');
const paintTabsCon = document.querySelector('#paintTabsCon');
const paintColorCon = document.querySelector('#paintColorCon');
const paintTools = document.querySelectorAll('#paintTools span');
const paintColors = document.querySelectorAll('#paintColors span');

const paintQuality = 2;
const paintFrequency = 1;
const paintMinMovement = 5;
const paintBackground = 'white';
const paintCtx = paintCanvas.getContext('2d');
const paintCalcQuality = (val) => val * paintQuality;
const paintNotMove = (x, y) => {
    const x2 = Math.abs(paintLastX - x);
    const y2 = Math.abs(paintLastY - y);
    return x2 * x2 + y2 * y2 < paintMinMovement;
};
const getPaintTabs = () => document.querySelectorAll('.paintTab');

const paintEditChangeEventMaster = new EventEmitter();
const paintEditChangeEvent = paintEditChangeEventMaster.subscription;

let paintData = {};
let paintBrushSize = {
    pencil: 15,
    eraser: 100,
    brush: 15,
};
let paintCurrentColor = 'black';
let paintCurrentLineCap = 'round';
let paintCurrentTool = 'brush';
let paintDrawing = false;
let paintLastX = 0;
let paintLastY = 0;
let paintRect = '';
let paintInitialDataUrl;
let paintSelectedId = 1;
let paintCycles = paintFrequency;
let paintTabs = getPaintTabs();
let paintTabsCreated = 1;

// Run once at first
function paintInit() {
    paintCanvas.height = paintCalcQuality(paintContainer.offsetHeight);
    paintCanvas.width = paintCalcQuality(paintContainer.offsetWidth);
    paintClearTab();
    paintInitialDataUrl = paintGetDataUrl();
    paintSelectedId = 1;
    paintData[paintSelectedId] = new paintDataItem(paintInitialDataUrl);

    //event listeners
    window.addEventListener('resize', paintReSize);
    paintContainer.addEventListener('resize', paintReSize);

    paintBrushRange.addEventListener('input', () => {
        const val =
            typeof paintBrushRange.value === 'string'
                ? parseInt(paintBrushRange.value)
                : paintBrushRange.value;
        paintBrushSize[paintCurrentTool] = val;
        paintSizeVal.innerHTML = val;
        paintCtx.lineWidth = val;
    });
    paintColorInput.addEventListener('change', paintPickColor);
    paintColorInput.addEventListener('input', paintPickColor);
    paintSaveBtn.addEventListener('click', paintSaveImg);
    paintResetBtn.addEventListener('click', paintClearTab);

    paintTools.forEach((tool) => tool.addEventListener('click', paintSetTool));
    paintColors.forEach((color) => color.addEventListener('click', paintSelectColor));
    paintTabs.forEach((tab) => tab.addEventListener('click', paintSelectTab));
    paintBtn.addEventListener('click', paintToggle);
    paintAdd.addEventListener('click', paintNewTab);

    paintCanvas.addEventListener('mousedown', paintStartDraw);
    paintCanvas.addEventListener('mousemove', paintContinueDraw);
    paintCanvas.addEventListener('mouseup', () => (paintDrawing = false));
    paintCanvas.addEventListener('touchstart', paintStartDraw);
    paintCanvas.addEventListener('touchmove', paintContinueDraw);
    paintCanvas.addEventListener('touchend', () => (paintDrawing = false));
}

function paintReSize() {
    try {
        const temp = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
        paintCanvas.height = paintCalcQuality(paintContainer.offsetHeight);
        paintCanvas.width = paintCalcQuality(paintContainer.offsetWidth);
        paintCtx.putImageData(temp, 0, 0);
    } catch {
    }
    paintCtx.lineWidth = paintBrushSize[paintCurrentTool];
    paintSizeVal.innerHTML = paintBrushSize[paintCurrentTool];
    paintBrushRange.value = paintBrushSize[paintCurrentTool];
    paintCtx.lineCap = paintCurrentLineCap;
    paintCtx.strokeStyle = paintCurrentTool === 'eraser' ? paintBackground : paintCurrentColor;
    paintCycles = 0;
};

function paintContinueDraw(e) {
    e.preventDefault();
    if (!paintDrawing || paintData[paintSelectedId].editable === false) {
        return;
    }

    if (paintCycles < paintFrequency) {
        paintCycles++;
        return;
    }

    const x = paintCalcQuality(e.touches ? e.touches[0].pageX - paintRect.left : e.offsetX),
        y = paintCalcQuality(e.touches ? e.touches[0].pageY - paintRect.top : e.offsetY);

    if (paintNotMove(x, y)) {
        return
    }

    paintCtx.beginPath();
    paintCtx.moveTo(paintLastX, paintLastY);
    paintCtx.lineTo(x, y);
    paintLastX = x;
    paintLastY = y;
    paintCtx.stroke();
    paintCycles = 0;
};

function paintStartDraw(e) {
    e.preventDefault();
    if (paintData[paintSelectedId].editable === false) {
        return;
    }
    const target = e.target || e.srcElement;
    paintRect = target.getBoundingClientRect();
    paintDrawing = true;
    paintLastX = paintCalcQuality(e.touches ? e.touches[0].pageX - paintRect.left : e.offsetX);
    paintLastY = paintCalcQuality(e.touches ? e.touches[0].pageY - paintRect.top : e.offsetY);
    paintCtx.beginPath();
    paintCtx.moveTo(paintLastX, paintLastY);
    paintCtx.lineTo(paintLastX, paintLastY);
    paintCtx.stroke();
    paintCycles = paintFrequency;
    paintContinueDraw(e);
};

function paintSelectColor() {
    paintCurrentColor = this.dataset.color;
    paintCtx.strokeStyle = paintCurrentTool !== 'eraser' ? paintCurrentColor : paintBackground;
    paintColors.forEach((color) =>
        color === this
            ? color.classList.add('active-color')
            : color.classList.remove('active-color')
    );
}

function paintPickColor() {
    if (paintCurrentColor === this.value)
        return

    paintCurrentColor = this.value;
    paintCtx.strokeStyle = paintCurrentTool !== 'eraser' ? paintCurrentColor : paintBackground;
    paintColors.forEach((color) => color.classList.remove('active-color'));
}

function paintSetTool() {
    paintCurrentTool = this.dataset.name;
    paintCtx.lineWidth = paintBrushSize[paintCurrentTool];
    paintSizeVal.innerHTML = paintBrushSize[paintCurrentTool];
    paintBrushRange.value = paintBrushSize[paintCurrentTool];
    paintTools.forEach((tool) =>
        tool === this
            ? tool.classList.add('active-tool')
            : tool.classList.remove('active-tool')
    );
    paintCurrentLineCap = paintCurrentTool === 'pencil' ? 'square' : 'round';
    paintCtx.lineCap = paintCurrentLineCap;
    paintCtx.strokeStyle = paintCurrentTool === 'eraser' ? paintBackground : paintCurrentColor;
    paintColorCon.style.display = paintCurrentTool === 'eraser' ? 'none' : '';
}

function paintSaveImg(e) {
    if (paintInitialDataUrl === paintGetDataUrl()) return e.preventDefault();

    this.download = prompt('Enter image name :');
    if (this.download === 'null') return e.preventDefault();

    this.href = paintCanvas.toDataURL('image/png');
}

function paintToggle() {
    if (paintBtn.classList.contains('show')) {
        paintBtn.classList.remove('show');
        paintToolBar.style.display = 'none';
    } else {
        paintBtn.classList.add('show');
        paintToolBar.style.display = '';
    }
}

async function paintSetDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            paintCtx.drawImage(img, 0, 0);
            resolve();
        };
        img.src = dataUrl;
    });
}

async function paintSetImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            const aspectRatio = img.width / img.height;
            let drawWidth, drawHeight;
            if (paintCanvas.width / img.width < paintCanvas.height / img.height) {
                drawWidth = paintCanvas.width;
                drawHeight = paintCanvas.width / aspectRatio;
            } else {
                drawWidth = paintCanvas.height * aspectRatio;
                drawHeight = paintCanvas.height;
            }
            const x = (paintCanvas.width - drawWidth) / 2;
            const y = (paintCanvas.height - drawHeight) / 2;
            paintCtx.drawImage(img, x, y, drawWidth, drawHeight);
            resolve();
        };
        img.crossOrigin = "anonymous";
        img.src = src;
    });
}

function paintGetDataUrl() {
    return paintCanvas.toDataURL('image/png');
}

function paintNewTab() {
    const newId = `Image ${++paintTabsCreated}`;

    paintCreateTab(newId).classList.add('active');

    paintData[paintSelectedId].context = paintGetDataUrl();
    paintData[newId] = new paintDataItem(paintInitialDataUrl);
    paintSelectedId = newId;
    paintTabs.forEach((tab) => tab.classList.remove('active'));
    paintTabs = getPaintTabs();
    paintUpdateTabsContext();
}

function paintCreateTab(newId) {
    const newNode = document.createElement('li');
    newNode.classList.add('paintTab');
    newNode.dataset.id = newId;
    newNode.innerHTML = `<label>${newId}</label><svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 512 512'><polygon points='400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49'></polygon></svg>`;
    paintTabsCon.append(newNode)
    newNode.addEventListener('click', paintSelectTab);
    return newNode;
}

async function paintSelectTab(e, id) {
    if (id === undefined)
        id = this.dataset.id;

    if (e) {
        const target = e.target || e.srcElement;

        if (target instanceof SVGElement) {
            paintDeleteTab(id);
            return
        }
    }

    if (paintSelectedId === id) return

    paintData[paintSelectedId].context = paintGetDataUrl();
    paintSelectedId = id;
    await paintUpdateTabsContext();
}

async function paintUpdateTabsContext() {
    for (const item of paintTabs) {
        if (item.dataset.id === paintSelectedId)
            item.classList.add('active')
        else
            item.classList.remove('active')
    }
    paintClearTab();
    const selectedPaintData = paintData[paintSelectedId];
    const editable = selectedPaintData.editable !== false;
    if (editable) {
        paintToolBar.style.display = '';
        paintBtn.style.display = '';
    } else {
        paintToolBar.style.display = 'none';
        paintBtn.style.display = 'none';
    }
    paintEditChangeEventMaster.emit(editable);
    if (selectedPaintData.context || !selectedPaintData.image) {
        await paintSetDataUrl(selectedPaintData.context);
    } else if (selectedPaintData.image) {
        await paintSetImage(selectedPaintData.image);
    }
}

function paintClearTab(e) {
    if (e) {
        if (paintInitialDataUrl === paintGetDataUrl()) return;

        if (!confirm('Are you sure you want to clear the page?')) return;
        paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
    }

    paintCtx.fillStyle = paintBackground;
    paintCtx.lineCap = paintCurrentLineCap;
    paintCtx.lineWidth = paintBrushSize[paintCurrentTool];
    paintCtx.strokeStyle = paintCurrentTool === 'eraser' ? paintBackground : paintCurrentColor;
    paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
}

function paintDeleteTab(id) {
    if (!confirm(`Are you sure you want to delete Image ${id}?`)) return;

    if (Object.keys(paintData).length <= 1) {
        paintNewTab();
    }

    if (paintSelectedId === id) {
        paintSelectTab(undefined, paintFindNextId(id - 1, (newId) => newId !== id));
    }

    for (const item of paintTabs) {
        if (item.dataset.id === id) {
            item.remove();
            break
        }
    }

    paintTabs = getPaintTabs();

    delete paintData[id];
}

function paintFindNextId(nextId, condition = (newId) => true) {
    if (!paintData[nextId]) {
        for (const key of Object.keys(paintData)) {
            const newId = key;
            if (condition(newId)) {
                nextId = newId;
                break;
            }
        }
    }
    return nextId;
}

// Get paint data as Json to be saved
function paintGetJson() {
    paintData[paintSelectedId].context = paintGetDataUrl();
    return JSON.stringify(paintData);
}

// Set Json data to paint
async function paintSetJson(json, startingId = 1) {
    const temp = JSON.parse(json);
    if (typeof temp === 'object' && Object.keys(temp).length) {
        paintData = temp;
        paintTabsCon.textContent = '';
        for (const key in paintData) {
            paintCreateTab(key);
        }
        paintTabs = getPaintTabs();
        paintSelectedId = paintFindNextId(startingId);
        await paintUpdateTabsContext();
    }
}

// start
paintInit();

// example
setTimeout(() => {
    console.log(1)
    // custom tabs
    const tabs = {
        'hello': {
            editable: false,
            image: 'https://png.pngtree.com/png-clipart/20190918/ourmid/pngtree-pink-watercolor-brushes-171474-png-image_1733978.jpg'
        }
    };

    setTimeout(async () => {
        console.log(2)
        // set custom tabs
        await paintSetJson(JSON.stringify(tabs))
        // save tabs info
        const tabs2 = paintGetJson();
        setTimeout(() => {
            console.log(3)
            // set saved tabs info
            paintSetJson(tabs2)
        }, 3000)
    }, 3000)
}, 3000)

// events example
const onPaintEditChange = (editable) => {
    console.log(`Paint edit changed. Editable: ${editable}`);
    // unsubscribe example
    paintEditChangeEvent.unsubscribe(onPaintEditChange);
}
// subscribe example
paintEditChangeEvent.subscribe(onPaintEditChange);
