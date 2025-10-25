# Get the featured news feed by currency

### ​**Overview**

**🌟 Tips:**&#x20;

This interface supports paginated retrieval of multilingual news feeds **by currency,** filterable by category (e.g., news, research reports, price alerts) and language. Responses include news titles, authors, timestamps, related cryptocurrencies, multilingual content (HTML), cover images, multimedia resources, social media quotes, and engagement metrics (e.g., views, likes).

## ​**Request Specification**

GET `/api/v1/news/featured/currency`&#x20;

### **Request Parameters**

| **Parameter**  | **Type** | **Required** | **Description**                                                                             |
| -------------- | -------- | ------------ | ------------------------------------------------------------------------------------------- |
| `pageNum`      | integer  | Yes          | Current page number                                                                         |
| `pageSize`     | integer  | Yes          | Number of news items per page (maximum: 100)                                                |
| `currencyId`   | integer  | No           | Currency ID to filter news for a specific asset. If not passed, defaults to all currencies. |
| `categoryList` | array    | No           | List of category IDs. Default: `1,2,3,4,5,6,7,9,10`                                         |

### **Sample Request**

```json
GET "https://openapi.sosovalue.com/api/v1/news/featured/currency?currencyId=1673723677362319866&pageNum=1&pageSize=10&categoryList=1,2" \
  -H "x-soso-api-key: YOUR_x-soso-api-key"
```

### **Sample Response**

```json
{
  "code": 0,
  "msg": null,
  "traceId": "f3b4d6e5a7894cb3a872d0ef12345678",
  "data": {
    "pageNum": "1",
    "pageSize": "10",
    "totalPages": "34",
    "total": "335",
    "list": [
      {
        "id": "news1",
        "sourceLink": "https://sosovalue.xyz/research/1762712251829850112",
        "releaseTime": 1677151845000,
        "author": "Author 1",
        "authorDescription": "blabla",
        "authorAvatarUrl": "https://...",
        "category": 1,
        "featureImage": "https://sosovalue.s3.us-west-2.amazonaws.com/sosovalue/2024/04/30/thumbnails/7909932c-e126-43ff-bec9-fea29a46bffb.png",
        "matchedCurrencies": [
          {
            "id": "1673723677362319866",
            "fullName": "BITCOIN",
            "name": "BTC"
          }
        ],
        "tags": ["ETF", "DO KWON", "TERRAFORM LABS", "SEC"],
        "multilanguageContent": [
          {
            "language": "en",
            "title": "The Rise and Fall of the Roman Empire",
            "content": "htmlcontent"
          },
          {
            "language": "zh",
            "title": "罗马帝国的兴衰",
            "content": "htmlcontent"
          },
          {
            "language": "ja",
            "title": "ローマ帝国の興亡",
            "content": "htmlcontent"
          }
        ],
        "mediaInfo": [
          {
            "sosoUrl": "https://static.sosovalue.com/media/GkkKXLxWEAEdHpy.jpg",
            "originalUrl": "",
            "shortUrl": "https://t.co/uYcKA72Ept",
            "type": "photo"
          },
          {
            "sosoUrl": "https://static.sosovalue.com/media/GkkKXLxWEAEdHpy.mp4",
            "originalUrl": "",
            "shortUrl": "https://t.co/FLZCHosHPs",
            "type": "video"
          }
        ],
        "nickName": "Shirtum ®",
        "isBlueVerified": 1,
        "verifiedType": "Business",
        "quoteInfo": {
          "multilanguageContent": [
            {
              "language": "en",
              "content": "Wait, hold up"
            },
            {
              "language": "zh",
              "content": "Wait, hold up"
            },
            {
              "language": "ja",
              "content": "Wait, hold up"
            }
          ],
          "impressionCount": 903,
          "likeCount": 18,
          "replyCount": 6,
          "retweetCount": 3,
          "createdAt": 1724687710000,
          "mediaInfo": [
            {
              "sosoUrl": "https://pbs.twimg.com/media/GkkKXLxWEAEdHpy.jpg",
              "originalUrl": "https://t.co/uYcKA72Ept",
              "type": "photo"
            },
            {
              "sosoUrl": "",
              "originalUrl": "https://t.co/FLZCHosHPs",
              "type": "video"
            },
            {
              "sosoUrl": "",
              "originalUrl": "https://t.co/ndml0k7bte",
              "type": "gif"
            }
          ],
          "originalUrl": "https://x.com/Shirtum/status/1828098871874007446",
          "authorAvatarUrl": "https://sosovalue.s3.us-west-2.amazonaws.com/sosovalue/2025/02/25/a89bbf07-1987-43d7-b47a-2c0beeca9010.jpg",
          "author": "Shirtum",
          "nickName": "Shirtum ®",
          "isBlueVerified": 1,
          "verifiedType": "Business"
        }
      }
    ]
  }
}
```

### **Response Fields**

| **Field**         | **Type** | **Description**                           |
| ----------------- | -------- | ----------------------------------------- |
| `code`            | int      | `0` for success, `1` for failure          |
| `msg`             | string   | Error or message information (if any)     |
| `traceId`         | string   | Unique trace ID for debugging and logging |
| `data.pageNum`    | string   | Current page number                       |
| `data.pageSize`   | string   | Number of items per page                  |
| `data.totalPages` | string   | Total number of pages                     |
| `data.total`      | string   | Total number of news items                |
| `data.list`       | array    | List of news items                        |

#### **News Item Fields (`data.list`)**

| **Field**              | **Type** | **Description**                                                                                                                                               |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                   | string   | Unique identifier for the news item                                                                                                                           |
| `sourceLink`           | string   | URL of the news source                                                                                                                                        |
| `releaseTime`          | integer  | Timestamp of news release (in milliseconds)                                                                                                                   |
| `author`               | string   | Name of the news author                                                                                                                                       |
| `authorDescription`    | string   | Description of the author (e.g., their background or expertise)                                                                                               |
| `authorAvatarUrl`      | string   | URL of the author's avatar image                                                                                                                              |
| `category`             | integer  | Category of the news: (1: news, 2: research, 3: institution, 4: insights, 5: macro news, 6: macro research, 7: official tweets, 9: price alert, 10: on-chain) |
| `featureImage`         | string   | URL of the feature image associated with the news                                                                                                             |
| `matchedCurrencies`    | array    | List of currencies mentioned in the news item                                                                                                                 |
| `tags`                 | array    | Keywords or tags related to the news item                                                                                                                     |
| `multilanguageContent` | array    | Array containing title and content in multiple languages                                                                                                      |
| `mediaInfo`            | array    | Array containing media (photos, videos, etc.) associated with the news item                                                                                   |
| `nickName`             | string   | The author's or sharer's nickname                                                                                                                             |
| `quoteInfo`            | object   | Additional quote-related information (e.g., impressions, likes, retweets, etc.)                                                                               |

#### **Explanation of `quoteInfo` Fields**

| **Field**         | **Type** | **Description**                                                         |
| ----------------- | -------- | ----------------------------------------------------------------------- |
| `impressionCount` | integer  | Number of views or impressions of the quoted content                    |
| `likeCount`       | integer  | Number of likes on the quoted content                                   |
| `replyCount`      | integer  | Number of replies or comments to the quoted content                     |
| `retweetCount`    | integer  | Number of retweets or shares of the quoted content                      |
| `mediaInfo`       | array    | List of media (photos, videos, etc.) associated with the quote          |
| `originalUrl`     | string   | URL to the original quote on the platform                               |
| `authorAvatarUrl` | string   | URL to the author's avatar image                                        |
| `author`          | string   | Name of the author of the quote                                         |
| `nickName`        | string   | The nickname of the person sharing the quote                            |
| `isBlueVerified`  | integer  | `1` if the author is blue verified (Twitter or similar platform)        |
| `verifiedType`    | string   | Type of verification (e.g., `"Business"` for a gold verification badge) |

## **Note: HTML Content**

The **multilanguageContent** field supports HTML formatting. The following HTML elements are supported:

- `div`, `p`, `span`, `h1~h6`, `li`, `ol`, `ul`, `figcaption`, `figure`, `font`, `img`, `picture`, `strong`, `b`, `a`, `blockquote`, `br`, `table`.
