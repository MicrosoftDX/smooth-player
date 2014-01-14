// Field Processors

mp4lib.fieldProcessors.SerializationBoxFieldsProcessor = function(box, buf, pos){
    this.box = box;
    this.buf = buf;
    this.pos = pos;
    this.isDeserializing = false;
};

mp4lib.fieldProcessors.SerializationBoxFieldsProcessor.prototype.eat = function( fieldname, fieldtype ){
    fieldtype.write( this.buf, this.pos, this.box[fieldname] );
    this.pos+=fieldtype.getLength(this.box[fieldname]);
};

mp4lib.fieldProcessors.SerializationBoxFieldsProcessor.prototype.eat_flagged = function( flagbox, flagsfieldname, flag, fieldname, fieldtype ){
    //console.log('SERIALIZACJA FLAGOWANA: pole '+fieldname+' flaga '+flag+' wartosc '+flagbox[flagsfieldname]+' wynik '+(flagbox[flagsfieldname] & flag));
    if ((flagbox[flagsfieldname] & flag) != 0){
        //console.log('Flaga zapalona!');
        this.eat(fieldname, fieldtype);
    }
};

mp4lib.fieldProcessors.DeserializationBoxFieldsProcessor = function( box, buf, pos, end ){
    this.box = box;
    this.buf = buf;
    this.pos = pos;
    this.bufferStart = pos;
    this.bufferEnd = end;
    this.end = end;
    this.isDeserializing = true;
};

mp4lib.fieldProcessors.DeserializationBoxFieldsProcessor.prototype.eat = function( fieldname, fieldtype )
{
    if (fieldtype===undefined)
    {
        console.log('Undefined fieldtype for field '+fieldname);
        console.log(this);
    }

    var val = fieldtype.read( this.buf, this.pos, this.end );
    this.box[fieldname]=val;

    //console.log(fieldname+'='+val);

    if (fieldname=='size')
    {
        this.end = this.bufferStart+val;
        if (this.end>this.bufferEnd){
            throw "Deserialization error: Box size exceeds buffer ("+this.box.boxtype+")";
        }
    }

    this.pos+=fieldtype.getLength(val);
    // TODO support for setting largesize and size=0
};

mp4lib.fieldProcessors.DeserializationBoxFieldsProcessor.prototype.eat_optional = function( fieldname, fieldtype ){
    if (this.pos<this.end){
        this.eat( fieldname, fieldtype );
    }
       //return DeserializationBoxFieldsProcessor.prototype.call( this, eat, fieldname, fieldtype)
};

mp4lib.fieldProcessors.DeserializationBoxFieldsProcessor.prototype.eat_flagged = function( flagbox, flagsfieldname, flag, fieldname, fieldtype ){
    if ((flagbox[flagsfieldname] & flag) != 0){
        this.eat( fieldname, fieldtype );
    }
};



mp4lib.fieldProcessors.LengthCounterBoxFieldsProcessor = function(box){
    this.box = box;
    this.res = 0;
    this.isDeserializing = false;
};

mp4lib.fieldProcessors.LengthCounterBoxFieldsProcessor.prototype.eat = function(fieldname, fieldtype ){
    var val = fieldtype.getLength(this.box[fieldname]);
    if(isNaN(val)){
        console.log('ERROR counting size of '+fieldname+' in '+this.box.boxtype+' = '+val);
    }
    this.res+=val;
};


mp4lib.fieldProcessors.LengthCounterBoxFieldsProcessor.prototype.eat_flagged = function( flagbox, flagsfieldname, flag, fieldname, fieldtype ){
    if(fieldname in this.box){
       this.eat(fieldname, fieldtype);
    }
};