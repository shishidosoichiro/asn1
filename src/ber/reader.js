const assert = require('assert');
const TYPES = require('./types');

const TAG_CLASS = {
	UNIVERSAL:	      0, // The type is native to ASN.1
	APPLICATION:	    1, // The type is only valid for one specific application
	CONTEXT_SPECIFIC:	2, // Meaning of this type depends on the context (such as within a sequence, set or choice)
	PRIVATE:	        3  // Defined in private specifications
};

const PC = {
	PRIMITIVE:   0, // The contents octets directly encode the element value.
	CONSTRUCTED: 1  // The contents octets contain 0, 1, or more element encodings.
};

module.exports = class BerReader {
	constructor() {
		this.buffer = new Buffer([]);
		this.index = 0;
	}
	write(buffer) {
		this.buffer = Buffer.concat([this.buffer, buffer]);
	}

	// undefined: fail to parse.
	//
	read() {
		this.readSize = 0;

		const tag = this.readTag();
		if (tag === undefined) return undefined;

		const length = this.readLength();
		if (length === undefined) return undefined;
		if (length === 0) return undefined;

		if (
		   (tag.tagNumber === TYPES.SEQUENCE) ||
		   (tag.tagClass === 1 && tag.pc === 1)
		) {
			const seq = [];
			var i = 0;
			var pointer = 0;
			var readSize = this.readSize;
			while (pointer < length) {
				const data = this.read();
				if (data === undefined) return undefined;
				seq[i++] = data
				pointer += this.readSize;
			}
			assert.equal(pointer, length, 'sequence data is broken.');
			this.readSize = readSize + length;
			return seq;
		}

		const value = this.readBytes(length);
		if (value === undefined) return undefined;

		switch (tag.tagNumber) {
			case TYPES.BOOLEAN:
				return value[0] !== 0;
			case TYPES.INTEGER:
			case TYPES.ENUMERATED:
				return parseInt(value);
			case TYPES.OCTET_STRING:
				return Buffer.from(value).toString('utf8');
			default:
		}
	}

	readByte() {
		if (this.buffer.length <= 0) return undefined;
		this.readSize++;
		return this.buffer[this.index++]
	}

	garbage() {
		this.buffer = this.buffer.slice(this.index);
		this.index = 0;
	}

	readTag() {
		const tag = parseTag(this.readByte());
		if (tag.tagNumber !== 0x1f)
			return tag // 0001 1111

		// Long
		tag.tagNumber = 0;
		var continuing = 1;
		while (continuing) {
			const byte = this.readByte();
			tag.bytes++;
			tag.tagNumber = (tag.tagNumber << 7) | (byte & 0x7f); // 0111 1111
			continuing = byte >> 7;
		}
		return tag;
	}

	readLength() {
		const first = this.readByte();
		if (first === undefined) return undefined;
		const moreThan128Byte = first >> 7;
		const length = first & 0x7f;
		if (!moreThan128Byte)
			return length;

		const bytes = this.readBytes(length);
		return parseInt(bytes);
	}

	readBytes(length) {
		const array = [];
		for (var i = 0; i < length; i++) {
			array[i] = this.readByte();
		}
		return array;
	}
}

function parseTag(byte) {
	return {
		tagClass: byte >> 6,
		pc: (byte & 0x3f) >> 5, // 0011 1111
		tagNumber: byte & 0x1f, // 0001 1111
		bytes: 1
	};
}

function object(tag, length, value) {
	return { tag, length, value };
}

function parseInt(bytes) {
	const length = bytes.length;
	if (length < 1) return undefined;

	var int = 0;
	const minus = bytes[0] >> 7;
	for (var i = 0; i < length; i++) {
		int = int | (bytes[i] << ((length - i - 1) * 8));
	}
	// Integer is 4 byte
	if (length >= 4) return int;

	if (minus)
		return int - (1 << (length * 8));

	return int;
}
