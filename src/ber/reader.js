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
		this.buffers = [];
		this.index = 0;
	}
	write(buffer) {
		this.buffers[this.buffers.length] = buffer
	}

	read() {
		const tag = this.readTag();
		if (tag === null) return null;

		const length = this.readLength();
		if (length === null) return null;
		if (length === 0) return null;

		const value = this.readBytes(length);
		if (value === null) return null;
		if (value.length < length) return null;

		switch (tag.tagNumber) {
			case TYPES.BOOLEAN:
				//assert.equal(length, )
				return object(tag, length, value[0] !== 0);
			case TYPES.INTEGER:
				return object(tag, length, parseInt(value));
			default:
		}
	}

	readByte() {
		if (this.buffers.length <= 0) return null;
		const byte = this.buffers[0][this.index++]
		if (byte !== undefined) return byte

		this.buffers.shift();
		this.index = 0;
		if (this.buffers.length <= 0) return null;
		return this.buffers[0][this.index++];
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
			tag.tagNumber = (tag.tagNumber << 7) | (byte & 0x7f); // 0111 1111
			continuing = byte >> 7;
		}
		return tag;
	}
	readLength() {
		const first = this.readByte();
		const moreThan128Byte = first >> 7;
		const length1 = first & 0x7f;
		if (!moreThan128Byte)
			return length1;

		const bytes = this.readBytes(length1);
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
		tagNumber: byte & 0x1f  // 0001 1111
	};
}

function object(tag, length, value) {
	return { tag, length, value };
}

function parseInt(bytes) {
	var int = 0;
	const length = bytes.length;
	const minus = bytes[0] >> 7;
	for (var i = 0; i < length; i++) {
		int = int | (bytes[i] << ((length - i - 1) * 8));
	}
	if (minus) return int - (1 << (length * 8));
	return int;
}
