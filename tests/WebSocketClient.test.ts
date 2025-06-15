/// <reference types="node" />

import assert from 'assert/strict';
import { EventEmitter } from 'events';

// Import the module under test.  Use a relative path so the tsconfig path
// mapping is not required when `ts-node` executes the file.
import { WebSocketClient } from '../src/core/multiplayer/WebSocketClient.ts';

// ---------------------------------------------------------------------------
// VERY LIGHT-WEIGHT MOCKS
// ---------------------------------------------------------------------------

class MockWebSocket extends EventEmitter {
  public readyState = 1; // OPEN

  static readonly OPEN = 1;
  static readonly CLOSED = 3;

  closeCalled = false;

  send(_data: string) {
    /* no-op */
  }

  close() {
    this.closeCalled = true;
    this.readyState = MockWebSocket.CLOSED;
    // Emit a synthetic `close` event so that `WebSocketClient` can react.
    this.emit('close');
  }
}

// Shim the global `WebSocket` with our mock implementation for the duration
// of this test file.
(global as any).WebSocket = MockWebSocket;

// Provide minimal `fetch` mock so that `WebSocketClient.connect` resolves the
// handshake URL without performing any real network IO.
(global as any).fetch = async () => {
  return {
    ok: true,
    json: async () => ({ websocketUrl: 'ws://example.com/socket' })
  };
};

// Provide `window.setInterval` / `clearInterval` stubs for the heartbeat logic.
(global as any).window = {
  setInterval: setInterval.bind(global),
  clearInterval: clearInterval.bind(global)
};

async function run() {
  let reconnectAttempts = 0;

  const client = new WebSocketClient({
    onGameStateUpdate: () => {},
    onConnectionStatusChange: (status) => {
      if (status === 'reconnecting') {
        reconnectAttempts += 1;
      }
    },
    onError: () => {}
  });

  // Establish a connection (uses mocked fetch + MockWebSocket)
  await client.connect('ROOMCODE', 'PLAYER1', 'DUMMYTOKEN');

  // Sanity check that the internal WebSocket is our mock
  assert.ok(((client as any).ws) instanceof MockWebSocket, 'client.ws should be MockWebSocket');

  // Invoke manual disconnect – this should set the guard flag so that the
  // automatic reconnect logic is *disabled*.
  client.disconnect();

  // Simulate the underlying socket closing which will trigger the `onclose`
  // handler inside `WebSocketClient`.
  (client as any).ws?.emit('close');

  // Give the event loop a tick so the reconnect attempt (if any) would run.
  await new Promise((r) => setTimeout(r, 10));

  // The reconnectAttempts counter should still be zero because the client was
  // explicitly disconnected.
  assert.equal(reconnectAttempts, 0, 'No automatic reconnect should occur after manual disconnect');

  console.log('✓ WebSocketClient manual disconnect prevents auto-reconnect');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
}); 