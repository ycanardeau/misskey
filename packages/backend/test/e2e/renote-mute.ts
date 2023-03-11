process.env.NODE_ENV = 'test';

import * as assert from 'assert';
import { afterAll, beforeAll, describe, test } from 'vitest';
import { ServiceProvider } from 'yohira';
import { signup, api, post, startServer, waitFire } from '../utils.js';

describe('Renote Mute', () => {
	let p: ServiceProvider;

	// alice mutes carol
	let alice: any;
	let bob: any;
	let carol: any;

	beforeAll(async () => {
		p = await startServer();
		alice = await signup({ username: 'alice' });
		bob = await signup({ username: 'bob' });
		carol = await signup({ username: 'carol' });
	}, 1000 * 60 * 2);

	afterAll(async () => {
		await p.disposeAsync();
	});

	test('ミュート作成', async () => {
		const res = await api('/renote-mute/create', {
			userId: carol.id,
		}, alice);

		assert.strictEqual(res.status, 204);
	});

	/* FIXME: test('タイムラインにリノートミュートしているユーザーのリノートが含まれない', async () => {
		const bobNote = await post(bob, { text: 'hi' });
		const carolRenote = await post(carol, { renoteId: bobNote.id });
		const carolNote = await post(carol, { text: 'hi' });

		const res = await api('/notes/local-timeline', {}, alice);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(Array.isArray(res.body), true);
		assert.strictEqual(res.body.some((note: any) => note.id === bobNote.id), true);
		assert.strictEqual(res.body.some((note: any) => note.id === carolRenote.id), false);
		assert.strictEqual(res.body.some((note: any) => note.id === carolNote.id), true);
	}); */

	/* FIXME: test('タイムラインにリノートミュートしているユーザーの引用が含まれる', async () => {
		const bobNote = await post(bob, { text: 'hi' });
		const carolRenote = await post(carol, { renoteId: bobNote.id, text: 'kore' });
		const carolNote = await post(carol, { text: 'hi' });

		const res = await api('/notes/local-timeline', {}, alice);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(Array.isArray(res.body), true);
		assert.strictEqual(res.body.some((note: any) => note.id === bobNote.id), true);
		assert.strictEqual(res.body.some((note: any) => note.id === carolRenote.id), true);
		assert.strictEqual(res.body.some((note: any) => note.id === carolNote.id), true);
	}); */

	test('ストリームにリノートミュートしているユーザーのリノートが流れない', async () => {
		const bobNote = await post(bob, { text: 'hi' });

		const fired = await waitFire(
			alice, 'localTimeline',
			() => api('notes/create', { renoteId: bobNote.id }, carol),
			msg => msg.type === 'note' && msg.body.userId === carol.id,
		);

		assert.strictEqual(fired, false);
	});

	/* FIXME: test('ストリームにリノートミュートしているユーザーの引用が流れる', async () => {
		const bobNote = await post(bob, { text: 'hi' });

		const fired = await waitFire(
			alice, 'localTimeline',
			() => api('notes/create', { renoteId: bobNote.id, text: 'kore' }, carol),
			msg => msg.type === 'note' && msg.body.userId === carol.id,
		);

		assert.strictEqual(fired, true);
	}); */
});
