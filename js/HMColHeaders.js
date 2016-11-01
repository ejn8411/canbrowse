function HMColHeaders(hmBr, width, height, colHeaders) {
    this.browser = hmBr;
    this.height = height;
    this.width = width;
    this.colHeaders = colHeaders;
    this.scrollX = 0;
    this.headerHeights = Array.isArray(colHeaders[0]) ? Array.apply(null, Array(colHeaders[0].length)).map(Number.prototype.valueOf,0) : [];
    this.approxHeaderWidth = this.browser.settings.colFontSizePt * 1.5;
}

HMColHeaders.prototype.init = function() {
    var hmBr = this;
    this.colHeaderCanv = createCanvas('hmColHeadCanvas', this.width, 0, 'position: absolute; top: 0');
    this.highlightCanv = createCanvas('hmColHeadHighlightCanvas', this.width, 0, 'position: absolute; top: 0');
    this.browser.parentDiv.appendChild(this.colHeaderCanv);
    this.browser.parentDiv.appendChild(this.highlightCanv);
    this.colHeaderCtx = this.colHeaderCanv.getContext("2d");
    this.highlightCtx = this.highlightCanv.getContext("2d");
    this.height = this.getMaxWidth(this.colHeaders, this.colHeaderCtx);
    this.colHeaderCanv.height = this.height;
    this.highlightCanv.height = this.height;
    this.highlightCtx.strokeStyle = this.browser.settings.highlightCellColor;
    this.highlightCtx.lineWidth = this.browser.settings.highlightCellLineWidth;
    this.colHeaderCtx.font = this.browser.settings.colFontSizePt + 'pt ' + this.browser.settings.colFontFamily;
};

HMColHeaders.prototype.getMaxWidth = function(textMat, ctx) {
    var w = 0;
    for(var i = 0; i < textMat.length; ++i) {
        var rowHeights = 0;
        if (Array.isArray(textMat[i])) {
            for(var j = 0; j < textMat[i].length; ++j) {
                var curr = ctx.measureText(textMat[i][j]).width + (2*this.browser.settings.labelTextPadding);
                this.headerHeights[j] = Math.max(curr, this.headerHeights[j]);
                rowHeights += curr;
            }
        } else {
            rowHeights = ctx.measureText(textMat[i]).width + (2*this.browser.settings.labelTextPadding);
        }
        w = Math.max(rowHeights, w);
    }
    return w;
};

HMColHeaders.prototype.inView = function(i) {
  var cw = this.browser.settings.cellWidth * this.browser.zoom;
  var elem = {left: cw*i, right: cw*(i+1) };
  var view = {left: this.scrollX, right: this.browser.heatmap.width + this.scrollX};
  return !( elem.right < view.left || elem.left > view.right );
};

HMColHeaders.prototype.render = function() {
    var cw = this.browser.settings.cellWidth * this.browser.zoom;

    if (this.approxHeaderWidth <= cw) {
        // Somewhat hard to understand, but we have to esentially rotate the whole context/coord system
        // for every label we are rendering in order to get rotated text
        for(var i = 0; i < this.colHeaders.length; ++i) {
            if (!this.inView(i)) continue;

            if (Array.isArray(this.colHeaders[i])) {
                var currHeight = 0;
                this.colHeaderCtx.save();
                this.colHeaderCtx.translate(i*cw + (cw/2) + this.browser.hmTL.left - this.scrollX, this.headerHeights[0]/2);
                this.colHeaderCtx.rotate(this.browser.settings.colTextRotation);
                this.colHeaderCtx.textAlign = 'center';
                this.colHeaderCtx.textBaseline = 'middle';
                this.colHeaderCtx.fillText(this.colHeaders[i][0], this.browser.settings.labelTextPadding/2, 0);
                this.colHeaderCtx.restore();
                for(var j = 1; j < this.colHeaders[i].length; ++j) {
                    currHeight += this.headerHeights[i][j-1];
                    this.colHeaderCtx.save();
                    this.colHeaderCtx.translate(i*cw + (cw/2) + this.browser.hmTL.left - this.scrollX, currHeight + (this.headerHeights[j]/2));
                    this.colHeaderCtx.rotate(this.browser.settings.colTextRotation);
                    this.colHeaderCtx.textAlign = 'center';
                    this.colHeaderCtx.textBaseline = 'middle';
                    this.colHeaderCtx.fillText(this.colHeaders[i][j], this.browser.settings.labelTextPadding/2, 0);
                    this.colHeaderCtx.restore();
                }
            } else {
                this.colHeaderCtx.save();
                this.colHeaderCtx.translate(i*cw + (cw/2) + this.browser.hmTL.left - this.scrollX, this.height/2);
                this.colHeaderCtx.rotate(this.browser.settings.colTextRotation);
                this.colHeaderCtx.textAlign = 'center';
                this.colHeaderCtx.textBaseline = 'middle';
                this.colHeaderCtx.fillText(this.colHeaders[i], this.browser.settings.labelTextPadding/2, 0);
                this.colHeaderCtx.restore();
            }
        }
    }
};

HMColHeaders.prototype.setScrollX = function(scrollX) {
    this.scrollX = scrollX;
};

HMColHeaders.prototype.clear = function() {
    this.colHeaderCtx.clearRect(0, 0, this.colHeaderCanv.width, this.colHeaderCanv.height);
    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);
};

HMColHeaders.prototype.clearHighlights = function() {
    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);
};

HMColHeaders.prototype.redraw = function() {
    this.clear();
    this.render();
};

HMColHeaders.prototype.highlightHeader = function(i, j) {
    var cw = this.browser.settings.cellWidth * this.browser.zoom;
    var ch = this.browser.settings.cellHeight * this.browser.zoom;

    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);

    // Draw highlight lines
    // Vertical
    this.highlightCtx.beginPath();
    this.highlightCtx.moveTo((cw*j) + this.browser.hmTL.left - this.scrollX, 0);
    this.highlightCtx.lineTo((cw*j) + this.browser.hmTL.left - this.scrollX, this.height);
    this.highlightCtx.stroke();

    this.highlightCtx.beginPath();
    this.highlightCtx.moveTo((cw*(j+1)) + this.browser.hmTL.left - this.scrollX, 0);
    this.highlightCtx.lineTo((cw*(j+1)) + this.browser.hmTL.left - this.scrollX, this.height);
    this.highlightCtx.stroke();
};

HMColHeaders.prototype.setWidth = function(width) {
    this.width = width;
    this.colHeaderCanv.width = width;
    this.highlightCanv.width = width;
    this.highlightCtx.strokeStyle = this.browser.settings.highlightCellColor;
    this.highlightCtx.lineWidth = this.browser.settings.highlightCellLineWidth;
    this.colHeaderCtx.font = this.browser.settings.colFontSizePt + 'pt ' + this.browser.settings.colFontFamily;
};

HMColHeaders.prototype.onScrollX = function(scrollX) {
    this.scrollX = scrollX;
    this.redraw();
};

HMColHeaders.prototype.onScrollY = function(scrollY) {
    this.highlightCtx.clearRect(0, 0, this.highlightCanv.width, this.highlightCanv.height);
};

HMColHeaders.prototype.onHighlightCell = function(i, j) {
    this.highlightHeader(i,j);
};
