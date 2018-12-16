const assert = require('assert');
const TYPE = require('./types');

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
		this.buffer = Buffer.from([]);
		this.index = 0;
	}
	write(buffer) {
		this.buffer = Buffer.concat([this.buffer, buffer]);
	}

	get length() {
		return this.buffer.length - this.index;
	}

	get filled() {
		const index = this.begin();
		try {
			const tag = this.readTag();
			const length = this.readLength();
			return length <= this.length;
		}
		finally {
			this.rollback(index);
		}
	}

	begin() {
		return this.index;
	}

	rollback(index = 0) {
		this.index = index;
	}

	commit() {
		this.buffer = this.buffer.slice(this.index);
		this.index = 0;
	}

	/**
	*/
	readInt() {
		return this.read(TYPE.INTEGER);
	}

	/**
	*/
	readBoolean() {
		return this.read(TYPE.BOOLEAN);
	}

	/**
	*/
	readOctetString(encoding) {
		return this.read(TYPE.OCTET_STRING, encoding);
	}

	/**
	*/
	readEnumerated(encoding) {
		return this.read(TYPE.ENUMERATED, encoding);
	}

	/**
	*/
	readSequence() {
		return this.read(TYPE.SEQUENCE);
	}

	/**
	*/
	readChoice(choice) {
		return this.read(TYPE.CHOICE, choice);
	}

	// undefined: fail to parse.
	//
	read(type, ...args) {
		this.readSize = 0;

		const tag = this.readTag();
		if (tag === undefined) return undefined;
		type = type || tag.tagNumber
		//if (typeof type === 'number' && type !== tag.tagNumber)
		//	throw new TypeError(`Unmatched type. type=${type} tag.tagNumber=${tag.tagNumber}`);

		const length = this.readLength();
		if (length === undefined) return undefined;

		if (
		   (type === TYPE.SEQUENCE) ||
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

		const bytes = this.readBytes(length);
		if (bytes === undefined) return undefined;

		switch (type) {
			case TYPE.BOOLEAN:
				return bytes[0] !== 0;
			case TYPE.INTEGER:
			case TYPE.ENUMERATED:
				return parseInt(bytes);
			case TYPE.OCTET_STRING:
				const encoding = args[0] || 'utf8';
				return Buffer.from(bytes).toString(encoding);
			default:
		}
	}

	readByte(commit = true) {
		if (this.buffer.length <= 0) return undefined;
		try {
			return this.buffer[this.index];
		}
		finally {
			if (!commit) return;
			this.readSize++;
			this.index++;
		}
	}
	readBytes(length = 1, commit = true) {
		if (this.buffer.length <= 0) return undefined;
		if (this.length < length) return undefined;

		try {
			const array = [];
			for (var i = 0; i < length; i++) {
				array[i] = this.buffer[this.index + i];
			}
			return array;
		}
		finally {
			if (!commit) return;
			this.readSize += length;
			this.index += length;
		}

	}

	readTag(commit = true) {
		const transaction = this.begin();
		try {
			const tag = parseTag(this.readByte());
			if (tag.tagNumber !== 0x1f)
				return tag // 0001 1111

			// Long
			tag.tagNumber = 0;
			var continuing = 1;
			while (continuing) {
				const byte = this.readByte();
				tag.tagNumber = (tag.tagNumber << 7) | (byte & 0x7f); // 0111 1111
				tag.bytes.push(byte);
				continuing = byte >> 7;
			}
			return tag;
		}
		finally {
			if (!commit) this.rollback(transaction);
		}
	}

	readLength() {
		const first = this.readByte();
		if (first === undefined) return undefined;
		const moreThan128Byte = first >> 7;
		const length = first & 0x7f;
		if (!moreThan128Byte)
			return length;

		const bytes = this.readBytes(length);
		return parseInt(bytes, true);
	}

}

function parseTag(byte) {
	return {
		tagClass: byte >> 6,
		pc: (byte & 0x3f) >> 5, // 0011 1111
		tagNumber: byte & 0x1f, // 0001 1111
		bytes: [byte]
	};
}

function object(tag, length, value) {
	return { tag, length, value };
}

function parseInt(bytes, natural = false) {
	const length = bytes.length;
	if (length < 1) return undefined;

	var int = 0;
	const minus = bytes[0] >> 7;
	for (var i = 0; i < length; i++) {
		int = int | (bytes[i] << ((length - i - 1) * 8));
	}

	// Integer is 4 byte
	if (length >= 4) return int;

	if (minus && !natural)
		return int - (1 << (length * 8));

	return int;
}
