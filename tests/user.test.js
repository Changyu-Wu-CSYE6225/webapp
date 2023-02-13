const request = require('supertest');
const app = require('../server');

// Test healthz path
describe('Test healthz', () => {
    it('should return nothing', async () => {
        const response = await request(app).get('/healthz');
        expect(response.statusCode).toBe(400);
    });
});


// Test Create User
// describe('Test create user', () => {
//     it('should response a json file with user info', async () => {
//         const response = await request(app).post('/v1/user/')
//             .send({
//                 "first_name": "Van",
//                 "last_name": "Dark",
//                 "password": "114514",
//                 "username": Date.now() + ".vd@gmail.com"
//             });
//         expect(response.statusCode).toBe(201);
//     });
// });
