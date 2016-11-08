function HMHeatmap(hmBr, width, height, data, numRows, numCols, tlStart) {
    this.browser = hmBr;
    this.scrollX = 0;
    this.scrollY = 0;
    this.width = width;
    this.height = height;
    this.data = data;
    this.numRows = numRows;
    this.numCols = numCols;
    this.tlStart = tlStart;
    this.filteredIndices = [];
    this.filteredData = this.data;
    this.highlightedSearchIndices = [];
}

HMHeatmap.prototype.init = function() {
    var HMHeat = this;
    this.canv = createCanvas('hmCanvas', this.width, this.height, 'position: absolute; top: ' + this.tlStart.top + 'px; left: ' + this.tlStart.left + 'px');
    this.highlightCanv = createCanvas('hmHighlightCanvas', this.width, this.height, 'position: absolute; top: ' + this.tlStart.top + 'px; left: ' + this.tlStart.left + 'px');
    this.searchHighlightCanv = createCanvas('hmSearchHighlightCanvas', this.width, this.height, 'position: absolute; top: ' + this.tlStart.top + 'px; left: ' + this.tlStart.left + 'px');
    this.browser.parentDiv.appendChild(this.canv);
    this.browser.parentDiv.appendChild(this.highlightCanv);
    this.browser.parentDiv.appendChild(this.searchHighlightCanv);
    this.ctx = this.canv.getContext("2d");
    this.searchHighlightCtx = this.searchHighlightCanv.getContext("2d");
    this.searchHighlightCtx.strokeStyle = this.browser.settings.highlightSearchStroke;
    this.searchHighlightCtx.globalAlpha = this.browser.settings.highlightSearchStrokeOpacity;
    this.highlightCtx = this.highlightCanv.getContext("2d");
    this.highlightCtx.strokeStyle = this.browser.settings.highlightCellColor;
    this.highlightCtx.lineWidth = this.browser.settings.highlightCellLineWidth;
    this.highlightCanv.onmousemove = function(e) {
        var evt = e || event;
        HMHeat.highlightCell(evt.offsetX, evt.offsetY);
    };

    this.highlightCanv.onmouseout = function(e) {
        HMHeat.highlightCtx.clearRect(0, 0, HMHeat.highlightCanv.width, HMHeat.highlightCanv.height);
        HMHeat.browser.onMouseOut();
    };
};

HMHeatmap.prototype.setWidth = function(width) {
    this.width = width;
    this.canv.width = width;
    this.highlightCanv.width = width;
    this.searchHighlightCanv.width = width;
    this.highlightCtx.strokeStyle = this.browser.settings.highlightCellColor;
    this.highlightCtx.lineWidth = this.browser.settings.highlightCellLineWidth;
    this.searchHighlightCtx.fillStyle = this.browser.settings.highlightSearchFill;
    this.searchHighlightCtx.globalAlpha = this.browser.settings.highlightSearchStrokeOpacity;
};

HMHeatmap.prototype.setHeight = function(height) {
    this.height = height;
    this.canv.height = height;
    this.highlightCanv.height = height;
    this.searchHighlightCanv.height = height;
    this.highlightCtx.strokeStyle = this.browser.settings.highlightCellColor;
    this.highlightCtx.lineWidth = this.browser.settings.highlightCellLineWidth;
    this.searchHighlightCtx.fillStyle = this.browser.settings.highlightSearchFill;
    this.searchHighlightCtx.globalAlpha = this.browser.settings.highlightSearchStrokeOpacity;
};

HMHeatmap.prototype.highlightRow = function(i) {
    var ch = this.browser.settings.cellHeight * this.browser.zoom;
    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);
    this.highlightCtx.beginPath();
    this.highlightCtx.moveTo(0, (ch*i)-this.scrollY);
    this.highlightCtx.lineTo(this.width, (ch*i)-this.scrollY);
    this.highlightCtx.stroke();

    this.highlightCtx.beginPath();
    this.highlightCtx.moveTo(0, (ch*(i+1))-this.scrollY);
    this.highlightCtx.lineTo(this.width, (ch*(i+1))-this.scrollY);
    this.highlightCtx.stroke();
};

HMHeatmap.prototype.highlightCol = function(j) {
    var cw = this.browser.settings.cellWidth * this.browser.zoom;
    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);
    this.highlightCtx.beginPath();
    this.highlightCtx.moveTo((cw*j)-this.scrollX, 0);
    this.highlightCtx.lineTo((cw*j)-this.scrollX, this.height);
    this.highlightCtx.stroke();

    this.highlightCtx.beginPath();
    this.highlightCtx.moveTo((cw*(j+1))-this.scrollX, 0);
    this.highlightCtx.lineTo((cw*(j+1))-this.scrollX, this.height);
    this.highlightCtx.stroke();
};

HMHeatmap.prototype.highlightCell = function(x, y) {
    var cw = this.browser.settings.cellWidth * this.browser.zoom;
    var ch = this.browser.settings.cellHeight * this.browser.zoom;

    var j = Math.floor((x + this.scrollX)/cw);
    var i = Math.floor((y + this.scrollY)/ch);

    // Draw highlight box
    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);
    this.highlightCtx.strokeRect((cw*j)-this.scrollX, (ch*i)-this.scrollY, cw, ch);

    // Tooltip
    var placementX = ((cw*j)-this.scrollX) + this.browser.hmTL.left + ch;
    var placementY = ((ch*i)-this.scrollY) + this.browser.hmTL.top + cw;
    this.browser.showHMTooltip(placementX, placementY, i, j);

    // Draw highlight lines
    // Vertical
    this.highlightCtx.beginPath();
    this.highlightCtx.moveTo((cw*j)-this.scrollX, 0);
    this.highlightCtx.lineTo((cw*j)-this.scrollX, this.height);
    this.highlightCtx.stroke();

    this.highlightCtx.beginPath();
    this.highlightCtx.moveTo((cw*(j+1))-this.scrollX, 0);
    this.highlightCtx.lineTo((cw*(j+1))-this.scrollX, this.height);
    this.highlightCtx.stroke();

    // Horizontal
    this.highlightCtx.beginPath();
    this.highlightCtx.moveTo(0, (ch*i)-this.scrollY);
    this.highlightCtx.lineTo(this.width, (ch*i)-this.scrollY);
    this.highlightCtx.stroke();

    this.highlightCtx.beginPath();
    this.highlightCtx.moveTo(0, (ch*(i+1))-this.scrollY);
    this.highlightCtx.lineTo(this.width, (ch*(i+1))-this.scrollY);
    this.highlightCtx.stroke();

    // Notify browser
    this.browser.onHighlightCell(i, j);
};

HMHeatmap.prototype.indices2ranges = function(indices) {
    if (!indices) { return []; }

    var ranges = [];
    var startIdx = 0;
    var currVal = indices[0];
    for (var i = 1; i < indices.length; ++i) {
        currVal += 1;
        if (indices[i] !== currVal) {
            ranges.push({ start: indices[startIdx], end: indices[i-1] });
            startIdx = i;
            currVal = indices[i];
        }
    }

    ranges.push({ start: indices[startIdx], end: indices[indices.length-1] });

    return ranges;
};

HMHeatmap.prototype.searchHighlightCellRanges = function(ctx, indices, clear, zoom) {
    clear = clear != null ? clear : true;
    zoom = zoom != null ? zoom : true;
    var cw = this.browser.settings.cellWidth * (zoom ? this.browser.zoom : 1);
    var ch = this.browser.settings.cellHeight * (zoom ? this.browser.zoom : 1);

    ctx.strokeStyle = this.browser.settings.highlightSearchStroke;
    ctx.globalAlpha = this.browser.settings.highlightSearchStrokeOpacity;

    this.highlightedSearchIndices = indices;

    if (clear) {
        ctx.clearRect(0, 0, this.searchHighlightCanv.width, this.searchHighlightCanv.height);
    }

    var ranges = this.indices2ranges(indices);
    for (var i = 0; i < ranges.length; ++i) {
        var range = ranges[i];

        ctx.beginPath();
        ctx.moveTo(0, (ch*range.start)-this.scrollY);
        ctx.lineTo(ctx.canvas.width, (ch*range.start)-this.scrollY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, (ch*(range.end+1))-this.scrollY);
        ctx.lineTo(ctx.canvas.width, (ch*(range.end+1))-this.scrollY);
        ctx.stroke();
    }
};

HMHeatmap.prototype.searchFilterCellRanges = function(indices) {
    if (indices) {
        this.filteredIndices = indices;
        this.filteredData = [];
        for (var i = 0; i < indices.length; ++i) {
            this.filteredData.push(this.data[indices[i]]);
        }
    } else {
        this.filteredIndices = [];
        this.filteredData = this.data;
    }
};

HMHeatmap.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.canv.width, this.canv.height);
    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);
    this.searchHighlightCtx.clearRect(0, 0, this.searchHighlightCanv.width, this.searchHighlightCanv.height);
};

HMHeatmap.prototype.clearHighlights = function() {
    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);
};

HMHeatmap.prototype.clearSearchHighlights = function() {
    this.highlightedSearchIndices = [];
    this.searchHighlightCtx.clearRect(0, 0, this.searchHighlightCanv.width, this.searchHighlightCanv.height);
};

HMHeatmap.prototype.setScrollX = function(scrollX) {
    this.scrollX = scrollX;
};

HMHeatmap.prototype.setScrollY = function(scrollY) {
    this.scrollY = scrollY;
};

HMHeatmap.prototype.onScrollX = function(scrollX) {
    this.scrollX = scrollX;
    this.redraw();
};

HMHeatmap.prototype.onScrollY = function(scrollY) {
    this.scrollY = scrollY;
    this.redraw();
};

HMHeatmap.prototype.renderFull = function(width, height) {
    var cw = this.browser.settings.cellWidth;
    var ch = this.browser.settings.cellHeight;

    var fullCanv = createCanvas('hmHMFullCanvas', width, height, '');
    var ctx = fullCanv.getContext("2d");

    for(var i = 0; i < this.filteredData.length; ++i) {
        for(var j = 0; j < this.numCols; ++j) {
            ctx.fillStyle= this.browser.settings.getColorForHMVal(this.filteredData[i][j]);
            ctx.fillRect((cw*j)-this.scrollX, (ch*i)-this.scrollY, cw, ch);
        }
    }
    ctx.stroke();
    this.searchHighlightCellRanges(ctx, this.highlightedSearchIndices, false, false);
    return fullCanv;
};

HMHeatmap.prototype.render = function() {
    var cw = this.browser.settings.cellWidth * this.browser.zoom;
    var ch = this.browser.settings.cellHeight * this.browser.zoom;
    for(var i = 0; i < this.filteredData.length; ++i) {
        for(var j = 0; j < this.numCols; ++j) {
            if (this.browser.inVisibleArea(i, j)) {
                this.ctx.fillStyle= this.browser.settings.getColorForHMVal(this.filteredData[i][j]);
                this.ctx.fillRect((cw*j)-this.scrollX, (ch*i)-this.scrollY, cw, ch);
            }
        }
    }
    this.ctx.stroke();
    this.searchHighlightCellRanges(this.searchHighlightCtx, this.highlightedSearchIndices);
};

HMHeatmap.prototype.redraw = function() {
    this.clear();
    this.render();
};
