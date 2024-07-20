const request=require('supertest');
const {mongoose,server}=require('../../server')
const User=require('../../models/user');

beforeEach(async ()=>{
    await User.deleteOne({email:"a@gmail.com"})
})
afterAll( async ()=>{
    server.close();
    await mongoose.disconnect();
})
describe('delete user',()=>{
    it('should delete the user',async ()=>{
        const userLoggedIn= await request(server).post('/api/v1/users/signup').send({
            name:"test_username",
            email:"a@gmail.com",
            password:"12345678",
            passwordConfirm:"12345678"
        })
        // console.log(userLoggedIn._body.token)
        const cookies=`jwt=${userLoggedIn._body.token}`
        const res= await request(server)
            .delete('/api/v1/users/deleteMe')
            .set('Cookie', cookies)
        expect(res.status).toBe(204);
    },10*1000)

    it('should fail due to auth',async ()=>{
        const res= await request(server)
            .delete('/api/v1/users/deleteMe')
        expect(res.status).toBe(401);
        expect(res._body.message).toMatch('you are not logged in,log in to get access')
    })
    it('should fails due to user no longer exist',async ()=>{
        const cookies=`jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2OWFjZDBlZGQ2ZjhjNjYxNGEwMzk1ZCIsImlhdCI6MTcyMTQyMTA3MiwiZXhwIjoxNzI5MTk3MDcyfQ.ibTR9kDPC482QBbg3omEU8brbrvR4vWZAjKY-A_aLmA`
        const res= await request(server)
            .delete('/api/v1/users/deleteMe')
            .set('Cookie', cookies)
        expect(res.status).toBe(401);
        expect(res._body.message).toMatch('User no longer exists')
    })
    it('should fails due to User recently change password',async ()=>{
        const userLoggedIn= await request(server).post('/api/v1/users/signup').send({
            name:"test_username",
            email:"a@gmail.com",
            password:"12345678",
            passwordConfirm:"12345678"
        })
        const cookies=`jwt=${userLoggedIn._body.token}`
        await request(server)
            .patch('/api/v1/users/updatePassword')
            .set('Cookie', cookies)
            .send({
                "passwordCurrent":"12345678",
                "password":"123456789",
                "passwordConfirm":"123456789"
            })
        const res= await request(server)
            .delete('/api/v1/users/deleteMe')
            .set('Cookie', cookies)
        expect(res.status).toBe(401);
        expect(res._body.message).toMatch('User recently change password,Please log in again')

    },10*1000)
})