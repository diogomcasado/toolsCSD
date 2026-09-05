// QRCode for JavaScript — Copyright (c) 2009 Kazuhiko Arase, MIT licensed
// http://www.d-project.com/ — core encoding algorithm, verbatim from the
// davidshimjs/qrcodejs distribution (rendering/UI below is this site's own)
function QR8bitByte(data) {
	this.mode = QRMode.MODE_8BIT_BYTE;
	this.data = data;
	this.parsedData = [];

	// Added to support UTF-8 Characters
	for (var i = 0, l = this.data.length; i < l; i++) {
		var byteArray = [];
		var code = this.data.charCodeAt(i);

		if (code > 0x10000) {
			byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
			byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
			byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
			byteArray[3] = 0x80 | (code & 0x3F);
		} else if (code > 0x800) {
			byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
			byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
			byteArray[2] = 0x80 | (code & 0x3F);
		} else if (code > 0x80) {
			byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
			byteArray[1] = 0x80 | (code & 0x3F);
		} else {
			byteArray[0] = code;
		}

		this.parsedData.push(byteArray);
	}

	this.parsedData = Array.prototype.concat.apply([], this.parsedData);

	if (this.parsedData.length != this.data.length) {
		this.parsedData.unshift(191);
		this.parsedData.unshift(187);
		this.parsedData.unshift(239);
	}
}

QR8bitByte.prototype = {
	getLength: function (buffer) {
		return this.parsedData.length;
	},
	write: function (buffer) {
		for (var i = 0, l = this.parsedData.length; i < l; i++) {
			buffer.put(this.parsedData[i], 8);
		}
	}
};

function QRCodeModel(typeNumber, errorCorrectLevel) {
	this.typeNumber = typeNumber;
	this.errorCorrectLevel = errorCorrectLevel;
	this.modules = null;
	this.moduleCount = 0;
	this.dataCache = null;
	this.dataList = [];
}

QRCodeModel.prototype={addData:function(data){var newData=new QR8bitByte(data);this.dataList.push(newData);this.dataCache=null;},isDark:function(row,col){if(row<0||this.moduleCount<=row||col<0||this.moduleCount<=col){throw new Error(row+","+col);}
return this.modules[row][col];},getModuleCount:function(){return this.moduleCount;},make:function(){this.makeImpl(false,this.getBestMaskPattern());},makeImpl:function(test,maskPattern){this.moduleCount=this.typeNumber*4+17;this.modules=new Array(this.moduleCount);for(var row=0;row<this.moduleCount;row++){this.modules[row]=new Array(this.moduleCount);for(var col=0;col<this.moduleCount;col++){this.modules[row][col]=null;}}
this.setupPositionProbePattern(0,0);this.setupPositionProbePattern(this.moduleCount-7,0);this.setupPositionProbePattern(0,this.moduleCount-7);this.setupPositionAdjustPattern();this.setupTimingPattern();this.setupTypeInfo(test,maskPattern);if(this.typeNumber>=7){this.setupTypeNumber(test);}
if(this.dataCache==null){this.dataCache=QRCodeModel.createData(this.typeNumber,this.errorCorrectLevel,this.dataList);}
this.mapData(this.dataCache,maskPattern);},setupPositionProbePattern:function(row,col){for(var r=-1;r<=7;r++){if(row+r<=-1||this.moduleCount<=row+r)continue;for(var c=-1;c<=7;c++){if(col+c<=-1||this.moduleCount<=col+c)continue;if((0<=r&&r<=6&&(c==0||c==6))||(0<=c&&c<=6&&(r==0||r==6))||(2<=r&&r<=4&&2<=c&&c<=4)){this.modules[row+r][col+c]=true;}else{this.modules[row+r][col+c]=false;}}}},getBestMaskPattern:function(){var minLostPoint=0;var pattern=0;for(var i=0;i<8;i++){this.makeImpl(true,i);var lostPoint=QRUtil.getLostPoint(this);if(i==0||minLostPoint>lostPoint){minLostPoint=lostPoint;pattern=i;}}
return pattern;},createMovieClip:function(target_mc,instance_name,depth){var qr_mc=target_mc.createEmptyMovieClip(instance_name,depth);var cs=1;this.make();for(var row=0;row<this.modules.length;row++){var y=row*cs;for(var col=0;col<this.modules[row].length;col++){var x=col*cs;var dark=this.modules[row][col];if(dark){qr_mc.beginFill(0,100);qr_mc.moveTo(x,y);qr_mc.lineTo(x+cs,y);qr_mc.lineTo(x+cs,y+cs);qr_mc.lineTo(x,y+cs);qr_mc.endFill();}}}
return qr_mc;},setupTimingPattern:function(){for(var r=8;r<this.moduleCount-8;r++){if(this.modules[r][6]!=null){continue;}
this.modules[r][6]=(r%2==0);}
for(var c=8;c<this.moduleCount-8;c++){if(this.modules[6][c]!=null){continue;}
this.modules[6][c]=(c%2==0);}},setupPositionAdjustPattern:function(){var pos=QRUtil.getPatternPosition(this.typeNumber);for(var i=0;i<pos.length;i++){for(var j=0;j<pos.length;j++){var row=pos[i];var col=pos[j];if(this.modules[row][col]!=null){continue;}
for(var r=-2;r<=2;r++){for(var c=-2;c<=2;c++){if(r==-2||r==2||c==-2||c==2||(r==0&&c==0)){this.modules[row+r][col+c]=true;}else{this.modules[row+r][col+c]=false;}}}}}},setupTypeNumber:function(test){var bits=QRUtil.getBCHTypeNumber(this.typeNumber);for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[Math.floor(i/3)][i%3+this.moduleCount-8-3]=mod;}
for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[i%3+this.moduleCount-8-3][Math.floor(i/3)]=mod;}},setupTypeInfo:function(test,maskPattern){var data=(this.errorCorrectLevel<<3)|maskPattern;var bits=QRUtil.getBCHTypeInfo(data);for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<6){this.modules[i][8]=mod;}else if(i<8){this.modules[i+1][8]=mod;}else{this.modules[this.moduleCount-15+i][8]=mod;}}
for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<8){this.modules[8][this.moduleCount-i-1]=mod;}else if(i<9){this.modules[8][15-i-1+1]=mod;}else{this.modules[8][15-i-1]=mod;}}
this.modules[this.moduleCount-8][8]=(!test);},mapData:function(data,maskPattern){var inc=-1;var row=this.moduleCount-1;var bitIndex=7;var byteIndex=0;for(var col=this.moduleCount-1;col>0;col-=2){if(col==6)col--;while(true){for(var c=0;c<2;c++){if(this.modules[row][col-c]==null){var dark=false;if(byteIndex<data.length){dark=(((data[byteIndex]>>>bitIndex)&1)==1);}
var mask=QRUtil.getMask(maskPattern,row,col-c);if(mask){dark=!dark;}
this.modules[row][col-c]=dark;bitIndex--;if(bitIndex==-1){byteIndex++;bitIndex=7;}}}
row+=inc;if(row<0||this.moduleCount<=row){row-=inc;inc=-inc;break;}}}}};QRCodeModel.PAD0=0xEC;QRCodeModel.PAD1=0x11;QRCodeModel.createData=function(typeNumber,errorCorrectLevel,dataList){var rsBlocks=QRRSBlock.getRSBlocks(typeNumber,errorCorrectLevel);var buffer=new QRBitBuffer();for(var i=0;i<dataList.length;i++){var data=dataList[i];buffer.put(data.mode,4);buffer.put(data.getLength(),QRUtil.getLengthInBits(data.mode,typeNumber));data.write(buffer);}
var totalDataCount=0;for(var i=0;i<rsBlocks.length;i++){totalDataCount+=rsBlocks[i].dataCount;}
if(buffer.getLengthInBits()>totalDataCount*8){throw new Error("code length overflow. ("
+buffer.getLengthInBits()
+">"
+totalDataCount*8
+")");}
if(buffer.getLengthInBits()+4<=totalDataCount*8){buffer.put(0,4);}
while(buffer.getLengthInBits()%8!=0){buffer.putBit(false);}
while(true){if(buffer.getLengthInBits()>=totalDataCount*8){break;}
buffer.put(QRCodeModel.PAD0,8);if(buffer.getLengthInBits()>=totalDataCount*8){break;}
buffer.put(QRCodeModel.PAD1,8);}
return QRCodeModel.createBytes(buffer,rsBlocks);};QRCodeModel.createBytes=function(buffer,rsBlocks){var offset=0;var maxDcCount=0;var maxEcCount=0;var dcdata=new Array(rsBlocks.length);var ecdata=new Array(rsBlocks.length);for(var r=0;r<rsBlocks.length;r++){var dcCount=rsBlocks[r].dataCount;var ecCount=rsBlocks[r].totalCount-dcCount;maxDcCount=Math.max(maxDcCount,dcCount);maxEcCount=Math.max(maxEcCount,ecCount);dcdata[r]=new Array(dcCount);for(var i=0;i<dcdata[r].length;i++){dcdata[r][i]=0xff&buffer.buffer[i+offset];}
offset+=dcCount;var rsPoly=QRUtil.getErrorCorrectPolynomial(ecCount);var rawPoly=new QRPolynomial(dcdata[r],rsPoly.getLength()-1);var modPoly=rawPoly.mod(rsPoly);ecdata[r]=new Array(rsPoly.getLength()-1);for(var i=0;i<ecdata[r].length;i++){var modIndex=i+modPoly.getLength()-ecdata[r].length;ecdata[r][i]=(modIndex>=0)?modPoly.get(modIndex):0;}}
var totalCodeCount=0;for(var i=0;i<rsBlocks.length;i++){totalCodeCount+=rsBlocks[i].totalCount;}
var data=new Array(totalCodeCount);var index=0;for(var i=0;i<maxDcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<dcdata[r].length){data[index++]=dcdata[r][i];}}}
for(var i=0;i<maxEcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<ecdata[r].length){data[index++]=ecdata[r][i];}}}
return data;};var QRMode={MODE_NUMBER:1<<0,MODE_ALPHA_NUM:1<<1,MODE_8BIT_BYTE:1<<2,MODE_KANJI:1<<3};var QRErrorCorrectLevel={L:1,M:0,Q:3,H:2};var QRMaskPattern={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var QRUtil={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:(1<<10)|(1<<8)|(1<<5)|(1<<4)|(1<<2)|(1<<1)|(1<<0),G18:(1<<12)|(1<<11)|(1<<10)|(1<<9)|(1<<8)|(1<<5)|(1<<2)|(1<<0),G15_MASK:(1<<14)|(1<<12)|(1<<10)|(1<<4)|(1<<1),getBCHTypeInfo:function(data){var d=data<<10;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)>=0){d^=(QRUtil.G15<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)));}
return((data<<10)|d)^QRUtil.G15_MASK;},getBCHTypeNumber:function(data){var d=data<<12;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)>=0){d^=(QRUtil.G18<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)));}
return(data<<12)|d;},getBCHDigit:function(data){var digit=0;while(data!=0){digit++;data>>>=1;}
return digit;},getPatternPosition:function(typeNumber){return QRUtil.PATTERN_POSITION_TABLE[typeNumber-1];},getMask:function(maskPattern,i,j){switch(maskPattern){case QRMaskPattern.PATTERN000:return(i+j)%2==0;case QRMaskPattern.PATTERN001:return i%2==0;case QRMaskPattern.PATTERN010:return j%3==0;case QRMaskPattern.PATTERN011:return(i+j)%3==0;case QRMaskPattern.PATTERN100:return(Math.floor(i/2)+Math.floor(j/3))%2==0;case QRMaskPattern.PATTERN101:return(i*j)%2+(i*j)%3==0;case QRMaskPattern.PATTERN110:return((i*j)%2+(i*j)%3)%2==0;case QRMaskPattern.PATTERN111:return((i*j)%3+(i+j)%2)%2==0;default:throw new Error("bad maskPattern:"+maskPattern);}},getErrorCorrectPolynomial:function(errorCorrectLength){var a=new QRPolynomial([1],0);for(var i=0;i<errorCorrectLength;i++){a=a.multiply(new QRPolynomial([1,QRMath.gexp(i)],0));}
return a;},getLengthInBits:function(mode,type){if(1<=type&&type<10){switch(mode){case QRMode.MODE_NUMBER:return 10;case QRMode.MODE_ALPHA_NUM:return 9;case QRMode.MODE_8BIT_BYTE:return 8;case QRMode.MODE_KANJI:return 8;default:throw new Error("mode:"+mode);}}else if(type<27){switch(mode){case QRMode.MODE_NUMBER:return 12;case QRMode.MODE_ALPHA_NUM:return 11;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 10;default:throw new Error("mode:"+mode);}}else if(type<41){switch(mode){case QRMode.MODE_NUMBER:return 14;case QRMode.MODE_ALPHA_NUM:return 13;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 12;default:throw new Error("mode:"+mode);}}else{throw new Error("type:"+type);}},getLostPoint:function(qrCode){var moduleCount=qrCode.getModuleCount();var lostPoint=0;for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount;col++){var sameCount=0;var dark=qrCode.isDark(row,col);for(var r=-1;r<=1;r++){if(row+r<0||moduleCount<=row+r){continue;}
for(var c=-1;c<=1;c++){if(col+c<0||moduleCount<=col+c){continue;}
if(r==0&&c==0){continue;}
if(dark==qrCode.isDark(row+r,col+c)){sameCount++;}}}
if(sameCount>5){lostPoint+=(3+sameCount-5);}}}
for(var row=0;row<moduleCount-1;row++){for(var col=0;col<moduleCount-1;col++){var count=0;if(qrCode.isDark(row,col))count++;if(qrCode.isDark(row+1,col))count++;if(qrCode.isDark(row,col+1))count++;if(qrCode.isDark(row+1,col+1))count++;if(count==0||count==4){lostPoint+=3;}}}
for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount-6;col++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row,col+1)&&qrCode.isDark(row,col+2)&&qrCode.isDark(row,col+3)&&qrCode.isDark(row,col+4)&&!qrCode.isDark(row,col+5)&&qrCode.isDark(row,col+6)){lostPoint+=40;}}}
for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount-6;row++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row+1,col)&&qrCode.isDark(row+2,col)&&qrCode.isDark(row+3,col)&&qrCode.isDark(row+4,col)&&!qrCode.isDark(row+5,col)&&qrCode.isDark(row+6,col)){lostPoint+=40;}}}
var darkCount=0;for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount;row++){if(qrCode.isDark(row,col)){darkCount++;}}}
var ratio=Math.abs(100*darkCount/moduleCount/moduleCount-50)/5;lostPoint+=ratio*10;return lostPoint;}};var QRMath={glog:function(n){if(n<1){throw new Error("glog("+n+")");}
return QRMath.LOG_TABLE[n];},gexp:function(n){while(n<0){n+=255;}
while(n>=256){n-=255;}
return QRMath.EXP_TABLE[n];},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)};for(var i=0;i<8;i++){QRMath.EXP_TABLE[i]=1<<i;}
for(var i=8;i<256;i++){QRMath.EXP_TABLE[i]=QRMath.EXP_TABLE[i-4]^QRMath.EXP_TABLE[i-5]^QRMath.EXP_TABLE[i-6]^QRMath.EXP_TABLE[i-8];}
for(var i=0;i<255;i++){QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]]=i;}
function QRPolynomial(num,shift){if(num.length==undefined){throw new Error(num.length+"/"+shift);}
var offset=0;while(offset<num.length&&num[offset]==0){offset++;}
this.num=new Array(num.length-offset+shift);for(var i=0;i<num.length-offset;i++){this.num[i]=num[i+offset];}}
QRPolynomial.prototype={get:function(index){return this.num[index];},getLength:function(){return this.num.length;},multiply:function(e){var num=new Array(this.getLength()+e.getLength()-1);for(var i=0;i<this.getLength();i++){for(var j=0;j<e.getLength();j++){num[i+j]^=QRMath.gexp(QRMath.glog(this.get(i))+QRMath.glog(e.get(j)));}}
return new QRPolynomial(num,0);},mod:function(e){if(this.getLength()-e.getLength()<0){return this;}
var ratio=QRMath.glog(this.get(0))-QRMath.glog(e.get(0));var num=new Array(this.getLength());for(var i=0;i<this.getLength();i++){num[i]=this.get(i);}
for(var i=0;i<e.getLength();i++){num[i]^=QRMath.gexp(QRMath.glog(e.get(i))+ratio);}
return new QRPolynomial(num,0).mod(e);}};function QRRSBlock(totalCount,dataCount){this.totalCount=totalCount;this.dataCount=dataCount;}
QRRSBlock.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]];QRRSBlock.getRSBlocks=function(typeNumber,errorCorrectLevel){var rsBlock=QRRSBlock.getRsBlockTable(typeNumber,errorCorrectLevel);if(rsBlock==undefined){throw new Error("bad rs block @ typeNumber:"+typeNumber+"/errorCorrectLevel:"+errorCorrectLevel);}
var length=rsBlock.length/3;var list=[];for(var i=0;i<length;i++){var count=rsBlock[i*3+0];var totalCount=rsBlock[i*3+1];var dataCount=rsBlock[i*3+2];for(var j=0;j<count;j++){list.push(new QRRSBlock(totalCount,dataCount));}}
return list;};QRRSBlock.getRsBlockTable=function(typeNumber,errorCorrectLevel){switch(errorCorrectLevel){case QRErrorCorrectLevel.L:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+0];case QRErrorCorrectLevel.M:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+1];case QRErrorCorrectLevel.Q:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+2];case QRErrorCorrectLevel.H:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+3];default:return undefined;}};function QRBitBuffer(){this.buffer=[];this.length=0;}
QRBitBuffer.prototype={get:function(index){var bufIndex=Math.floor(index/8);return((this.buffer[bufIndex]>>>(7-index%8))&1)==1;},put:function(num,length){for(var i=0;i<length;i++){this.putBit(((num>>>(length-i-1))&1)==1);}},getLengthInBits:function(){return this.length;},putBit:function(bit){var bufIndex=Math.floor(this.length/8);if(this.buffer.length<=bufIndex){this.buffer.push(0);}
if(bit){this.buffer[bufIndex]|=(0x80>>>(this.length%8));}
this.length++;}};var QRCodeLimitLength=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]];

function _getTypeNumber(sText, nCorrectLevel) {
	var nType = 1;
	var length = _getUTF8Length(sText);

	for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
		var nLimit = 0;

		switch (nCorrectLevel) {
			case QRErrorCorrectLevel.L :
				nLimit = QRCodeLimitLength[i][0];
				break;
			case QRErrorCorrectLevel.M :
				nLimit = QRCodeLimitLength[i][1];
				break;
			case QRErrorCorrectLevel.Q :
				nLimit = QRCodeLimitLength[i][2];
				break;
			case QRErrorCorrectLevel.H :
				nLimit = QRCodeLimitLength[i][3];
				break;
		}

		if (length <= nLimit) {
			break;
		} else {
			nType++;
		}
	}

	if (nType > QRCodeLimitLength.length) {
		throw new Error("Too long data");
	}

	return nType;
}

function _getUTF8Length(sText) {
	var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
	return replacedText.length + (replacedText.length != sText ? 3 : 0);
}

// ---------- Theme toggle ----------
const rootEl = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function applyTheme(theme) {
  rootEl.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
applyTheme(savedTheme || (prefersLight ? 'light' : 'dark'));

themeToggle.addEventListener('click', () => {
  const next = rootEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  themeIcon.classList.remove('animate');
  void themeIcon.offsetWidth;
  themeIcon.classList.add('animate');
  applyTheme(next);
});

// ---------- Tabs ----------
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tool-page').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ---------- Password generator ----------
const CHARSETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
};

const SIMILAR = /[l1IO0]/g;
const AMBIGUOUS = /[{}\[\]()\/\\'"`~,;:.<>|]/g;

const lengthRange = document.getElementById('lengthRange');
const lengthValue = document.getElementById('lengthValue');
const optUpper = document.getElementById('optUpper');
const optLower = document.getElementById('optLower');
const optNumbers = document.getElementById('optNumbers');
const optSymbols = document.getElementById('optSymbols');
const optExcludeSimilar = document.getElementById('optExcludeSimilar');
const optExcludeAmbiguous = document.getElementById('optExcludeAmbiguous');
const pwField = document.getElementById('pwField');
const strengthFill = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');
const qtyInput = document.getElementById('qtyInput');
const batchList = document.getElementById('batchList');
const toast = document.getElementById('toast');

function secureRandomInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function buildPools() {
  const pools = [];
  if (optUpper.checked) pools.push(CHARSETS.upper);
  if (optLower.checked) pools.push(CHARSETS.lower);
  if (optNumbers.checked) pools.push(CHARSETS.numbers);
  if (optSymbols.checked) pools.push(CHARSETS.symbols);

  return pools.map(pool => {
    if (optExcludeSimilar.checked) pool = pool.replace(SIMILAR, '');
    if (optExcludeAmbiguous.checked) pool = pool.replace(AMBIGUOUS, '');
    return pool;
  }).filter(pool => pool.length > 0);
}

function generatePassword() {
  const pools = buildPools();
  const length = parseInt(lengthRange.value, 10);

  if (pools.length === 0) {
    return null;
  }

  const allChars = pools.join('');
  const result = [];

  // guarantee at least one char from each selected pool
  pools.forEach(pool => {
    if (result.length < length) {
      result.push(pool[secureRandomInt(pool.length)]);
    }
  });

  while (result.length < length) {
    result.push(allChars[secureRandomInt(allChars.length)]);
  }

  // shuffle (Fisher-Yates, crypto-backed)
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join('');
}

function calcStrength(password) {
  if (!password) return { score: 0, label: 'Sem opções selecionadas', color: 'var(--bad)' };

  let variety = 0;
  if (/[A-Z]/.test(password)) variety++;
  if (/[a-z]/.test(password)) variety++;
  if (/[0-9]/.test(password)) variety++;
  if (/[^A-Za-z0-9]/.test(password)) variety++;

  const entropyBits = Math.log2(Math.pow(variety * 20, password.length) || 1);
  const lengthScore = Math.min(password.length / 24, 1);
  const varietyScore = variety / 4;
  const combined = (lengthScore * 0.6 + varietyScore * 0.4);

  let label, color;
  if (combined < 0.35) { label = 'Fraca'; color = 'var(--bad)'; }
  else if (combined < 0.6) { label = 'Razoável'; color = 'var(--warn)'; }
  else if (combined < 0.85) { label = 'Forte'; color = 'var(--good)'; }
  else { label = 'Muito forte'; color = 'var(--good)'; }

  return { score: Math.round(combined * 100), label, color, entropyBits };
}

function updateStrengthUI(password) {
  const s = calcStrength(password);
  strengthFill.style.width = s.score + '%';
  strengthFill.style.background = s.color;
  strengthLabel.textContent = password
    ? `Força: ${s.label} (${Math.round(s.entropyBits)} bits de entropia)`
    : `Força: ${s.label}`;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1400);
}

function flashCopied(btn) {
  if (!btn || btn.dataset.flashing) return;
  btn.dataset.flashing = '1';
  const original = btn.textContent;
  const isIcon = btn.classList.contains('icon-btn');
  btn.textContent = isIcon ? '✓' : '✓ Copiado';
  btn.classList.add('copied');
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove('copied');
    delete btn.dataset.flashing;
  }, 1100);
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copiado!');
    if (btn) flashCopied(btn);
  });
}

function refreshMain() {
  const pw = generatePassword();
  if (pw === null) {
    pwField.value = '';
    pwField.placeholder = 'Seleciona pelo menos um tipo de carater';
    updateStrengthUI(null);
    return;
  }
  pwField.value = pw;
  updateStrengthUI(pw);
}

function renderBatch() {
  const qty = Math.max(1, Math.min(20, parseInt(qtyInput.value, 10) || 1));
  batchList.innerHTML = '';

  if (qty <= 1) {
    refreshMain();
    return;
  }

  const pools = buildPools();
  if (pools.length === 0) {
    pwField.value = '';
    pwField.placeholder = 'Seleciona pelo menos um tipo de carater';
    updateStrengthUI(null);
    return;
  }

  pwField.value = generatePassword();
  updateStrengthUI(pwField.value);

  for (let i = 0; i < qty; i++) {
    const pw = generatePassword();
    const item = document.createElement('div');
    item.className = 'batch-item';
    const span = document.createElement('span');
    span.textContent = pw;
    const btn = document.createElement('button');
    btn.textContent = 'Copiar';
    btn.addEventListener('click', () => copyToClipboard(pw, btn));
    item.appendChild(span);
    item.appendChild(btn);
    batchList.appendChild(item);
  }
}

lengthRange.addEventListener('input', () => {
  lengthValue.textContent = lengthRange.value;
  renderBatch();
});

[optUpper, optLower, optNumbers, optSymbols, optExcludeSimilar, optExcludeAmbiguous].forEach(el => {
  el.addEventListener('change', renderBatch);
});

document.getElementById('generateBtn').addEventListener('click', renderBatch);
document.getElementById('regenBtn').addEventListener('click', renderBatch);
qtyInput.addEventListener('change', renderBatch);
document.getElementById('copyBtn').addEventListener('click', (e) => {
  if (pwField.value) copyToClipboard(pwField.value, e.currentTarget);
});
document.getElementById('copyBtnMobile').addEventListener('click', (e) => {
  if (pwField.value) copyToClipboard(pwField.value, e.currentTarget);
});

// initial generation
renderBatch();

// ---------- Base64 ----------
const b64Input = document.getElementById('b64Input');
const b64Output = document.getElementById('b64Output');
const b64Error = document.getElementById('b64Error');
const b64ModeEncode = document.getElementById('b64ModeEncode');
const b64ModeDecode = document.getElementById('b64ModeDecode');
let b64Mode = 'encode';

function b64Encode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

function b64Decode(str) {
  const binary = atob(str);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function setMode(encodeBtn, decodeBtn, mode) {
  encodeBtn.classList.toggle('active', mode === 'encode');
  decodeBtn.classList.toggle('active', mode === 'decode');
}

b64ModeEncode.addEventListener('click', () => { b64Mode = 'encode'; setMode(b64ModeEncode, b64ModeDecode, b64Mode); });
b64ModeDecode.addEventListener('click', () => { b64Mode = 'decode'; setMode(b64ModeEncode, b64ModeDecode, b64Mode); });

document.getElementById('b64ConvertBtn').addEventListener('click', () => {
  b64Error.textContent = '';
  try {
    b64Output.value = b64Mode === 'encode' ? b64Encode(b64Input.value) : b64Decode(b64Input.value);
  } catch (e) {
    b64Output.value = '';
    b64Error.textContent = 'Não foi possível converter: entrada inválida.';
  }
});

document.getElementById('b64CopyBtn').addEventListener('click', (e) => {
  if (b64Output.value) copyToClipboard(b64Output.value, e.currentTarget);
});

// ---------- Hash generator ----------
const hashInput = document.getElementById('hashInput');

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function updateHashes() {
  const text = hashInput.value;
  const data = new TextEncoder().encode(text);
  const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

  document.querySelector('.hash-value[data-algo="MD5"]').textContent = md5(text);

  for (const algo of algos) {
    const digest = await crypto.subtle.digest(algo, data);
    document.querySelector(`.hash-value[data-algo="${algo}"]`).textContent = bufferToHex(digest);
  }
}

document.querySelectorAll('#hashList button').forEach(btn => {
  btn.addEventListener('click', () => {
    const value = document.querySelector(`.hash-value[data-algo="${btn.dataset.algo}"]`).textContent;
    if (value) copyToClipboard(value, btn);
  });
});

hashInput.addEventListener('input', updateHashes);
updateHashes();

// MD5 implementation (public domain, RFC 1321)
function md5(string) {
  function rotateLeft(x, c) { return (x << c) | (x >>> (32 - c)); }
  function addUnsigned(x, y) {
    const x4 = x & 0x40000000, y4 = y & 0x40000000;
    const x8 = x & 0x80000000, y8 = y & 0x80000000;
    const result = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF);
    if (x4 & y4) return result ^ 0x80000000 ^ x8 ^ y8;
    if (x4 | y4) {
      if (result & 0x40000000) return result ^ 0xC0000000 ^ x8 ^ y8;
      return result ^ 0x40000000 ^ x8 ^ y8;
    }
    return result ^ x8 ^ y8;
  }
  const F = (x, y, z) => (x & y) | (~x & z);
  const G = (x, y, z) => (x & z) | (y & ~z);
  const H = (x, y, z) => x ^ y ^ z;
  const I = (x, y, z) => y ^ (x | ~z);
  function FF(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
  function GG(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
  function HH(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
  function II(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }

  function convertToWordArray(str) {
    const msgLength = str.length;
    const temp1 = msgLength + 8;
    const temp2 = (temp1 - (temp1 % 64)) / 64;
    const numWords = (temp2 + 1) * 16;
    const wordArray = new Array(numWords).fill(0);
    let byteCount = 0;
    while (byteCount < msgLength) {
      const wordCount = (byteCount - (byteCount % 4)) / 4;
      const bytePos = (byteCount % 4) * 8;
      wordArray[wordCount] = wordArray[wordCount] | (str.charCodeAt(byteCount) << bytePos);
      byteCount++;
    }
    const wordCount = (byteCount - (byteCount % 4)) / 4;
    const bytePos = (byteCount % 4) * 8;
    wordArray[wordCount] = wordArray[wordCount] | (0x80 << bytePos);
    wordArray[numWords - 2] = msgLength << 3;
    wordArray[numWords - 1] = msgLength >>> 29;
    return wordArray;
  }

  function wordToHex(value) {
    let hex = '';
    for (let i = 0; i <= 3; i++) {
      const byte = (value >>> (i * 8)) & 255;
      hex += ('0' + byte.toString(16)).slice(-2);
    }
    return hex;
  }

  const utf8 = unescape(encodeURIComponent(string));
  const x = convertToWordArray(utf8);
  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;

    a = FF(a, b, c, d, x[k + 0], 7, 0xD76AA478);  d = FF(d, a, b, c, x[k + 1], 12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070DB);  b = FF(b, c, d, a, x[k + 3], 22, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], 7, 0xF57C0FAF);   d = FF(d, a, b, c, x[k + 5], 12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], 17, 0xA8304613);  b = FF(b, c, d, a, x[k + 7], 22, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098D8);   d = FF(d, a, b, c, x[k + 9], 12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], 17, 0xFFFF5BB1); b = FF(b, c, d, a, x[k + 11], 22, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6B901122);  d = FF(d, a, b, c, x[k + 13], 12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xA679438E); b = FF(b, c, d, a, x[k + 15], 22, 0x49B40821);

    a = GG(a, b, c, d, x[k + 1], 5, 0xF61E2562);   d = GG(d, a, b, c, x[k + 6], 9, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265E5A51); b = GG(b, c, d, a, x[k + 0], 20, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], 5, 0xD62F105D);   d = GG(d, a, b, c, x[k + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xD8A1E681); b = GG(b, c, d, a, x[k + 4], 20, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21E1CDE6);   d = GG(d, a, b, c, x[k + 14], 9, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xF4D50D87);  b = GG(b, c, d, a, x[k + 8], 20, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], 5, 0xA9E3E905);  d = GG(d, a, b, c, x[k + 2], 9, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676F02D9);  b = GG(b, c, d, a, x[k + 12], 20, 0x8D2A4C8A);

    a = HH(a, b, c, d, x[k + 5], 4, 0xFFFA3942);   d = HH(d, a, b, c, x[k + 8], 11, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6D9D6122); b = HH(b, c, d, a, x[k + 14], 23, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], 4, 0xA4BEEA44);   d = HH(d, a, b, c, x[k + 4], 11, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xF6BB4B60);  b = HH(b, c, d, a, x[k + 10], 23, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289B7EC6);  d = HH(d, a, b, c, x[k + 0], 11, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], 16, 0xD4EF3085);  b = HH(b, c, d, a, x[k + 6], 23, 0x04881D05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xD9D4D039);   d = HH(d, a, b, c, x[k + 12], 11, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1FA27CF8); b = HH(b, c, d, a, x[k + 2], 23, 0xC4AC5665);

    a = II(a, b, c, d, x[k + 0], 6, 0xF4292244);   d = II(d, a, b, c, x[k + 7], 10, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], 15, 0xAB9423A7); b = II(b, c, d, a, x[k + 5], 21, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655B59C3);  d = II(d, a, b, c, x[k + 3], 10, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], 15, 0xFFEFF47D); b = II(b, c, d, a, x[k + 1], 21, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6FA87E4F);   d = II(d, a, b, c, x[k + 15], 10, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], 15, 0xA3014314);  b = II(b, c, d, a, x[k + 13], 21, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], 6, 0xF7537E82);   d = II(d, a, b, c, x[k + 11], 10, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2AD7D2BB);  b = II(b, c, d, a, x[k + 9], 21, 0xEB86D391);

    a = addUnsigned(a, AA); b = addUnsigned(b, BB); c = addUnsigned(c, CC); d = addUnsigned(d, DD);
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

// ---------- JSON formatter ----------
const jsonInput = document.getElementById('jsonInput');
const jsonOutput = document.getElementById('jsonOutput');
const jsonError = document.getElementById('jsonError');

function withParsedJson(fn) {
  jsonError.textContent = '';
  try {
    const parsed = JSON.parse(jsonInput.value);
    jsonOutput.value = fn(parsed);
  } catch (e) {
    jsonOutput.value = '';
    jsonError.textContent = 'JSON inválido: ' + e.message;
  }
}

document.getElementById('jsonFormatBtn').addEventListener('click', () => {
  withParsedJson(parsed => JSON.stringify(parsed, null, 2));
});

document.getElementById('jsonMinifyBtn').addEventListener('click', () => {
  withParsedJson(parsed => JSON.stringify(parsed));
});

document.getElementById('jsonCopyBtn').addEventListener('click', (e) => {
  if (jsonOutput.value) copyToClipboard(jsonOutput.value, e.currentTarget);
});

// ---------- URL encoder/decoder ----------
const urlInput = document.getElementById('urlInput');
const urlOutput = document.getElementById('urlOutput');
const urlError = document.getElementById('urlError');
const urlModeEncode = document.getElementById('urlModeEncode');
const urlModeDecode = document.getElementById('urlModeDecode');
let urlMode = 'encode';

urlModeEncode.addEventListener('click', () => { urlMode = 'encode'; setMode(urlModeEncode, urlModeDecode, urlMode); });
urlModeDecode.addEventListener('click', () => { urlMode = 'decode'; setMode(urlModeEncode, urlModeDecode, urlMode); });

document.getElementById('urlConvertBtn').addEventListener('click', () => {
  urlError.textContent = '';
  try {
    urlOutput.value = urlMode === 'encode' ? encodeURIComponent(urlInput.value) : decodeURIComponent(urlInput.value);
  } catch (e) {
    urlOutput.value = '';
    urlError.textContent = 'Não foi possível converter: entrada inválida.';
  }
});

document.getElementById('urlCopyBtn').addEventListener('click', (e) => {
  if (urlOutput.value) copyToClipboard(urlOutput.value, e.currentTarget);
});

// ---------- UUID generator ----------
const uuidField = document.getElementById('uuidField');
const uuidUpper = document.getElementById('uuidUpper');
const uuidNoDashes = document.getElementById('uuidNoDashes');
const uuidQty = document.getElementById('uuidQty');
const uuidBatchList = document.getElementById('uuidBatchList');

function formatUuid(uuid) {
  if (uuidNoDashes.checked) uuid = uuid.replaceAll('-', '');
  if (uuidUpper.checked) uuid = uuid.toUpperCase();
  return uuid;
}

function renderUuidBatch() {
  const qty = Math.max(1, Math.min(20, parseInt(uuidQty.value, 10) || 1));
  uuidField.value = formatUuid(crypto.randomUUID());
  uuidBatchList.innerHTML = '';

  if (qty <= 1) return;

  for (let i = 0; i < qty; i++) {
    const value = formatUuid(crypto.randomUUID());
    const item = document.createElement('div');
    item.className = 'batch-item';
    const span = document.createElement('span');
    span.textContent = value;
    const btn = document.createElement('button');
    btn.textContent = 'Copiar';
    btn.addEventListener('click', () => copyToClipboard(value, btn));
    item.appendChild(span);
    item.appendChild(btn);
    uuidBatchList.appendChild(item);
  }
}

document.getElementById('uuidGenerateBtn').addEventListener('click', renderUuidBatch);
document.getElementById('uuidRegenBtn').addEventListener('click', renderUuidBatch);
uuidQty.addEventListener('change', renderUuidBatch);
uuidUpper.addEventListener('change', renderUuidBatch);
uuidNoDashes.addEventListener('change', renderUuidBatch);
document.getElementById('uuidCopyBtn').addEventListener('click', (e) => {
  if (uuidField.value) copyToClipboard(uuidField.value, e.currentTarget);
});
renderUuidBatch();

// ---------- Color converter ----------
const colorSwatch = document.getElementById('colorSwatch');
const colorPicker = document.getElementById('colorPicker');
const hexInput = document.getElementById('hexInput');
const rInput = document.getElementById('rInput');
const gInput = document.getElementById('gInput');
const bInput = document.getElementById('bInput');
const hInput = document.getElementById('hInput');
const sInput = document.getElementById('sInput');
const lInput = document.getElementById('lInput');

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function applyColor(rgb, source) {
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);

  colorSwatch.style.background = hex;
  if (source !== 'picker') colorPicker.value = hex;
  if (source !== 'hex') hexInput.value = hex;
  if (source !== 'rgb') { rInput.value = rgb.r; gInput.value = rgb.g; bInput.value = rgb.b; }
  if (source !== 'hsl') { hInput.value = hsl.h; sInput.value = hsl.s; lInput.value = hsl.l; }
}

colorPicker.addEventListener('input', () => {
  applyColor(hexToRgb(colorPicker.value), 'picker');
});

hexInput.addEventListener('change', () => {
  const rgb = hexToRgb(hexInput.value);
  if (rgb) applyColor(rgb, 'hex');
});

[rInput, gInput, bInput].forEach(el => {
  el.addEventListener('change', () => {
    const clamp = v => Math.max(0, Math.min(255, parseInt(v, 10) || 0));
    applyColor({ r: clamp(rInput.value), g: clamp(gInput.value), b: clamp(bInput.value) }, 'rgb');
  });
});

[hInput, sInput, lInput].forEach(el => {
  el.addEventListener('change', () => {
    const h = Math.max(0, Math.min(360, parseInt(hInput.value, 10) || 0));
    const s = Math.max(0, Math.min(100, parseInt(sInput.value, 10) || 0));
    const l = Math.max(0, Math.min(100, parseInt(lInput.value, 10) || 0));
    applyColor(hslToRgb({ h, s, l }), 'hsl');
  });
});

document.getElementById('hexCopyBtn').addEventListener('click', (e) => copyToClipboard(hexInput.value, e.currentTarget));

applyColor(hexToRgb('#7c5cff'), 'init');

// ---------- Cron expression parser/creator ----------
const CRON_MONTH_NAMES = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };
const CRON_DOW_NAMES = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
const MONTH_LABELS = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const DOW_LABELS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

function resolveCronToken(token, names) {
  token = token.trim().toUpperCase();
  if (names && token in names) return names[token];
  const n = parseInt(token, 10);
  return Number.isNaN(n) ? null : n;
}

function parseCronField(field, min, max, names) {
  const allowed = new Set();
  const parts = field.split(',');
  for (const part of parts) {
    let rangePart = part;
    let step = 1;
    if (part.includes('/')) {
      const [rp, st] = part.split('/');
      rangePart = rp;
      step = parseInt(st, 10);
      if (!Number.isInteger(step) || step <= 0) throw new Error(`Passo inválido em "${part}".`);
    }
    let start, end;
    if (rangePart === '*') {
      start = min; end = max;
    } else if (rangePart.includes('-')) {
      const [s, e] = rangePart.split('-');
      start = resolveCronToken(s, names);
      end = resolveCronToken(e, names);
    } else {
      start = end = resolveCronToken(rangePart, names);
    }
    if (start === null || end === null) throw new Error(`Valor inválido em "${part}".`);
    if (start < min || end > max || start > end) throw new Error(`Fora do intervalo ${min}-${max}: "${part}".`);
    for (let v = start; v <= end; v += step) allowed.add(v);
  }
  return allowed;
}

function parseCronExpression(expr) {
  const tokens = expr.trim().split(/\s+/);
  if (tokens.length !== 5) throw new Error('A expressão deve ter exatamente 5 campos: minuto hora dia-do-mês mês dia-da-semana.');
  const [minuteStr, hourStr, domStr, monthStr, dowStr] = tokens;
  const minute = parseCronField(minuteStr, 0, 59, null);
  const hour = parseCronField(hourStr, 0, 23, null);
  const dom = parseCronField(domStr, 1, 31, null);
  const month = parseCronField(monthStr, 1, 12, CRON_MONTH_NAMES);
  const dowRaw = parseCronField(dowStr, 0, 7, CRON_DOW_NAMES);
  const dow = new Set([...dowRaw].map(v => (v === 7 ? 0 : v)));
  return { minute, hour, dom, month, dow, domRestricted: domStr !== '*', dowRestricted: dowStr !== '*' };
}

function listLabel(set, max, min, labelFn) {
  if (set.size === max - min + 1) return null;
  const sorted = [...set].sort((a, b) => a - b);
  const labels = sorted.map(v => (labelFn ? labelFn(v) : v));
  if (labels.length === 1) return String(labels[0]);
  return labels.slice(0, -1).join(', ') + ' e ' + labels[labels.length - 1];
}

function describeCron(sets) {
  const { minute, hour, dom, month, dow, domRestricted, dowRestricted } = sets;
  const minuteFull = minute.size === 60;
  const hourFull = hour.size === 24;
  const monthFull = month.size === 12;
  const domFull = dom.size === 31;
  const dowFull = dow.size === 7;

  if (minuteFull && hourFull && domFull && monthFull && dowFull) {
    return 'Executa a cada minuto, todos os dias.';
  }
  if (minute.size === 1 && hourFull && domFull && monthFull && dowFull) {
    return `Executa a cada hora, ao minuto ${[...minute][0]}.`;
  }

  const parts = [];

  if (minute.size === 1 && hour.size === 1) {
    const hh = String([...hour][0]).padStart(2, '0');
    const mm = String([...minute][0]).padStart(2, '0');
    parts.push(`às ${hh}:${mm}`);
  } else {
    if (!minuteFull) parts.push(`no(s) minuto(s) ${listLabel(minute, 59, 0)}`);
    if (!hourFull) parts.push(`na(s) hora(s) ${listLabel(hour, 23, 0)}`);
  }

  if (!monthFull) parts.push(`em ${listLabel(month, 12, 1, v => MONTH_LABELS[v])}`);

  if (domRestricted && dowRestricted) {
    const domLabel = listLabel(dom, 31, 1) ?? 'qualquer dia';
    const dowLabel = listLabel(dow, 6, 0, v => DOW_LABELS[v]) ?? 'qualquer dia da semana';
    parts.push(`no dia ${domLabel} do mês ou à(s) ${dowLabel}`);
  } else if (domRestricted) {
    parts.push(`no dia ${listLabel(dom, 31, 1) ?? 'qualquer dia'} do mês`);
  } else if (dowRestricted) {
    parts.push(`à(s) ${listLabel(dow, 6, 0, v => DOW_LABELS[v]) ?? 'qualquer dia da semana'}`);
  }

  return 'Executa ' + (parts.length ? parts.join(', ') : 'a cada minuto') + '.';
}

function getCronNextRuns(sets, count, from) {
  const { minute, hour, dom, month, dow, domRestricted, dowRestricted } = sets;
  const minutesSorted = [...minute].sort((a, b) => a - b);
  const hoursSorted = [...hour].sort((a, b) => a - b);
  const timesOfDay = [];
  for (const h of hoursSorted) {
    for (const m of minutesSorted) timesOfDay.push(h * 60 + m);
  }
  timesOfDay.sort((a, b) => a - b);

  function dayMatches(date) {
    if (!month.has(date.getMonth() + 1)) return false;
    const domVal = date.getDate();
    const dowVal = date.getDay();
    if (domRestricted && dowRestricted) return dom.has(domVal) || dow.has(dowVal);
    if (domRestricted) return dom.has(domVal);
    if (dowRestricted) return dow.has(dowVal);
    return true;
  }

  const results = [];
  const maxDays = 366 * 5;
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const nowMinutes = from.getHours() * 60 + from.getMinutes();

  for (let d = 0; d <= maxDays && results.length < count; d++) {
    if (dayMatches(cursor)) {
      for (const tod of timesOfDay) {
        if (d === 0 && tod <= nowMinutes) continue;
        results.push(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), Math.floor(tod / 60), tod % 60));
        if (results.length >= count) break;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return results;
}

const cronExpression = document.getElementById('cronExpression');
const cronFieldEls = {
  minute: document.getElementById('cronMinute'),
  hour: document.getElementById('cronHour'),
  dom: document.getElementById('cronDom'),
  month: document.getElementById('cronMonth'),
  dow: document.getElementById('cronDow')
};
const cronDescriptionEl = document.getElementById('cronDescription');
const cronNextRunsEl = document.getElementById('cronNextRuns');

function renderCronNextRuns(sets) {
  cronNextRunsEl.innerHTML = '';
  const runs = getCronNextRuns(sets, 5, new Date());
  if (runs.length === 0) {
    cronNextRunsEl.innerHTML = '<div class="run-item">Não foram encontradas execuções nos próximos 5 anos.</div>';
    return;
  }
  runs.forEach(date => {
    const item = document.createElement('div');
    item.className = 'run-item';
    item.textContent = date.toLocaleString('pt-PT', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    cronNextRunsEl.appendChild(item);
  });
}

function renderCron(expr) {
  try {
    const sets = parseCronExpression(expr);
    cronDescriptionEl.textContent = describeCron(sets);
    cronDescriptionEl.style.color = '';
    renderCronNextRuns(sets);
  } catch (e) {
    cronDescriptionEl.textContent = e.message;
    cronDescriptionEl.style.color = 'var(--bad)';
    cronNextRunsEl.innerHTML = '';
  }
}

function syncCronFieldsFromExpression() {
  const tokens = cronExpression.value.trim().split(/\s+/);
  if (tokens.length === 5) {
    cronFieldEls.minute.value = tokens[0];
    cronFieldEls.hour.value = tokens[1];
    cronFieldEls.dom.value = tokens[2];
    cronFieldEls.month.value = tokens[3];
    cronFieldEls.dow.value = tokens[4];
  }
  renderCron(cronExpression.value);
}

function syncCronExpressionFromFields() {
  cronExpression.value = [
    cronFieldEls.minute.value.trim() || '*',
    cronFieldEls.hour.value.trim() || '*',
    cronFieldEls.dom.value.trim() || '*',
    cronFieldEls.month.value.trim() || '*',
    cronFieldEls.dow.value.trim() || '*'
  ].join(' ');
  renderCron(cronExpression.value);
}

cronExpression.addEventListener('input', syncCronFieldsFromExpression);
Object.values(cronFieldEls).forEach(el => el.addEventListener('input', syncCronExpressionFromFields));

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    cronExpression.value = btn.dataset.cron;
    syncCronFieldsFromExpression();
  });
});

document.getElementById('cronCopyBtn').addEventListener('click', (e) => {
  if (cronExpression.value) copyToClipboard(cronExpression.value, e.currentTarget);
});

syncCronFieldsFromExpression();

// ---------- QR code generator ----------
const qrText = document.getElementById('qrText');
const qrErrorLevel = document.getElementById('qrErrorLevel');
const qrSize = document.getElementById('qrSize');
const qrColorDark = document.getElementById('qrColorDark');
const qrColorLight = document.getElementById('qrColorLight');
const qrError = document.getElementById('qrError');
const qrCanvas = document.getElementById('qrCanvas');

const QR_LEVEL_MAP = { L: QRErrorCorrectLevel.L, M: QRErrorCorrectLevel.M, Q: QRErrorCorrectLevel.Q, H: QRErrorCorrectLevel.H };

function renderQrCode() {
  const text = qrText.value;
  qrError.textContent = '';

  if (!text) {
    qrCanvas.getContext('2d').clearRect(0, 0, qrCanvas.width, qrCanvas.height);
    return;
  }

  try {
    const level = QR_LEVEL_MAP[qrErrorLevel.value];
    const typeNumber = _getTypeNumber(text, level);
    const qr = new QRCodeModel(typeNumber, level);
    qr.addData(text);
    qr.make();

    const moduleCount = qr.getModuleCount();
    const size = parseInt(qrSize.value, 10);
    qrCanvas.width = size;
    qrCanvas.height = size;

    const ctx = qrCanvas.getContext('2d');
    const cellSize = size / moduleCount;

    ctx.fillStyle = qrColorLight.value;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = qrColorDark.value;

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(Math.floor(col * cellSize), Math.floor(row * cellSize), Math.ceil(cellSize), Math.ceil(cellSize));
        }
      }
    }
  } catch (e) {
    qrError.textContent = e.message === 'Too long data' ? 'Texto demasiado longo para um QR code.' : 'Não foi possível gerar o QR code.';
    qrCanvas.getContext('2d').clearRect(0, 0, qrCanvas.width, qrCanvas.height);
  }
}

let qrDebounce;
function scheduleQrRender() {
  clearTimeout(qrDebounce);
  qrDebounce = setTimeout(renderQrCode, 150);
}

qrText.addEventListener('input', scheduleQrRender);
[qrErrorLevel, qrSize, qrColorDark, qrColorLight].forEach(el => el.addEventListener('input', renderQrCode));

document.getElementById('qrDownloadBtn').addEventListener('click', () => {
  if (!qrText.value) return;
  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = qrCanvas.toDataURL('image/png');
  link.click();
});

renderQrCode();

// ---------- HEIC/HEIF ----------
// Fora do Safari nenhum browser abre HEIC, por isso o libheif vem do CDN — mas só
// na primeira vez que aparece um ficheiro destes. A imagem nunca sai do dispositivo.
const HEIC_DECODER_URL = 'https://cdn.jsdelivr.net/npm/libheif-js@1.23.2/libheif-wasm/libheif-bundle.js';
let heicDecoderPromise = null;

function isHeicFile(file) {
  return /^image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

function loadHeicDecoder() {
  if (heicDecoderPromise) return heicDecoderPromise;

  heicDecoderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = HEIC_DECODER_URL;
    script.onload = () => resolve(window.libheif);
    script.onerror = () => {
      script.remove();
      reject(new Error('não foi possível descarregar o descodificador HEIC'));
    };
    document.head.appendChild(script);
  }).then(async lib => {
    // o bundle wasm exporta uma fábrica; a versão em JS puro já vem montada
    let api = typeof lib === 'function' ? lib() : lib;
    if (api && typeof api.then === 'function') api = await api;
    if (!api || !api.HeifDecoder) throw new Error('descodificador HEIC inválido');
    return api;
  }).catch(e => {
    heicDecoderPromise = null; // sem rede agora, talvez à próxima
    throw e;
  });

  return heicDecoderPromise;
}

async function decodeHeicToCanvas(file) {
  const heif = await loadHeicDecoder();
  const images = new heif.HeifDecoder().decode(new Uint8Array(await file.arrayBuffer()));
  if (!images || !images.length) throw new Error('ficheiro HEIC sem imagens');

  const image = images[0];
  const canvas = document.createElement('canvas');
  canvas.width = image.get_width();
  canvas.height = image.get_height();
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  await new Promise((resolve, reject) => {
    image.display(imageData, data => (data ? resolve(data) : reject(new Error('erro a descodificar o HEIC'))));
  });
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// Devolve um ImageBitmap ou um canvas — para o drawImage dá no mesmo
async function decodeImageFile(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (e) {
      if (!isHeicFile(file)) throw new Error('formato não suportado pelo browser');
    }
  } else if (!isHeicFile(file)) {
    throw new Error('formato não suportado pelo browser');
  }
  return decodeHeicToCanvas(file);
}

// ---------- Image metadata cleaner ----------
const metaDrop = document.getElementById('metaDrop');
const metaInput = document.getElementById('metaInput');
const metaKeepIcc = document.getElementById('metaKeepIcc');
const metaFixOrientation = document.getElementById('metaFixOrientation');
const metaError = document.getElementById('metaError');
const metaResults = document.getElementById('metaResults');
const metaActions = document.getElementById('metaActions');

const metaCleaned = [];

function formatBytes(n) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(2) + ' MB';
}

// --- EXIF (TIFF) parsing, apenas o suficiente para mostrar o que está a ser removido ---
const EXIF_TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };

// Cada etiqueta traz o grupo onde aparece na lista do que foi removido
const IFD0_TAGS = {
  0x0112: { label: 'Orientação', group: 'Outros' },
  0x010f: { label: 'Marca', group: 'Dispositivo' },
  0x0110: { label: 'Modelo', group: 'Dispositivo' },
  0x0131: { label: 'Software', group: 'Dispositivo' },
  0x0132: { label: 'Data', group: 'Outros' },
  0x013b: { label: 'Autor', group: 'Outros' },
  0x8298: { label: 'Copyright', group: 'Outros' },
  0x010e: { label: 'Descrição', group: 'Outros' }
};

const EXIF_IFD_TAGS = {
  0x9003: { label: 'Data original', group: 'Outros' },
  0x9004: { label: 'Data de digitalização', group: 'Outros' },
  0xa434: { label: 'Lente', group: 'Dispositivo' },
  0x8827: { label: 'ISO', group: 'Dispositivo' },
  0xa430: { label: 'Dono da câmara', group: 'Dispositivo' },
  0xa431: { label: 'Nº de série', group: 'Dispositivo' },
  0x9286: { label: 'Comentário', group: 'Outros' }
};

const META_GROUPS = [
  { name: 'Localização', icon: '📍' },
  { name: 'Dispositivo', icon: '📷' },
  { name: 'Outros', icon: '📝' }
];

function readExifValue(dv, tiffStart, entry, little) {
  const type = dv.getUint16(entry + 2, little);
  const count = dv.getUint32(entry + 4, little);
  const size = EXIF_TYPE_SIZE[type];
  if (!size) return null;
  const total = size * count;
  const at = total <= 4 ? entry + 8 : tiffStart + dv.getUint32(entry + 8, little);
  if (at < 0 || at + total > dv.byteLength) return null;

  if (type === 2) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const c = dv.getUint8(at + i);
      if (c === 0) break;
      s += String.fromCharCode(c);
    }
    return s.trim();
  }
  if (type === 5 || type === 10) {
    const vals = [];
    for (let i = 0; i < count; i++) {
      const num = type === 5 ? dv.getUint32(at + i * 8, little) : dv.getInt32(at + i * 8, little);
      const den = type === 5 ? dv.getUint32(at + i * 8 + 4, little) : dv.getInt32(at + i * 8 + 4, little);
      vals.push(den === 0 ? 0 : num / den);
    }
    return count === 1 ? vals[0] : vals;
  }
  if (type === 3) return dv.getUint16(at, little);
  if (type === 4) return dv.getUint32(at, little);
  if (type === 9) return dv.getInt32(at, little);
  return null;
}

function readIfd(dv, ifdOffset, little, handler) {
  if (ifdOffset < 0 || ifdOffset + 2 > dv.byteLength) return 0;
  const count = dv.getUint16(ifdOffset, little);
  for (let i = 0; i < count; i++) {
    const entry = ifdOffset + 2 + i * 12;
    if (entry + 12 > dv.byteLength) break;
    handler(dv.getUint16(entry, little), entry);
  }
  return count;
}

function gpsToDecimal(parts, ref) {
  if (!Array.isArray(parts) || parts.length < 3) return null;
  const dec = parts[0] + parts[1] / 60 + parts[2] / 3600;
  return (ref === 'S' || ref === 'W') ? -dec : dec;
}

// Devolve { fields, orientation, tagCount, hasGps, hasThumbnail }
function parseExif(bytes, tiffStart) {
  const info = { fields: [], orientation: 1, tagCount: 0, hasGps: false, hasThumbnail: false };
  try {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const byteOrder = dv.getUint16(tiffStart);
    let little;
    if (byteOrder === 0x4949) little = true;
    else if (byteOrder === 0x4d4d) little = false;
    else return info;
    if (dv.getUint16(tiffStart + 2, little) !== 0x002a) return info;

    const ifd0 = tiffStart + dv.getUint32(tiffStart + 4, little);
    let exifPtr = 0;
    let gpsPtr = 0;

    info.tagCount += readIfd(dv, ifd0, little, (tag, entry) => {
      if (tag === 0x8769) { exifPtr = tiffStart + readExifValue(dv, tiffStart, entry, little); return; }
      if (tag === 0x8825) { gpsPtr = tiffStart + readExifValue(dv, tiffStart, entry, little); return; }
      const meta = IFD0_TAGS[tag];
      if (!meta) return;
      const value = readExifValue(dv, tiffStart, entry, little);
      if (value === null || value === '') return;
      if (tag === 0x0112) { info.orientation = value; return; }
      info.fields.push({ label: meta.label, group: meta.group, value: String(value) });
    });

    if (exifPtr > tiffStart) {
      info.tagCount += readIfd(dv, exifPtr, little, (tag, entry) => {
        const meta = EXIF_IFD_TAGS[tag];
        if (!meta) return;
        const value = readExifValue(dv, tiffStart, entry, little);
        if (value === null || value === '') return;
        if (tag === 0x9286 && typeof value !== 'string') return;
        info.fields.push({ label: meta.label, group: meta.group, value: String(value) });
      });
    }

    if (gpsPtr > tiffStart) {
      const gps = {};
      info.tagCount += readIfd(dv, gpsPtr, little, (tag, entry) => {
        if (tag >= 0x0001 && tag <= 0x0006) gps[tag] = readExifValue(dv, tiffStart, entry, little);
      });
      const lat = gpsToDecimal(gps[0x0002], gps[0x0001]);
      const lon = gpsToDecimal(gps[0x0004], gps[0x0003]);
      if (lat !== null && lon !== null) {
        info.hasGps = true;
        info.fields.push({ label: 'Coordenadas', group: 'Localização', value: lat.toFixed(5) + ', ' + lon.toFixed(5) });
        if (typeof gps[0x0006] === 'number') info.fields.push({ label: 'Altitude', group: 'Localização', value: gps[0x0006].toFixed(1) + ' m' });
      } else if (Object.keys(gps).length) {
        info.hasGps = true;
      }
    }

    // O IFD1 guarda a miniatura embutida — uma cópia da foto em pequeno
    const ifd1Ptr = ifd0 + 2 + dv.getUint16(ifd0, little) * 12;
    if (ifd1Ptr + 4 <= dv.byteLength && dv.getUint32(ifd1Ptr, little) !== 0) info.hasThumbnail = true;
  } catch (e) {
    /* metadados que não conseguimos ler continuam a ser removidos */
  }
  return info;
}

function asciiAt(bytes, offset, length) {
  let s = '';
  for (let i = 0; i < length && offset + i < bytes.length; i++) s += String.fromCharCode(bytes[offset + i]);
  return s;
}

function concatChunks(pieces) {
  let total = 0;
  pieces.forEach(p => { total += p.length; });
  const out = new Uint8Array(total);
  let at = 0;
  pieces.forEach(p => { out.set(p, at); at += p.length; });
  return out;
}

// --- Limpeza por formato: devolve { bytes, mime, removed, fields, orientation } ou null ---
function stripJpeg(bytes, keepIcc) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const pieces = [bytes.subarray(0, 2)];
  const removed = [];
  const fields = [];
  let orientation = 1;
  let offset = 2;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    if (marker === 0xff) { offset++; continue; }
    if (marker === 0xd9) { pieces.push(bytes.subarray(offset, offset + 2)); break; }
    if (marker === 0xda) {
      // a partir daqui são dados da imagem; cortamos no EOI para deixar cair
      // o que alguns telemóveis acrescentam no fim (2ª imagem, blocos próprios)
      let scanEnd = bytes.length;
      for (let i = offset + 2; i + 1 < bytes.length; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0xd9) { scanEnd = i + 2; break; }
      }
      pieces.push(bytes.subarray(offset, scanEnd));
      if (scanEnd < bytes.length) removed.push('Dados extra no fim do ficheiro');
      break;
    }
    if (offset + 4 > bytes.length) return null;
    const len = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const end = offset + 2 + len;
    if (len < 2 || end > bytes.length) return null;

    const isApp = marker >= 0xe0 && marker <= 0xef;
    let drop = false;

    if (isApp) {
      const tag = asciiAt(bytes, offset + 4, 32);
      if (marker === 0xe1 && tag.indexOf('Exif') === 0) {
        drop = true;
        const info = parseExif(bytes, offset + 10);
        orientation = info.orientation || 1;
        info.fields.forEach(f => fields.push(f));
        removed.push('EXIF');
        if (info.hasGps) removed.push('GPS');
        if (info.hasThumbnail) removed.push('Miniatura');
      } else if (marker === 0xe1 && tag.indexOf('http://ns.adobe.com/xap') === 0) {
        drop = true;
        removed.push('XMP');
      } else if (marker === 0xe2 && tag.indexOf('ICC_PROFILE') === 0) {
        drop = !keepIcc;
        if (drop) removed.push('Perfil ICC');
      } else if (marker === 0xed && tag.indexOf('Photoshop') === 0) {
        drop = true;
        removed.push('IPTC/Photoshop');
      } else if (marker === 0xe0 && tag.indexOf('JFIF') === 0) {
        drop = false; // densidade da imagem, sem dados pessoais
      } else if (marker === 0xee && tag.indexOf('Adobe') === 0) {
        drop = false; // necessário para interpretar as cores corretamente
      } else {
        drop = true;
        removed.push('APP' + (marker - 0xe0));
      }
    } else if (marker === 0xfe) {
      drop = true;
      removed.push('Comentário');
      const text = asciiAt(bytes, offset + 4, Math.min(len - 2, 120)).trim();
      if (text) fields.push({ label: 'Comentário', group: 'Outros', value: text });
    }

    if (!drop) pieces.push(bytes.subarray(offset, end));
    offset = end;
  }

  return { bytes: concatChunks(pieces), mime: 'image/jpeg', removed: removed, fields: fields, orientation: orientation };
}

const PNG_META_CHUNKS = ['tEXt', 'zTXt', 'iTXt', 'eXIf', 'tIME'];

function readPngText(bytes, start, len, type) {
  const raw = asciiAt(bytes, start, Math.min(len, 400));
  const nul = raw.indexOf('\0');
  if (nul < 1) return null;
  const keyword = raw.slice(0, nul);
  if (type === 'tEXt') return { label: keyword, group: 'Outros', value: raw.slice(nul + 1, nul + 200).trim() };
  if (type === 'iTXt') {
    // keyword \0 flagCompressão métodoCompressão idioma \0 palavraTraduzida \0 texto
    if (bytes[start + nul + 1] !== 0) return { label: keyword, group: 'Outros', value: '(comprimido)' };
    const parts = raw.slice(nul + 3).split('\0');
    return { label: keyword, group: 'Outros', value: (parts[2] || '').trim().slice(0, 200) };
  }
  return { label: keyword, group: 'Outros', value: '(comprimido)' };
}

function stripPng(bytes, keepIcc) {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (bytes[i] !== sig[i]) return null;

  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const pieces = [bytes.subarray(0, 8)];
  const removed = [];
  const fields = [];
  let offset = 8;

  while (offset + 8 <= bytes.length) {
    const len = dv.getUint32(offset);
    const type = asciiAt(bytes, offset + 4, 4);
    const end = offset + 12 + len;
    if (end > bytes.length) return null;

    let drop = false;
    if (PNG_META_CHUNKS.indexOf(type) !== -1) {
      drop = true;
      if (type === 'eXIf') {
        const info = parseExif(bytes, offset + 8);
        info.fields.forEach(f => fields.push(f));
        removed.push('EXIF');
        if (info.hasGps) removed.push('GPS');
      } else if (type === 'tIME') {
        removed.push('Data de modificação');
      } else {
        removed.push('Texto ' + type);
        const text = readPngText(bytes, offset + 8, len, type);
        if (text) fields.push(text);
      }
    } else if (type === 'iCCP') {
      drop = !keepIcc;
      if (drop) removed.push('Perfil ICC');
    }

    if (!drop) pieces.push(bytes.subarray(offset, end));
    offset = end;
    if (type === 'IEND') break;
  }

  return { bytes: concatChunks(pieces), mime: 'image/png', removed: removed, fields: fields, orientation: 1 };
}

function stripWebp(bytes, keepIcc) {
  if (asciiAt(bytes, 0, 4) !== 'RIFF' || asciiAt(bytes, 8, 4) !== 'WEBP') return null;

  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const body = [];
  const removed = [];
  const fields = [];
  let offset = 12;

  while (offset + 8 <= bytes.length) {
    const fourcc = asciiAt(bytes, offset, 4);
    const len = dv.getUint32(offset + 4, true);
    if (offset + 8 + len > bytes.length) return null;
    const end = offset + 8 + len + (len % 2); // os chunks têm padding para tamanho par

    let drop = false;
    if (fourcc === 'EXIF') {
      drop = true;
      const info = parseExif(bytes, offset + 8);
      info.fields.forEach(f => fields.push(f));
      removed.push('EXIF');
      if (info.hasGps) removed.push('GPS');
    } else if (fourcc === 'XMP ') {
      drop = true;
      removed.push('XMP');
    } else if (fourcc === 'ICCP') {
      drop = !keepIcc;
      if (drop) removed.push('Perfil ICC');
    }

    if (!drop) {
      const chunk = bytes.slice(offset, Math.min(end, bytes.length));
      if (fourcc === 'VP8X' && chunk.length >= 9) {
        // limpar os bits que anunciam ICC/EXIF/XMP no cabeçalho estendido
        let flags = chunk[8];
        flags &= ~0x08; // EXIF
        flags &= ~0x04; // XMP
        if (!keepIcc) flags &= ~0x20; // ICC
        chunk[8] = flags;
      }
      body.push(chunk);
    }
    offset = end;
  }

  const payload = concatChunks(body);
  const out = new Uint8Array(12 + payload.length);
  out.set(bytes.subarray(0, 12));
  out.set(payload, 12);
  new DataView(out.buffer).setUint32(4, out.length - 8, true); // tamanho RIFF atualizado
  return { bytes: out, mime: 'image/webp', removed: removed, fields: fields, orientation: 1 };
}

// Redesenhar num canvas remove todos os metadados, mas recomprime a imagem
async function reencodeImage(file, mime) {
  const source = await decodeImageFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  canvas.getContext('2d').drawImage(source, 0, 0);
  if (source.close) source.close();
  // um HEIC é sempre uma fotografia: em PNG ficaria enorme
  const type = mime || (isHeicFile(file) ? 'image/jpeg' : 'image/png');
  const blob = await new Promise(res => canvas.toBlob(res, type, 0.92));
  if (!blob) throw new Error('o browser não conseguiu gerar a imagem');
  return { blob: blob, mime: type };
}

function cleanedName(name, mime) {
  const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png';
  const base = name.replace(/\.[^.]+$/, '') || 'imagem';
  return base + '-limpo.' + ext;
}

async function cleanImageFile(file) {
  const keepIcc = metaKeepIcc.checked;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const result = stripJpeg(bytes, keepIcc) || stripPng(bytes, keepIcc) || stripWebp(bytes, keepIcc);

  if (result) {
    let blob = new Blob([result.bytes], { type: result.mime });
    let note = '';
    if (result.orientation > 1 && metaFixOrientation.checked) {
      try {
        blob = (await reencodeImage(file, 'image/jpeg')).blob;
        note = 'Recodificada para aplicar a rotação que estava guardada no EXIF.';
      } catch (e) {
        note = 'A etiqueta de orientação foi removida — a imagem pode aparecer rodada.';
      }
    } else if (result.orientation > 1) {
      note = 'A etiqueta de orientação foi removida — a imagem pode aparecer rodada.';
    }
    return {
      name: cleanedName(file.name, result.mime),
      blob: blob,
      originalSize: file.size,
      removed: result.removed,
      fields: result.fields,
      note: note
    };
  }

  const re = await reencodeImage(file, null); // rebenta com a razão certa se não der
  return {
    name: cleanedName(file.name, re.mime),
    blob: re.blob,
    originalSize: file.size,
    removed: ['Todos os metadados'],
    fields: [],
    note: 'Formato sem limpeza direta: a imagem foi redesenhada como ' +
      (re.mime === 'image/jpeg' ? 'JPEG' : 'PNG') + ', o que remove tudo mas altera o ficheiro.'
  };
}

// --- Interface ---
function downloadCleaned(entry) {
  const link = document.createElement('a');
  link.download = entry.name;
  link.href = entry.url;
  link.click();
}

function renderMetaItem(entry, file) {
  const item = document.createElement('div');
  item.className = 'meta-item';

  const thumb = document.createElement('img');
  thumb.className = 'meta-thumb';
  thumb.alt = '';
  thumb.src = entry.url;
  item.appendChild(thumb);

  const info = document.createElement('div');
  info.className = 'meta-info';

  const name = document.createElement('div');
  name.className = 'meta-name';
  name.textContent = file.name;
  info.appendChild(name);

  const diff = entry.originalSize - entry.blob.size;
  const sizes = document.createElement('div');
  sizes.className = 'meta-sizes';
  sizes.textContent = formatBytes(entry.originalSize) + ' → ' + formatBytes(entry.blob.size) +
    (diff > 0 ? ' (−' + formatBytes(diff) + ')' : diff < 0 ? ' (+' + formatBytes(-diff) + ')' : '');
  info.appendChild(sizes);

  const badges = document.createElement('div');
  badges.className = 'meta-badges';
  const unique = entry.removed.filter((v, i, a) => a.indexOf(v) === i);
  if (!unique.length) {
    const clean = document.createElement('span');
    clean.className = 'meta-badge is-clean';
    clean.textContent = 'Já não tinha metadados';
    badges.appendChild(clean);
  } else {
    unique.forEach(label => {
      const badge = document.createElement('span');
      badge.className = 'meta-badge' + (label === 'GPS' ? ' is-gps' : '');
      badge.textContent = label;
      badges.appendChild(badge);
    });
  }
  info.appendChild(badges);

  if (entry.fields.length) {
    const details = document.createElement('details');
    details.className = 'meta-details';
    const summary = document.createElement('summary');
    summary.textContent = 'Ver o que foi removido (' + entry.fields.length + ')';
    details.appendChild(summary);

    META_GROUPS.forEach(group => {
      const rows = entry.fields.filter(f => (f.group || 'Outros') === group.name);
      if (!rows.length) return;

      const title = document.createElement('div');
      title.className = 'meta-group' + (group.name === 'Localização' ? ' is-gps' : '');
      title.textContent = group.icon + ' ' + group.name;
      details.appendChild(title);

      const list = document.createElement('div');
      list.className = 'meta-kv';
      rows.forEach(f => {
        const key = document.createElement('span');
        key.className = 'meta-kv-key';
        key.textContent = f.label;
        const val = document.createElement('span');
        val.className = 'meta-kv-val';
        val.textContent = f.value;
        list.appendChild(key);
        list.appendChild(val);
      });
      details.appendChild(list);
    });

    info.appendChild(details);
  }

  if (entry.note) {
    const note = document.createElement('div');
    note.className = 'meta-note';
    note.textContent = entry.note;
    info.appendChild(note);
  }

  item.appendChild(info);

  const dl = document.createElement('button');
  dl.className = 'meta-dl';
  dl.textContent = '⬇ Descarregar';
  dl.addEventListener('click', () => downloadCleaned(entry));
  item.appendChild(dl);

  metaResults.appendChild(item);
}

async function handleMetaFiles(fileList) {
  const files = Array.from(fileList).filter(f => f.type.indexOf('image/') === 0 || /\.(jpe?g|png|webp|gif|bmp|tiff?|avif|heic)$/i.test(f.name));
  if (!files.length) {
    metaError.textContent = 'Escolhe pelo menos um ficheiro de imagem.';
    return;
  }
  metaError.className = 'error-box';
  metaError.textContent = '';
  metaDrop.classList.add('is-busy');

  if (!heicDecoderPromise && files.some(isHeicFile)) {
    metaError.className = 'error-box is-info';
    metaError.textContent = 'A preparar o descodificador HEIC…';
  }

  const failed = [];
  for (const file of files) {
    try {
      const entry = await cleanImageFile(file);
      entry.url = URL.createObjectURL(entry.blob);
      metaCleaned.push(entry);
      renderMetaItem(entry, file);
    } catch (e) {
      failed.push(file.name + ' (' + e.message + ')');
    }
  }

  metaDrop.classList.remove('is-busy');
  metaActions.hidden = metaCleaned.length === 0;
  metaError.className = 'error-box';
  metaError.textContent = failed.length ? 'Não foi possível processar: ' + failed.join(', ') : '';
  if (!failed.length) showToast(files.length > 1 ? 'Imagens limpas!' : 'Imagem limpa!');
}

metaDrop.addEventListener('click', () => metaInput.click());
metaDrop.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); metaInput.click(); }
});
metaInput.addEventListener('change', () => {
  handleMetaFiles(metaInput.files);
  metaInput.value = '';
});

['dragenter', 'dragover'].forEach(evt => {
  metaDrop.addEventListener(evt, e => { e.preventDefault(); metaDrop.classList.add('is-over'); });
});
['dragleave', 'drop'].forEach(evt => {
  metaDrop.addEventListener(evt, e => { e.preventDefault(); metaDrop.classList.remove('is-over'); });
});
metaDrop.addEventListener('drop', e => {
  if (e.dataTransfer && e.dataTransfer.files.length) handleMetaFiles(e.dataTransfer.files);
});

document.getElementById('metaDownloadAll').addEventListener('click', () => {
  metaCleaned.forEach((entry, i) => setTimeout(() => downloadCleaned(entry), i * 220));
});

document.getElementById('metaClearBtn').addEventListener('click', () => {
  metaCleaned.forEach(entry => URL.revokeObjectURL(entry.url));
  metaCleaned.length = 0;
  metaResults.innerHTML = '';
  metaError.textContent = '';
  metaActions.hidden = true;
});

// ---------- Image compressor ----------
const cmpDrop = document.getElementById('cmpDrop');
const cmpInput = document.getElementById('cmpInput');
const cmpControls = document.getElementById('cmpControls');
const cmpQuality = document.getElementById('cmpQuality');
const cmpQualityValue = document.getElementById('cmpQualityValue');
const cmpFormat = document.getElementById('cmpFormat');
const cmpMaxWidth = document.getElementById('cmpMaxWidth');
const cmpHint = document.getElementById('cmpHint');
const cmpError = document.getElementById('cmpError');
const cmpCompare = document.getElementById('cmpCompare');
const cmpViewer = document.getElementById('cmpViewer');
const cmpLayerOriginal = document.getElementById('cmpLayerOriginal');
const cmpLayerResult = document.getElementById('cmpLayerResult');
const cmpHandle = document.getElementById('cmpHandle');
const cmpSplit = document.getElementById('cmpSplit');
const cmpZoom = document.getElementById('cmpZoom');
const cmpOriginalMeta = document.getElementById('cmpOriginalMeta');
const cmpResultMeta = document.getElementById('cmpResultMeta');
const cmpSummary = document.getElementById('cmpSummary');
const cmpActions = document.getElementById('cmpActions');

const CMP_TYPES = [
  { value: 'image/jpeg', label: 'JPEG (.jpg)', ext: 'jpg' },
  { value: 'image/webp', label: 'WebP (.webp)', ext: 'webp' },
  { value: 'image/avif', label: 'AVIF (.avif)', ext: 'avif' },
  { value: 'image/png', label: 'PNG (.png)', ext: 'png' }
];

const CMP_LOSSY = ['image/jpeg', 'image/webp', 'image/avif'];

let cmpSource = null;   // { file, bitmap, url }
let cmpResult = null;   // { blob, url, width, height, type }
let cmpTimer = null;
let cmpRunId = 0;
let cmpPan = { x: 0, y: 0 };
let cmpDrag = null;
let cmpView = null;        // enquadramento do último desenho, para o zoom saber onde está
let cmpCustomZoom = 1;     // zoom feito à roda do rato, fora dos valores do menu
let cmpZoomOption = null;

// O browser só encoda alguns formatos — perguntamos-lhe quais antes de os oferecer
function canEncode(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL(type).indexOf('data:' + type) === 0;
}

const cmpAvailable = CMP_TYPES.filter(t => canEncode(t.value));

(function fillFormats() {
  const keep = document.createElement('option');
  keep.value = '';
  keep.textContent = 'Manter formato';
  cmpFormat.appendChild(keep);
  cmpAvailable.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.value;
    opt.textContent = t.label;
    cmpFormat.appendChild(opt);
  });
})();

function cmpTargetType() {
  if (cmpFormat.value) return cmpFormat.value;
  const source = cmpSource && cmpSource.file.type;
  const known = cmpAvailable.filter(t => t.value === source)[0];
  return known ? known.value : 'image/jpeg';
}

function cmpExtension(type) {
  const known = CMP_TYPES.filter(t => t.value === type)[0];
  return known ? known.ext : 'jpg';
}

function cmpTypeName(type) {
  const known = CMP_TYPES.filter(t => t.value === type)[0];
  return known ? known.label.split(' ')[0] : String(type).replace('image/', '').toUpperCase();
}

function cmpRelease() {
  if (cmpSource && cmpSource.url) URL.revokeObjectURL(cmpSource.url);
  if (cmpSource && cmpSource.bitmap && cmpSource.bitmap.close) cmpSource.bitmap.close();
  if (cmpResult && cmpResult.url) URL.revokeObjectURL(cmpResult.url);
  cmpSource = null;
  cmpResult = null;
}

function cmpReset() {
  clearTimeout(cmpTimer);
  cmpRunId++;
  cmpRelease();
  cmpControls.hidden = true;
  cmpCompare.hidden = true;
  cmpSummary.hidden = true;
  cmpActions.hidden = true;
  cmpError.textContent = '';
  cmpHint.textContent = '';
  cmpLayerOriginal.style.backgroundImage = '';
  cmpLayerResult.style.backgroundImage = '';
  cmpSplit.value = 50;
  if (cmpZoomOption) {
    cmpZoom.removeChild(cmpZoomOption);
    cmpZoomOption = null;
  }
  cmpZoom.value = 'fit';
  cmpPan = { x: 0, y: 0 };
  cmpView = null;
  cmpInput.value = '';
}

async function loadCompressSource(file) {
  if (!file) return;
  if (file.type.indexOf('image/') !== 0 && !/\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(file.name)) {
    cmpError.textContent = 'Escolhe um ficheiro de imagem.';
    return;
  }

  cmpReset();
  cmpDrop.classList.add('is-busy');

  if (isHeicFile(file) && !heicDecoderPromise) {
    cmpSummary.hidden = false;
    cmpSummary.className = 'cmp-summary is-working';
    cmpSummary.textContent = 'A preparar o descodificador HEIC…';
  }

  let source;
  try {
    source = await decodeImageFile(file);
  } catch (e) {
    cmpDrop.classList.remove('is-busy');
    cmpSummary.hidden = true;
    cmpError.textContent = e.message === 'formato não suportado pelo browser'
      ? 'O browser não conseguiu abrir esta imagem.'
      : 'Não deu para abrir a imagem: ' + e.message + '.';
    return;
  }

  // o browser não mostra um HEIC diretamente, por isso a pré-visualização
  // do original vem dos pixels já descodificados
  const previewUrl = source instanceof HTMLCanvasElement
    ? await new Promise(res => source.toBlob(b => res(URL.createObjectURL(b)), 'image/png'))
    : URL.createObjectURL(file);

  cmpSource = { file: file, bitmap: source, url: previewUrl };
  cmpLayerOriginal.style.backgroundImage = 'url("' + cmpSource.url + '")';
  cmpOriginalMeta.textContent = formatBytes(file.size) + ' · ' + source.width + '×' + source.height +
    ' · ' + cmpTypeName(file.type || (isHeicFile(file) ? 'image/heic' : 'image/jpeg'));

  cmpDrop.classList.remove('is-busy');
  cmpControls.hidden = false;
  cmpCompare.hidden = false;
  cmpActions.hidden = false;
  runCompress();
}

function cmpTargetSize() {
  const max = parseInt(cmpMaxWidth.value, 10);
  const w = cmpSource.bitmap.width;
  const h = cmpSource.bitmap.height;
  if (!max || w <= max) return { width: w, height: h };
  return { width: max, height: Math.max(1, Math.round(h * (max / w))) };
}

async function runCompress() {
  if (!cmpSource) return;
  const runId = ++cmpRunId;
  const type = cmpTargetType();
  const lossy = CMP_LOSSY.indexOf(type) !== -1;
  const size = cmpTargetSize();

  cmpQuality.disabled = !lossy;
  cmpHint.textContent = lossy
    ? ''
    : 'O PNG não tem qualidade regulável — passa a JPEG ou WebP para poupar mais.';

  cmpSummary.hidden = false;
  cmpSummary.className = 'cmp-summary is-working';
  cmpSummary.textContent = 'A comprimir…';

  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(cmpSource.bitmap, 0, 0, size.width, size.height);

  const blob = await new Promise(res => canvas.toBlob(res, type, cmpQuality.value / 100));
  if (runId !== cmpRunId) return; // já há um pedido mais recente
  if (!blob) {
    cmpSummary.hidden = true;
    cmpError.textContent = 'Não foi possível gerar a imagem neste formato.';
    return;
  }

  cmpError.textContent = '';
  if (cmpResult && cmpResult.url) URL.revokeObjectURL(cmpResult.url);
  cmpResult = { blob: blob, url: URL.createObjectURL(blob), width: size.width, height: size.height, type: type };

  cmpLayerResult.style.backgroundImage = 'url("' + cmpResult.url + '")';
  cmpPaintViewer();
  cmpResultMeta.textContent = formatBytes(blob.size) + ' · ' + size.width + '×' + size.height +
    ' · ' + cmpTypeName(type);

  const diff = cmpSource.file.size - blob.size;
  const pct = Math.round(Math.abs(diff) / cmpSource.file.size * 100);
  const sizes = formatBytes(cmpSource.file.size) + ' → ' + formatBytes(blob.size);
  if (diff > 0) {
    cmpSummary.className = 'cmp-summary is-smaller';
    cmpSummary.textContent = sizes + '  ·  menos ' + pct + '% (' + formatBytes(diff) + ' poupados)';
  } else if (diff === 0) {
    cmpSummary.className = 'cmp-summary';
    cmpSummary.textContent = sizes + '  ·  o mesmo tamanho do original';
  } else {
    cmpSummary.className = 'cmp-summary is-bigger';
    cmpSummary.textContent = sizes + '  ·  ' + (pct === 0 ? 'praticamente igual' : 'mais ' + pct + '%') +
      ' — experimenta outro formato ou menos qualidade';
  }
}

// As duas camadas usam o mesmo background-size/position, por isso o que está
// debaixo da divisória é exatamente o mesmo pedaço da imagem nas duas versões.
function cmpPaintViewer() {
  if (!cmpSource) return;
  const rect = cmpViewer.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const iw = cmpSource.bitmap.width;
  const ih = cmpSource.bitmap.height;
  const scale = cmpScaleFor(rect);
  const bw = iw * scale;
  const bh = ih * scale;

  // centrado, com o arrasto limitado ao que ainda mostra imagem
  const restX = (rect.width - bw) / 2;
  const restY = (rect.height - bh) / 2;
  let x = restX + cmpPan.x;
  let y = restY + cmpPan.y;
  x = bw > rect.width ? Math.min(0, Math.max(rect.width - bw, x)) : restX;
  y = bh > rect.height ? Math.min(0, Math.max(rect.height - bh, y)) : restY;
  cmpPan = { x: x - restX, y: y - restY };

  const size = Math.round(bw) + 'px ' + Math.round(bh) + 'px';
  const pos = Math.round(x) + 'px ' + Math.round(y) + 'px';
  [cmpLayerOriginal, cmpLayerResult].forEach(layer => {
    layer.style.backgroundSize = size;
    layer.style.backgroundPosition = pos;
  });

  cmpLayerOriginal.style.width = cmpSplit.value + '%';
  cmpHandle.style.left = cmpSplit.value + '%';
  cmpViewer.classList.toggle('is-zoomed', bw > rect.width + 1 || bh > rect.height + 1);
  cmpView = { x: x, y: y, scale: scale };
}

function cmpFitScale(rect) {
  return Math.min(rect.width / cmpSource.bitmap.width, rect.height / cmpSource.bitmap.height);
}

function cmpScaleFor(rect) {
  const fit = cmpFitScale(rect);
  if (cmpZoom.value === 'fit') return fit;
  if (cmpZoom.value === 'custom') return Math.max(fit, Math.min(16, cmpCustomZoom));
  return parseFloat(cmpZoom.value);
}

// O menu passa a mostrar a percentagem quando o zoom vem da roda do rato
function cmpSetCustomZoom(scale) {
  cmpCustomZoom = scale;
  if (!cmpZoomOption) {
    cmpZoomOption = document.createElement('option');
    cmpZoomOption.value = 'custom';
    cmpZoom.appendChild(cmpZoomOption);
  }
  cmpZoomOption.textContent = Math.round(scale * 100) + '%';
  cmpZoom.value = 'custom';
}

cmpViewer.addEventListener('wheel', e => {
  if (!cmpSource) return;
  const rect = cmpViewer.getBoundingClientRect();
  if (!rect.width || !cmpView) return;
  e.preventDefault();

  const fit = cmpFitScale(rect);
  const step = Math.pow(1.18, e.deltaY < 0 ? 1 : -1);
  const next = Math.max(fit, Math.min(16, cmpView.scale * step));

  if (next <= fit + 0.0001) {
    cmpZoom.value = 'fit';
    cmpPan = { x: 0, y: 0 };
    cmpPaintViewer();
    return;
  }

  // o ponto da imagem debaixo do rato fica onde está
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const u = (cx - cmpView.x) / cmpView.scale;
  const v = (cy - cmpView.y) / cmpView.scale;
  cmpPan.x = (cx - u * next) - (rect.width - cmpSource.bitmap.width * next) / 2;
  cmpPan.y = (cy - v * next) - (rect.height - cmpSource.bitmap.height * next) / 2;

  cmpSetCustomZoom(next);
  cmpPaintViewer();
}, { passive: false });

function cmpSplitFromEvent(e) {
  const rect = cmpViewer.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width * 100;
  cmpSplit.value = Math.max(0, Math.min(100, Math.round(pct)));
  cmpPaintViewer();
}

cmpViewer.addEventListener('pointerdown', e => {
  if (!cmpSource) return;
  e.preventDefault();
  const onHandle = cmpHandle.contains(e.target);
  cmpDrag = (onHandle || !cmpViewer.classList.contains('is-zoomed'))
    ? { mode: 'split' }
    : { mode: 'pan', x: e.clientX, y: e.clientY };
  cmpViewer.setPointerCapture(e.pointerId);
  if (cmpDrag.mode === 'split') cmpSplitFromEvent(e);
  else cmpViewer.classList.add('is-panning');
});

cmpViewer.addEventListener('pointermove', e => {
  if (!cmpDrag) return;
  if (cmpDrag.mode === 'split') {
    cmpSplitFromEvent(e);
    return;
  }
  cmpPan.x += e.clientX - cmpDrag.x;
  cmpPan.y += e.clientY - cmpDrag.y;
  cmpDrag.x = e.clientX;
  cmpDrag.y = e.clientY;
  cmpPaintViewer();
});

['pointerup', 'pointercancel'].forEach(evt => {
  cmpViewer.addEventListener(evt, () => {
    cmpDrag = null;
    cmpViewer.classList.remove('is-panning');
  });
});

cmpSplit.addEventListener('input', cmpPaintViewer);
// o visor mede-se a si próprio, por isso só pinta com a tab à vista
document.querySelector('.tab-btn[data-tab="compress"]').addEventListener('click', cmpPaintViewer);
cmpZoom.addEventListener('change', () => {
  cmpPan = { x: 0, y: 0 };
  cmpPaintViewer();
});
window.addEventListener('resize', cmpPaintViewer);

function scheduleCompress() {
  clearTimeout(cmpTimer);
  cmpTimer = setTimeout(runCompress, 180);
}

cmpQuality.addEventListener('input', () => {
  cmpQualityValue.textContent = cmpQuality.value;
  scheduleCompress();
});
[cmpFormat, cmpMaxWidth].forEach(el => el.addEventListener('change', runCompress));

cmpDrop.addEventListener('click', () => cmpInput.click());
cmpDrop.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cmpInput.click(); }
});
cmpInput.addEventListener('change', () => loadCompressSource(cmpInput.files[0]));

['dragenter', 'dragover'].forEach(evt => {
  cmpDrop.addEventListener(evt, e => { e.preventDefault(); cmpDrop.classList.add('is-over'); });
});
['dragleave', 'drop'].forEach(evt => {
  cmpDrop.addEventListener(evt, e => { e.preventDefault(); cmpDrop.classList.remove('is-over'); });
});
cmpDrop.addEventListener('drop', e => {
  if (e.dataTransfer && e.dataTransfer.files.length) loadCompressSource(e.dataTransfer.files[0]);
});

document.getElementById('cmpDownloadBtn').addEventListener('click', () => {
  if (!cmpResult) return;
  const base = cmpSource.file.name.replace(/\.[^.]+$/, '') || 'imagem';
  const link = document.createElement('a');
  link.download = base + '-comprimido.' + cmpExtension(cmpResult.type);
  link.href = cmpResult.url;
  link.click();
});

document.getElementById('cmpResetBtn').addEventListener('click', () => {
  cmpReset();
  cmpInput.click();
});
