import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { LunchState } from "./types";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.DYNAMODB_TABLE!;
const PK = "lunch_state";

export class StateManager {
    async get(): Promise<Array<LunchState>> {
        const res = await client.send(new GetCommand({ TableName: TABLE, Key: { pk: PK } }));
        return res.Item?.states ?? [];
    }

    async set(state: Array<LunchState>): Promise<void> {
        await client.send(new PutCommand({ TableName: TABLE, Item: { pk: PK, states: state } }));
    }

    async clear(): Promise<void> {
        await this.set([]);
    }
}
