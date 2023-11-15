/* eslint-disable @typescript-eslint/no-explicit-any */

import { removeItems } from '../array-utils';
import { call } from '../function-utils';

function getRemoveMethod(addMethod: string) {
  return addMethod.replace(/^add/, 'remove');
}

type ListenerRecord = {
  target: any;
  addMethod: string;
  args: unknown[];
};

export class ListenerManager {
  listeners: ListenerRecord[] = [];

  protected storeListener(record: ListenerRecord) {
    this.listeners.push(record);
  }

  with<ListenableType extends object>(
    listenable: ListenableType
  ): ListenableType {
    return new Proxy(listenable, {
      get: (target, key) => {
        let prop = target[key as never] as any;
        if (typeof key === 'string') {
          const [, addMethod] = key.match(/(add\w*Listener)/) || [];
          if (addMethod) {
            prop = (...args: unknown[]) => {
              this.storeListener({
                addMethod,
                args,
                target,
              });
            };
          }
        }
        return prop;
      },
    });
  }

  removeAllListeners() {
    [...this.listeners].forEach((listenerI) => {
      this.removeListenerRecord(listenerI);
    });
  }

  private removeListenerRecord(listenerRecord: ListenerRecord) {
    const removeMethod = getRemoveMethod(listenerRecord.addMethod);
    call(listenerRecord.target, removeMethod, listenerRecord.args);
    removeItems(this.listeners, [listenerRecord]);
  }
}
