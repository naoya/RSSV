function debug (msg) {
    Titanium.UI.createAlertDialog({
      title : 'debug',
      message : msg
    }).show();
}

Titanium.UI.setBackgroundColor('#000');

var root = Titanium.UI.createWindow();

var win = Titanium.UI.createWindow({
  title          :'購読リスト',
  backgroundColor:'#fff'
});

var nav = Titanium.UI.iPhone.createNavigationGroup({
  window : win
});

var xhr = Titanium.Network.createHTTPClient();

xhr.open('GET', 'http://localhost:3000/list');
xhr.onload = function () {
  var data = JSON.parse(this.responseText);
  data.forEach(function (v) { v.hasChild = true; });

  var list = Titanium.UI.createTableView({ data : data });
  win.add(list);
  root.add(nav);
  root.open();
  
  list.addEventListener('click', function(e) {
    var row = e.rowData;
    xhr.open('GET', 'http://localhost:3000/feed?url=' + row.url);
    xhr.onload = function () {
      var data = JSON.parse(this.responseText);
      data.forEach(function (v) { v.hasChild = true; });

      var win2 = Titanium.UI.createWindow({
        title          : row.title,
        backgroundColor:'#fff'
      });
      var tv = Titanium.UI.createTableView({ data : data });
      win2.add(tv);
      nav.open(win2, { animated: true });
      
      tv.addEventListener('click', function(e) {
        var row = e.rowData;
        var w   = Ti.UI.createWindow();
        var wv  = Ti.UI.createWebView();
        var btn_back = Ti.UI.createButton({
          title : '戻る'
        });
        btn_back.addEventListener('click', function () { wv.goBack(); });

        var btn_reload = Ti.UI.createButton({
          systemButton : Ti.UI.iPhone.SystemButton.REFRESH
        });
        btn_reload.addEventListener('click', function () { wv.reload(); });
        
      /*
        var btn_close = Ti.UI.createButton({
        title: '閉じる',
        });
        btn_close.addEventListener('click', function () { w.close() });
        w.rightNavButton = btn_close;

        wv.addEventListener('beforeload', function (e) {
        var spinner = Ti.UI.createButton({
        systemButton : Ti.UI.iPhone.SystemButton.SPINNER
        });
        w.leftNavButton = spinner;
        });

        wv.addEventListener('load', function (e) {
        w.leftNavButton = null;
        });
      */

      // debug(row.url);

        wv.url = row.url;
        w.toolbar = [ btn_back, btn_reload ];
        w.add(wv);
      
      //    w.modal = true;
      //    w.navBarHidden = false;
      
      // win.tab.open(w);
      // win.open(w);
      // w.open();
      
        nav.open(w, {animated : true});
      });
    };
    xhr.send();
  });
  

  // win.modal = true;
  // win.navBarHidden = false;
  // win.fullscreen = false;
  // win.showNavBar();

  
  // win.add(nav);

  // win.open();
  // win.open({ animated : true });
};
xhr.send();
