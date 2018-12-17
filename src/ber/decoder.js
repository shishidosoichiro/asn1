const TYPE = require('./types');
const { TAG_CLASS, PC } = require('./const');

module.exports = class BerDecoder {
	constructor() {
		this.buffer = Buffer.from([]);
	}
	write(bytes){
		this.buffer = this.buffer.values().concat(bytes);
	}
	writeBoolean(boolean){
		this.write(bytifyTag(TAG_CLASS.UNIVERSAL, PC.PRIMITIVE, TYPES.BOOLEAN));
		this.write(1);
		this.write(boolean ? 1 : 0);
	}
	writeInt(int){
		this.write(bytifyTag(TAG_CLASS.UNIVERSAL, PC.PRIMITIVE, TYPES.INTEGER));
		const length = calcurateByteOfInteger(int);
		this.write(length);
		for (var i = 0; i < length; i++) {
			const byte = (int >> ((length - i - 1) * 8)) & 0xff;
			this.write(byte)
		}
	}
	writeOctetString(string, encoding = 'utf8'){
		this.write(bytifyTag(TAG_CLASS.UNIVERSAL, PC.PRIMITIVE, TYPES.OCTET_STRING));
		const buffer = Buffer.from(string, encoding);
		this.write(buffer.length);
		this.write(buffer);
	}
}

function bytifyTag(tagClass, pc, tagNumber) {
	return (tagClass << 7)
	& (pc << 5)
	& (tagNumber << 5);
}
function calcurateByteOfInteger(int) {
	// plus
	if (int >= 0) {
		const i = 0;
		while (int >= (1 << (7 + 8 * i++))) {
			continue;
		}
		return i;
		if (int < (1 << 7)) return 1;
		if (int < (1 << (7 + 8))) return 2;
		if (int < (1 << (7 + 16))) return 2;
		if (int < (1 << (7 + 24))) return 3;
	}
	else {
		const i = 0;
		abs = int * -1;
		while (int >= (1 << (7 + 8 * i++))) {
			continue;
		}
		return i;
	}
}
