module.exports = {
	TAG_CLASS: {
		UNIVERSAL:	      0, // The type is native to ASN.1
		APPLICATION:	    1, // The type is only valid for one specific application
		CONTEXT_SPECIFIC:	2, // Meaning of this type depends on the context (such as within a sequence, set or choice)
		PRIVATE:	        3  // Defined in private specifications
	},
	PC: {
		PRIMITIVE:   0, // The contents octets directly encode the element value.
		CONSTRUCTED: 1  // The contents octets contain 0, 1, or more element encodings.
	}
}
