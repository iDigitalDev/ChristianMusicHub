export function getBasicAuthentication(authToken) {
  return `Bearer ${authToken}`;
}

export function POST(payload) {
  let data = payload.data;
  let url = payload.url;
  let receiver = payload.receiver;
  let authToken = getBasicAuthentication(payload.authToken);
  // console.log(authToken);
  // console.log('\n=====start=====');
  // console.log('[POST]');
  // console.log('URL: ', url);
  // console.log('body:');
  // console.log(data);
  // console.log('\n=====end=====');
  console.log(data);
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((responseData) => {
      receiver(responseData);
    })
    .catch((error) => {
      console.error(error);
    });
}

export function PUT(payload) {
  let data = payload.data;
  let url = payload.url;
  let receiver = payload.receiver;
  let authToken = getBasicAuthentication(payload.authToken);
  // console.log(authToken);
  // console.log('\n=====start=====');
  // console.log('[POST]');
  // console.log('URL: ', url);
  // console.log('body:');
  // console.log(data);
  // console.log('\n=====end=====');
  return fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((responseData) => {
      receiver(responseData);
    })
    .catch((error) => {
      console.error(error);
    });
}

export function DELETE(payload) {
  let data = payload.data;
  let url = payload.url;
  let receiver = payload.receiver;
  let authToken = getBasicAuthentication(payload.authToken);
  // console.log(authToken);
  // console.log('\n=====start=====');
  // console.log('[POST]');
  // console.log('URL: ', url);
  // console.log('body:');
  // console.log(data);
  // console.log('\n=====end=====');
  return fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((responseData) => {
      receiver(responseData);
    })
    .catch((error) => {
      console.error(error);
    });
}

export function GET(payload) {
  let url = payload.url;
  let authToken = getBasicAuthentication(payload.authToken);
  let receiver = payload.receiver;
  // console.log('\n=====start=====');
  // console.log('[GET]');
  // console.log('URL: ', url);
  // console.log('body:');
  // console.log('\n=====end=====');
  return fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken,
    },
    // body: obj.getBody()
  })
    .then((response) => response.json())
    .then((responseData) => {
      //console.log("--------------")
      //console.log(responseData)
      receiver(responseData);
    })
    .catch((error) => {
      console.error(error);
    });
}

export function GET_WITH_BODY(payload) {
  let url = payload.url;
  let authToken = getBasicAuthentication(payload.authToken);
  let receiver = payload.receiver;
  let data = payload.data;

  // console.log('\n=====start=====');
  // console.log('[GET]');
  // console.log('URL: ', url);
  // console.log('body:');
  // console.log(data);
  // console.log('\n=====end=====');
  const formatUrl = url + '?id=' + data.user_id;
  console.log(formatUrl);
  return fetch(url + '?user_id=' + data.user_id, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken,
    },
    // body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((responseData) => {
      //console.log("--------------")
      //console.log(responseData)
      receiver(responseData);
    })
    .catch((error) => {
      console.error(error);
    });
}
export function _parseJSON(response) {
  return response
    .text()
    .then((text) => (text ? JSON.parse(text) : {}))
    .catch((error) => console.log('_parseJSON ERR ', error));
}
