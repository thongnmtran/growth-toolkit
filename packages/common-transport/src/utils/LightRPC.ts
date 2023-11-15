import { AnyFunction, AnyKey, TypeName } from '@katalon-toolbox/common-utils';

// --- Payload

export enum LightRPCPayloadType {
  REQUEST = 'request',
  RESPONSE = 'response',
  CALLBACK_REQUEST = 'callback_request',
  CALLBACK_RESPONSE = 'callback_response',
}

export type BaseLightRPCPayload<Type extends LightRPCPayloadType> = {
  type: Type;
  channel?: string;
};

// --- Request

export type LightRPCRequest<
  MethodName extends AnyKey = string,
  Args extends LightRPCArg[] = LightRPCArg[],
> = BaseLightRPCPayload<LightRPCPayloadType.REQUEST> & {
  method: MethodName;
  args: Args;
};

export type BaseLightRPCArg<Type extends TypeName, Value> = {
  type: Type;
  value: Value;
  id: number;
};

export type LightRPCNumberArg = BaseLightRPCArg<'number', number>;
export type LightRPCStringArg = BaseLightRPCArg<'string', string>;
export type LightRPCSymbolArg = BaseLightRPCArg<'symbol', symbol>;
export type LightRPCBooleanArg = BaseLightRPCArg<'boolean', boolean>;
export type LightRPCBigIntArg = BaseLightRPCArg<'bigint', bigint>;
export type LightRPCObjectArg = BaseLightRPCArg<'object', object>;
export type LightRPCUndefinedArg = BaseLightRPCArg<'undefined', undefined>;
export type LightRPCFunctionArg = BaseLightRPCArg<'function', AnyFunction>;

export type LightRPCArg =
  | LightRPCNumberArg
  | LightRPCStringArg
  | LightRPCSymbolArg
  | LightRPCBooleanArg
  | LightRPCBigIntArg
  | LightRPCObjectArg
  | LightRPCUndefinedArg
  | LightRPCFunctionArg;

// --- Response

export type LightRPCResponse<ResultType = unknown> =
  BaseLightRPCPayload<LightRPCPayloadType.RESPONSE> & {
    result: ResultType;
  };

// --- Callback

export type LightRPCCallbackRequest<
  Args extends LightRPCArg[] = LightRPCArg[],
> = BaseLightRPCPayload<LightRPCPayloadType.CALLBACK_REQUEST> & {
  callId: number;
  callbackId: number;
  args: Args;
};

export type LightRPCCallbackResponse<ResultType = unknown> =
  BaseLightRPCPayload<LightRPCPayloadType.CALLBACK_RESPONSE> & {
    callId: number;
    result: ResultType;
  };
