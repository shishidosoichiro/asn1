// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

import test from 'ava';
import { Buffer } from 'safer-buffer';
import BerEncoder from '../../src/ber/encoder';


test('.readByte() should return a byte.', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x6c, 0x33]));
	encoder.write(Buffer.from([0xdf, 0xf5, 0xaa, 0x5f]));
	t.is(encoder.readByte(), 0x6c);
	t.is(encoder.readByte(), 0x33);
	t.is(encoder.readByte(), 0xdf);
	t.is(encoder.readByte(), 0xf5);
	t.is(encoder.readByte(), 0xaa);
	t.is(encoder.readByte(), 0x5f);
	t.is(encoder.readByte(), undefined);
	t.is(encoder.readByte(), undefined);
})

test('.readBytes() should return .', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x83, 0xaa, 0xbb, 0x44, 0x33])); // 1000 0003
	t.deepEqual(encoder.readBytes(2), [0x83, 0xaa]);
	t.deepEqual(encoder.readBytes(3), [0xbb, 0x44, 0x33]);
})

test('.readTag() should return a tag.', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x6c, 0x33])); // 0110 1100
	const tag = encoder.readTag();
	t.is(tag.tagClass, 1);
	t.is(tag.pc, 1);
	t.is(tag.tagNumber, 12);
})

test('.readTag() should return a long form tag.', async t => {
	const encoder = new BerEncoder();
	// 1101 1111 1111 0101 1010 1010 0101 1111
	// tag number: 1 1101 0101 0101 0101 1111 => 0x1d555f
	encoder.write(Buffer.from([0xdf, 0xf5, 0xaa, 0x5f]));
	const tag = encoder.readTag();
	t.is(tag.tagClass, 3);
	t.is(tag.pc, 0);
	t.is(tag.tagNumber, 0x1d555f);
})

test('.readLength() should return a length which is less than 128 bits.', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x6c, 0x33])); // 0110 1100
	const length = encoder.readLength();
	t.is(length, 108);
})

test('.readLength() should return a length which is more than 127 bits.', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x83, 0x2a, 0xbb, 0x44, 0x33])); // 1000 0003
	const length = encoder.readLength();
	t.is(length, 0x2abb44);
})

test('.read() should return Boolean.', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x01, 0x01, 0x01]));
	t.is(encoder.readBoolean(), true);

	encoder.write(Buffer.from([0x01, 0x01, 0x00]));
	t.is(encoder.readBoolean(), false);
})

// --- Tests


test('read byte', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0xde]));
	t.is(encoder.readByte(), 0xde, 'wrong value');
});


test('read 1 byte int', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x02, 0x01, 0x03]));
	const value = encoder.readInt();
	t.truthy(value);
	t.is(value, 3, 'wrong value');
});


test('read 2 byte int', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x02, 0x02, 0x7e, 0xde]));
	const value = encoder.readInt();
	t.truthy(value);
	t.is(value, 0x7ede, 'wrong value');
});


test('read 3 byte int', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x02, 0x03, 0x7e, 0xde, 0x03]));
	const value = encoder.readInt();
	t.truthy(value);
	t.is(value, 0x7ede03, 'wrong value');
});


test('read 4 byte int', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x02, 0x04, 0x7e, 0xde, 0x03, 0x01]));
	const value = encoder.readInt();
	t.truthy(value);
	t.is(value, 0x7ede0301, 'wrong value');
});


test('read 1 byte negative int', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x02, 0x01, 0xdc]));
	const value = encoder.readInt();
	t.truthy(value);
	t.is(value, -36, 'wrong value');
});


test('read 2 byte negative int', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x02, 0x02, 0xc0, 0x4e]));
	const value = encoder.readInt();
	t.truthy(value);
	t.is(value, -16306, 'wrong value');
});


test('read 3 byte negative int', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x02, 0x03, 0xff, 0x00, 0x19]));
	const value = encoder.readInt();
	t.truthy(value);
	t.is(value, -65511, 'wrong value');
});


test('read 4 byte negative int', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x02, 0x04, 0x91, 0x7c, 0x22, 0x1f]));
	const value = encoder.readInt();
	t.truthy(value);
	t.is(value, -1854135777, 'wrong value');
});


test('read boolean true', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x01, 0x01, 0xff]));
	const value = encoder.readBoolean();
	t.is(value, true, 'wrong value');
});


test('read boolean false', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x01, 0x01, 0x00]));
	const value = encoder.readBoolean();
	t.is(value, false, 'wrong value');
});


test('read enumeration', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x0a, 0x01, 0x20]));
	const value = encoder.readEnumerated();
	t.truthy(value);
	t.is(value, 0x20, 'wrong value');
});


test('read string', async t => {
	const dn = 'cn=foo,ou=unit,o=test';
	var buffer = Buffer.alloc(dn.length + 2);
	buffer[0] = 0x04;
	buffer[1] = Buffer.byteLength(dn);
	buffer.write(dn, 2);

	const encoder = new BerEncoder();
	encoder.write(buffer);
	const value = encoder.readOctetString();
	t.truthy(value);
	t.is(value, dn, 'wrong value');
	t.is(value.length, dn.length, 'wrong length');
});


test('read sequence', async t => {
	const encoder = new BerEncoder();
	encoder.write(Buffer.from([0x30, 0x03, 0x01, 0x01, 0xff]));
	const value = encoder.readSequence();
	t.truthy(value);
	t.deepEqual(value, [true], 'wrong value');
});


test('パスワードpasswordを持つユーザーcn=testに対する簡易認証を使用したバインド・リクエスト', async t => {
	var bindRequest = Buffer.from([
		0x60,
		0x16,
		0x02, 0x01, 0x03, // 3
		0x04, 0x07, 0x63, 0x6E, 0x3D, 0x74, 0x65, 0x73, 0x74,      // cn=test
		0x80, 0x08, 0x70, 0x61, 0x73, 0x73, 0x77, 0x6F, 0x72, 0x64 // password
	]);
	const encoder = new BerEncoder();
	encoder.write(bindRequest);

	t.is(encoder.filled, true);

	const application = encoder.readTag();
	t.deepEqual(application.pc, 1);
	t.deepEqual(application.tagClass, 1);
	t.deepEqual(application.tagNumber, 0);
	const length = encoder.readLength();
	t.is(length, 0x16);
	const version = encoder.readInt();
	t.is(version, 3);
	const name = encoder.readOctetString();
	t.is(name, 'cn=test');

	const tag = encoder.readTag(false);
	t.is(tag.tagClass, 2);
	t.is(tag.pc, 0);
	const simple = encoder.readOctetString();
	t.is(simple, 'password');
});

test('anonymous LDAPv3 bind', async t => {
	var BIND = Buffer.alloc(14);
	BIND[0] = 0x30;	// Sequence
	BIND[1] = 12;		// len
	BIND[2] = 0x02;	// ASN.1 Integer
	BIND[3] = 1;		 // len
	BIND[4] = 0x04;	// msgid (make up 4)
	BIND[5] = 0x60;	// Bind Request
	BIND[6] = 7;		 // len
	BIND[7] = 0x02;	// ASN.1 Integer
	BIND[8] = 1;		 // len
	BIND[9] = 0x03;	// v3
	BIND[10] = 0x04; // String (bind dn)
	BIND[11] = 0;		// len
	BIND[12] = 0x80; // ContextSpecific (choice)
	BIND[13] = 0;		// simple bind

	const encoder = new BerEncoder();
	encoder.write(BIND);
	const value = encoder.read();
	t.truthy(value);
	t.deepEqual(value, [true], 'wrong value');

	//// Start testing ^^
	//var ber = encoder.read(BIND);
	//t.is(ber.readSequence(), 48, 'Not an ASN.1 Sequence');
	//t.is(ber.length, 12, 'Message length should be 12');
	//t.is(ber.readInt(), 4, 'Message id should have been 4');
	//t.is(ber.readSequence(), 96, 'Bind Request should have been 96');
	//t.is(ber.length, 7, 'Bind length should have been 7');
	//t.is(ber.readInt(), 3, 'LDAP version should have been 3');
	//t.is(ber.readString(), '', 'Bind DN should have been empty');
	//t.is(ber.length, 0, 'string length should have been 0');
	//t.is(ber.readByte(), 0x80, 'Should have been ContextSpecific (choice)');
	//t.is(ber.readByte(), 0, 'Should have been simple bind');
	//t.is(null, ber.readByte(), 'Should be out of data');
	//t.end();
});


test.skip('long string', async t => {
	var buf = Buffer.alloc(256);
	var s =
		'2;649;CN=Red Hat CS 71GA Demo,O=Red Hat CS 71GA Demo,C=US;' +
		'CN=RHCS Agent - admin01,UID=admin01,O=redhat,C=US [1] This is ' +
		'Teena Vradmin\'s description.';
	buf[0] = 0x04;
	buf[1] = 0x81;
	buf[2] = 0x94;
	buf.write(s, 3);
	var ber = encoder.read(buf.slice(0, 3 + s.length));
	t.is(ber.readString(), s);
	t.end();
});