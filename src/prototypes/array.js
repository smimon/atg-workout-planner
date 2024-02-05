Array.prototype.any = function (predicate) {
  if (!predicate) {
    return this.length > 0;
  }

  for (const item of this) {
    if (predicate(item)) {
      return true;
    }
  }

  return false;
};

Array.prototype.remove = function (item) {
  for (let i = this.length - 1; i >= 0; i--) {
    if (i === item) {
      this.splice(i, 1);
    }
  }

  return this;
};

Array.prototype.removeBy = function (predicate) {
  for (let i = this.length - 1; i >= 0; i--) {
    if (predicate(this[i])) {
      this.splice(i, 1);
    }
  }

  return this;
};

Array.prototype.groupBy = function (selector, toStringKey = false) {
  const g = new Map();
  for (const item of this) {
    const key = selector ? selector(item) : item;
    const mapKey = toStringKey ? JSON.stringify(key) : key;
    if (!g.has(mapKey)) {
      const groupItem = [];
      Object.defineProperty(groupItem, 'key', { value: key });
      g.set(mapKey, groupItem);
    }
    g.get(mapKey).push(item);
  }
  return Array.from(g.values());
}

Array.prototype.toDictionary = function (keySelector, valSelector) {
  const m = {};

  for (const a of this) {
    m[keySelector(a)] = valSelector(a);
  }

  return m;
}

Array.prototype.toMap = function (keySelector, valSelector) {
  const m = new Map();

  for (const a of this) {
    m.set(keySelector(a), valSelector(a));
  }

  return m;
}

Array.prototype.orderBy = function (selector, desc = false) {
  if (this.length <= 1) {
    return this;
  }

  selector = selector || (x => x);

  if (this.length == 0) {
    return this;
  }

  let sortFunc;
  const first = selector(this[0]);

  if (first && first.constructor.name == 'String') {
    sortFunc = (a, b) => selector(a).localeCompare(selector(b)) * (desc ? -1 : 1);
  }
  else {
    sortFunc = (a, b) => {
      const sa = selector(a), sb = selector(b);
      if (sa < sb) {
        return -1 * (desc ? -1 : 1);
      }
      if (sa > sb) {
        return 1 * (desc ? -1 : 1);
      }
      return 0;
    }
  }

  return this.sort(sortFunc);
}

Array.prototype.last = function (n = 0) {
  if (this.length == 0) {
    return undefined;
  }

  return this[this.length - 1 - n];
}

Array.prototype.except = function (arr) {
  const ret = [];

  for (const a of this) {
    if (arr.indexOf(a) == -1) {
      ret.push(a);
    }
  }

  return ret;
}

Array.prototype.distinct = function (selector) {
  selector = selector || (x => x);
  return this.map(x => selector(x)).filter((v, i, a) => a.indexOf(v) === i);
}

Array.prototype.first = function (predicate) {
  for (const a of this) {
    if (predicate(a)) {
      return a;
    }
  }

  throw new Error('Sequence contains no matching elements');
}

Array.prototype.firstOrDefault = function (predicate) {
  for (const a of this) {
    if (predicate(a)) {
      return a;
    }
  }

  return undefined;
}

Array.prototype.min = function (selector) {
  if (this.length == 0) {
    return undefined;
  }

  if (!selector) {
    return Math.min.apply(null, this);
  }

  let min = selector(this[0]);

  for (let i = 1; i < this.length; i++) {
    min = Math.min(min, selector(this[i]));
  }

  return min;
}

Array.prototype.max = function (selector) {
  if (this.length == 0) {
    return undefined;
  }

  if (!selector) {
    return Math.max.apply(null, this);
  }

  let max = selector(this[0]);

  for (let i = 1; i < this.length; i++) {
    max = Math.max(max, selector(this[i]));
  }

  return max;
}

Array.prototype.minBy = function (fn) {
  return this.extremumBy(fn, Math.min);
};

Array.prototype.maxBy = function (fn) {
  return this.extremumBy(fn, Math.max);
};

Array.prototype.extremumBy = function (pluck, extremum) {
  if (this.length == 0) {
    return undefined;
  }

  return this.reduce(function (best, next) {
    const pair = [pluck(next), next];
    if (!best) {
      return pair;
    }
    else if (extremum.apply(null, [best[0], pair[0]]) == best[0]) {
      return best;
    }
    else {
      return pair;
    }
  }, null)[1];
}

Array.prototype.sum = function (selector) {
  if (this.length == 0) {
    return undefined;
  }

  selector = selector || (x => x);

  let sum = 0;

  for (const item of this) {
    sum += selector(item);
  }

  return sum;
}

Array.prototype.average = function (selector) {
  if (this.length == 0) {
    return undefined;
  }

  selector = selector || (x => x);

  return this.sum(selector) / this.length;
}

Array.prototype.binarySearch = function (selector, value, desc = false) {
  if (this.length > 0) {
    const first = selector(this[0]);

    if ((!desc && value < first) || (desc && value > first)) {
      return -1;
    }

    if (first == value) {
      return 0;
    }

    const last = selector(this[this.length - 1]);

    if ((!desc && value > last) || (desc && value < last)) {
      return -(this.length + 1);
    }

    if (last == value) {
      return this.length - 1;
    }
  }

  let m = 0;
  let n = this.length - 1;

  while (m <= n) {
    const k = (n + m) >> 1;
    const elVal = selector(this[k]);

    if ((!desc && elVal < value) || (desc && elVal > value)) {
      m = k + 1;
    }
    else if ((!desc && elVal > value) || (desc && elVal < value)) {
      n = k - 1;
    }
    else {
      return k;
    }
  }

  return -m - 1;
}

Array.prototype.mergeSorted = function (arr, valSelector) {
  if (!valSelector) {
    valSelector = x => x;
  }

  if (arr.length > 0) {
    if (this.length == 0) {
      Array.prototype.splice.apply(this, [0, 0].concat(arr));
    }
    else {
      const firstMergeValue = valSelector(arr[0]);
      const lastMergeValue = valSelector(arr[arr.length - 1]);

      let fromIdx = this.binarySearch(valSelector, firstMergeValue);
      let toIdx = this.binarySearch(valSelector, lastMergeValue);

      if (fromIdx == -1 && toIdx == -1) { // entire chunk before start              
        Array.prototype.splice.apply(this, [0, 0].concat(arr));
      }
      else if (fromIdx == -(this.length + 1) && toIdx == fromIdx) { // entire chunk after end
        Array.prototype.splice.apply(this, [this.length, 0].concat(arr));
      }
      else { // some overlap
        let removeExtra = 0;
        if (fromIdx < 0) {
          fromIdx = -fromIdx - 1;
        }

        if (toIdx < 0) {
          toIdx = -toIdx - 1;
        }
        else {
          removeExtra = 1;
        }

        Array.prototype.splice.apply(this, [fromIdx, toIdx - fromIdx + removeExtra].concat(arr));
      }
    }
  }

  return this;
}

Array.prototype.binarySlice = function (selector, from, to, { exact = true } = {}) {
  selector = selector || (x => x);

  if (this.length == 0) {
    return [];
  }

  let fromIdx = this.binarySearch(selector, from);
  let toIdx = this.binarySearch(selector, to);

  if (exact && fromIdx < 0 && toIdx < 0) {
    return [];
  }

  // console.log({ fromIdx, toIdx });

  if (fromIdx < 0) {
    fromIdx = -fromIdx - 2;
    if (fromIdx < 0) {
      fromIdx = 0;
    }
  }

  if (toIdx < 0) {
    toIdx = -toIdx - 2;
  }

  // console.log({ fromIdx, toIdx });

  return this.slice(fromIdx, toIdx + 1);
}

Array.prototype.binarySearchGetNearestIndexBefore = function (selector, value, desc = false) {
  selector = selector || (x => x);

  let idx = this.binarySearch(selector, value, desc);

  if (idx < 0) {
    idx = -idx - 2;
  }

  return idx;
}

Array.prototype.binarySearchGetNearestElementBefore = function (selector, value, desc = false) {
  return this[this.binarySearchGetNearestIndexBefore(selector, value, desc)];
}

Array.prototype.chunk = function (chunkSize) {
  let idx = 0;
  const chunks = [];

  while (idx < this.length) {
    chunks.push(this.slice(idx, idx + chunkSize));
    idx += chunkSize;
  }

  return chunks;
}

Array.prototype.intersect = function (arr) {
  return this.filter(x => arr.includes(x));
}