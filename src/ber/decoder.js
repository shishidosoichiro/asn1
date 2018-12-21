const TYPE = require('./types');
const { TAG_CLASS, PC } = require('./const');

module.exports = class BerDecoder {
	constructor() {
		this.buffer = Buffer.from([]);
	}
	write(bytes){
		if (typeof bytes === 'number') bytes = [bytes];
		this.buffer = Buffer.concat([this.buffer, Buffer.from(bytes)]);
	}
	writeBoolean(boolean){
		this.write(bytifyTag(TAG_CLASS.UNIVERSAL, PC.PRIMITIVE, TYPE.BOOLEAN));
		this.write(1);
		this.write(boolean ? 1 : 0);
	}
	writeInt(int){
		//if (int >= (1 << 32)) throw new TypeError(`integer must be less than 1^32. int=${int}`);
		this.write(bytifyTag(TAG_CLASS.UNIVERSAL, PC.PRIMITIVE, TYPE.INTEGER));
		if (int === 0) {
			this.write(1);
			this.write(0);
			return;
		}

		var length = 4;
		while (((int & 0xff800000) === 0 || (int & 0xff800000) === 0xff800000 >> 0) && length > 1) {
			int <<= 8;
			length--;
		}

		const bytes = [];
		while (int) {
			bytes.push((int & 0xff000000) >> 24);
			int <<= 8;
		}

		this.write(length);
		this.write(bytes);
	}
	writeOctetString(string, encoding = 'utf8'){
		this.write(bytifyTag(TAG_CLASS.UNIVERSAL, PC.PRIMITIVE, TYPE.OCTET_STRING));
		const buffer = Buffer.from(string, encoding);
		this.write(buffer.length);
		this.write(buffer);
	}
}

function bytifyTag(tagClass, pc, tagNumber) {
	return (tagClass << 7) | (pc << 5) | tagNumber;
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
