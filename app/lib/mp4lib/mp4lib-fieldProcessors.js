

function SerializationBoxFieldsProcessor( box, buf, pos)
{
    this.box = box;
    this.buf = buf;
    this.pos = pos;
    this.isDeserializing = false;
}

SerializationBoxFieldsProcessor.prototype.eat = function( fieldname, fieldtype )
{
    fieldtype.write( this.buf, this.pos, this.box[fieldname] );
    this.pos+=fieldtype.getLength(this.box[fieldname]);
}

SerializationBoxFieldsProcessor.prototype.eat_flagged = function( flagbox, flagsfieldname, flag, fieldname, fieldtype )
{
    //console.log('SERIALIZACJA FLAGOWANA: pole '+fieldname+' flaga '+flag+' wartosc '+flagbox[flagsfieldname]+' wynik '+(flagbox[flagsfieldname] & flag));
    if ((flagbox[flagsfieldname] & flag) != 0)
    {
        //console.log('Flaga zapalona!');
        this.eat(fieldname, fieldtype);
    }
}




function DeserializationBoxFieldsProcessor( box, buf, pos, end )
{
    this.box = box;
    this.buf = buf;
    this.pos = pos;
    this.bufferStart = pos;
    this.bufferEnd = end;
    this.end = end;
    this.isDeserializing = true;
}

DeserializationBoxFieldsProcessor.prototype.eat = function( fieldname, fieldtype )
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
        if (this.end>this.bufferEnd)
            throw "Deserialization error: Box size exceeds buffer ("+this.box.boxtype+")"
    }

    this.pos+=fieldtype.getLength(val);
    // TODO support for setting largesize and size=0
}

DeserializationBoxFieldsProcessor.prototype.eat_optional = function( fieldname, fieldtype )
{
   if (this.pos<this.end)
       this.eat( fieldname, fieldtype );
       //return DeserializationBoxFieldsProcessor.prototype.call( this, eat, fieldname, fieldtype)
}

DeserializationBoxFieldsProcessor.prototype.eat_flagged = function( flagbox, flagsfieldname, flag, fieldname, fieldtype )
{
    if ((flagbox[flagsfieldname] & flag) != 0)
    {
       this.eat( fieldname, fieldtype );
    }
};


function LengthCounterBoxFieldsProcessor( box )
{
    this.box = box;
    this.res = 0;
    this.isDeserializing = false;
};

LengthCounterBoxFieldsProcessor.prototype.eat = function( fieldname, fieldtype )
{
    var val = fieldtype.getLength(this.box[fieldname]);
    if (isNaN(val))
        console.log('ERROR counting size of '+fieldname+' in '+this.box.boxtype+' = '+val)
    this.res+=val;
};


LengthCounterBoxFieldsProcessor.prototype.eat_flagged = function( flagbox, flagsfieldname, flag, fieldname, fieldtype )
{
    if (fieldname in this.box)
    {
       this.eat( fieldname, fieldtype );
       //flagbox[flagsfieldname] = flagbox[flagsfieldname] | flag;
    }
    else
    {
       //flagbox[flagsfieldname] = flagbox[flagsfieldname] & (~flag);
    }
};

