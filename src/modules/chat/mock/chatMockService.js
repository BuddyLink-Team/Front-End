const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

class ChatMockService {
  constructor() {
    this.polls = new Map();
  }

  async createPoll(conversationId, payload) {
    await delay();
    const messageId = `msg-poll-${Date.now()}`;
    const formattedOptions = (payload.options || []).map((opt, idx) => ({
      id: opt.id || `opt_${idx + 1}`,
      label: opt.label || `Lựa chọn ${idx + 1}`,
      voterParentIds: [],
      voteCount: 0,
      hasVoted: false,
    }));

    const poll = {
      question: payload.question || 'Bình chọn thời gian hẹn chơi',
      options: formattedOptions,
      deadline: payload.deadline || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      isClosed: false,
      totalVotes: 0,
    };

    const message = {
      id: messageId,
      _id: messageId,
      conversationId,
      type: 'poll',
      content: payload.question || 'Bình chọn thời gian hẹn chơi',
      poll,
      createdAt: new Date().toISOString(),
      isMine: true,
      sender: {
        id: 'parent-me',
        fullName: 'Tôi',
      },
    };

    this.polls.set(messageId, poll);

    return {
      success: true,
      message: 'Poll created',
      data: {
        message,
        conversation: {
          id: conversationId,
          lastMessage: {
            content: `[Khảo sát] ${poll.question}`,
            sentAt: new Date().toISOString(),
          },
        },
      },
    };
  }

  async votePoll(messageId, optionId) {
    await delay();
    let poll = this.polls.get(messageId);
    if (!poll) {
      poll = {
        question: 'Bình chọn thời gian hẹn chơi',
        options: [
          { id: 'opt_1', label: 'Thứ Bảy, 09:00 - 11:00', voterParentIds: [], voteCount: 0, hasVoted: false },
          { id: 'opt_2', label: 'Chủ Nhật, 15:00 - 17:00', voterParentIds: [], voteCount: 0, hasVoted: false },
        ],
        deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        isClosed: false,
        totalVotes: 0,
      };
      this.polls.set(messageId, poll);
    }

    const currentParentId = 'parent-me';
    poll.options.forEach((opt) => {
      opt.voterParentIds = (opt.voterParentIds || []).filter((id) => id !== currentParentId);
      opt.voteCount = opt.voterParentIds.length;
      opt.hasVoted = false;
    });

    const target = poll.options.find((opt) => opt.id === optionId);
    if (target) {
      target.voterParentIds.push(currentParentId);
      target.voteCount = target.voterParentIds.length;
      target.hasVoted = true;
    }

    poll.totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);

    return {
      success: true,
      message: 'Vote recorded',
      data: {
        poll,
      },
    };
  }
}

export const chatMockService = new ChatMockService();
export default chatMockService;

