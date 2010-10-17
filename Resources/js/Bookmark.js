var Bookmark = {
  find : function (url, cb) {
    var loader = Titanium.Network.createHTTPClient();
    loader.open('GET', 'http://b.hatena.ne.jp/entry/json/' + url);
    loader.onload = function () {
      var entry = JSON.parse(this.responseText);
      if (entry != null) {
        // cb(entry.bookmarks);
        cb(entry);
      }
    };
    loader.send();
  }
};
