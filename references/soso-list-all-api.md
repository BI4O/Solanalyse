# Get all listed currencies

## **Overview**

**🌟 Tips:**&#x20;

This API returns all supported cryptocurrencies listed on the SoSoValue platform, along with their default trading pairs.\
**This is a prerequisite API before using WebSocket feeds.**

## ​**Request Specification**

**POST** `/openapi/v1/data/default/coin/list`

### **Request Parameters**

None (send empty `{}` in body)

### **Sample Request**

```json
POST "https://openapi.sosovalue.com/openapi/v1/data/default/coin/list" \
  -H "Content-Type: application/json" \
  -H "x-soso-api-key: YOUR_x-soso-api-key" \
  -d '{}'
```

### **Sample Response**

```json
{
  "code": 0, // 0:success，1 fail
  "msg": null,
  "traceId": "",
  "data": [
    {
      "id": "1673723677362319866",
      "fullName": "Bitcoin",
      "name": "btc"
    },
    {
      "id": "1673723677362319867",
      "fullName": "Ethereum",
      "name": "eth"
    }
  ]
}
```

### **Response Fields**

| Field   | Type   | Description                        |
| ------- | ------ | ---------------------------------- |
| code    | int    | `0` for success, `1` for failure   |
| msg     | string | Error message, if any              |
| traceId | string | Unique request ID                  |
| data    | array  | List of supported currency objects |

#### **Currency Item Fields (`data`)**

| Field          | Type    | Description                                                                                                                          |
| -------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `currencyId`   | integer | Unique identifier for the currency，The id data returned is a long integer, please use the correct numeric type to receive the data. |
| `fullName`     | string  | Full name of the currency (e.g., `Bitcoin`, `Ethereum`) ✅                                                                           |
| `currencyName` | string  | Ticker symbol of the currency (e.g., `USDT`, `BTC`)                                                                                  |
