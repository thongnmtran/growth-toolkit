/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileInfo } from './FileInfo';

export type FileData<JsonType = any> = {
  info: FileInfo;
  text: string;
  json: JsonType;
};
