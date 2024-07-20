const request=require('supertest');
const {mongoose,server}=require('../../server')
const Tour=require('../../models/tour');
afterAll( async ()=>{
    server.close();
   await mongoose.disconnect();
})
describe('get all tours',()=>{
    it('should get all tours',async ()=>{
        const res= await request(server).get('/api/v1/tours');
        expect(res._body.status).toMatch('success')
        expect(res.status).toBe(200);

    })
})