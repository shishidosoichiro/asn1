// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

import test from 'ava';
import { Buffer } from 'safer-buffer';
import BerReader from '../../src/ber/reader';


test('.readByte() should return a byte.', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x6c, 0x33]));
	reader.write(Buffer.from([0xdf, 0xf5, 0xaa, 0x5f]));
	t.is(reader.readByte(), 0x6c);
	t.is(reader.readByte(), 0x33);
	t.is(reader.readByte(), 0xdf);
	t.is(reader.readByte(), 0xf5);
	t.is(reader.readByte(), 0xaa);
	t.is(reader.readByte(), 0x5f);
	t.is(reader.readByte(), null);
	t.is(reader.readByte(), null);
})

test('.readTag() should return a tag.', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x6c, 0x33])); // 0110 1100
	const tag = reader.readTag();
	t.is(tag.tagClass, 1);
	t.is(tag.pc, 1);
	t.is(tag.tagNumber, 12);
})

test('.readTag() should return a long form tag.', async t => {
	const reader = new BerReader();
	// 1101 1111 1111 0101 1010 1010 0101 1111
	// tag number: 1 1101 0101 0101 0101 1111 => 0x1d555f
	reader.write(Buffer.from([0xdf, 0xf5, 0xaa, 0x5f]));
	const tag = reader.readTag();
	t.is(tag.tagClass, 3);
	t.is(tag.pc, 0);
	t.is(tag.tagNumber, 0x1d555f);
})

test('.readLength() should return a length which is less than 128 bits.', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x6c, 0x33])); // 0110 1100
	const length = reader.readLength();
	t.is(length, 108);
})

test('.readLength() should return a length which is more than 127 bits.', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x83, 0x2a, 0xbb, 0x44, 0x33])); // 1000 0003
	const length = reader.readLength();
	t.is(length, 0x2abb44);
})

test('.readBytes() should return .', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x83, 0xaa, 0xbb, 0x44, 0x33])); // 1000 0003
	t.deepEqual(reader.readBytes(2), [0x83, 0xaa]);
	t.deepEqual(reader.readBytes(3), [0xbb, 0x44, 0x33]);
})

test('.read() should return Boolean.', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x01, 0x01, 0x01]));
	const object = reader.read();
	t.is(object.tag.tagNumber, 1);
	t.is(object.value, true);
	reader.write(Buffer.from([0x01, 0x01, 0x00]));
	t.is(reader.read(2).value, false);
})

// --- Tests


test('read byte', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0xde]));
  t.is(reader.readByte(), 0xde, 'wrong value');
});


test('read 1 byte int', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x02, 0x01, 0x03]));
	const object = reader.read();
  t.truthy(object);
  t.is(object.value, 3, 'wrong value');
  t.is(object.length, 1, 'wrong length');
});


test('read 2 byte int', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x02, 0x02, 0x7e, 0xde]));
	const object = reader.read();
  t.truthy(object);
  t.is(object.value, 0x7ede, 'wrong value');
  t.is(object.length, 2, 'wrong length');
});


test('read 3 byte int', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x02, 0x03, 0x7e, 0xde, 0x03]));
	const object = reader.read();
  t.truthy(object);
  t.is(object.value, 0x7ede03, 'wrong value');
  t.is(object.length, 3, 'wrong length');
});


test('read 4 byte int', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x02, 0x04, 0x7e, 0xde, 0x03, 0x01]));
	const object = reader.read();
  t.truthy(object);
  t.is(object.value, 0x7ede0301, 'wrong value');
  t.is(object.length, 4, 'wrong length');
});


test('read 1 byte negative int', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x02, 0x01, 0xdc]));
	const object = reader.read();
  t.truthy(object);
  t.is(object.value, -36, 'wrong value');
  t.is(object.length, 1, 'wrong length');
});


test('read 2 byte negative int', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x02, 0x02, 0xc0, 0x4e]));
	const object = reader.read();
  t.truthy(object);
  t.is(object.value, -16306, 'wrong value');
  t.is(object.length, 2, 'wrong length');
});


test('read 3 byte negative int', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x02, 0x03, 0xff, 0x00, 0x19]));
	const object = reader.read();
  t.truthy(object);
  t.is(object.value, -65511, 'wrong value');
  t.is(object.length, 3, 'wrong length');
});


test('read 4 byte negative int', async t => {
	const reader = new BerReader();
	reader.write(Buffer.from([0x02, 0x04, 0x91, 0x7c, 0x22, 0x1f]));
	const object = reader.read();
  t.truthy(object);
  t.is(object.value, -1854135777, 'wrong value');
  t.is(object.length, 4, 'wrong length');
});


test.skip('read boolean true', async t => {
  var reader = reader.read(Buffer.from([0x01, 0x01, 0xff]));
  t.ok(reader);
  t.is(reader.readBoolean(), true, 'wrong value');
  t.is(reader.length, 0x01, 'wrong length');
  t.end();
});


test.skip('read boolean false', async t => {
  var reader = reader.read(Buffer.from([0x01, 0x01, 0x00]));
  t.ok(reader);
  t.is(reader.readBoolean(), false, 'wrong value');
  t.is(reader.length, 0x01, 'wrong length');
  t.end();
});


test.skip('read enumeration', async t => {
  var reader = reader.read(Buffer.from([0x0a, 0x01, 0x20]));
  t.ok(reader);
  t.is(reader.readEnumeration(), 0x20, 'wrong value');
  t.is(reader.length, 0x01, 'wrong length');
  t.end();
});


test.skip('read string', async t => {
  var dn = 'cn=foo,ou=unit,o=test';
  var buf = Buffer.alloc(dn.length + 2);
  buf[0] = 0x04;
  buf[1] = Buffer.byteLength(dn);
  buf.write(dn, 2);
  var reader = reader.read(buf);
  t.ok(reader);
  t.is(reader.readString(), dn, 'wrong value');
  t.is(reader.length, dn.length, 'wrong length');
  t.end();
});


test.skip('read sequence', async t => {
  var reader = reader.read(Buffer.from([0x30, 0x03, 0x01, 0x01, 0xff]));
  t.ok(reader);
  t.is(reader.readSequence(), 0x30, 'wrong value');
  t.is(reader.length, 0x03, 'wrong length');
  t.is(reader.readBoolean(), true, 'wrong value');
  t.is(reader.length, 0x01, 'wrong length');
  t.end();
});


test.skip('anonymous LDAPv3 bind', async t => {
  var BIND = Buffer.alloc(14);
  BIND[0] = 0x30;  // Sequence
  BIND[1] = 12;    // len
  BIND[2] = 0x02;  // ASN.1 Integer
  BIND[3] = 1;     // len
  BIND[4] = 0x04;  // msgid (make up 4)
  BIND[5] = 0x60;  // Bind Request
  BIND[6] = 7;     // len
  BIND[7] = 0x02;  // ASN.1 Integer
  BIND[8] = 1;     // len
  BIND[9] = 0x03;  // v3
  BIND[10] = 0x04; // String (bind dn)
  BIND[11] = 0;    // len
  BIND[12] = 0x80; // ContextSpecific (choice)
  BIND[13] = 0;    // simple bind

  // Start testing ^^
  var ber = reader.read(BIND);
  t.is(ber.readSequence(), 48, 'Not an ASN.1 Sequence');
  t.is(ber.length, 12, 'Message length should be 12');
  t.is(ber.readInt(), 4, 'Message id should have been 4');
  t.is(ber.readSequence(), 96, 'Bind Request should have been 96');
  t.is(ber.length, 7, 'Bind length should have been 7');
  t.is(ber.readInt(), 3, 'LDAP version should have been 3');
  t.is(ber.readString(), '', 'Bind DN should have been empty');
  t.is(ber.length, 0, 'string length should have been 0');
  t.is(ber.readByte(), 0x80, 'Should have been ContextSpecific (choice)');
  t.is(ber.readByte(), 0, 'Should have been simple bind');
  t.is(null, ber.readByte(), 'Should be out of data');
  t.end();
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
  var ber = reader.read(buf.slice(0, 3 + s.length));
  t.is(ber.readString(), s);
  t.end();
});
