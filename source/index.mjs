import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo =  DynamoDBDocumentClient.from(client);
const tableName = "Products";

export const handler = async(event) => {
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json"
    };
    let requestJSON;
    
    try {
        switch (event.routeKey) {
          case "POST /items":
            requestJSON = JSON.parse(event.body);
            await dynamo
              .send(
                new PutCommand({
                  TableName: "Products",
                  Item: {
                    id: requestJSON.id,
                    price: requestJSON.price,
                    name: requestJSON.name
                  }
              }));
            body = `Create item ${requestJSON.id}`;
            break;
          case "DELETE /items/{id}":
            console.log(event.pathParameters.id)
            await dynamo
              .send(
                new DeleteCommand({
                  TableName: tableName,
                  Key: {
                    id: event.pathParameters.id
                  }
              }));
            body = `Deleted item ${event.pathParameters.id}`;
            break;
          case "GET /items/{id}":
            body = await dynamo
              .send(
                new GetCommand({
                  TableName: tableName,
                  Key: {
                    id: event.pathParameters.id
                  }
              }));
            break;
          case "GET /items":
            body = await dynamo.send(new ScanCommand({ TableName: tableName }));
            break;
          case "PUT /items/{id}":
             requestJSON = JSON.parse(event.body);
            await dynamo
              .send(
                new PutCommand({
                  TableName: tableName,
                  Key: {
                    id: event.pathParameters.id
                  },
                  UpdateExpression: 'set price = :price',
                  ExpressionAttributeValues: {
                   ':price': requestJSON.price,
                  },
              }));
            body = `Put item ${event.pathParameters.id}`;
            break;
          default:
            throw new Error(`Unsupported route: "${event.routeKey}"`);
        }
    } catch(error) {
        statusCode = 400;
        body = error.message;
    } finally {
        body = JSON.stringify(body);
    }
    
    return {
        statusCode,
        body,
        headers
  };
};
