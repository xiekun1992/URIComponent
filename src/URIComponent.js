(function(factory){
	if(!this._x){
		this._x = {};
	}
	var def = factory();
	this._x.URIComponent = new def();
})(function(){
	function EncodeURIComponent(){
		this.input = [];
		// UTF8编码
		this.templates = {
			'1': ['00000000'],
			'2': ['11000000', '10000000'],
			'3': ['11100000', '10000000', '10000000'],
			'4': ['11110000', '10000000', '10000000', '10000000']
		};
	}
	EncodeURIComponent.prototype.encode = function(input){
		if(typeof input !== 'string'){
			throw new Error('input should be a string');
		}
		this.input = input;
		var binaryCode, bytes, encodedStr = '';
		for(var i = 0; i < this.input.length; i++){
			var charCode = this.input.charCodeAt(i);
			binaryCode = charCode.toString(2);
			if(17 < binaryCode.length){ // 四字节
				encodedStr += this.parse(binaryCode, 4);
			}else if(11 < binaryCode.length){ // 三字节
				encodedStr += this.parse(binaryCode, 3);
			}else if(7 < binaryCode.length){ // 二字节
				encodedStr += this.parse(binaryCode, 2);
			}else{ // 单字节
				if(48 <= charCode && charCode <= 57 || 65 <= charCode && charCode <= 90 || 97 <= charCode && charCode <= 122){
					encodedStr += this.input.charAt(i);	
				}else{
					encodedStr += this.parse(binaryCode, 1);
				}
			}
		}
		return encodedStr;
	}
	EncodeURIComponent.prototype.parse = function(binaryCode, bytes){
		var bits = this.divideBit(binaryCode, bytes);
		var template = this.templates[bytes], result = [];
		for(var i = 0; i < template.length; i++){
			result.push(template[i].substr(0, template[i].length - bits[i].length) + bits[i]);
		}
		result = result.join('');
		var encodedStr = '';
		for(var i = 0, j = 8; i + j <= result.length; i += 8){
			var hexStr = parseInt(result.substr(i, j), 2).toString(16);
			if(hexStr.length != 2){
				hexStr = '0' + hexStr;
			}
			encodedStr += '%' + hexStr;
		}
		return encodedStr;
	}
	EncodeURIComponent.prototype.divideBit = function(binaryCode, bytes){
		if(bytes < 2) return [binaryCode];
		var bits = [], pos = 0;
		var end = binaryCode.length - pos;
		var start = end - 6;
		while(0 < bytes--){
			bits.unshift(binaryCode.slice(start, end));
			pos += 6;
			end = binaryCode.length - pos;
			start = end - 6;
			if(start < 0){
				start = 0;
			}
			if(end < 0){
				end = 0;
			}
		}
		return bits;
	}
	EncodeURIComponent.prototype.decode = function(input){
		if(typeof input !== 'string' || input.indexOf('%') < 0) return input.toString();
		var hexArr = input.split('%'), decodedStr = '';
		for(var i = 0; i < hexArr.length; i++){
			var char = hexArr[i].toLowerCase();
			if(0 <= char && char <= 9 || 'a' <= char && char <= 'z'){
				decodedStr += char;
			}else{
				decodedStr += String.fromCharCode(parseInt(char, 16));
			}
		}
		return decodedStr;
	}
	return EncodeURIComponent;
});