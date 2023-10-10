export const OFFERDATA_SIZE = 8 + 32 + 32 + 32 + 32 + 32 + 32 + 4 + 10 + 8 + 8 + 4 + 10 + 8 + 8 + 4 + 100 + 8 + 4 + 200 + 8 + 4 + 200 + 1 + 1;
export const ORDERDATA_SIZE = 8 + 32 + 32 + 32 + 32 + 8 + 4 + 20 + 4 + 20 + 4 + 20 + 4 + 50 + 1 + 1 + 8 + 1 + 4 + 300 + 4 + 100 + 1 + 1;
export const USERINFO_SIZE = 8 + 32 + 32 + 1 + 4 + 20 + 1 + 1 + 8 + 8;

export const CONTRACT_IDL = 
{
  "version": "0.1.0",
  "name": "solana_anchor",
  "instructions": [
    {
      "name": "initPool",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "firDiv",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secDiv",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "thrDiv",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rand",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updatePool",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firDiv",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secDiv",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "thrDiv",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createOffer",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firFeeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secFeeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "thrFeeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerData",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fiat",
          "type": "string"
        },
        {
          "name": "tokenAmount",
          "type": "u64"
        },
        {
          "name": "rate",
          "type": "string"
        },
        {
          "name": "maxLimit",
          "type": "u64"
        },
        {
          "name": "minLimit",
          "type": "u64"
        },
        {
          "name": "paymentOptions",
          "type": "string"
        },
        {
          "name": "timeLimit",
          "type": "u64"
        },
        {
          "name": "publicKey",
          "type": "string"
        },
        {
          "name": "offerTerms",
          "type": "string"
        },
        {
          "name": "sol",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateOffer",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "offerData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fiat",
          "type": "string"
        },
        {
          "name": "tokenAmount",
          "type": "u64"
        },
        {
          "name": "maxLimit",
          "type": "u64"
        },
        {
          "name": "minLimit",
          "type": "u64"
        },
        {
          "name": "paymentOptions",
          "type": "string"
        },
        {
          "name": "timeLimit",
          "type": "u64"
        },
        {
          "name": "offerTerms",
          "type": "string"
        }
      ]
    },
    {
      "name": "cancelOffer",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "offerData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createOrder",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderData",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "sellAmount",
          "type": "u64"
        },
        {
          "name": "receiveAmount",
          "type": "string"
        },
        {
          "name": "paymentOption",
          "type": "string"
        },
        {
          "name": "accountName",
          "type": "string"
        },
        {
          "name": "emailAddress",
          "type": "string"
        }
      ]
    },
    {
      "name": "buyerConfirm",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "orderData",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "confirmOrder",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firFeeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secFeeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "thrFeeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firDiv",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secDiv",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "thrDiv",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createDispute",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "orderData",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "disputeReason",
          "type": "u8"
        },
        {
          "name": "disputeExplain",
          "type": "string"
        },
        {
          "name": "disputeImg",
          "type": "string"
        }
      ]
    },
    {
      "name": "cancelOrder",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "offerData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createUser",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userInfo",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "verifyUser",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateUser",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nickname",
          "type": "string"
        },
        {
          "name": "language",
          "type": "u8"
        },
        {
          "name": "region",
          "type": "u8"
        }
      ]
    },
    {
      "name": "thumbUser",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "orderData",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "thumbUp",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "rand",
            "type": "publicKey"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "firDiv",
            "type": "publicKey"
          },
          {
            "name": "secDiv",
            "type": "publicKey"
          },
          {
            "name": "thrDiv",
            "type": "publicKey"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "firFee",
            "type": "u64"
          },
          {
            "name": "secFee",
            "type": "u64"
          },
          {
            "name": "thrFee",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "OfferData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "firFeeAccount",
            "type": "publicKey"
          },
          {
            "name": "secFeeAccount",
            "type": "publicKey"
          },
          {
            "name": "thrFeeAccount",
            "type": "publicKey"
          },
          {
            "name": "poolAccount",
            "type": "publicKey"
          },
          {
            "name": "buyerAccount",
            "type": "publicKey"
          },
          {
            "name": "token",
            "type": "publicKey"
          },
          {
            "name": "fiat",
            "type": "string"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "bought",
            "type": "u64"
          },
          {
            "name": "rate",
            "type": "string"
          },
          {
            "name": "maxLimit",
            "type": "u64"
          },
          {
            "name": "minLimit",
            "type": "u64"
          },
          {
            "name": "paymentOptions",
            "type": "string"
          },
          {
            "name": "timeLimit",
            "type": "u64"
          },
          {
            "name": "offerTerms",
            "type": "string"
          },
          {
            "name": "createdTime",
            "type": "i64"
          },
          {
            "name": "publicKey",
            "type": "string"
          },
          {
            "name": "sol",
            "type": "bool"
          },
          {
            "name": "status",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "OrderData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "offer",
            "type": "publicKey"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "sellAmount",
            "type": "u64"
          },
          {
            "name": "receiveAmount",
            "type": "string"
          },
          {
            "name": "paymentOption",
            "type": "string"
          },
          {
            "name": "accountName",
            "type": "string"
          },
          {
            "name": "emailAddress",
            "type": "string"
          },
          {
            "name": "buyerConfirm",
            "type": "bool"
          },
          {
            "name": "sellerConfirm",
            "type": "bool"
          },
          {
            "name": "createdTime",
            "type": "i64"
          },
          {
            "name": "disputeReason",
            "type": "u8"
          },
          {
            "name": "disputeExplain",
            "type": "string"
          },
          {
            "name": "disputeImg",
            "type": "string"
          },
          {
            "name": "feedback",
            "type": "bool"
          },
          {
            "name": "status",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "UserInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "verified",
            "type": "bool"
          },
          {
            "name": "nickname",
            "type": "string"
          },
          {
            "name": "language",
            "type": "u8"
          },
          {
            "name": "region",
            "type": "u8"
          },
          {
            "name": "thumbsUp",
            "type": "u64"
          },
          {
            "name": "thumbsDown",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PoolError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "TokenMintToFailed"
          },
          {
            "name": "TokenSetAuthorityFailed"
          },
          {
            "name": "TokenTransferFailed"
          },
          {
            "name": "SOLTransferFailed"
          },
          {
            "name": "InsufficentFunds"
          },
          {
            "name": "InvalidUser"
          },
          {
            "name": "NotAdmin"
          },
          {
            "name": "NotBuyer"
          },
          {
            "name": "InvalidToken"
          },
          {
            "name": "NotCreater"
          },
          {
            "name": "IsCompleted"
          },
          {
            "name": "IsDestroyed"
          },
          {
            "name": "InvalidBuyAmount"
          },
          {
            "name": "BuyerNotConfirm"
          }
        ]
      }
    }
  ]
}