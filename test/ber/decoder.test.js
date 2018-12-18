// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

import test from 'ava';
import { Buffer } from 'safer-buffer';
import Decoder from '../../src/ber/decoder';


test('.writeByte() should write a byte.', async t => {
	const decoder = new Decoder();
	
})

test('read 1 byte int', async t => {
	const decoder = new Decoder();
	decoder.writeInt(3);
	t.deepEqual(decoder.buffer, Buffer.from([0x02, 0x01, 0x03]));
});


test('read 2 byte int', async t => {
	const decoder = new Decoder();
	decoder.writeInt(0x7ede);
	t.deepEqual(decoder.buffer, Buffer.from([0x02, 0x02, 0x7e, 0xde]));
});


test('read 3 byte int', async t => {
	const decoder = new Decoder();
	decoder.writeInt(0x7ede03);
	t.deepEqual(decoder.buffer, Buffer.from([0x02, 0x03, 0x7e, 0xde, 0x03]));
});


test('read 4 byte int', async t => {
	const decoder = new Decoder();
	decoder.writeInt(0x7ede0301);
	t.deepEqual(decoder.buffer, Buffer.from([0x02, 0x04, 0x7e, 0xde, 0x03, 0x01]));
});


test('read 1 byte negative int', async t => {
	const decoder = new Decoder();
	decoder.writeInt(-36);
	t.deepEqual(decoder.buffer, Buffer.from([0x02, 0x01, 0xdc]));
});


test('read 2 byte negative int', async t => {
	const decoder = new Decoder();
	decoder.writeInt(-16306);
	t.deepEqual(decoder.buffer, Buffer.from([0x02, 0x02, 0xc0, 0x4e]));
});


test('read 3 byte negative int', async t => {
	const decoder = new Decoder();
	decoder.writeInt(-65511);
	t.deepEqual(decoder.buffer, Buffer.from([0x02, 0x03, 0xff, 0x00, 0x19]));
});


test('read 4 byte negative int', async t => {
	const decoder = new Decoder();
	decoder.writeInt(-1854135777);
	t.deepEqual(decoder.buffer, Buffer.from([0x02, 0x04, 0x91, 0x7c, 0x22, 0x1f]));
});
