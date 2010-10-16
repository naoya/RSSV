function debug (msg) {
    Titanium.UI.createAlertDialog({
      title : 'debug',
      message : msg
    }).show();
}

Titanium.UI.setBackgroundColor('#000');

var root = Titanium.UI.createWindow();
var win  = Titanium.UI.createWindow({
  title          :'購読リスト',
  backgroundColor:'#fff'
});

var nav = Titanium.UI.iPhone.createNavigationGroup({
  window : win
});
root.add(nav);

var loader = Titanium.Network.createHTTPClient();
loader.open('GET', 'http://localhost:3000/list');
loader.onload = display_feeds;
loader.send();

function display_feeds () {
  var data = JSON.parse(this.responseText);
  data.forEach(function (v) { v.hasChild = true; });

  var table = Titanium.UI.createTableView({ data : data });
  table.addEventListener('click', display_items);
  win.add(table);
  root.open();
};

function display_items (e) {
  var row = e.rowData;
  
  loader.open('GET', 'http://localhost:3000/feed?url=' + row.url);
  loader.onload = function () {
    var data = JSON.parse(this.responseText);
    data.forEach(function (v) { v.hasChild = true; });
    
    var win = Titanium.UI.createWindow({
      title          : row.title,
      backgroundColor:'#fff'
    });
    
    var table = Titanium.UI.createTableView({ data : data });
    win.add(table);
    nav.open(win, { animated: true });
    table.addEventListener('click', display_item);
  };
  loader.send();
};

function display_item (e) {
  var row = e.rowData;
  var win = Ti.UI.createWindow();
  var wv  = Ti.UI.createWebView();
  
  var btnBack = Ti.UI.createButton({
    title : '戻る'
  });
  btnBack.addEventListener('click', function () { wv.goBack(); });
  
  var btnReload = Ti.UI.createButton({
    systemButton : Ti.UI.iPhone.SystemButton.REFRESH
  });
  btnReload.addEventListener('click', function () { wv.reload(); });
  
  wv.url    = row.url;
  win.toolbar = [ btnBack, btnReload ];
  win.add(wv);
  
  nav.open(win, {animated : true});
}