import { PresentationDriver } from '../domain/adapters/presentation-driver.js';
import { SessionContext } from '../domain/session/session-context.js';
import { TerminalDriver } from './drivers/terminal.driver.js';
import { JsonDriver } from './drivers/json.driver.js';

export class PresentationRouter {
  public static createDriver(context: SessionContext): PresentationDriver {
    if (context.json) {
      return new JsonDriver(context);
    }
    return new TerminalDriver(context);
  }
}
