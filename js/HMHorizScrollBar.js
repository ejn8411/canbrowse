function HMHorizScrollBar(hmBr, width, height) {
    this.browser = hmBr;
    this.scrollX = 0;
    this.width = width;
    this.height = height;
    this.scrolling = false;
    this.startScrollX = 0;
    this.startScrollOff = 0;
    this.scrollerWidth = 0;
    this.scrollerFill = hmBr.settings.defaultScrollerFill;
    this.scrollerHighlightFill = hmBr.settings.highlightScrollerFill;
    this.scrollerDefaultFill = hmBr.settings.defaultScrollerFill;
}

HMHorizScrollBar.prototype.init = function() {
    var hmHorizScroll = this;
    this.scrollXCanv = createCanvas('hmScrollXCanvas', this.width, this.height, 'position: absolute; top: ' + (this.browser.height - this.height) + 'px; left: ' + this.browser.hmTL.left + 'px');
    this.browser.parentDiv.appendChild(this.scrollXCanv);
    this.scrollXCtx = this.scrollXCanv.getContext("2d");
    this.scrollXCanv.onmousedown = function(e) {
        var evt = e || event;
        hmHorizScroll.scrolling = true;
        hmHorizScroll.startScrollX = hmHorizScroll.scrollX;
        hmHorizScroll.startScrollOff = evt.offsetX;
    };
    this.scrollXCanv.onmousemove = function(e) {
        var evt = e || event;
        if (hmHorizScroll.onScroller(evt)) {
            if (hmHorizScroll.scrollerFill !== hmHorizScroll.scrollerHighlightFill) {
                hmHorizScroll.scrollerFill = hmHorizScroll.scrollerHighlightFill;
                hmHorizScroll.redraw();
            }
        } else {
            if (hmHorizScroll.scrollerFill !== hmHorizScroll.scrollerDefaultFill) {
                hmHorizScroll.scrollerFill = hmHorizScroll.scrollerDefaultFill;
                hmHorizScroll.redraw();
            }
        }
    };
    this.scrollXCanv.onmouseout = function(e) {
        if (hmHorizScroll.scrollerFill !== hmHorizScroll.scrollerDefaultFill) {
            hmHorizScroll.scrollerFill = hmHorizScroll.scrollerDefaultFill;
            hmHorizScroll.redraw();
        }
    };
};

HMHorizScrollBar.prototype.setWidth = function(width) {
    this.width = width;
    this.scrollXCanv.width = width;
};

HMHorizScrollBar.prototype.setHeight = function(height) {
    this.height = height;
    this.scrollXCanv.height = height;
    this.scrollXCanv.style.top = (this.browser.height - this.height) + 'px';
};

HMHorizScrollBar.prototype.setScrollX = function(scrollX) {
    this.scrollX = scrollX;
};

HMHorizScrollBar.prototype.onScroller = function(evt) {
    return evt.offsetX > this.scrollX && evt.offsetX < this.scrollX + this.scrollerWidth;
};

HMHorizScrollBar.prototype.onMouseMove = function(evt) {
    if (this.scrolling) {
        var diff = evt.offsetX - this.startScrollOff;
        this.scrollX = (this.startScrollX + diff < 0)? 0 : (this.startScrollX + diff > this.width - this.scrollerWidth)? this.width - this.scrollerWidth : this.startScrollX + diff;
        this.scrollerFill = this.scrollerHighlightFill;
        this.redraw();
        this.browser.onScrollX(this.scrollX);
    }
};

HMHorizScrollBar.prototype.onMouseUp = function(evt) {
    this.scrolling = false;
    if (this.scrollerFill !== this.scrollerDefaultFill) {
        this.scrollerFill = this.scrollerDefaultFill;
        this.redraw();
    }
};

HMHorizScrollBar.prototype.onWheel = function(evt) {
    var diff = evt.deltaY;
    this.scrollX = (this.scrollX + diff < 0)? 0 : (this.scrollX + diff > this.width - this.scrollerWidth)? this.width - this.scrollerWidth : this.scrollX + diff;
    this.redraw();
    this.browser.onScrollX(this.scrollX);
};

HMHorizScrollBar.prototype.hideScroll = function() {
    this.scrollXCanv.className += ' hidden';
};

HMHorizScrollBar.prototype.showScroll = function() {
    this.scrollXCanv.className = this.scrollXCanv.className.replace( /(?:^|\s)hidden(?!\S)/g , '' );
};

HMHorizScrollBar.prototype.clear = function() {
    this.scrollXCtx.clearRect(0, 0, this.scrollXCanv.width, this.scrollXCanv.height);
};

HMHorizScrollBar.prototype.redraw = function() {
    this.clear();
    this.render();
};

HMHorizScrollBar.prototype.render = function() {
    var hmWidth = this.browser.getHeatmapWidth();
    var perc = getCoveragePerc(hmWidth, this.browser.numCols * this.browser.settings.cellWidth * this.browser.zoom);
    this.scrollerWidth = perc * this.width;
    this.scrollXCtx.fillStyle = this.scrollerFill;
    this.scrollXCtx.fillRect(this.scrollX, 0, this.scrollerWidth, this.height);
    this.scrollXCtx.stroke();
};
