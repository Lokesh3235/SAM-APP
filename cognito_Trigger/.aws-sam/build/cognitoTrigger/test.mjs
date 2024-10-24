//=================== Define Chanlange ==========//
{
    "version": "1",
    "region": "ap-south-1",
    "userPoolId": "ap-south-1_6WrPu5wo5",
    "userName": "akalaskar@rediffmail.com",
    "callerContext": {
        "awsSdkVersion": "aws-sdk-unknown-unknown",
        "clientId": "3vhuvd93e78a25rbpu1voha2ik"
    },
    "triggerSource": "DefineAuthChallenge_Authentication",
    "request": {
        "userAttributes": {
            "cognito:token_nbf": "1729589887570",
            "sub": "0588acd1-d7e3-4ec6-b65d-0134a947b3e1",
            "cognito:user_status": "CONFIRMED",
            "email_verified": "true",
            "email": "akalaskar@rediffmail.com"
        },
        "session": [],
        "userNotFound": false
    },
    "response": {
        "challengeName": null,
        "issueTokens": null,
        "failAuthentication": null
    }
}

{
    "version": "1",
    "region": "ap-south-1",
    "userPoolId": "ap-south-1_6WrPu5wo5",
    "userName": "akalaskar@rediffmail.com",
    "callerContext": {
        "awsSdkVersion": "aws-sdk-unknown-unknown",
        "clientId": "3vhuvd93e78a25rbpu1voha2ik"
    },
    "triggerSource": "DefineAuthChallenge_Authentication",
    "request": {
        "userAttributes": {
            "cognito:token_nbf": "1729589887570",
            "sub": "0588acd1-d7e3-4ec6-b65d-0134a947b3e1",
            "cognito:user_status": "CONFIRMED",
            "email_verified": "true",
            "email": "akalaskar@rediffmail.com"
        },
        "session": [],
        "userNotFound": false
    },
    "response": {
        "challengeName": "CUSTOM_CHALLENGE",
        "issueTokens": false,
        "failAuthentication": false
    }
}

//====================== Create Auto Challange =======================//

{
    "version": "1",
    "region": "ap-south-1",
    "userPoolId": "ap-south-1_6WrPu5wo5",
    "userName": "akalaskar@rediffmail.com",
    "callerContext": {
        "awsSdkVersion": "aws-sdk-unknown-unknown",
        "clientId": "3vhuvd93e78a25rbpu1voha2ik"
    },
    "triggerSource": "CreateAuthChallenge_Authentication",
    "request": {
        "userAttributes": {
            "cognito:token_nbf": "1729589887570",
            "sub": "0588acd1-d7e3-4ec6-b65d-0134a947b3e1",
            "cognito:user_status": "CONFIRMED",
            "email_verified": "true",
            "email": "akalaskar@rediffmail.com"
        },
        "challengeName": "CUSTOM_CHALLENGE",
        "session": [],
        "userNotFound": false
    },
    "response": {
        "publicChallengeParameters": null,
        "privateChallengeParameters": null,
        "challengeMetadata": null
    }
}

{
  version: '1',
  region: 'ap-south-1',
  userPoolId: 'ap-south-1_6WrPu5wo5',
  userName: 'akalaskar@rediffmail.com',
  callerContext: {
    awsSdkVersion: 'aws-sdk-unknown-unknown',
    clientId: '3vhuvd93e78a25rbpu1voha2ik'
  },
  triggerSource: 'CreateAuthChallenge_Authentication',
  request: {
    userAttributes: {
      'cognito:token_nbf': '1729589887570',
      sub: '0588acd1-d7e3-4ec6-b65d-0134a947b3e1',
      'cognito:user_status': 'CONFIRMED',
      email_verified: 'true',
      email: 'akalaskar@rediffmail.com'
    },
    challengeName: 'CUSTOM_CHALLENGE',
    session: [],
    userNotFound: false
  },
  response: {
    publicChallengeParameters: { email: 'akalaskar@rediffmail.com' },
    privateChallengeParameters: { secretLoginCode: '268745' },
    challengeMetadata: 'otp_268745_1729693885272'
  }
}

//=================== Verify Challange =======================//

{
  version: '1',
  region: 'ap-south-1',
  userPoolId: 'ap-south-1_6WrPu5wo5',
  userName: 'akalaskar@rediffmail.com',
  callerContext: {
    awsSdkVersion: 'aws-sdk-unknown-unknown',
    clientId: '3vhuvd93e78a25rbpu1voha2ik'
  },
  triggerSource: 'VerifyAuthChallengeResponse_Authentication',
  request: {
    userAttributes: {
      'cognito:token_nbf': '1729589887570',
      sub: '0588acd1-d7e3-4ec6-b65d-0134a947b3e1',
      'cognito:user_status': 'CONFIRMED',
      email_verified: 'true',
      email: 'akalaskar@rediffmail.com'
    },
    privateChallengeParameters: { secretLoginCode: '268745' },
    challengeAnswer: '268745',
    userNotFound: false
  },
  response: { answerCorrect: null }
}