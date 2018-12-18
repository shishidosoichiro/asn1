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
		const minus = int < 0;
		//if (minus) int = int + Math.pow(2, 32);
		if (minus) int = ~(-1 * int) + 1;

		if (minus) console.log(int, int >> 8 & 0xff, int >> 16 & 0xff, int >> 24 & 0xff)

		const bytes = [];
		while (int >= 1) {
			if (minus) console.log(int, int & 0xff)
			bytes.unshift(int & 0xff);
			int = int >> 8
		}
		if (bytes.length < 4 && bytes[0] >= 0x80) {
			bytes.unshift(minus ? 0x80 : 0x00);
		}

		this.write(bytes.length)
		this.write(bytes)
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
