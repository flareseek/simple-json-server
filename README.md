# simple-json-server

router 폴더가 기준점이 되어 주소를 생성합니다. <br>
폴더명 + 파일명이 주소가 되고 파일명이 index.json 일 경우 마지막 폴더명이 주소가 됩니다.<br><br>
예) <br>
router/api/user/index.json => "/api/user"<br>
router/api/user/info.json => "/api/user/info"<br>
router/api/post/notice.json => "/api/post/notice"<br>
<br>
route parameters가 필요할 경우 {name} 형식으로 작성하면 됩니다. <br>
예) router/api/user/{userId}/{id}.json => "/api/user/:userId/:id" <br>
<br>
json 작성 방법입니다. <br>
<br>
```json
{
    "get": {
        "response": {
            "id": 123
        }
    },
    "post": {
        "request": {
            "id": 1,
            "username": "hello",
            "password": "123@@",
            "comment": {
                "id": 1,
                "body": "sdflkjasdfj",
                "detail": {
                    "id": 1,
                    "t": "d"
                }
            }
        },
        "response": {
            "id": 123,
            "sdf": "bobodydydy"
        }
    }
}
```
제일 밖에 있는 key의 이름은 request method가 됩니다.<br>
해당 request method 에는 request와 response가 포함 될 수 있습니다.<br>
request의 값은 요청받을 값의 샘플입니다.<br>
simple-json-server에서 request에 작성된 json 형태를 확인하여 프론트에서 보낸 정보의 key값들과 request에 작성된 key값들을 비교하여 빠진 요청이 있는지 확인합니다. <br>
이때 key값과 value의 type만 확인하고 value값은 확인하지 않습니다.<br>
<br>
response 값은 request가 정상 요청되었다면 반환될 값입니다.


