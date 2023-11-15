import { queryObjects, removeItems } from '../common';
import { RecursivePartial } from '../types';

export class CommonRegistry<RegistrationType> {
  registrations: RegistrationType[] = [];

  register(registration: RegistrationType) {
    if (!this.registrations.includes(registration)) {
      this.registrations.push(registration);
    }
    return this;
  }

  unregister(registration: RegistrationType) {
    removeItems(this.registrations, [registration]);
    return this;
  }

  query<SubType extends RegistrationType = RegistrationType>(
    query: RecursivePartial<RegistrationType>
  ): SubType[] {
    return queryObjects(this.registrations, query) as never;
  }
}
