const gameController = require('./game.controller');
const socketService = require('../../socket/service/sockets');
const utility = require("../../socket/controller/utility");

describe('gameEvent function', () => {
  let socket;
  let data;

  beforeEach(() => {
    socket = {
      id: 'socketId',
      emit: jest.fn(),
      on: jest.fn(),
      disconnect: jest.fn(),
      tokenSize: 0,
      botPosition: 0
    };
    data = {
      bot: {
        tokens: [
          {
            token: 'token'
          }
        ]
      },
      roomSize: 2,
      roomFee: 10,
      no_of_tokens: 100
    };
  });

  test('should emit join event with token', () => {
    gameEvent(socket, data);
    expect(socket.emit).toHaveBeenCalledWith('join', { token: 'token' }, expect.any(Function));
  });

  test('should emit join_previous event', () => {
    gameEvent(socket, data);
    expect(socket.emit).toHaveBeenCalledWith('join_previous');
  });

  test('should emit joinPublicTabel event with correct parameters', () => {
    gameEvent(socket, data);
    expect(socket.emit).toHaveBeenCalledWith('joinPublicTabel', {
      no_of_players: '2',
      room_fee: '10',
      no_of_tokens: '100'
    }, expect.any(Function));
  });

  test('should set socket.tokenSize and socket.botPosition if joinPublicTabel callback status is 1', () => {
    const callback = { status: 1, table: { no_of_tokens: 100, position: 1 } };
    socket.emit.mockImplementationOnce((event, data, callback) => callback(callback));
    gameEvent(socket, data);
    expect(socket.tokenSize).toBe(100);
    expect(socket.botPosition).toBe(1);
  });

  test('should not set socket.tokenSize and socket.botPosition if joinPublicTabel callback status is not 1', () => {
    const callback = { status: 0 };
    socket.emit.mockImplementationOnce((event, data, callback) => callback(callback));
    gameEvent(socket, data);
    expect(socket.tokenSize).toBe(0);
    expect(socket.botPosition).toBe(0);
  });

  test('should emit diceRolled event after 1500ms if make_diceroll event is received with correct position', () => {
    const params = { position: 1 };
    gameEvent(socket, data);
    socket.on.mock.calls[0][1](params);
    setTimeout(() => {
      expect(socket.emit).toHaveBeenCalledWith('diceRolled', expect.any(Object));
    }, 1600);
  });

  test('should not emit diceRolled event if make_diceroll event is received with incorrect position', () => {
    const params = { position: 2 };
    gameEvent(socket, data);
    socket.on.mock.calls[0][1](params);
    setTimeout(() => {
      expect(socket.emit).not.toHaveBeenCalledWith('diceRolled', expect.any(Object));
    }, 1600);
  });

  test('should emit moveMade event after 1000ms if make_move event is received with correct position', () => {
    const params = { position: 1 };
    gameEvent(socket, data);
    socket.on.mock.calls[1][1](params);
    setTimeout(() => {
      expect(socket.emit).toHaveBeenCalledWith('moveMade', expect.any(Object));
    }, 1100);
  });

  test('should not emit moveMade event if make_move event is received with incorrect position', () => {
    const params = { position: 2 };
    gameEvent(socket, data);
    socket.on.mock.calls[1][1](params);
    setTimeout(() => {
      expect(socket.emit).not.toHaveBeenCalledWith('moveMade', expect.any(Object));
    }, 1100);
  });
});
