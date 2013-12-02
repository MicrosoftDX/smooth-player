svn checkout --username webtvportal-ic https://orangeforge.rd.francetelecom.fr/svnroot/WebTVPortals/client/js/branches/html5_trunk_G01R10/src/main/resources/js/dashjs/ release
cp -f dash.all.js release/
cp -f dash.min.js release/
cd release
svn commit --username webtvportal-ic --password welcome0 -m "update Dash.min.js" dash.min.js
svn commit --username webtvportal-ic --password welcome0 -m "update Dash.all.js" dash.all.js
 
