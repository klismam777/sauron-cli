import { AdapterRegistry } from '../registry/AdapterRegistry.js';
import { CursorAdapter } from './cursor.adapter.js';
import { WindsurfAdapter } from './windsurf.adapter.js';
import { AiderAdapter } from './aider.adapter.js';
import { AntigravityAdapter } from './antigravity.adapter.js';
import { OpencodeAdapter } from './opencode.adapter.js';
import { CodexAdapter } from './codex.adapter.js';
import { ClaudeAdapter } from './claude.adapter.js';

AdapterRegistry.register(new CursorAdapter());
AdapterRegistry.register(new WindsurfAdapter());
AdapterRegistry.register(new AiderAdapter());
AdapterRegistry.register(new AntigravityAdapter());
AdapterRegistry.register(new OpencodeAdapter());
AdapterRegistry.register(new CodexAdapter());
AdapterRegistry.register(new ClaudeAdapter());

export { AdapterRegistry };
