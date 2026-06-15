import { NamespaceHandler } from "@vschat/shared/Utils/BidirectionalMessageProtocolNamespaceWrapper";
import { server_client_authCommands, server_client_updateCommands, server_client_userCommands } from '@vschat/shared/constants/protocolCommands'
import fs from 'fs';
import { VersionManager } from "../VersionManager";
import { socketWithDataType } from "../WebsocketManager";

export class ApiUpdateController extends NamespaceHandler<typeof server_client_updateCommands, { socket: socketWithDataType }> {
    handles = {
        "getVersion": (data, extradata) => {
            return { version: VersionManager.getVersion() };
        },
        "downloadVersion": async (data, extradata) => {
            const user = await extradata.socket.data.getUser();
            console.log('in');
            if (!user) return new Buffer<ArrayBuffer>(new ArrayBuffer());
            console.log('user');
            const buffer = VersionManager.getData();
            return buffer;
        }
    } satisfies NamespaceHandler<typeof server_client_updateCommands, { socket: socketWithDataType }>['handles'];

    constructor() {
        super('update', server_client_updateCommands)
    }
}