const axios = require('axios');
const FormData = require('form-data');
let data = new FormData();

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'http://127.0.0.1:3002/front/dashboard',
  headers: { 
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY2OWY3Mjg3MzNiMzUwNjAyM2E5YzMyZiIsImVtYWlsIjoia2V2YWxAZ21haWwuY29tIiwibW9iaWxlIjoiIiwicHJvZmlsZSI6IiIsInVzZXJuYW1lIjoiS2V2YWwiLCJpc1ZlcmlmaWVkIjpmYWxzZSwicm9sZSI6InVzZXIiLCJjcmVhdGVkQXQiOiIyMDI0LTA3LTIzVDA5OjA2OjE1LjY2NVoiLCJ1cGRhdGVkQXQiOiIyMDI0LTA3LTIzVDE0OjQ4OjQ5Ljc5OFoifSwiaWF0IjoxNzIxNzQ2NDExLCJleHAiOjE3MjE4MzI4MTF9.s4RkgVqq-s_ioASY0OBKRDfqwRQ1qgsxg3CvtMxp9y1', 
    'Cookie': 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY2OWY3Mjg3MzNiMzUwNjAyM2E5YzMyZiIsImVtYWlsIjoia2V2YWxAZ21haWwuY29tIiwibW9iaWxlIjoiIiwicHJvZmlsZSI6IiIsInVzZXJuYW1lIjoiS2V2YWwiLCJpc1ZlcmlmaWVkIjpmYWxzZSwicm9sZSI6InVzZXIiLCJjcmVhdGVkQXQiOiIyMDI0LTA3LTIzVDA5OjA2OjE1LjY2NVoiLCJ1cGRhdGVkQXQiOiIyMDI0LTA3LTIzVDE0OjQ4OjQ5Ljc5OFoifSwiaWF0IjoxNzIxNzQ2NDExLCJleHAiOjE3MjE4MzI4MTF9.s4RkgVqq-s_ioASY0OBKRDfqwRQ1qgsxg3CvtMxp9yE', 
    ...data.getHeaders()
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
