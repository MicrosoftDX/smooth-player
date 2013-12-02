svn checkout --username webtvportal-ic https://orangeforge.rd.francetelecom.fr/svnroot/WebTVPortals/client/js/branches/html5_trunk_G01R10/src/main/resources/js/dashjs/ 
cp -f dash.all.js ./dashjs/
cp -f dash.min.js ./dashjs/
cd ./dashjs
svn commit --username webtvportal-ic --password welcome0 -m "update Dash.min.js" dashjs/dash.min.js
svn commit --username webtvportal-ic --password welcome0 -m "update Dash.all.js" dashjs/dash.all.js
 
