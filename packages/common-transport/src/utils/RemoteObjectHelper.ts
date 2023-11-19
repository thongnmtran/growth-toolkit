/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnyFunction,
  AnyKey,
  getError,
  MethodNames,
} from '@growth-toolkit/common-utils';
import { AnyMessageTransport, MessageTransport } from '../transports';
import { asSyncTransport } from './transport-utils';

export type AnyRPCPayloadArgs = unknown[];

export type RPCRequest<
  MethodType extends AnyKey = string,
  MethodArgsType extends unknown[] = unknown[],
> = {
  method: MethodType;
  args: MethodArgsType;
  channel?: string;
};

export type RPCResponse<DataType = any> = {
  data: DataType;
  channel?: string;
};

export type RPCTransport<Type extends object> = {
  [Prop in keyof Type]: Type[Prop] extends AnyFunction
    ? MessageTransport<
        RPCRequest<Prop, Parameters<Type[Prop]>>,
        RPCResponse<ReturnType<Type[Prop]>>
      >
    : never;
}[keyof Type];

export type AsRPCRequest<
  Type extends object,
  Method extends MethodNames<Type>,
> = Type[Method] extends AnyFunction
  ? RPCRequest<Method, Parameters<Type[Method]>>
  : never;

// ---

export type KeyMethodPair = { [key: string]: (...args: unknown[]) => void };

export class RemoteObjectHelper {
  static wrapClient<
    TargetType extends object,
    TransportType extends AnyMessageTransport,
  >(
    target: TargetType,
    transport: TransportType,
    channel?: string,
  ): TargetType {
    const syncTransport = asSyncTransport<RPCTransport<TargetType>>(
      transport as never,
    );

    syncTransport.connect();

    const proxy = new Proxy(target, {
      get(_target, property) {
        return async (...args: AnyRPCPayloadArgs) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const validArgs = args.map((argI) =>
            typeof argI === 'function' ? argI.toString() : argI,
          );
          if (typeof property !== 'string') {
            return;
          }
          const rs = await syncTransport.sendRequest({
            method: property,
            args: validArgs,
            channel,
          } as never);
          return rs;
        };
      },
    });

    return proxy;
  }

  static async attachToServer<
    TargetType extends object,
    TransportType extends AnyMessageTransport,
  >(
    target: TargetType,
    transport: TransportType,
    channel?: string,
  ): Promise<TargetType> {
    const syncTransport = asSyncTransport<RPCTransport<TargetType>>(
      transport as never,
    );

    await syncTransport.connect();

    syncTransport.addRequestListener(async (request) => {
      const rpcPayload = request.data;
      if (rpcPayload.channel !== channel) {
        return;
      }
      if (rpcPayload.method in target) {
        try {
          const result = await this.call(target, rpcPayload as never);
          if (!request.id) {
            return;
          }
          syncTransport.sendResponse(request, result);
        } catch (error) {
          syncTransport.sendError(request, getError(error));
        }
      } else {
        syncTransport.sendResponse(request);
      }
    });
    return target;
  }

  static call<ObjectType>(object: ObjectType, rcpRequest: RPCRequest): any {
    return (object as KeyMethodPair)[rcpRequest.method]?.(...rcpRequest.args);
  }
}
