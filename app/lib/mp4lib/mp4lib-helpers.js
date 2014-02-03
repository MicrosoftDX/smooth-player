// helpers


mp4lib.helpers.compareBoxes = function(box1,box2,prefix){
    if ((box1.boxtype=='udta') || (box2.boxtype=='udta')){
        return;
    }
        
    var lp1 = new mp4lib.fieldProcessors.LengthCounterBoxFieldsProcessor(box1);
    box1._processFields(lp1);
    var lp1size = lp1.res;

    var buf1 = new Uint8Array(lp1size);
    var sp1 = new mp4lib.fieldProcessors.SerializationBoxFieldsProcessor(box1, buf1, 0);
    box1._processFields(sp1);

    var lp2 = new mp4lib.fieldProcessors.LengthCounterBoxFieldsProcessor(box2);
    box2._processFields(lp2);
    var lp2size = lp2.res;

    var buf2 = new Uint8Array(lp2size);
    var sp2 = new mp4lib.fieldProcessors.SerializationBoxFieldsProcessor(box2, buf2, 0);
    box2._processFields(sp2);

    console.log(prefix+'COMPARING '+box1.boxtype+' - '+box2.boxtype);
    console.log(box1);
    console.log(box2);

    if (lp1size!=lp2size){
        console.log('    nie zgadzaja sie rozmiary buforow!');
    }else{
        var i;
        var different = 0;
        var firstdifference = -1;
        for (i=0;i<lp1size;i++){
            if(buf1[i]!=buf2[i]){
                different = different+1;
                // ?? a quoi ça sert
                // if(firstdifference==-1){

                // }
                firstdifference = i;
            }
        }
        // if (different==0){
        //  console.log(prefix+'     BINARY BUFFER CHECK: OK');
        // }else{
        //  console.log(prefix+'     BINARY BUFFER CHECK: '+different+' bytes different, first difference at position '+firstdifference+' NOK!!!!!');
        //  console.log(buf1);
        //  console.log(buf2);
        // }
    }

    if (box1.boxes !== undefined){
        for (var i=0;i<box1.boxes.length;i++){
            mp4lib.helpers.compareBoxes(box1.boxes[i],box2.boxes[i],"    "+prefix);
        }
    }
     
};

mp4lib.helpers.getBoxByType = function(box, boxType) {
    for(var i = 0; i < box.boxes.length; i++) {
        if(box.boxes[i].boxtype === boxType) {
            return box.boxes[i];
        }
    }
    return null;
};

mp4lib.helpers.getBoxPositionByType = function(box, boxType) {
    var position = 0;
    for(var i = 0; i < box.boxes.length; i++) {
        if(box.boxes[i].boxtype === boxType) {
            return position;
        }else
        {
            position += box.boxes[i].size;
        }
    }
    return null;
};

mp4lib.helpers.removeBoxByType = function(box, boxType) {
    for(var i = 0; i < box.boxes.length; i++) {
        if(box.boxes[i].boxtype === boxType) {
            box.boxes.splice(i, 1);
        }
    }
};

