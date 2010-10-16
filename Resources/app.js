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
      openWebWindow(data[e.index]);
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

function openWebWindow (row) {
  var win = Ti.UI.createWindow();
  var webview  = Ti.UI.createWebView();
  
  var back = Ti.UI.createButton({
    style : Ti.UI.iPhone.SystemButtonStyle.BORDERED,
    title : 'Back',
    font  : { fontSize: 14 }
  });
  back.addEventListener('click', function () { webview.goBack(); });
  
  var reload = Ti.UI.createButton({
    systemButton : Ti.UI.iPhone.SystemButton.REFRESH
  });
  reload.addEventListener('click', function () { webview.reload(); });

  var spacer = Ti.UI.createButton({
    systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
  });

  var facebook = Ti.UI.createButton({
    title : 'Facebook',
    style: Ti.UI.iPhone.SystemButtonStyle.DONE,
    font : { fontSize: 14 }
  });
  facebook.addEventListener('click', function (e) {
    if (Titanium.Facebook.isLoggedIn() == false) {
      debug("need to login");
      var login = Titanium.Facebook.createLoginButton({
	      'style':'normal',
	      'apikey':'9494e611f2a93b8d7bfcdfa8cefdaf9f',
	      'sessionProxy':'http://api.appcelerator.net/p/fbconnect/',
      });
      var v = Ti.UI.createView({
        width: 200,
        height: 50,
        backgroundColor: '#000',
        borderColor: '#999',
        borderRadius: 10.0,
        borderWidth: 1.0,
        opacity: 0.8
      });
      v.add(login);
      win.add(v);
    } else {
      facebookConnect(row);
    }
  });
  
  win.title   = row.title;
  webview.url = row.url;
  win.toolbar = [ back, reload, spacer, facebook ];
  win.add(webview);

  nav.open(win, {animated : true});
}

function facebookConnect (row) {
  var data = {
    name: row.title,
    href: row.url,
    caption: "via RSSV",
    description: "Trying the Facebook Connect API ",
    /*
      media:[
      {
      type:"image",
      src:"http://img.skitch.com/20091027-dick5esbjx9kg63rnfhtfgdre1.jpg",
      href:"http://www.appcelerator.com"
      }
      ],
    */
    properties:
    {
      "github":{
        "text":"RSSV",
        "href":"http://github.com/naoya/RSSV"
      }
    }
  };
  Titanium.Facebook.publishStream("Comment",data, null, function(r) {
    Titanium.API.info("received publish stream response = "+JSON.stringify(r));
    /*
      if (r.success)
      Ti.UI.createAlertDialog({title:'Facebook', message:'Your stream was published'}).show();
      else
      Ti.UI.createAlertDialog({title:'Facebook', message:'Error: ' + r.error}).show();
    */
  });
}