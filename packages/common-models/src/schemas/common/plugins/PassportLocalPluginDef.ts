import { DBPluginDef } from './common/DBPluginDef';

export type PassportLocalPluginDef<Model> = DBPluginDef<
  'PassportLocal',
  {
    usernameField: keyof Model;
    hashField: keyof Model;
    saltField: keyof Model;
    attemptsField: keyof Model;
    lastLoginField: keyof Model;
    selectFields: (keyof Model)[];
  }
>;
