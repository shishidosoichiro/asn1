module.exports = {
	END_OF_CONTENT:    0x00, // Primitive
	BOOLEAN:           0x01, // Primitive
	INTEGER:           0x02, // Primitive
	BIT_STRING:        0x03, // Both
	OCTET_STRING:      0x04, // Both
	NULL:              0x05, // Primitive
	OBJECT_IDENTIFIER: 0x06, // Primitive
	OBJECT_DESCRIPTOR: 0x07, // Both
	EXTERNAL:          0x08, // Constructed
	REAL_FLOAT:        0x09, // Primitive
	ENUMERATED:        0x0a, // Primitive
	EMBEDDED_PDV:      0x0b, // Constructed
	UTF8STRING:        0x0c, // Both
	RELATIVE_OID:      0x0d, // Primitive
	RESERVED:          0x0e, //
	RESERVED:          0x0f, //
	SEQUENCE:          0x10, // Constructed
	SET_AND_SET_OF:    0x11, // Constructed
	NUMERICSTRING:     0x12, // Both
	PRINTABLESTRING:   0x13, // Both
	T61STRING:         0x14, // Both
	VIDEOTEXSTRING:    0x15, // Both
	IA5STRING:         0x16, // Both
	UTCTIME:           0x17, // Both
	GENERALIZEDTIME:   0x18, // Both
	GRAPHICSTRING:     0x19, // Both
	VISIBLESTRING:     0x1a, // Both
	GENERALSTRING:     0x1b, // Both
	UNIVERSALSTRING:   0x1c, // Both
	CHARACTER_STRING:  0x1d, // Both
	BMPSTRING:         0x1e // Both
}
