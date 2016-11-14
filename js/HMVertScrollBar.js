function HMVertScrollBar(hmBr, width, height) {
    this.browser = hmBr;
    this.scrollY = 0;
    this.width = width;
    this.height = height;
    this.scrolling = false;
    this.startScrollY = 0;
    this.startScrollOff = 0;
    this.scrollerHeight = 0;
    this.scrollerFill = hmBr.settings.defaultScrollerFill;
    this.scrollerHighlightFill = hmBr.settings.highlightScrollerFill;
    this.scrollerDefaultFill = hmBr.settings.defaultScrollerFill;
}

HMVertScrollBar.prototype.init = function() {
    var hmVertScroll = this;
    this.scrollYCanv = createCanvas('hmScrollYCanvas', this.width, this.height, 'position: absolute; top: ' + this.browser.hmTL.top + 'px; left: ' + (this.browser.width - this.width) + 'px;');
    this.browser.parentDiv.appendChild(this.scrollYCanv);
    this.scrollYCtx = this.scrollYCanv.getContext("2d");
    this.scrollYCanv.onmousedown = function(e) {
        var evt = e || event;
        evt.preventDefault();
        hmVertScroll.scrolling = true;
        hmVertScroll.startScrollY = hmVertScroll.scrollY;
        hmVertScroll.startScrollOff = evt.offsetY;
    };
    this.scrollYCanv.onmousemove = function(e) {
        var evt = e || event;
        evt.preventDefault();
        if (hmVertScroll.onScroller(evt)) {
            if (hmVertScroll.scrollerFill !== hmVertScroll.scrollerHighlightFill) {
                hmVertScroll.scrollerFill = hmVertScroll.scrollerHighlightFill;
                hmVertScroll.redraw();
            }
        } else {
            if (hmVertScroll.scrollerFill !== hmVertScroll.scrollerDefaultFill) {
                hmVertScroll.scrollerFill = hmVertScroll.scrollerDefaultFill;
                hmVertScroll.redraw();
            }
        }
    };
    this.scrollYCanv.onmouseout = function(e) {
        if (hmVertScroll.scrollerFill !== hmVertScroll.scrollerDefaultFill) {
            hmVertScroll.scrollerFill = hmVertScroll.scrollerDefaultFill;
            hmVertScroll.redraw();
        }
    };
};

HMVertScrollBar.prototype.setWidth = function(width) {
    this.width = width;
    this.scrollYCanv.width = width;
    this.scrollYCanv.style.left = (this.browser.width - this.width) + 'px';
};

HMVertScrollBar.prototype.setHeight = function(height) {
    this.height = height;
    this.scrollYCanv.height = height;
};

HMVertScrollBar.prototype.setScrollY = function(scrollY) {
    this.scrollY = scrollY;
    this.redraw();
};

HMVertScrollBar.prototype.onScroller = function(evt) {
    return evt.offsetY > this.scrollY && evt.offsetY < this.scrollY + this.scrollerHeight;
};

HMVertScrollBar.prototype.onMouseMove = function(evt) {
    if (this.scrolling) {
        var diff = evt.offsetY - this.startScrollOff;
        this.scrollY = (this.startScrollY + diff < 0)? 0 : (this.startScrollY + diff > this.height - this.scrollerHeight)? this.height - this.scrollerHeight : this.startScrollY + diff;
        this.scrollerFill = this.scrollerHighlightFill;
        this.redraw();
        this.browser.onScrollY(this.scrollY);
    }
};

HMVertScrollBar.prototype.onMouseUp = function(evt) {
    this.scrolling = false;
    if (this.scrollerFill !== this.scrollerDefaultFill) {
        this.scrollerFill = this.scrollerDefaultFill;
        this.redraw();
    }
};

HMVertScrollBar.prototype.onWheel = function(evt) {
    if (!this.width || !this.height) return;
    var diff = evt.deltaY;
    this.scrollY = (this.scrollY + diff < 0)? 0 : (this.scrollY + diff > this.height - this.scrollerHeight)? this.height - this.scrollerHeight : this.scrollY + diff;
    this.redraw();
    this.browser.onScrollY(this.scrollY);
};

HMVertScrollBar.prototype.clear = function() {
    this.scrollYCtx.clearRect(0, 0, this.scrollYCanv.width, this.scrollYCanv.height);
};

HMVertScrollBar.prototype.hideScroll = function() {
    this.scrollYCanv.className += ' hidden';
};

HMVertScrollBar.prototype.showScroll = function() {
    this.scrollYCanv.className = this.scrollYCanv.className.replace( /(?:^|\s)hidden(?!\S)/g , '' );
};

HMVertScrollBar.prototype.redraw = function() {
    this.clear();
    this.render();
};

HMVertScrollBar.prototype.render = function() {
    var hmHeight = this.browser.getHeatmapHeight();
    var perc = getCoveragePerc(hmHeight, this.browser.rowHeads.filteredRowHeaders.length * this.browser.settings.cellHeight * this.browser.zoom);
    this.scrollerHeight = perc * this.height;
    this.scrollYCtx.fillStyle = this.scrollerFill;
    this.scrollYCtx.fillRect(0, this.scrollY, this.width, this.scrollerHeight);
    this.scrollYCtx.stroke();
};
