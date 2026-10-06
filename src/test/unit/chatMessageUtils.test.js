import { describe, it, expect } from 'vitest';
import {
  createTempId,
  buildOptimisticMessage,
  upsertMessage,
  setMessageStatus,
  getOldestPersistedMessageId,
} from '../../modules/chat/utils/chatMessageUtils';
import { MESSAGE_STATUS } from '../../modules/chat/constants/chatConstants';

const optimistic = (tempId, content = 'Xin chào') =>
  buildOptimisticMessage({
    tempId,
    conversationId: 'conv-1',
    senderId: 'me',
    content,
    type: 'text',
  });

describe('chatMessageUtils', () => {
  it('createTempId: should generate unique client-only ids', () => {
    const a = createTempId();
    const b = createTempId();
    expect(a).toMatch(/^tmp-/);
    expect(a).not.toBe(b);
  });

  it('upsertMessage: should replace the optimistic copy matched by tempId', () => {
    const list = [{ id: 'm-1', content: 'cũ' }, optimistic('tmp-1')];
    const result = upsertMessage(list, { id: 'm-2', tempId: 'tmp-1', content: 'Xin chào' });

    expect(result).toHaveLength(2);
    expect(result[1].id).toBe('m-2');
    expect(result[1].status).toBeUndefined();
  });

  it('upsertMessage: should be idempotent for ack + own-room echo of the same message', () => {
    let list = [optimistic('tmp-1')];
    list = upsertMessage(list, { id: 'm-2', tempId: 'tmp-1' }); // ack
    list = upsertMessage(list, { id: 'm-2', tempId: 'tmp-1' }); // echo

    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('m-2');
  });

  it('upsertMessage: should not duplicate when an echo without tempId arrives before the REST response', () => {
    let list = [optimistic('tmp-1')];
    list = upsertMessage(list, { id: 'm-2' }); // REST broadcast echo (no tempId)
    list = upsertMessage(list, { id: 'm-2', tempId: 'tmp-1' }); // REST response tagged with tempId

    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('m-2');
    expect(list[0].status).toBeUndefined();
  });

  it('upsertMessage: should reconcile a failed (timed out) message when the late echo arrives', () => {
    let list = setMessageStatus([optimistic('tmp-1')], 'tmp-1', MESSAGE_STATUS.FAILED);
    expect(list[0].status).toBe(MESSAGE_STATUS.FAILED);

    list = upsertMessage(list, { id: 'm-2', tempId: 'tmp-1' });
    expect(list).toHaveLength(1);
    expect(list[0].status).toBeUndefined();
  });

  it('upsertMessage: should append incoming messages from the partner', () => {
    const list = upsertMessage([{ id: 'm-1' }], { id: 'm-2' });
    expect(list.map((m) => m.id)).toEqual(['m-1', 'm-2']);
  });

  it('getOldestPersistedMessageId: should skip optimistic messages', () => {
    expect(getOldestPersistedMessageId([optimistic('tmp-1')])).toBeNull();
    expect(getOldestPersistedMessageId([{ id: 'm-1' }, optimistic('tmp-1')])).toBe('m-1');
  });
});
