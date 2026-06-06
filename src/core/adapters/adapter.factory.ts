import { AgentAdapter } from '../../domain/adapters/agent-adapter.js';
import { CursorAdapter } from './cursor.adapter.js';
import { WindsurfAdapter } from './windsurf.adapter.js';
import { AiderAdapter } from './aider.adapter.js';
import { AntigravityAdapter } from './antigravity.adapter.js';

export class AdapterFactory {
  public static getAdapter(name: string): AgentAdapter | null {
    switch (name.trim().toLowerCase()) {
      case 'cursor':
        return new CursorAdapter();
      case 'windsurf':
        return new WindsurfAdapter();
      case 'aider':
        return new AiderAdapter();
      case 'antigravity':
        return new AntigravityAdapter();
      default:
        return null;
    }
  }

  public static getAllAdapters(): AgentAdapter[] {
    return [
      new CursorAdapter(),
      new WindsurfAdapter(),
      new AiderAdapter(),
      new AntigravityAdapter(),
    ];
  }
}
