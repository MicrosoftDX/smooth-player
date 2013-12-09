

function readBytes(buf, pos, nbBytes) {
    var value = 0;
    for (var i = 0; i < nbBytes; i++) {
        value = value << 8;
        value = value + buf[pos];
        pos++;
    }
    return value;
}

function writeBytes(buf, pos, nbBytes, value) {
    for (var i = 0; i < nbBytes; i++) {
        buf[pos + nbBytes - i - 1] = value & 0xFF;
        value = value >> 8;
    }
}


//------------------------------- NumberField -------------------------------

function NumberField(bits,signed) {
    this.bits = bits;
    this.signed = signed;
}

NumberField.prototype.read = function(buf, pos) {
    return readBytes(buf, pos, this.bits/8);
};

NumberField.prototype.write = function(buf,pos,val) {
    writeBytes(buf, pos, this.bits/8, val);
};

NumberField.prototype.getLength = function(val) {
    return this.bits/8;
};

//------------------------------- 64BitsNumberField -------------------------------

function LongNumberField() {
}

LongNumberField.prototype.read = function(buf, pos) {
    var high = readBytes(buf, pos, 4);
    var low = readBytes(buf, pos + 4, 4);
    return goog.math.Long.fromBits(low, high).toNumber();
};

LongNumberField.prototype.write = function(buf, pos, val) {
    var longNumber = goog.math.Long.fromNumber(val);
    var low = longNumber.getLowBits();
    var high = longNumber.getHighBits();
    writeBytes(buf, pos, 4, high);
    writeBytes(buf, pos + 4, 4, low);
};

LongNumberField.prototype.getLength = function(val) {
    return 8;
};

//------------------------------- FixedLenStringField -------------------------------

function FixedLenStringField(size) {
    this.size = size;
}

FixedLenStringField.prototype.read = function(buf,pos){
    var res = "";
    for (var i=0;i<this.size;i++)
    {
        res = res+String.fromCharCode(buf[pos+i]);
    }
    return res;
};

FixedLenStringField.prototype.write = function(buf,pos,val){
    for (var i=0;i<this.size;i++)
    {
        buf[pos+i] = val.charCodeAt(i);
    }
};

FixedLenStringField.prototype.getLength = function(val){
    return this.size;
};


//------------------------------- StringField -------------------------------

function StringField() {
}

StringField.prototype.read = function(buf,pos,end){
    var res = "";

    for (var i=pos;i<end;i++)
    {
        res = res+String.fromCharCode(buf[i]);
        if (buf[i]==0)
        {
            return res;
        }
    }
    throw 'expected null-terminated string, but end of field reached without termination, read so far:'+res;
//    return res;
};

StringField.prototype.write = function(buf,pos,val){
    for (var i=0;i<val.length;i++)
    {
        buf[pos+i] = val.charCodeAt(i);
    }
    buf[pos+val.length] = 0;
};

StringField.prototype.getLength = function(val){
    return val.length;
};

//------------------------------- BoxFillingDataField -------------------------------

function BoxFillingDataField() {
}

BoxFillingDataField.prototype.read = function(buf,pos,end){
    var res = buf.subarray(pos,end);
    return res;
};

BoxFillingDataField.prototype.write = function(buf,pos,val){
    buf.set(val,pos);
};

BoxFillingDataField.prototype.getLength = function(val){
    return val.length;
};


//------------------------------- DataField -------------------------------

function DataField(len) {
    this.len = len;
}

DataField.prototype.read = function(buf,pos,end){
    var res = buf.subarray(pos,pos+this.len);
    return res;
};

DataField.prototype.write = function(buf,pos,val){
    buf.set(val,pos);
};

DataField.prototype.getLength = function(val){
    return this.len;
};


//------------------------------- ArrayField -------------------------------

function ArrayField(innerField,size) {
    this.innerField = innerField;
    this.size = size;
}

ArrayField.prototype.read = function(buf,pos,end){
    var innerFieldLength=-1;
    var res = [];
    for (var i=0;i<this.size;i++)
    {
        res.push(this.innerField.read(buf,pos));

        if (innerFieldLength==-1)
            innerFieldLength = this.innerField.getLength(res[i]);
            // it may happen that the size of field depends on the box flags, we need to count is having box and first structure constructed

        pos+=innerFieldLength;
    }
    return res;
};

ArrayField.prototype.write = function(buf,pos,val){
    var innerFieldLength=0;
    if (this.size>0)
        innerFieldLength=this.innerField.getLength(val[0]);

    //console.log('ARRAY FIELD WYLICZONY ROZMIAR KOMORKI '+innerFieldLength);
    //console.log('ILOSC ELEMENTOW '+this.size);

    for (var i=0;i<this.size;i++)
    {
        //console.log('ZAPISUJE POLE TABLICY NA POZYCJI'+pos);
        this.innerField.write(buf,pos,val[i]);
        pos+=innerFieldLength;
    }
};

ArrayField.prototype.getLength = function(val) {
    var innerFieldLength=0;
    if (this.size>0)
        innerFieldLength=this.innerField.getLength(val[0]);

    //console.log('ROZMIAR innerfieldlen:'+innerFieldLength); 

    return this.size*innerFieldLength;
};

//------------------------------- VariableElementSizeArrayField -------------------------------

function VariableElementSizeArrayField(innerField,size) {
    this.innerField = innerField;
    this.size = size;
}

VariableElementSizeArrayField.prototype.read = function(buf,pos,end){
    var res = [];
    for (var i=0;i<this.size;i++)
    {
        res.push(this.innerField.read(buf,pos));
        pos+=this.innerField.getLength(res[i]);
    }
    return res;
};

VariableElementSizeArrayField.prototype.write = function(buf,pos,val){
    for (var i=0;i<this.size;i++)
    {
        this.innerField.write(buf,pos,val[i]);
        pos+=this.innerField.getLength(val[i]);
    }
};

VariableElementSizeArrayField.prototype.getLength = function(val) {
    //console.log('LICZYMY ROZMIAR VARARRAYA, size='+this.size);
    var res = 0;
    for (var i=0;i<this.size;i++)
    {
        res+=this.innerField.getLength(val[i]);
        //console.log(val[i]);
        //console.log(this.innerField);
        //console.log(this.innerField.getLength(val[i]));
    }
    return res;
};


//------------------------------- BoxFillingArrayField -------------------------------

function BoxFillingArrayField(innerField) {
    this.innerField = innerField;
    this.innerFieldLength=innerField.getLength();
}

BoxFillingArrayField.prototype.read = function(buf,pos,end){
    var res = [];
    var size = (end-pos)/this.innerFieldLength;

    for (var i=0;i<size;i++)
    {
        res.push(this.innerField.read(buf,pos));
        pos+=this.innerFieldLength;
    }
    return res;
};

BoxFillingArrayField.prototype.write = function(buf,pos,val){
    for (var i=0;i<val.length;i++)
    {
        this.innerField.write(buf,pos,val[i]);
        pos+=this.innerFieldLength;
    }
};

BoxFillingArrayField.prototype.getLength = function(val) {
    return val.length*this.innerFieldLength;
};


//------------------------------- StructureField -------------------------------

function StructureField( box, _processStructureFields ) {
    this.box = box;
    this._processStructureFields = _processStructureFields;
}

StructureField.prototype.read = function(buf,pos,end){
    var struct = {};
	var p = new DeserializationBoxFieldsProcessor(struct,buf,pos,end);
    this._processStructureFields.call(struct,this.box,p);
    return struct;
};


StructureField.prototype.write = function(buf,pos,val){
	var p = new SerializationBoxFieldsProcessor(val,buf,pos);
    this._processStructureFields.call(val,this.box,p);
};

StructureField.prototype.getLength = function(val) {
    var p = new LengthCounterBoxFieldsProcessor(val); 
    this._processStructureFields.call(val,this.box,p);
    if (isNaN(p.res) && (val===undefined))
        console.log('ERROR: The structure contained in '+this.box.boxtype+' box has undefined size. Possible cause: you have put a variable sized structure into ArrayField (but ArrayField assumes all elements have the same size). If this is the cause, use VariableElementsSizeArrayField instead.');

    return p.res;
};

//------------------------------- BoxesListField -------------------------------

function BoxesListField() {
}

function readString( buf, pos, count )
{
    var res = "";
    var i;
    for (i=pos;i<pos+count;i++)
        res = res+String.fromCharCode(buf[i]);
    return res;
}

BoxesListField.prototype.read = function(buf,pos,end){
    // czytamy z bufora dzieci i dodajemy je do rodzica
    var res = [];
    while (pos<end)
    {
        // Read box size
        var size = new NumberField(32, false).read(buf, pos);

        // Read boxtype
        var boxtype = readString(buf, pos+4, 4);

        // Extented type?
        if (boxtype == "uuid")
        {
            var uuidFieldPos = (size == 1)?16:8;
            var uuid = new ArrayField(FIELD_INT8, 16).read(buf, pos + uuidFieldPos, pos + uuidFieldPos + 16);
            boxtype = Box.prototype.uuidToBoxTypes[JSON.stringify(uuid)];
            if (boxtype === undefined) {
                boxtype = "uuid";
            }
        }

        var box;
        if (boxtype in Box.prototype.boxPrototypes)
            box = new Box.prototype.boxPrototypes[ boxtype ]();
        else  {
            console.log('WARNING: Unknown boxtype:'+boxtype+', parsing as UnknownBox');
            box = new UnknownBox();
        }

        // process to read size
		var p = new DeserializationBoxFieldsProcessor(box,buf,pos,end);
		box._processFields(p);
        box.__sourceBuffer = buf.subarray(pos,pos+box.size);
        // the sourcebuffer is kept for debug purposes only, it is not used for any data processing        

        // (Re)set box type in case of extended type
        box.boxtype = boxtype;

        res.push(box);
        pos+=box.size;
        if (box.size==0)
        {
            console.log('Invalid size (0) of a box with boxtype '+box.boxtype+', deserialization of children stopped');
            return;
        }
    }
    return res;
};

BoxesListField.prototype.write = function(buf,pos,val){
   // zrzucamy wszystkie dzieci do bufora
   var i;
   for (i=0;i<val.length;i++)
   {
       var box = val[i];
       //console.log('ZRZUCAM DZIECKO NR '+i+' ('+box.boxtype+') NA POZYCJI '+pos);
       var sp = new SerializationBoxFieldsProcessor(box, buf, pos);
       box._processFields(sp);
       pos = pos+box.size;
   }
};

BoxesListField.prototype.getLength = function(val) {
    var i;
    var res = 0;
    for (i=0;i<val.length;i++)
    {
        var box = val[i];
        var p = new LengthCounterBoxFieldsProcessor(box);
        box._processFields(p);
        box.size = p.res;
        res = res+p.res;
    }
    return res;
};



// pre-defined shortcuts for common fields 
// ( it is recommended to use these shortcuts to avoid constructors being called for every field processing action)
FIELD_INT8   = new NumberField(8,true);
FIELD_INT16  = new NumberField(16,true);
FIELD_INT32  = new NumberField(32,true);
FIELD_INT64 = new LongNumberField();
FIELD_UINT8  = new NumberField(8,false);
FIELD_UINT16 = new NumberField(16,false);
FIELD_UINT32 = new NumberField(32,false);
FIELD_UINT64 = new LongNumberField();
FIELD_BIT8   = new NumberField(8,false);
FIELD_BIT16  = new NumberField(16,false);
FIELD_BIT24  = new NumberField(24,false);
FIELD_BIT32  = new NumberField(32,false);
FIELD_ID = new FixedLenStringField(4);
FIELD_CONTAINER_CHILDREN = new BoxesListField();
FIELD_STRING = new StringField();
FIELD_BOX_FILLING_DATA = new BoxFillingDataField();

