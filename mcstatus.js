const Net = require("net");
const LOG = require("./log.js");
const port = 25565;
const host = "garage.brycedixon.dev";

function toBuffer(data, typeHint)
{
    if (data instanceof Buffer)
    {
        return data;
    }
    if (typeof(varInt) === "string")
    {
        return Buffer.from(data);
    }
    if (typeof(data) === "number")
    {
        if (Number.isInteger(data) && typeHint)
        {
            switch (typeHint.toLowerCase())
            {
                case "byte":
                    return Buffer.from([
                        data & 0xFF
                    ]);
                case "short":
                    return Buffer.from([
                        data & 0xFF,
                        (data >> 8) & 0xFF
                    ]);
                case "long":
                    return Buffer.from([
                        data & 0xFF,
                        (data >> 8) & 0xFF,
                        (data >> 16) & 0xFF,
                        (data >> 24) & 0xFF
                    ]);
                case "long long":
                    return Buffer.from([
                        data & 0xFF,
                        (data >> 8) & 0xFF,
                        (data >> 16) & 0xFF,
                        (data >> 24) & 0xFF,
                        (data >> 32) & 0xFF,
                        (data >> 40) & 0xFF,
                        (data >> 48) & 0xFF,
                        (data >> 56) & 0xFF
                    ]);
            }
            throw `Invalid typeHint for toBuffer(Number): ${typeHint}`;
        }
        throw `Non-integer number provided to toBuffer(Number): ${data}`;
    }
    throw `Unhandled type provided to toBuffer(): ${typeof(data)}`;
}

function decodeVarInt(varInt)
{
    let value = 0;
    let position = 0;
    let readByte = null;
    if (typeof(varInt) === "number")
    {
        readByte = () =>
        {
            return (varInt >> (position * 8)) & 255;
        };
    }
    else if (varInt instanceof Buffer)
    {
        readByte = () =>
        {
            return varInt[position];
        };
    }
    else
    {
        throw `Can't decode VarInt from non-number, non-Buffer type: ${typeof(varInt)}`;
    }
    while (true)
    {
        let currentByte = readByte();
        value += (currentByte & 0x7F) << (position * 7);
        if ((currentByte & 0x80) == 0)
        {
            return value;
        }
        ++position;
        if (position > 4)
        {
            throw "VarInt too big to decode";
        }
    }
}

function encodeNumberAsVarInt(value)
{
    if (typeof(value) !== "number")
    {
        throw `Non-Number type given to encodeNumberAsVarInt(): [${value}] ${typeof(value)}`;
    }
    if (!Number.isInteger(value))
    {
        throw `Non-integer Number given to encodeNumberAsVarInt(): ${value}`;
    }
    let b = [];
    while (true)
    {
        if ((value & 0xFFFF80) == 0)
        {
            b.push(value);
            return Buffer.from(b);
        }
        b.push((value & 0x7F) | 0x80);
        value >>>= 7;
    }
}

function addPacketHeaderToData(packetID, data)
{
    if (data == undefined)
    {
        data = Buffer.from([]);
    }
    else if (!(data instanceof Buffer))
    {
        data = Buffer.from(data);
    }
    const length = data.length + packetID.length;
    return Buffer.from([length, ...packetID, ...data]);
}

function createHandshakePacket(host, port)
{
    if (host.length > 0xFF)
    {
        throw `Can't create Handshake packet as host is too long: ${host.length} > 255`;
    }
    if (port != (port & 0xFFFF))
    {
        throw `Can't create Handshake packet as port can't fit in 16 bits: ${port} != ${port & 0xFFFF}`;
    }
    return addPacketHeaderToData(encodeNumberAsVarInt(0x00), [
        ...encodeNumberAsVarInt(758),
        host.length,
        ...Buffer.from(host),
        (port >> 8) & 0xFF,
        port & 0xFF,
        0x01
    ]);
}

function createStatusRequestPacket()
{
    return addPacketHeaderToData(encodeNumberAsVarInt(0x00));
}

function handlePacket(packet)
{
    const packetID = decodeVarInt(packet);
    packet = packet.slice(encodeNumberAsVarInt(packetID).length);
    console.log(`Got Packet. ID: [${packetID}]`);
    if (packetID == 0x00)
    {
        // Server Status
        const length = decodeVarInt(packet);
        packet = packet.slice(encodeNumberAsVarInt(length).length);
        const status = JSON.parse(packet.toString());
        console.log(status);
    }
}

module.exports = {
    requestServerStatus: async function(host, port)
    {
        var currentPacket = null;
        var remainingPacketLength = 0;
        var status = undefined;
        var client = new Net.Socket();
        client.setTimeout(1000);
        var socket = await client.connect({port, host});
        if (!socket)
        {
            status = { error: "Failed to connect." };
            LOG.error("Failed to connect");
        }
        else
        {
            LOG.debug("Connected");
            client.on("timeout", () =>
            {
                LOG.error("Connection timed out");
                status = { error: "Connection timed out." };
            });
            client.on("error", (error) =>
            {
                LOG.error(error);
                status = { error };
            });
            client.on("data", (chunk) =>
            {
                if (remainingPacketLength == 0)
                {
                    remainingPacketLength = decodeVarInt(chunk);
                    chunk = chunk.slice(encodeNumberAsVarInt(remainingPacketLength).length);
                    currentPacket = Buffer.from([]);
                }
                currentPacket = Buffer.from([...currentPacket, ...chunk]);
                remainingPacketLength -= chunk.length;
                LOG.debug(`Got ${chunk.length} bytes. Waiting for ${remainingPacketLength} more`)
                if (remainingPacketLength <= 0)
                {
                    const packetID = decodeVarInt(currentPacket);
                    currentPacket = currentPacket.slice(encodeNumberAsVarInt(packetID).length);
                    LOG.debug(`Packet ID: [${packetID}]`);
                    if (packetID == 0x00)
                    {
                        // Server Status
                        const length = decodeVarInt(currentPacket);
                        currentPacket = currentPacket.slice(encodeNumberAsVarInt(length).length);
                        status = JSON.parse(currentPacket.toString());
                        LOG.debug("Set status!");
                    }
                    else
                    {
                        LOG.debug(`Unexpected packet ID: ${currentPacket.toString()}`);
                    }
                }
            });
            LOG.debug("Sending handshake...");
            const handshake = createHandshakePacket(host, port);
            client.write(handshake);
            LOG.debug("Sending status request...");
            const statusRequest = createStatusRequestPacket();
            client.write(statusRequest);
            await (async() => { while (status === undefined) { await new Promise(r => setTimeout(r, 100)); } })();
            LOG.debug("All done! Ending connection...");
        }
        await client.end();
        client.destroy();
        LOG.debug("Returning status...");
        status = Object.assign(status, { host, port });
        return status;
    }
};
