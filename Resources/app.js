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
root.open();

var loader = Titanium.Network.createHTTPClient();
loader.open('GET', 'http://localhost:3000/list');
loader.onload = function () {
  var data = JSON.parse(this.responseText);
  data.forEach(function (v) { v.hasChild = true; });
  var table = Titanium.UI.createTableView({ data : data });
  table.addEventListener('click', openItemsWindow);
  win.add(table);
};
loader.send();

function openItemsWindow (e) {
  var row = e.rowData;
  
  var win = Titanium.UI.createWindow({
    title          : row.title,
    backgroundColor:'#fff'
  });
  nav.open(win, { animated: true });

  var ind = Titanium.UI.createActivityIndicator({
    bottom: 10,
    height: 50,
    width : 10,
    style : Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
  });
  ind.font  = { fontFamily : 'Helvetica Neue', fontsize: 15 };
  ind.color = 'black';
  ind.message = 'Loading...';
  ind.width = 210;
  win.add(ind);
  ind.show();
 
  loader.open('GET', 'http://localhost:3000/feed?url=' + row.url);
  loader.onload = function () {
    var data = JSON.parse(this.responseText);
    var table = Titanium.UI.createTableView({ data : data.map(createItemRow) });
    win.add(table);
    table.addEventListener('click', function(e) {
      openItemWindow(data[e.index]);
    });
  };
  
  loader.send();
};

function createItemRow (data) {
  var row = Titanium.UI.createTableViewRow({
    height   : 'auto',
    hasChild : true
  });
  
  var view = Titanium.UI.createView({
    height: 'auto',
    layout: 'vertical',
    top:    5,
    right:  5,
    bottom: 5,
    left:   5
  });

  var title = Titanium.UI.createLabel({
    text     : data.title,
    textAlign: 'left',
    height   : 36,
    color    : '#000',
    font     : { fontSize: 14, fontWeight: 'bold' }
  });

  /* うーん、落ちる...
  var icon = Titanium.UI.createIMageView({
    image  : 'http://favicon.st-hatena.com/?url=' + data.url,
    width  : 18,
    height : 18,
    top: 0,
    left: 0
  });
  */
  
  var url = Titanium.UI.createLabel({
    text     : data.url,
    textAlign: 'left',
    height   : 14,
    left     : 2,
    color    : '#999',
    font     : { fontSize: 11 }
  });
      
  view.add(title);
  /* view.add(icon); */
  view.add(url);
  row.add(view);
  
  return row;
}

function openItemWindow (row) {
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
  
  win.title   = row.title;
  /*
  if (row.content)
    wv.html = row.content;
  else 
    wv.url      = row.url;
  */
  wv.url = row.url;
  win.toolbar = [ btnBack, btnReload ];
  win.add(wv);

  nav.open(win, {animated : true});
}