/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnyFunction,
  getError,
  MethodNames,
} from '@growth-toolkit/common-utils';
import { AnyMessageTransport, MessageTransport } from '../transports';
import { asSyncTransport } from './transport-utils';
import { RequestListenerFromTransport } from '../transports/base/SyncMessageTransport';
import {
  LightRPCArg,
  LightRPCCallbackRequest,
  LightRPCPayloadType,
  LightRPCRequest,
  LightRPCResponse,
} from './LightRPC';

export type NewRPCTransport<Type extends object> = {
  [Prop in keyof Type]: Type[Prop] extends AnyFunction
    ? MessageTransport<
        LightRPCRequest<Prop> | LightRPCCallbackRequest,
        LightRPCResponse<ReturnType<Type[Prop]>>
      >
    : never;
}[keyof Type];

export type AsNewRPCRequest<
  Type extends object,
  Method extends MethodNames<Type>,
> = Type[Method] extends AnyFunction ? LightRPCRequest<Method> : never;

// ---

export type NewKeyMethodPair = { [key: string]: (...args: unknown[]) => void };

export class NewRemoteObjectHelper {
  static wrapArgs(args: unknown[]): LightRPCArg[] {
    return args.map((argI, index) => ({
      id: index,
      type: typeof argI,
      value: (typeof argI === 'function' ? index : argI) as never,
    }));
  }

  static unwrapArgs(args: LightRPCArg[]): unknown[] {
    return args.map((argI) => {
      // if (argI.type === 'function') {
      //   return (...args: unknown[]) => {
      //     return NewRemoteObjectHelper.wrapArgs(args);
      //   };
      // }
      return argI.value;
    });
  }

  static wrapClient<
    TargetType extends object,
    TransportType extends AnyMessageTransport,
  >(
    target: TargetType,
    transport: TransportType,
    channel?: string,
  ): TargetType {
    const syncTransport = asSyncTransport<NewRPCTransport<TargetType>>(
      transport as never,
    );

    syncTransport.connect();

    const proxy = new Proxy(target, {
      get(_target, property) {
        return async (...rawArgs: unknown[]) => {
          if (typeof property !== 'string') {
            return;
          }

          const rpcArgs = NewRemoteObjectHelper.wrapArgs(rawArgs);

          const onCallback: RequestListenerFromTransport<
            NewRPCTransport<TargetType>
          > = async (request) => {
            const rpcRequest = request.data;
            if (rpcRequest.channel !== channel) {
              return;
            }
            if (rpcRequest.type === LightRPCPayloadType.CALLBACK_REQUEST) {
              const callbackFunc = rawArgs[
                rpcRequest.callbackId
              ] as AnyFunction;
              if (callbackFunc) {
                const callbackRawArgs = NewRemoteObjectHelper.unwrapArgs(
                  rpcRequest.args,
                );
                const result = await callbackFunc(...callbackRawArgs);
                syncTransport.sendResponse(request, {
                  type: LightRPCPayloadType.CALLBACK_RESPONSE,
                  callId: rpcRequest.callId,
                  result: result as never,
                  channel,
                } as never);
              }
            }
          };

          syncTransport.addRequestListener(onCallback);

          const rs = await syncTransport
            .sendRequest({
              type: LightRPCPayloadType.REQUEST,
              method: property,
              args: rpcArgs,
              channel,
            } as never)
            .finally(() => {
              syncTransport.removeRequestListener(onCallback);
            });

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
    const syncTransport = asSyncTransport<NewRPCTransport<TargetType>>(
      transport as never,
    );

    await syncTransport.connect();

    syncTransport.addRequestListener(async (request) => {
      const rpcRequest = request.data;
      if (
        rpcRequest.channel !== channel ||
        rpcRequest.type !== LightRPCPayloadType.REQUEST
      ) {
        return;
      }

      if (!(rpcRequest.method in target)) {
        syncTransport.sendResponse(
          request,
          undefined,
          new Error('Method not found'),
        );
        return;
      }

      let callId = 0;

      const rawArgs = rpcRequest.args.map((argI) => {
        if (argI.type === 'function') {
          return async (...args: any[]) => {
            const rs = await syncTransport.sendRequest({
              type: LightRPCPayloadType.CALLBACK_REQUEST,
              callId: callId++,
              callbackId: argI.id,
              args: NewRemoteObjectHelper.wrapArgs(args),
              channel,
            } as never);
            return rs.result;
          };
        }
        return argI.value;
      });

      try {
        const result = await this.call(target, rpcRequest as never, rawArgs);
        if (!request.id) {
          return;
        }
        syncTransport.sendResponse(request, result);
      } catch (error) {
        syncTransport.sendError(request, getError(error));
      }
    });
    return target;
  }

  static call<ObjectType>(
    object: ObjectType,
    rcpRequest: LightRPCRequest,
    rawArgs: unknown[],
  ): any {
    return (object as NewKeyMethodPair)[rcpRequest.method]?.(...rawArgs);
  }

  static linkChannels<
    TransportTypeA extends AnyMessageTransport,
    TransportTypeB extends AnyMessageTransport,
  >(trasportA: TransportTypeA, trasportB: TransportTypeB, channel: string) {
    this.fowardChannels(trasportA, trasportB, channel);
    this.fowardChannels(trasportB, trasportA, channel);
  }

  static fowardChannels<
    TransportTypeA extends AnyMessageTransport,
    TransportTypeB extends AnyMessageTransport,
  >(
    fromTransport: TransportTypeA,
    toTransport: TransportTypeB,
    channel: string,
  ) {
    const from = asSyncTransport<NewRPCTransport<any>>(fromTransport as never);
    const to = asSyncTransport<NewRPCTransport<any>>(toTransport as never);
    from.addRequestListener(async (request) => {
      const rpcRequest = request.data;
      if (
        rpcRequest.channel !== channel ||
        rpcRequest.type !== LightRPCPayloadType.REQUEST
      ) {
        return;
      }
      try {
        const result = await to.sendRequest(request.data);
        from.sendResponse(request, result);
      } catch (error) {
        from.sendError(request, getError(error));
      }
    });
  }
}
