

function compareBoxes(box1,box2,prefix)
{
     if ((box1.boxtype=='udta') || (box2.boxtype=='udta'))
         return;
     var lp1 = new LengthCounterBoxFieldsProcessor(box1);
     box1._processFields(lp1);
     var lp1size = lp1.res;

     buf1 = new Uint8Array(lp1size);
     var sp1 = new SerializationBoxFieldsProcessor(box1, buf1, 0);
     box1._processFields(sp1);

     var lp2 = new LengthCounterBoxFieldsProcessor(box2);
     box2._processFields(lp2);
     var lp2size = lp2.res;

     buf2 = new Uint8Array(lp2size);
     var sp2 = new SerializationBoxFieldsProcessor(box2, buf2, 0);
     box2._processFields(sp2);

     console.log(prefix+'COMPARING '+box1.boxtype+' - '+box2.boxtype);
     console.log(box1);
     console.log(box2);

     if (lp1size!=lp2size)
     {
         console.log('    nie zgadzaja sie rozmiary buforow!');
     }
     else
     {     
		 var i;
		 var different = 0;
		 var firstdifference = -1;
		 for (i=0;i<lp1size;i++)
		 {
		     if (buf1[i]!=buf2[i])
		     {
		         different = different+1;
		         if (firstdifference==-1)
		             firstdifference = i;
		     }
		 }
		 if (different==0)
		     console.log(prefix+'     BINARY BUFFER CHECK: OK');
		 else
		 {
		     console.log(prefix+'     BINARY BUFFER CHECK: '+different+' bytes different, first difference at position '+firstdifference+' NOK!!!!!');
		     console.log(buf1);
			 console.log(buf2);
		 }
     }
                            
     if (box1.boxes !== undefined)
         for (var i=0;i<box1.boxes.length;i++)
            compareBoxes(box1.boxes[i],box2.boxes[i],"    "+prefix)
}




/*

var PLATFORM_URL = "http://217.96.70.102/RTEFacade_RIGHTV/";
function getFromPlatform(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();
    var smMedia = this;

    xhr.onload = function(e) {
	if (xhr.status != 200) {
            error = "Unexpected status code " + xhr.status + " for " + url;
	    if (smMedia.onerror) smMedia.onerror(error);
            else 
                alert(error);
            return;
	}
	callback(xhr.responseText); 
    }
}


function login(username,password) {
    var url = PLATFORM_URL+"Login?username="+username+"&password="+password+"&client=json";
    var callback = function(response){
        console.log("Logowanie:");
        console.log(JSON.parse(response));

        parseCategory(200);
    }
    var response = getFromPlatform(url, callback);
       
}
function parseCategory(categoryId) {
    var url = PLATFORM_URL+"GetUnifiedList?category_id="+categoryId+"&client=json";
    var callback = function(response){
        console.log("Kategoria nr: "+categoryId);
        var response = JSON.parse(response);
        console.log(response);
        for (var i = 0; i < response.response.length; i++) {
            console.log(response.response[i]);
            orderVideo(response.response[i].id);
	}
      //  orderVideo(response.response[1].id);
    }
    var response = getFromPlatform(url, callback);
}

function orderVideo(videoId) {
    var url = PLATFORM_URL+"OrderVideo?video_id="+videoId+"&pricing_id=4017&client=json";
    var callback = function(response){
        console.log("Zamawianie video nr: "+videoId);
        var response = JSON.parse(response);
        console.log(response);
        getVideoPlayingInfo(videoId);
    }
    var response = getFromPlatform(url, callback);
}
function getVideoPlayingInfo(videoId) {
    var url = PLATFORM_URL+"GetVideoPlayingInfo?video_id="+videoId+"&encoding=Smooth%20Streaming&client=json";
    var callback = function(response){
        console.log("Informacje dotyczące video nr: "+videoId);
        var response = JSON.parse(response);
        console.log(response);
    }
    var response = getFromPlatform(url, callback);
}
*/



function GET(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.send();

  xhr.onload = function(e) {
    if (xhr.status != 200) {
      alert("Unexpected status code " + xhr.status + " for " + url);
      return false;
    }
    callback(new Uint8Array(xhr.response));
  };
}


function displayBoxHierarchy(box,prefix)
{
     console.log(prefix+box.boxtype)
     if (box.boxes !== undefined)
         for (var i=0;i<box.boxes.length;i++)
          displayBoxHierarchy(box.boxes[i],"    "+prefix)
}

function verifySerialization(box,prefix)
{
     if (box.__sourceBuffer !== undefined)
     {
         var lp = new LengthCounterBoxFieldsProcessor(box);
         box._processFields(lp);
         var lpsize = lp.res;
         if (lpsize == box.size)
         {
             console.log(prefix+box.boxtype+" SIZE CHECK: sourceBufferLen:"+box.__sourceBuffer.length+" size_attribute:"+box.size+" lproc_size:"+lpsize+' OK');
		     buf = new Uint8Array(lpsize);
		     var sp = new SerializationBoxFieldsProcessor(box, buf, 0);
		     box._processFields(sp);
             // now compare array
             var i;
             var different = 0;
             var firstdifference = -1;
             for (i=0;i<lpsize;i++)
             {
                 if (buf[i]!=box.__sourceBuffer[i])
                 {
                     different = different+1;
                     if (firstdifference==-1)
                         firstdifference = i;
                 }
             }
             if (different==0)
                 console.log(prefix+'     BINARY BUFFER CHECK: OK');
             else
             {
                 console.log(prefix+'     BINARY BUFFER CHECK: '+different+' bytes different, first difference at position '+firstdifference+' NOK!!!!!');
                 console.log(box.__sourceBuffer);
				 console.log(buf);
                 console.log(box);
             }
                  
             
         }
         else
         {
             console.log(prefix+box.boxtype+" SIZE CHECK: sourceBufferLen:"+box.__sourceBuffer.length+" size_attribute:"+box.size+" lproc_size:"+lpsize+' NOK!!!!!');
             console.log(box);
         }
         

 
         /*u = uInt8Array;		
         f = new File();
         p = new SerializationBoxFieldsProcessor(f,u,0,u.length);
	     f._processFields(p);
         console.log('loaded');
         console.log(f);     */
     }
     else
         console.log(prefix+box.boxtype+" no sourceBuffer");

     if (box.boxes !== undefined)
         for (var i=0;i<box.boxes.length;i++)
          verifySerialization(box.boxes[i],"    "+prefix)
}


