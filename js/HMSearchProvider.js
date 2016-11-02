function HMSearchProvider() {
}

HMSearchProvider.prototype.parseQueryString = function (query) {
    var parser = window.PARSER;
    var matches = parser.parse(query);
    if (matches.length) {
        return matches[0];
    }
    return null;
};

HMSearchProvider.prototype.loadMatches = function (tree, data) {
    // Leaf
    if (!tree.op) {
        tree.matches = [];
        this.findMatches(tree, tree.term, data);
    } else {
        if (tree.left) this.loadMatches(tree.left, data);
        if (tree.right) this.loadMatches(tree.right, data);
    }
};

HMSearchProvider.prototype.findMatches = function (treeElem, term, data) {
    var lowerTerm = term.toLowerCase();
    for(var i = 0; i < data.length; ++i) {
        if (Array.isArray(data[i])) {
            for(var j = 0; j < data[i].length; ++j) {
                var index = data[i][j].toLowerCase().indexOf(lowerTerm);
                if (index > -1) {
                    treeElem.matches.push(i);
                    break;
                }
            }
        } else {
            var index = data[i].toLowerCase().indexOf(term);
            if (index > -1) {
                treeElem.matches.push(i);
                break;
            }
        }
    }
};

// Assuming these arrays are sorted
HMSearchProvider.prototype.intersection = function (a, b) {
    var ai=0, bi=0;
    var result = [];

    while( ai < a.length && bi < b.length )
    {
       if      (a[ai] < b[bi] ){ ai++; }
       else if (a[ai] > b[bi] ){ bi++; }
       else /* they're equal */
       {
         result.push(a[ai]);
         ai++;
         bi++;
       }
    }

    return result;
};

// Assuming these arrays are sorted
HMSearchProvider.prototype.union = function (a, b) {
    var map = {};

    // Build maps
    for (var i = a.length-1; i >= 0; -- i) map[a[i]] = a[i];
    for (var i = b.length-1; i >= 0; -- i) map[b[i]] = b[i];

    var result = []
    for(var j in map) {
        result.push(map[j]);
    }
    return result;
};

HMSearchProvider.prototype.getIndices = function (tree) {
    // Leaf
    if (!tree.op) {
        return tree.matches;
    } else {
        var leftMatches = this.getIndices(tree.left);
        var rightMatches = this.getIndices(tree.right);

        if (tree.op === "AND") {
            return this.intersection(leftMatches, rightMatches);
        } else {
            return this.union(leftMatches, rightMatches);
        }
    }
};

HMSearchProvider.prototype.search = function (data, query) {
    var tree = null;
    try {
        tree = this.parseQueryString(query);
    } catch (e) {
        return null;
    }

    if (tree !== null) {
        this.loadMatches(tree, data);
        return this.getIndices(tree);
    }
    return null;
};
