function createCanvas(id, width, height, style) {
    var canv = document.createElement('canvas');
    canv.id = id;
    canv.width = width;
    canv.height = height;
    canv.style.cssText = style || '';
    return canv;
}

function getCoveragePerc(maxWidth, actWidth) {
    return maxWidth/actWidth;
}

function HMBrowser(parentDiv, tooltipDiv, rowHeaders, rowHeaderTitles, colHeaders, data, settings) {
    this.parentDiv = parentDiv;
    this.tooltipDiv = tooltipDiv;
    this.maxWidth = parentDiv.clientWidth;
    this.width = this.maxWidth;
    this.maxHeight = parentDiv.clientHeight;
    this.height = this.maxHeight;
    this.rowHeaders = rowHeaders;
    this.rowHeaderTitles = rowHeaderTitles;
    this.numRows = rowHeaders.length;
    this.colHeaders = colHeaders;
    this.numCols = colHeaders.length;
    this.data = data;
    this.zoom = 1.0;
    this.scrollX = 0;
    this.scrollY = 0;
    this.scrollingX = false;
    this.scrollingY = false;
    this.needsHorizScroll = false;
    this.needsVertScroll = false;
    this.currSearchQuery = '';
    this.searchProvider = new HMSearchProvider();
    this.settings = settings || { labelTextPadding: 4,
                                  cellWidth: 20,
                                  cellHeight: 20,
                                  vertScrollWidth: 10,
                                  horizScrollHeight: 10,
                                  rowFontSizePt: 7.5,
                                  rowFontFamily: 'sans-serif',
                                  rowTitleFontSizePt: 8.5,
                                  rowTitleFontFamily: 'sans-serif',
                                  colFontSizePt: 7.5,
                                  colFontFamily: 'sans-serif',
                                  colTextRotation: -Math.PI/4,
                                  defaultScrollerFill: '#CCC',
                                  highlightSearchStroke: '#333',
                                  highlightSearchStrokeOpacity: 1.0,
                                  highlightSearchFill: '#33CCFF',
                                  highlightSearchOpacity: 0.3,
                                  highlightScrollerFill: '#999',
                                  highlightCellColor: '#CC0000',
                                  highlightCellLineWidth: 1,
                                  hiddenRowHeaderInds: {},
                                  renderHMToolTip: function() {},
                                  renderRHToolTip: function() {},
                                  getColorForHMVal: function(value) {
                                    return 'rgb(' + (value % 256) + ',' + (value % 256) + ',' + (value % 256)  + ')';
                                  },
                                  onRowHeadClick: function() {}
                                };
}

HMBrowser.prototype.init = function() {
    var hmBr = this;

    this.colHeads = new HMColHeaders(this, this.width, this.settings.cellHeight, this.colHeaders);
    this.rowHeads = new HMRowHeaders(this, this.settings.cellWidth, this.height, this.rowHeaders, this.rowHeaderTitles);

    // Must init here in order to get the correct sizes for the text in the headers
    this.colHeads.init();
    this.rowHeads.init();

    this.hmTL = { top: this.colHeads.height, left: this.rowHeads.width };

    this.width = (this.numCols * this.settings.cellWidth * this.zoom) + this.hmTL.left;
    if (this.width > this.maxWidth) {
        this.needsHorizScroll = true;
        this.width = this.maxWidth;
    }

    this.height = (this.numRows * this.settings.cellHeight * this.zoom) + this.hmTL.top;
    if (this.height > this.maxHeight) {
        this.needsVertScroll = true;
        this.height = this.maxHeight;
    }

    if (!this.needsHorizScroll) {
        this.width = this.width + (this.needsVertScroll ? this.settings.vertScrollWidth : 0);
    }

    if (!this.needsVertScroll) {
        this.height = this.height + (this.needsHorizScroll ? this.settings.horizScrollHeight : 0);
    }

    var vertScrollWidth = this.needsVertScroll ? this.settings.vertScrollWidth : 0;
    var vertScrollHeight = this.needsHorizScroll ? (this.height - this.colHeads.height - this.settings.horizScrollHeight) : this.height - this.colHeads.height;
    this.vertScroll = new HMVertScrollBar(this, vertScrollWidth, vertScrollHeight);

    var horizScrollHeight = this.needsHorizScroll ? this.settings.horizScrollHeight : 0;
    var horizScrollWidth = this.needsVertScroll ? (this.width - this.rowHeads.width - this.settings.vertScrollWidth) : this.width - this.rowHeads.width;
    this.horizScroll = new HMHorizScrollBar(this, horizScrollWidth, horizScrollHeight);

    this.colHeads.setWidth(this.width - vertScrollWidth);
    this.rowHeads.setHeight(this.height - horizScrollHeight);

    var textOvrCanv = createCanvas('hmTextOverflowCover1', this.hmTL.left, this.hmTL.top, 'position: absolute; top: 0; left: 0;');
    this.parentDiv.appendChild(textOvrCanv);
    var textOvrCanv = createCanvas('hmTextOverflowCover2', this.hmTL.left, this.horizScroll.height, 'position: absolute; top: ' + (this.height - horizScrollHeight) + 'px; left: 0;');
    this.parentDiv.appendChild(textOvrCanv);
    var textOvrCanv = createCanvas('hmTextOverflowCover3', this.vertScroll.width, this.hmTL.top, 'position: absolute; top: 0; left: ' + (this.width - vertScrollWidth) + 'px;');
    this.parentDiv.appendChild(textOvrCanv);

    this.heatmap = new HMHeatmap(this, this.width - this.rowHeads.width - this.vertScroll.width, this.height - this.colHeads.height - this.horizScroll.height, this.data, this.numRows, this.numCols, this.hmTL);

    // Init the other components
    this.heatmap.init();
    this.vertScroll.init();
    this.horizScroll.init();

    window.onmousemove = function(e) {
        var evt = e || event;
        hmBr.vertScroll.onMouseMove(evt);
        hmBr.horizScroll.onMouseMove(evt);
    };
    window.onmouseup = function(e) {
        var evt = e || event;
        hmBr.vertScroll.onMouseUp(evt);
        hmBr.horizScroll.onMouseUp(evt);
    };
    this.parentDiv.onwheel = function(e) {
        var evt = e || event;

        hmBr.hideTooltip();
        if (evt.shiftKey) {
            hmBr.horizScroll.onWheel(evt);
        } else {
            hmBr.vertScroll.onWheel(evt);
        }
    };
};

HMBrowser.prototype.getHeatmapHeight = function() {
    var extra = this.needsHorizScroll ? this.settings.horizScrollHeight : 0;
    return this.maxHeight - this.hmTL.top - extra;
};

HMBrowser.prototype.getHeatmapWidth = function() {
    var extra = this.needsVertScroll ? this.settings.vertScrollWidth : 0;
    return this.maxWidth - this.hmTL.left - extra;
};

HMBrowser.prototype.showHMTooltip = function (placementX, placementY, i, j) {
    var cw = this.settings.cellWidth * this.zoom;
    var ch = this.settings.cellHeight * this.zoom;
    if (placementX + this.tooltipDiv.offsetWidth > this.maxWidth) {
        this.tooltipDiv.style.top = placementY - this.tooltipDiv.offsetHeight - ch + 'px';
        this.tooltipDiv.style.left = placementX - this.tooltipDiv.offsetWidth - cw + 'px';
    } else {
        this.tooltipDiv.style.top = placementY + 'px';
        this.tooltipDiv.style.left = placementX + 'px';
    }
    this.settings.renderHMToolTip(i, j, this.rowHeads.filteredRowHeaders, this.colHeads.colHeaders, this.heatmap.filteredData);
    this.tooltipDiv.style.display = 'block';
}

HMBrowser.prototype.showRHTooltip = function (placementX, placementY, i) {
    var cw = this.settings.cellWidth * this.zoom;
    var ch = this.settings.cellHeight * this.zoom;
    if (placementX + this.tooltipDiv.offsetWidth > this.maxWidth) {
        this.tooltipDiv.style.top = placementY - this.tooltipDiv.offsetHeight - ch + 'px';
        this.tooltipDiv.style.left = placementX - this.tooltipDiv.offsetWidth - cw + 'px';
    } else {
        this.tooltipDiv.style.top = placementY + 'px';
        this.tooltipDiv.style.left = placementX + 'px';
    }
    this.settings.renderRHToolTip(i, this.rowHeads.filteredRowHeaders, this.heatmap.filteredData);
    this.tooltipDiv.style.display = 'block';
}

HMBrowser.prototype.hideTooltip = function () {
    this.tooltipDiv.style.display = 'none';
}

HMBrowser.prototype.onZoom = function() {
    this.scrollX = this.scrollY = 0;
    this.needsVertScroll = this.needsHorizScroll = false;

    this.vertScroll.setScrollY(0);
    this.horizScroll.setScrollX(0);
    this.colHeads.setScrollX(0);
    this.rowHeads.setScrollY(0);
    this.heatmap.setScrollX(0);
    this.heatmap.setScrollY(0);

    this.width = (this.numCols * this.settings.cellWidth * this.zoom) + this.hmTL.left;
    if (this.width > this.maxWidth) {
        this.needsHorizScroll = true;
        this.width = this.maxWidth;
    }

    this.height = ((this.rowHeads.filteredRowHeaders.length) * this.settings.cellHeight * this.zoom) + this.hmTL.top;
    if (this.height > this.maxHeight) {
        this.needsVertScroll = true;
        this.height = this.maxHeight;
    }

    if (!this.needsHorizScroll) {
        this.width = this.width + (this.needsVertScroll ? this.settings.vertScrollWidth : 0);
    }

    if (!this.needsVertScroll) {
        this.height = this.height + (this.needsHorizScroll ? this.settings.horizScrollHeight : 0);
    }

    var vertScrollWidth = this.needsVertScroll ? this.settings.vertScrollWidth : 0;
    var vertScrollHeight = this.needsHorizScroll ? (this.height - this.colHeads.height - this.settings.horizScrollHeight) : this.height - this.colHeads.height;
    this.vertScroll.setWidth(vertScrollWidth);
    this.vertScroll.setHeight(vertScrollHeight);

    var horizScrollHeight = this.needsHorizScroll ? this.settings.horizScrollHeight : 0;
    var horizScrollWidth = this.needsVertScroll ? (this.width - this.rowHeads.width - this.settings.vertScrollWidth) : this.width - this.rowHeads.width;
    this.horizScroll.setWidth(horizScrollWidth);
    this.horizScroll.setHeight(horizScrollHeight);

    this.colHeads.setWidth(this.width - vertScrollWidth);
    this.rowHeads.setHeight(this.height - horizScrollHeight);

    var cover2 = document.getElementById('hmTextOverflowCover2');
    cover2.height = horizScrollHeight;
    cover2.style.top = (this.height - horizScrollHeight);
    var cover3 = document.getElementById('hmTextOverflowCover3');
    cover3.width = vertScrollWidth;
    cover3.style.top = (this.width - vertScrollWidth);

    this.heatmap.setWidth(this.width - this.rowHeads.width - this.vertScroll.width);
    this.heatmap.setHeight(this.height - this.colHeads.height - this.horizScroll.height);
};

HMBrowser.prototype.zoomIn = function() {
    this.zoom += 0.02;
    this.onZoom();
    this.redraw();
};

HMBrowser.prototype.zoomOut = function() {
    this.zoom -= 0.02;
    this.onZoom();
    this.redraw();
};

HMBrowser.prototype.zoomExact = function(zoom) {
    this.zoom = zoom;
    this.onZoom();
    this.redraw();
};

HMBrowser.prototype.searchRows = function(query) {
    this.currSearchQuery = query;
    var indices = this.searchProvider.search(this.rowHeads.filteredRowHeaders, query);
    this.rowHeads.currSearchIndex = -1;
    this.rowHeads.searchHighlightHeaders(indices);
    this.heatmap.searchHighlightCellRanges(indices);
};

HMBrowser.prototype.searchNext = function() {
    if (!this.rowHeads.highlightedSearchIndices.length) return;

    this.rowHeads.searchNext();

    // Update components
    this.scrollY = this.rowHeads.scrollY;
    this.heatmap.onScrollY(this.scrollY);
    this.colHeads.onScrollY(this.scrollY);
    this.rowHeads.onScrollY(this.scrollY);

    // Convert to scroll in terms of scrollbar
    var wholeMapHeight = this.settings.cellHeight * this.zoom * this.rowHeads.filteredRowHeaders.length;
    var convRatio = this.vertScroll.height/wholeMapHeight;
    this.vertScroll.setScrollY(this.scrollY * convRatio);
};

HMBrowser.prototype.searchPrev = function() {
    if (!this.rowHeads.highlightedSearchIndices.length) return;

    this.rowHeads.searchPrev();

    // Update components
    this.scrollY = this.rowHeads.scrollY;
    this.heatmap.onScrollY(this.scrollY);
    this.colHeads.onScrollY(this.scrollY);
    this.rowHeads.onScrollY(this.scrollY);

    // Convert to scroll in terms of scrollbar
    var wholeMapHeight = this.settings.cellHeight * this.zoom * this.rowHeads.filteredRowHeaders.length;
    var convRatio = this.vertScroll.height/wholeMapHeight;
    this.vertScroll.setScrollY(this.scrollY * convRatio);
};

HMBrowser.prototype.filterRows = function(query) {
    var indices = this.searchProvider.search(this.rowHeaders, query);
    this.rowHeads.searchFilterHeaders(indices);
    this.heatmap.searchFilterCellRanges(indices);
    this.searchRows(this.currSearchQuery);
    this.onZoom();
    this.redraw();
};

HMBrowser.prototype.onMouseOut = function() {
    this.hideTooltip();
    this.colHeads.clearHighlights();
    this.rowHeads.clearHighlights();
};

HMBrowser.prototype.onScrollY = function(scrollY) {
    // Convert to scroll in terms of heatmap
    var wholeMapHeight = this.settings.cellHeight * this.zoom * this.rowHeads.filteredRowHeaders.length;
    var convRatio = wholeMapHeight/this.vertScroll.height;
    scrollY = scrollY * convRatio;

    // Update components
    this.scrollY = scrollY;
    this.heatmap.onScrollY(scrollY);
    this.colHeads.onScrollY(scrollY);
    this.rowHeads.onScrollY(scrollY);
};

HMBrowser.prototype.onScrollX = function(scrollX) {
    // Convert to scroll in terms of heatmap
    var wholeMapWidth = this.settings.cellWidth * this.zoom * this.numCols;
    var convRatio = wholeMapWidth/this.horizScroll.width;
    scrollX = scrollX * convRatio;

    // Update components
    this.scrollX = scrollX;
    this.heatmap.onScrollX(scrollX);
    this.colHeads.onScrollX(scrollX);
    this.rowHeads.onScrollX(scrollX);
};

HMBrowser.prototype.onHighlightCell = function(i, j) {
    this.colHeads.onHighlightCell(i,j);
    this.rowHeads.onHighlightCell(i,j);
};

HMBrowser.prototype.inVisibleArea = function(i, j) {
    var cw = this.settings.cellWidth * this.zoom;
    var ch = this.settings.cellHeight * this.zoom;
    var box = { top: i * ch, left: j * cw, right: j * cw + cw, bottom: i * ch + ch };
    var boxWin = { top: this.scrollY, left: this.scrollX, right: this.scrollX + this.width, bottom: this.scrollY + this.height };
    return  !(box.right < boxWin.left || box.left > boxWin.right || box.bottom < boxWin.top || box.top > boxWin.bottom);
}

HMBrowser.prototype.redraw = function() {
    this.colHeads.redraw();
    this.rowHeads.redraw();
    this.heatmap.redraw();
    this.vertScroll.redraw();
    this.horizScroll.redraw();
};

HMBrowser.prototype.render = function() {
    this.colHeads.render();
    this.rowHeads.render();
    this.heatmap.render();
    this.vertScroll.render();
    this.horizScroll.render();
};
