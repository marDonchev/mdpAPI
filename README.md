# mdpAPI
simplified API fetch module



### Install

```
npm install --save-dev mdpapi
```



### Usage

```javascript
var mdpAPI = require("mdpapi");

var myAPI = new mdpAPI({
  // logEnabled: true,
  // logPrefix: "MySimpleAPI >",
  // logStyle: "color: red",
  // includeDetails: true,
  // middlewareFunctions: {
  //   200: function (res) {
  //     console.info("WE HAVE 200", res);
  //   },
  // },
});

myAPI.setMiddleware(200, function (res) {
  console.info("------------- WE HAVE 200 statusText", res.statusText);
});
myAPI.removeMiddleware(200);

myAPI.get(
  "https://jsonplaceholder.typicode.com/posts/1",
  null,
  function (data) {
    console.info("data", data);
  },
  function (error) {
    console.error("error", error);
  }
);
```



## Constructor

If you want to set some default parameters to the module, you can pass a settings parameter to its constructor. 

##### How

```javascript
var myAPI = new mdpAPI({
  // logEnabled: true,
  // logPrefix: "MySimpleAPI >",
  // logStyle: "color: red",
  // includeDetails: true,
  // middlewareFunctions: {
  //   200: function (res) {
  //     console.info("WE HAVE 200", res);
  //   },
  // },
});
```

##### Parameters

| Name                  | Default value                                                | Description                                                  |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| prefix                | Empty (string)                                               | URL Prefix that will be used to make the calls.<br />Example: "https://jsonplaceholder.typicode.com/" |
| unauthorized_callback | null                                                         | A function that will be called in case some of the calls return 403 status (unauthorized) |
| logEnabled            | false (boolean)                                              | Setting the logging of the calls. If it is set to true, some loggin will be printed to the console |
| logPrefix             | "API >" (string)                                             | A prefix that will be printed infront of each console log (if logging is enabled) |
| logStyle              | "background: #1890ff; color: white; padding: 2px 5px; border-radius: 2px" (string) | Setting some styling (CSS rules) to the console printing     |
| includeDetails        | false (boolean)                                              | If set to true the return object from the calls will include the following keys: data (holding the response data), status: the status of the response, time: the time (in seconds) that the call took to make;<br />If set to false (default) the return object will only hold the response data |
| middlewareFunctions   | {} (Object)                                                  | Sets middleware callback functions to be called upon response. The object's keys will represent the response status as a number. Example:<br /><br />middlewareFunctions: {<br/>   200: function (res) {<br/>      console.info("WE HAVE 200", res);<br/>    },<br/> }, |



## Headers

By default all the calls will be made with following header: "Content-Type": "application/json".
If you want, you can add as many new headers as you wish, as well as resetting the headers back to default and remove specific header. 
These changes can be done by calling one of the following methods:

##### setHeaders (headersObject) 

You can pass an object that will be used for setting the headers of the calls from the module.
The headersObject parameter will be used to replace the headers for any future calls.
Example: 

```javascript
myAPI.setHeaders({"Content-Type": "application/json"});
```



##### addHeaders(headersObject)

Using this method you can add new headers to the already set headers for the calls of the module.
Example:

```javascript
myAPI.addHeaders({Authorization: `Bearer ${idToken}`});
```



##### resetHeaders()

This method resets the headers to their default state.



##### removeHeader(key)

Using this method you can remove specific key from the headers object.
Example:

```javascript
myAPI.removeHeaders("Authorization");
```



## Middleware

By default there are no middleware functions that will be called when a call has been made. But you can set such listeners using the contructor's settings object or by calling additional methods as listed below.

##### setMiddleware(status, function) 

Using this method you can set a listener for specific response status.
Example: 

```javascript
myAPI.setMiddleware(200, function (res) {
  console.info("------------- WE HAVE 200 statusText", res.statusText);
});
```

Note: When a middleware listener is called, the whole response object will be passed as a parameter.



##### removeMiddleware(status)

This method removes the listener function attached to a specific response status.
Example: 

```javascript
myAPI.removeMiddleware(200);
```



## Persistant Data

You can set data (in form of an object) that will be constantly added to the data you're sending with each call of the module. A good usage of this feature is the case where you set a value that you know it will not change and you want it to be always set on every call. These persistant data is separated in two parts: one for the POST calls and one for the PUT calls.

##### setPersistantData(type, data);

Example: 

```javascript
myAPI.setPersistantData('post', {
  world_key: '123456'
});
```

Note: Using this code you can set a parameter "world_key" with a value of '123456' that will always be attached on the data you're sending with each POST request.



## Requests

There are four requests that this module provides namely GET, POST, PUT and DELETE. All the requests can be called as Promises or using callback functions. 

### GET request

##### get(command, body, successCallback, errorCallback)

| Parameter       | Type     | Description                                                  |
| --------------- | -------- | ------------------------------------------------------------ |
| command         | string   | The suffix that will be concatinated to the prefix set from the contructor to set the URL of the call that is about to be made |
| body            | Object   | An object of data that will be transformed and serialized as get parameters to the call |
| successCallback | function | If set, the results of the call will be passed to that function |
| errorCallback   | function | if set, the errors (if any) will be passed to that function  |

This method will make a GET request to the url that is formed concatinating the prefix (set in the constructor) and the command parameter. On that request you can pass data object using the body parameter and use the successCallback and/or errorCallback to get results. 

##### Example with promises:

```javascript
myAPI
  .get("https://jsonplaceholder.typicode.com/posts")
  .then((result) => {
    console.info("result => ", result);
  })
  .catch((err) => {
    console.error("err => ", err);
  });
```

##### Example with callback functions:

```javascript
myAPI.get(
  "https://jsonplaceholder.typicode.com/posts/1",
  null,
  function (data) {
    console.info("data", data);
  },
  function (error) {
    console.error("error", error);
  }
);
```

##### 

### POST request

##### post(command, body, successCallback, errorCallback)

| Parameter       | Type     | Description                                                  |
| --------------- | -------- | ------------------------------------------------------------ |
| command         | string   | The suffix that will be concatinated to the prefix set from the contructor to set the URL of the call that is about to be made |
| body            | Object   | An object of data that will be transformed and serialized as post parameters to the call |
| successCallback | function | If set, the results of the call will be passed to that function |
| errorCallback   | function | if set, the errors (if any) will be passed to that function  |

This method will make a POST request to the url that is formed concatinating the prefix (set in the constructor) and the command parameter. On that request you can pass data object using the body parameter and use the successCallback and/or errorCallback to get results. 

##### Example with promises:

```javascript
myAPI
  .post("https://jsonplaceholder.typicode.com/posts", {
  	id: "123fg567",
  	name: "Some name here"
	})
  .then((result) => {
    console.info("result => ", result);
  })
  .catch((err) => {
    console.error("err => ", err);
  });
```

##### Example with callback functions:

```javascript
myAPI.post(
  "https://jsonplaceholder.typicode.com/posts",
  {
  	id: "123fg567",
  	name: "Some name here"
	},
  function (data) {
    console.info("data", data);
  },
  function (error) {
    console.error("error", error);
  }
);
```

### PUT request

##### put(command, body, successCallback, errorCallback)

| Parameter       | Type     | Description                                                  |
| --------------- | -------- | ------------------------------------------------------------ |
| command         | string   | The suffix that will be concatinated to the prefix set from the contructor to set the URL of the call that is about to be made |
| body            | Object   | An object of data that will be transformed and serialized as put parameters to the call |
| successCallback | function | If set, the results of the call will be passed to that function |
| errorCallback   | function | if set, the errors (if any) will be passed to that function  |

This method will make a PUT request to the url that is formed concatinating the prefix (set in the constructor) and the command parameter. On that request you can pass data object using the body parameter and use the successCallback and/or errorCallback to get results. 

##### Example with promises:

```javascript
myAPI
  .put("https://jsonplaceholder.typicode.com/posts/1", {
  	id: "123fg567",
  	name: "Some name here"
	})
  .then((result) => {
    console.info("result => ", result);
  })
  .catch((err) => {
    console.error("err => ", err);
  });
```

##### Example with callback functions:

```javascript
myAPI.put(
  "https://jsonplaceholder.typicode.com/posts/1",
  {
  	id: "123fg567",
  	name: "Some name here"
	},
  function (data) {
    console.info("data", data);
  },
  function (error) {
    console.error("error", error);
  }
);
```

### DELETE request

##### delete(command, successCallback, errorCallback)

| Parameter       | Type     | Description                                                  |
| --------------- | -------- | ------------------------------------------------------------ |
| command         | string   | The suffix that will be concatinated to the prefix set from the contructor to set the URL of the call that is about to be made |
| successCallback | function | If set, the results of the call will be passed to that function |
| errorCallback   | function | if set, the errors (if any) will be passed to that function  |

This method will make a DELETE request to the url that is formed concatinating the prefix (set in the constructor) and the command parameter. On that request you can use the successCallback and/or errorCallback to get results (if any). 

##### Example with promises:

```javascript
myAPI
  .delete("https://jsonplaceholder.typicode.com/posts/1")
  .then((result) => {
    console.info("result => ", result);
  })
  .catch((err) => {
    console.error("err => ", err);
  });
```

##### Example with callback functions:

```javascript
myAPI.delete(
  "https://jsonplaceholder.typicode.com/posts/1",
  function (data) {
    console.info("data", data);
  },
  function (error) {
    console.error("error", error);
  }
);
```

##### 