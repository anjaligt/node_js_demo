exports = module.exports = {

  username: 'admin',
  password: '$2a$10$SlzjKMVA4VCyuygkcGPBselE/OyJycdHKF5bHmwsuHxgB1/e7uQF.',
  // password: '$2a$10$BrxKXS0lhqVqYn6ZXfq8TOnF5GaPfCfkJrD9BDUMCDAzA94bWls7O',

  buildVersion: 30,

  totalNumeracy : 11,

  lights : {
    "GREEN" : 1,
    "RED" : 0,
    "YELLOW" : 2
  },

  answers : {
    literacy : [
      {
        "answer": [1, 2, 3]
      },
      {
        "answer": [1, 1]
      },
      {
        "answer": [0, 12, 26]
      },
      {
        "answer": [0, 5]
      },
      {
        "answer": [1]
      },
      {
        "answer": [1]
      }
    ],
    numeracy: [
      {
        "answer": [0, 1, 2],
        "values" : [0, 10, 20]
      },
      {
        "answer": [0, 1]
      },
      {
        "answer": [0, 3]
      },
      {
        "answer": [0, 3]
      },
      {
        "answer": [0, 3]
      },
      {
        "answer": [0, 1, 2, 3]
      },
      {
        "answer": [0, 5]
      }
    ],
    social: {
      "0" : "RED",
      "1" : "YELLOW",
      "2" : "GREEN",
      "3" : "GREEN"
    }
  },

  reportLogic : {
    literacy : [
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1, 1],
        "boolean" : false
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1, 1],
        "boolean" : false
      },
      {
        "answer": [6, 12],
        "boolean" : false
      },
      {
        "answer": [6, 12],
        "boolean" : false
      },
      {
        "answer": [13, 26],
        "boolean" : false
      },
      {
        "answer": [1, 4],
        "boolean" : false
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1, 1],
        "boolean" : false
      }
    ],
    numeracy : [
      {
        "answer": [1, 1],
        "boolean" : false
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1, 1],
        "boolean" : false
      },
      {
        "answer": [1, 2],
        "boolean" : false
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1, 1],
        "boolean" : false
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1],
        "boolean" : true
      },
      {
        "answer": [1, 1],
        "boolean" : false
      },
      {
        "answer": [1, 2],
        "boolean" : false
      },
      {
        "answer": [1, 5],
        "boolean" : false
      },
      {
        "answer": [1, 5],
        "boolean" : false
      },
    ],
    social : [
      {
        "answer": [1, 2],
        "boolean" : false
      },
      {
        "answer": [1, 2],
        "boolean" : false
      },
      {
        "answer": [1, 2],
        "boolean" : false
      },
      {
        "answer": [1, 2],
        "boolean" : false
      },
      {
        "answer": [1, 2],
        "boolean" : false
      },
      {
        "answer": [1, 2],
        "boolean" : false
      },
    ]
  },

  combinationArray : {
    literacy : [3, 2, 2, 1, 6],
    numeracy : [2, 3, 3, 3, 2],
    social : [3, 3]
  },

  tolatQuestions: {
    literacy : 9,
    numeracy : 11,
    social : 6
  },

  finalScore: {
    answer: [24, 31]
  },

  replacePossArr: {
    literacy : [
      {
        'index': 2,
        'count': 2
      }
    ],
    numeracy : [{
      'index': 6,
      'count': 1
    }],
    social : []
  }
};