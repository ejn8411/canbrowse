function HMRowHeaders(hmBr, width, height, rowHeaders) {
    this.browser = hmBr;
    this.width = width;
    this.height = height;
    this.rowHeaders = rowHeaders;
    this.scrollY = 0;
    this.highlightedSearchIndices = [];
    this.headerWidths = Array.isArray(rowHeaders[0])? Array.apply(null, Array(rowHeaders[0].length)).map(Number.prototype.valueOf,0) : [];
    this.approxHeaderHeights = this.browser.settings.rowFontSizePt * 1.5;
}

HMRowHeaders.prototype.init = function() {
    var hmBr = this;
    this.rowHeaderCanv = createCanvas('hmRowHeadCanvas', 0, this.height, 'position: absolute; left: 0');
    this.highlightCanv = createCanvas('hmRowHeadHighlightCanvas', 0, this.height, 'position: absolute; left: 0');
    this.searchHighlightCanv = createCanvas('hmRowHeadSearchHighlightCanvas', 0, this.height, 'position: absolute; left: 0');
    this.browser.parentDiv.appendChild(this.rowHeaderCanv);
    this.browser.parentDiv.appendChild(this.highlightCanv);
    this.browser.parentDiv.appendChild(this.searchHighlightCanv);
    this.rowHeaderCtx = this.rowHeaderCanv.getContext("2d");
    this.rowHeaderCtx.font = this.browser.settings.rowFontSizePt + 'pt ' + this.browser.settings.rowFontFamily;
    this.highlightCtx = this.highlightCanv.getContext("2d");
    this.searchHighlightCtx = this.searchHighlightCanv.getContext("2d");
    this.width = this.getMaxWidth(this.rowHeaders, this.rowHeaderCtx);
    this.rowHeaderCanv.width = this.width;
    this.highlightCanv.width = this.width;
    this.searchHighlightCanv.width = this.width;
    this.rowHeaderCtx.font = this.browser.settings.rowFontSizePt + 'pt ' + this.browser.settings.rowFontFamily;
    this.highlightCtx.strokeStyle = this.browser.settings.highlightCellColor;
    this.highlightCtx.lineWidth = this.browser.settings.highlightCellLineWidth;
    this.searchHighlightCtx.fillStyle = this.browser.settings.highlightSearchFill;
    this.searchHighlightCtx.globalAlpha = this.browser.settings.highlightSearchOpacity;
};

HMRowHeaders.prototype.getMaxWidth = function(textMat, ctx) {
    var w = 0;
    for(var i = 0; i < textMat.length; ++i) {
        var colWidths = 0;
        if (Array.isArray(textMat[i])) {
            for(var j = 0; j < textMat[i].length; ++j) {
                var curr = ctx.measureText(textMat[i][j]).width + (2*this.browser.settings.labelTextPadding);
                this.headerWidths[j] = Math.max(curr, this.headerWidths[j]);
                colWidths += curr;
            }
        } else {
            colWidths = ctx.measureText(textMat[i]).width + (2*this.browser.settings.labelTextPadding);
        }
        w = Math.max(colWidths, w);
    }
    return w;
};

HMRowHeaders.prototype.render = function() {
    var ch = this.browser.settings.cellHeight * this.browser.zoom;

    if (this.approxHeaderHeights <= ch) {
        this.rowHeaderCtx.textBaseline = 'middle';
        for(var i = 0; i < this.rowHeaders.length; ++i) {
            if (Array.isArray(this.rowHeaders[i])) {
                this.rowHeaderCtx.textAlign = 'center';
                var currWidth = 0;
                // Render the first col then loop through any remaining
                this.rowHeaderCtx.fillText(this.rowHeaders[i][0], this.browser.settings.labelTextPadding + (this.headerWidths[0]/2), i*ch + (ch/2) + this.browser.hmTL.top - this.scrollY);
                for(var j = 1; j < this.rowHeaders[i].length; ++j) {
                    currWidth += this.headerWidths[j-1];
                    this.rowHeaderCtx.fillText(this.rowHeaders[i][j], (currWidth) + (this.headerWidths[j]/2), i*ch + (ch/2) + this.browser.hmTL.top - this.scrollY);
                }
            } else {
                this.rowHeaderCtx.fillText(this.rowHeaders[i], this.browser.settings.labelTextPadding, i*ch + (ch/2) + this.browser.hmTL.top - this.scrollY);
            }
        }
    }
    this.searchHighlightHeaders(this.highlightedSearchIndices);
};

HMRowHeaders.prototype.highlightHeader = function(i, j) {
    var cw = this.browser.settings.cellWidth * this.browser.zoom;
    var ch = this.browser.settings.cellHeight * this.browser.zoom;

    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);

    // Horizontal
    this.highlightCtx.beginPath();
    this.highlightCtx.moveTo(0, (ch*i) + this.browser.hmTL.top - this.scrollY);
    this.highlightCtx.lineTo(this.width, (ch*i) + this.browser.hmTL.top - this.scrollY);
    this.highlightCtx.stroke();

    this.highlightCtx.beginPath();
    this.highlightCtx.moveTo(0, (ch*(i+1)) + this.browser.hmTL.top - this.scrollY);
    this.highlightCtx.lineTo(this.width, (ch*(i+1)) + this.browser.hmTL.top - this.scrollY);
    this.highlightCtx.stroke();
};

HMRowHeaders.prototype.search = function(query) {
    if (!query) { return []; }

    query = query.toLowerCase();
    var indices = [];
    for (var i = 0; i < this.rowHeaders.length; ++i) {
        if (Array.isArray(this.rowHeaders[i])) {
            for(var j = 0; j < this.rowHeaders[i].length; ++j) {
                if (this.rowHeaders[i][j].toLowerCase().indexOf(query) > -1) {
                  indices.push(i);
                  break;
                }
            }
        } else {
            if (this.rowHeaders[i].toLowerCase().indexOf(query) > -1) {
              indices.push(i);
            }
        }
    }
    return indices;
};

HMRowHeaders.prototype.searchHighlightHeaders = function(indices) {
    var cw = this.browser.settings.cellWidth * this.browser.zoom;
    var ch = this.browser.settings.cellHeight * this.browser.zoom;

    this.highlightedSearchIndices = indices;

    this.searchHighlightCtx.clearRect(0, 0, this.searchHighlightCanv.width, this.searchHighlightCanv.height);

    for (var i = 0; i < indices.length; ++i) {
        var idx = indices[i];
        this.searchHighlightCtx.fillRect(0, (ch*idx) + this.browser.hmTL.top - this.scrollY, this.width, ch);
    }
};

HMRowHeaders.prototype.setScrollY = function(scrollY) {
    this.scrollY = scrollY;
};

HMRowHeaders.prototype.clear = function() {
    this.rowHeaderCtx.clearRect(0, 0, this.rowHeaderCanv.width, this.rowHeaderCanv.height);
    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);
    this.searchHighlightCtx.clearRect(0, 0, this.searchHighlightCanv.width, this.searchHighlightCanv.height);
};

HMRowHeaders.prototype.clearHighlights = function() {
    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);
};

HMRowHeaders.prototype.redraw = function() {
    this.clear();
    this.render();
};

HMRowHeaders.prototype.setHeight = function(height) {
    this.height = height;
    this.rowHeaderCanv.height = height;
    this.highlightCanv.height = height;
    this.searchHighlightCanv.height = height;
    this.rowHeaderCtx.font = this.browser.settings.rowFontSizePt + 'pt ' + this.browser.settings.rowFontFamily;
    this.highlightCtx.strokeStyle = this.browser.settings.highlightCellColor;
    this.highlightCtx.lineWidth = this.browser.settings.highlightCellLineWidth;
    this.searchHighlightCtx.fillStyle = this.browser.settings.highlightSearchFill;
    this.searchHighlightCtx.globalAlpha = this.browser.settings.highlightSearchOpacity;
};

HMRowHeaders.prototype.onScrollX = function(scrollX) {
    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);
};

HMRowHeaders.prototype.onScrollY = function(scrollY) {
    this.scrollY = scrollY;
    this.redraw();
};

HMRowHeaders.prototype.onHighlightCell = function(i, j) {
    this.highlightHeader(i,j);
};
